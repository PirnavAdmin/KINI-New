import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, Maximize2, Minimize2, Sun, Moon,
  ChevronLeft, ChevronRight, Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Timer = ({ totalMinutes, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(totalMinutes * 60);
  const warning = timeLeft < 300;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const formatted = h > 0
    ? `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
    : `${m}:${s.toString().padStart(2, "0")}`;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold font-mono transition-all shadow-sm ${
      warning
        ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
        : "bg-[#F0F7FF] text-[#085FA7] border border-[#085FA7]/20"
    }`}>
      <Clock className={`w-4 h-4 ${warning ? "text-red-500" : "text-[#085FA7]"}`} />
      {formatted}
    </div>
  );
};

const AssessmentNavbar = ({
  assessmentName,
  timeMinutes = 45,
  onSubmit,
  onTimeUp,
  currentIndex,
  totalQuestions,
  onNext,
  onPrev,
}) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-2xl shadow-sm"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/student/assessments")}
            className="text-xs font-bold text-[#085FA7] hover:text-[#0B6FC7] transition-colors shrink-0 flex items-center gap-1"
          >
            ← Exit
          </button>
          <div className="h-5 w-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
              K
            </div>
            <h1 className="text-sm font-semibold text-[#0F172A] truncate max-w-[200px] sm:max-w-none">
              {assessmentName}
            </h1>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-[#085FA7] to-[#3D8B2E]"
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalQuestions - 1}
              className="p-1.5 rounded-lg hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Timer totalMinutes={timeMinutes} onTimeUp={onTimeUp} />

          <div className="h-5 w-px bg-[#E5E7EB]" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {}}
            className="p-2 rounded-lg hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] transition-all"
          >
            <Sun className="w-4 h-4" />
          </button>

          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#085FA7] to-[#3D8B2E] rounded-xl hover:shadow-lg hover:shadow-[#085FA7]/20 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default AssessmentNavbar;
