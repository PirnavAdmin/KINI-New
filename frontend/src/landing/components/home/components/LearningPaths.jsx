import { motion } from "framer-motion";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { learningPaths } from "../data/homeData";
import { FaArrowRight } from "react-icons/fa";

// Define distinct border colors for each card
const CARD_COLORS = [
  { border: "#133B5D", light: "border-[#133B5D]/30", dark: "border-[#133B5D]/40", hover: "hover:border-[#133B5D]/60" },
  { border: "#F39924", light: "border-[#F39924]/30", dark: "border-[#F39924]/40", hover: "hover:border-[#F39924]/60" },
  { border: "#F59E0B", light: "border-[#F59E0B]/30", dark: "border-[#F59E0B]/40", hover: "hover:border-[#F59E0B]/60" },
];

export default function LearningPaths() {
  const { isDark } = useThemeContext();

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 transition-colors duration-500"
      style={{ background: isDark ? "#0B2237" : "#FFFFFF" }}
    >
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#133B5D]/5 dark:bg-[#133B5D]/10 blur-[150px] rounded-full" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="text-center mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#133B5D]/30 bg-[#133B5D]/10 text-[#4A9EE0]" : "border-[#133B5D]/20 bg-[#EDF4FC] text-[#133B5D]"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#133B5D] animate-pulse" />
            Learning Paths
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Find Your{" "}
            <span className="bg-gradient-to-r from-[#133B5D] to-[#F39924] bg-clip-text text-transparent">
              Starting Point
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Three paths designed for different experience levels — from complete beginners to senior engineers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {learningPaths.map((path, i) => {
            const color = CARD_COLORS[i];
            const borderClass = isDark ? color.dark : color.light;
            const hoverBorderClass = color.hover;
            const isPopular = i === 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl p-6 border-2 backdrop-blur-xl transition-all duration-300 ${
                  isDark
                    ? "bg-white/[0.03] hover:bg-white/[0.05]"
                    : "bg-white/80 hover:shadow-lg"
                } ${borderClass} ${hoverBorderClass} ${isPopular ? `md:-translate-y-3` : ""}`}
                style={isPopular ? { boxShadow: isDark ? "0 0 30px rgba(8,95,167,0.08)" : "0 0 30px rgba(8,95,167,0.06)" } : {}}
              >
                {/* Top accent bar matching border color */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: color.border }}
                />

                <div className="text-3xl mb-3">{path.icon}</div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>{path.title}</h3>
                  {isPopular && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#133B5D] to-[#F39924] text-white">
                      Popular
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{path.desc}</p>
                
                <div className={`mt-4 pt-4 border-t ${isDark ? "border-white/5" : "border-[#E5E7EB]"}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                      <span className="font-semibold text-[#133B5D]">{path.steps}</span> steps
                    </span>
                    <span className={`${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                      <span className="font-semibold text-[#F39924]">{path.duration}</span>
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ x: 4 }}
                  className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors text-[#133B5D] hover:text-[#F39924]`}
                >
                  Learn More <FaArrowRight className="text-[10px]" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}