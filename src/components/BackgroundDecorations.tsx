import React from "react";
import { BackgroundTheme } from "../types";

interface BackgroundDecorationsProps {
  theme: BackgroundTheme;
}

export const BackgroundDecorations: React.FC<BackgroundDecorationsProps> = ({
  theme
}) => {
  if (theme === "midnight") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-950 transition-colors duration-700"
      >
        {/* Constellation & grid pattern */}
        <div className="absolute inset-0 bg-midnight-dots opacity-40" />

        {/* Ambient deep celestial glows */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[120px] animate-ambient-glow" />
        <div className="absolute top-1/4 -right-40 w-[550px] h-[550px] rounded-full bg-violet-900/25 blur-[130px] animate-ambient-glow-delayed" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-blue-950/40 blur-[140px]" />

        {/* Subtle geometric circles */}
        <svg
          className="absolute top-12 right-12 w-96 h-96 opacity-10 text-indigo-400"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="80" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="55" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="30" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="100" y1="10" x2="100" y2="190" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="10" y1="100" x2="190" y2="100" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      </div>
    );
  }

  if (theme === "aurora") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/30 to-violet-50/40 transition-colors duration-700"
      >
        {/* Architectural grid */}
        <div className="absolute inset-0 bg-study-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" />

        {/* Vivid yet soft aurora light blooms */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-200/50 to-teal-200/40 blur-[100px] animate-ambient-glow" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-violet-200/50 to-pink-200/30 blur-[110px] animate-ambient-glow-delayed" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-200/40 to-indigo-200/40 blur-[100px]" />

        {/* Decorative academic geometry */}
        <svg
          className="absolute top-20 left-10 w-72 h-72 opacity-[0.06] text-indigo-700"
          viewBox="0 0 160 160"
          fill="none"
          stroke="currentColor"
        >
          <polygon points="80,15 145,130 15,130" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="80" cy="90" r="38" strokeWidth="1" />
        </svg>

        <svg
          className="absolute bottom-20 right-10 w-80 h-80 opacity-[0.05] text-violet-700"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <rect x="30" y="30" width="140" height="140" rx="20" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="50" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (theme === "warm-notebook") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#faf8f5] transition-colors duration-700"
      >
        {/* Notebook grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-70" />

        {/* Warm study ambiance glow */}
        <div className="absolute -top-32 left-1/3 w-[650px] h-[500px] rounded-full bg-amber-100/60 blur-[100px] animate-ambient-glow" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-orange-100/50 blur-[110px] animate-ambient-glow-delayed" />
        <div className="absolute -bottom-24 left-10 w-[450px] h-[450px] rounded-full bg-stone-200/40 blur-[90px]" />

        {/* Red notebook margin line accent on extreme left */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-12 w-[1.5px] bg-rose-300/30 hidden lg:block" />

        {/* Subtle compass rings */}
        <svg
          className="absolute top-28 right-16 w-80 h-80 opacity-[0.06] text-amber-900"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="75" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="45" strokeWidth="1" />
          <line x1="20" y1="100" x2="180" y2="100" strokeWidth="0.8" />
          <line x1="100" y1="20" x2="100" y2="180" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // Default: "modern-grid" (High-craft Architectural Studio)
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50/95 transition-colors duration-700"
    >
      {/* Precision architectural dot matrix */}
      <div className="absolute inset-0 bg-study-dots opacity-80 [mask-image:radial-gradient(ellipse_at_top,black_60%,transparent_95%)]" />

      {/* Modern top subtle grid accent */}
      <div className="absolute inset-0 bg-study-grid opacity-35" />

      {/* Atmospheric focal glow at top center (like an elegant studio softbox light) */}
      <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[850px] h-[480px] rounded-full bg-gradient-to-b from-indigo-100/70 via-indigo-50/30 to-transparent blur-[90px] animate-ambient-glow" />

      {/* Secondary gentle corner glows */}
      <div className="absolute top-1/4 -left-32 w-[450px] h-[450px] rounded-full bg-blue-100/40 blur-[100px]" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-violet-100/35 blur-[110px] animate-ambient-glow-delayed" />
      <div className="absolute -bottom-32 left-1/4 w-[600px] h-[400px] rounded-full bg-slate-200/40 blur-[110px]" />

      {/* Elegant geometric line art: study compass & coordinates */}
      <svg
        className="absolute top-14 left-8 sm:left-16 w-64 h-64 opacity-[0.07] text-indigo-800"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="60" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="30" strokeWidth="0.75" strokeDasharray="2 2" />
        <line x1="100" y1="5" x2="100" y2="195" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="5" y1="100" x2="195" y2="100" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>

      <svg
        className="absolute top-36 right-8 sm:right-16 w-72 h-72 opacity-[0.06] text-slate-700"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <rect x="25" y="25" width="150" height="150" rx="16" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="25" y1="25" x2="175" y2="175" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="40" strokeWidth="0.75" />
      </svg>

      {/* Vignette border frame at edges for photographic depth */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-200/20" />
    </div>
  );
};
