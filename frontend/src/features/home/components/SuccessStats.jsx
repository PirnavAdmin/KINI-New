import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import {
  FaUsers, FaLayerGroup, FaChalkboardTeacher, FaAward,
  FaGraduationCap, FaChartLine,
} from "react-icons/fa";

function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
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

function CircularProgress({ percentage, color, size = 100, label, isDark }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const p = Math.min((timestamp - startTime) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.floor(eased * percentage));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, percentage]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
            strokeWidth="8" />
          <motion.circle cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {progress}%
          </span>
        </div>
      </div>
      <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

const stats = [
  { number: 20000, suffix: "+", label: "Students Trained", color: "#4F46E5", icon: FaGraduationCap, percentage: 95 },
  { number: 1000, suffix: "+", label: "Batches Completed", color: "#06B6D4", icon: FaLayerGroup, percentage: 88 },
  { number: 40, suffix: "+", label: "Expert Mentors", color: "#10B981", icon: FaChalkboardTeacher, percentage: 92 },
  { number: 99, suffix: "%", label: "Success Rate", color: "#7C3AED", icon: FaAward, percentage: 99 },
];

export default function SuccessStats() {
  const { isDark } = useThemeContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <section
      className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${
        isDark ? "bg-[#0F172A]" : "bg-gradient-to-b from-slate-50 to-white"
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4F46E5]/5 dark:bg-[#4F46E5]/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              isDark
                ? "border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#818CF8]"
                : "border-[#4F46E5]/20 bg-[#4F46E5]/5 text-[#4F46E5]"
            }`}
          >
            <FaChartLine className="w-3 h-3" />
            Our Achievements
          </span>
          <h2
            className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Trusted by{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p
            className={`mt-3 max-w-xl mx-auto text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Our track record speaks for itself. Join thousands of students who have transformed their careers with us.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-5 sm:p-6 text-center border transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>

              {/* Counter */}
              <h3
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1"
                style={{ color: stat.color }}
              >
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              </h3>

              {/* Divider */}
              <div className="w-12 h-0.5 mx-auto my-3 rounded-full" style={{ backgroundColor: `${stat.color}40` }} />

              {/* Label */}
              <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Circular Progress Row */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-14"
          >
            <div
              className={`rounded-2xl p-6 sm:p-8 border ${
                isDark
                  ? "bg-white/[0.02] border-white/5"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <CircularProgress
                    key={i}
                    percentage={stat.percentage}
                    color={stat.color}
                    label={stat.label}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
