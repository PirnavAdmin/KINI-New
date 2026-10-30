import { memo } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaArrowRight, FaGraduationCap } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const AlumniCard = memo(function AlumniCard({ alumni }) {
  const { isDark } = useThemeContext();
  const { name, company, designation, batch, achievement, avatar, linkedIn } = alumni;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-white/[0.03] border-white/5 hover:border-[#085FA7]/20 hover:bg-white/[0.05]"
          : "bg-white/80 border-[#E5E7EB] hover:border-[#085FA7]/20 hover:shadow-lg"
      }`}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#085FA7]/5 blur-[60px]" />
      </div>

      <div className="relative z-10 p-6">
        {/* Avatar + Name Row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#085FA7]/20">
              <img src={avatar} alt={name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
              {batch.slice(-2)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-[#0F172A]"}`}>{name}</h3>
            <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{designation}</p>
          </div>
        </div>

        {/* Company Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold mb-3 ${
          isDark ? "bg-[#5CA347]/15 text-[#5CA347]" : "bg-[#EFF8ED] text-[#5CA347]"
        }`}>
          <FaGraduationCap className="w-3 h-3" />
          {company}
        </div>

        {/* Achievement */}
        <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>
          {achievement}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]/50 dark:border-white/5">
          <a
            href={linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#085FA7]/10 text-[#085FA7] text-[11px] font-semibold hover:bg-[#085FA7]/20 transition-all duration-200"
          >
            <FaLinkedin className="w-3 h-3" /> LinkedIn
          </a>
          <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ml-auto ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                : "text-[#64748B] hover:text-[#085FA7] hover:bg-[#EDF4FC]"
            }`}
          >
            View Profile <FaArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default AlumniCard;
