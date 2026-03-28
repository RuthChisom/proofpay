"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";

interface FinalCTASectionProps {
  onConnect: () => void;
}

const TRUST_CHIPS = [
  "Non-custodial escrow",
  "Auto-release protection",
  "Free to use",
  "Flow EVM Testnet",
];

export default function FinalCTASection({ onConnect }: FinalCTASectionProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">

      {/* ── Background ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Hard top border — caps off the section above */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)" }}
        />

        {/* Central upward bloom */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.22) 0%, transparent 65%)" }}
        />

        {/* Side accent glows */}
        <div
          className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)" }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">

        {/* Manifesto quote — gives the freelancer a voice */}
        <div
          className="mb-14 px-7 py-6 rounded-2xl max-w-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            className="text-lg md:text-xl leading-relaxed font-medium italic mb-3"
            style={{ color: "#94a3b8" }}
          >
            "I did the work. I delivered on time. I held up my end.
            <span style={{ color: "#e2e8f0" }}> I deserve to get paid — every single time."</span>
          </p>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#334155" }}>
            — Every freelancer who's ever been burned
          </p>
        </div>

        {/* Shield icon with strong glow */}
        <div
          className="w-20 h-20 rounded-[1.4rem] flex items-center justify-center mb-10 pp-animate-glow"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)",
          }}
        >
          <ShieldCheck size={36} className="text-white" />
        </div>

        {/* Headline — declarative, not a question */}
        <h2
          className="font-black tracking-tighter mb-5"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            lineHeight: 0.95,
            color: "#f1f5f9",
          }}
        >
          The work starts
          <br />
          when the{" "}
          <span className="pp-gradient-text">money is in.</span>
          <br />
          Not a moment before.
        </h2>

        {/* Sub — short, punchy */}
        <p
          className="text-lg md:text-xl mb-14 max-w-xl leading-relaxed"
          style={{ color: "#64748b" }}
        >
          Not a promise. Not an invoice. Not a handshake.
          <br />
          <span style={{ color: "#94a3b8" }}>
            An on-chain guarantee, enforced by code.
          </span>
        </p>

        {/* Primary CTA */}
        <button
          onClick={onConnect}
          className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-2xl text-white font-black text-xl overflow-hidden transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow:
              "0 0 0 1px rgba(99,102,241,0.4), 0 16px 60px rgba(99,102,241,0.55), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Shimmer sweep on hover */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pp-shimmer-bar" />
          <span className="relative">Start Using ProofPay</span>
          <ArrowRight
            size={22}
            className="relative transition-transform duration-200 group-hover:translate-x-1.5"
          />
        </button>

        {/* Trust chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {TRUST_CHIPS.map((chip) => (
            <span
              key={chip}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#475569",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        className="relative z-10 mt-24 pt-8 flex flex-col items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <ShieldCheck size={13} className="text-white" />
          </div>
          <span className="text-sm font-black text-white">ProofPay</span>
        </div>
        <p className="text-xs" style={{ color: "#1e293b" }}>
          Powered by Flow EVM · Secured by smart contracts · Built for freelancers
        </p>
      </div>
    </section>
  );
}
