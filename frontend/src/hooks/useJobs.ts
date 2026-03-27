"use client";

import { useState, useEffect, useCallback } from "react";
import { useWatchContractEvent } from "wagmi";
import { createPublicClient, custom, http } from "viem";
import { ProofPayEscrow } from "../lib/contracts";

// Matches the on-chain Status enum: OPEN=0, ACCEPTED=1, PROOF_SUBMITTED=2, COMPLETED=3
export const JobStatus = {
  OPEN: 0,
  ACCEPTED: 1,
  PROOF_SUBMITTED: 2,
  COMPLETED: 3,
} as const;

// Build a public client at call time so window.ethereum is available.
// Uses MetaMask's injected provider to bypass CORS on the Flow EVM RPC.
function makeClient() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return createPublicClient({
      transport: custom((window as any).ethereum),
    });
  }
  return createPublicClient({
    transport: http("https://testnet.evm.nodes.onflow.org"),
  });
}

function parseJob(raw: any, index: number) {
  // viem may return an array-like tuple or a named-property object
  const get = (i: number, name: string) => {
    const byIndex = raw[i];
    const byName  = raw[name];
    return byIndex !== undefined ? byIndex : byName;
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
  const [formattedJobs, setFormattedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [jobCount, setJobCount]           = useState<bigint>(0n);

  const fetchAllJobs = useCallback(async () => {
    const client = makeClient();

    // Read jobCount first
    let count: bigint;
    try {
      count = await client.readContract({
        address: ProofPayEscrow.address as `0x${string}`,
        abi: ProofPayEscrow.abi,
        functionName: "jobCount",
      }) as bigint;
      console.log("[useJobs] jobCount from chain:", count.toString());
      setJobCount(count);
    } catch (err) {
      console.error("[useJobs] failed to read jobCount:", err);
      return;
    }

    if (count === 0n) {
      setFormattedJobs([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await Promise.all(
        Array.from({ length: Number(count) }, (_, i) =>
          client.readContract({
            address: ProofPayEscrow.address as `0x${string}`,
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

  // Initial fetch on mount
  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  // Step 7: watch all contract events and auto-refresh
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCreated",
    onLogs: () => { console.log("[useJobs] event: JobCreated"); fetchAllJobs(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobAccepted",
    onLogs: () => { console.log("[useJobs] event: JobAccepted"); fetchAllJobs(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "ProofSubmitted",
    onLogs: () => { console.log("[useJobs] event: ProofSubmitted"); fetchAllJobs(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "PaymentReleased",
    onLogs: () => { console.log("[useJobs] event: PaymentReleased"); fetchAllJobs(); },
  });
  useWatchContractEvent({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    eventName: "JobCompleted",
    onLogs: () => { console.log("[useJobs] event: JobCompleted"); fetchAllJobs(); },
  });

  return {
    jobs: formattedJobs,
    isLoading,
    refetch: fetchAllJobs,
    jobCount,
  };
}

export function useJobById(jobId: bigint) {
  const [job, setJob]           = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    const client = makeClient();
    setIsLoading(true);
    try {
      const raw = await client.readContract({
        address: ProofPayEscrow.address as `0x${string}`,
        abi: ProofPayEscrow.abi,
        functionName: "jobs",
        args: [jobId],
      });
      setJob(parseJob(raw, Number(jobId)));
    } catch (err) {
      console.error("[useJobById] error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { job, isLoading, refetch };
}
