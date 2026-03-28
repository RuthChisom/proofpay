"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";

interface FinalCTASectionProps {
  onConnect: () => void;
}

export default function FinalCTASection({ onConnect }: FinalCTASectionProps) {
  return (
    <section className="py-36 px-6 relative overflow-hidden">

      {/* Background glow + grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.22) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">

        {/* Icon */}
        <div
          className="w-18 h-18 mx-auto mb-10 flex items-center justify-center rounded-3xl"
          style={{
            width: "4.5rem",
            height: "4.5rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 50px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)",
          }}
        >
          <ShieldCheck size={30} className="text-white" />
        </div>

        {/* Headline */}
        <h2
          className="font-black tracking-tighter leading-tight mb-6"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", color: "#f1f5f9" }}
        >
          Never work without{" "}
          <span className="pp-gradient-text">guaranteed payment</span>{" "}
          again.
        </h2>

        <p className="text-xl mb-12 leading-relaxed" style={{ color: "#64748b" }}>
          Thousands of freelancers have already flipped the script.<br />
          Your time has value.{" "}
          <span style={{ color: "#94a3b8" }}>It's time to protect it.</span>
        </p>

        {/* CTA button */}
        <button
          onClick={onConnect}
          className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-black text-xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 12px 48px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.3)",
          }}
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pp-shimmer-bar" />
          <span className="relative">Start Using ProofPay</span>
          <ArrowRight
            size={22}
            className="relative transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>

        <p className="mt-6 text-sm" style={{ color: "#334155" }}>
          Free to use · Connect any Web3 wallet · Flow EVM Testnet
        </p>
      </div>

      {/* Footer */}
      <div
        className="mt-24 pt-8 flex flex-col items-center gap-2 relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">ProofPay</span>
        </div>
        <p className="text-xs" style={{ color: "#334155" }}>
          Powered by Flow EVM · Secured by smart contracts · Built for freelancers
        </p>
      </div>
    </section>
  );
}
