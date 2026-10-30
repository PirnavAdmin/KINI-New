import { memo } from "react";
import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaStar,
  FaUsers,
  FaGlobeAmericas,
  FaAward,
} from "react-icons/fa";

const InstructorCard = memo(function InstructorCard({ instructor }) {
  if (!instructor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"
    >
      <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
        Your Instructor
      </h3>

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">
            {instructor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">
            {instructor.name}
          </h4>
          <p className="text-[10px] text-[#0f55f7] mt-0.5">{instructor.title}</p>
        </div>
      </div>

      <p className="text-[11px] text-[#9CA3AF] leading-relaxed mt-3">
        {instructor.bio}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1F2937]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[#F59E0B]">
            <FaStar className="text-[10px]" />
            <span className="text-xs font-bold text-white">
              {instructor.rating}
            </span>
          </div>
          <p className="text-[9px] text-[#6B7280]">Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[#0f55f7]">
            <FaUsers className="text-[10px]" />
            <span className="text-xs font-bold text-white">
              {instructor.students / 1000}K
            </span>
          </div>
          <p className="text-[9px] text-[#6B7280]">Students</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[#22C55E]">
            <FaGraduationCap className="text-[10px]" />
            <span className="text-xs font-bold text-white">
              {instructor.courses}
            </span>
          </div>
          <p className="text-[9px] text-[#6B7280]">Courses</p>
        </div>
      </div>
    </motion.div>
  );
});

export default InstructorCard;

