"use client";

import { CheckCircle, DollarSign, Star, Users } from "lucide-react";

const STATS = [
  { value: "2,847",  label: "Freelancers Paid Instantly", icon: <Users size={22} />,       color: "#818cf8" },
  { value: "$1.2M+", label: "Total Value Secured",         icon: <DollarSign size={22} />,  color: "#34d399" },
  { value: "4,891",  label: "Jobs Completed On-Time",      icon: <CheckCircle size={22} />, color: "#c084fc" },
];

const TESTIMONIALS = [
  {
    quote: "I used to chase invoices for 3 months straight. ProofPay changed everything — I haven't had a late payment since I started using it.",
    author: "Sarah K.",
    role: "UI/UX Designer",
    jobs: "23 jobs · $38K secured",
  },
  {
    quote: "The auto-release saved me $4,200. My client went silent after I delivered. Payment came through automatically 48 hours later. Incredible.",
    author: "Marcus T.",
    role: "Smart Contract Developer",
    jobs: "61 jobs · $142K secured",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">

      {/* Background sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 50%, transparent 100%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            className="font-black tracking-tighter leading-none mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "#f1f5f9" }}
          >
            The numbers{" "}
            <span className="pp-gradient-text">speak loudly.</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Freelancers are already earning safely. Every day.
          </p>
        </div>

        {/* Big stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-10 px-6 rounded-3xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="mb-3" style={{ color: s.color }}>{s.icon}</div>
              <div
                className="font-black mb-1.5"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", color: s.color, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div className="text-sm font-semibold" style={{ color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="p-7 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>

              <p className="text-base leading-relaxed mb-5" style={{ color: "#cbd5e1" }}>
                "{t.quote}"
              </p>

              <div>
                <div className="text-sm font-bold text-white">
                  {t.author}{" "}
                  <span style={{ color: "#818cf8" }}>· {t.role}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{t.jobs}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
