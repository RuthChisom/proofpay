"use client";

import { CheckCircle, ShieldCheck, Star, TrendingUp } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Mini UI components — self-contained previews used inside
   each feature card. Purely presentational, no state.
───────────────────────────────────────────────────────────── */

function VerifiedBadgePreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      {/* Main badge */}
      <div
        className="relative flex items-center gap-3 px-5 py-3 rounded-2xl"
        style={{
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.4)",
          boxShadow: "0 0 32px rgba(16,185,129,0.15)",
        }}
      >
        {/* Pulsing dot */}
        <span
          className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"
          style={{ boxShadow: "0 0 8px #34d399", animation: "pp-glow-pulse 2s ease-in-out infinite" }}
        />
        <ShieldCheck size={18} style={{ color: "#34d399" }} />
        <span className="text-sm font-black tracking-wide" style={{ color: "#34d399" }}>
          PAYMENT VERIFIED READY
        </span>
      </div>

      {/* Escrow amount beneath */}
      <div className="text-center">
        <div className="text-2xl font-black text-white">$2,400.00</div>
        <div className="text-xs mt-0.5 font-semibold" style={{ color: "#475569" }}>
          locked in escrow · 3 days ago
        </div>
      </div>

      {/* Client address chip */}
      <div
        className="px-3 py-1.5 rounded-full text-xs font-mono"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#475569",
        }}
      >
        0x7f4e…9a2b deposited · Flow EVM
      </div>
    </div>
  );
}

