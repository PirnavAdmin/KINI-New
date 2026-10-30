import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { learningPaths } from "../data/homeData";
import { FaArrowRight } from "react-icons/fa";

export default function LearningPaths() {
  const { isDark } = useThemeContext();

  return (
    <section className={`relative overflow-hidden py-8 md:py-10 lg:py-12 transition-colors duration-500 ${isDark ? "bg-[#0F172A]" : "bg-white"}`}>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#085FA7]/5 dark:bg-[#085FA7]/10 blur-[150px] rounded-full" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]" : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#085FA7] animate-pulse" />
            Learning Paths
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Find Your{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Starting Point
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Three paths designed for different experience levels — from complete beginners to senior engineers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {learningPaths.map((path, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                  : "bg-white/80 border-[#E5E7EB] hover:border-[#085FA7]/20 hover:shadow-lg"
              } ${i === 1 ? `md:-translate-y-3 ${isDark ? "border-[#085FA7]/30" : "border-[#085FA7]/30"}` : ""}`}
              style={i === 1 ? { boxShadow: isDark ? "0 0 30px rgba(8,95,167,0.08)" : "0 0 30px rgba(8,95,167,0.06)", borderColor: isDark ? "rgba(8,95,167,0.3)" : "rgba(8,95,167,0.2)" } : {}}
            >
              <div className="text-3xl mb-3">{path.icon}</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>{path.title}</h3>
                {i === 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white">
                    Popular
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{path.desc}</p>
              
              <div className={`mt-4 pt-4 border-t ${isDark ? "border-white/5" : "border-[#E5E7EB]"}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                    <span className="font-semibold text-[#085FA7]">{path.steps}</span> steps
                  </span>
                  <span className={`${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                    <span className="font-semibold text-[#5CA347]">{path.duration}</span>
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ x: 4 }}
                className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors text-[#085FA7] hover:text-[#5CA347]`}
              >
                Learn More <FaArrowRight className="text-[10px]" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
