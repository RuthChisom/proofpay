"use client";

import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { useRef } from "react";

interface HeroSectionProps {
  onConnect: () => void;
  onScrollToHow: () => void;
}

export default function HeroSection({ onConnect, onScrollToHow }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

      {/* ── Background layers ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* deep radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.18) 0%, transparent 65%)" }}
        />
        {/* bottom-left accent */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Main content ──────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">

        {/* Live badge */}
        <div
          className="pp-animate-fade-in inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-10"
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "#a5b4fc",
            animationDelay: "0s",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px #34d399", animation: "pp-glow-pulse 2s ease-in-out infinite" }}
          />
          On-chain escrow · Powered by Flow EVM
        </div>

        {/* Headline */}
        <h1
          className="pp-animate-slide-up font-black tracking-tighter leading-none mb-0"
          style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", animationDelay: "0.05s" }}
        >
          <span
            className="block"
            style={{ color: "#f1f5f9" }}
          >
            You did the work.
          </span>
          <span
            className="block pp-gradient-text"
            style={{ animationDelay: "0.1s" }}
          >
            Get paid for it.
          </span>
        </h1>

        {/* Emotional sub-kicker */}
        <p
          className="pp-animate-fade-in mt-8 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto"
          style={{ color: "#94a3b8", animationDelay: "0.25s" }}
        >
          No more ghost clients. No more chasing invoices.{" "}
          <br className="hidden md:block" />
          <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
            ProofPay locks client funds before you start — guaranteed on-chain.
          </span>
        </p>

        {/* CTAs */}
        <div
          className="pp-animate-fade-in mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "0.4s" }}
        >
          {/* Primary */}
          <button
            onClick={onConnect}
            className="group relative flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.25)",
            }}
          >
            {/* inner shimmer on hover */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pp-shimmer-bar" />
            <ShieldCheck size={20} />
            <span className="relative">Start Earning Safely</span>
            <ArrowRight
              size={18}
              className="relative transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          {/* Secondary */}
          <button
            onClick={onScrollToHow}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#cbd5e1",
            }}
          >
            <Play size={16} style={{ color: "#818cf8" }} />
            See How It Works
          </button>
        </div>

        {/* Trust micro-stats */}
        <div
          className="pp-animate-fade-in mt-14 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          style={{ animationDelay: "0.55s" }}
        >
          {[
            { value: "2,847", label: "freelancers paid" },
            { value: "$1.2M+", label: "secured in escrow" },
            { value: "99.1%", label: "success rate" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
              )}
              <span
                className="text-sm font-black"
                style={{ color: "#a5b4fc" }}
              >
                {s.value}
              </span>
              <span className="text-sm" style={{ color: "#475569" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating escrow card ───────────────────────── */}
      <div
        className="relative z-10 mt-20 w-full max-w-[420px] mx-auto pp-animate-float"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Glow behind card */}
        <div
          className="absolute -inset-4 rounded-[2rem] blur-2xl"
          style={{ background: "rgba(99,102,241,0.18)" }}
        />

        <div
          className="relative pp-glass-strong rounded-3xl p-6"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)" }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#475569" }}>
                Active Escrow
              </p>
              <p className="text-base font-bold text-white">Brand Identity Package</p>
            </div>
            {/* Verified badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.35)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ animation: "pp-glow-pulse 2s ease-in-out infinite" }}
              />
              <span className="text-[10px] font-black tracking-wide" style={{ color: "#34d399" }}>
                PAYMENT LOCKED
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-3xl font-black text-white">$2,400</span>
              <span className="text-sm ml-2 font-medium" style={{ color: "#34d399" }}>
                100% secured
              </span>
            </div>
            <div className="text-right">
              <p className="text-[11px]" style={{ color: "#475569" }}>Due in</p>
              <p className="text-sm font-bold" style={{ color: "#a5b4fc" }}>14 days</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: "#64748b" }}>Milestone 2 of 3</span>
              <span className="font-bold" style={{ color: "#34d399" }}>$1,600 / $2,400</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: "67%",
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.6)",
                }}
              >
                <div className="absolute inset-0 pp-shimmer-bar" />
              </div>
            </div>
          </div>

          {/* Milestone list */}
          <div className="mt-4 space-y-2">
            {[
              { label: "Logo concepts",    amount: "$800", done: true  },
              { label: "Brand guidelines", amount: "$800", done: true  },
              { label: "Final assets",     amount: "$800", done: false },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{
                  background: m.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${m.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: m.done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)",
                      color: m.done ? "#34d399" : "#475569",
                    }}
                  >
                    {m.done ? "✓" : "·"}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: m.done ? "#94a3b8" : "#e2e8f0" }}
                  >
                    {m.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: m.done ? "#34d399" : "#a5b4fc" }}
                >
                  {m.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
