"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Dashboard from "./components/Dashboard";
import { ShieldCheck, LogOut, Wallet } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Defer wallet-dependent rendering until after hydration so server and
  // client produce the same initial HTML (wagmi reconnects client-side only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (mounted && isConnected && address) {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            ProofPay
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Secure freelancer escrow on Flow EVM.
            Proof-based payments, automated releases.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <button 
            onClick={() => connect({ connector: injected() })}
            className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
          >
            <Wallet size={20} />
            Connect Wallet
          </button>
          
          <div className="grid grid-cols-3 gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="space-y-2 text-center">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full mb-2" />
              <span>Secure</span>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full mb-2" />
              <span>Flow EVM</span>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full mb-2" />
              <span>Escrow</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400">
          Powered by Flow EVM Testnet
        </p>
      </div>
    </div>
  );
}
