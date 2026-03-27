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

  console.log("[useJobs] jobCount raw:", jobCount, "→ number:", Number(jobCount || 0));

  const contractsArray = Array.from({ length: Number(jobCount || 0) }).map((_, i) => ({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "jobs",
    args: [BigInt(i)],
  }));
  console.log("[useJobs] contracts array length:", contractsArray.length);

  const { data: jobs, isLoading, refetch: refetchJobs } = useReadContracts({
    contracts: contractsArray,
  });

  console.log("[useJobs] raw jobs data:", jobs);

  const fullRefetch = async () => {
    console.log("[useJobs] fullRefetch: fetching count...");
    await refetchCount();
    await new Promise((r) => setTimeout(r, 50));
    console.log("[useJobs] fullRefetch: fetching jobs...");
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
    console.log(`[useJobs] result[${index}] status:`, result.status, "result:", result.result);
    if (result.status === "success" && result.result) {
      const raw = result.result as any;
      console.log(`[useJobs] result[${index}] raw type:`, Array.isArray(raw) ? "array" : typeof raw, "keys:", Object.keys(raw));

      // viem may return a named-property object or an array — handle both
      const client          = raw[0]  ?? raw.client;
      const freelancer      = raw[1]  ?? raw.freelancer;
      const totalAmount     = raw[2]  ?? raw.totalAmount;
      const releasedAmount  = raw[3]  ?? raw.releasedAmount;
      const createdAt       = raw[4]  ?? raw.createdAt;
      const acceptedAt      = raw[5]  ?? raw.acceptedAt;
      const proofSubmittedAt = raw[6] ?? raw.proofSubmittedAt;
      const status          = raw[7]  ?? raw.status;
      const proofHash       = raw[8]  ?? raw.proofHash;
      const jobTitle        = raw[9]  ?? raw.jobTitle;

      console.log(`[useJobs] job[${index}] parsed:`, { client, freelancer, totalAmount, status, jobTitle });

      return {
        id: BigInt(index),
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
      };
    }
    return null;
  }) || []).filter((job): job is NonNullable<typeof job> => job !== null);

  console.log("[useJobs] formattedJobs:", formattedJobs);

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
