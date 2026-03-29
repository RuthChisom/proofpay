"use client";

import { Award, CheckCircle, Lock, TrendingUp, Zap } from "lucide-react";

const SOLUTIONS = [
  {
    icon: Lock,
    accentColor: "#818cf8",
    accentRgb: "129,132,248",
    problem: "Ghost clients who never pay",
    fix: "Funds Locked Before You Start",
    body: "The client deposits the full payment into a non-custodial smart contract before you see the job. The money is there — provably, on-chain — before you write a single line or design a single pixel.",
    proof: "No funds = no job. You never work on faith again.",
    tag: "Zero-risk start",
  },
  {
    icon: TrendingUp,
    accentColor: "#c084fc",
    accentRgb: "192,132,252",
    problem: "Waiting months for a final payout",
    fix: "Milestone-by-Milestone Payments",
    body: "Split any project into milestones and get paid as you go. Complete phase one, get paid for phase one. You're never more than one milestone away from money in your pocket.",
    proof: "Cash flow that matches how you actually work.",
    tag: "Steady cash flow",
  },
  {
    icon: Zap,
    accentColor: "#38bdf8",
    accentRgb: "56,189,248",
    problem: "Client goes silent after delivery",
    fix: "Auto-Release After 48 Hours",
    body: "Submit your proof of work. The client has 48 hours to review. If they approve — instant payment. If they go silent — payment releases automatically. There is no scenario where silence steals your money.",
    proof: "Silence can no longer be used as a weapon against you.",
    tag: "Always protected",
  },
  {
    icon: Award,
    accentColor: "#34d399",
    accentRgb: "52,211,153",
    problem: "No proof of track record across platforms",
    fix: "On-Chain Trust Score",
    body: "Every completed job, every milestone released, every client approval gets recorded on-chain permanently. Your reputation becomes a portable, unfakeable asset that follows you — not the platform.",
    proof: "A track record no one can delete, dispute, or deny.",
    tag: "Portable reputation",
  },
];

export default function SolutionSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">

      {/* Background — indigo glow to contrast the red problem section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Section label */}
        <div className="flex justify-center mb-10">
          <span
            className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
            style={{
              color: "#818cf8",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            The Fix
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2
            className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", color: "#f1f5f9" }}
          >
            <span className="pp-gradient-text">ProofPay</span> removes
            <br />
            every excuse not to pay.
          </h2>
        </div>

        <div className="flex justify-center mb-20">
          <p
            className="text-center text-lg md:text-xl leading-relaxed max-w-2xl"
            style={{ color: "#64748b" }}
          >
            Not another invoice tool. Not another contract template.
            <br />
            <span style={{ color: "#94a3b8" }}>
              A protocol that makes non-payment technically impossible.
            </span>
          </p>
        </div>

        {/* Solution cards — two-column grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.fix}
                className="relative flex flex-col p-7 rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.01]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Top row: icon + fix tag */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `rgba(${s.accentRgb},0.13)`,
                      border: `1px solid rgba(${s.accentRgb},0.3)`,
                      color: s.accentColor,
                      boxShadow: `0 0 20px rgba(${s.accentRgb},0.15)`,
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: `rgba(${s.accentRgb},0.1)`,
                      border: `1px solid rgba(${s.accentRgb},0.25)`,
                      color: s.accentColor,
                    }}
                  >
                    {s.tag}
                  </span>
                </div>

                {/* Solves line */}
                <div
                  className="flex items-center gap-2 mb-3 text-xs font-semibold"
                  style={{ color: "#475569" }}
                >
                  <span
                    className="w-4 h-px"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  />
                  Fixes: {s.problem}
                </div>

                {/* Fix title */}
                <h3
                  className="text-xl font-black mb-3"
                  style={{ color: "#f1f5f9" }}
                >
                  {s.fix}
                </h3>

                {/* Body */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-5"
                  style={{ color: "#64748b" }}
                >
                  {s.body}
                </p>

                {/* Proof line — the emotional punch */}
                <div
                  className="flex items-start gap-2.5 p-4 rounded-2xl"
                  style={{
                    background: `rgba(${s.accentRgb},0.07)`,
                    border: `1px solid rgba(${s.accentRgb},0.15)`,
                  }}
                >
                  <CheckCircle
                    size={15}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: s.accentColor }}
                  />
                  <p
                    className="text-xs font-semibold leading-relaxed"
                    style={{ color: s.accentColor }}
                  >
                    {s.proof}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom anchor — transitions into FeaturesSection */}
        <div
          className="mt-20 flex flex-col items-center gap-3 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <CheckCircle size={15} />
            Every rule enforced by code. Not promises.
          </div>
          <p className="text-sm" style={{ color: "#334155" }}>
            No middlemen. No arbitration. No waiting.
          </p>
        </div>
      </div>
    </section>
  );
}
