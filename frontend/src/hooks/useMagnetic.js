import { useCallback, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * useMagnetic — Applies a magnetic pull effect to an element.
 *
 * Returns a ref to attach to your element and spring MotionValues
 * for `x` and `y` transforms.
 *
 * @param {Object}  options
 * @param {number}  options.strength   — Pull intensity (default 0.3)
 * @param {number}  options.stiffness  — Spring stiffness  (default 200)
 * @param {number}  options.damping    — Spring damping    (default 15)
 */
export default function useMagnetic(options = {}) {
  const {
    strength = 0.3,
    stiffness = 200,
    damping = 15,
  } = options;

  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      x.set(distX * strength);
      y.set(distY * strength);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    magneticRef: ref,
    magneticHandlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    springX,
    springY,
  };
}
