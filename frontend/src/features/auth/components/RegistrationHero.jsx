import { motion } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import GrainOverlay from "./GrainOverlay";
import GlowOrb from "./GlowOrb";
import StatsSection from "./StatsSection";

const TRUST_POINTS = [
  "Enterprise-grade security & compliance",
  "AI-powered workforce analytics",
  "24/7 dedicated support team",
];

const AVATARS = ["AK", "SR", "MJ", "PL", "TD"];

/**
 * RegistrationHero — Optimized left panel with headline, trust points, and social proof.
 * Fits within the viewport per the spec (px-12 py-10, reduced headline, tighter spacing).
 */
export default function RegistrationHero({ isDark }) {
  return (
    <div
      className={`relative w-full lg:w-[48%] shrink-0 flex flex-col overflow-hidden ${
        isDark
          ? "bg-[#020617]"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #1E3A8A 0%, #5B21B6 40%, #9D174D 70%, #020617 100%)"
            : "linear-gradient(160deg, #dbeafe 0%, #e9d5ff 35%, #fce7f3 65%, #f8fafc 100%)",
        }}
      />
      {isDark ? (
        <>
          <GlowOrb className="-top-24 -left-24" size="400px" color1="rgba(59,130,246,0.12)" color2="transparent" />
          <GlowOrb className="-bottom-32 -right-16" size="300px" color1="rgba(139,92,246,0.10)" color2="transparent" />
        </>
      ) : (
        <>
          <GlowOrb className="-top-24 -left-24" size="400px" color1="rgba(59,130,246,0.06)" color2="transparent" />
          <GlowOrb className="-bottom-32 -right-16" size="300px" color1="rgba(139,92,246,0.05)" color2="transparent" />
        </>
      )}
      <GrainOverlay isDark={isDark} />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? "bg-gradient-to-b from-black/30 via-transparent to-black/60"
            : "bg-gradient-to-b from-white/40 via-transparent to-white/60"
        }`}
      />

      {/* Content — optimized per spec: px-12 py-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-12 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <span className={`font-bold tracking-tight text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
            Kini
            <span className={isDark ? "text-white/50" : "text-slate-400"}>EduHub</span>
          </span>
        </motion.div>

        {/* Badge — mb-6 per spec */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className={`self-start inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border backdrop-blur-sm mb-6 ${
            isDark
              ? "bg-white/[0.06] text-white/70 border-white/[0.08]"
              : "bg-white/60 text-blue-700 border-blue-200 shadow-sm"
          }`}
        >
          <Zap className={`w-3 h-3 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
          Enterprise HRMS Platform
        </motion.span>

        {/* Headline — text-6xl / [72px] per spec, mb-5 */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[0.95] tracking-tight max-w-[14ch] mb-5"
        >
          <span className={isDark ? "text-white" : "text-slate-900"}>
            Start your{" "}
          </span>
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            journey
          </span>{" "}
          <span className={isDark ? "text-white" : "text-slate-900"}>
            with Kini EduHub
          </span>
        </motion.h1>

        {/* Subtext — max-w-[520px], 3 lines, leading-relaxed per spec */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className={`text-sm leading-relaxed max-w-[520px] line-clamp-3 ${
            isDark ? "text-white/50" : "text-slate-500"
          }`}
        >
          Join thousands of organizations using Kini EduHub to manage their
          workforce, streamline operations, and unlock AI-powered insights.
        </motion.p>

        {/* Trust points — space-y-3, w-5 h-5 icons, text-[18px] per spec */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-3 mt-5"
        >
          {TRUST_POINTS.map((pt) => (
            <div
              key={pt}
              className={`flex items-center gap-3 ${
                isDark ? "text-white/50" : "text-slate-500"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 shrink-0 ${
                  isDark ? "text-blue-400/60" : "text-blue-500"
                }`}
              />
              <span className="text-[18px] leading-snug">{pt}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats section — mt-8 per spec, hidden on mobile per spec */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="mt-8 hidden lg:block"
        >
          <StatsSection isDark={isDark} avatars={AVATARS} />
        </motion.div>
      </div>
    </div>
  );
}
