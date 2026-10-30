/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Globe,
  House,
  Info,
  Layers3,
  Monitor,
  MoreHorizontal,
  Pencil,
  ReceiptText,
  ScrollText,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useCourses from "@/hooks/useCourses";
import { courseService } from "@/shared/services/courseService";
import { batchService } from "@/shared/services/batchService";
import { tutorService } from "@/shared/services/tutorService";
import { assessmentService } from "@/services/assessmentService";
import { studentsApi } from "@/api/students";
import CourseTechIcon from "@/shared/components/course/CourseTechIcon";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import SyllabusBuilder from "./SyllabusBuilder";
import CoursePdfAttachment from "./CoursePdfAttachment";

const TABS = [
  "Overview",
  "Syllabus",
  "Batches",
  "Students",
  "Assessments",
];
const TAB_ICONS = {
  Overview: House,
  Syllabus: ScrollText,
  Batches: BriefcaseBusiness,
  Students: Users,
  Assessments: ClipboardCheck,
};
const keyOf = (label) => label.toLowerCase().replace(/\s+/g, "-");
const displayCourseName = (value) =>
  String(value ?? "Course").replace(/([a-z])([A-Z])/g, "$1 $2");
const durationValue = (value) =>
  String(value ?? "")
    .replace(/\s*months?\s*$/i, "")
    .trim() || "0";
const tabOf = (key) => TABS.find((label) => keyOf(label) === key) || "Overview";
const rows = (value) =>
  Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const txt = (value, fallback = "—") =>
  value === undefined || value === null || value === ""
    ? fallback
    : String(value);
const num = (value) => Number(value ?? 0);
const currency = (value) => `₹${num(value).toLocaleString("en-IN")}`;
const date = (value) =>
  value && value !== "—" && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
// "3" → "3 months"; values that already carry a unit ("24 Weeks") stay as-is.
const withUnit = (value) =>
  /^\d+(\.\d+)?$/.test(String(value ?? "").trim()) ? `${value} months` : txt(value);
const yesNo = (value) =>
  value === undefined || value === null || value === ""
    ? "—"
    : typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value);

/* ─── Design tokens (Kini EduHub) ───────────────────────────────────────── */
const NAVY = "#133B5D";
const ORANGE = "#F39924";
const CARD =
  "rounded-[18px] border border-[#E4ECF5] bg-white shadow-[0_6px_22px_rgba(19,59,93,.06)]";
const TONES = {
  blue: { bg: "#EEF4FF", border: "#DCE8FB", tile: "#DCE8FD", icon: "#2563EB" },
  green: { bg: "#ECF8F2", border: "#D5EFE2", tile: "#D6F2E4", icon: "#059669" },
  purple: { bg: "#F4EEFF", border: "#E7DCFC", tile: "#E8DDFD", icon: "#7C3AED" },
  orange: { bg: "#FFF4E6", border: "#FBE3C4", tile: "#FFE6C7", icon: "#F08A0C" },
};

