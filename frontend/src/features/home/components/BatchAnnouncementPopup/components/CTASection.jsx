import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaStar } from "react-icons/fa";

const ShineButton = memo(({ children, onClick, icon: Icon, variant = "primary" }) => {
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className="group relative flex-1 inline-flex items-center justify-center gap-2.5 h-16 sm:h-[60px] px-6 rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#2563EB] to-[#0EA5E9] text-white text-[clamp(0.875rem,1.1vw,1rem)] font-bold shadow-[0_8px_28px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
        aria-label="Enroll Now"
      >
        {/* Shine sweep */}
        <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.2)_50%,transparent_70%)] bg-[length:200%_100%] group-hover:animate-[shine_0.8s_ease-out] pointer-events-none" />
        {/* Subtle top border glow */}
        <span className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="relative z-10">{children}</span>
        {Icon && (
          <Icon className="relative z-10 text-sm group-hover:translate-x-0.5 transition-transform" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative flex-1 inline-flex items-center justify-center gap-2.5 h-16 sm:h-[60px] px-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 text-[clamp(0.875rem,1.1vw,1rem)] font-semibold hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 hover:text-[#2563EB] active:bg-[#2563EB]/10 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
      aria-label="Book Free Consultation"
    >
      {/* Hover glow */}
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2563EB]/0 to-[#0EA5E9]/0 group-hover:from-[#2563EB]/[0.02] group-hover:to-[#0EA5E9]/[0.02] transition-all duration-200 pointer-events-none" />
      {Icon && <Icon className="relative z-10 text-amber-400 group-hover:scale-110 transition-transform duration-200" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
});

ShineButton.displayName = "ShineButton";

const CTASection = memo(({ onEnrollNow, onBookConsultation, variants: customVariants }) => {
  const v = customVariants;
  return (
    <motion.div
      variants={v}
      initial="hidden"
      animate="visible"
    className="flex flex-col sm:flex-row gap-3"
  >
    <ShineButton onClick={onEnrollNow} icon={FaArrowRight} variant="primary">
      Enroll Now
    </ShineButton>
    <ShineButton onClick={onBookConsultation} icon={FaStar} variant="secondary">
      Book Free Consultation
    </ShineButton>
  </motion.div>
  );
});

CTASection.displayName = "CTASection";
export default CTASection;
