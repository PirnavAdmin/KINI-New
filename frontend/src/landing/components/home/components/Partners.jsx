import { motion } from "framer-motion";
import { useThemeContext } from "@landing-shared/context/ThemeContext";

const PARTNERS = [
  { name: "Pirnav Software Solutions" },
  { name: "IBM" },
  { name: "WIPRO" },
  { name: "DELOITTE" },
  { name: "ROBOXA" },
  { name: "ANDISO ROBOTICS" },
  { name: "COOPERWINDS" },
  { name: "RSSC Pvt Ltd" },
  { name: "CHEYRAT" },
  { name: "MISTIMINDS" },
  { name: "HONEYWELL" },
];

const TONES = [
  "from-[#4F46E5] to-[#818CF8]",
  "from-[#06B6D4] to-[#67E8F9]",
  "from-[#F97316] to-[#FBBF24]",
  "from-[#EC4899] to-[#F472B6]",
  "from-[#10B981] to-[#6EE7B7]",
  "from-[#8B5CF6] to-[#C4B5FD]",
];

function stripSuffix(name) {
  return name.replace(/\b(pvt\.?|private|ltd\.?|limited|inc\.?|llc|solutions?)\b/gi, "").trim();
}

function toInitials(name) {
  const words = stripSuffix(name).split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const word = words[0] || name;
  return word.slice(0, 2).toUpperCase();
}

function toTone(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

const PARTNER_MARKS = PARTNERS.map((partner) => ({
  ...partner,
  initials: toInitials(partner.name),
  tone: toTone(partner.name),
}));

function PartnerChip({ partner, isDark }) {
  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group flex flex-shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-extrabold text-white opacity-70 transition-opacity duration-300 group-hover:opacity-100 ${partner.tone}`}
        aria-hidden="true"
      >
        {partner.initials}
      </span>
      <span
        className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 sm:text-sm ${
          isDark
            ? "text-slate-400 group-hover:text-white"
            : "text-slate-400 group-hover:text-slate-900"
        }`}
      >
        {partner.name}
      </span>
    </motion.div>
  );
}

export default function Partners() {
  const { isDark } = useThemeContext();

  return (
    <section
      className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${
        isDark ? "bg-app-dark-gradient" : "bg-gradient-to-b from-white to-slate-50"
      }`}
    >
      {/* Scoped marquee keyframes — width-independent, loops on the track's own content width */}
      <style>{`
        @keyframes kini-partners-marquee {
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#4F46E5]/5 blur-[150px] pointer-events-none dark:bg-[#4F46E5]/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mb-12 text-center sm:mb-16"
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
              isDark
                ? "border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#818CF8]"
                : "border-[#4F46E5]/20 bg-[#4F46E5]/5 text-[#4F46E5]"
            }`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4F46E5]" />
            Our Partners
          </span>

          <h2
            className={`mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Trusted by Industry{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
              Leaders
            </span>
          </h2>

          <p className={`mx-auto mt-3 max-w-xl text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Our graduates have gone on to build careers at the world&apos;s most innovative companies.
          </p>
        </motion.div>

        {/* Glass Container */}
        <div
          className={`relative overflow-hidden rounded-2xl border ${
            isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white/50"
          }`}
        >
          {/* Fade Edges */}
          <div
            className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r to-transparent ${
              isDark ? "from-[#0F172A]" : "from-white"
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l to-transparent ${
              isDark ? "from-[#0F172A]" : "from-white"
            }`}
          />

          {/* Marquee Track */}
          <div className="flex overflow-hidden py-8 sm:py-10">
            <div
              className="flex w-max flex-shrink-0 items-center gap-5 sm:gap-6 [animation:kini-partners-marquee_28s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]"
            >
              {[...PARTNER_MARKS, ...PARTNER_MARKS].map((partner, index) => (
                <PartnerChip key={`${partner.name}-${index}`} partner={partner} isDark={isDark} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="mt-6 text-center"
        >
          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <span className="font-semibold text-[#4F46E5]">500+</span> hiring partners •{" "}
            <span className="font-semibold text-[#4F46E5]">95%</span> placement rate
          </p>
        </motion.div>
      </div>
    </section>
  );
}