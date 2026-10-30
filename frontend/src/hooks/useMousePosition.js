import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";


/**
 * useMousePosition — Tracks cursor position with RAF throttling.
 *
 * Returns spring-animated MotionValues so child components can
 * read cursor position at 60 fps without causing React re-renders.
 *
 * @param {Object} options
 * @param {number}  options.stiffness  — Spring stiffness  (default 250)
 * @param {number}  options.damping    — Spring damping    (default 25)
 * @param {number}  options.mass       — Spring mass       (default 0.5)
 */
export default function useMousePosition(options = {}) {
  const { stiffness = 250, damping = 25, mass = 0.5 } = options;

  // Raw values updated on every mouse move (inside RAF)
  const rawX = useMotionValue(-999);
  const rawY = useMotionValue(-999);

  // Smooth spring values for the actual cursor position
  const mouseX = useSpring(rawX, { stiffness, damping, mass });
  const mouseY = useSpring(rawY, { stiffness, damping, mass });

  // Store latest position for RAF coalescing
  const latestPos = useRef({ x: -999, y: -999 });
  const rafId = useRef(null);
  const isInside = useRef(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      latestPos.current = { x: e.clientX, y: e.clientY };

      // Schedule one RAF callback per frame
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;
          if (isInside.current) {
            rawX.set(latestPos.current.x);
            rawY.set(latestPos.current.y);
          }
        });
      }
    };

    const handleMouseEnter = () => {
      isInside.current = true;
    };

    const handleMouseLeave = () => {
      isInside.current = false;
      // Push cursor off-screen when leaving
      rawX.set(-999);
      rawY.set(-999);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [rawX, rawY]);

  return { mouseX, mouseY, rawX, rawY };
}
