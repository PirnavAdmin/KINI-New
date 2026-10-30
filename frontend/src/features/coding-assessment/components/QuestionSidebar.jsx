import { motion } from "framer-motion";
import { Flag } from "lucide-react";

const QuestionSidebar = ({
  questions,
  currentIndex,
  onSelect,
  answers,
  markedForReview,
}) => {
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const getStatus = (qId, idx) => {
    if (idx === currentIndex) return "current";
    if (markedForReview.has(qId)) return "review";
    if (answers[qId] !== undefined) return "answered";
    return "unanswered";
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full h-full flex flex-col bg-white border-r border-[#E5E7EB]"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-xs font-bold text-white">
            K
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A]">Questions</h3>
            <p className="text-[10px] text-slate-500">{answeredCount} of {totalQuestions} answered</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347]"
          />
        </div>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#5CA347]" />
            <span>{answeredCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#F0765B]" />
            <span>{markedForReview.size}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
            <span>{totalQuestions - answeredCount}</span>
          </div>
        </div>
      </div>

      {/* Question grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, idx) => {
            const status = getStatus(q.id, idx);
            return (
              <button
                key={q.id}
                onClick={() => onSelect(idx)}
                className={`relative w-full aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-sm ${
                  status === "current"
                    ? "ring-2 ring-[#085FA7] ring-offset-2 bg-[#085FA7] text-white"
                    : status === "answered"
                    ? "bg-[#5CA347]/10 text-[#5CA347] border border-[#5CA347]/30"
                    : status === "review"
                    ? "bg-[#F0765B]/10 text-[#F0765B] border border-[#F0765B]/30"
                    : "bg-white text-slate-500 border border-[#E5E7EB] hover:border-[#085FA7]/30 hover:text-[#085FA7]"
                }`}
              >
                {idx + 1}
                {status === "review" && (
                  <Flag className="absolute -top-1 -right-1 w-2.5 h-2.5 text-[#F0765B] fill-[#F0765B]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend footer */}
      <div className="p-3 border-t border-[#E5E7EB] text-[10px] text-slate-400 text-center flex items-center justify-center gap-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5CA347]" /> Done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F0765B]" /> Review</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5E7EB]" /> Left</span>
      </div>
    </motion.aside>
  );
};

export default QuestionSidebar;
