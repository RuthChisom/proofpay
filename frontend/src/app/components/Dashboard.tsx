"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { PlusCircle, CheckCircle, UploadCloud, Briefcase, Zap, Loader2, Info, AlertCircle, Clock, Edit, XCircle, FileText, Star } from "lucide-react";
import { useJobs, JobStatus } from "../../hooks/useJobs";
import { useProofPayEscrow } from "../../hooks/useProofPayEscrow";
import { ProofPayEscrow } from "../../lib/contracts";
import { formatEther, isAddress } from "viem";
import { uploadFile } from "../../lib/storachaUpload";

const FLOW_USD_RATE = 5; // 1 FLOW = $5 for demo

// ─── Per-job card component so hooks can be called per-instance ──────────────
function JobCard({
  job,
  activeTab,
  userAddress,
  metadata,
  onAccept,
  onReject,
  onOpenProofModal,
  onReleasePayment,
  onRejectProof,
  onEdit,
  isPending,
  isConfirming,
}: {
  job: any;
  activeTab: "client" | "freelancer";
  userAddress: string;
  metadata: Record<string, any>;
  onAccept: (id: bigint) => void;
  onReject: (id: bigint) => void;
  onOpenProofModal: (id: bigint) => void;
  onReleasePayment: (id: bigint, amount: string) => void;
  onRejectProof: (id: bigint, reason: string) => void;
  onEdit: (id: string) => void;
  isPending: boolean;
  isConfirming: boolean;
}) {
  const jobMeta = metadata[job.id.toString()] || {};

  // Step 2: read trust score and completed jobs for the freelancer
  const { data: trustScore } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "getTrustScore",
    args: [job.freelancer as `0x${string}`],
  });
  const { data: jobsDone } = useReadContract({
    address: ProofPayEscrow.address,
    abi: ProofPayEscrow.abi,
    functionName: "completedJobs",
    args: [job.freelancer as `0x${string}`],
  });

  const isOpen = job.status === JobStatus.OPEN;
  const isAccepted = job.status === JobStatus.ACCEPTED;
  const isProofSubmitted = job.status === JobStatus.PROOF_SUBMITTED;
  const isCompleted = job.status === JobStatus.COMPLETED;

  // Step 5: payment progress
  const pct = job.totalAmount > 0n
    ? Number((job.releasedAmount * 100n) / job.totalAmount)
    : 0;

  // Local state for proof rejection flow
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Remaining funds to release
  const remaining = ((job.totalAmount ?? 0n) - (job.releasedAmount ?? 0n)) as unknown as bigint;


  const isOverdue = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };
  const overdue = isOverdue(jobMeta.deadline);

  const proof = job.proofHash ? (() => {
    try {
      const parsed = JSON.parse(job.proofHash);
      if (typeof parsed === "string") return { cid: parsed, link: `https://${parsed}.ipfs.storacha.link` };
      if (parsed?.cid) return { ...parsed, link: `https://${parsed.cid}.ipfs.storacha.link` };
      if (parsed?.link) return parsed;
      return null;
    } catch {
      return { cid: job.proofHash, link: `https://${job.proofHash}.ipfs.storacha.link` };
    }
  })() : null;

  const statusLabel = isCompleted ? "Completed"
    : isProofSubmitted ? "In Review"
    : isAccepted ? "Ongoing"
    : "Pending";

  const statusStyle = isCompleted ? "bg-green-100 text-green-700"
    : isProofSubmitted ? "bg-amber-100 text-amber-700"
    : isAccepted ? "bg-blue-100 text-blue-700"
    : "bg-zinc-100 text-zinc-700";

  return (
    <div className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2 flex-wrap">
            {/* Step 3: on-chain job title */}
            {job.jobTitle || jobMeta.title || `Job #${job.id.toString()}`}
            {overdue && !isCompleted && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded uppercase">Overdue</span>
            )}
            {jobMeta.rejected && (
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-black rounded uppercase">Rejected</span>
            )}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-black text-indigo-600">{formatEther(job.totalAmount)} FLOW</span>
            <span className="text-xs text-zinc-400 font-bold">
              ≈ ${jobMeta.amountUSD || (parseFloat(formatEther(job.totalAmount)) * FLOW_USD_RATE).toFixed(2)}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle}`}>
              {statusLabel}
            </span>
            {/* Step 3: Verified Payment Ready badge */}
            {job.totalAmount > 0n && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 flex items-center gap-1">
                ✅ Funds Locked in Escrow
              </span>
            )}
          </div>
        </div>
        {activeTab === "client" && isOpen && (
          <button
            onClick={() => onEdit(job.id.toString())}
            className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-zinc-400 hover:text-indigo-600 transition-colors ml-4 shrink-0"
          >
            <Edit size={18} />
          </button>
        )}
      </div>

      {jobMeta.description && (
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{jobMeta.description}</p>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Freelancer</span>
          <span className="text-xs font-mono truncate block">{job.freelancer.slice(0, 10)}...{job.freelancer.slice(-4)}</span>
          {/* Step 2: trust score */}
          {trustScore !== undefined && (
            <span className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              Trust {trustScore?.toString()} · {jobsDone?.toString() || "0"} jobs
            </span>
          )}
        </div>
        {jobMeta.deadline && (
          <div className={`p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border ${overdue && !isCompleted ? "border-red-200 dark:border-red-900/30 bg-red-50/30" : "border-zinc-100 dark:border-zinc-800"}`}>
            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Deadline</span>
            <span className={`text-xs font-bold block ${overdue && !isCompleted ? "text-red-600" : ""}`}>
              {new Date(jobMeta.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Step 5: payment progress bar */}
      {job.totalAmount > 0n && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
            <span>{formatEther(job.releasedAmount)} FLOW released</span>
            <span>{pct}% of {formatEther(job.totalAmount)} FLOW</span>
          </div>
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Proof display */}
      {proof && (
        <div className="mb-6 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-2 mb-3">
            <UploadCloud size={14} /> Proof of Work Submitted
          </span>
          <p className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">{jobMeta.proofDescription || proof.description || "Work submitted"}</p>
          {proof.cid && (
            <p className="text-xs mb-3 break-all font-mono text-zinc-500 dark:text-zinc-400">
              CID: {proof.cid}
            </p>
          )}
          <a
            href={proof.link}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs text-indigo-600 font-bold border border-indigo-100 dark:border-indigo-900/50 hover:shadow-md transition-all"
          >
            View Submission <Zap size={12} />
          </a>
        </div>
      )}

      {/* Payment approval / rejection (client only, after proof submitted) */}
      {activeTab === "client" && isProofSubmitted && !isCompleted && (
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 space-y-4">
          {/* Escrow summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Escrow</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{formatEther(job.totalAmount)} FLOW</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Released</span>
              <span className="text-sm font-black text-green-600">{formatEther(job.releasedAmount)} FLOW</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Remaining</span>
              <span className="text-sm font-black text-indigo-600">{formatEther(remaining)} FLOW</span>
            </div>
          </div>

          {/* Previous rejection reason */}
          {jobMeta.proofRejectedReason && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-xs text-red-600 font-medium">
              Awaiting new submission — Rejection reason: {jobMeta.proofRejectedReason}
            </div>
          )}

          <p className="text-xs text-zinc-500">Full payment will be released upon approval.</p>

          {/* Reject reason input */}
          {showRejectInput && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Reason for rejection (required)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                  className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectReason.trim()) {
                      onRejectProof(job.id, rejectReason.trim());
                      setShowRejectInput(false);
                      setRejectReason("");
                    }
                  }}
                  disabled={!rejectReason.trim()}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Primary action buttons */}
          {!showRejectInput && (
            <div className="flex gap-3">
              <button
                onClick={() => onReleasePayment(job.id, formatEther(remaining))}
                disabled={isPending || isConfirming || remaining === 0n}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {(isPending || isConfirming) ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                Approve Payment ✅
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isPending || isConfirming}
                className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold text-sm border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                Reject Proof ❌
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {activeTab === "freelancer" && isOpen && !jobMeta.rejected && (
          <>
            <button
              onClick={() => onAccept(job.id)}
              className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
            >
              Accept Job
            </button>
            <button
              onClick={() => onReject(job.id)}
              className="px-8 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
            >
              Reject Job
            </button>
          </>
        )}
        {activeTab === "freelancer" && isAccepted && !isCompleted && (
          <button
            onClick={() => onOpenProofModal(job.id)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <UploadCloud size={18} /> {isProofSubmitted ? "Update Proof" : "Submit Proof"}
          </button>
        )}
        {activeTab === "client" && isOpen && (
          <button className="px-8 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
            <XCircle size={18} /> Cancel Job
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Compact list row ─────────────────────────────────────────────────────────
function JobRow({
  job,
  metadata,
  onViewDetails,
}: {
  job: any;
  metadata: Record<string, any>;
  onViewDetails: () => void;
}) {
  const jobMeta = metadata[job.id.toString()] || {};

  const isCompleted = job.status === JobStatus.COMPLETED;
  const isProofSubmitted = job.status === JobStatus.PROOF_SUBMITTED;
  const isAccepted = job.status === JobStatus.ACCEPTED;

  const statusLabel = isCompleted ? "Completed"
    : isProofSubmitted ? "In Review"
    : isAccepted ? "Ongoing"
    : "Pending";

  const statusStyle = isCompleted ? "bg-green-100 text-green-700"
    : isProofSubmitted ? "bg-amber-100 text-amber-700"
    : isAccepted ? "bg-blue-100 text-blue-700"
    : "bg-zinc-100 text-zinc-700";

  let dueDateDisplay = "No deadline";
  if (jobMeta.deadline) {
    dueDateDisplay = new Date(jobMeta.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } else if (job.createdAt) {
    dueDateDisplay = "Created " + new Date(Number(job.createdAt) * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{job.jobTitle || jobMeta.title || `Job #${job.id.toString()}`}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{dueDateDisplay}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${statusStyle}`}>
        {statusLabel}
      </span>
      <button
        onClick={onViewDetails}
        className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
      >
        View Details
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const FLOW_CHAIN_ID = 545;
const FLOW_CHAIN_ID_HEX = "0x221";

