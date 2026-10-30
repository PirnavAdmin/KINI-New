import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const stats = [
  { value: 20000, suffix: "+", label: "Students Trained" },
  { value: 2200, suffix: "+", label: "Placed" },
  { value: 95, suffix: "%", label: "Success Rate" },
  { value: 50, suffix: "+", label: "Mentors" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Custom animated counter ────────────────────────────────
// Uses requestAnimationFrame for smooth 60fps counting.
// No third-party dependencies needed.
function AnimatedCounter({ end, suffix = "", duration = 2500 }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo: 1 - 2^(-10 * progress)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.round(eased * end);
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration]);

  // Format with commas
  const formatted = current.toLocaleString("en-US");

  return <>{formatted}{suffix}</>;
}

export default function StatsCards() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="relative grid overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white/90 backdrop-blur-sm shadow-[0_20px_70px_rgba(8,95,167,0.06)] sm:grid-cols-4 group"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={cardVariants}
          className="relative border-b border-[#E5E7EB] px-4 py-6 text-center transition-all duration-300 hover:bg-gradient-to-b hover:from-[#085FA7]/[0.03] hover:to-transparent sm:border-b-0 sm:border-r last:border-r-0 group/card"
        >
          {/* Hover glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#085FA7]/5 blur-3xl rounded-full" />
          </div>

          <p className="relative bg-gradient-to-r from-[#085FA7] via-[#1A7ACA] to-[#5CA347] bg-clip-text text-3xl font-black text-transparent sm:text-4xl transition-transform duration-300 group-hover/card:scale-110">
            {inView ? (
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                duration={2500}
              />
            ) : (
              <span>0{stat.suffix}</span>
            )}
          </p>
          <p className="relative mt-2 text-sm font-semibold leading-snug text-[#64748B] transition-colors duration-300 group-hover/card:text-[#085FA7]">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}