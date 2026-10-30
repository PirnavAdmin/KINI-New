import { memo } from "react";
import { motion } from "framer-motion";
import { FiBell } from "react-icons/fi";
import { focusRing } from "./constants";

const NotificationBadge = memo(function NotificationBadge({ count = 0, isDark }) {
  return (
    <button
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group ${focusRing}
        ${isDark
          ? "text-slate-400 hover:text-white hover:bg-white/[0.08]"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        }`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiBell className="w-4.5 h-4.5" />
      </motion.div>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none shadow-sm"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </button>
  );
});

export default NotificationBadge;
