"use client";

import { useState, useEffect } from "react";
import { PlusCircle, CheckCircle, UploadCloud, Briefcase, Zap, Loader2, Info, AlertCircle, Clock } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { useProofPayEscrow } from "../../hooks/useProofPayEscrow";
import { formatEther } from "viem";

const FLOW_USD_RATE = 5; // 1 FLOW = 5 USD for demo

export default function Dashboard({ userAddress }: { userAddress: string }) {
  const { jobs, isLoading: jobsLoading, refetch } = useJobs();
  const { createJob, acceptJob, submitProof, approveWork, isPending, isConfirming, isConfirmed, error: txError } = useProofPayEscrow();
  
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  const [toast, setToast] = useState<{message: string, type: "success" | "error" | "info"} | null>(null);

  // Expanded Form State
  const [formData, setFormData] = useState({
    freelancer: "",
    amountUSD: "",
    title: "",
    description: "",
    deliverables: "",
    deadline: ""
  });

  // Metadata storage (Local simulation)
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    const savedMetadata = localStorage.getItem("proofpay_metadata");
    if (savedMetadata) setMetadata(JSON.parse(savedMetadata));
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      showToast("Transaction successful!", "success");
      refetch();
    }
    if (txError) {
      showToast("Transaction failed. Please try again.", "error");
    }
  }, [isConfirmed, txError]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCreateJob = async () => {
    if (!formData.freelancer || !formData.amountUSD) return;
    const amountFLOW = (parseFloat(formData.amountUSD) / FLOW_USD_RATE).toString();
    
    try {
      await createJob(formData.freelancer, amountFLOW);
      
      // Store metadata keyed by a temporary identifier until we get the jobId
      // For demo, we'll use a combined key and update it when jobCount changes
      const tempMetadata = { ...metadata };
      const nextId = jobs.length.toString();
      tempMetadata[nextId] = {
        title: formData.title,
        description: formData.description,
        deliverables: formData.deliverables,
        deadline: formData.deadline,
        amountUSD: formData.amountUSD
      };
      setMetadata(tempMetadata);
      localStorage.setItem("proofpay_metadata", JSON.stringify(tempMetadata));

      setFormData({
        freelancer: "",
        amountUSD: "",
        title: "",
        description: "",
        deliverables: "",
        deadline: ""
      });
    } catch (err) {
      console.error("Create job failed:", err);
      showToast("Failed to initiate transaction.", "error");
    }
  };

  const handleAccept = async (jobId: bigint) => {
    try {
      await acceptJob(jobId);
    } catch (err) {
      console.error("Accept job failed:", err);
    }
  };

  const handleSubmitProof = async (jobId: bigint) => {
    const proofDescription = prompt("Enter proof description:");
    const proofLink = prompt("Enter proof link (URL/CID):");
    if (!proofDescription || !proofLink) return;
    
    const combinedProof = JSON.stringify({ description: proofDescription, link: proofLink, timestamp: Date.now() });
    try {
      await submitProof(jobId, combinedProof);
    } catch (err) {
      console.error("Submit proof failed:", err);
    }
  };

  const handleApprove = async (jobId: bigint) => {
    try {
      await approveWork(jobId);
    } catch (err) {
      console.error("Approve work failed:", err);
    }
  };

  // 48h Auto-release check
  const canAutoRelease = (job: any) => {
    if (!job.proofHash) return false;
    try {
      const proof = JSON.parse(job.proofHash);
      if (proof.timestamp) {
        const fortyEightHours = 48 * 60 * 60 * 1000;
        return Date.now() > proof.timestamp + fortyEightHours;
      }
    } catch (e) { return false; }
    return false;
  };

  // Filter jobs based on active tab and user address
  const filteredJobs = jobs.filter(job => {
    if (activeTab === "client") {
      return job.client.toLowerCase() === userAddress.toLowerCase();
    } else {
      return job.freelancer.toLowerCase() === userAddress.toLowerCase();
    }
  });

  const isClient = (job: any) => job.client.toLowerCase() === userAddress.toLowerCase();
  const isFreelancer = (job: any) => job.freelancer.toLowerCase() === userAddress.toLowerCase();

  return (
    <div className="w-full max-w-6xl p-6 space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-green-600 text-white" : 
          toast.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

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
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'client' ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-white hover:bg-white/10'}`}
          >
            Client Mode
          </button>
          <button 
            onClick={() => setActiveTab("freelancer")} 
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'freelancer' ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-white hover:bg-white/10'}`}
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
                <PlusCircle size={20} className="text-indigo-600"/>
                Create New Job
              </h2>
              <div className="space-y-4">
                <input 
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm" 
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm h-20" 
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <input 
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm" 
                  placeholder="Freelancer Address (0x...)"
                  value={formData.freelancer}
                  onChange={(e) => setFormData({...formData, freelancer: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      className="w-full p-3 pl-8 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm" 
                      placeholder="USD"
                      type="number"
                      value={formData.amountUSD}
                      onChange={(e) => setFormData({...formData, amountUSD: e.target.value})}
                    />
                    <span className="absolute left-3 top-3.5 text-zinc-400 text-xs font-bold">$</span>
                  </div>
                  <div className="flex items-center text-[10px] text-zinc-500 font-bold">
                    ≈ {(parseFloat(formData.amountUSD || "0") / FLOW_USD_RATE).toFixed(2)} FLOW
                  </div>
                </div>
                <input 
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm" 
                  placeholder="Deadline (e.g. 2026-12-31)"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
                <button 
                  onClick={handleCreateJob}
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
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
                  <li>Create a job for a freelancer</li>
                  <li>Wait for freelancer to <span className="text-white font-bold">Accept</span></li>
                  <li>Review submitted proof</li>
                  <li><span className="text-white font-bold">Approve</span> payment</li>
                </>
              ) : (
                <>
                  <li>Connect wallet</li>
                  <li><span className="text-white font-bold">Accept</span> a job assigned to you</li>
                  <li>Complete work and <span className="text-white font-bold">Submit Proof</span></li>
                  <li>Wait for client approval</li>
                  <li>Receive payment automatically</li>
                </>
              )}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600"/>
              {activeTab === "client" ? "My Projects" : "Assigned Work"}
            </h2>
            <button onClick={() => refetch()} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              Refresh
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p>Fetching jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              No active jobs found.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const jobMeta = metadata[job.id.toString()] || {};
              const proof = job.proofHash ? (() => {
                try { return JSON.parse(job.proofHash); } catch (e) { return { link: job.proofHash }; }
              })() : null;

              return (
                <div key={job.id.toString()} className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{jobMeta.title || `Job #${job.id.toString()}`}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-indigo-600">{formatEther(job.payment)} FLOW</span>
                        <span className="text-xs text-zinc-400 font-bold">≈ ${jobMeta.amountUSD || (parseFloat(formatEther(job.payment)) * FLOW_USD_RATE).toFixed(2)}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          job.completed ? 'bg-green-100 text-green-700' : 
                          job.proofHash ? 'bg-amber-100 text-amber-700' : 
                          job.accepted ? 'bg-blue-100 text-blue-700' : 
                          'bg-zinc-100 text-zinc-700'
                        }`}>
                          {job.completed ? 'Paid' : job.proofHash ? 'Proof Submitted' : job.accepted ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {jobMeta.description && <p className="text-sm text-zinc-500 mb-6">{jobMeta.description}</p>}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Freelancer</span>
                      <span className="text-xs font-mono truncate block">{job.freelancer.slice(0,10)}...</span>
                    </div>
                    {jobMeta.deadline && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Deadline</span>
                        <span className="text-xs font-bold block">{jobMeta.deadline}</span>
                      </div>
                    )}
                  </div>

                  {proof && (
                    <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-2 mb-2">
                        <UploadCloud size={14}/> Proof of Work
                      </span>
                      <p className="text-sm font-medium mb-1">{proof.description || "Work submitted"}</p>
                      <a href={proof.link} target="_blank" className="text-xs text-indigo-600 font-bold underline truncate block">{proof.link}</a>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {activeTab === "freelancer" && !job.accepted && (
                      <button onClick={() => handleAccept(job.id)} className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all">Accept Job</button>
                    )}
                    {activeTab === "freelancer" && job.accepted && !job.completed && (
                      <button onClick={() => handleSubmitProof(job.id)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        <UploadCloud size={18}/> {job.proofHash ? "Update Proof" : "Submit Proof"}
                      </button>
                    )}
                    {activeTab === "freelancer" && canAutoRelease(job) && !job.completed && (
                      <button onClick={() => handleApprove(job.id)} className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-700 animate-pulse">
                        <Clock size={18}/> Claim Payment (Auto-Release)
                      </button>
                    )}
                    {activeTab === "client" && job.proofHash && !job.completed && (
                      <button onClick={() => handleApprove(job.id)} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">
                        <CheckCircle size={18}/> Release Payment
                      </button>
                    )}
                    {activeTab === "client" && !job.accepted && (
                      <button className="px-8 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all">Cancel Job</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
