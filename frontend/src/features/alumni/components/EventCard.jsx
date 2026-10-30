import { memo } from "react";
import { motion } from "framer-motion";
import { FaCalendar, FaMapMarkerAlt, FaUserTie, FaArrowRight } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const EventCard = memo(function EventCard({ event }) {
  const { isDark } = useThemeContext();
  const { title, date, location, speaker, description, registerLink } = event;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-white/[0.03] border-white/5 hover:border-[#085FA7]/20 hover:bg-white/[0.05]"
          : "bg-white/80 border-[#E5E7EB] hover:border-[#085FA7]/20 hover:shadow-lg"
      }`}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#085FA7] to-[#5CA347] rounded-l-2xl" />

      <div className="relative z-10 p-5 pl-6">
        <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#0F172A]"}`}>{title}</h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <FaCalendar className="w-3.5 h-3.5 text-[#085FA7]" />
            <span className={isDark ? "text-slate-300" : "text-[#64748B]"}>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaMapMarkerAlt className="w-3.5 h-3.5 text-[#5CA347]" />
            <span className={isDark ? "text-slate-300" : "text-[#64748B]"}>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaUserTie className="w-3.5 h-3.5 text-[#F0765B]" />
            <span className={isDark ? "text-slate-300" : "text-[#64748B]"}>{speaker}</span>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${isDark ? "text-slate-400" : "text-[#94A3B8]"}`}>
          {description}
        </p>

        <a
          href={registerLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
        >
          Register Now <FaArrowRight className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
});

export default EventCard;
