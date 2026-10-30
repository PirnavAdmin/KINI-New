import { useEffect } from "react";
import Lenis from "lenis";

/**
 * useSmoothScroll — Applies Lenis smooth scrolling to the entire document.
 *
 * - Uses `autoRaf: true` so Lenis manages its own requestAnimationFrame loop
 * - Respects `prefers-reduced-motion` — disables smooth scroll when active
 * - Enables `anchors: true` so anchor links (#id) scroll smoothly
 * - Cleans up the Lenis instance on unmount to prevent memory leaks
 */
export default function useSmoothScroll() {
  useEffect(() => {
    // Respect user accessibility preferences
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      allowNestedScroll: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      autoRaf: true,
      anchors: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);
}
