import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  logoColor: dark ? "#475569" : "#94A3B8",
  logoHover: dark ? "#CBD5E1" : "#475569",
  bgGradFrom: "#050816",
  bgGradTo: "transparent",
});

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Infosys", "Accenture",
  "TCS", "Capgemini", "Wipro", "Deloitte", "Salesforce",
  "Razorpay", "PhonePe",
];

const TrustLogos = () => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);
  const doubled = [...COMPANIES, ...COMPANIES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden transition-colors duration-300"
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
          Our Graduates Work At
        </p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
          style={{
            background: `linear-gradient(90deg, ${isDark ? "#050816" : "#F1F5F9"}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
          style={{
            background: `linear-gradient(270deg, ${isDark ? "#050816" : "#F1F5F9"}, transparent)`,
          }}
        />

        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {doubled.map((company, idx) => (
            <div
              key={`${company}-${idx}`}
              className="shrink-0 text-sm sm:text-base font-bold tracking-wide uppercase transition-colors duration-300"
              style={{ color: theme.logoColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.logoHover}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.logoColor}
            >
              {company}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-4 mt-6 pt-5"
        style={{ borderTop: `1px solid ${theme.borderLight}` }}
      >
        {[
          { value: "18,642+", label: "Students Trained" },
          { value: "4.8★", label: "Average Rating" },
          { value: "96%", label: "Completion Rate" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-lg sm:text-xl font-bold" style={{ color: theme.text }}>{stat.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustLogos;
