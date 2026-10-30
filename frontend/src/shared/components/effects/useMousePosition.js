import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * useMousePosition — Shared hook for cursor-reactive ambient lighting.
 *
 * Returns spring-animated MotionValues so child components can
 * react to cursor position smoothly at 60 fps without causing
 * React re-renders.
 *
 * Usage:
 *   const { mouseX, mouseY } = useMousePosition();
 *   // In JSX: style={{ background: useMotionTemplate`radial-gradient(...)` }}
 *   // or use mouseX.get() inside rAF callbacks.
 */

const STIFFNESS = 120;
const DAMPING = 18;

export function useMousePosition(options = {}) {
  const { stiffness = STIFFNESS, damping = DAMPING } = options;

  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);

  const mouseX = useSpring(rawX, { stiffness, damping });
  const mouseY = useSpring(rawY, { stiffness, damping });

  const isEnabled = useRef(true);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!isEnabled.current) return;
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const handleLeave = () => {
      rawX.set(-9999);
      rawY.set(-9999);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [rawX, rawY]);

  return { mouseX, mouseY, rawX, rawY };
}

/**
 * useScrollPosition — Shared hook for parallax-aware ambient lighting.
 */
export function useScrollPosition() {
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  return { scrollY };
}
