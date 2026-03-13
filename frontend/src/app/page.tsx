"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import "./fcl-config";
import Dashboard from "./components/Dashboard";
import { LogIn, ShieldCheck } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<{ loggedIn: boolean | null; addr: string | null }>({ loggedIn: null, addr: null });

  useEffect(() => {
    fcl.currentUser.subscribe((user: any) => setUser(user));
  }, []);

  const login = () => fcl.authenticate();
  const logout = () => fcl.unauthenticate();

  if (user.loggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">ProofPay</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono text-zinc-500">
              {user.addr}
            </div>
            <button 
              onClick={logout}
              className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
        
        <main className="flex justify-center py-12">
          <Dashboard userAddress={user.addr || ""} />
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
            The future of decentralized freelance payments. Secure escrow, privacy-preserving proofs, and gasless onboarding.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <button 
            onClick={login}
            className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <LogIn size={20} />
            Continue with Flow Wallet
          </button>
          
          <div className="grid grid-cols-3 gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="space-y-2">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full" />
              <span>Secure</span>
            </div>
            <div className="space-y-2">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full" />
              <span>Private</span>
            </div>
            <div className="space-y-2">
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full" />
              <span>Decentralized</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400">
          Powered by Flow EVM, Lit Protocol, and Storacha.
        </p>
      </div>
    </div>
  );
}
