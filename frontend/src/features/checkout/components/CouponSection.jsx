import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTag, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { VALID_COUPONS } from "@shared/data/mockData";
import { paymentApi } from "@shared/services/apiServices";

/**
 * CouponSection
 * Allows the student to enter and apply a coupon code. Validates against
 * a mock list of coupons and reports the resulting discount up to the
 * parent via `onApply` / `onRemove` so PriceBreakdown can recalculate.
 *
 * @param {function} onApply - callback(coupon) fired when a valid coupon is applied
 * @param {function} onRemove - callback() fired when the applied coupon is removed
 * @param {object|null} appliedCoupon - currently applied coupon, if any
 */
const CouponSection = ({ onApply, onRemove, appliedCoupon, amount }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setStatus("loading");
    setMessage("");

    try {
      const result = await paymentApi.validateCoupon({ couponCode: trimmed, amount });
      const valid = result?.valid ?? result?.isValid ?? result?.success ?? false;
      if (!valid) throw new Error(result?.message || "Invalid or expired coupon code");
      const discount = Number(result.discountAmount ?? result.discount ?? 0);
      setStatus("success");
      setMessage(result.message || "Coupon applied");
      onApply({ code: trimmed, type: "fixed", value: discount, label: result.message || `${discount} discount` });
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.message || error.message || "Invalid or expired coupon code");
    }
  };

  const handleRemove = () => {
    setCode("");
    setStatus("idle");
    setMessage("");
    onRemove();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiTag className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm sm:text-base font-semibold text-white">Have a coupon code?</h3>
      </div>

      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300 font-medium truncate">
              {appliedCoupon.code} applied — {appliedCoupon.label}
            </p>
          </div>
          <button
            onClick={handleRemove}
            aria-label="Remove coupon"
            className="text-emerald-300 hover:text-white transition-colors shrink-0 ml-2"
          >
            <FiX className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter coupon code"
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/60 transition-all uppercase"
            />
            <button
              onClick={handleApply}
              disabled={status === "loading" || !code.trim()}
              className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
            >
              {status === "loading" ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Animated feedback */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={status}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={`mt-2 text-xs font-medium flex items-center gap-1.5 ${
                  status === "success" ? "text-emerald-400" : "text-red-400"
                }`}
                role="alert"
              >
                {status === "success" ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Suggested coupons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(VALID_COUPONS).map((c) => (
              <button
                key={c}
                onClick={() => setCode(c)}
                className="text-[11px] font-medium text-slate-400 border border-white/10 rounded-full px-2.5 py-1 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
};

export default CouponSection;
