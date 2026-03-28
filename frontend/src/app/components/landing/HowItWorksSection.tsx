"use client";

import { CheckCircle, DollarSign, Shield, Zap } from "lucide-react";
import { forwardRef } from "react";

const STEPS = [
  {
    step: "01",
    icon: <DollarSign size={22} />,
    title: "Client Deposits Funds",
    body: "Before anything starts, the client locks the full payment into a smart-contract escrow. Verifiable on-chain. Non-negotiable.",
    color: "#818cf8",
    rgb: "129,132,248",
  },
  {
    step: "02",
    icon: <CheckCircle size={22} />,
    title: "Freelancer Accepts",
    body: "You see the locked funds and accept with confidence. No funds? You don't start. Simple as that.",
    color: "#c084fc",
    rgb: "192,132,252",
  },
  {
    step: "03",
    icon: <Shield size={22} />,
    title: "Work Submitted",
    body: "Complete the job, upload proof — files, links, or on-chain data. Every submission is immutable and timestamped.",
    color: "#38bdf8",
    rgb: "56,189,248",
  },
  {
    step: "04",
    icon: <Zap size={22} />,
    title: "Payment Released",
    body: "Client approves and payment flows instantly. Went silent? Auto-release triggers after 48 hours. You get paid either way.",
    color: "#34d399",
    rgb: "52,211,153",
  },
];

const HowItWorksSection = forwardRef<HTMLElement>(function HowItWorksSection(_, ref) {
  return (
    <section ref={ref} className="py-28 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)" }}
          >
            How It Works
          </span>
          <h2
            className="font-black tracking-tighter leading-none mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "#f1f5f9" }}
          >
            Simple as{" "}
            <span className="pp-gradient-text">1, 2, 3, 4.</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
            The full payment flow, in under 60 seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-[2.6rem] left-[calc(100%-0.5rem)] w-[calc(100%-1.5rem)] h-px z-0"
                  style={{ background: `linear-gradient(90deg, ${s.color}55, transparent)` }}
                />
              )}

              <div
                className="relative z-10 flex flex-col h-full p-6 rounded-3xl transition-transform duration-200 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Step number watermark */}
                <div
                  className="text-5xl font-black mb-4 leading-none select-none"
                  style={{ color: "rgba(255,255,255,0.06)" }}
                >
                  {s.step}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: `rgba(${s.rgb},0.13)`,
                    border: `1px solid rgba(${s.rgb},0.3)`,
                    color: s.color,
                  }}
                >
                  {s.icon}
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowItWorksSection;
