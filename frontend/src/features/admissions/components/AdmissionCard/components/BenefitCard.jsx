import { memo } from "react";
import { motion } from "framer-motion";

const ICON_MAP = {
  GraduationCap: (
    <path d="M22 10l-10-6-10 6 10 6 10-6z M6 12v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" />
  ),
  Users: (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />
  ),
  Briefcase: (
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16 M4 21h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  Target: (
    <circle cx="12" cy="12" r="10" />
  ),
  Award: (
    <path d="M12 15l-2 5 2-1 2 1-2-5z M8 21h8 M6 10c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z" />
  ),
  TrendingUp: (
    <path d="M23 6l-6 6-4-4-7 7 M17 6h6v6" />
  ),
};

// Static hover gradient classes — Tailwind can detect these at build time
const HOVER_STYLES = [
  "group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500",
  "group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500",
  "group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-teal-500",
  "group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500",
  "group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-green-500",
  "group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-500",
];

const ACCENT_LINE_STYLES = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-green-500",
  "from-rose-500 to-red-500",
];

const BenefitCard = memo(function BenefitCard({ benefit, index }) {
  const styleIndex = index % HOVER_STYLES.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950/40 p-5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-slate-600/40"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${ACCENT_LINE_STYLES[styleIndex]} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
      />

      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 border border-slate-700/50 transition-all duration-300 ${HOVER_STYLES[styleIndex]} group-hover:border-transparent group-hover:scale-110 group-hover:shadow-lg`}
        >
          <svg
            className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICON_MAP[benefit.icon]}
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
            {benefit.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1 group-hover:text-slate-400 transition-colors">
            {benefit.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

export default BenefitCard;
