import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle function
  const toggleWishlist = (course) => {
    const exists = wishlist.find((item) => item.id === course.id);

    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== course.id));
    } else {
      setWishlist([...wishlist, course]);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook
export const useWishlist = () => useContext(WishlistContext);