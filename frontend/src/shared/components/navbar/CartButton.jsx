import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { focusRing } from "./constants";

const CartButton = memo(function CartButton({ isDark }) {
  const { cartCount } = useCart();

  return (
    <Link
      to="/cart"
      aria-label={`Cart${cartCount > 0 ? `, ${cartCount} ${cartCount === 1 ? "course" : "courses"}` : ""}`}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${focusRing}
        ${isDark
          ? "text-slate-300 hover:text-[#F39924] hover:bg-white/[0.08]"
          : "text-[#133B5D] hover:text-[#F39924] hover:bg-orange-50"
        }`}
    >
      <motion.div
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center"
      >
        <FiShoppingCart className="w-[18px] h-[18px]" />
      </motion.div>
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
            className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F39924] text-white text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none shadow-sm"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
});

export default CartButton;
