import { motion, useScroll, useSpring } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR — Fixed top progress indicator
   ──────────────────────────────────────────────────────────────
   A thin gradient bar at the very top of the viewport that
   smoothly fills from left to right as the user scrolls.
   ────────────────────────────────────────────────────────────── */

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B)",
      }}
    />
  );
}
