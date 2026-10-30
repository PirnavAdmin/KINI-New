import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { testimonials } from "../data/homeData";

function ReviewCard({ item, isDark }) {
  return (
    <article
      className={`group relative flex flex-col h-full rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-4 ${
        isDark
          ? "border border-white/10 bg-white/[0.04] hover:border-[#085FA7]/20 hover:shadow-[0_16px_48px_rgba(8,95,167,0.12)]"
          : "border border-[#E5E7EB] bg-white/90 shadow-sm hover:border-[#085FA7]/20 hover:shadow-[0_16px_48px_rgba(8,95,167,0.08)]"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#085FA7]/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={`text-xs ${i < item.rating ? "text-[#F0765B]" : "text-slate-600"}`} />
          ))}
        </div>
        <FaQuoteRight aria-hidden="true" className="text-2xl text-[#085FA7]/10 transition-all duration-300 group-hover:text-[#085FA7]/20" />
      </div>

      <p className={`mb-4 flex-1 text-xs leading-6 line-clamp-4 overflow-hidden ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>
        &ldquo;{item.text}&rdquo;
      </p>

      <div className="mb-4 h-px w-full bg-gradient-to-r from-[#085FA7]/20 via-[#5CA347]/10 to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#085FA7]/20">
            <img src={item.avatar} alt={`Photo of ${item.name}`} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0">
            <h3 className={`truncate text-sm font-bold transition-colors duration-200 ${isDark ? "text-white group-hover:text-[#085FA7]" : "text-[#0F172A] group-hover:text-[#085FA7]"}`}>
              {item.name}
            </h3>
            <p className="truncate text-xs text-[#94A3B8]">
              {item.role} @ <span className="font-medium text-[#5CA347]">{item.company}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

const Testimonials = memo(function Testimonials() {
  const { isDark } = useThemeContext();
  const doubled = useMemo(() => [...testimonials, ...testimonials], []);

  return (
    <section className={`relative overflow-hidden py-8 md:py-10 lg:py-12 transition-colors duration-500 ${isDark ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-[#085FA7]/[0.06] dark:bg-[#085FA7]/[0.07] blur-[160px]`} />
        <div className={`absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#5CA347]/[0.06] dark:bg-[#5CA347]/[0.07] blur-[160px]`} />
        <div className={`absolute inset-0`} style={{
          backgroundSize: "60px 60px",
          backgroundImage: isDark
            ? "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)"
        }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]" : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
          }`}>
            <FaStar className="w-3 h-3" /> Student Testimonials
          </span>
          <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            What Our{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          <p className={`mt-2 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Real stories from real students who transformed their careers through our programs.
          </p>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="flex gap-5 w-max"
          >
            {doubled.map((item, index) => (
              <div key={`${item.name}-${index}`} className="w-[320px] flex-shrink-0">
                <ReviewCard item={item} isDark={isDark} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default Testimonials;
