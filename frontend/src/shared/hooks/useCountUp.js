import { useState, useEffect, useRef, Fragment } from "react";
import { createElement } from "react";

/**
 * useCountUp — Lightweight animated counter hook.
 * Replaces the problematic react-countup CJS/ESM interop dependency.
 *
 * @param {object} options
 * @param {number} options.end        - Target value to count to
 * @param {number} [options.duration] - Animation duration in seconds
 * @param {string} [options.separator]- Thousands separator character
 * @param {string} [options.suffix]   - Suffix string (e.g. "+", "%")
 * @returns {string} Formatted animated count
 */
export function useCountUp({
  end = 0,
  duration = 2,
  separator = "",
  suffix = "",
} = {}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);

      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  const formatted = count.toLocaleString("en-US").replace(/,/g, separator);

  return `${formatted}${suffix}`;
}

/**
 * CountUp — Drop-in replacement component for react-countup.
 * Same props API: start, end, duration, separator, suffix.
 */
export function CountUp({ start: _, end = 0, duration = 2, separator = "", suffix = "" }) {
  const formatted = useCountUp({ end, duration, separator, suffix });
  return createElement(Fragment, null, formatted);
}
