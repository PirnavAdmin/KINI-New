import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const DURATION = 600;
const EASING = "ease-out-cubic";

// AOS is a global singleton; initialise it once per app load. StrictMode's
// double-invoked effects and repeat visits only refresh it.
let aosReady = false;
const ensureAos = () => {
  if (aosReady) return;
  aosReady = true;
  AOS.init({ once: true, duration: DURATION, easing: EASING, offset: 0 });
};

/**
 * Replays a page's AOS entrance animations every time its route is entered,
 * including SPA navigation back to an already-visited page.
 *
 * AOS (with `once`) never re-animates an element that already carries
 * `aos-animate`, and only animates on window scroll — so on route entry this
 * hook resets the animation class on elements inside `rootRef` only, then
 * re-adds it on the next frames so the CSS transitions (and per-element
 * delays) play from the start. Other pages' elements are never touched and
 * the scroll position is left alone.
 *
 * `aos(animation, delay)` returns the data attributes to spread on an
 * element, or nothing when the user prefers reduced motion.
 */
export default function useRouteAos() {
  const rootRef = useRef(null);
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (reduceMotion || !root) return undefined;
    ensureAos();

    const nodes = root.querySelectorAll("[data-aos]");
    nodes.forEach((node) => node.classList.remove("aos-animate"));
    void root.offsetHeight; // commit the hidden state before animating in

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        AOS.refreshHard();
        nodes.forEach((node) => node.classList.add("aos-animate"));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, reduceMotion]);

  const aos = useCallback(
    (animation, delay = 0) =>
      reduceMotion
        ? {}
        : {
            "data-aos": animation,
            "data-aos-delay": delay,
            "data-aos-duration": DURATION,
            "data-aos-easing": EASING,
            "data-aos-once": "true",
          },
    [reduceMotion],
  );

  return { rootRef, aos, refresh: AOS.refresh };
}
