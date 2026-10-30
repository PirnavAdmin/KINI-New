import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaClock, FaClipboardCheck, FaLock, FaCheckCircle } from "react-icons/fa";
import LessonItem from "./LessonItem";

const LessonAccordion = memo(function LessonAccordion({
  section,
  isExpanded,
  onToggle,
  currentLessonId,
  completedIds,
  passedAssessmentIds = [],
  passedSectionAssessmentIds = [],
  onSelectLesson,
  onStartAssessment,
  index,
}) {
  const completedInSection = section.lessons.filter((l) =>
    completedIds.includes(l.id)
  ).length;
  const hasAssessment = Boolean(section.sectionAssessment);
  const assessmentPassed = passedSectionAssessmentIds.includes(section.id) || section._assessmentPassed;
  const canStartAssessment = hasAssessment && section._allCompleted && !section._isLocked;

  return (
    <div className="border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => onToggle(section.id)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#111827] hover:bg-[#1A2332] transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-label={`${section.title} - ${completedInSection}/${section.lessons.length} lessons`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0f55f7]">
              Section {index + 1}
            </span>
            {assessmentPassed ? (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-medium">
                Passed
              </span>
            ) : completedInSection === section.lessons.length && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                Assessment
              </span>
            )}
            {section._isLocked && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-700/70 px-1.5 py-0.5 text-[8px] font-semibold text-slate-300">
                <FaLock className="text-[7px]" /> Locked
              </span>
            )}
          </div>
          <h3 className="text-[13px] font-semibold text-white mt-0.5">
            {section.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#6B7280]">
              {completedInSection}/{section.lessons.length}
            </span>
            <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
              <FaClock className="text-[8px]" />
              {section.duration}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="text-xs text-[#6B7280]" />
        </motion.div>
      </button>

      {/* Lessons List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
              {section.lessons.map((lesson, i) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isActive={currentLessonId === lesson.id}
                  isCompleted={completedIds.includes(lesson.id)}
                  assessmentPassed={lesson._isAssessmentPassed || passedAssessmentIds.includes(lesson.id)}
                  onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                  index={i}
                />
              ))}
              {hasAssessment && (
                <button
                  type="button"
                  onClick={() => canStartAssessment && onStartAssessment?.(section)}
                  disabled={!canStartAssessment || assessmentPassed}
                  className={`-order-1 mb-1.5 mt-1.5 w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                    assessmentPassed
                      ? "border-[#22C55E]/25 bg-[#22C55E]/10 text-[#22C55E]"
                      : canStartAssessment
                        ? "cursor-pointer border-amber-500/35 bg-gradient-to-r from-amber-500/[0.14] to-orange-500/[0.09] text-white hover:border-amber-400/55 hover:from-amber-500/[0.19]"
                        : "cursor-not-allowed border-[#273244] bg-[#111827] text-[#6B7280] opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      assessmentPassed ? "bg-[#22C55E]/20" : canStartAssessment ? "bg-amber-500/20" : "bg-[#1E293B]"
                    }`}>
                      {assessmentPassed ? (
                        <FaCheckCircle className="text-sm text-[#22C55E]" />
                      ) : canStartAssessment ? (
                        <FaClipboardCheck className="text-sm text-amber-400" />
                      ) : (
                        <FaLock className="text-xs text-[#6B7280]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold ${assessmentPassed ? "text-[#22C55E]" : canStartAssessment ? "text-amber-300" : "text-slate-400"}`}>
                          {assessmentPassed ? "Assessment Passed" : "Assessment Required"}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${assessmentPassed ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-amber-500/15 text-amber-300"}`}>
                          {assessmentPassed ? "PASSED" : "80% TO PASS"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] font-semibold text-slate-200">
                        {section.sectionAssessment.title}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-[#8B98AA]">
                        {assessmentPassed
                          ? "Great work! The next section is now unlocked."
                          : canStartAssessment
                            ? "Pass this assessment with 80% or higher to continue."
                            : "Complete every lesson in this section to unlock the assessment."}
                      </p>
                      {canStartAssessment && !assessmentPassed && (
                        <span className="mt-2 inline-flex h-7 items-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-[10px] font-extrabold text-white shadow-lg shadow-orange-950/25">
                          Take Assessment&nbsp; →
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default LessonAccordion;

