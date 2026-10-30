import { memo } from "react";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { focusRing } from "./constants";

const NavItem = memo(function NavItem({ item, isActive, onClick, onMouseEnter, onMouseLeave, isDark }) {
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={onClick}
        aria-expanded={isActive}
        aria-haspopup={item.hasMega ? "true" : undefined}
        className={`relative flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${focusRing}`}
      >
        <span className={`relative z-10 ${isActive ? "text-white" : isDark ? "text-slate-300" : "text-slate-600"}`}>
          {item.label}
        </span>
        {item.hasMega && (
          <motion.span
            animate={{ rotate: isActive ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown className={`w-3.5 h-3.5 ${isActive ? "text-white" : isDark ? "text-slate-500" : "text-slate-400"}`} />
          </motion.span>
        )}
        {isActive && (
          <motion.div
            layoutId="nav-active-bg"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary-dark shadow-md shadow-primary/20"
          />
        )}
      </button>
    </div>
  );
});

export default NavItem;