export default function Dashboard({ userAddress }: { userAddress: string }) {
  const { chain } = useAccount();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minSelectableDeadline = today.toISOString().split("T")[0];
  const isValidFutureDeadline = (deadline: string) => deadline >= minSelectableDeadline;

  const handleSwitchToFlow = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    setIsSwitchingChain(true);
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: FLOW_CHAIN_ID_HEX }] });
    } catch (err: any) {
      if (err?.code === 4902 || err?.data?.originalError?.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: FLOW_CHAIN_ID_HEX, chainName: "Flow EVM Testnet",
              nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
              rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
              blockExplorerUrls: ["https://evm-testnet.flowscan.io"] }],
          });
        } catch (addErr) { console.error("Failed to add Flow EVM Testnet:", addErr); }
      } else { console.error("Failed to switch network:", err); }
    } finally { setIsSwitchingChain(false); }
  };

  const [formData, setFormData] = useState({
    freelancer: "",
    amountUSD: "",
    title: "",
    description: "",
    deliverables: "",
    deadline: "",
    fileName: "",
  });

  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [submittingProofJobId, setSubmittingProofJobId] = useState<bigint | null>(null);
  const [proofForm, setProofForm] = useState<{ description: string; file: File | null; cid: string; isUploading: boolean }>({
    description: "",
    file: null,
    cid: "",
    isUploading: false,
  });
  // Step 4: per-job release amount inputs
  const [releaseAmountInputs, setReleaseAmountInputs] = useState<Record<string, string>>({});
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null);

  const { jobs, isLoading: jobsLoading, refetch, jobCount } = useJobs();
  const { createJob, acceptJob, submitProof, releasePayment, isPending, isConfirming, isConfirmed, error: txError } = useProofPayEscrow();

  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("proofpay_metadata") || "{}"); } catch { return {}; }
  });

  function showToast(message: string, type: "success" | "error" | "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  // Reload after confirmed tx
  useEffect(() => {
    if (isConfirmed) {
      showToast("Transaction successful!", "success");
      setTimeout(() => refetch(), 1000);
      setTimeout(() => refetch(), 3000);
      setSubmittingProofJobId(null);
      setEditingJobId(null);
      setProofForm({ description: "", file: null, cid: "", isUploading: false });
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (txError) {
      showToast(`Transaction failed: ${txError.message || "Please try again."}`, "error");
    }
  }, [txError]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateJob = async () => {
    if (!formData.title || !formData.description || !formData.freelancer || !formData.amountUSD || !formData.deadline) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    const trimmedTitle = formData.title.trim();
    const trimmedFreelancer = formData.freelancer.trim();
    const amountUSD = Number(formData.amountUSD);

    if (!trimmedTitle) {
      showToast("Job title cannot be empty.", "error");
      return;
    }

    if (!isAddress(trimmedFreelancer)) {
      showToast("Enter a valid freelancer wallet address.", "error");
      return;
    }

    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      showToast("Enter a USD amount greater than 0.", "error");
      return;
    }

    if (!isValidFutureDeadline(formData.deadline)) {
      showToast("Deadline cannot be in the past.", "error");
      return;
    }

    const amountFLOW = (amountUSD / FLOW_USD_RATE).toFixed(18).replace(/\.?0+$/, "");

    if (!amountFLOW || Number(amountFLOW) <= 0) {
      showToast("The FLOW amount resolves to 0. Increase the payment amount.", "error");
      return;
    }

    try {
      await createJob(trimmedFreelancer, trimmedTitle, amountFLOW);

      const nextId = jobCount.toString();
      const updated = {
        ...metadata,
        [nextId]: {
          title: trimmedTitle,
          description: formData.description,
          deliverables: formData.deliverables,
          deadline: formData.deadline,
          amountUSD: amountUSD.toString(),
          fileName: formData.fileName,
          createdAt: Date.now(),
        },
      };
      setMetadata(updated);
      localStorage.setItem("proofpay_metadata", JSON.stringify(updated));
      setFormData({ freelancer: "", amountUSD: "", title: "", description: "", deliverables: "", deadline: "", fileName: "" });
    } catch (err) {
      showToast("Failed to initiate transaction.", "error");
    }
  };

  const handleEditJobMetadata = () => {
    if (!editingJobId) return;
    if (!isValidFutureDeadline(formData.deadline)) {
      showToast("Deadline cannot be in the past.", "error");
      return;
    }
    const updated = {
      ...metadata,
      [editingJobId]: {
        ...metadata[editingJobId],
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
      },
    };
    setMetadata(updated);
    localStorage.setItem("proofpay_metadata", JSON.stringify(updated));
    setEditingJobId(null);
    showToast("Job updated successfully!", "success");
    setFormData({ freelancer: "", amountUSD: "", title: "", description: "", deliverables: "", deadline: "", fileName: "" });
  };

  const handleSubmitProof = async () => {
    if (submittingProofJobId === null) return;
    if (!proofForm.description || !proofForm.cid) {
      showToast("Please provide a description and upload a file.", "error");
      return;
    }
    const jobIdKey = submittingProofJobId.toString();
    const updated = {
      ...metadata,
      [jobIdKey]: {
        ...metadata[jobIdKey],
        proofDescription: proofForm.description,
      },
    };
    try {
      setMetadata(updated);
      localStorage.setItem("proofpay_metadata", JSON.stringify(updated));
      await submitProof(submittingProofJobId, proofForm.cid);
    } catch (err: any) {
      showToast(err.message || "Failed to submit proof.", "error");
    }
  };

  const handleProofFileChange = async (file: File | null) => {
    if (!file) return;
    setProofForm((prev) => ({ ...prev, file, cid: "", isUploading: true }));
    try {
      const cid = await uploadFile(file);
      setProofForm((prev) => ({ ...prev, cid, isUploading: false }));
      showToast("File uploaded to Storacha.", "success");
    } catch (err: any) {
      setProofForm((prev) => ({ ...prev, isUploading: false }));
      showToast(err.message || "Failed to upload file to Storacha.", "error");
    }
  };

  const handleReleasePayment = async (jobId: bigint, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Enter a valid release amount.", "error");
      return;
    }
    try {
      await releasePayment(jobId, amount);
      setReleaseAmountInputs((prev) => ({ ...prev, [jobId.toString()]: "" }));
    } catch {
      showToast("Failed to release payment.", "error");
    }
  };

  // handleClaimInactive removed — freelancer payment is handled automatically by client approval
  };

  const handleReject = (jobId: bigint) => {
    const updated = {
      ...metadata,
      [jobId.toString()]: { ...metadata[jobId.toString()], rejected: true },
    };
    setMetadata(updated);
    localStorage.setItem("proofpay_metadata", JSON.stringify(updated));
    showToast("Job rejected.", "info");
  };

  const handleRejectProof = (jobId: bigint, reason: string) => {
    const updated = {
      ...metadata,
      [jobId.toString()]: { ...metadata[jobId.toString()], proofRejectedReason: reason },
    };
    setMetadata(updated);
    localStorage.setItem("proofpay_metadata", JSON.stringify(updated));
    showToast("Proof rejected. Awaiting new submission.", "info");
  };

  const isOverdue = (deadline: string) => !!deadline && new Date(deadline).getTime() < Date.now();

  console.log("[Dashboard] userAddress:", userAddress, "activeTab:", activeTab);
  console.log("[Dashboard] total jobs from hook:", jobs?.length, jobs);

  const filteredJobs = (jobs || []).filter((job) => {
    if (!job) return false;
    const clientMatch = job.client?.toLowerCase() === userAddress.toLowerCase();
    const freelancerMatch = job.freelancer?.toLowerCase() === userAddress.toLowerCase();
    const isOwner = activeTab === "client" ? clientMatch : freelancerMatch;
    // console.log(`[Dashboard] job[${job.id}] client:${job.client} freelancer:${job.freelancer} clientMatch:${clientMatch} freelancerMatch:${freelancerMatch} isOwner:${isOwner}`);
    if (activeTab === "freelancer") {
      const jobMeta = metadata[job.id.toString()];
      if (isOverdue(jobMeta?.deadline) && job.status === JobStatus.OPEN) return false;
    }
    return isOwner;
  });

  console.log("[Dashboard] filteredJobs:", filteredJobs.length);

  // Guard: show switch prompt if wallet is on the wrong chain while Dashboard
  // is mounted (e.g. user manually switches network mid-session).
  if (chain?.id !== FLOW_CHAIN_ID) {
    return (
      <div className="w-full max-w-2xl px-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-sm">
          <h1 className="text-2xl font-black">Switch To Flow EVM Testnet</h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Your wallet is on chain {chain?.id ?? "unknown"}. ProofPay requires Flow EVM Testnet (chain 545) to send transactions.
          </p>
          <button
            onClick={handleSwitchToFlow}
            disabled={isSwitchingChain}
            className="mt-6 rounded-2xl bg-amber-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {isSwitchingChain ? "Switching..." : "Switch to Flow EVM Testnet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-8 relative">
      {/* Proof Submission Modal */}
      {submittingProofJobId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UploadCloud size={24} className="text-indigo-600" />
              Submit Proof of Work
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Description</label>
                <textarea
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm h-24"
                  placeholder="What have you completed?"
                  value={proofForm.description}
                  onChange={(e) => setProofForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Proof File</label>
                <input
                  type="file"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                  onChange={(e) => handleProofFileChange(e.target.files?.[0] || null)}
                />
                {proofForm.isUploading && (
                  <p className="text-xs mt-2 text-indigo-600 font-semibold">Uploading to Storacha... Please hold on</p>
                )}
                {proofForm.cid && (
                  <p className="text-xs mt-2 text-zinc-500 break-all font-mono">CID: {proofForm.cid}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSubmittingProofJobId(null)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProof}
                  disabled={isPending || isConfirming || proofForm.isUploading || !proofForm.cid}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  {(isPending || isConfirming) ? <Loader2 className="animate-spin" size={18} /> : "Submit Proof"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJobId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Edit size={24} className="text-indigo-600" />
              Edit Job Details
            </h2>
            <div className="space-y-4">
              <input
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm h-24"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                type="date"
                min={minSelectableDeadline}
                value={formData.deadline}
                onClick={(e) => (e.target as any).showPicker?.()}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setEditingJobId(null); setFormData({ freelancer: "", amountUSD: "", title: "", description: "", deliverables: "", deadline: "", fileName: "" }); }}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button onClick={handleEditJobMetadata} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJobId !== null && (() => {
        const selectedJob = filteredJobs.find((j) => j?.id === selectedJobId);
        if (!selectedJob) return null;
        const jobMeta = metadata[selectedJob.id.toString()] || {};
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelectedJobId(null)}>
            <div className="w-full max-w-2xl my-8 relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedJobId(null)}
                className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 shadow-md transition-colors"
              >
                <XCircle size={20} />
              </button>
              <JobCard
                job={selectedJob}
                activeTab={activeTab}
                userAddress={userAddress}
                metadata={metadata}
                onAccept={acceptJob}
                onReject={handleReject}
                onOpenProofModal={setSubmittingProofJobId}
                onReleasePayment={handleReleasePayment}
                onRejectProof={handleRejectProof}
                onEdit={(id) => {
                  setSelectedJobId(null);
                  setEditingJobId(id);
                  setFormData({ ...formData, title: jobMeta.title || "", description: jobMeta.description || "", deadline: jobMeta.deadline || "" });
                }}
                isPending={isPending}
                isConfirming={isConfirming}
              />
            </div>
          </div>
        );
      })()}

      {/* Dashboard header */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-indigo-500/20 gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Zap className="fill-white" /> ProofPay Dashboard
          </h1>
          <p className="opacity-90 font-medium text-indigo-100">Flow EVM Escrow System</p>
        </div>
        <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "client" ? "bg-white text-indigo-600 shadow-lg scale-105" : "text-white hover:bg-white/10"}`}
          >
            Client Mode
          </button>
          <button
            onClick={() => setActiveTab("freelancer")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "freelancer" ? "bg-white text-indigo-600 shadow-lg scale-105" : "text-white hover:bg-white/10"}`}
          >
            Freelancer Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {activeTab === "client" && (
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PlusCircle size={20} className="text-indigo-600" />
                Create New Job
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Title *</label>
                  <input
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                    placeholder="E.g. Website Development"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Description *</label>
                  <textarea
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm h-20"
                    placeholder="Describe the job requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Freelancer Address *</label>
                  <input
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                    placeholder="0x..."
                    value={formData.freelancer}
                    onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Amount USD *</label>
                    <div className="relative">
                      <input
                        className="w-full p-3 pl-8 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                        placeholder="USD"
                        type="number"
                        value={formData.amountUSD}
                        onChange={(e) => setFormData({ ...formData, amountUSD: e.target.value })}
                      />
                      <span className="absolute left-3 top-3.5 text-zinc-400 text-xs font-bold">$</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-[10px] text-zinc-500 font-bold mb-3">
                      ≈ {(parseFloat(formData.amountUSD || "0") / FLOW_USD_RATE).toFixed(2)} FLOW
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Deadline *</label>
                  <input
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                    type="date"
                    min={minSelectableDeadline}
                    value={formData.deadline}
                    onClick={(e) => (e.target as any).showPicker?.()}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Job Details (PDF/Image)</label>
                  <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <FileText size={18} className="text-zinc-400" />
                    <input
                      type="file"
                      className="text-xs w-full"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.files?.[0]?.name || "" })}
                    />
                  </div>
                  {formData.fileName && <p className="text-[10px] text-indigo-600 font-bold mt-1">Selected: {formData.fileName}</p>}
                </div>
                <button
                  onClick={handleCreateJob}
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20"
                >
                  {(isPending || isConfirming) ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                  Create & Deposit
                </button>
              </div>
            </div>
          )}

          <div className="p-8 bg-indigo-900/20 text-indigo-100 rounded-3xl border border-indigo-500/30 flex flex-col gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Info size={18} /> {activeTab === "client" ? "Client Guide" : "Freelancer Guide"}
            </h3>
            <ol className="text-xs space-y-3 list-decimal list-inside text-indigo-200/70">
              {activeTab === "client" ? (
                <>
                  <li>Connect wallet</li>
                  <li>Create a job — funds locked instantly</li>
                  <li>Wait for freelancer to <span className="text-white font-bold">Accept</span></li>
                  <li>Review submitted proof</li>
                  <li><span className="text-white font-bold">Release Payment</span> (full or partial)</li>
                </>
              ) : (
                <>
                  <li>Connect wallet</li>
                  <li><span className="text-white font-bold">Accept</span> a job assigned to you</li>
                  <li>Complete work and <span className="text-white font-bold">Submit Proof</span></li>
                  <li>Wait for client approval</li>
                  <li>After 48h inactivity, <span className="text-white font-bold">Claim Payment</span></li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Job list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              {activeTab === "client" ? "My Projects" : "Assigned Work"}
            </h2>
            <button onClick={() => refetch()} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
              <Zap size={12} /> Refresh
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-bold">Syncing with Blockchain...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              No active jobs found for this mode.
            </div>
          ) : (
            filteredJobs.map((job) => {
              if (!job) return null;
              const jobMeta = metadata[job.id.toString()] || {};
              if (jobMeta.rejected && activeTab === "freelancer") return null;
              return (
                <JobRow
                  key={job.id.toString()}
                  job={job}
                  metadata={metadata}
                  onViewDetails={() => setSelectedJobId(job.id)}
                />
              );
            })
          )}
        </div>
      </div>
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-green-600 text-white" :
          toast.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
