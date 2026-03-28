"use client";

import { ShieldCheck, Wallet } from "lucide-react";
import { useRef } from "react";
import FeaturesSection from "./FeaturesSection";
import FinalCTASection from "./FinalCTASection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import ProblemSection from "./ProblemSection";
import SocialProofSection from "./SocialProofSection";
import SolutionSection from "./SolutionSection";

interface LandingPageProps {
  onConnect: () => void;
}

export default function LandingPage({ onConnect }: LandingPageProps) {
  const howItWorksRef = useRef<HTMLElement>(null);

  const scrollToHow = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "#050508", color: "#f1f5f9" }}
    >
      {/* ── Sticky Navbar ─────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(5,5,8,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <ShieldCheck size={17} className="text-white" />
          </div>
          <span className="text-base font-black tracking-tight text-white">ProofPay</span>
        </div>

        {/* Nav CTA */}
        <button
          onClick={onConnect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 20px rgba(99,102,241,0.35)",
          }}
        >
          <Wallet size={14} />
          Connect Wallet
        </button>
      </nav>

      {/* ── Sections ──────────────────────────────────── */}
      <HeroSection onConnect={onConnect} onScrollToHow={scrollToHow} />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection ref={howItWorksRef} />
      <SocialProofSection />
      <FinalCTASection onConnect={onConnect} />
    </div>
  );
}
