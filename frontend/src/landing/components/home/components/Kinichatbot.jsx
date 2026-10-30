// ============================================================
// KiniChatbot.jsx — floating launcher + chat panel
//
// Usage: import KiniChatbot from "./chatbot/KiniChatbot";
//        Then place <KiniChatbot /> anywhere in your layout.
//
// Theme: pass isDark={true/false} OR wire to your ThemeContext.
// ============================================================
import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import ChatWindow from "../components/chatbot/ChatWindow";

const GRAD = "linear-gradient(135deg, #133B5D 0%, #35608A 50%, #F39924 100%)";

// ── If you have a ThemeContext, import and use it here ───────
// import { ThemeContext } from "../../context/ThemeContext";
// const { isDark } = useContext(ThemeContext);
// ─────────────────────────────────────────────────────────────

export default function KiniChatbot({ isDark = false }) {
  // If using ThemeContext, replace the prop with:
  // const { isDark } = useContext(ThemeContext);

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      <div
        className="fixed bottom-[88px] right-4 sm:right-6 z-50"
        style={{ transformOrigin: "bottom right" }}
      >
        <AnimatePresence>
          {open && (
            <ChatWindow onClose={() => setOpen(false)} isDark={isDark} />
          )}
        </AnimatePresence>
      </div>

      {/* Floating launcher button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary-500 text-primary-700 shadow-xl transition-all duration-300 hover:bg-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        style={{ boxShadow: "0 8px 30px rgba(19, 59, 93, 0.4)" }}
        aria-label={open ? "Close Kini Chat" : "Open Kini Chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.15 }}
            >
              <Bot size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Online badge */}
      {!open && (
        <span
          className="fixed bottom-[68px] right-[18px] sm:right-[22px] z-50 w-4 h-4 rounded-full bg-green-400 border-2 border-white dark:border-slate-900"
          title="Online"
        />
      )}
    </>
  );
}