import { motion } from "framer-motion";
import { Play, Send, RotateCcw, ChevronLeft, ChevronRight, Flag } from "lucide-react";

const ActionBar = ({
  onRun,
  onSubmit,
  onReset,
  onPrev,
  onNext,
  onToggleReview,
  isReviewing,
  canGoPrev,
  canGoNext,
  isRunning,
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 py-2.5 border-t border-[#E5E7EB] bg-white shadow-sm"
    >
      {/* Left: Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-[#085FA7] hover:bg-[#F0F7FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-[#085FA7] hover:bg-[#F0F7FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Review + Reset */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleReview}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            isReviewing
              ? "bg-[#F0765B]/10 text-[#C85A3E] border border-[#F0765B]/30 shadow-sm"
              : "text-slate-500 hover:text-[#C85A3E] hover:bg-[#F0765B]/5"
          }`}
        >
          <Flag className={`w-3.5 h-3.5 ${isReviewing ? "fill-[#F0765B]" : ""}`} />
          Review
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-[#F8FAFC] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Right: Run + Submit */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-2 border-[#085FA7] text-[#085FA7] hover:bg-[#F0F7FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          Run Code
        </button>
        <button
          onClick={onSubmit}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#085FA7] to-[#3D8B2E] hover:shadow-lg hover:shadow-[#085FA7]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          Submit
        </button>
      </div>
    </motion.div>
  );
};

export default ActionBar;
