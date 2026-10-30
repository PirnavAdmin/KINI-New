import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { focusRing } from "./constants";

const WishlistButton = memo(function WishlistButton({ count = 0, isDark }) {
  return (
    <Link
      to="/wishlist"
      aria-label={`Wishlist${count > 0 ? `, ${count} items` : ""}`}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group ${focusRing}
        ${isDark
          ? "text-slate-400 hover:text-rose-400 hover:bg-white/[0.08]"
          : "text-slate-500 hover:text-rose-500 hover:bg-rose-50"
        }`}
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center"
      >
        <FiHeart className="w-4.5 h-4.5" />
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
    </Link>
  );
});

export default WishlistButton;
