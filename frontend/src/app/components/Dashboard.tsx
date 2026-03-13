"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { PlusCircle, CheckCircle, UploadCloud, User, Briefcase, FileText, ExternalLink, Shield } from "lucide-react";
import { encryptUploadAndSubmitProof } from "../../lib/escrow";

// ProofPayEscrow ABI snippet
const ESCROW_ABI = [
  "function createJob(address freelancer) external payable returns (uint256)",
  "function acceptJob(uint256 jobId) external",
  "function submitProof(uint256 jobId, string calldata ipfsHash) external",
  "function approveWork(uint256 jobId) external",
  "function jobCount() external view returns (uint256)",
  "function jobs(uint256) external view returns (address client, address freelancer, uint256 payment, string proofHash, bool accepted, bool completed)"
];

const ESCROW_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder

export default function Dashboard({ userAddress }: { userAddress: string }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  
  // Job Creation Form
  const [freelancerAddr, setFreelancerAddr] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [userAddress]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
      const count = await contract.jobCount();
      const allJobs = [];

      for (let i = 0; i < Number(count); i++) {
        const job = await contract.jobs(i);
        // Only show relevant jobs
        if (job.client.toLowerCase() === userAddress.toLowerCase() || 
            job.freelancer.toLowerCase() === userAddress.toLowerCase()) {
          allJobs.push({ id: i, ...job });
        }
      }
      setJobs(allJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      const tx = await contract.createJob(freelancerAddr, {
        value: ethers.parseEther(paymentAmount)
      });
      await tx.wait();
      alert("Job Created Successfully!");
      fetchJobs();
    } catch (err) {
      console.error("Job creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: number) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      const tx = await contract.acceptJob(jobId);
      await tx.wait();
      fetchJobs();
    } catch (err) {
      console.error("Accept job failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWork = async (jobId: number) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      const tx = await contract.approveWork(jobId);
      await tx.wait();
      fetchJobs();
    } catch (err) {
      console.error("Approve work failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (jobId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      await encryptUploadAndSubmitProof(file, jobId, signer);
      alert("Proof submitted successfully!");
      fetchJobs();
    } catch (err) {
      console.error("Proof submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (job: any) => {
    if (job.completed) return <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16}/> Work Approved & Paid</span>;
    if (job.proofHash !== "") return <span className="text-blue-600 flex items-center gap-1"><FileText size={16}/> Work Submitted (Pending Review)</span>;
    if (job.accepted) return <span className="text-amber-600 flex items-center gap-1"><Briefcase size={16}/> In Progress (Accepted by Freelancer)</span>;
    return <span className="text-zinc-500 flex items-center gap-1"><User size={16}/> Awaiting Freelancer Acceptance</span>;
  };

  return (
    <div className="w-full max-w-6xl p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">ProofPay Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your escrow payments and work proofs securely.</p>
        </div>
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <button 
            onClick={() => setActiveTab("client")}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'client' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
          >
            Client View
          </button>
          <button 
            onClick={() => setActiveTab("freelancer")}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'freelancer' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
          >
            Freelancer View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form / Context */}
        <div className="space-y-6">
          {activeTab === "client" && (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="text-indigo-600" /> Create New Job
              </h2>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-500">Freelancer EVM Address</label>
                  <input 
                    value={freelancerAddr}
                    onChange={(e) => setFreelancerAddr(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    placeholder="0x..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-500">Payment Amount (FLOW)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    placeholder="0.0"
                    required
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Deposit & Start Job"}
                </button>
              </form>
            </div>
          )}

          <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="text-indigo-900 dark:text-indigo-400 font-bold mb-2 flex items-center gap-2">
              <Shield size={18}/> Flow Account Abstraction
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-500/80 leading-relaxed">
              ProofPay uses Lit Protocol encryption and Flow's native AA to ensure that only the client can view sensitive work proofs, while freelancers can submit work gaslessly.
            </p>
          </div>
        </div>

        {/* Right Column: Job List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold px-2">Active Milestones</h2>
          {jobs.length === 0 ? (
            <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-400">No active jobs found for this account.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-hover hover:border-indigo-200 dark:hover:border-indigo-900">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-mono text-zinc-400 mb-1 uppercase tracking-widest">Milestone #{job.id}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{ethers.formatEther(job.payment)} FLOW</span>
                      {getStatusLabel(job)}
                    </div>
                  </div>
                  {job.proofHash && (
                    <a 
                      href={`https://ipfs.io/ipfs/${job.proofHash}`} 
                      target="_blank" 
                      className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                      title="View Proof"
                    >
                      <ExternalLink size={20}/>
                    </a>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  {/* Freelancer Actions */}
                  {activeTab === "freelancer" && !job.accepted && (
                    <button 
                      onClick={() => handleAcceptJob(job.id)}
                      className="px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Accept Job
                    </button>
                  )}
                  {activeTab === "freelancer" && job.accepted && !job.proofHash && (
                    <div className="relative overflow-hidden">
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2">
                        <UploadCloud size={18}/> Submit Proof (CID)
                      </button>
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(job.id, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Client Actions */}
                  {activeTab === "client" && job.proofHash && !job.completed && (
                    <button 
                      onClick={() => handleApproveWork(job.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                      <CheckCircle size={18}/> Approve & Release Payment
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
