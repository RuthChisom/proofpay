"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ProofPayEscrow } from "../lib/contracts";
import { parseEther } from "viem";

export function useProofPayEscrow() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const createJob = (freelancer: string, jobTitle: string, amount: string) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "createJob",
      args: [freelancer as `0x${string}`, jobTitle],
      value: parseEther(amount),
    });
  };

  const acceptJob = (jobId: bigint) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "acceptJob",
      args: [jobId],
    });
  };

  const submitProof = (jobId: bigint, ipfsHash: string) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "submitProof",
      args: [jobId, ipfsHash],
    });
  };

  const releasePayment = (jobId: bigint, amount: string) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "releasePayment",
      args: [jobId, parseEther(amount)],
    });
  };

  const claimPaymentIfClientInactive = (jobId: bigint) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "claimPaymentIfClientInactive",
      args: [jobId],
    });
  };

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
