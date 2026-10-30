import { useEffect, useRef, useState } from "react";

export function useCountUp(target, duration = 1600, decimals = 0) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReducedMotion) {
      setValue(target);
      return undefined;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = target * eased;
      setValue(Number(nextValue.toFixed(decimals)));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [decimals, duration, target]);

  return { ref, value };
}
