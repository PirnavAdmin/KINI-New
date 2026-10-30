import { motion } from "framer-motion";
import { FiCheckCircle, FiClock, FiAward, FiDownload, FiBriefcase, FiHeart, FiUsers, FiGlobe, FiMonitor, FiFileText, FiStar } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  overlay: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
  benefitBg: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
});

const BENEFITS = [
  { icon: FiClock, title: "Lifetime Access", gradient: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` },
  { icon: FiAward, title: "Certificate Included", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  { icon: FiDownload, title: "Downloadable Resources", gradient: "linear-gradient(135deg, #06B6D4, #133B5D)" },
  { icon: FiBriefcase, title: "Placement Support", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  { icon: FiHeart, title: "Job Assistance", gradient: "linear-gradient(135deg, #F43F5E, #E11D48)" },
  { icon: FiUsers, title: "Mentor Sessions", gradient: "linear-gradient(135deg, #6366F1, #133B5D)" },
  { icon: FiGlobe, title: "Community Access", gradient: "linear-gradient(135deg, #0EA5E9, #0284C7)" },
  { icon: FiMonitor, title: "Live Sessions", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  { icon: FiFileText, title: "Resume Building", gradient: `linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.accent})` },
  { icon: FiStar, title: "Interview Preparation", gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)" },
  { icon: FiCheckCircle, title: "Industry Projects", gradient: "linear-gradient(135deg, #14B8A6, #0D9488)" },
];

const BenefitsSection = () => {
  const { isDark } = useThemeContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl p-5 sm:p-7 shadow-xl transition-colors duration-300"
      style={{
        border: `1px solid ${t(isDark).border}`,
        backgroundColor: t(isDark).card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.secondary}33)`,
            borderColor: `${BRAND.primary}33`,
          }}
        >
          <FiStar className="w-5 h-5" style={{ color: BRAND.primary }} />
        </div>
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ fontFamily: "'Sora', sans-serif", color: t(isDark).text }}
          >
            Why You'll Love This Program
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: t(isDark).textMuted }}>Everything you get when you enroll today</p>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BENEFITS.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative rounded-2xl p-4 transition-all duration-300 cursor-default"
              style={{
                border: `1px solid ${t(isDark).borderLight}`,
                backgroundColor: t(isDark).benefitBg,
              }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.primary}0D, ${BRAND.secondary}0D)`,
                }}
              />

              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3"
                style={{ background: benefit.gradient }}
              >
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-tight" style={{ color: t(isDark).text }}>
                {benefit.title}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BenefitsSection;
