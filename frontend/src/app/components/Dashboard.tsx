"use client";

import { useState } from "react";
import { PlusCircle, CheckCircle, UploadCloud, Briefcase, Zap, Loader2 } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { useProofPayEscrow } from "../../hooks/useProofPayEscrow";
import { formatEther } from "viem";

export default function Dashboard({ userAddress }: { userAddress: string }) {
  const { jobs, isLoading: jobsLoading, refetch } = useJobs();
  const { createJob, acceptJob, submitProof, approveWork, isPending, isConfirming } = useProofPayEscrow();
  
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  const [newFreelancer, setNewFreelancer] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const handleCreateJob = async () => {
    if (!newFreelancer || !newAmount) return;
    try {
      await createJob(newFreelancer, newAmount);
      setNewFreelancer("");
      setNewAmount("");
    } catch (err) {
      console.error("Create job failed:", err);
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
    const proof = prompt("Enter proof of work (e.g., URL or CID):");
    if (!proof) return;
    try {
      await submitProof(jobId, proof);
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

  // Filter jobs based on active tab and user address
  const filteredJobs = jobs.filter(job => {
    if (activeTab === "client") {
      return job.client.toLowerCase() === userAddress.toLowerCase();
    } else {
      return job.freelancer.toLowerCase() === userAddress.toLowerCase();
    }
  });

  return (
    <div className="w-full max-w-6xl p-6 space-y-8">
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
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Freelancer Address</label>
                  <input 
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="0x..." 
                    value={newFreelancer}
                    onChange={(e) => setNewFreelancer(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Amount (FLOW)</label>
                  <input 
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="1.0" 
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleCreateJob}
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isPending || isConfirming) ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                  Create & Deposit
                </button>
              </div>
            </div>
          )}
          
          <div className="p-8 bg-zinc-950 text-white rounded-3xl border border-zinc-800 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Network Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Network</span>
                <span className="text-indigo-400 font-mono">Flow EVM Testnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Chain ID</span>
                <span className="text-indigo-400 font-mono">545</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-900/20 text-indigo-100 rounded-3xl border border-indigo-500/30 flex flex-col gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle size={18} /> Demo Guide
            </h3>
            <ol className="text-xs space-y-3 list-decimal list-inside text-indigo-200/70">
              <li>Connect wallet to Flow EVM Testnet</li>
              <li>Switch to <span className="text-white font-bold">Client Mode</span></li>
              <li>Create a job for a freelancer address</li>
              <li>Switch to <span className="text-white font-bold">Freelancer Mode</span></li>
              <li><span className="text-white font-bold">Accept</span> the job and <span className="text-white font-bold">Submit Proof</span></li>
              <li>Switch back to <span className="text-white font-bold">Client Mode</span></li>
              <li><span className="text-white font-bold">Approve</span> and release payment</li>
            </ol>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600"/>
              {activeTab === "client" ? "My Created Jobs" : "My Assigned Jobs"}
            </h2>
            <button 
              onClick={() => refetch()}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
            >
              Refresh
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              No jobs found for this mode.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id.toString()} className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-black">{formatEther(job.payment)} FLOW</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        job.completed ? 'bg-green-100 text-green-700' : 
                        job.proofHash ? 'bg-amber-100 text-amber-700' : 
                        job.accepted ? 'bg-blue-100 text-blue-700' : 
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {job.completed ? 'Completed' : job.proofHash ? 'In Review' : job.accepted ? 'In Progress' : 'Pending Accept'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500">Job ID: {job.id.toString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Client</span>
                    <span className="text-xs font-mono truncate block">{job.client}</span>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Freelancer</span>
                    <span className="text-xs font-mono truncate block">{job.freelancer}</span>
                  </div>
                </div>

                {job.proofHash && (
                  <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Proof of Work</span>
                    <p className="text-sm font-medium truncate">{job.proofHash}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {activeTab === "freelancer" && !job.accepted && (
                    <button 
                      onClick={() => handleAccept(job.id)}
                      disabled={isPending || isConfirming}
                      className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      Accept Job
                    </button>
                  )}
                  {activeTab === "freelancer" && job.accepted && !job.completed && (
                    <button 
                      onClick={() => handleSubmitProof(job.id)}
                      disabled={isPending || isConfirming}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      <UploadCloud size={18}/> 
                      {job.proofHash ? "Update Proof" : "Submit Proof"}
                    </button>
                  )}
                  {activeTab === "client" && job.proofHash && !job.completed && (
                    <button 
                      onClick={() => handleApprove(job.id)}
                      disabled={isPending || isConfirming}
                      className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={18}/> Release Payment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
