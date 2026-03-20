"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { ProofPayEscrow } from "../lib/contracts";

export function useJobs() {
  const { data: jobCount, refetch: refetchCount } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "jobCount",
  });

  const { data: jobs, isLoading, refetch: refetchJobs } = useReadContracts({
    contracts: Array.from({ length: Number(jobCount || 0) }).map((_, i) => ({
      address: ProofPayEscrow.address,
      abi: ProofPayEscrow.abi,
      functionName: "jobs",
      args: [BigInt(i)],
    })),
  });

  const fullRefetch = async () => {
    await refetchCount();
    await refetchJobs();
  };

  const formattedJobs = jobs?.map((result, index) => {
    if (result.status === "success" && result.result) {
      const [
        client,
        freelancer,
        totalAmount,
        releasedAmount,
        createdAt,
        acceptedAt,
        proofSubmittedAt,
        status,
        jobTitle,
        proofHash,
      ] = result.result as [string, string, bigint, bigint, bigint, bigint, bigint, number, string, string];
      return {
        id: BigInt(index),
        client,
        freelancer,
        totalAmount,
        releasedAmount,
        createdAt,
        acceptedAt,
        proofSubmittedAt,
        status, // 0=PENDING, 1=ACCEPTED, 2=PROOF_SUBMITTED, 3=COMPLETED, 4=CANCELLED
        jobTitle,
        proofHash,
      };
    }
    return null;
  }).filter(Boolean) || [];

  return {
    jobs: formattedJobs,
    isLoading,
    refetch: fullRefetch,
    jobCount: jobCount ? BigInt(jobCount.toString()) : 0n,
  };
}

export function useJobById(jobId: bigint) {
  const { data: job, isLoading, refetch } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "jobs",
    args: [jobId],
  });

  const formattedJob = job ? {
    client: (job as any)[0],
    freelancer: (job as any)[1],
    totalAmount: (job as any)[2],
    releasedAmount: (job as any)[3],
    createdAt: (job as any)[4],
    acceptedAt: (job as any)[5],
    proofSubmittedAt: (job as any)[6],
    status: (job as any)[7], // 0=PENDING, 1=ACCEPTED, 2=PROOF_SUBMITTED, 3=COMPLETED, 4=CANCELLED
    jobTitle: (job as any)[8],
    proofHash: (job as any)[9],
  } : null;

  return {
    job: formattedJob,
    isLoading,
    refetch,
  };
}
