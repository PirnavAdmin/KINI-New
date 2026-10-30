import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { useThemeContext } from "@shared/context/ThemeContext";

const faqDB = [
  { q: "What is this platform?", a: "It is a modern learning platform for AI, development, and job-ready skills." },
  { q: "Do you provide placement support?", a: "Yes, we provide resume building, mock interviews, and job referrals." },
  { q: "Do I need coding experience?", a: "No, we start from basics and gradually move to advanced topics." },
  { q: "Are real projects included?", a: "Yes, every course includes real-world industry projects." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const { isDark } = useThemeContext();

  return (
    <section className={`relative px-4 py-12 md:py-16 lg:py-20 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#020b14] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      {/* Glow Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute w-[400px] h-[400px] ${isDark ? 'bg-[#085FA7]/10' : 'bg-[#085FA7]/5'} blur-[140px] top-0 left-0`} />
        <div className={`absolute w-[400px] h-[400px] ${isDark ? 'bg-[#5CA347]/10' : 'bg-[#5CA347]/5'} blur-[140px] bottom-0 right-0`} />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]" : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
          }`}>
            <Sparkles size={14} />
            FAQs
          </span>

          <h2 className={`text-3xl md:text-4xl font-bold mt-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            Everything you need to know about our program
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqDB.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                layout
                className={`rounded-2xl border overflow-hidden backdrop-blur-xl transition-all duration-300 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-[#E5E7EB] bg-white/80 shadow-sm"
                } ${isOpen ? (isDark ? 'border-[#085FA7]/30' : 'border-[#085FA7]/20') : ''}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors duration-300 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-[#085FA7]/20' : 'bg-[#EDF4FC]'
                    }`}>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347]" />
                    </div>
                    <span className={`text-sm md:text-base font-medium ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>
                      {item.q}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown size={18} className="text-[#085FA7] flex-shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`px-5 pb-5 text-sm ${isDark ? 'text-slate-300' : 'text-[#64748B]'}`}
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
