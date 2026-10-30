import { memo } from "react";
import { motion } from "framer-motion";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const TestimonialCard = memo(function TestimonialCard({ testimonial }) {
  const { isDark } = useThemeContext();
  const { name, company, role, text, rating, avatar } = testimonial;

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
            <FaStar key={i} className={`text-xs ${i < rating ? "text-[#F0765B]" : "text-slate-600"}`} />
          ))}
        </div>
        <FaQuoteRight aria-hidden="true" className="text-2xl text-[#085FA7]/10 transition-all duration-300 group-hover:text-[#085FA7]/20" />
      </div>

      <p className={`mb-4 flex-1 text-xs leading-6 line-clamp-4 overflow-hidden ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>
        &ldquo;{text}&rdquo;
      </p>

      <div className="mb-4 h-px w-full bg-gradient-to-r from-[#085FA7]/20 via-[#5CA347]/10 to-transparent" />

      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#085FA7]/20">
          <img src={avatar} alt={name} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0">
          <h3 className={`truncate text-sm font-bold transition-colors duration-200 ${isDark ? "text-white group-hover:text-[#085FA7]" : "text-[#0F172A] group-hover:text-[#085FA7]"}`}>
            {name}
          </h3>
          <p className="truncate text-xs text-[#94A3B8]">
            {role} @ <span className="font-medium text-[#5CA347]">{company}</span>
          </p>
        </div>
      </div>
    </article>
  );
});

export default TestimonialCard;
