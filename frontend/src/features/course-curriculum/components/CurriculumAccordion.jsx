import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, FileText, PenTool, Brain } from "lucide-react";
import LessonItem from "./LessonItem";

const CurriculumAccordion = ({ section, index: sectionIndex }) => {
  const [isOpen, setIsOpen] = useState(sectionIndex === 0);

  const completedCount = section.items.filter((i) => i.completed).length;

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#F8FAFC]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {String(sectionIndex + 1).padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">{section.title}</h3>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" /> {section.duration}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-500">{section.lessons} lessons</span>
                {section.assignments > 0 && (
                  <>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <PenTool className="w-3 h-3" /> {section.assignments}
                    </span>
                  </>
                )}
                {section.quiz > 0 && (
                  <>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Brain className="w-3 h-3" /> {section.quiz}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] rounded-full"
                  style={{ width: `${(completedCount / section.items.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#5CA347]">{completedCount}/{section.items.length}</span>
            </div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-[#E5E7EB]/50 bg-[#F8FAFC]/50">
              <div className="py-2 space-y-0.5">
                {section.items.map((lesson, i) => (
                  <LessonItem key={lesson.id} lesson={lesson} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurriculumAccordion;
