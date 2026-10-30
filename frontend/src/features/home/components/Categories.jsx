import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { categories, featuredCourses } from "@features/home/data/homeData";
import { FaCheckCircle, FaArrowRight, FaClock, FaUsers } from "react-icons/fa";

/**
 * SalaryGrowthChart
 * ------------------------------------------------------------------
 * A small illustrative line chart showing salary trending upward
 * from "Before" to the course's target package. It's stylized (not
 * plotting real historical data — homeData only gives us a single
 * target figure per course), so treat the curve as directional, not
 * as literal statistics. Swap the `points` easing if you later have
 * real month-by-month salary data to plot.
 * ------------------------------------------------------------------
 */
function SalaryGrowthChart({ salary, isDark }) {
  // Normalized upward curve — purely illustrative.
  const points = [
    { x: 0, y: 78 },
    { x: 25, y: 70 },
    { x: 50, y: 52 },
    { x: 75, y: 30 },
    { x: 100, y: 12 },
  ];

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  const axisColor = isDark ? "#334155" : "#E2E8F0";
  const labelColor = isDark ? "#64748B" : "#94A3B8";

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-32 w-full overflow-visible sm:h-36"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="salaryLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#085FA7" />
            <stop offset="100%" stopColor="#5CA347" />
          </linearGradient>
          <linearGradient id="salaryFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5CA347" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5CA347" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline grid */}
        {[25, 50, 75].map((yPos) => (
          <line
            key={yPos}
            x1="0"
            x2="100"
            y1={yPos}
            y2={yPos}
            stroke={axisColor}
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}

        {/* Filled area under the curve */}
        <motion.path
          d={areaPath}
          fill="url(#salaryFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        {/* Growth line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#salaryLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Point markers */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 2.6 : 1.6}
            fill={i === points.length - 1 ? "#5CA347" : "#085FA7"}
            stroke={isDark ? "#0F172A" : "#F8FAFC"}
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.12 }}
          />
        ))}
      </svg>

      {/* Axis labels */}
      <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: labelColor }}>
        <span>Before</span>
        <span>6 mo</span>
        <span className="font-semibold text-[#5CA347]">
          After · {salary}
        </span>
      </div>
    </div>
  );
}

export default function Categories() {
  const [activeTab, setActiveTab] = useState(0);
  const { isDark } = useThemeContext();
  const course = useMemo(() => featuredCourses[activeTab], [activeTab]);

  return (
    <section className={`relative overflow-hidden py-8 md:py-10 lg:py-12 transition-colors duration-500 ${isDark ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#085FA7]/5 dark:bg-[#085FA7]/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5CA347]/5 dark:bg-[#5CA347]/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]" : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#085FA7] animate-pulse" />
            Our Programs
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Industry-Focused{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Career Tracks
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Specialized programs designed to make you job-ready in 12–24 weeks.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${
                activeTab === i
                  ? "text-white border-transparent shadow-lg"
                  : isDark
                    ? "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                    : "bg-white border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] hover:border-[#085FA7]/30"
              }`}
              style={activeTab === i ? { background: `linear-gradient(135deg, #085FA7, #5CA347)` } : {}}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Program Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border overflow-hidden backdrop-blur-xl ${
              isDark
                ? "bg-white/[0.03] border-white/5"
                : "bg-white/80 border-[#E5E7EB] shadow-sm"
            }`}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Info side */}
              <div className="p-6 sm:p-8">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isDark ? "bg-[#085FA7]/20 text-[#4A9EE0]" : "bg-[#EDF4FC] text-[#085FA7]"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#085FA7] animate-pulse" />
                  {course.badge}
                </span>
                <h3 className={`text-xl sm:text-2xl font-bold mt-3 ${isDark ? "text-white" : "text-[#0F172A]"}`}>{course.title}</h3>
                <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{course.desc}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                    <FaClock className="text-[#5CA347]" /> {course.duration}
                  </span>
                  <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                    <FaUsers className="text-[#085FA7]" /> {course.sessions}
                  </span>
                </div>

                {/* Salary badge */}
                <div className="flex items-baseline gap-1.5 mt-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
                    {course.salary}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`}>target salary</span>
                </div>

                <div className="mt-4 space-y-2">
                  {course.outcomes.map((outcome, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FaCheckCircle className="text-[#5CA347] text-xs flex-shrink-0" />
                      <span className={`text-xs ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>{outcome}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Enroll Now <FaArrowRight className="text-xs" />
                </motion.button>
              </div>

              {/* Visual side — salary growth chart + package badge */}
              <div
                className={`relative flex flex-col justify-center border-t md:border-t-0 md:border-l p-6 sm:p-8 ${
                  isDark
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-[#E5E7EB] bg-[#F8FAFC]/60"
                }`}
              >
                <div className="mx-auto w-full max-w-[300px]">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isDark ? "text-slate-500" : "text-[#94A3B8]"
                    }`}>
                      Salary Growth
                    </span>

                    <span className="text-lg font-black bg-gradient-to-br from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
                      {course.salary}
                    </span>
                  </div>

                  <div className="mt-3">
                    <SalaryGrowthChart salary={course.salary} isDark={isDark} />
                  </div>

                  <p className={`mt-3 text-center text-[10px] ${
                    isDark ? "text-slate-500" : "text-[#94A3B8]"
                  }`}>
                    Illustrative trend · actual outcomes vary by role & experience
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
