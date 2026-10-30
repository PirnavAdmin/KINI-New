import { memo } from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { focusRing } from "./constants";

const ThemeToggle = memo(function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex items-center w-[52px] h-[28px] rounded-full border transition-all duration-300 flex-shrink-0 ${focusRing}
        ${isDark ? "bg-slate-700/90 border-slate-600/60" : "bg-primary-100 border-primary-200/60"}`}
    >
      <motion.div
        className={`absolute left-[6px] w-3 h-3 flex items-center justify-center transition-opacity duration-200 ${isDark ? "opacity-25" : "opacity-100"}`}
        animate={{ opacity: isDark ? 0.25 : 1 }}
      >
        <FiSun className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-primary"}`} />
      </motion.div>
      <motion.div
        className={`absolute right-[6px] w-3 h-3 flex items-center justify-center transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-25"}`}
        animate={{ opacity: isDark ? 1 : 0.25 }}
      >
        <FiMoon className={`w-3 h-3 ${isDark ? "text-slate-300" : "text-slate-400"}`} />
      </motion.div>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-[3px] w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm
          ${isDark ? "bg-slate-900 border border-slate-600/40" : "bg-white border border-primary-200/60"}`}
        style={{ left: isDark ? "25px" : "3px" }}
      >
        {isDark ? (
          <FiMoon className="w-3 h-3 text-primary-light" />
        ) : (
          <FiSun className="w-3 h-3 text-amber-500" />
        )}
      </motion.span>
    </button>
  );
});

export default ThemeToggle;