function TrustScorePreview() {
  const score = 98;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {/* SVG arc gauge */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="url(#trustGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
          <defs>
            <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        {/* Score in centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white leading-none">{score}</span>
          <span className="text-[10px] font-bold" style={{ color: "#475569" }}>/100</span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
        ))}
      </div>

      {/* Label chips */}
      <div className="flex gap-2 flex-wrap justify-center">
        {["Top 2%", "47 jobs", "100% on-time"].map((label) => (
          <span
            key={label}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(129,132,248,0.1)",
              border: "1px solid rgba(129,132,248,0.2)",
              color: "#a5b4fc",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const RELEASE_STEPS = [
  { label: "Logo concepts",    amount: "$800", status: "released" as const },
  { label: "Brand guidelines", amount: "$800", status: "released" as const },
  { label: "Final asset pack", amount: "$800", status: "pending"  as const },
];

function GradualReleasePreview() {
  return (
    <div className="py-3 space-y-2.5">
      {RELEASE_STEPS.map((step, i) => {
        const done = step.status === "released";
        return (
          <div key={step.label} className="relative flex items-center gap-3">
            {/* Connector line */}
            {i < RELEASE_STEPS.length - 1 && (
              <div
                className="absolute left-[17px] top-full h-2.5 w-px"
                style={{ background: done ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.07)" }}
              />
            )}

            {/* Step indicator */}
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${done ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {done
                ? <CheckCircle size={16} style={{ color: "#34d399" }} />
                : <span className="text-xs font-black" style={{ color: "#334155" }}>{i + 1}</span>
              }
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: done ? "#94a3b8" : "#e2e8f0" }}
              >
                {step.label}
              </div>
              <div className="text-xs" style={{ color: "#334155" }}>
                {done ? "Payment released" : "Awaiting submission"}
              </div>
            </div>

            {/* Amount */}
            <div
              className="text-sm font-black flex-shrink-0"
              style={{ color: done ? "#34d399" : "#a5b4fc" }}
            >
              {step.amount}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBarPreview() {
  const pct = 67;
  const total = 2400;
  const paid = Math.round(total * (pct / 100));

  return (
    <div className="py-4 space-y-5">
      {/* Amount row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-black text-white">${paid.toLocaleString()}</div>
          <div className="text-xs" style={{ color: "#475569" }}>released so far</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: "#64748b" }}>
            of ${total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#475569" }}>total locked</div>
        </div>
      </div>

      {/* Track */}
      <div>
        <div
          className="h-4 rounded-full overflow-hidden relative"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {/* Fill */}
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 60%, #10b981 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            }}
          >
            <div className="absolute inset-0 pp-shimmer-bar" />
          </div>

          {/* Milestone tick marks */}
          {[33, 66].map((mark) => (
            <div
              key={mark}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${mark}%`,
                background: "rgba(5,5,8,0.6)",
              }}
            />
          ))}
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between mt-2">
          {["M1", "M2", "M3"].map((m, i) => (
            <div key={m} className="text-center" style={{ width: "33%" }}>
              <div
                className="text-[10px] font-bold"
                style={{ color: i < 2 ? "#34d399" : "#334155" }}
              >
                {m}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
        >
          2 milestones released
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(129,132,248,0.1)", border: "1px solid rgba(129,132,248,0.2)", color: "#a5b4fc" }}
        >
          1 pending approval
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Feature card data
───────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    tag: "Verified Payment",
    tagColor: "#34d399",
    tagBg: "rgba(16,185,129,0.1)",
    tagBorder: "rgba(16,185,129,0.25)",
    accentColor: "#34d399",
    accentRgb: "52,211,153",
    title: "Verified Payment Ready",
    body: "Before you accept any job, ProofPay confirms the full payment is locked in escrow. You see a cryptographic guarantee — not a promise.",
    preview: <VerifiedBadgePreview />,
  },
  {
    tag: "Reputation",
    tagColor: "#fbbf24",
    tagBg: "rgba(251,191,36,0.1)",
    tagBorder: "rgba(251,191,36,0.25)",
    accentColor: "#fbbf24",
    accentRgb: "251,191,36",
    title: "On-Chain Trust Score",
    body: "Every completed job builds a permanent, verifiable reputation score stored on the blockchain. Portable across clients — no platform can strip it away.",
    preview: <TrustScorePreview />,
  },
  {
    tag: "Milestones",
    tagColor: "#818cf8",
    tagBg: "rgba(99,102,241,0.1)",
    tagBorder: "rgba(99,102,241,0.25)",
    accentColor: "#818cf8",
    accentRgb: "129,132,248",
    title: "Gradual Payment Release",
    body: "Payments unlock milestone by milestone as you deliver. You're never more than one phase away from money — and auto-release fires if a client goes silent.",
    preview: <GradualReleasePreview />,
  },
  {
    tag: "Transparency",
    tagColor: "#c084fc",
    tagBg: "rgba(192,132,252,0.1)",
    tagBorder: "rgba(192,132,252,0.25)",
    accentColor: "#c084fc",
    accentRgb: "192,132,252",
    title: "Payment Progress Bar",
    body: "See exactly how much has been released, how much is still locked, and where every milestone sits — in real time, on every job you take.",
    preview: <ProgressBarPreview />,
  },
];

/* ─────────────────────────────────────────────────────────────
   Section
───────────────────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Heading */}
        <div className="flex justify-center mb-10">
          <span
            className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
            style={{
              color: "#818cf8",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            Features
          </span>
        </div>

        <div className="text-center mb-6">
          <h2
            className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", color: "#f1f5f9" }}
          >
            Built to keep you{" "}
            <span className="pp-gradient-text">in control.</span>
          </h2>
        </div>

        <div className="flex justify-center mb-20">
          <p
            className="text-center text-lg md:text-xl max-w-xl leading-relaxed"
            style={{ color: "#64748b" }}
          >
            Every feature exists for one reason: so you never have to wonder
            whether you'll get paid.
          </p>
        </div>

        {/* 2×2 feature grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Top: text content */}
              <div className="p-7 pb-5">
                <span
                  className="inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg mb-4"
                  style={{
                    color: f.tagColor,
                    background: f.tagBg,
                    border: `1px solid ${f.tagBorder}`,
                  }}
                >
                  {f.tag}
                </span>
                <h3
                  className="text-xl font-black mb-2"
                  style={{ color: "#f1f5f9" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {f.body}
                </p>
              </div>

              {/* Bottom: mini UI preview */}
              <div
                className="mx-5 mb-5 px-5 rounded-2xl"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: `1px solid rgba(${f.accentRgb},0.12)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 24px rgba(${f.accentRgb},0.06)`,
                }}
              >
                {f.preview}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
