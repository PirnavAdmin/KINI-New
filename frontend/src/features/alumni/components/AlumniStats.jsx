import { memo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { ALUMNI_STATS } from "../constants/alumniData";

function AnimatedCounter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const AlumniStats = memo(function AlumniStats() {
  const { isDark } = useThemeContext();

  return (
    <section className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${isDark ? "bg-[#050816]" : "bg-white"}`}>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#085FA7]/5 dark:bg-[#085FA7]/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5CA347]/5 dark:bg-[#5CA347]/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]" : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
          }`}>
            By the Numbers
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Our{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Global Impact
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            A thriving community that spans the globe — from students to leaders.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {ALUMNI_STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-5 sm:p-6 text-center border backdrop-blur-xl transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                  : "bg-white/80 border-[#E5E7EB] hover:border-[#085FA7]/20 hover:shadow-lg"
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: stat.color }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </h3>
              <div className="w-10 h-0.5 mx-auto my-2.5 rounded-full" style={{ backgroundColor: `${stat.color}40` }} />
              <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default AlumniStats;
