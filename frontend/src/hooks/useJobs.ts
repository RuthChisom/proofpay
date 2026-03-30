"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { ProofPayEscrow } from "../lib/contracts";
import { useEffect } from "react";

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

  const formattedJobs = (jobs?.map((result, index) => {
    if (result.status === "success" && result.result) {
      const [client, freelancer, payment, proofHash, accepted, completed] = result.result as [string, string, bigint, string, boolean, boolean];
      return {
        id: BigInt(index),
        client,
        freelancer,
        payment,
        proofHash,
        accepted,
        completed,
      };
    }
    return null;
  }) || []).filter((job): job is NonNullable<typeof job> => job !== null);

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
    payment: (job as any)[2],
    proofHash: (job as any)[3],
    accepted: (job as any)[4],
    completed: (job as any)[5],
  } : null;

  return {
    job: formattedJob,
    isLoading,
    refetch,
  };
}
