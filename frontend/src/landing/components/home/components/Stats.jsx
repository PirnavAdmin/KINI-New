import { memo } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { FaChartLine } from "react-icons/fa";
import { useCountUp } from "@landing-shared/hooks/useCountUp";
import { statData } from "../data/homeData";

function AnimatedCounter({ end, suffix = "" }) {
  const { ref, value } = useCountUp(end);
  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

const Stats = memo(function Stats() {
  const { isDark } = useThemeContext();

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 transition-colors duration-500"
      style={{ background: isDark ? "linear-gradient(180deg, #0B2237 0%, #071A2B 100%)" : "#F3F8FC" }}
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-indigo/5 dark:bg-brand-indigo/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-500/5 dark:bg-secondary-500/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="text-center mb-6">
          <span className={`eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
            isDark ? "border-brand-coral/30 bg-brand-coral/10 text-brand-coral" : "border-brand-coral/20 bg-brand-coral/5 text-brand-coral"
          }`}>
            <FaChartLine className="w-3 h-3" /> Our Impact
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold ${isDark ? "text-white" : "text-ink-900"}`}>
            Trusted by{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
            Our track record speaks for itself. Join thousands of students who have transformed their careers with us.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statData.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2.5xl p-5 sm:p-6 text-center border backdrop-blur-xl transition-shadow duration-300 ${
                isDark
                  ? "glass-dark hover:shadow-glow"
                  : "bg-white border-ink-900/[0.06] shadow-card hover:shadow-card-lg"
              }`}
            >
              {/* Colored top accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2.5xl"
                style={{ backgroundColor: stat.color }}
              />

              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold mb-1" style={{ color: stat.color }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </h3>
              <div className="w-12 h-0.5 mx-auto my-3 rounded-full" style={{ backgroundColor: `${stat.color}40` }} />
              <p className={`text-sm font-medium ${isDark ? "text-white/60" : "text-ink-900/50"}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Stats;