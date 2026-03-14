"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ProofPayEscrow } from "../lib/contracts";
import { parseEther } from "viem";

export function useProofPayEscrow() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const createJob = (freelancer: string, amount: string) => {
    writeContract({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "createJob",
      args: [freelancer as `0x${string}`],
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

  return {
    createJob,
    acceptJob,
    submitProof,
    approveWork,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
