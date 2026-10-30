import { Clock, User } from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";

/**
 * Renders whatever fields the given course object has — course data
 * shapes differ across the app (marketing cards use title/duration/
 * salary/gradient, the standalone program page uses title/instructor/
 * price/image) so every field here is optional except title.
 */
export default function CoursePreviewCard({ course }) {
  const { isDark } = useThemeContext();
  if (!course) return null;

  const meta = [course.duration, course.instructor].filter(Boolean);
  const priceLabel = course.price ?? course.salary;

  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border p-3.5 ${
        isDark ? "border-white/10 bg-white/[0.03]" : "border-ink-900/[0.06] bg-porcelain"
      }`}
    >
      {course.image ? (
        <img
          src={course.image}
          alt=""
          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white ${
            course.gradient ?? "from-primary-500 to-secondary-500"
          }`}
          aria-hidden="true"
        >
          {course.title?.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-ink-900"}`}>{course.title}</p>
        {meta.length > 0 && (
          <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {course.duration}
              </span>
            )}
            {course.instructor && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {course.instructor}
              </span>
            )}
          </div>
        )}
      </div>

      {priceLabel && (
        <span className={`flex-shrink-0 font-display text-sm font-semibold ${isDark ? "text-white" : "text-ink-900"}`}>
          {priceLabel}
        </span>
      )}
    </div>
  );
}
