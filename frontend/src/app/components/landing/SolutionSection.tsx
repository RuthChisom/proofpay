"use client";

import { Award, Lock, TrendingUp, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <Lock size={22} />,
    title: "Funds Locked Before You Start",
    body: "The client deposits into a smart-contract escrow before you accept. If the money isn't verifiably there, you simply don't start.",
    tag: "Zero-risk start",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Milestone-Based Releases",
    body: "Break any project into milestones. Get paid incrementally as you deliver — no more waiting for the final sign-off to see a cent.",
    tag: "Steady cash flow",
  },
  {
    icon: <Zap size={22} />,
    title: "Auto-Release Protection",
    body: "Submit your proof of work. If the client goes silent, payment auto-releases after 48 hours. Your work is never held hostage.",
    tag: "Always protected",
  },
  {
    icon: <Award size={22} />,
    title: "On-Chain Trust Score",
    body: "Every completed job is recorded on-chain. Build a verifiable, portable reputation that no platform can take away from you.",
    tag: "Portable reputation",
  },
];

export default function SolutionSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)" }}
          >
            The Solution
          </span>
          <h2
            className="font-black tracking-tighter leading-none mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "#f1f5f9" }}
          >
            <span className="pp-gradient-text">ProofPay</span> flips the rules.
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Funds locked first. You work second. Payment guaranteed.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-5 p-6 rounded-3xl transition-transform duration-200 hover:scale-[1.015]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a5b4fc",
                }}
              >
                {f.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#64748b" }}>{f.body}</p>
                <span
                  className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.22)",
                    color: "#34d399",
                  }}
                >
                  {f.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
