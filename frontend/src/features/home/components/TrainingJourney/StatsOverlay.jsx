import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { STATS, DARK_TEXT, MUTED_TEXT, YELLOW_BG } from "./trainingData";

// ─────────────────────────────────────────────────────────────
// Animated counter hook (cubic ease-out)
// ─────────────────────────────────────────────────────────────
function useAnimatedCounter(end = 0, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !startOnView) return;
    started.current = true;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

// ─────────────────────────────────────────────────────────────
// Single stat card
// ─────────────────────────────────────────────────────────────
function StatCard({ stat, index }) {
  const { count, ref } = useAnimatedCounter(stat.value, 2200);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="relative rounded-2xl border p-5 text-center backdrop-blur-xl sm:p-6"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        borderColor: `${stat.color}20`,
        boxShadow: `0 4px 24px ${stat.color}10`,
      }}
    >
      {/* Accent dot */}
      <div
        className="mx-auto mb-3 h-10 w-10 rounded-xl"
        style={{
          backgroundColor: `${stat.color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: stat.color }}
        />
      </div>

      {/* Counter */}
      <h3
        className="text-3xl font-black tracking-tight sm:text-4xl"
        style={{ color: stat.color }}
      >
        {count.toLocaleString()}
        {stat.suffix}
      </h3>

      {/* Divider */}
      <div
        className="mx-auto my-2 h-0.5 w-10 rounded-full"
        style={{ backgroundColor: `${stat.color}25` }}
      />

      {/* Label */}
      <p
        className="text-xs font-semibold sm:text-sm"
        style={{ color: MUTED_TEXT }}
      >
        {stat.label}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// StatsOverlay Component
// ─────────────────────────────────────────────────────────────
export default function StatsOverlay() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${YELLOW_BG} 0%, #FFE082 50%, ${YELLOW_BG} 100%)`,
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "#FFCA28", opacity: 0.3 }}
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "#FFB300", opacity: 0.3 }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(8,95,167,0.1)",
              color: "#085FA7",
            }}
          >
            Our Impact
          </span>
          <h2
            className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl"
            style={{ color: DARK_TEXT }}
          >
            Trusted by{" "}
            <span
              className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent"
            >
              Thousands
            </span>
          </h2>
          <p
            className="mx-auto mt-2 max-w-lg text-sm sm:text-base"
            style={{ color: MUTED_TEXT }}
          >
            Our numbers speak for themselves. Join thousands who've transformed
            their careers through our programs.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
