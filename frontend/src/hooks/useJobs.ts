"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "../app/components/Web3Provider";
import { ProofPayEscrow } from "../lib/contracts";

// Matches the on-chain Status enum: OPEN=0, ACCEPTED=1, PROOF_SUBMITTED=2, COMPLETED=3
export const JobStatus = {
  OPEN: 0,
  ACCEPTED: 1,
  PROOF_SUBMITTED: 2,
  COMPLETED: 3,
} as const;

function parseJob(raw: any, index: number) {
  // viem may return an array-like tuple or a named-property object
  const get = (i: number, name: string) => {
    const byIndex = raw[i];
    const byName  = raw[name];
    const val = byIndex !== undefined ? byIndex : byName;
    return val;
  };

  const parsed = {
    id:               BigInt(index),
    client:           get(0, "client"),
    freelancer:       get(1, "freelancer"),
    totalAmount:      get(2, "totalAmount"),
    releasedAmount:   get(3, "releasedAmount"),
    createdAt:        get(4, "createdAt"),
    acceptedAt:       get(5, "acceptedAt"),
    proofSubmittedAt: get(6, "proofSubmittedAt"),
    status:           get(7, "status"),
    proofHash:        get(8, "proofHash"),
    jobTitle:         get(9, "jobTitle"),
  };

  console.log(`[useJobs] job[${index}] parsed:`, parsed);
  return parsed;
}

export function useJobs() {
  const { data: jobCount, refetch: refetchCount } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "jobCount",
  });

  const [formattedJobs, setFormattedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading]         = useState(false);

  const fetchAllJobs = useCallback(async (count: number) => {
    console.log("[useJobs] fetchAllJobs count:", count);
    if (count === 0) {
      setFormattedJobs([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          readContract(config, {
            address: ProofPayEscrow.address,
            abi: ProofPayEscrow.abi,
            functionName: "jobs",
            args: [BigInt(i)],
          }).then((raw) => {
            console.log(`[useJobs] raw result[${i}]:`, raw);
            return parseJob(raw, i);
          }).catch((err) => {
            console.error(`[useJobs] error reading job[${i}]:`, err);
            return null;
          })
        )
      );
      const valid = results.filter(Boolean) as any[];
      console.log("[useJobs] all jobs:", valid);
      setFormattedJobs(valid);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch jobs whenever jobCount changes
  useEffect(() => {
    const count = Number(jobCount ?? 0);
    console.log("[useJobs] jobCount changed:", jobCount, "→", count);
    fetchAllJobs(count);
  }, [jobCount, fetchAllJobs]);

  const fullRefetch = useCallback(async () => {
    console.log("[useJobs] fullRefetch start");
    const result = await refetchCount();
    const newCount = Number(result.data ?? 0);
    console.log("[useJobs] fullRefetch newCount:", newCount);
    await fetchAllJobs(newCount);
  }, [refetchCount, fetchAllJobs]);

  // Step 7: watch all contract events and auto-refresh
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCreated",
    onLogs: () => { console.log("[useJobs] event: JobCreated"); fullRefetch(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobAccepted",
    onLogs: () => { console.log("[useJobs] event: JobAccepted"); fullRefetch(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "ProofSubmitted",
    onLogs: () => { console.log("[useJobs] event: ProofSubmitted"); fullRefetch(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "PaymentReleased",
    onLogs: () => { console.log("[useJobs] event: PaymentReleased"); fullRefetch(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCompleted",
    onLogs: () => { console.log("[useJobs] event: JobCompleted"); fullRefetch(); },
  });

  return {
    jobs: formattedJobs,
    isLoading,
    refetch: fullRefetch,
    jobCount: jobCount !== undefined ? BigInt(jobCount.toString()) : 0n,
  };
}

export function useJobById(jobId: bigint) {
  const { data: job, isLoading, refetch } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "jobs",
    args: [jobId],
  });

  const formattedJob = job ? parseJob(job, Number(jobId)) : null;

  return { job: formattedJob, isLoading, refetch };
}
