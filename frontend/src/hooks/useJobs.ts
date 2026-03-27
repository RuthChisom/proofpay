"use client";

import { useReadContract, useReadContracts, useWatchContractEvent } from "wagmi";
import { ProofPayEscrow } from "../lib/contracts";

// Matches the on-chain Status enum: OPEN=0, ACCEPTED=1, PROOF_SUBMITTED=2, COMPLETED=3
export const JobStatus = {
  OPEN: 0,
  ACCEPTED: 1,
  PROOF_SUBMITTED: 2,
  COMPLETED: 3,
} as const;

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
    // Wait one tick for React to re-render with the updated jobCount so that
    // useReadContracts rebuilds its contracts array before we refetch jobs.
    await new Promise((r) => setTimeout(r, 50));
    await refetchJobs();
  };

  // Step 7: watch all contract events and auto-refresh the job list
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCreated",
    onLogs: () => fullRefetch(),
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobAccepted",
    onLogs: () => fullRefetch(),
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "ProofSubmitted",
    onLogs: () => fullRefetch(),
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "PaymentReleased",
    onLogs: () => fullRefetch(),
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCompleted",
    onLogs: () => fullRefetch(),
  });

  const formattedJobs = (jobs?.map((result, index) => {
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
        proofHash,
        jobTitle,
      ] = result.result as [
        string, string,
        bigint, bigint,
        bigint, bigint, bigint,
        number,
        string, string,
      ];
      return {
        id: BigInt(index),
        client,
        freelancer,
        totalAmount,
        releasedAmount,
        createdAt,
        acceptedAt,
        proofSubmittedAt,
        status,     // uint8: use JobStatus constants to compare
        proofHash,
        jobTitle,
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
    totalAmount: (job as any)[2],
    releasedAmount: (job as any)[3],
    createdAt: (job as any)[4],
    acceptedAt: (job as any)[5],
    proofSubmittedAt: (job as any)[6],
    status: (job as any)[7],
    proofHash: (job as any)[8],
    jobTitle: (job as any)[9],
  } : null;

  return { job: formattedJob, isLoading, refetch };
}
