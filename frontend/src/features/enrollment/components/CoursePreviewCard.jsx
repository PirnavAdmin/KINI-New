import { motion } from "framer-motion";
import { FiStar, FiUsers, FiClock, FiBriefcase } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "#FFFFFF",
  text: dark ? "#F8FAFC" : BRAND.primary,
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textDim: dark ? "#64748B" : "#94A3B8",
});

// Shows only what the course record carries (public courses API: name, level,
// duration, price, organization). Ratings, students and a strike-through price
// appear only when the course actually has them.
const CoursePreviewCard = ({ course }) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);
  const rating = Number(course.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const hasDiscount = Number(course.originalPrice) > Number(course.price);
  const initial = String(course.name || "K").trim().charAt(0).toUpperCase();

  return (
    <motion.section
      aria-label="Selected course"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: theme.card,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.1)"}`,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 10px 30px -18px rgba(19,59,93,0.35)",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Course tile */}
        <div
          className="relative flex h-28 shrink-0 items-center justify-center overflow-hidden sm:h-auto sm:w-44"
          style={{ background: `linear-gradient(135deg, ${BRAND.secondary} 0%, #5B9BD5 60%, #9CC8EE 100%)` }}
        >
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span aria-hidden="true" className="text-5xl font-bold text-white drop-shadow-sm">{initial}</span>
          )}
          <span
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}
          >
            Course
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-xl font-bold leading-snug sm:text-2xl" style={{ fontFamily: "'Sora', sans-serif", color: theme.text }}>
              {course.name}
            </h2>
            {course.level && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ color: isDark ? "#BFDBFE" : BRAND.primary, backgroundColor: isDark ? "rgba(147,197,253,0.12)" : "#E8F1FA" }}
              >
                {course.level}
              </span>
            )}
          </div>

          {(hasRating || course.students != null) && (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
              {hasRating && (
                <span className="inline-flex items-center gap-1.5">
                  <FiStar aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold" style={{ color: theme.text }}>{rating.toFixed(1)}</span>
                  {course.reviewCount != null && <span style={{ color: theme.textDim }}>({Number(course.reviewCount).toLocaleString("en-IN")})</span>}
                </span>
              )}
              {course.students != null && (
                <span className="inline-flex items-center gap-1.5">
                  <FiUsers aria-hidden="true" className="h-4 w-4" />
                  {Number(course.students).toLocaleString("en-IN")} students
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: theme.textSecondary }}>
            {course.duration && (
              <span className="inline-flex items-center gap-2">
                <FiClock aria-hidden="true" className="h-4 w-4" style={{ color: BRAND.secondary }} />
                {course.duration}
              </span>
            )}
            {course.organizationName && (
              <span className="inline-flex items-center gap-2">
                <FiBriefcase aria-hidden="true" className="h-4 w-4" style={{ color: BRAND.secondary }} />
                Offered by {course.organizationName}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums" style={{ color: theme.text }}>{inr.format(Number(course.price) || 0)}</span>
            {hasDiscount && (
              <span className="text-base tabular-nums line-through" style={{ color: theme.textDim }}>{inr.format(Number(course.originalPrice))}</span>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CoursePreviewCard;
