import { useCallback, useEffect, useState } from "react";

const SHOWN_KEY = "getInTouchPopupShown";
const SUBMITTED_KEY = "contactSubmitted";
const TIME_TRIGGER_MS = 10_000;
const SCROLL_TRIGGER_RATIO = 0.5;

/**
 * Engagement-based auto-popup trigger: fires once per session on the
 * first of — 10s on page, 50% scroll depth, or exit intent (desktop
 * pointer leaving through the top of the viewport). Gated by
 * sessionStorage so it never shows twice in one session, and never
 * again after a successful submission.
 */
export default function useLeadPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const canShow = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SUBMITTED_KEY) && !sessionStorage.getItem(SHOWN_KEY);
  }, []);

  const trigger = useCallback(() => {
    if (!canShow()) return;
    sessionStorage.setItem(SHOWN_KEY, "true");
    setIsOpen(true);
  }, [canShow]);

  useEffect(() => {
    if (!canShow()) return undefined;

    const timer = window.setTimeout(trigger, TIME_TRIGGER_MS);

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      if (ratio >= SCROLL_TRIGGER_RATIO) trigger();
    };

    const isDesktopPointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const handleExitIntent = (event) => {
      if (event.clientY <= 0) trigger();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (isDesktopPointer) {
      document.addEventListener("mouseleave", handleExitIntent);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      if (isDesktopPointer) {
        document.removeEventListener("mouseleave", handleExitIntent);
      }
    };
  }, [canShow, trigger]);

  const close = useCallback(() => setIsOpen(false), []);

  const markSubmitted = useCallback(() => {
    sessionStorage.setItem(SUBMITTED_KEY, "true");
    setIsOpen(false);
  }, []);

  return { isOpen, close, markSubmitted };
}
