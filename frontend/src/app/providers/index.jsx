import { ThemeProvider } from "@shared/context/ThemeContext";
import { WishlistProvider } from "@shared/context/WishlistContext";
import { AuthProvider } from "@shared/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Provider } from "react-redux";
import { store } from "@features/skills/store/store";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ThemeProvider>
              {children}
              <Toaster richColors position="top-right" />
              <HotToaster position="top-right" />
            </ThemeProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}
