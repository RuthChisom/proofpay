"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { CONFIG, ProofPayEscrow } from "../lib/contracts";
import { BaseError, parseEther } from "viem";
import { relayTransaction, type RelayableFn } from "../lib/relay";

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

    return new Error(message);
  }

  return error instanceof Error ? error : new Error("Transaction failed.");
}

// Set NEXT_PUBLIC_USE_RELAY=true in frontend/.env.local to route eligible
// write calls through the gas-sponsoring relayer backend instead of
// having the user's wallet submit (and pay for) the transaction directly.
const USE_RELAY = process.env.NEXT_PUBLIC_USE_RELAY === "true";

export function useProofPayEscrow() {
  const { chain, address } = useAccount();
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
    functionName: "createJob" | "acceptJob" | "submitProof" | "releasePayment" | "claimPaymentIfClientInactive";
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

  // ── Relay helper ──────────────────────────────────────────────────────────
  // Wraps a single contract call: uses the relayer backend when USE_RELAY is
  // enabled, otherwise falls back to the standard wallet submission path.
  // createJob is excluded from relay because it is payable (msg.value).
  const writeOrRelay = useCallback(
    (functionName: RelayableFn, args: readonly unknown[]) => {
      if (USE_RELAY && address) {
        return relayTransaction(functionName, [...args], address).then(
          (txHash) => { setHash(txHash); return txHash; }
        );
      }
      return writeWithEstimatedGas({ functionName, args });
    },
    [address, writeWithEstimatedGas]
  );

  const acceptJob = (jobId: bigint) =>
    writeOrRelay("acceptJob", [jobId]);

  const submitProof = (jobId: bigint, ipfsHash: string) =>
    writeOrRelay("submitProof", [jobId, ipfsHash]);

  const releasePayment = (jobId: bigint, amount: string) =>
    writeOrRelay("releasePayment", [jobId, parseEther(amount)]);

  const claimPaymentIfClientInactive = (jobId: bigint) =>
    writeOrRelay("claimPaymentIfClientInactive", [jobId]);

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
