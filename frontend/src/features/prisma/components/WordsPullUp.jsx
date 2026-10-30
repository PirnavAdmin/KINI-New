import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pullUpVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/**
 * Splits text into individually animated words with a staggered pull-up effect.
 * @param {{ text: string, className?: string, showAsterisk?: boolean }} props
 */
export default function WordsPullUp({ text, className = "", showAsterisk = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={pullUpVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative inline-block"
          style={{ marginRight: "0.3em" }}
        >
          {word}
          {showAsterisk && i === words.length - 1 && (
            <sup
              className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]"
              style={{ lineHeight: 1 }}
            >
              *
            </sup>
          )}
        </motion.span>
      ))}
    </span>
  );
}
