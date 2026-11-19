import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, RotateCcw, Search, Tag, X } from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { ROUTES } from "@shared/constants/routeConstants";
import { writeEnrollmentDraft } from "@features/enrollment/utils/enrollmentDraft";
import { fadeUp, staggerContainer } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import { courseCatalogErrorMessage, getPublicCourses } from "@landing-shared/services/courseCatalogService";
import { coursePosterUrl } from "@/pages/courses/coursePosterUtils";

const ALL_PAGE_SIZE = 100; // backend maximum per page
const SEARCH_DEBOUNCE_MS = 350;
const DESCRIPTION_FALLBACK = "Live, mentor-led sessions with hands-on projects. Enroll to get the full curriculum.";

// Same card gradients the static programs used, cycled so neighbours differ.
const GRADIENTS = [
  "from-primary-500 to-primary-400",
  "from-primary-700 to-primary-500",
  "from-secondary-500 to-secondary-400",
  "from-primary-600 to-secondary-500",
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatPrice = (price) => {
  const amount = Number(price);
  return Number.isFinite(amount) && amount > 0 ? inr.format(amount) : "Contact for fee";
};

// API row -> card. Internal identifiers (organizationId, batchIds, pdfUrl)
// are left out; courseId is used only as the key.
const toCard = (course, index) => {
  const title = String(course.courseName ?? "").trim() || "Untitled program";
  const totalAssessments = Number(course.totalAssessments) || 0;
  return {
    id: course.courseId,
    title,
    letter: title.charAt(0).toUpperCase(),
    poster: coursePosterUrl(course.posterUrl),
    desc: course.description?.trim() || DESCRIPTION_FALLBACK,
    duration: course.duration || "Duration to be announced",
    level: course.level || "",
    price: formatPrice(course.price),
    organizationName: course.organizationName || "",
    gradient: GRADIENTS[index % GRADIENTS.length],
    // What /enrollment needs: the real price, and the organization that
    // reviews the request. Never rendered on the card.
    enrollment: {
      id: course.courseId,
      courseId: course.courseId,
      title,
      price: Number(course.price),
      duration: course.duration || "",
      level: course.level || "",
      organizationId: course.organizationId,
      organizationName: course.organizationName || "",
    },
    details: [
      course.level && `${course.level} level`,
      course.duration && `${course.duration} program`,
      `Course fee: ${formatPrice(course.price)}`,
      totalAssessments > 0 && `${totalAssessments} assessment${totalAssessments === 1 ? "" : "s"}`,
      course.organizationName && `Offered by ${course.organizationName}`,
    ].filter(Boolean),
  };
};

// ─── Poster area ─────────────────────────────────────────────────────────────
// The organization's uploaded poster, or the letter tile on the card gradient
// when there is none (or the image fails to load). Same height either way.
function CoursePosterMedia({ course }) {
  const [failed, setFailed] = useState(null);
  const showPoster = course.poster && failed !== course.poster;
  return (
    <div className={`relative h-[136px] w-full shrink-0 overflow-hidden rounded-t-[22px] ${showPoster ? "bg-ink-900/5" : `bg-gradient-to-br ${course.gradient}`}`}>
      {showPoster ? (
        <img
          src={course.poster}
          alt={`${course.title} course poster`}
          loading="lazy"
          decoding="async"
          width={400}
          height={136}
          onError={() => setFailed(course.poster)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-lg ring-4 ring-white/20">
            {course.letter}
          </div>
        </div>
      )}
      {course.level && (
        <span className="absolute right-3 top-3 rounded-pill bg-white/90 px-3 py-1 text-[11px] font-bold text-ink-900 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-ink-900/85 dark:text-white">
          {course.level}
        </span>
      )}
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────────────
function CourseCard({ course, isFlipped, onFlip, isDark }) {
  const navigate = useNavigate();

  // Same hand-off the cart and curriculum pages use: the draft carries the
  // course, ?courseId= names it, and /enrollment runs form → payment →
  // organization approval request.
  const enroll = () => {
    writeEnrollmentDraft({ course: course.enrollment, organizationId: course.enrollment.organizationId, step: "landing" });
    navigate(`${ROUTES.PUBLIC.ENROLLMENT}?courseId=${encodeURIComponent(course.id)}`);
  };

  return (
    <div className="relative h-[400px] w-full [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* FRONT */}
        <button
          type="button"
          onClick={() => onFlip(true)}
          aria-hidden={isFlipped}
          tabIndex={isFlipped ? -1 : 0}
          aria-label={`View details for ${course.title}`}
          className={`absolute inset-0 h-full w-full rounded-3xl p-[2px] bg-gradient-to-br ${course.gradient} transition-all duration-300 shadow-card hover:shadow-card-lg hover:-translate-y-1.5 [backface-visibility:hidden]`}
        >
          <div
            className={`flex h-full w-full flex-col overflow-hidden rounded-[22px] text-left ${
              isDark ? "bg-ink-900" : "bg-white"
            }`}
          >
            <CoursePosterMedia course={course} />
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-3.5">
            <h3 className={`line-clamp-2 font-display text-base font-bold leading-snug ${isDark ? "text-white" : "text-ink-900"}`}>
              {course.title}
            </h3>
            <p className={`mt-1.5 line-clamp-2 text-sm leading-relaxed ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
              {course.desc}
            </p>

            <div className={`mt-3 flex flex-wrap gap-3 text-xs font-semibold ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                {course.price}
              </span>
            </div>

            {course.organizationName && (
              <p className={`mt-2 text-xs ${isDark ? "text-white/40" : "text-ink-900/40"}`}>
                by {course.organizationName}
              </p>
            )}

            <div className={`mt-auto flex items-center justify-center border-t pt-3 ${isDark ? "border-white/10" : "border-ink-900/[0.06]"}`}>
              <span className="flex items-center gap-1 text-xs font-bold text-primary-500">
                See details <RotateCcw className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
            </div>
          </div>
        </button>

        {/* BACK */}
        <div
          aria-hidden={!isFlipped}
          className={`absolute inset-0 flex h-full w-full flex-col rounded-3xl border border-white/20 p-5 text-white shadow-2xl [backface-visibility:hidden] bg-gradient-to-br ${course.gradient}`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Program details</p>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug">{course.title}</h3>

          <ul className="mt-3 flex-1 space-y-2">
            {course.details.map((detail) => (
              <li key={detail} className="flex items-start gap-2 text-sm font-medium text-white/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-2 border-t border-white/20 pt-3">
            <button
              type="button"
              onClick={enroll}
              tabIndex={isFlipped ? 0 : -1}
              className="w-full rounded-pill bg-white px-4 py-2.5 text-xs font-bold text-ink-900 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Enroll Now
            </button>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onFlip(false)}
                tabIndex={isFlipped ? 0 : -1}
                aria-label={`Back to ${course.title} overview`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCardSkeleton({ isDark }) {
  const bar = isDark ? "bg-white/10" : "bg-ink-900/[0.06]";
  return (
    <div className={`h-[400px] w-full animate-pulse overflow-hidden rounded-3xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-ink-900/[0.06] bg-white shadow-sm"}`}>
      <div className={`h-[136px] w-full ${bar}`} />
      <div className="px-5">
      <div className={`mt-4 h-5 w-3/4 rounded ${bar}`} />
      <div className={`mt-3 h-4 w-full rounded ${bar}`} />
      <div className={`mt-2 h-4 w-2/3 rounded ${bar}`} />
      <div className={`mt-4 h-4 w-1/2 rounded ${bar}`} />
      </div>
    </div>
  );
}

function StatePanel({ isDark, children }) {
  return (
    <div
      className={`col-span-full rounded-card border p-10 text-center ${
        isDark ? "border-white/10 bg-white/[0.02]" : "border-ink-900/[0.06] bg-white shadow-sm"
      }`}
    >
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
// Loads the public catalogue: the first `limit` courses (server order), or
// every page when no limit is given.
async function loadCourses({ search, limit, signal }) {
  if (limit) {
    const result = await getPublicCourses({ search, page: 1, pageSize: limit, signal });
    return result.courses.slice(0, limit);
  }
  const first = await getPublicCourses({ search, page: 1, pageSize: ALL_PAGE_SIZE, signal });
  const courses = [...first.courses];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await getPublicCourses({ search, page, pageSize: ALL_PAGE_SIZE, signal });
    courses.push(...next.courses);
  }
  return courses;
}

/**
 * "Programs Built Around Outcomes" course grid.
 * - limit: show only the first N courses plus a "View All Courses" link (home page).
 * - no limit: every public course (the /programs page).
 */
export default function FeaturedCourses({ limit, eyebrow = "Career Programs" }) {
  const { isDark } = useThemeContext();
  const [flippedId, setFlippedId] = useState(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Server-side search on the public catalogue. Typing is debounced, and a
  // newer request aborts the previous one so results never arrive out of order.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const rows = await loadCourses({ search, limit, signal: controller.signal });
        setCourses(rows.map(toCard));
      } catch (requestError) {
        if (controller.signal.aborted) return;
        const { config, response } = requestError ?? {};
        console.error("Failed to load public courses", {
          status: response?.status,
          url: config ? `${config.baseURL || window.location.origin}${config.url}` : undefined,
          params: config?.params,
          ngrokError: response?.headers?.["ngrok-error-code"],
          error: requestError,
        });
        setCourses([]);
        setError(courseCatalogErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? SEARCH_DEBOUNCE_MS : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, reloadKey, limit]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setFlippedId(null);
  };

  const clearSearch = () => {
    setSearch("");
    setFlippedId(null);
  };

  return (
    <Section id="courses" className={isDark ? "bg-app-dark-gradient" : "bg-white"}>
      <SectionHeader
        eyebrow={eyebrow}
        heading={
          <>
            Programs Built Around{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Outcomes
            </span>
          </>
        }
        subheading="Every track ships real projects, live mentorship, and a placement target, not just a syllabus."
      />

      {/* Search Bar */}
      <div className="mx-auto mt-8 max-w-md">
        <label htmlFor="course-search" className="sr-only">
          Search programs
        </label>
        <div
          className={`flex items-center gap-2 rounded-pill border px-4 py-2.5 transition-colors focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 ${
            isDark ? "border-white/10 bg-white/[0.03]" : "border-ink-900/[0.08] bg-white shadow-sm"
          }`}
        >
          <Search className={`h-4 w-4 ${isDark ? "text-white/40" : "text-ink-900/40"}`} aria-hidden="true" />
          <input
            id="course-search"
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search programs by name or skill..."
            className={`min-w-0 w-full border-0! bg-transparent text-sm outline-none! shadow-none! ring-0! ${
              isDark ? "text-white placeholder:text-white/30" : "text-ink-900 placeholder:text-ink-900/30"
            }`}
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-ink-900/5"
              }`}
            >
              <X className={`h-4 w-4 ${isDark ? "text-white/50" : "text-ink-900/40"}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Course Grid – live public catalogue */}
      <div className="mt-10" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div role="status" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit ? Math.min(limit, 6) : 3 }).map((_, index) => <CourseCardSkeleton key={index} isDark={isDark} />)}
            <span className="sr-only">Loading programs…</span>
          </div>
        ) : error ? (
          <StatePanel isDark={isDark}>
            <AlertCircle className="mx-auto h-6 w-6 text-secondary-500" aria-hidden="true" />
            <p className={`mt-3 text-sm font-semibold ${isDark ? "text-white/70" : "text-ink-900/60"}`}>{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 rounded-pill bg-primary-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-600"
            >
              Retry
            </button>
          </StatePanel>
        ) : courses.length === 0 ? (
          <StatePanel isDark={isDark}>
            <p className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-ink-900/60"}`}>
              No programs found. Try another search.
            </p>
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-3 text-sm font-medium text-primary-500 underline underline-offset-2 hover:text-primary-600"
              >
                Clear search and show all
              </button>
            )}
          </StatePanel>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-80px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            key={search}
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={fadeUp}>
                <CourseCard
                  course={course}
                  isDark={isDark}
                  isFlipped={flippedId === course.id}
                  onFlip={(next) => setFlippedId(next ? course.id : null)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {limit && !loading && !error && (
        <div className="mt-10 flex justify-center">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 rounded-pill bg-[#FF981B] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(255,152,27,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f08a0c] hover:shadow-[0_14px_28px_-8px_rgba(255,152,27,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF981B] focus-visible:ring-offset-2"
          >
            View All Courses <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </Section>
  );
}
