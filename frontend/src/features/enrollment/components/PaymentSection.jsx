import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCreditCard, FiSmartphone, FiGlobe, FiPocket, FiShield } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { PAYMENT_METHODS } from "@shared/data/mockData";
import { BRAND } from "../theme";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  inputBg: dark ? "rgba(11,17,32,0.6)" : "rgba(255,255,255,0.8)",
  tabBg: dark ? "rgba(11,17,32,0.4)" : "rgba(255,255,255,0.6)",
  iconBg: dark ? "rgba(30,41,59,0.8)" : "rgba(226,232,240,0.8)",
});

const METHOD_ICONS = {
  upi: FiSmartphone,
  card_credit: FiCreditCard,
  card_debit: FiCreditCard,
  netbanking: FiGlobe,
  wallet: FiPocket,
};

const METHOD_BADGES = {
  upi: "Fastest",
};

const UPI_APPS = [
  { name: "Google Pay", icon: "G", gradient: `linear-gradient(135deg, #6366F1, #133B5D)` },
  { name: "PhonePe", icon: "P", gradient: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` },
  { name: "Paytm", icon: "T", gradient: "linear-gradient(135deg, #06B6D4, #133B5D)" },
  { name: "BHIM", icon: "B", gradient: "linear-gradient(135deg, #10B981, #059669)" },
];

// demoMode: the demo gateway needs no card or UPI details, so those inputs are hidden.
const PaymentSection = ({ selected, onSelect, upiApp = null, onSelectUpiApp, demoMode = false }) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);
  const [cardFocused, setCardFocused] = useState(null);
  const [cardValues, setCardValues] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const formatCardNumber = (val) => {
    const v = val.replace(/\D/g, "").slice(0, 16);
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) return v.slice(0, 2) + "/" + v.slice(2);
    return v;
  };

  const isCardSelected = !demoMode && (selected === "card_credit" || selected === "card_debit");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-3xl p-5 sm:p-7 shadow-xl transition-colors duration-300"
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
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
          <FiCreditCard className="w-5 h-5" style={{ color: BRAND.primary }} />
        </div>
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ fontFamily: "'Sora', sans-serif", color: theme.text }}
          >
            Payment Method
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Choose your preferred payment option</p>
        </div>
      </div>

      {/* Payment tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = METHOD_ICONS[method.id] ?? FiCreditCard;
          const isActive = selected === method.id;
          const badge = METHOD_BADGES[method.id];

          return (
            <button
              key={method.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(method.id)}
              className="relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 transition-all duration-200 text-center"
              style={{
                borderColor: isActive ? `${BRAND.primary}80` : theme.borderLight,
                backgroundColor: isActive ? `${BRAND.primary}12` : theme.tabBg,
              }}
            >
              {badge && (
                <span
                  className="absolute -top-2 right-2 text-[9px] font-bold uppercase rounded-full px-2 py-0.5"
                  style={{
                    color: BRAND.secondary,
                    backgroundColor: `${BRAND.secondary}26`,
                    border: `1px solid ${BRAND.secondary}40`,
                  }}
                >
                  {badge}
                </span>
              )}
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`
                    : theme.iconBg,
                  color: isActive ? "#fff" : theme.textMuted,
                  boxShadow: isActive ? `0 4px 12px ${BRAND.primary}40` : "none",
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className="text-[11px] font-semibold leading-tight"
                style={{ color: isActive ? theme.text : theme.textMuted }}
              >
                {method.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card details */}
      <AnimatePresence>
        {isCardSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>Card Number</label>
                <input
                  type="text"
                  value={cardValues.number}
                  onChange={(e) => setCardValues({ ...cardValues, number: formatCardNumber(e.target.value) })}
                  onFocus={() => setCardFocused("number")}
                  onBlur={() => setCardFocused(null)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                  style={{
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${cardFocused === "number" ? `${BRAND.primary}80` : theme.borderLight}`,
                    color: theme.text,
                    boxShadow: cardFocused === "number" ? `0 0 0 3px ${BRAND.primary}1A` : "none",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>Expiry</label>
                  <input
                    type="text"
                    value={cardValues.expiry}
                    onChange={(e) => setCardValues({ ...cardValues, expiry: formatExpiry(e.target.value) })}
                    onFocus={() => setCardFocused("expiry")}
                    onBlur={() => setCardFocused(null)}
                    placeholder="MM/YY"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${cardFocused === "expiry" ? `${BRAND.primary}80` : theme.borderLight}`,
                      color: theme.text,
                      boxShadow: cardFocused === "expiry" ? `0 0 0 3px ${BRAND.primary}1A` : "none",
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>CVV</label>
                  <input
                    type="password"
                    value={cardValues.cvv}
                    onChange={(e) => setCardValues({ ...cardValues, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    onFocus={() => setCardFocused("cvv")}
                    onBlur={() => setCardFocused(null)}
                    placeholder="***"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${cardFocused === "cvv" ? `${BRAND.primary}80` : theme.borderLight}`,
                      color: theme.text,
                      boxShadow: cardFocused === "cvv" ? `0 0 0 3px ${BRAND.primary}1A` : "none",
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>Name on Card</label>
                  <input
                    type="text"
                    value={cardValues.name}
                    onChange={(e) => setCardValues({ ...cardValues, name: e.target.value })}
                    onFocus={() => setCardFocused("name")}
                    onBlur={() => setCardFocused(null)}
                    placeholder="Full Name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${cardFocused === "name" ? `${BRAND.primary}80` : theme.borderLight}`,
                      color: theme.text,
                      boxShadow: cardFocused === "name" ? `0 0 0 3px ${BRAND.primary}1A` : "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI quick select */}
      <AnimatePresence>
        {selected === "upi" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: theme.textMuted }}>Quick Pay with</p>
              <div className="grid grid-cols-4 gap-3">
                {UPI_APPS.map((app) => {
                  const appActive = upiApp === app.name;
                  return (
                  <button
                    key={app.name}
                    type="button"
                    aria-pressed={appActive}
                    onClick={() => onSelectUpiApp?.(appActive ? null : app.name)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all group"
                    style={{
                      border: `1px solid ${appActive ? `${BRAND.primary}80` : theme.borderLight}`,
                      backgroundColor: appActive ? `${BRAND.primary}12` : theme.tabBg,
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-sm"
                      style={{ background: app.gradient }}
                    >
                      {app.icon}
                    </div>
                    <span className="text-[10px] transition-colors" style={{ color: appActive ? theme.text : theme.textMuted }}>{app.name}</span>
                  </button>
                  );
                })}
              </div>
              {!demoMode && <div className="mt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] mb-1.5" style={{ color: theme.textMuted }}>Or enter UPI ID</label>
                <input
                  type="text"
                  placeholder="username@upi"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    color: theme.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `${BRAND.primary}80`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND.primary}1A`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.borderLight;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {demoMode && (
        <p className="mt-4 text-xs" style={{ color: theme.textMuted }}>
          Demo mode: no card, bank or UPI details are needed. You choose the payment outcome in the next step.
        </p>
      )}

      {/* Secure notice */}
      <div
        className="mt-4 flex items-center gap-2 text-[11px] pt-4 transition-colors duration-300"
        style={{
          color: theme.textDim,
          borderTop: `1px solid ${theme.borderLight}`,
        }}
      >
        <FiShield className="w-3.5 h-3.5" style={{ color: BRAND.secondary }} />
        <span>{demoMode ? "Test transaction only. No payment provider is contacted." : "PCI-DSS compliant. Your payment info is encrypted with 256-bit SSL."}</span>
      </div>
    </motion.div>
  );
};

export default PaymentSection;
