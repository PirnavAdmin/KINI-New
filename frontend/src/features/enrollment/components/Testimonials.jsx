import { motion } from "framer-motion";
import { FiStar, FiMessageSquare } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { testimonials } from "@features/home/data/homeData";
import { BRAND } from "../theme";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  testimonialBg: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
});

const Testimonials = () => {
  const { isDark } = useThemeContext();
  const doubled = [...testimonials, ...testimonials];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden transition-colors duration-300"
      style={{
        border: `1px solid ${t(isDark).border}`,
        backgroundColor: t(isDark).card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.secondary}33)`,
            borderColor: `${BRAND.primary}33`,
          }}
        >
          <FiMessageSquare className="w-5 h-5" style={{ color: BRAND.primary }} />
        </div>
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ fontFamily: "'Sora', sans-serif", color: t(isDark).text }}
          >
            What Our Students Say
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: t(isDark).textMuted }}>Real reviews from enrolled students</p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10"
          style={{
            background: `linear-gradient(90deg, ${isDark ? "#050816" : "#F1F5F9"}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10"
          style={{
            background: `linear-gradient(270deg, ${isDark ? "#050816" : "#F1F5F9"}, transparent)`,
          }}
        />

        <motion.div
          className="flex gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {doubled.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="shrink-0 w-[280px] sm:w-[320px] rounded-2xl p-5 transition-colors group cursor-default"
              style={{
                border: `1px solid ${t(isDark).borderLight}`,
                backgroundColor: t(isDark).testimonialBg,
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <FiStar key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review */}
              <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300" style={{ color: t(isDark).textSecondary }}>
                "{item.text}"
              </p>

              {/* Author */}
              <div
                className="flex items-center gap-3 mt-4 pt-3"
                style={{ borderTop: `1px solid ${t(isDark).borderLight}` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                  }}
                >
                  {item.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: t(isDark).text }}>{item.name}</p>
                  <p className="text-[11px] truncate" style={{ color: t(isDark).textDim }}>{item.role} at {item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Testimonials;
