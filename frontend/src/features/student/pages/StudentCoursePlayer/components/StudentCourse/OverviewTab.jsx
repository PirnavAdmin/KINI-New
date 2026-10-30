import { memo } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaClock,
  FaSignal,
  FaGlobeAmericas,
  FaArrowRight,
} from "react-icons/fa";
import InstructorCard from "./InstructorCard";

const OverviewTab = memo(function OverviewTab({ course }) {
  return (
    <div className="space-y-6">
      {/* Course Description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-[#1F2937] rounded-xl p-5"
      >
        <h3 className="text-sm font-bold text-white mb-3">About This Course</h3>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          {course.longDescription || course.description}
        </p>
      </motion.div>

      {/* Learning Outcomes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#111827] border border-[#1F2937] rounded-xl p-5"
      >
        <h3 className="text-sm font-bold text-white mb-3">
          What You'll Learn
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {course.learningOutcomes.map((outcome, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#1E293B]/50"
            >
              <FaCheckCircle className="text-xs text-[#22C55E] mt-0.5 shrink-0" />
              <span className="text-xs text-[#D1D5DB]">{outcome}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            icon: FaStar,
            label: "Rating",
            value: course.rating,
            color: "text-[#F59E0B]",
            bg: "bg-[#F59E0B]/10",
          },
          {
            icon: FaUsers,
            label: "Students",
            value: (course.studentCount / 1000).toFixed(1) + "K",
            color: "text-[#0f55f7]",
            bg: "bg-[#0f55f7]/10",
          },
          {
            icon: FaSignal,
            label: "Level",
            value: course.difficulty,
            color: "text-[#22C55E]",
            bg: "bg-[#22C55E]/10",
          },
          {
            icon: FaClock,
            label: "Duration",
            value: course.estimatedCompletion,
            color: "text-[#06b6a8]",
            bg: "bg-[#06b6a8]/10",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#111827] border border-[#1F2937] rounded-xl p-3 text-center"
          >
            <div
              className={`w-8 h-8 mx-auto rounded-lg ${item.bg} flex items-center justify-center mb-2`}
            >
              <item.icon className={`text-sm ${item.color}`} />
            </div>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-[10px] text-[#6B7280]">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {course.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-[10px] font-medium text-[#9CA3AF] border border-[#1F2937]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Instructor */}
      <InstructorCard instructor={course.instructor} />
    </div>
  );
});

export default OverviewTab;

