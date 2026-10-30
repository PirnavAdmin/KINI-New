import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Award, BarChart3, BookOpen, ChevronDown, CirclePlay, Filter, Search, TrendingUp, Users } from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";
import CourseCard from "@/components/student/courses/CourseCard";
import { saveStudentCoursePercentages } from "@features/student/utils/studentProgressAccess";
import { useStudentEnrollments } from "@features/student/hooks/useStudentEnrollments";
import { groupEnrollmentsByCourse } from "@features/student/utils/studentEnrollments";

const titleCase = (value) => String(value || "")
  .trim()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const studentCourseError = (error) => {
  const status = error?.response?.status;
  if (status === 400) return "The student information request was invalid. Please refresh and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to access this course information.";
  if (status === 404) return "No courses are currently assigned to your account.";
  if (status >= 500) return "Unable to load your courses right now. Please try again.";
  if (!error?.response) return "Unable to load your courses right now. Please check your connection and try again.";
  return "Unable to load your courses right now. Please try again.";
};

const normalizeCourse = (course = {}) => ({
  ...course,
  id: course.courseId ?? course.id,
  courseId: course.courseId ?? course.id,
  title: titleCase(course.courseName ?? course.title ?? course.name),
  batchId: course.batchId ?? course.batch?.id,
  batchName: titleCase(course.batchName ?? course.batch?.name),
  mentorId: course.mentorId ?? course.mentor?.id,
  mentorName: titleCase(course.mentorName ?? course.tutorName ?? course.mentor?.name),
  description: course.description ?? course.courseDescription ?? course.shortDescription,
  thumbnail: course.imageUrl ?? course.thumbnail ?? course.courseImage,
  progress: course.progress ?? course.progressPercentage ?? course.completionPercentage,
  status: course.status,
  assignedCourse: true,
});

// One card per course; a course in several batches lists all of them.
const toCourseRow = (item) => {
  const joined = (key) => [...new Set(item.batches.map((batch) => batch[key]).filter(Boolean))].join(", ");
  return {
    ...item.course,
    courseId: item.courseId ?? item.course?.courseId,
    courseName: item.courseName || undefined,
    batchId: item.batches[0]?.batchId ?? undefined,
    batchName: joined("batchName") || undefined,
    mentorId: item.batches[0]?.mentorId ?? item.mentorId ?? undefined,
    mentorName: joined("mentorName") || item.mentorName || undefined,
  };
};

// Mirrors the label CourseCard shows, so the status filter matches the pill.
const courseStatusLabel = (course = {}) => {
  const status = String(course.status ?? "").trim();
  const progress = Number(course.progress) || 0;
  if (status.toLowerCase() === "completed" || progress >= 100) return "Completed";
  if (!status || status.toLowerCase() === "true") return "Available";
  return titleCase(status);
};

const COURSE_FEATURES = [
  { Icon: CirclePlay, title: "Learn", text: "at Your Pace", tone: "blue" },
  { Icon: Users, title: "Attend", text: "Live Classes", tone: "orange" },
  { Icon: TrendingUp, title: "Track", text: "Your Progress", tone: "violet" },
  { Icon: Award, title: "Earn", text: "Certificates", tone: "green" },
];

const isArchived = (course = {}) => course.archived === true || String(course.status || "").toLowerCase() === "archived";

const CourseSkeleton = () => (
  <div className="min-h-[148px] animate-pulse rounded-[14px] border border-slate-200 bg-white p-2.5">
    <div className="mb-3 flex justify-between">
      <div className="h-9 w-9 rounded-[12px] bg-slate-200" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
    <div className="h-4 w-3/4 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-full rounded bg-slate-100" />
    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
    <div className="mt-4 h-3 w-1/2 rounded bg-slate-200" />
  </div>
);

