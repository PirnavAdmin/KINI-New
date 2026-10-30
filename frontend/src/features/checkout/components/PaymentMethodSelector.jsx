import { motion } from "framer-motion";
import { FiSmartphone, FiCreditCard, FiGlobe, FiPocket } from "react-icons/fi";
import { PAYMENT_METHODS } from "@shared/data/mockData";

// Icon mapping per payment method id
const METHOD_ICONS = {
  upi: FiSmartphone,
  card_credit: FiCreditCard,
  card_debit: FiCreditCard,
  netbanking: FiGlobe,
  wallet: FiPocket,
};

/**
 * PaymentMethodSelector
 * Custom radio-card group for choosing a payment method. Fully
 * keyboard-accessible (radio inputs are visually hidden, not removed).
 *
 * @param {string} selected - currently selected method id
 * @param {function} onSelect - callback(id) when a method is chosen
 */
const PaymentMethodSelector = ({ selected, onSelect }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 shadow-xl shadow-black/20"
    >
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Select Payment Method</h3>

      <div role="radiogroup" aria-label="Payment methods" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = METHOD_ICONS[method.id] ?? FiCreditCard;
          const isActive = selected === method.id;

          return (
            <label
              key={method.id}
              className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "border-cyan-400/50 bg-cyan-400/[0.07] shadow-[0_0_0_1px_rgba(34,211,238,0.2)]"
                    : "border-white/10 bg-slate-900/30 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isActive}
                onChange={() => onSelect(method.id)}
                className="sr-only"
              />

              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-200"}`}>
                  {method.label}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{method.description}</p>
              </div>

              {/* Selection indicator */}
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200 ${
                  isActive ? "border-cyan-400 bg-cyan-400" : "border-slate-600"
                }`}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-slate-900"
                  />
                )}
              </div>
            </label>
          );
        })}
      </div>
    </motion.section>
  );
};

export default PaymentMethodSelector;
