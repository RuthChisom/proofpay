"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import "../fcl-config"; // Import config to initialize

export default function Login() {
  const [user, setUser] = useState<{ loggedIn: boolean | null; addr: string | null }>({ loggedIn: null, addr: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fcl.currentUser.subscribe((user: any) => setUser(user));
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      await fcl.authenticate();
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    fcl.unauthenticate();
  };

  // Example of a transaction with "No user transaction approvals needed"
  // This typically requires a backend to sign as payer and proposer
  // and potentially as authorizer if the account is managed.
  const performWalletlessAction = async () => {
    if (!user.loggedIn) return;

    setLoading(true);
    try {
      // In a real walletless AA setup, the proposer and payer would be a service account
      // The authorizer would be the user's account.
      // For truly "no approval", the user's account must be a contract account
      // that the service account has permission to sign for.
      
      const transactionId = await fcl.mutate({
        cadence: `
          transaction {
            prepare(signer: &Account) {
              log("Action performed by ".concat(signer.address.toString()))
            }
          }
        `,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 100,
      });

      console.log("Transaction sent:", transactionId);
      await fcl.tx(transactionId).onceSealed();
      alert("Action successful!");
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Failed to perform action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">ProofPay</h2>
      
      {!user.loggedIn ? (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">
            Sign in to start sending and receiving payments on Flow.
          </p>
          <button
            onClick={login}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Wallet / Sign In"}
          </button>
          <p className="text-xs text-zinc-500 text-center mt-2">
            Supports Email, Social, and Hardware Wallets via Flow Discovery.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Logged in as:</p>
            <p className="font-mono text-indigo-600 dark:text-indigo-400 truncate">{user.addr}</p>
          </div>
          
          <button
            onClick={performWalletlessAction}
            disabled={loading}
            className="w-full h-12 rounded-xl border border-indigo-600 text-indigo-600 font-semibold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Perform Walletless Action"}
          </button>

          <button
            onClick={logout}
            className="w-full h-12 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