export default function StudentCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("active");
  // Same enrollment source as My Batch (GET /api/v1/student/courses).
  const { status, enrollments, error: loadError, loading, reload } = useStudentEnrollments();
  const courses = useMemo(
    () => groupEnrollmentsByCourse(enrollments).map((item) => normalizeCourse(toCourseRow(item))),
    [enrollments],
  );
  const error = status === "not-student"
    ? "This page is available only to a student account."
    : status === "error" ? studentCourseError(loadError) : "";

  useEffect(() => {
    if (courses.length) saveStudentCoursePercentages(courses);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const value = query.trim().toLowerCase();
    return courses.filter((course) => {
      const completed = courseStatusLabel(course) === "Completed";
      if (tab === "active" && (isArchived(course) || completed)) return false;
      if (tab === "completed" && !completed) return false;
      if (statusFilter !== "all" && courseStatusLabel(course) !== statusFilter) return false;
      if (!value) return true;
      const searchable = [
        course.title,
        course.batchName,
        course.mentorName,
        course.status,
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(value);
    });
  }, [courses, query, statusFilter, tab]);

  const statusOptions = useMemo(
    () => [...new Set(courses.map(courseStatusLabel).filter(Boolean))].sort(),
    [courses],
  );

  const completedCount = courses.filter((course) => courseStatusLabel(course) === "Completed").length;
  const activeCount = courses.filter((course) => !isArchived(course) && courseStatusLabel(course) !== "Completed").length;
  const tabs = [
    { id: "active", label: "Active", count: activeCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "all", label: "All Courses", count: courses.length },
  ];
  const showProgress = searchParams.get("view") === "progress";
  const joiningLiveClass = searchParams.get("join") === "class";

  return (
    <div className="student-courses-page ksl-page w-full max-w-[1580px] px-0 py-0">
      <StudentPageBanner
        banner={STUDENT_BANNERS.myCourses}
        icon={BookOpen}
        eyebrow="My Courses"
        title="Keep Learning,"
        highlight="Build Your Future!"
        description={<>Access your enrolled courses, attend live classes, complete assessments<br className="ksl-hide-sm" /> and track your progress — all in one place.</>}
        features={COURSE_FEATURES}
      />
      <div className="ksl-tabs">
        <div className="ksx-tabs-left" role="tablist" aria-label="Course status">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`ksl-tab ${tab === item.id ? "ksl-tab--active" : ""}`}
            >
              {item.label} <span>{loading ? "" : `(${item.count})`}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setSearchParams(showProgress ? {} : { view: "progress" })} className="ksl-link-btn">
          <BarChart3 /> {showProgress ? "Hide Progress" : "Learning Progress"}
        </button>
      </div>
      <div className="ksl-courses-body">
      {joiningLiveClass && (
        <section className="mb-4 flex flex-col gap-3 rounded-xl border border-[#b9d2eb] bg-gradient-to-r from-[#f5f9ff] to-[#eefbfa] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-extrabold text-slate-900">Ready to join your live class?</p><p className="mt-1 text-xs text-slate-500">React.js Advanced Concepts · Today, 7:00 PM · John Doe</p></div>
          <button type="button" onClick={() => navigate('/student/my-classes?date=today')} className="rounded-lg bg-[#0f55f7] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0b43c3]">Open today&apos;s class</button>
        </section>
      )}
      {showProgress && (
        <section className="mb-4 rounded-xl border border-[#b9d2eb] bg-gradient-to-r from-[#f5f9ff] to-[#eefbfa] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-extrabold text-slate-900">Overall Learning Progress</p><p className="mt-1 text-xs text-slate-500">Track your completed lessons and continue where you left off.</p></div>
            <p className="text-2xl font-extrabold text-[#0f55f7]">72%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" /></div>
        </section>
      )}
      <div className="ksl-toolbar">
        <label className="ksl-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
          />
        </label>
        <label className="ksl-select">
          <Filter aria-hidden="true" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="all">All Statuses</option>
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="ksl-select__chevron" />
        </label>
      </div>

      {error && (
        <div className="mb-4 flex flex-col gap-3 rounded-[15px] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="self-start rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 1 }).map((_, index) => (
            <CourseSkeleton key={index} />
          ))}
        </div>
      ) : error ? null : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id ?? course.courseId ?? course.title}
              course={course}
              progress={course.progress}
              onLive={() => {
                try { sessionStorage.setItem("student-selected-course", JSON.stringify(course)); } catch { /* Continue without storage. */ }
                navigate(`/student/courses/${course.id ?? course.courseId}?focus=classes`);
              }}
              onOpen={() => {
                try {
                  sessionStorage.setItem("student-selected-course", JSON.stringify(course));
                } catch { /* Navigation must still work when storage is unavailable. */ }
                navigate(`/student/courses/${course.id ?? course.courseId}`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <BookOpen className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-slate-800">
            {query || statusFilter !== "all" ? "No matching courses found." : tab === "completed" ? "No completed courses yet" : "No Course Assigned"}
          </p>
          <p className="mt-1 text-sm text-[#8797b6]">
            {query || statusFilter !== "all" ? "Try a different search term or status." : tab === "completed" ? "Courses you finish will appear here." : "You haven't been assigned to a course yet. Please contact your organization administrator."}
          </p>
        </div>
      )}</div>
    </div>
  );
}
