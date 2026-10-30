import { memo } from "react";
import { motion } from "framer-motion";

const CourseProgress = memo(function CourseProgress({
  progress,
  completedLessons,
  totalLessons,
}) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
          Course Progress
        </span>
        <span className="text-sm font-bold text-white">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
        />
      </div>

      <p className="text-[10px] text-[#6B7280] mt-1.5">
        {completedLessons} of {totalLessons} lessons completed
      </p>

      {/* Milestones */}
      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[#1F2937]">
        {[25, 50, 75, 100].map((milestone) => (
          <div key={milestone} className="flex-1 text-center">
            <div
              className={`w-full h-1 rounded-full ${
                progress >= milestone
                  ? "bg-[#22C55E]"
                  : "bg-[#1F2937]"
              }`}
            />
            <span
              className={`text-[8px] mt-1 block ${
                progress >= milestone
                  ? "text-[#22C55E] font-medium"
                  : "text-[#6B7280]"
              }`}
            >
              {milestone}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default CourseProgress;

