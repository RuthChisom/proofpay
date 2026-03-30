"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/landing/LandingPage";
import { ShieldCheck, LogOut } from "lucide-react";

const FLOW_EVM_TESTNET_CHAIN_ID = 545;

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Defer wallet-dependent rendering until after hydration so server and
  // client produce the same initial HTML (wagmi reconnects client-side only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (mounted && isConnected && address) {
    const isWrongNetwork = chainId !== FLOW_EVM_TESTNET_CHAIN_ID;

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
          {isWrongNetwork ? (
            <div className="w-full max-w-2xl px-6">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-sm">
                <h1 className="text-2xl font-black">Switch To Flow EVM Testnet</h1>
                <p className="mt-3 text-sm leading-6 text-amber-900">
                  Your wallet is currently connected to chain ID {chainId}. ProofPay creates jobs on Flow EVM Testnet
                  only, so your wallet may show the native token as ETH or mark the transfer as risky until you switch.
                </p>
                <button
                  onClick={() => switchChain({ chainId: FLOW_EVM_TESTNET_CHAIN_ID })}
                  disabled={isSwitchingChain}
                  className="mt-6 rounded-2xl bg-amber-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSwitchingChain ? "Switching..." : "Switch Network"}
                </button>
              </div>
            </div>
          ) : (
            <Dashboard userAddress={address} />
          )}
        </main>
      </div>
    );
  }

  return (
    <LandingPage onConnect={() => connect({ connector: injected() })} />
  );
}
