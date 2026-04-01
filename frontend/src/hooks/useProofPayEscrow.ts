"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { CONFIG, ProofPayEscrow } from "../lib/contracts";
import { BaseError, parseEther } from "viem";

function normalizeContractError(error: unknown) {
  if (error instanceof BaseError) {
    const revertReason =
      (error.walk((err) => err instanceof BaseError && /reverted|revert|execution reverted/i.test((err as BaseError).shortMessage)) as BaseError | null)
        ?.shortMessage;

    const knownReason =
      (error.walk((err) => err instanceof BaseError && /EmptyJobTitle|InvalidFreelancer|NoPaymentProvided|NotClient|NotFreelancer|JobNotOpen|JobNotAccepted|ProofNotSubmitted|TooEarlyForClaim|AmountExceedsEscrow/i.test((err as BaseError).shortMessage)) as BaseError | null)
        ?.shortMessage;

    const message = knownReason || revertReason || error.shortMessage || error.message;

    if (/NoPaymentProvided/i.test(message)) {
      return new Error("No payment was sent with this job. Enter an amount greater than 0.");
    }
    if (/InvalidFreelancer/i.test(message)) {
      return new Error("The freelancer address is invalid.");
    }
    if (/EmptyJobTitle/i.test(message)) {
      return new Error("Job title cannot be empty.");
    }
    if (/exceeds.{0,30}balance|insufficient.{0,20}funds|total cost/i.test(message)) {
      return new Error("Insufficient balance. Your wallet does not have enough FLOW to cover the payment amount plus gas fees.");
    }

    return new Error(message);
  }

  return error instanceof Error ? error : new Error("Transaction failed.");
}

export function useProofPayEscrow() {
  const { chain } = useAccount();
  const publicClient = usePublicClient({ chainId: CONFIG.CHAIN_ID });
  // Pin to chain 545 so wagmi prepares the wallet client for Flow EVM specifically.
  const { data: walletClient } = useWalletClient({ chainId: CONFIG.CHAIN_ID });
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const writeWithEstimatedGas = useCallback(async ({
    functionName,
    args,
    value,
  }: {
    functionName: "createJob" | "acceptJob" | "submitProof" | "releasePayment";
    args: readonly unknown[];
    value?: bigint;
  }) => {
    if (!publicClient || !walletClient?.account) {
      throw new Error("Connect a wallet on Flow EVM Testnet and try again.");
    }

    if (chain?.id !== CONFIG.CHAIN_ID) {
      throw new Error("Please switch to Flow EVM Testnet to send transactions.");
    }

    setIsPending(true);
    setError(null);

    try {
      if (value !== undefined) {
        const balance = await publicClient.getBalance({ address: walletClient.account.address });
        if (balance < value) {
          throw new Error("Insufficient balance. Your wallet does not have enough FLOW to cover the payment amount plus gas fees.");
        }
      }

      const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: ProofPayEscrow.address,
        abi: ProofPayEscrow.abi,
        functionName,
        args,
        value,
      });

      const gas = request.gas ? (request.gas * 12n) / 10n : undefined;
      const txHash = await walletClient.writeContract({
        ...request,
        gas,
      });

      setHash(txHash);
      return txHash;
    } catch (err) {
      const nextError = normalizeContractError(err);
      setError(nextError);
      throw nextError;
    } finally {
      setIsPending(false);
    }
  }, [publicClient, walletClient, chain]);

  const createJob = (freelancer: string, jobTitle: string, amount: string) =>
    writeWithEstimatedGas({
      functionName: "createJob",
      args: [freelancer as `0x${string}`, jobTitle],
      value: parseEther(amount),
    });

  const acceptJob = (jobId: bigint) =>
    writeWithEstimatedGas({
      functionName: "acceptJob",
      args: [jobId],
    });

  const submitProof = (jobId: bigint, ipfsHash: string) =>
    writeWithEstimatedGas({
      functionName: "submitProof",
      args: [jobId, ipfsHash],
    });

  const releasePayment = (jobId: bigint, amount: string) =>
    writeWithEstimatedGas({
      functionName: "releasePayment",
      args: [jobId, parseEther(amount)],
    });

  return {
    createJob,
    acceptJob,
    submitProof,
    releasePayment,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