function Empty({ icon: Icon = FileText, title, text }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
      <div>
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-50 text-slate-500 shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-2.5 text-sm font-bold text-slate-800">{title}</h3>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

// Section card: tinted icon tile + title/subtitle, optional action on the right.
function Panel({ title, subtitle, action, icon: Icon = FileText, tone = "orange", children, className = "" }) {
  const t = TONES[tone];
  return (
    <section className={`${CARD} min-w-0 p-4 sm:p-5 lg:rounded-[14px] lg:p-4 ${className}`}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl lg:h-[38px] lg:w-[38px] lg:rounded-xl"
            style={{ backgroundColor: t.bg, color: t.icon }}
          >
            <Icon className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-bold text-[#102D50] sm:text-lg lg:!text-[15px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-slate-500 lg:!text-[12px]">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Table({ headers, children, empty }) {
  if (!children?.length) return empty;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E4ECF5] bg-white">
      <table className="w-full min-w-[850px] text-left text-[13px]">
        <thead className="bg-[#F6F9FD] text-[11px] uppercase tracking-[0.06em] text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="h-11 px-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// Label/value tile with an outlined icon box (Course Information grid).
function InfoTile({ icon: Icon = Info, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3.5 rounded-2xl border border-[#E4ECF5] bg-white p-3 lg:min-h-[52px] lg:gap-2.5 lg:rounded-xl lg:px-3 lg:py-2">
      <span className="grid h-11 w-11 shrink-0 lg:h-[32px] lg:w-[32px] lg:rounded-[9px] place-items-center rounded-xl border border-[#E4ECF5] bg-[#F8FAFD] text-[#133B5D]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[15px] font-bold text-[#102D50]">
          {txt(value)}
        </p>
      </div>
    </div>
  );
}

// Simple label/value box used by the Fee Structure tab.
const Box = ({ label, value }) => (
  <div className="rounded-2xl border border-[#E4ECF5] bg-white p-3.5">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-[15px] font-bold text-[#102D50]">{txt(value)}</p>
  </div>
);

// Standard programme highlights shown under "About this course" (v16).
const fallbackTopicsFor = (course = {}) => {
  const name = String(course.name ?? course.courseName ?? "").toLowerCase();
  if (name.includes("node")) return ["Node.js fundamentals", "Express.js APIs", "REST API development", "Database integration", "Authentication and deployment"];
  if (name.includes("react")) return ["React fundamentals", "Components and props", "State and hooks", "Routing", "Production deployment"];
  if (name.includes("java")) return ["Core Java", "Object-oriented programming", "Spring Boot", "REST APIs", "Database integration"];
  if (name.includes("aws") || name.includes("cloud")) return ["Cloud fundamentals", "AWS services", "Networking and security", "Storage and databases", "Deployment and monitoring"];
  if (name.includes("ai") || name.includes("machine")) return ["Python foundations", "Data preparation", "Machine learning", "Model evaluation", "Practical AI projects"];
  return ["Core concepts", "Practical projects", "Tools and workflows", "Real-world applications", "Career-ready skills"];
};

// Hero artwork from public/assets/Org (see constants/orgBanners.js).
function OrgHeroImage({ className = "" }) {
  const sources = [ORG_BANNERS.courseDetails.src, ORG_BANNERS.courseDetails.fallbackSrc];
  const [index, setIndex] = useState(0);
  if (!sources[index]) return null;
  return (
    <div aria-hidden="true" className={className}>
      <img src={sources[index]} alt="" draggable={false} decoding="async" onError={() => setIndex((value) => value + 1)} />
    </div>
  );
}

// Pastel stat tile shown in the hero (Batches / Students / ...).
function StatTile({ icon: Icon, label, value, suffix, tone }) {
  const t = TONES[tone];
  return (
    <div
      className="flex min-h-[84px] min-w-0 items-center gap-3.5 rounded-2xl border px-4 py-3 lg:min-h-[62px] lg:gap-2.5 lg:rounded-[13px] lg:px-3 lg:py-2"
      style={{ backgroundColor: t.bg, borderColor: t.border }}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl lg:h-[32px] lg:w-[32px] lg:rounded-[9px]"
        style={{ backgroundColor: t.tile, color: t.icon }}
      >
        <Icon className="h-6 w-6 lg:h-4 lg:w-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-600 lg:!text-[10px] lg:!tracking-[.04em]">
          {label}
        </p>
        <p className="mt-1 truncate text-2xl font-bold leading-none text-[#102D50] lg:mt-1 lg:!text-[18px]">
          {txt(value, "0")}
          {suffix && (
            <span className="ml-1 text-xs font-semibold text-slate-500">
              {suffix}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function Chip({ children, tone = "slate" }) {
  const styles =
    tone === "green"
      ? "bg-[#E7F7EE] text-[#047857]"
      : tone === "amber"
        ? "bg-[#FFF4E2] text-[#B45309]"
        : "bg-[#F1F5FA] text-[#1F3A5C]";
  return (
    <span className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold lg:gap-1.5 lg:rounded-lg lg:px-2.5 lg:py-1 lg:!text-[12px] ${styles}`}>
      {children}
    </span>
  );
}

// "More Actions" menu: switch to another course of this organization.
function MoreActions({ courses, currentId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DDE6F1] bg-white px-4 text-sm font-semibold text-[#102D50] transition hover:border-[#C9D6E6] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133B5D]/30"
      >
        <MoreHorizontal className="h-4 w-4" />
        More Actions
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-[calc(100%+8px)] top-0 z-40 max-h-[360px] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-[#E4ECF5] bg-white p-1.5 shadow-[0_18px_40px_rgba(19,59,93,.16)]"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Switch course
          </p>
          {courses.length ? (
            courses.map((item) => {
              const active = String(item.id) === String(currentId);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    if (!active) onSelect(item.id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? "bg-[#EEF4FF] text-[#102D50]" : "text-[#1F3A5C] hover:bg-slate-50"}`}
                >
                  <CourseTechIcon name={item.name} size="sm" />
                  <span className="truncate">{displayCourseName(item.name)}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-3 text-xs text-slate-500">No other courses found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { courses: allCourses = [], getCourse, loading: courseListLoading } = useCourses();
  const listedCourse = getCourse(courseId);
  const [detail, setDetail] = useState(null);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const tab = tabOf(params.get("tab"));
  const course = useMemo(() => {
    const merged = { ...listedCourse, ...(detail || {}) };
    return {
      ...merged,
      status:
        typeof merged.status === "boolean"
          ? merged.status
            ? "Active"
            : "Inactive"
          : merged.status,
      duration: durationValue(merged.duration),
    };
  }, [listedCourse, detail]);
  const importantTopics = useMemo(() => {
    const moduleTopics = modules
      .map((module) => module.moduleName ?? module.name ?? module.title ?? module.topicName ?? module.topic)
      .filter(Boolean)
      .slice(0, 5);
    return moduleTopics.length >= 5 ? moduleTopics : [...moduleTopics, ...fallbackTopicsFor(course)].slice(0, 5);
  }, [course, modules]);

  useEffect(() => {
    let live = true;
    const demo = localStorage.getItem("isDemo") === "true";
    setLoading(true);
    setDetail(null);
    setBatches([]);
    setModules([]);
    setStudents([]);
    setAssessments([]);
    setErrors({});
    Promise.allSettled([
      demo ? Promise.resolve(null) : courseService.getCourse(courseId),
      batchService.getOrganizationBatches({ pageSize: 1000, courseId }),
      studentsApi.list(),
      demo ? Promise.resolve([]) : tutorService.courseSyllabusModules(courseId),
      demo ? Promise.resolve([]) : assessmentService.getAssessments(),
    ])
      .then(
        async ([
          courseResult,
          batchResult,
          organizationStudentsResult,
          moduleResult,
          assessmentResult,
        ]) => {
          if (!live) return;
          const nextErrors = {};
          if (courseResult.status === "fulfilled" && courseResult.value) {
            const apiCourse = courseResult.value;
            setDetail({
              ...apiCourse,
              name: apiCourse.title ?? apiCourse.name ?? apiCourse.courseName,
              fee: apiCourse.price ?? apiCourse.fee ?? apiCourse.courseFee,
              category: apiCourse.level ?? apiCourse.category,
            });
          } else if (!demo)
            nextErrors.overview = "Course information could not be refreshed.";
          let matchedBatches = [];
          if (batchResult.status === "fulfilled") {
            matchedBatches = rows(
              batchResult.value?.data ?? batchResult.value,
            ).filter(
              (item) =>
                String(item.courseId ?? item.course?.id) === String(courseId),
            );
            setBatches(matchedBatches);
          } else nextErrors.batches = "Course batches could not be loaded.";
          if (moduleResult.status === "fulfilled")
            setModules(rows(moduleResult.value));
          else nextErrors.modules = "Course modules could not be loaded.";
          if (assessmentResult.status === "fulfilled")
            setAssessments(
              rows(assessmentResult.value).filter(
                (item) => String(item.courseId) === String(courseId),
              ),
            );
          else
            nextErrors.assessments = "Course assessments could not be loaded.";
          const results = await Promise.allSettled(
            matchedBatches.map((batch) =>
              batchService.getStudents(batch.batchId ?? batch.id),
            ),
          );
          if (!live) return;
          const batchIds = new Set(
            matchedBatches.map((batch) => String(batch.batchId ?? batch.id)),
          );
          const organizationStudents =
            organizationStudentsResult.status === "fulfilled"
              ? rows(
                  organizationStudentsResult.value?.data ??
                    organizationStudentsResult.value,
                ).filter((student) => {
                  const studentBatchId =
                    student.batchId ??
                    student.batch?.batchId ??
                    student.batch?.id;
                  const studentCourseId =
                    student.courseId ??
                    student.course?.courseId ??
                    student.course?.id;
                  return (
                    (studentBatchId != null &&
                      batchIds.has(String(studentBatchId))) ||
                    (studentCourseId != null &&
                      String(studentCourseId) === String(courseId))
                  );
                })
              : [];
          const seen = new Set();
          setStudents(
            [
              ...results.flatMap((result, index) =>
                result.status === "fulfilled"
                  ? rows(result.value).map((student) => ({
                      ...student,
                      batchName:
                        student.batchName ?? matchedBatches[index]?.batchName,
                    }))
                  : [],
              ),
              ...organizationStudents,
            ].filter((student) => {
              const id = String(
                student.studentId ?? student.id ?? student.email,
              );
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            }),
          );
          if (
            results.some((result) => result.status === "rejected") &&
            !organizationStudents.length
          )
            nextErrors.students = "Some enrolled students could not be loaded.";
          setErrors(nextErrors);
        },
      )
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [courseId]);

  const selectTab = (label) => {
    const next = new URLSearchParams(params);
    label === "Overview" ? next.delete("tab") : next.set("tab", keyOf(label));
    setParams(next);
  };
  const stats = {
    batches: batches.length,
    students: students.length,
    assessments: assessments.length || num(course?.totalAssessments),
  };
  const feeRaw = course.fee ?? course.price ?? course.courseFee;
  const feeDisplay =
    feeRaw === undefined || feeRaw === null || feeRaw === ""
      ? null
      : currency(feeRaw);
  const error = errors[keyOf(tab)];
  const statusText = txt(course.status, "");
  const isActive = /^active$/i.test(statusText);
  const levelText = course.level ?? course.category;
  const switchCourse = (id) =>
    navigate(`/organization/courses/${encodeURIComponent(id)}/details`);

  if (courseListLoading || (loading && !course?.id))
    return (
      <main className="min-h-full p-4">
        <div className="mx-auto max-w-[1600px] animate-pulse space-y-3">
          <div className="h-5 w-64 rounded-lg bg-slate-200" />
          <div className="h-9 w-36 rounded-xl bg-slate-200" />
          <div className="min-h-56 rounded-[18px] bg-slate-200" />
          <div className="h-14 rounded-2xl bg-slate-200" />
          <div className="h-56 rounded-[18px] bg-slate-200" />
        </div>
      </main>
    );
  if (!course?.id && !course?.courseId)
    return (
      <main className="grid min-h-full place-items-center p-6">
        <Empty
          icon={BookOpen}
          title="Course not found"
          text="This course is unavailable or you no longer have access."
        />
      </main>
    );

  const courseName = displayCourseName(course.name ?? course.courseName);

  return (
    <main
      data-ui="organization-course-detail"
      className="min-h-full min-w-0 w-full overflow-x-hidden bg-[var(--app-background)] px-3 py-3 text-slate-800 sm:px-5 sm:py-4"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 lg:space-y-3">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <Link to="/organization/dashboard" aria-label="Home" className="text-[#102D50] hover:text-[#F39924]">
            <House className="h-5 w-5" />
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link to="/organization/dashboard" className="font-medium text-slate-600 hover:text-[#102D50]">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link to="/organization/courses" className="font-medium text-slate-600 hover:text-[#102D50]">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-[#102D50]">Course Details</span>
        </nav>

        <button
          onClick={() => navigate("/organization/courses")}
          className="group inline-flex items-center gap-2 rounded-xl border border-[#E4ECF5] bg-white px-4 py-2.5 text-sm font-semibold text-[#102D50] lg:rounded-[10px] lg:px-3 lg:py-1.5 lg:!text-[12.5px] shadow-[0_2px_8px_rgba(19,59,93,.05)] transition hover:border-[#C9D6E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133B5D]/30"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to courses
        </button>

        {/* Hero */}
        <header className={`${CARD} ocd-hero`}>
          <div className="ocd-hero__id">
            <CourseTechIcon
              name={course.name ?? course.courseName}
              size="xl"
              className="shadow-[0_10px_24px_rgba(19,59,93,.10)]"
            />
            <div className="ocd-hero__fee">
              <p>Fee</p>
              <strong>{txt(feeDisplay)}</strong>
            </div>
          </div>
          <div className="ocd-hero__copy">
            <p className="ocd-hero__eyebrow">Course Details</p>
            <h1 className="ocd-hero__title">{courseName}</h1>
            <div className="ocd-hero__chips">
              {levelText && (
                <Chip>
                  <BarChart3 className="h-4 w-4" />
                  {txt(levelText)}
                </Chip>
              )}
              {statusText && (
                <Chip tone={isActive ? "green" : "amber"}>
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-[#10A36B]" : "bg-[#F59E0B]"}`} />
                  {statusText}
                </Chip>
              )}
              <Chip>
                <Clock3 className="h-4 w-4" />
                {withUnit(course.duration)}
              </Chip>
            </div>
            {(course.shortDescription ?? course.description) && (
              <p className="ocd-hero__desc">{course.shortDescription ?? course.description}</p>
            )}
            <div className="ocd-hero__actions">
              <button
                onClick={() => navigate(`/organization/courses/${courseId}/edit`)}
                className="ocd-hero__edit"
              >
                <Pencil className="h-4 w-4" />
                Edit Course
              </button>
              <MoreActions
                courses={allCourses}
                currentId={course.id ?? courseId}
                onSelect={switchCourse}
              />
            </div>
          </div>
          <OrgHeroImage className="ocd-hero__art" />
          <div className="ocd-hero__stats">
            <StatTile icon={Layers3} label="Batches" value={stats.batches} tone="blue" />
            <StatTile icon={Users} label="Students" value={stats.students} tone="green" />
            <StatTile icon={FileText} label="Assessments" value={stats.assessments} tone="purple" />
            <StatTile
              icon={CalendarDays}
              label="Duration"
              value={/^\d+(\.\d+)?$/.test(String(course.duration ?? "").trim()) ? course.duration : txt(course.duration)}
              suffix={/^\d+(\.\d+)?$/.test(String(course.duration ?? "").trim()) ? "months" : undefined}
              tone="orange"
            />
          </div>
        </header>

        {/* Tabs */}
        <nav
          className={`${CARD} flex gap-1 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          aria-label="Course detail sections"
        >
          {TABS.map((item, index) => {
            const Icon = TAB_ICONS[item];
            const active = tab === item;
            return (
              <div key={item} className="flex shrink-0 items-center">
                {index > 0 && !active && tab !== TABS[index - 1] && (
                  <span aria-hidden="true" className="mx-1 h-6 w-px bg-slate-200" />
                )}
                <button
                  onClick={() => selectTab(item)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition lg:gap-2 lg:rounded-[10px] lg:px-4 lg:py-1.5 lg:!text-[12.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39924]/40 ${active ? "text-white shadow-[0_8px_18px_rgba(243,153,36,.30)]" : "text-[#1F3A5C] hover:bg-slate-50"}`}
                  style={active ? { backgroundColor: ORANGE } : undefined}
                >
                  <Icon className="h-[18px] w-[18px] lg:h-4 lg:w-4" strokeWidth={1.9} />
                  {item}
                </button>
              </div>
            );
          })}
        </nav>

        {loading ? (
          <div className="h-64 animate-pulse rounded-[18px] bg-white/70" />
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700"
              >
                {error}
              </div>
            )}
            {tab === "Overview" && (
              <>
                <div className="grid min-w-0 gap-4 lg:grid-cols-[1.25fr_1fr] lg:gap-3">
                  <Panel
                    title="Course Overview"
                    subtitle="Selected course summary and configuration."
                    icon={FileText}
                    tone="orange"
                  >
                    <div className="min-h-[170px] rounded-2xl border border-[#E4ECF5] bg-white p-5 lg:min-h-0 lg:rounded-xl lg:px-4 lg:py-3">
                      <h3 className="text-base font-bold text-[#102D50] lg:!text-[13.5px]">About this course</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 lg:mt-1 lg:!text-[12.5px] lg:!leading-5">
                        {txt(
                          course.description ?? course.shortDescription,
                          "No description is available for this course.",
                        )}
                      </p>
                      <div className="mt-5 border-t border-[#EEF2F7] pt-4 lg:mt-3 lg:pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B78A0] lg:!text-[10.5px]">Top 5 topics</h4>
                        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:mt-2 lg:gap-1.5">
                          {importantTopics.map((topic, index) => (
                            <li key={`${topic}-${index}`} className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#345D86] lg:!text-[12.5px]">
                              <span className="grid h-6 w-6 shrink-0 lg:h-5 lg:w-5 place-items-center rounded-full bg-[#EEF4FF] text-[11px] font-bold text-[#0877F9]">{index + 1}</span>
                              <span className="truncate" title={topic}>{topic}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </Panel>
                  <Panel title="Course Information" icon={Info} tone="blue">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoTile icon={BookOpen} label="Category" value={course.category} />
                      <InfoTile icon={Monitor} label="Mode" value={course.mode} />
                      <InfoTile icon={Layers3} label="Modules" value={modules.length || course.totalModules} />
                      <InfoTile icon={Clock3} label="Duration" value={withUnit(course.duration)} />
                    </div>
                  </Panel>
                </div>
                <Panel
                  title="Additional Details"
                  subtitle="Other information related to this course."
                  icon={FileText}
                  tone="orange"
                >
                  <div className="grid rounded-2xl border border-[#E4ECF5] bg-white sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      [UserRound, "Mentor", course.mentorName],
                      [Globe, "Language", course.language ?? course.courseLanguage],
                      [Award, "Certificate", yesNo(course.certificate ?? course.certificateAvailable ?? course.isCertificateEnabled)],
                      [CalendarDays, "Created On", date(course.createdAt ?? course.createdDate ?? course.createdOn)],
                    ].map(([Icon, label, value], index) => (
                      <div
                        key={label}
                        className={`flex min-w-0 items-center gap-4 p-4 lg:min-h-[52px] lg:gap-2.5 lg:px-3 lg:py-2 ${index > 0 ? "border-t border-[#EEF2F7] sm:border-t-0" : ""} ${index % 2 === 1 ? "sm:border-l sm:border-[#EEF2F7]" : ""} ${index === 2 ? "sm:border-t xl:border-l xl:border-t-0" : ""} ${index === 3 ? "sm:border-t xl:border-t-0" : ""}`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#E4ECF5] bg-[#F8FAFD] text-[#133B5D] lg:h-[32px] lg:w-[32px] lg:rounded-[9px]">
                          <Icon className="h-5 w-5 lg:h-4 lg:w-4" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">{label}</p>
                          <p className="mt-0.5 truncate text-[15px] font-bold text-[#102D50] lg:!text-[13.5px]">{txt(value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}
            {tab === "Syllabus" && (
              <Panel
                title="Course Syllabus"
                icon={ScrollText}
                tone="purple"
                subtitle="Create modules, topics and lessons in one compact workspace"
              >
                <CoursePdfAttachment key={courseId} courseId={courseId} />
                <SyllabusBuilder courseId={courseId} />
              </Panel>
            )}
            {tab === "Batches" && (
              <Panel
                title="Course Batches"
                icon={BriefcaseBusiness}
                tone="blue"
                subtitle={`${batches.length} batches matched to this course`}
              >
                <Table
                  headers={[
                    "Batch",
                    "Tutor",
                    "Type",
                    "Students",
                    "Start",
                    "End",
                    "Status",
                    "Action",
                  ]}
                  empty={
                    <Empty
                      icon={Layers3}
                      title="No batches available for this course"
                      text="Only batches associated with this selected course are shown."
                    />
                  }
                >
                  {batches.map((batch) => (
                    <tr
                      key={batch.batchId ?? batch.id}
                      className="hover:bg-[#F8FBFF]"
                    >
                      <td className="px-4 py-3 font-bold">
                        {txt(batch.batchName ?? batch.name)}
                      </td>
                      <td className="px-4 py-3">
                        {txt(batch.mentorName ?? batch.tutorName)}
                      </td>
                      <td className="px-4 py-3">
                        {txt(batch.batchType ?? batch.mode)}
                      </td>
                      <td className="px-4 py-3">
                        {num(batch.enrolledStudents)} / {num(batch.capacity)}
                      </td>
                      <td className="px-4 py-3">{date(batch.startDate)}</td>
                      <td className="px-4 py-3">{date(batch.endDate)}</td>
                      <td className="px-4 py-3">{txt(batch.status)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/organization/batches/${batch.batchId ?? batch.id}/details`,
                            )
                          }
                          className="rounded-xl bg-[#133B5D] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0F3050]"
                        >
                          View Batch
                        </button>
                      </td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            )}
            {tab === "Students" && (
              <Panel
                title="Enrolled Students"
                icon={Users}
                tone="green"
                subtitle={`${students.length} unique students across this course's batches`}
              >
                <Table
                  headers={[
                    "Student",
                    "Student ID",
                    "Batch",
                    "Mentor",
                    "Progress",
                    "Attendance",
                  ]}
                  empty={
                    <Empty
                      icon={Users}
                      title="No students enrolled in this course"
                      text="Students assigned through this course's batches will appear here."
                    />
                  }
                >
                  {students.map((student, index) => {
                    const studentId = student.studentId ?? student.id;
                    const canOpen =
                      studentId !== undefined &&
                      studentId !== null &&
                      studentId !== "";
                    const openStudent = () =>
                      canOpen &&
                      navigate(
                        `/organization/students/${encodeURIComponent(studentId)}`,
                      );
                    const mentorName = student.mentorName ?? student.mentor?.name ?? student.trainerName ?? student.tutorName;
                    return (
                      <tr
                        key={studentId ?? index}
                        onClick={canOpen ? openStudent : undefined}
                        onKeyDown={
                          canOpen
                            ? (event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  openStudent();
                                }
                              }
                            : undefined
                        }
                        tabIndex={canOpen ? 0 : undefined}
                        role={canOpen ? "button" : undefined}
                        aria-label={
                          canOpen
                            ? `View student details for ${txt(student.fullName ?? student.studentName ?? student.name, "student")}`
                            : undefined
                        }
                        className={`outline-none hover:bg-[#F8FBFF] ${canOpen ? "cursor-pointer focus-visible:bg-blue-50/60" : ""}`}
                      >
                        <td className="px-4 py-3 font-bold">
                          <span
                            className={
                              canOpen
                                ? "hover:text-blue-700 hover:underline"
                                : ""
                            }
                          >
                            {txt(
                              student.fullName ??
                                student.studentName ??
                                student.name,
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">{txt(studentId)}</td>
                        <td className="px-4 py-3">{txt(student.batchName)}</td>
                        <td className="px-4 py-3">{txt(mentorName, "Unassigned")}</td>
                        <td className="px-4 py-3">
                          {student.progress === undefined
                            ? "—"
                            : `${student.progress}%`}
                        </td>
                        <td className="px-4 py-3">
                          {student.attendance === undefined
                            ? "—"
                            : `${student.attendance}%`}
                        </td>
                      </tr>
                    );
                  })}
                </Table>
              </Panel>
            )}
            {tab === "Timeline" && (
              <Panel
                title="Course Timeline"
                icon={CalendarDays}
                tone="blue"
                subtitle="Course dates and module milestones"
              >
                {(course.startDate && course.startDate !== "—") ||
                modules.length ||
                (course.endDate && course.endDate !== "—") ? (
                  <div className="ml-4 border-l-2 border-cyan-200 pl-7">
                    {[
                      ["Course Start", course.startDate],
                      ...modules.map((module, index) => [
                        txt(
                          module.moduleName ?? module.name,
                          `Module ${index + 1}`,
                        ),
                        module.startDate ?? module.date,
                      ]),
                      ["Course Completion", course.endDate],
                    ].map(([title, value], index) => (
                      <div
                        key={`${title}-${index}`}
                        className="relative mb-4 rounded-xl border bg-white p-4"
                      >
                        <span className="absolute -left-[38px] top-4 h-4 w-4 rounded-full border-4 border-white bg-cyan-500" />
                        <p className="text-[10px] font-bold text-blue-600">
                          {date(value)}
                        </p>
                        <h3 className="mt-1 font-bold">{title}</h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={CalendarDays}
                    title="No timeline available for this course"
                    text="Timeline milestones appear when course or module dates are configured."
                  />
                )}
              </Panel>
            )}
            {tab === "Fee Structure" && (
              <Panel
                title="Course Fee Structure"
                icon={ReceiptText}
                tone="orange"
                subtitle="Existing fee values for the selected course"
                action={
                  <button
                    onClick={() =>
                      navigate(
                        `/organization/invoices?tab=generate&courseId=${encodeURIComponent(courseId)}`,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F39924] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(243,153,36,.30)] transition hover:brightness-105"
                  >
                    <ReceiptText className="h-4 w-4" />
                    Generate Invoice
                  </button>
                }
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_.7fr]">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      [
                        "Course Fee",
                        currency(
                          course.fee ?? course.price ?? course.courseFee,
                        ),
                      ],
                      [
                        "Discount",
                        course.discount === undefined
                          ? "—"
                          : currency(course.discount),
                      ],
                      [
                        "Tax",
                        course.tax === undefined ? "—" : currency(course.tax),
                      ],
                      [
                        "Net Amount",
                        currency(
                          course.netAmount ??
                            course.fee ??
                            course.price ??
                            course.courseFee,
                        ),
                      ],
                      [
                        "Paid Amount",
                        course.paidAmount === undefined
                          ? "—"
                          : currency(course.paidAmount),
                      ],
                      [
                        "Outstanding",
                        course.outstandingAmount === undefined
                          ? "—"
                          : currency(course.outstandingAmount),
                      ],
                    ].map(([label, value]) => (
                      <Box key={label} label={label} value={value} />
                    ))}
                  </div>
                  <div className="rounded-2xl border border-[#E4ECF5] bg-white p-5">
                    <h3 className="font-bold text-[#102D50]">Payment configuration</h3>
                    <div className="mt-4 grid gap-3">
                      {[
                        ["Payment status", course.paymentStatus],
                        ["Due date", date(course.paymentDueDate)],
                        [
                          "Installments",
                          course.installments?.length ??
                            course.installmentCount,
                        ],
                      ].map(([label, value]) => (
                        <Box key={label} label={label} value={value} />
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            )}
            {tab === "Assessments" && (
              <Panel
                title="Course Assessments"
                icon={ClipboardCheck}
                tone="purple"
                subtitle={`${assessments.length} assessments mapped to this course`}
              >
                <Table
                  headers={[
                    "Assessment",
                    "Module",
                    "Subject",
                    "Batch",
                    "Date",
                    "Marks",
                    "Passing",
                    "Status",
                  ]}
                  empty={
                    <Empty
                      icon={ClipboardCheck}
                      title="No assessments available for this course"
                      text="Only assessments mapped to this selected course are shown."
                    />
                  }
                >
                  {assessments.map((item, index) => (
                    <tr key={item.id ?? index} className="hover:bg-[#F8FBFF]">
                      <td className="px-4 py-3 font-bold">
                        {txt(item.title ?? item.name)}
                      </td>
                      <td className="px-4 py-3">
                        {txt(item.moduleName ?? item.module)}
                      </td>
                      <td className="px-4 py-3">
                        {txt(item.subjectName ?? item.subject)}
                      </td>
                      <td className="px-4 py-3">
                        {txt(item.batchName ?? item.batch)}
                      </td>
                      <td className="px-4 py-3">
                        {date(item.date ?? item.startDate)}
                      </td>
                      <td className="px-4 py-3">{txt(item.totalMarks)}</td>
                      <td className="px-4 py-3">{txt(item.passingMarks)}</td>
                      <td className="px-4 py-3">{txt(item.status)}</td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            )}
          </>
        )}
      </div>
    </main>
  );
}
