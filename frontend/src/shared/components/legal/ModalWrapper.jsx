import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#085FA7",
  secondary: "#5CA347",
  mint: "#7DD3B2",
  coral: "#F0765B",
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

const t = (dark) => ({
  backdrop: dark ? "rgba(0,0,0,0.6)" : "rgba(15,23,42,0.4)",
  surface: dark ? "rgba(11,17,32,0.92)" : "rgba(255,255,255,0.96)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  separator: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  iconBg: dark ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.8)",
  hoverBg: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
});

/**
 * ModalWrapper — Glassmorphism modal with framer-motion
 *
 * Props:
 *   open         → Boolean visibility
 *   onClose      → Close handler
 *   icon         → React icon component for the header
 *   title        → Modal title
 *   subtitle     → Modal subtitle
 *   children     → Scrollable body content
 *   footer       → Optional sticky footer content
 *   maxWidth     → Max width (default: "720px")
 */
export default function ModalWrapper({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "720px",
}) {
  const { isDark } = useThemeContext();
  const theme = t(isDark);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-md"
            style={{ backgroundColor: theme.backdrop }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full flex flex-col overflow-hidden shadow-2xl"
            style={{
              maxWidth,
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              maxHeight: "calc(100vh - 48px)",
              boxShadow: isDark
                ? "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset"
                : "0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
          >
            {/* Sticky Header */}
            <div
              className="shrink-0 flex items-start gap-4 p-6 sm:p-8 pb-5"
              style={{ borderBottom: `1px solid ${theme.separator}` }}
            >
              {Icon && (
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}1A, ${BRAND.secondary}1A)`,
                    border: `1px solid ${BRAND.primary}26`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: BRAND.primary }} />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-2">
                <h2
                  className="text-lg sm:text-xl font-bold leading-snug"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    color: theme.text,
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ color: theme.textDim }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto px-6 sm:px-8 py-5"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "rgba(255,255,255,0.1) transparent" : "rgba(0,0,0,0.1) transparent",
              }}
            >
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div
                className="shrink-0 px-6 sm:px-8 py-4 sm:py-5"
                style={{ borderTop: `1px solid ${theme.separator}` }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
