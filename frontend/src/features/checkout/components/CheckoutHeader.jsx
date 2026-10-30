import { motion } from "framer-motion";
import { FiShield, FiLock, FiCheckCircle } from "react-icons/fi";
import { CHECKOUT_STEPS } from "@shared/data/mockData";

/**
 * CheckoutHeader
 * Displays the main page heading, supporting copy, a horizontal progress
 * indicator for the checkout flow, and a row of quick trust signals.
 *
 * @param {number} currentStep - 1-indexed step that is currently active
 */
const CheckoutHeader = ({ currentStep = 2 }) => {
  return (
    <header className="w-full">
      {/* Heading block */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Secure Course{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            Enrollment
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto md:mx-0">
          You're one step away. Complete your details below to unlock{" "}
          <span className="text-slate-200 font-medium">instant access</span>{" "}
          to all course materials, live sessions, and your learning dashboard
          — the moment your payment is confirmed.
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-8 overflow-x-auto"
      >
        <ol className="flex items-center min-w-max sm:min-w-0 sm:justify-between gap-2 sm:gap-0">
          {CHECKOUT_STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <li key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Step circle */}
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-colors duration-300
                      ${
                        isCompleted
                          ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900"
                          : isActive
                          ? "bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                          : "bg-slate-800/80 border border-slate-700 text-slate-500"
                      }`}
                  >
                    {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : step.id}
                  </div>

                  {/* Step label */}
                  <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : isCompleted
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {idx < CHECKOUT_STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-3 sm:mx-4 min-w-[24px] sm:min-w-[40px] rounded-full transition-colors duration-300 ${
                      isCompleted ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-slate-800"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </motion.div>

      {/* Quick trust strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4"
      >
        {[
          { icon: FiLock, text: "256-bit SSL Secured" },
          { icon: FiShield, text: "RBI Compliant Gateway" },
          { icon: FiCheckCircle, text: "Verified by Pirnav Edutech" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
          >
            <Icon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] sm:text-xs text-slate-300 font-medium">{text}</span>
          </div>
        ))}
      </motion.div>
    </header>
  );
};

export default CheckoutHeader;
