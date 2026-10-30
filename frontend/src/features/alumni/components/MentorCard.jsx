import { memo } from "react";
import { motion } from "framer-motion";
import { FaUserTie, FaCalendarCheck, FaArrowRight, FaStar } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const MentorCard = memo(function MentorCard({ mentor }) {
  const { isDark } = useThemeContext();
  const { name, company, role, experience, skills, availability, avatar } = mentor;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-white/[0.03] border-white/5 hover:border-[#5CA347]/20 hover:bg-white/[0.05]"
          : "bg-white/80 border-[#E5E7EB] hover:border-[#5CA347]/20 hover:shadow-lg"
      }`}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#5CA347]/20 flex-shrink-0">
            <img src={avatar} alt={name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-[#0F172A]"}`}>{name}</h3>
            <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{role}</p>
          </div>
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isDark ? "bg-[#F0765B]/15" : "bg-[#F0765B]/10"
          }`}>
            <FaStar className="w-4 h-4 text-[#F0765B]" />
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold mb-3 ${
          isDark ? "bg-[#085FA7]/15 text-[#4A9EE0]" : "bg-[#EDF4FC] text-[#085FA7]"
        }`}>
          <FaUserTie className="w-3 h-3" />
          {company} · {experience}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                isDark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-[#64748B]"
              }`}
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
              isDark ? "bg-white/[0.06] text-slate-500" : "bg-slate-100 text-[#94A3B8]"
            }`}>
              +{skills.length - 3}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 text-[10px] mb-3 ${isDark ? "text-slate-400" : "text-[#94A3B8]"}`}>
          <FaCalendarCheck className="w-3 h-3 text-[#5CA347]" />
          {availability}
        </div>

        <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5CA347] to-[#4A8A3E] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          Book Session <FaArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
});

export default MentorCard;
