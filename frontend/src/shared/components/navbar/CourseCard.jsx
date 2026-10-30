import { memo } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import Badge from "./Badge";
import { focusRing } from "./constants";

const CourseCard = memo(function CourseCard({ course }) {
  return (
    <Link
      to="/courses"
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer border border-transparent
        hover:bg-slate-50 hover:border-slate-200 ${focusRing}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold truncate leading-tight text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
            {course.title}
          </p>
          <Badge label={course.badge} />
        </div>
        <p className="text-xs leading-relaxed line-clamp-2 text-slate-500">
          {course.desc}
        </p>
      </div>
      <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-1 transition-all duration-300 group-hover:translate-x-0.5 text-slate-300 group-hover:text-slate-500" />
    </Link>
  );
});

export default CourseCard;
