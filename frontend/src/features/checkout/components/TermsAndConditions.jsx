import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

/**
 * TermsAndConditions
 * Renders required and optional consent checkboxes. The "Terms" and
 * "Privacy Policy" checkboxes are required before payment can proceed;
 * "Receive Course Updates" is optional (marketing opt-in).
 *
 * @param {object} register - react-hook-form register function
 * @param {object} errors - react-hook-form formState.errors object
 */
const CheckboxItem = ({ id, label, register, error, required }) => (
  <div>
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <span className="relative flex items-center justify-center mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          {...register}
          className="peer appearance-none w-5 h-5 rounded-md border-2 border-white/20 bg-slate-900/50 checked:bg-gradient-to-br checked:from-cyan-400 checked:to-blue-500 checked:border-cyan-400 transition-all cursor-pointer focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-0"
        />
        <FiCheck className="absolute w-3.5 h-3.5 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
      </span>
      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
    {error && (
      <p role="alert" className="mt-1 ml-8 text-xs text-red-400 font-medium">
        {error}
      </p>
    )}
  </div>
);

const TermsAndConditions = ({ register, errors }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/20"
    >
      <div className="space-y-3.5">
        <CheckboxItem
          id="agreeTerms"
          label={
            <>
              I agree to the{" "}
              <a href="#" className="text-cyan-400 hover:underline font-medium">
                Terms &amp; Conditions
              </a>
            </>
          }
          required
          register={register("agreeTerms", { required: "You must accept the Terms & Conditions" })}
          error={errors.agreeTerms?.message}
        />

        <CheckboxItem
          id="agreePrivacy"
          label={
            <>
              I agree to the{" "}
              <a href="#" className="text-cyan-400 hover:underline font-medium">
                Privacy Policy
              </a>
            </>
          }
          required
          register={register("agreePrivacy", { required: "You must accept the Privacy Policy" })}
          error={errors.agreePrivacy?.message}
        />

        <CheckboxItem
          id="receiveUpdates"
          label="Send me course updates, offers, and learning tips via email"
          register={register("receiveUpdates")}
        />
      </div>
    </motion.section>
  );
};

export default TermsAndConditions;
