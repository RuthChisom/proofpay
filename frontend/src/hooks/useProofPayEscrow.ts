"use client";

import { useCallback, useState } from "react";
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { CONFIG, ProofPayEscrow } from "../lib/contracts";
import { BaseError, parseEther } from "viem";

function normalizeContractError(error: unknown) {
  if (error instanceof BaseError) {
    const revertReason =
      error.walk((err) => err instanceof BaseError && /reverted|revert|execution reverted/i.test(err.shortMessage))
        ?.shortMessage;

    const knownReason =
      error.walk((err) => err instanceof BaseError && /EmptyJobTitle|InvalidFreelancer|NoPaymentProvided|NotClient|NotFreelancer|JobNotOpen|JobNotAccepted|ProofNotSubmitted|TooEarlyForClaim|AmountExceedsEscrow/i.test(err.shortMessage))
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

    return new Error(message);
  }

  return error instanceof Error ? error : new Error("Transaction failed.");
}

export function useProofPayEscrow() {
  const publicClient = usePublicClient({ chainId: CONFIG.CHAIN_ID });
  const { data: walletClient } = useWalletClient();
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
    functionName: "createJob" | "acceptJob" | "submitProof" | "releasePayment" | "claimPaymentIfClientInactive";
    args: readonly unknown[];
    value?: bigint;
  }) => {
    if (!publicClient || !walletClient?.account) {
      throw new Error("Connect a wallet on Flow EVM Testnet and try again.");
    }

    setIsPending(true);
    setError(null);

    try {
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
  }, [publicClient, walletClient]);

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

  const claimPaymentIfClientInactive = (jobId: bigint) =>
    writeWithEstimatedGas({
      functionName: "claimPaymentIfClientInactive",
      args: [jobId],
    });

  return {
    createJob,
    acceptJob,
    submitProof,
    releasePayment,
    claimPaymentIfClientInactive,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
