import { motion } from "framer-motion";
import { FiClock, FiMonitor, FiUser, FiBriefcase, FiAward, FiCheckCircle } from "react-icons/fi";

/**
 * CourseSummaryCard
 * Displays the course being purchased — thumbnail, key facts, and
 * highlight badges (placement assistance, certificate).
 *
 * @param {object} course - course details object (see mockData.COURSE_DATA)
 */
const CourseSummaryCard = ({ course }) => {
  const facts = [
    { icon: FiClock, label: "Duration", value: course.duration },
    { icon: FiMonitor, label: "Mode", value: course.mode },
    { icon: FiUser, label: "Mentor", value: course.trainer },
    { icon: FiBriefcase, label: "Projects", value: `${course.projects} Real-world Projects` },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20"
    >
      {/* Thumbnail */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden">
        <img
          src={course.thumbnail}
          alt={`${course.name} thumbnail`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-1 backdrop-blur-sm">
            Bestseller
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug">
          {course.name}
        </h2>

        {/* Facts grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-3"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/15 to-purple-500/15 shrink-0">
                <Icon className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {course.placementAssistance && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1.5">
              <FiCheckCircle className="w-3.5 h-3.5" />
              Placement Assistance Included
            </span>
          )}
          {course.certificateIncluded && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 bg-purple-400/10 border border-purple-400/20 rounded-full px-3 py-1.5">
              <FiAward className="w-3.5 h-3.5" />
              Certificate of Completion
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CourseSummaryCard;
