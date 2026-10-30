import { motion } from "framer-motion";
import { FiLock, FiLoader, FiArrowRight } from "react-icons/fi";

/**
 * PaymentButton
 * Large CTA that triggers the payment flow. Shows the final payable
 * amount, a loading spinner while the payment order is being created,
 * and disables itself until prerequisites (terms accepted, form valid)
 * are met.
 *
 * @param {function} onClick - handler to initiate payment
 * @param {boolean} isLoading - true while creating the payment order
 * @param {boolean} disabled - true if the form/terms are incomplete
 * @param {string} amountLabel - formatted final amount, e.g. "₹47,200"
 */
const PaymentButton = ({ onClick, isLoading, disabled, amountLabel }) => {
  return (
    <div className="sticky bottom-0 sm:static pt-2">
      <motion.button
        type="submit"
        onClick={onClick}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        className={`relative w-full overflow-hidden rounded-2xl px-6 py-4 sm:py-5 font-semibold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-300
          ${
            disabled || isLoading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-cyan-400/30"
          }`}
      >
        {/* Animated shimmer overlay on hover (only when active) */}
        {!disabled && !isLoading && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />
        )}

        {isLoading ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FiLock className="w-5 h-5" />
            <span>Proceed to Payment</span>
            {amountLabel && (
              <span className="font-bold border-l border-white/30 pl-3 ml-1">{amountLabel}</span>
            )}
            <FiArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        By proceeding, your payment will be securely processed via our PCI-DSS compliant gateway.
      </p>
    </div>
  );
};

export default PaymentButton;
