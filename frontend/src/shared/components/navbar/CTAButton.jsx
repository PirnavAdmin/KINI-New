import { memo } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { focusRing } from "./constants";

const CTAButton = memo(function CTAButton() {
  return (
    <motion.a
      href="/signup"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold shadow-lg shadow-glow-primary hover:shadow-xl hover:shadow-glow-primary/80 transition-all duration-300 ${focusRing}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        Get Started
        <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
      <motion.span
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-light to-primary opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <span className="absolute inset-0 rounded-xl">
        <span className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity" />
      </span>
    </motion.a>
  );
});

export default CTAButton;
