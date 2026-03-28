"use client";

import { AlertTriangle, Clock, XCircle } from "lucide-react";

const PAINS = [
  {
    icon: XCircle,
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.25)",
    bgColor: "rgba(239,68,68,0.06)",
    glowColor: "rgba(239,68,68,0.12)",
    title: "They Take the Work and Disappear",
    body: [
      "You spent two weeks on that project.",
      "The client loved it. Said they'd pay Friday.",
      "Friday came. Then Monday. Then silence.",
      "You know how this ends.",
    ],
    stat: { value: "71%", label: "of freelancers have been stiffed at least once" },
  },
  {
    icon: Clock,
    color: "#fb923c",
    borderColor: "rgba(251,146,60,0.25)",
    bgColor: "rgba(251,146,60,0.06)",
    glowColor: "rgba(251,146,60,0.12)",
    title: "Your Invoice Is Aging. Your Rent Isn't.",
    body: [
      "Net-30 becomes Net-60.",
      "Net-60 becomes a dispute.",
      "Meanwhile, your bills don't negotiate.",
      "You're financing their business with your survival.",
    ],
    stat: { value: "45 days", label: "average time to get paid after delivery" },
  },
  {
    icon: AlertTriangle,
    color: "#fbbf24",
    borderColor: "rgba(251,191,36,0.25)",
    bgColor: "rgba(251,191,36,0.06)",
    glowColor: "rgba(251,191,36,0.12)",
    title: "\"I'll Pay When the Project Succeeds\"",
    body: [
      "A promise isn't a contract.",
      "A handshake isn't collateral.",
      "And \"trust me\" has never paid a bill.",
      "You take the risk. They take the upside.",
    ],
    stat: { value: "$50K+", label: "lost to bad clients over an average freelance career" },
  },
];

export default function ProblemSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">

      {/* Warm dark background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Section label */}
        <div className="flex justify-center mb-10">
          <span
            className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
            style={{
              color: "#f87171",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            The Problem
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2
            className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", color: "#f1f5f9" }}
          >
            You do the work.
            <br />
            <span style={{ color: "#f87171" }}>You don't get paid.</span>
          </h2>
        </div>

        {/* Opening quote — the emotional gut-punch */}
        <div className="flex justify-center mb-20">
          <p
            className="text-center text-lg md:text-xl leading-relaxed max-w-2xl"
            style={{ color: "#64748b" }}
          >
            No industry penalizes skill and effort like freelancing.
            <br />
            <span style={{ color: "#94a3b8" }}>
              The people who need you most are often the ones who won't pay you.
            </span>
          </p>
        </div>

        {/* Pain cards — narrative style */}
        <div className="space-y-6">
          {PAINS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="relative flex flex-col md:flex-row md:items-center gap-8 p-8 rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.005]"
                style={{
                  background: p.bgColor,
                  border: `1px solid ${p.borderColor}`,
                }}
              >
                {/* Subtle number watermark */}
                <div
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[7rem] font-black leading-none select-none pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.025)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Icon */}
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: p.glowColor,
                    border: `1px solid ${p.borderColor}`,
                    color: p.color,
                    boxShadow: `0 0 24px ${p.glowColor}`,
                  }}
                >
                  <Icon size={26} />
                </div>

                {/* Story text */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-xl font-black mb-4"
                    style={{ color: "#f1f5f9" }}
                  >
                    {p.title}
                  </h3>
                  <div className="space-y-1">
                    {p.body.map((line, li) => (
                      <p
                        key={li}
                        className="text-base leading-relaxed"
                        style={{
                          color: li === p.body.length - 1 ? "#94a3b8" : "#64748b",
                          fontStyle: li === p.body.length - 1 ? "italic" : "normal",
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Stat — hard right on desktop */}
                <div
                  className="flex-shrink-0 text-center md:text-right md:min-w-[160px] pt-4 md:pt-0"
                  style={{ borderTop: `1px solid ${p.borderColor}` }}
                >
                  <div
                    className="text-3xl font-black leading-none mb-1"
                    style={{ color: p.color }}
                  >
                    {p.stat.value}
                  </div>
                  <div className="text-xs leading-snug" style={{ color: "#475569" }}>
                    {p.stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bridge line into next section */}
        <div className="mt-20 text-center">
          <p
            className="text-2xl md:text-3xl font-black tracking-tight"
            style={{ color: "#1e293b" }}
          >
            This is not bad luck.{" "}
            <span style={{ color: "#334155" }}>This is a broken system.</span>
          </p>
          <p className="mt-3 text-base" style={{ color: "#334155" }}>
            ProofPay was built to fix it — at the protocol level.
          </p>
        </div>
      </div>
    </section>
  );
}
