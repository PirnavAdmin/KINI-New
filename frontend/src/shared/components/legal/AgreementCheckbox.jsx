import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#085FA7",
  secondary: "#5CA347",
};

const t = (dark) => ({
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  inputBg: dark ? "rgba(11,17,32,0.6)" : "rgba(255,255,255,0.8)",
  overlay: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
});

/**
 * AgreementCheckbox
 *
 * Props:
 *   register       → react-hook-form register (with { required: ... })
 *   error          → error message string
 *   onOpenTerms    → opens Terms modal
 *   onOpenPrivacy  → opens Privacy modal
 *   isDark         → from useThemeContext
 */
const AgreementCheckbox = ({
  register,
  error,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);
  const handleTermsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenTerms();
    }
  };

  const handlePrivacyKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenPrivacy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl p-4 sm:p-5 transition-colors duration-300"
      style={{
        border: `1px solid ${theme.borderLight}`,
        backgroundColor: theme.overlay,
      }}
    >
      <label
        htmlFor="agreeTerms"
        className="flex items-start gap-3 cursor-pointer group"
      >
        {/* Custom Checkbox */}
        <span className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            id="agreeTerms"
            type="checkbox"
            aria-label="I agree to the Terms & Conditions and Privacy Policy"
            aria-required="true"
            {...register}
            className="peer appearance-none w-5 h-5 rounded-lg border-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              borderColor: error ? "#F0765B" : theme.border,
              backgroundColor: error
                ? `${theme.borderLight}`
                : theme.inputBg,
            }}
            onMouseEnter={(e) => {
              if (!error)
                e.currentTarget.style.borderColor = BRAND.primary;
            }}
            onMouseLeave={(e) => {
              if (!error)
                e.currentTarget.style.borderColor = theme.border;
            }}
          />
          {/* Checked overlay */}
          <div
            className="absolute inset-0 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
            }}
          />
          <FiCheck
            className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200 z-10"
            aria-hidden="true"
          />
        </span>

        {/* Label */}
        <span
          className="text-xs sm:text-sm leading-relaxed transition-colors duration-200"
          style={{ color: theme.textSecondary }}
        >
          I agree to the{" "}            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenTerms();
              }}
            onKeyDown={handleTermsKeyDown}
            className="font-semibold underline-offset-2 hover:underline inline transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded"
            style={{
              color: BRAND.primary,
              textDecorationColor: `${BRAND.primary}4D`,
            }}
            aria-label="Open Terms & Conditions"
          >
            Terms &amp; Conditions
          </button>{" "}
          and{" "}            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenPrivacy();
              }}
            onKeyDown={handlePrivacyKeyDown}
            className="font-semibold underline-offset-2 hover:underline inline transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded"
            style={{
              color: BRAND.primary,
              textDecorationColor: `${BRAND.primary}4D`,
            }}
            aria-label="Open Privacy Policy"
          >
            Privacy Policy
          </button>
          <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </span>
      </label>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs font-medium flex items-center gap-1.5 pl-8"
          style={{ color: BRAND.coral || "#F0765B" }}
          role="alert"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default AgreementCheckbox;
