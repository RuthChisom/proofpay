"use client";

import { CheckCircle, Star, TrendingUp } from "lucide-react";

const MILESTONES = [
  { label: "Logo concepts",    amount: "$800", status: "released", date: "Jan 15" },
  { label: "Brand guidelines", amount: "$800", status: "released", date: "Jan 22" },
  { label: "Final asset pack", amount: "$800", status: "pending",  date: "Jan 29" },
];

const META_STATS = [
  { label: "Trust Score",     value: "98/100",  icon: <Star size={14} />,         color: "#fbbf24" },
  { label: "Jobs Done",       value: "47",       icon: <CheckCircle size={14} />,  color: "#34d399" },
  { label: "On-Time Rate",    value: "100%",     icon: <TrendingUp size={14} />,   color: "#818cf8" },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ color: "#34d399", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)" }}
          >
            Live Dashboard
          </span>
          <h2
            className="font-black tracking-tighter leading-none mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "#f1f5f9" }}
          >
            Your payment,{" "}
            <span style={{ color: "#34d399" }}>always visible.</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Real-time escrow visibility. No surprises. No excuses.
          </p>
        </div>

        {/* Feature showcase card */}
        <div className="relative">

          {/* Ambient glow */}
          <div
            className="absolute -inset-6 rounded-[2.5rem] blur-3xl pointer-events-none"
            style={{ background: "rgba(99,102,241,0.12)" }}
          />

          <div
            className="relative pp-glass-strong rounded-3xl p-8"
            style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)" }}
          >

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-white">Brand Identity Package</h3>
                  {/* Verified payment badge */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      style={{ animation: "pp-glow-pulse 2s ease-in-out infinite" }}
                    />
                    <span className="text-[10px] font-black tracking-wide" style={{ color: "#34d399" }}>
                      VERIFIED PAYMENT READY
                    </span>
                  </div>
                </div>
                <p className="text-sm" style={{ color: "#475569" }}>
                  Client: 0x7f4e…9a2b · Deposited 3 days ago
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">$2,400</div>
                <div className="text-sm font-semibold" style={{ color: "#34d399" }}>100% secured in escrow</div>
              </div>
            </div>

            {/* Meta stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {META_STATS.map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded-2xl text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
                    {s.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wide">{s.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Overall progress */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-white">Overall Progress</span>
                <span className="text-sm font-bold" style={{ color: "#34d399" }}>67% Complete</span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: "67%",
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)",
                    boxShadow: "0 0 16px rgba(99,102,241,0.55)",
                  }}
                >
                  <div className="absolute inset-0 pp-shimmer-bar" />
                </div>
              </div>
            </div>

            {/* Milestone grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {MILESTONES.map((m) => {
                const released = m.status === "released";
                return (
                  <div
                    key={m.label}
                    className="p-5 rounded-2xl"
                    style={{
                      background: released ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${released ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-black uppercase tracking-wide"
                        style={{ color: released ? "#34d399" : "#818cf8" }}
                      >
                        {released ? "✓ Released" : "⏳ Pending"}
                      </span>
                      <span className="text-[11px]" style={{ color: "#475569" }}>{m.date}</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{m.label}</div>
                    <div
                      className="text-2xl font-black"
                      style={{ color: released ? "#34d399" : "#a5b4fc" }}
                    >
                      {m.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
