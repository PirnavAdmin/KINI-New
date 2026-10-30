import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CourseProgress from "./CourseProgress";
import LessonSearch from "./LessonSearch";
import LessonAccordion from "./LessonAccordion";

const CourseSidebar = memo(function CourseSidebar({
  course,
  currentLessonId,
  completedIds,
  collapsed,
  onToggle,
  searchQuery,
  onSearchChange,
  expandedSections,
  onToggleSection,
  filteredSections,
  onSelectLesson,
  passedAssessmentIds = [],
  passedSectionAssessmentIds = [],
  onStartAssessment,
  progress,
}) {
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -left-3 top-16 w-6 h-6 rounded-full bg-[#1E293B] border border-[#1F2937] items-center justify-center text-[#6B7280] hover:text-white hover:bg-[#2A3A4E] transition-all z-10 cursor-pointer"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <FaChevronLeft className="text-[8px]" />
        ) : (
          <FaChevronRight className="text-[8px]" />
        )}
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={collapsed ? "collapsed" : "expanded"}
          initial={{ width: collapsed ? 0 : 300, opacity: collapsed ? 0 : 1 }}
          animate={{ width: collapsed ? 0 : 300, opacity: collapsed ? 0 : 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`hidden lg:block overflow-hidden ${
            collapsed ? "w-0" : "w-[300px]"
          } shrink-0`}
        >
          <div className="w-[300px] space-y-2.5">
            {/* Progress */}
            <CourseProgress
              progress={progress}
              completedLessons={completedIds.length}
              totalLessons={course.totalLessons}
            />

            {/* Search */}
            <LessonSearch
              value={searchQuery}
              onChange={onSearchChange}
            />

            {/* Section Accordions */}
            <div className="space-y-1.5 max-h-[calc(100vh-245px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1F2937] scrollbar-track-transparent pr-1">
              {filteredSections.map((section, i) => (
                <LessonAccordion
                  key={section.id}
                  section={section}
                  isExpanded={expandedSections.includes(section.id)}
                  onToggle={onToggleSection}
                  currentLessonId={currentLessonId}
                  completedIds={completedIds}
                  passedAssessmentIds={passedAssessmentIds}
                  passedSectionAssessmentIds={passedSectionAssessmentIds}
                  onSelectLesson={onSelectLesson}
                  onStartAssessment={onStartAssessment}
                  index={i}
                />
              ))}

              {filteredSections.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-[#6B7280]">No lessons found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile bottom sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-[#0F172A] border-t border-[#1F2937] rounded-t-2xl p-3">
          <CourseProgress
            progress={progress}
            completedLessons={completedIds.length}
            totalLessons={course.totalLessons}
          />
          <details className="mt-2">
            <summary className="text-xs font-medium text-[#0f55f7] cursor-pointer list-none flex items-center gap-1">
              View Curriculum
              <FaChevronRight className="text-[10px]" />
            </summary>
            <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
              {filteredSections.map((section, i) => (
                <LessonAccordion
                  key={section.id}
                  section={section}
                  isExpanded={true}
                  onToggle={() => {}}
                  currentLessonId={currentLessonId}
                  completedIds={completedIds}
                  passedAssessmentIds={passedAssessmentIds}
                  passedSectionAssessmentIds={passedSectionAssessmentIds}
                  onSelectLesson={onSelectLesson}
                  onStartAssessment={onStartAssessment}
                  index={i}
                />
              ))}
            </div>
          </details>
        </div>
      </div>
    </>
  );
});

export default CourseSidebar;

