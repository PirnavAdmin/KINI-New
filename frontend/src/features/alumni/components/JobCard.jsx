import { memo } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaArrowRight, FaWifi } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const JobCard = memo(function JobCard({ job }) {
  const { isDark } = useThemeContext();
  const { title, company, location, experience, salary, posted, remote, applyLink } = job;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-white/[0.03] border-white/5 hover:border-[#085FA7]/20 hover:bg-white/[0.05]"
          : "bg-white/80 border-[#E5E7EB] hover:border-[#085FA7]/20 hover:shadow-lg"
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-[#0F172A]"}`}>{title}</h3>
            <p className={`text-xs font-medium truncate ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>{company}</p>
          </div>
          {remote && (
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold ${
              isDark ? "bg-[#5CA347]/15 text-[#5CA347]" : "bg-[#EFF8ED] text-[#5CA347]"
            }`}>
              <FaWifi className="w-2.5 h-2.5" /> Remote
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <FaMapMarkerAlt className="w-3 h-3 text-[#085FA7]" />
            <span className={isDark ? "text-slate-400" : "text-[#64748B]"}>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaBriefcase className="w-3 h-3 text-[#5CA347]" />
            <span className={isDark ? "text-slate-400" : "text-[#64748B]"}>{experience}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaClock className="w-3 h-3 text-[#F0765B]" />
            <span className={isDark ? "text-slate-400" : "text-[#64748B]"}>{posted}</span>
          </div>
        </div>

        {/* Salary + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]/50 dark:border-white/5">
          <span className="text-sm font-bold bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
            {salary}
          </span>
          <a
            href={applyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Apply <FaArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
});

export default JobCard;
