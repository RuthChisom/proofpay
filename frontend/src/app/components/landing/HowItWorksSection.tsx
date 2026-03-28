"use client";

import { CheckCircle, DollarSign, Shield, Zap } from "lucide-react";
import { forwardRef } from "react";

const STEPS = [
  {
    n: "01",
    icon: DollarSign,
    color: "#818cf8",
    rgb: "129,132,248",
    actor: "Client",
    headline: "Funds Locked",
    sub: "Client deposits the full payment into a smart-contract escrow. The money is on-chain before you ever open the brief.",
  },
  {
    n: "02",
    icon: CheckCircle,
    color: "#a78bfa",
    rgb: "167,139,250",
    actor: "Freelancer",
    headline: "Job Accepted",
    sub: "You see the locked funds, review the scope, and accept. No money visible? You walk away — zero risk.",
  },
  {
    n: "03",
    icon: Shield,
    color: "#38bdf8",
    rgb: "56,189,248",
    actor: "Freelancer",
    headline: "Work Submitted",
    sub: "Deliver the work and upload proof — files, links, or on-chain data. Timestamped and immutable.",
  },
  {
    n: "04",
    icon: Zap,
    color: "#34d399",
    rgb: "52,211,153",
    actor: "Protocol",
    headline: "Payment Released",
    sub: "Client approves → instant transfer. Client goes silent → auto-release fires after 48 h. You get paid either way.",
  },
];

const ACTOR_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  Client:     { color: "#818cf8", bg: "rgba(129,132,248,0.1)", border: "rgba(129,132,248,0.25)" },
  Freelancer: { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  Protocol:   { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)"  },
};

const HowItWorksSection = forwardRef<HTMLElement>(function HowItWorksSection(_, ref) {
  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">

      {/* Faint background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Label */}
        <div className="flex justify-center mb-10">
          <span
            className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
            style={{
              color: "#818cf8",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            How It Works
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-20">
          <h2
            className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", color: "#f1f5f9" }}
          >
            Four steps.
            <br />
            <span className="pp-gradient-text">Zero surprises.</span>
          </h2>
        </div>

        {/* ── Pipeline layout ───────────────────────────── */}
        <div className="relative">

          {/* Gradient track — desktop only */}
          <div
            className="hidden md:block absolute top-[2.75rem] left-[calc(12.5%-1rem)] right-[calc(12.5%-1rem)] h-[3px] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #818cf8 0%, #a78bfa 33%, #38bdf8 66%, #34d399 100%)",
              opacity: 0.35,
            }}
          />

          {/* Step circles + cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const actorStyle = ACTOR_STYLE[s.actor];
              return (
                <div key={s.n} className="flex flex-col items-center text-center">

                  {/* Circle */}
                  <div
                    className="relative w-[5.5rem] h-[5.5rem] rounded-full flex items-center justify-center mb-6 flex-shrink-0"
                    style={{
                      background: `rgba(${s.rgb}, 0.12)`,
                      border: `2px solid rgba(${s.rgb}, 0.45)`,
                      boxShadow: `0 0 32px rgba(${s.rgb}, 0.2)`,
                    }}
                  >
                    {/* Step number — top-left notch */}
                    <span
                      className="absolute -top-2 -left-1 text-[10px] font-black px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `rgba(${s.rgb}, 0.18)`,
                        border: `1px solid rgba(${s.rgb}, 0.35)`,
                        color: s.color,
                      }}
                    >
                      {s.n}
                    </span>

                    <Icon size={28} style={{ color: s.color }} />
                  </div>

                  {/* Actor chip */}
                  <span
                    className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg mb-3"
                    style={{
                      color: actorStyle.color,
                      background: actorStyle.bg,
                      border: `1px solid ${actorStyle.border}`,
                    }}
                  >
                    {s.actor}
                  </span>

                  {/* Headline */}
                  <h3
                    className="text-lg font-black mb-2"
                    style={{ color: "#f1f5f9" }}
                  >
                    {s.headline}
                  </h3>

                  {/* Body */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    {s.sub}
                  </p>

                  {/* Mobile connector */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="md:hidden mt-6 w-[3px] h-8 rounded-full"
                      style={{
                        background: `linear-gradient(180deg, ${s.color}, ${STEPS[i + 1].color})`,
                        opacity: 0.35,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 flex justify-center">
          <div
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
            }}
          >
            <Zap size={14} style={{ color: "#34d399" }} />
            The entire flow takes under two minutes.&nbsp;
            <span style={{ color: "#64748b" }}>
              Everything else is automated by the protocol.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HowItWorksSection;
