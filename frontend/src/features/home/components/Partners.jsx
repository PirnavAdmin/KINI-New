import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { FaArrowRight } from "react-icons/fa";

const LOGOS = [
  { name: "Google", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" },
  { name: "Microsoft", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" },
  { name: "Amazon", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Infosys", url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Accenture", url: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
  { name: "TCS", url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Wipro", url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "Deloitte", url: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg" },
];

export default function Partners() {
  const { isDark } = useThemeContext();

  return (
    <section
      className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${
        isDark ? "bg-[#0F172A]" : "bg-gradient-to-b from-white to-slate-50"
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-[#4F46E5]/5 dark:bg-[#4F46E5]/10 blur-[150px] rounded-full -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark
              ? "border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#818CF8]"
              : "border-[#4F46E5]/20 bg-[#4F46E5]/5 text-[#4F46E5]"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            Our Partners
          </span>
          <h2 className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Trusted by Industry{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
              Leaders
            </span>
          </h2>
          <p className={`mt-3 max-w-xl mx-auto text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            Our graduates have gone on to build careers at the world's most innovative companies.
          </p>
        </motion.div>

        {/* Glass Container */}
        <div
          className={`relative overflow-hidden rounded-2xl border ${
            isDark
              ? "bg-white/[0.02] border-white/5"
              : "bg-white/50 border-slate-200"
          }`}
        >
          {/* Fade edges */}
          <div className={`absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r ${
            isDark ? "from-[#0F172A]" : "from-white"
          } to-transparent pointer-events-none`} />
          <div className={`absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l ${
            isDark ? "from-[#0F172A]" : "from-white"
          } to-transparent pointer-events-none`} />

          {/* Marquee */}
          <div className="py-8 sm:py-10 overflow-hidden">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              className="flex gap-8 sm:gap-12 w-max items-center"
            >
              {[...LOGOS, ...LOGOS].map((company, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.08 }}
                  className="flex-shrink-0 flex items-center justify-center px-4"
                >
                  <img
                    src={company.url}
                    alt={company.name}
                    className={`h-8 sm:h-10 w-auto transition-all duration-300 ${
                      isDark
                        ? "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                        : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6"
        >
          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <span className="font-semibold text-[#4F46E5]">500+</span> hiring partners •{" "}
            <span className="font-semibold text-[#4F46E5]">95%</span> placement rate
          </p>
        </motion.div>
      </div>
    </section>
  );
}
