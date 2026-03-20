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

  const approveWork = (jobId: bigint) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "approveWork",
      args: [jobId],
    });
  };

  const releasePayment = (jobId: bigint, amount: bigint) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "releasePayment",
      args: [jobId, amount],
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

  const cancelJob = (jobId: bigint) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "cancelJob",
      args: [jobId],
    });
  };

  return {
    createJob,
    acceptJob,
    submitProof,
    approveWork,
    releasePayment,
    claimPaymentIfClientInactive,
    cancelJob,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
