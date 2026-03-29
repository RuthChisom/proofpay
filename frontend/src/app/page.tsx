"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/landing/LandingPage";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 flex justify-between items-center text-zinc-900 dark:text-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">ProofPay</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono text-zinc-500">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <button 
              onClick={() => disconnect()}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </div>
        </nav>
        
        <main className="flex justify-center py-12">
          <Dashboard userAddress={address} />
        </main>
      </div>
    );
  }

  return (
    <LandingPage onConnect={() => connect({ connector: injected() })} />
  );
}
