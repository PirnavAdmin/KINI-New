import { motion, useReducedMotion } from "framer-motion";
import { FiLock, FiArrowRight, FiShield, FiMail, FiLayers, FiLoader, FiCheckCircle, FiFileText, FiAlertTriangle } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.85)" : "#FFFFFF",
  border: dark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.1)",
  text: dark ? "#F8FAFC" : BRAND.primary,
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  divider: dark ? "rgba(255,255,255,0.08)" : "rgba(19,59,93,0.1)",
  panel: dark ? "rgba(255,255,255,0.03)" : "#F3F8FD",
});

// What happens after payment, as the enrollment workflow actually runs it.
// (Refund windows, lifetime access and certificates are not shown: no course
// record or policy in the app confirms them.)
const nextSteps = (organizationName, demoMode) => [
  { icon: FiShield, text: `${organizationName || "The institute"} reviews your request` },
  { icon: FiLayers, text: "Batch confirmed on approval" },
  { icon: FiMail, text: "Account activation link emailed after approval" },
  ...(demoMode ? [{ icon: FiAlertTriangle, text: "Demo mode: no money is charged" }] : []),
];

const OrderSummary = ({
  courseName = "",
  courseMeta = "",
  organizationName = "",
  courseThumbnail = "",
  originalPrice = 0,
  discountAmount = 0,
  finalPrice = 0,
  couponDiscount = 0,
  isLoading,
  isDisabled,
  ctaLabel = "Continue to Checkout",
  footnote = "By enrolling you agree to our Terms of Service.",
  demoMode = false,
  disabledHint = "",
  onSubmit,
  // [{ id, name, price }] — when more than one course is bought together, each
  // is listed with its price instead of the single-course preview.
  lines = [],
}) => {
  const { isDark } = useThemeContext();
  const reduceMotion = useReducedMotion();
  const theme = t(isDark);
  const totalSavings = discountAmount + couponDiscount;
  const effectivePrice = finalPrice - couponDiscount;
  const blocked = isDisabled || isLoading;

  return (
    <motion.aside
      aria-label="Order summary"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl"
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 18px 40px -24px rgba(19,59,93,0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 sm:px-6" style={{ borderBottom: `1px solid ${theme.divider}` }}>
        <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: theme.panel }}>
          <FiFileText aria-hidden="true" className="h-5 w-5" style={{ color: isDark ? "#93C5FD" : BRAND.secondary }} />
        </span>
        <h3 className="text-lg font-bold sm:text-xl" style={{ fontFamily: "'Sora', sans-serif", color: theme.text }}>
          Order Summary
        </h3>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        {lines.length > 1 ? (
          <ul className="space-y-2.5" aria-label="Courses in this payment">
            <li className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {lines.length} courses · one payment
            </li>
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium" style={{ color: theme.text }}>{line.name}</span>
                <span className="shrink-0 font-semibold tabular-nums" style={{ color: theme.text }}>{inr.format(line.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              {courseThumbnail ? (
                <img src={courseThumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.secondary}, #5B9BD5)` }}>
                  {String(courseName || "K").trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-semibold leading-snug" style={{ color: theme.text }}>{courseName}</p>
              {courseMeta && <p className="mt-0.5 text-sm" style={{ color: theme.textMuted }}>{courseMeta}</p>}
            </div>
          </div>
        )}

        {/* Pricing lines */}
        <dl className="space-y-2.5 border-t pt-4 text-[15px]" style={{ borderColor: theme.divider }}>
          <div className="flex items-center justify-between">
            <dt style={{ color: theme.textSecondary }}>{lines.length > 1 ? "Subtotal" : "Original Price"}</dt>
            <dd className="tabular-nums" style={{ color: theme.textSecondary }}>{inr.format(originalPrice)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt style={{ color: theme.textSecondary }}>Discount</dt>
            <dd className="font-semibold tabular-nums" style={{ color: "#0F9F8F" }}>- {inr.format(discountAmount)}</dd>
          </div>
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <dt style={{ color: theme.textSecondary }}>Coupon Discount</dt>
              <dd className="font-semibold tabular-nums" style={{ color: "#0F9F8F" }}>- {inr.format(couponDiscount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt style={{ color: theme.textSecondary }}>Taxes</dt>
            <dd style={{ color: theme.textSecondary }}>Included</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: theme.divider }}>
          <span className="text-lg font-bold" style={{ color: theme.text }}>Total</span>
          <span className="text-3xl font-bold tabular-nums" style={{ color: theme.text }}>{inr.format(effectivePrice)}</span>
        </div>

        {totalSavings > 0 && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(15,159,143,0.1)" }}>
            <FiCheckCircle aria-hidden="true" className="h-4 w-4 shrink-0" style={{ color: "#0F9F8F" }} />
            <span className="text-xs font-semibold" style={{ color: "#0B7D71" }}>You save {inr.format(totalSavings)}</span>
          </div>
        )}

        {/* What happens next */}
        <ul className="space-y-3 rounded-xl px-4 py-4" style={{ backgroundColor: theme.panel }} aria-label="What happens after payment">
          {nextSteps(organizationName, demoMode).map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm" style={{ color: theme.textSecondary }}>
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" style={{ color: isDark ? "#93C5FD" : BRAND.secondary }} />
              {text}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={blocked}
          className="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-bold transition-[background-color,transform,opacity] duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 disabled:translate-y-0 disabled:cursor-not-allowed motion-reduce:transition-none"
          style={{
            backgroundColor: BRAND.accent,
            color: "#FFFFFF",
            opacity: blocked && !isLoading ? 0.55 : 1,
            boxShadow: blocked ? "none" : "0 10px 22px -10px rgba(243,153,36,0.8)",
          }}
          onMouseEnter={(event) => { if (!blocked) event.currentTarget.style.backgroundColor = BRAND.accentHover; }}
          onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = BRAND.accent; }}
        >
          {isLoading ? (
            <>
              <FiLoader aria-hidden="true" className="h-5 w-5 animate-spin" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <FiLock aria-hidden="true" className="h-4 w-4" />
              <span>{ctaLabel}</span>
              <FiArrowRight aria-hidden="true" className="h-4 w-4" />
            </>
          )}
        </button>
        {isDisabled && !isLoading && disabledHint && (
          <p className="-mt-1 text-center text-xs" style={{ color: theme.textMuted }}>{disabledHint}</p>
        )}

        <p className="text-center text-xs leading-relaxed" style={{ color: theme.textMuted }}>{footnote}</p>
      </div>
    </motion.aside>
  );
};

export default OrderSummary;
