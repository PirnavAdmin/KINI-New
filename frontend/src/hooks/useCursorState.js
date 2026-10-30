import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Cursor variant types:
 *   "default"       — idle state
 *   "button"        — buttons, CTA buttons
 *   "link"          — anchor links, nav items
 *   "card"          — cards, faculty cards, course cards
 *   "image"         — images, previewable media
 *   "input"         — form inputs, text fields
 *   "hidden"        — touch device / reduced-motion fallback
 */

const CURSOR_VARIANTS = {
  DEFAULT: "default",
  BUTTON: "button",
  LINK: "link",
  CARD: "card",
  IMAGE: "image",
  INPUT: "input",
  HIDDEN: "hidden",
};

/**
 * useCursorState — Tracks which type of element the cursor
 * is hovering over using event delegation on document.
 *
 * @returns {Object}  { cursorVariant, isVisible, isTouchDevice, prefersReducedMotion }
 */
export default function useCursorState() {
  const [cursorVariant, setCursorVariant] = useState(CURSOR_VARIANTS.DEFAULT);
  const [isVisible, setIsVisible] = useState(false);

  const isTouchDevice = useRef(false);
  const prefersReducedMotion = useRef(false);

  // ── Detect touch device & motion preference on mount ──────
  useEffect(() => {
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Determine cursor variant from element ─────────────────
  const getCursorVariant = useCallback((el) => {
    if (!el) return CURSOR_VARIANTS.DEFAULT;

    // Check for data-cursor attribute (explicit opt-in on any ancestor)
    const cursorEl = el.closest("[data-cursor]");
    if (cursorEl) {
      const explicit = cursorEl.getAttribute("data-cursor");
      if (explicit && CURSOR_VARIANTS[explicit.toUpperCase()]) {
        return explicit;
      }
    }

    // Check for data-cursor-hover (legacy support)
    if (el.closest("[data-cursor-hover]")) {
      return CURSOR_VARIANTS.BUTTON;
    }

    const tag = el.tagName?.toLowerCase();
    const role = el.getAttribute?.("role");

    // Detect clickable / interactive elements
    if (
      tag === "button" ||
      role === "button"
    ) {
      // Check if it's a CTA by looking for CTA-related classes
      const classList = el.className?.toLowerCase() || "";
      if (
        classList.includes("cta") ||
        classList.includes("hero") ||
        classList.includes("primary") ||
        classList.includes("enrollment")
      ) {
        return CURSOR_VARIANTS.BUTTON;
      }
      return CURSOR_VARIANTS.BUTTON;
    }

    if (
      tag === "a" ||
      role === "link" ||
      role === "navigation"
    ) {
      return CURSOR_VARIANTS.LINK;
    }

    // Detect navigation items
    if (
      el.closest("nav") ||
      el.closest("[role='navigation']") ||
      el.closest("[data-cursor='link']")
    ) {
      return CURSOR_VARIANTS.LINK;
    }

    // Detect input fields
    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      role === "textbox" ||
      role === "combobox"
    ) {
      return CURSOR_VARIANTS.INPUT;
    }

    // Detect images
    if (tag === "img" || el.closest("figure") || role === "img") {
      return CURSOR_VARIANTS.IMAGE;
    }

    // Detect cards via common class patterns
    if (
      el.closest("[class*='card']") ||
      el.closest("[class*='Card']") ||
      el.closest("[data-cursor='card']")
    ) {
      return CURSOR_VARIANTS.CARD;
    }

    return CURSOR_VARIANTS.DEFAULT;
  }, []);

  // ── Event delegation on document ──────────────────────────
  useEffect(() => {
    if (isTouchDevice.current || prefersReducedMotion.current) {
      setCursorVariant(CURSOR_VARIANTS.HIDDEN);
      return;
    }

    const handleMouseMove = (e) => {
      const variant = getCursorVariant(e.target);
      setCursorVariant((prev) => (prev !== variant ? variant : prev));
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setCursorVariant(CURSOR_VARIANTS.DEFAULT);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [getCursorVariant]);

  return {
    cursorVariant,
    isVisible,
    isTouchDevice: isTouchDevice.current,
    prefersReducedMotion: prefersReducedMotion.current,
    CURSOR_VARIANTS,
  };
}

export { CURSOR_VARIANTS };
