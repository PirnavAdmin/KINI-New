import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import useFocusTrap from "@landing-shared/components/navbar/useFocusTrap";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { EASE_PREMIUM } from "@landing-shared/hooks/useScrollAnimation";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE_PREMIUM } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: EASE_PREMIUM } },
};

/**
 * Shared modal chrome: portal, backdrop blur, scale+fade panel, focus
 * trap, scroll lock, ESC-to-close, click-outside-to-close. Extracted
 * from RegisterModal so SuccessModal (and future modals) don't
 * re-implement the same infra with copy-pasted bugs.
 */
export default function ModalOverlay({
  isOpen,
  onClose,
  labelledBy,
  maxWidthClassName = "sm:max-w-[440px]",
  panelClassName = "",
  showCloseButton = true,
  children,
}) {
  const { isDark } = useThemeContext();
  const focusTrapRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef(null);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus save / restore
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current?.focus) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Scroll lives on this wrapper (not the flex-centered dialog
              itself) so a dialog taller than the viewport can still be
              scrolled to from the top — centering an overflowing flex
              item clips its leading edge with no way to reach it. */}
          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-screen items-center justify-center">
              <motion.div
                ref={focusTrapRef}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={`relative w-full rounded-3.5xl border p-6 shadow-card-lg sm:p-7 ${maxWidthClassName} ${panelClassName} ${
                  isDark ? "border-white/10 bg-ink-900 text-white" : "border-ink-900/5 bg-white text-ink-900"
                }`}
              >
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-ink-900/5 text-ink-900/60 hover:bg-ink-900/10"
                    }`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
