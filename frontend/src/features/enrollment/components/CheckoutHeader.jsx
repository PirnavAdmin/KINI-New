import { motion } from "framer-motion";
import { FiArrowLeft, FiLock, FiShield, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Complete" },
];


const t = (dark) => ({
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  borderLight: dark ? "rgba(51,65,85,0.6)" : "rgba(0,0,0,0.1)",
  surface: dark ? "#0B1120" : "#FFFFFF",
  bgInactive: dark ? "rgba(30,41,59,0.6)" : "rgba(226,232,240,0.8)",
});

// Only claims the app can stand behind: no PCI or encryption-strength
// certifications are asserted here.
const trustItems = (demoMode) => [
  { icon: FiLock, text: "Secure checkout" },
  { icon: FiCheckCircle, text: "Verified by KINI Edutech" },
  { icon: FiShield, text: "Access only after institute approval" },
  ...(demoMode ? [{ icon: FiAlertTriangle, text: "Demo mode — no real payment", tone: "warning" }] : []),
];

const CheckoutHeader = ({ currentStep = 1, demoMode = false }) => {
  const navigate = useNavigate();
  const { isDark } = useThemeContext();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Back + Breadcrumb row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-colors group"
          style={{ color: t(isDark).textMuted }}
          onMouseEnter={(e) => e.currentTarget.style.color = t(isDark).text}
          onMouseLeave={(e) => e.currentTarget.style.color = t(isDark).textMuted}
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm" style={{ color: t(isDark).textMuted }}>
          <Link to="/" className="transition-colors hover:underline underline-offset-4" style={{ color: t(isDark).textMuted }}>Home</Link>
          <span aria-hidden="true" style={{ color: t(isDark).textDim }}>/</span>
          <Link to="/courses" className="transition-colors hover:underline underline-offset-4" style={{ color: t(isDark).textMuted }}>Courses</Link>
          <span aria-hidden="true" style={{ color: t(isDark).textDim }}>/</span>
          <span aria-current="page" className="font-semibold" style={{ color: isDark ? "#93C5FD" : BRAND.primary }}>Checkout</span>
        </nav>

        <div className="flex items-center gap-3 text-xs" style={{ color: t(isDark).textSecondary }}>
          <span className="inline-flex items-center gap-1.5">
            <FiLock className="w-3.5 h-3.5" style={{ color: BRAND.secondary }} />
            <span className="hidden sm:inline">Secure checkout</span>
          </span>
          <span aria-hidden="true" className="hidden h-4 w-px sm:block" style={{ backgroundColor: t(isDark).borderLight }} />
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <FiShield className="w-3.5 h-3.5" style={{ color: BRAND.secondary }} />
            Verified by KINI Edutech
          </span>
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "'Sora', sans-serif", color: isDark ? t(isDark).text : BRAND.primary }}
        >
          Secure Your{" "}
          <span style={{ color: BRAND.accent }}>Enrollment</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: t(isDark).textSecondary }}>
          You're one step away from unlocking instant access to all course materials,
          live sessions, projects, and your learning dashboard.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-5">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all duration-500`}
                    aria-current={isActive ? "step" : undefined}
                    style={{
                      background: isCompleted ? BRAND.primary : isActive ? t(isDark).surface : t(isDark).bgInactive,
                      border: isActive ? `2px solid ${BRAND.primary}` : `1px solid ${t(isDark).borderLight}`,
                      color: isCompleted ? "#fff" : isActive ? BRAND.primary : t(isDark).textDim,
                      boxShadow: isActive ? `0 0 0 4px ${BRAND.primary}14` : "none",
                    }}
                  >
                    {isCompleted ? (
                      <FiCheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? "" : "hidden sm:inline"}`}
                    style={{
                      color: isActive ? (isDark ? t(isDark).text : BRAND.primary) : isCompleted ? BRAND.secondary : t(isDark).textDim,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className="h-[2px] flex-1 mx-3 sm:mx-4 min-w-[24px] sm:min-w-[48px] rounded-full transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? BRAND.primary
                        : isActive
                        ? `linear-gradient(90deg, ${BRAND.secondary} 0 50%, ${t(isDark).bgInactive} 50% 100%)`
                        : t(isDark).bgInactive,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        {trustItems(demoMode).map(({ icon: Icon, text, tone }) => (
          <div
            key={text}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
            style={{
              border: `1px solid ${tone === "warning" ? `${BRAND.accent}66` : isDark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.14)"}`,
              backgroundColor: tone === "warning" ? `${BRAND.accent}1A` : isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: tone === "warning" ? BRAND.accentHover : BRAND.secondary }} />
            <span className="text-xs font-medium" style={{ color: tone === "warning" ? "#8A4B00" : t(isDark).textSecondary }}>{text}</span>
          </div>
        ))}
      </motion.div>
    </motion.header>
  );
};

export default CheckoutHeader;
