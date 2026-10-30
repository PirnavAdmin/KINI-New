import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import cartService, { CART_STORAGE_KEY } from "@/services/cartService";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Restore synchronously so the navbar badge is correct on first paint.
  const [cartItems, setCartItems] = useState(() => cartService.getCart());

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CART_STORAGE_KEY) setCartItems(cartService.getCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isInCart = useCallback(
    (courseId) => cartItems.some((item) => String(item.id) === String(courseId)),
    [cartItems],
  );

  const addToCart = useCallback(
    (course) => {
      const name = course.name ?? course.title;
      if (isInCart(course.id)) {
        toast(`${name} is already in your cart`, { icon: "🛒" });
        return false;
      }
      setCartItems(cartService.addToCart(course));
      toast.success(`${name} added to cart successfully`);
      return true;
    },
    [isInCart],
  );

  const removeFromCart = useCallback(
    (courseId, { silent = false } = {}) => {
      const item = cartItems.find((entry) => String(entry.id) === String(courseId));
      setCartItems(cartService.removeFromCart(courseId));
      if (item && !silent) toast.success(`${item.name} removed from cart`);
    },
    [cartItems],
  );

  const clearCart = useCallback(() => {
    setCartItems(cartService.clearCart());
  }, []);

  const value = useMemo(() => {
    const cartSubtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    // Coupons are validated per course on the enrollment page.
    const cartDiscount = 0;
    return {
      cartItems,
      cartCount: cartItems.length,
      cartSubtotal,
      cartDiscount,
      cartTotal: Math.max(cartSubtotal - cartDiscount, 0),
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
    };
  }, [cartItems, addToCart, removeFromCart, clearCart, isInCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
