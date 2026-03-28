"use client";

import { AlertTriangle, Clock, XCircle } from "lucide-react";

const PAINS = [
  {
    icon: <XCircle size={26} />,
    color: "#f87171",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    title: "Ghost Clients",
    body: "You ship the work. They vanish. No payment, no reply — just radio silence and a lesson learned the hard way.",
    footnote: "72 % of freelancers report unpaid invoices",
  },
  {
    icon: <Clock size={26} />,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.2)",
    title: "Endless Payment Delays",
    body: "Net-30. Net-60. Net-never. You're bankrolling their project with your own time while the invoice sits ignored.",
    footnote: "Average invoice delay: 45 days",
  },
  {
    icon: <AlertTriangle size={26} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    title: "Broken Promises",
    body: '"I\'ll pay when the project succeeds." You\'ve heard it before. No contract, no recourse, no money.',
    footnote: "Freelancers lose $50K+ over a career to bad clients",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)" }}
          >
            The Problem
          </span>
          <h2
            className="font-black tracking-tighter leading-none mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "#f1f5f9" }}
          >
            Freelancing is{" "}
            <span style={{ color: "#f87171" }}>fundamentally broken.</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
            The system is built for clients. You carry all the risk.
          </p>
        </div>

        {/* Pain cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PAINS.map((p) => (
            <div
              key={p.title}
              className="flex flex-col p-7 rounded-3xl transition-transform duration-200 hover:scale-[1.02]"
              style={{ background: p.bg, border: `1px solid ${p.border}` }}
            >
              <div className="mb-5" style={{ color: p.color }}>{p.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#94a3b8" }}>{p.body}</p>
              <div
                className="mt-5 pt-4 text-xs font-semibold"
                style={{ color: p.color, borderTop: `1px solid ${p.border}` }}
              >
                {p.footnote}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
