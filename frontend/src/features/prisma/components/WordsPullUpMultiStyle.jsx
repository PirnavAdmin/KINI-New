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
 * Takes an array of { text, className } segments and animates
 * each word with a staggered pull-up, preserving per-word styling.
 *
 * @param {{
 *   segments: { text: string; className?: string }[]
 * }} props
 */
export default function WordsPullUpMultiStyle({ segments }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Flatten segments into a single word array with per-word className
  const words = segments.flatMap((seg) =>
    seg.text.split(" ").map((word) => ({
      word,
      className: seg.className ?? "",
    }))
  );

  return (
    <span ref={ref} className="inline-flex flex-wrap justify-center">
      {words.map(({ word, className }, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={pullUpVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={`inline-block ${className}`}
          style={{ marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
