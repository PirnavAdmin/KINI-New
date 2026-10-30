import { memo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiCalendar } from "react-icons/fi";

const PrimaryButton = memo(function PrimaryButton({ children, onClick, loading }) {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);
  const rippleId = useRef(0);

  const handleClick = useCallback(
    (e) => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++rippleId.current;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <motion.button
      ref={btnRef}
      onClick={handleClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      aria-label={loading ? "Processing..." : children}
    >
      {/* Shine effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-4 h-4 rounded-full bg-white/30 animate-[ripple_0.6s_ease-out] pointer-events-none"
          style={{ left: r.x - 8, top: r.y - 8 }}
        />
      ))}

      <span className="relative z-10 flex items-center justify-center gap-2">
        <span>{loading ? "Processing..." : children}</span>
        <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
});

const SecondaryButton = memo(function SecondaryButton({ children, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm px-5 py-3.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-white cursor-pointer"
      aria-label={children}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/5 to-transparent" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        <FiCalendar className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        <span>{children}</span>
      </span>
    </motion.button>
  );
});

const CTASection = memo(function CTASection({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  loading,
}) {
  return (
    <div className="space-y-2.5">
      <PrimaryButton onClick={onPrimary} loading={loading}>
        {primaryLabel}
      </PrimaryButton>
      <SecondaryButton onClick={onSecondary}>
        {secondaryLabel}
      </SecondaryButton>
    </div>
  );
});

export default CTASection;
