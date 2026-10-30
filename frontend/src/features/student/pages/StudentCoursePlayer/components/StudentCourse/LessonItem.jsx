import { memo } from "react";
import { motion } from "framer-motion";
import {
  FaPlayCircle,
  FaLock,
  FaCheckCircle,
  FaFileAlt,
  FaCode,
} from "react-icons/fa";
import { FiFileText } from "react-icons/fi";

const TYPE_ICONS = {
  video: FaPlayCircle,
  quiz: FaFileAlt,
  project: FaCode,
  reading: FiFileText,
};

const LessonItem = memo(function LessonItem({
  lesson,
  isActive,
  isCompleted,
  assessmentPassed = false,
  onClick,
  index,
}) {
  const TypeIcon = TYPE_ICONS[lesson.type] || FaPlayCircle;

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer group ${
        isActive
          ? "bg-[#0f55f7]/15 border border-[#0f55f7]/30"
          : "hover:bg-[#1E293B] border border-transparent"
      } ${lesson.isLocked ? "opacity-50" : ""}`}
      aria-label={`${lesson.title} - ${lesson.duration} - ${
        isCompleted ? "Completed" : isActive ? "Currently playing" : ""
      }`}
      disabled={lesson.isLocked}
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isActive
            ? "bg-[#0f55f7]"
            : isCompleted
            ? "bg-[#22C55E]/20"
            : "bg-[#1E293B]"
        }`}
      >
        {lesson.isLocked ? (
          <FaLock className="text-xs text-[#6B7280]" />
        ) : isCompleted ? (
          <FaCheckCircle className="text-xs text-[#22C55E]" />
        ) : isActive ? (
          <FaPlayCircle className="text-xs text-white" />
        ) : (
          <TypeIcon className="text-xs text-[#6B7280]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-medium truncate ${
            isActive ? "text-white" : "text-[#D1D5DB]"
          }`}
        >
          {lesson.title}
        </p>
        <p className="text-[10px] text-[#6B7280] mt-0.5">{lesson.duration}</p>
        {lesson.assessment && (
          <p className={`text-[10px] mt-0.5 ${assessmentPassed ? "text-[#22C55E]" : "text-amber-400"}`}>
            {assessmentPassed ? "Assessment passed" : "Assessment required"}
          </p>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeLesson"
          className="w-1.5 h-1.5 rounded-full bg-[#0f55f7] shrink-0"
        />
      )}
    </motion.button>
  );
});

export default LessonItem;

