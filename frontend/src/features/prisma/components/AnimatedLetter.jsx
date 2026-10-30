import { useRef, useEffect } from "react";
import { motion, useScroll } from "framer-motion";

/**
 * Scroll-linked character-opacity reveal.
 * Each character transitions from 0.15 → 1 opacity
 * based on the scroll position within the element's viewport range.
 *
 * Updates DOM directly via refs (no React re-renders on scroll)
 * for maximum performance on all devices.
 *
 * @param {{ text: string; className?: string }} props
 */
export default function AnimatedLetter({ text, className = "" }) {
  const containerRef = useRef(null);
  const spanRefs = useRef([]);
  const chars = text.split("");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  // Direct DOM updates — avoids React re-renders on every scroll frame
  useEffect(() => {
    const count = chars.length;

    const update = (progress) => {
      for (let i = 0; i < count; i++) {
        const charProgress = count > 1 ? i / (count - 1) : 0;
        const start = Math.max(0, charProgress - 0.1);
        const end = Math.min(1, charProgress + 0.05);

        let opacity;
        if (progress <= start) {
          opacity = 0.15;
        } else if (progress >= end) {
          opacity = 1;
        } else {
          opacity = 0.15 + ((progress - start) / (end - start)) * 0.85;
        }

        const el = spanRefs.current[i];
        if (el) el.style.opacity = opacity;
      }
    };

    const unsubscribe = scrollYProgress.on("change", update);
    return unsubscribe;
  }, [scrollYProgress, chars.length]);

  return (
    <p ref={containerRef} className={className}>
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            spanRefs.current[i] = el;
          }}
          className="inline-block"
          style={{ opacity: 0.15 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}
