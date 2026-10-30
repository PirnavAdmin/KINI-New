import { useEffect, useState } from "react";
import MentorBanner from "@features/mentor/components/MentorBanner";
import { MENTOR_BANNERS } from "@features/mentor/constants/mentorBanners";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarCheck2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Inbox,
  TriangleAlert,
  Layers3,
  LineChart,
  Plus,
  Users,
  X,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ROUTES } from "@shared/constants/routeConstants";
import { useAuth } from "@shared/hooks/useAuth";
import usePermission from "@shared/hooks/usePermission";
import AssessmentResults from "@/pages/assessments/AssessmentResults";
import { loadMentorDashboardSources, selectDashboardClasses } from "@features/mentor/services/mentorDashboardData";
import {
  getMentorSessionIdentity,
} from "@features/mentor/utils/mentorSessionIdentity";
import KPI from "@/components/common/KPI";
import "./mentor-dashboard-density.css";

const teachingPlan = [
  {
    id: 1,
    status: "Live",
    time: "10:00 AM",
    end: "11:30 AM",
    batch: "React Morning Batch",
    course: "React Development",
    module: "React Hooks",
    topic: "Context API",
    session: "Day 20 of 45",
    students: 28,
  },
  {
    id: 2,
    status: "Upcoming",
    time: "02:00 PM",
    end: "03:30 PM",
    batch: "Node.js Afternoon Batch",
    course: "Node.js Development",
    module: "REST APIs",
    topic: "Authentication",
    session: "Day 14 of 36",
    students: 24,
  },
];

const DEMO_DASHBOARD = {
  stats: {
    assignedCourses: 3,
    activeBatches: 4,
    totalStudents: 92,
    todayClasses: 2,
    upcomingClasses: 4,
    pendingClasses: 1,
    attendancePercentage: 84,
    courseProgress: 62,
  },
};
const DEMO_ATTENDANCE = { attendancePercentage: 84 };

const attentionItems = [
  {
    tone: "rose",
    icon: Users,
    text: "2 students below 70% attendance",
    route: "lowAttendance",
  },
  {
    tone: "amber",
    icon: ClipboardCheck,
    text: "3 assessment submissions pending",
    route: "pendingAssessments",
  },
  {
    tone: "orange",
    icon: LineChart,
    text: "React Morning batch is 1 session behind",
    route: "behindBatch",
  },
  {
    tone: "blue",
    icon: CalendarDays,
    text: "Tomorrow's class needs scheduling",
    route: "scheduleRequired",
  },
];

const attendance = [
  { day: "Mon", value: 82 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 84 },
  { day: "Thu", value: 87 },
  { day: "Fri", value: 81 },
  { day: "Sat", value: 86 },
  { day: "Sun", value: 84 },
];

const normalizeAttendanceTrend = (payload) => {
  if (!payload || typeof payload !== "object") return [];
  const candidates = [
    Array.isArray(payload) ? payload : null,
    payload.trend,
    payload.attendanceTrend,
    payload.dailyAttendance,
    payload.weeklyAttendance,
    payload.daily,
    payload.weekly,
    payload.items,
    payload.records,
    payload.data,
  ];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const rows = candidate
      .map((item) => {
        const value = Number(
          item?.percentage ??
            item?.attendancePercentage ??
            item?.presentPercentage ??
            item?.value ??
            item?.attendance,
        );
        if (!Number.isFinite(value)) return null;
        const rawLabel = item?.day ?? item?.dayName ?? item?.label ?? item?.date;
        const date = rawLabel ? new Date(rawLabel) : null;
        const label = date && !Number.isNaN(date.getTime())
          ? new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date)
          : String(rawLabel || "").slice(0, 3);
        return { day: label || "Day", value: Math.max(0, Math.min(100, value)) };
      })
      .filter(Boolean);
    if (rows.length) return rows.slice(-7);
  }
  return [];
};

const progress = [
  { name: "On track", value: 68, color: "#16a34a" },
  { name: "Needs attention", value: 25, color: "#f59e0b" },
  { name: "At risk", value: 7, color: "#ef4444" },
];
const progressDetails = {
  "On Track": {
    count: 42,
    color: "#16a34a",
    summary: "Students meeting attendance and course-progress expectations.",
    action: "Review and recognize consistent learners.",
  },
  "Needs Attention": {
    count: 13,
    color: "#f59e0b",
    summary: "Students showing early signs of attendance or learning slowdown.",
    action: "Review recent activity and schedule a follow-up.",
  },
  "At Risk": {
    count: 5,
    color: "#ef4444",
    summary: "Students requiring immediate academic intervention.",
    action: "Prioritize attendance, pending work and mentor outreach.",
  },
};

const atRiskStudents = [
  {
    id: 100,
    name: "Bob Smith",
    batch: "React Morning",
    attendance: 62,
    progress: 55,
    reason: "Low attendance",
    lastActive: "2 days ago",
  },
  {
    id: 200,
    name: "Carol Williams",
    batch: "Node.js Afternoon",
    attendance: 75,
    progress: 48,
    reason: "Low course progress",
    lastActive: "1 day ago",
  },
  {
    id: 102,
    name: "David Brown",
    batch: "React Morning",
    attendance: 68,
    progress: 60,
    reason: "Failed assessments",
    lastActive: "3 days ago",
  },
  {
    id: 103,
    name: "Eve Davis",
    batch: "React Morning",
    attendance: 80,
    progress: 72,
    reason: "Inactive",
    lastActive: "5 days ago",
  },
];

const demoBatchProgress = [
  {
    id: 1,
    name: "React Morning Batch",
    course: "React Development",
    students: 28,
    completed: 28,
    total: 45,
    progress: 62,
    status: "On track",
  },
  {
    id: 2,
    name: "Node.js Afternoon Batch",
    course: "Node.js Development",
    students: 24,
    completed: 14,
    total: 36,
    progress: 39,
    status: "Needs attention",
  },
  {
    id: 3,
    name: "Python Data Batch",
    course: "Python for Data Science",
    students: 22,
    completed: 21,
    total: 40,
    progress: 53,
    status: "On track",
  },
];

const panel =
  "overflow-hidden rounded-[14px] border border-[#e7e2da] bg-white shadow-[0_3px_12px_rgba(9,45,78,.05)] dark:border-slate-700 dark:bg-slate-900";

// Mentor dashboard KPIs use the global KPI card; "violet" maps to the shared purple.
function StatCard({ label, value, hint, icon, tone, onClick }) {
  return (
    <KPI
      label={label}
      value={value}
      description={hint}
      icon={icon}
      accent={tone === "violet" ? "purple" : tone}
      onClick={onClick}
    />
  );
}

function SectionHeader({ title, subtitle, action, onAction, icon: Icon, tone = "orange" }) {
  return (
    <div data-ui="mentor-section-head-v17" className="mv17-dhead">
      {Icon && <span className={`mv17-dhead__icon is-${tone}`} aria-hidden="true"><Icon /></span>}
      <div className="min-w-0 flex-1">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className={`mv17-dhead__action ${tone === "orange-link" ? "is-orange" : ""}`}>
          {action}
          <ArrowRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon = Inbox, title, text }) {
  return (
    <div className="mv17-dempty mentor-empty-state">
      <Icon aria-hidden="true" />
      <p><b>{title}</b>{text && <span>{text}</span>}</p>
    </div>
  );
}

function TeachingCard({ item, onTopic, onPrimary }) {
  const live = item.status === "Live";
  return (
    <div data-ui="mentor-teaching-card" className="grid gap-3 rounded-xl border border-[#e7e2da] bg-[#fffefc] p-3 sm:grid-cols-[78px_minmax(0,1fr)_112px] sm:items-center dark:border-slate-800 dark:bg-slate-950/30">
      <div className="border-b border-slate-200 pb-2 sm:border-b-0 sm:border-r sm:pb-0">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${live ? "bg-emerald-100 text-emerald-700" : "bg-[#fff1df] text-[#b85f00]"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-[#ff8800]"}`}
          />
          {item.status}
        </span>
        <p className="mt-2 text-xs font-bold text-slate-950 dark:text-white">
          {item.time}
        </p>
        <p className="text-[11px] text-slate-500">- {item.end}</p>
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-slate-950 dark:text-white">
          {item.batch}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{item.course}</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          {[
            ["Module", item.module],
            ["Topic", item.topic],
            ["Session", item.session],
            ["Students", item.students],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] text-slate-500">{label}</dt>
              <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onTopic();
          }}
          className="rounded-lg border border-[#dcd7cf] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0b2e4f] hover:border-[#ffcf99] hover:text-[#e97800] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          View topic
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onPrimary();
          }}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm ${live ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#ff8800] hover:bg-[#e97800]"}`}
        >
          {live ? "Start class" : "View schedule"}
        </button>
      </div>
    </div>
  );
}

const toDashboardList = (value, key) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value[key])) return value[key];
  const aliases = key === "classes" ? ["todayClasses", "upcomingClasses", "pendingClasses"] : [];
  for (const candidate of [...aliases, "items", "records", "results", "data"]) {
    if (Array.isArray(value[candidate])) return value[candidate];
  }
  return value.data && typeof value.data === "object" ? toDashboardList(value.data, key) : [];
};

const dashboardCount = (value, key, list) => Number(
  value?.[key] ?? value?.totalRecords ?? value?.totalCount ?? value?.count ?? value?.data?.[key] ?? value?.data?.totalRecords ?? list.length,
) || 0;

const formatClassDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
};

function UpcomingClassCard({ item, onOpen }) {
  const course =
    item.courseName ?? item.course?.courseName ?? item.course ?? "Course";
  const batch = item.batchName ?? item.batch?.batchName ?? item.batch ?? "";
  const topic =
    item.topicName ?? item.topic ?? item.sessionTitle ?? item.title ?? "";
  const date = formatClassDate(
    item.classDate ??
      item.scheduledDate ??
      item.date ??
      item.startDateTime ??
      item.startDate,
  );
  const start = item.startTime ?? item.time ?? "";
  const end = item.endTime ?? "";
  const status = item.status ?? "Scheduled";
  return (
    <button
      type="button"
      onClick={onOpen}
      data-ui="mentor-upcoming-card"
      className="w-full rounded-xl border border-[#e7e2da] bg-white px-3 py-2.5 text-left transition hover:border-[#ffcf99] hover:bg-[#fff9f1] dark:border-slate-800 dark:hover:bg-slate-800/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
            {course}
          </p>
          {batch && (
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {batch}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-[#fff1df] px-2 py-1 text-[9px] font-bold text-[#b85f00]">
          {status}
        </span>
      </div>
      {topic && (
        <p className="mt-2 truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
          {topic}
        </p>
      )}
      {(date || start || end) && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
          <CalendarDays className="h-3 w-3" />
          {[date, start && end ? `${start} - ${end}` : start]
            .filter(Boolean)
            .join(" / ")}
        </p>
      )}
    </button>
  );
}

const firstClassValue = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined && String(item).trim() && String(item).trim() !== "-");
  return value === undefined ? "Not provided" : String(value).trim();
};

export default function MentorDashboard() {
  const navigate = useNavigate();
  const { user, mentorIdResolving, mentorIdResolutionError, retryMentorIdentity, employeeIdResolving } = useAuth();
  const { hasPermission, permissions, isLoading: permissionsLoading } = usePermission();
  const canViewAttendance = hasPermission("attendance");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedProgressCategory, setSelectedProgressCategory] =
    useState(null);
  const [dashboardResults, setDashboardResults] = useState(null);
  const [apiData, setApiData] = useState({
    dashboard: {},
    today: [],
    upcoming: [],
    attendance: {},
  });
  const [dataAvailable, setDataAvailable] = useState({});
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingError, setUpcomingError] = useState("");
  const isDemo = Boolean(
    user?.isDemo || localStorage.getItem("isDemo") === "true",
  );
  const identity = getMentorSessionIdentity(user);
  // Do not send an employee record ID to mentor endpoints. The backend checks
  // the resource type as well as the authenticated role, so that fallback
  // produces a misleading 403 for valid mentor sessions.
  const mentorId = isDemo ? 201 : identity.mentorId;
  const employeeId = identity.employeeId;
  // mentorId is either a real backend ID or null (see getMentorSessionIdentity's
  // present() check) — but `0` would still be a valid ID and must not be read
  // as missing, so check explicitly rather than with a bare `!mentorId`.
  const hasMentorId = mentorId !== null && mentorId !== undefined && String(mentorId).trim() !== "";

  const profileWarning = !isDemo && !hasMentorId && !mentorIdResolving
    ? mentorIdResolutionError
      ? "Unable to verify your mentor profile. Please retry."
      : "Unable to find your mentor profile in the organization records."
    : "";
  const statusMessage = [profileWarning, dashboardError].filter(Boolean).join(" ");

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // One consolidated snapshot of every identity/permission value this page
    // depends on — paste this line when reporting a Dashboard-permission or
    // "not linked" issue instead of piecing it together from separate logs.
    console.log("[MENTOR CONTEXT]", {
      userId: identity.userId ?? user?.userId ?? user?.UserId ?? user?.id ?? null,
      employeeId,
      employeeIdResolving,
      mentorId,
      mentorIdResolving,
      mentorIdResolutionError,
      organizationId: user?.organizationId ?? user?.OrganizationId ?? localStorage.getItem("organizationId") ?? null,
      role: user?.role ?? null,
      permissionsLoading,
      permissions,
      dashboardPermissionGranted: permissions?.includes?.("*") || permissions?.includes?.("dashboard") || false,
    });
  }, [identity.userId, user, employeeId, employeeIdResolving, mentorId, mentorIdResolving, mentorIdResolutionError, permissionsLoading, permissions]);

  useEffect(() => {
    let active = true;

    if (isDemo) {
      const timer = window.setTimeout(() => {
        setApiData({
          dashboard: DEMO_DASHBOARD,
          today: [],
          upcoming: teachingPlan,
          attendance: DEMO_ATTENDANCE,
        });
        setDashboardError("");
        setUpcomingLoading(false);
        setUpcomingError("");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const loadDashboard = async () => {

      try {
        setUpcomingLoading(true);
        setUpcomingError("");
        const { canonical, widgets: widgetResults, live: liveResults, assignedBatches: assignedBatchesResult } = await loadMentorDashboardSources({ mentorId, employeeId });
        if (!active) return;
        const [dashboardResult, todayResult, upcomingResult, attendanceResult] = canonical;
        // Older deployments expose the same mentor data through the widget
        // endpoints. Use them as a compatibility fallback while the canonical
        // mentor dashboard endpoints are being enabled server-side.
        const canonicalDashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : {};
        const hasCanonicalDashboardData = Boolean(
          toDashboardList(canonicalDashboard, "courses").length ||
          toDashboardList(canonicalDashboard, "batches").length ||
          toDashboardList(canonicalDashboard, "students").length ||
          toDashboardList(canonicalDashboard, "classes").length ||
          ["assignedCourses", "activeBatches", "totalCourses", "totalBatches", "totalStudents", "studentCount"]
            .some((key) => Number(canonicalDashboard?.[key] ?? canonicalDashboard?.data?.[key] ?? canonicalDashboard?.stats?.[key] ?? 0) > 0),
        );
        const usingWidgetFallback = widgetResults.some((result) => result.status === "fulfilled");
        const widget = (index) => widgetResults[index]?.status === "fulfilled" ? widgetResults[index].value : {};
        const widgetCourses = toDashboardList(widget(0), "courses");
        const widgetBatches = toDashboardList(widget(1), "batches");
        const widgetStudents = toDashboardList(widget(2), "students");
        const widgetClasses = toDashboardList(widget(3), "classes");
        const liveClasses = liveResults[0].status === "fulfilled" ? toDashboardList(liveResults[0].value, "classes") : [];
        const liveToday = liveResults[1].status === "fulfilled" ? toDashboardList(liveResults[1].value, "classes") : [];
        const liveUpcoming = liveResults[2].status === "fulfilled" ? toDashboardList(liveResults[2].value, "classes") : [];
        const assignedBatches = assignedBatchesResult[0]?.status === "fulfilled"
          ? toDashboardList(assignedBatchesResult[0].value, "batches")
          : [];
        const resolvedBatches = assignedBatches.length ? assignedBatches : widgetBatches;
        const resolvedStudents = widgetStudents.length
          ? widgetStudents
          : resolvedBatches.flatMap((batch) => Array.isArray(batch.students) ? batch.students : []);
        const dashboardPayload = dashboardResult.status === "fulfilled" && hasCanonicalDashboardData
          ? dashboardResult.value
          : {
              courses: widgetCourses,
              batches: resolvedBatches,
              students: resolvedStudents,
              classes: widgetClasses,
              assignedCourses: widgetCourses.length,
              activeBatches: resolvedBatches.length,
              totalStudents: resolvedStudents.length || resolvedBatches.reduce(
                (total, batch) => total + Number(batch.studentCount ?? batch.studentsCount ?? batch.enrolledStudents ?? 0),
                0,
              ),
              todayClasses: widgetClasses.length,
            };
        const todayPayload = todayResult.status === "fulfilled" ? todayResult.value : {};
        const upcomingPayload = upcomingResult.status === "fulfilled" ? upcomingResult.value : {};
        const attendancePayload = attendanceResult.status === "fulfilled"
          ? attendanceResult.value
          : (dashboardPayload?.attendance ?? dashboardPayload?.data?.attendance ?? {});
        const responseEmployeeId = [dashboardPayload, todayPayload, upcomingPayload, attendancePayload]
          .map((payload) => payload?.employeeId ?? payload?.EmployeeId ?? payload?.data?.employeeId ?? payload?.data?.EmployeeId)
          .find((value) => value !== undefined && value !== null && String(value).trim());
        if (responseEmployeeId) localStorage.setItem("employeeId", String(responseEmployeeId));
        const courses = widgetCourses.length ? widgetCourses : toDashboardList(dashboardPayload, "courses");
        const batches = resolvedBatches.length ? resolvedBatches : toDashboardList(dashboardPayload, "batches");
        const students = resolvedStudents.length ? resolvedStudents : toDashboardList(dashboardPayload, "students");
        const allClasses = liveClasses.length
          ? liveClasses
          : widgetClasses.length
            ? widgetClasses
            : toDashboardList(dashboardPayload, "classes");
        const classesRoot = dashboardPayload?.data ?? dashboardPayload;
        const classifiedClasses = selectDashboardClasses(allClasses);
        const explicitToday = toDashboardList(todayPayload, "classes").length
          ? toDashboardList(todayPayload, "classes")
          : liveToday;
        const explicitUpcoming = toDashboardList(upcomingPayload, "classes").length
          ? toDashboardList(upcomingPayload, "classes")
          : liveUpcoming;
        const explicitPending = classesRoot?.pendingClasses ?? classesRoot?.pending ?? [];
        const today = Array.isArray(explicitToday) && explicitToday.length
          ? explicitToday
          : classifiedClasses.today;
        const upcoming = Array.isArray(explicitUpcoming) && explicitUpcoming.length
          ? explicitUpcoming
          : classifiedClasses.upcoming;
        const pending = Array.isArray(explicitPending) && explicitPending.length
          ? explicitPending
          : allClasses.filter((item) => ["pending", "incomplete"].includes(String(item.status ?? item.classStatus ?? "").toLowerCase()));
        const activeBatches = batches.filter(
          (batch) =>
            !["completed", "cancelled", "archived", "inactive"].includes(
              String(batch.status ?? "active").toLowerCase(),
            ),
        );
        const fallbackStats = {
          assignedCourses: courses.length || dashboardCount(dashboardPayload, "assignedCourses", courses),
          activeBatches: activeBatches.length || dashboardCount(dashboardPayload, "activeBatches", activeBatches),
          totalStudents: students.length || dashboardCount(dashboardPayload, "totalStudents", students),
          todayClasses: today.length,
          upcomingClasses: upcoming.length,
          pendingClasses: pending.length,
          batchProgress: batches.map((batch) => ({
            id: batch.batchId ?? batch.id,
            name: batch.batchName ?? batch.name ?? "Assigned batch",
            course:
              batch.courseName ??
              batch.course?.courseName ??
              batch.course?.name ??
              "Assigned course",
            students: Number(
              batch.studentCount ??
                batch.studentsCount ??
                batch.enrolledStudents ??
                0,
            ),
            completed: Number(batch.completedSessions ?? 0),
            total: Number(batch.totalSessions ?? batch.sessions ?? 0),
            progress: Number(batch.progress ?? batch.progressPercentage ?? 0),
            status: String(batch.status ?? "Active"),
          })),
        };
        const dashboardRoot = dashboardPayload?.data ?? dashboardPayload;
        const dashboardData = {
          ...dashboardRoot,
          ...fallbackStats,
          stats: { ...(dashboardRoot?.stats ?? {}), ...fallbackStats },
          batchProgress: Array.isArray(dashboardRoot?.batchProgress)
            ? dashboardRoot.batchProgress
            : fallbackStats.batchProgress,
          attentionItems: dashboardRoot?.attentionItems ?? dashboardRoot?.attention ?? [],
          atRiskStudents: dashboardRoot?.atRiskStudents ?? dashboardRoot?.studentsAtRisk ?? [],
        };
        setDataAvailable({
          courses: dashboardResult.status === "fulfilled" || widgetResults[0].status === "fulfilled",
          batches: dashboardResult.status === "fulfilled" || widgetResults[1].status === "fulfilled" || assignedBatchesResult[0].status === "fulfilled",
          students: dashboardResult.status === "fulfilled" || widgetResults[2].status === "fulfilled",
          classes: todayResult.status === "fulfilled" || widgetResults[3].status === "fulfilled" || liveResults[1].status === "fulfilled",
        });
        setApiData({
          dashboard: dashboardData,
          today,
          upcoming,
          attendance: attendancePayload?.attendance ?? attendancePayload?.data?.attendance ?? attendancePayload,
        });
        setUpcomingLoading(false);
        if (upcomingResult.status !== "fulfilled" && widgetResults[3].status !== "fulfilled" && liveResults[2].status !== "fulfilled") {
          const status = upcomingResult.reason?.response?.status;
          setUpcomingError(
            status === 403
              ? "You do not have permission to view upcoming classes."
              : "Unable to load upcoming classes.",
          );
        } else {
          setUpcomingError("");
        }
        const failedCount = canonical.filter((result) => result.status !== "fulfilled").length;
        setDashboardError(failedCount === 4 && !usingWidgetFallback ? "Unable to load mentor dashboard data." : "");
      } catch (error) {
        if (active) {
          setDashboardError(
            error?.response?.data?.message ||
              "Unable to load mentor dashboard data.",
          );
          setUpcomingLoading(false);
          setUpcomingError("Unable to load upcoming classes.");
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [isDemo, mentorId, employeeId, dashboardRefreshKey]);
  useEffect(() => {
    if (!selectedTopic) return undefined;
    const closeOnEscape = (event) =>
      event.key === "Escape" && setSelectedTopic(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTopic]);
  const dashboardStats = apiData.dashboard?.stats ?? apiData.dashboard ?? {};
  const mentorName =
    dashboardStats.mentorName ||
    user?.firstName ||
    user?.name?.split(" ")?.[0] ||
    "Mentor";
  const attendancePercentage =
    typeof apiData.attendance === "number"
      ? apiData.attendance
      : (apiData.attendance?.attendancePercentage ??
        apiData.attendance?.averageAttendance ??
        apiData.attendance?.percentage ??
        dashboardStats.averageAttendance ??
        dashboardStats.attendancePercentage ??
        null);
  const apiAttendanceTrend = normalizeAttendanceTrend(apiData.attendance);
  const attendanceTrend = apiAttendanceTrend.length ? apiAttendanceTrend : (isDemo ? attendance : []);
  const attendanceValues = attendanceTrend.map((item) => item.value);
  const trendAverage = attendanceValues.length
    ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
    : Number(attendancePercentage) || 0;
  const bestAttendance = attendanceTrend.length
    ? attendanceTrend.reduce((best, item) => item.value > best.value ? item : best, attendanceTrend[0])
    : null;
  const previousWeekAttendance = Number(
    apiData.attendance?.previousWeekPercentage ??
      apiData.attendance?.lastWeekPercentage ??
      apiData.attendance?.previousWeek ??
      NaN,
  );
  const attendanceChange = Number.isFinite(previousWeekAttendance)
    ? Math.round(trendAverage - previousWeekAttendance)
    : null;
  const attendancePoints = attendanceTrend.length > 1
    ? attendanceTrend.map((item, index) => {
        const x = 12 + (index * 176) / Math.max(1, attendanceTrend.length - 1);
        const y = 76 - (item.value - 70) * 1.8;
        return `${x},${Math.max(12, Math.min(76, y))}`;
      }).join(" ")
    : "";
  const apiTeachingPlan = apiData.today.map((item, index) => ({
    id: item.id ?? item.classId ?? index,
    status: firstClassValue(item.status, "Upcoming"),
    time: firstClassValue(item.startTime, item.time, "Not scheduled"),
    end: firstClassValue(item.endTime, "Not scheduled"),
    batch: firstClassValue(item.batchName, item.batch, item.courseName, "Assigned batch"),
    course: firstClassValue(item.courseName, item.course, "Assigned course"),
    module: firstClassValue(item.moduleName, item.module, item.courseName, "Module not provided"),
    topic: firstClassValue(item.topicName, item.topic, item.title, item.subject, item.moduleName, item.courseName, "Class session"),
    session: firstClassValue(item.session, item.sessionName, "Session not provided"),
    students: item.studentCount ?? item.students ?? 0,
  }));
  const displayedTeachingPlan = apiTeachingPlan.length
    ? apiTeachingPlan
    : isDemo
      ? teachingPlan
      : [];
  const liveAttentionItems = apiData.dashboard?.attentionItems;
  const liveAtRiskStudents = apiData.dashboard?.atRiskStudents;
  const liveBatchProgress = apiData.dashboard?.batchProgress;
  const displayedAtRiskStudents = isDemo
    ? atRiskStudents
    : Array.isArray(liveAtRiskStudents)
      ? liveAtRiskStudents
      : [];
  const derivedAttentionItems = [
    Number(dashboardStats.pendingClasses ?? 0) > 0 && {
      tone: "amber",
      icon: CalendarDays,
      text: `${dashboardStats.pendingClasses} class${dashboardStats.pendingClasses === 1 ? "" : "es"} need scheduling`,
      route: "calendar",
    },
    displayedAtRiskStudents.length > 0 && {
      tone: "rose",
      icon: Users,
      text: `${displayedAtRiskStudents.length} student${displayedAtRiskStudents.length === 1 ? "" : "s"} need attendance review`,
      route: "lowAttendance",
    },
    Number(dashboardStats.courseProgress ?? 100) < 70 && {
      tone: "orange",
      icon: LineChart,
      text: "Course progress needs review",
      route: "students",
    },
  ].filter(Boolean);
  const displayedAttentionItems = isDemo
    ? attentionItems
    : Array.isArray(liveAttentionItems) && liveAttentionItems.length
      ? liveAttentionItems
      : derivedAttentionItems;
  const displayedBatchProgress = isDemo
    ? demoBatchProgress
    : Array.isArray(liveBatchProgress)
      ? liveBatchProgress
      : [];
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";
  // Only shown when the dashboard API actually returns a pending-review count.
  const pendingReviewsRaw = apiData.dashboard?.pendingReviews ?? apiData.dashboard?.pendingAssessmentReviews ?? apiData.dashboard?.data?.pendingReviews;
  const pendingReviews = pendingReviewsRaw == null || Number.isNaN(Number(pendingReviewsRaw)) ? null : Number(pendingReviewsRaw);
  const go = (key) =>
    navigate(
      {
        courses: ROUTES.MENTOR.COURSES,
        batches: ROUTES.MENTOR.BATCHES,
        students: ROUTES.MENTOR.STUDENTS,
        calendar: `${ROUTES.MENTOR.CALENDAR}?tab=schedule`,
        classes: `${ROUTES.MENTOR.CALENDAR}?tab=schedule&date=today`,
        performance: `${ROUTES.MENTOR.STUDENTS}?status=at-risk`,
        assessments: ROUTES.MENTOR.ASSESSMENTS,
        lowAttendance: `${ROUTES.MENTOR.STUDENTS}?attendance=low`,
        pendingAssessments: `${ROUTES.MENTOR.ASSESSMENTS}?status=pending-review`,
        behindBatch: ROUTES.MENTOR.BATCHES,
        scheduleRequired: `${ROUTES.MENTOR.CALENDAR}?schedule=required`,
      }[key],
    );
  const openClassScheduler = () =>
    navigate(`${ROUTES.MENTOR.CALENDAR}?create=true`);
  const openStudentProfile = (studentId) =>
    navigate(ROUTES.MENTOR.STUDENT_WORKSPACE.replace(":studentId", studentId));
  const openProgressCategory = (risk) =>
    navigate(`${ROUTES.MENTOR.STUDENTS}?risk=${encodeURIComponent(risk)}`);
  const handleProgressSliceClick = (event) => {
    const categoryByColor = {
      "#16a34a": "On Track",
      "#f59e0b": "Needs Attention",
      "#ef4444": "At Risk",
    };
    const fill = event.target?.getAttribute?.("fill")?.toLowerCase();
    if (!categoryByColor[fill]) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedProgressCategory(categoryByColor[fill]);
  };

  return (
    <main data-ui="mentor-dashboard" className="mentor-dashboard-home mv17 m-0 min-h-full overflow-hidden bg-[#fbf8f2] p-2 shadow-none dark:bg-slate-900 sm:p-3">
      <div className="mx-auto max-w-[1500px] space-y-1.5">
        {statusMessage && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-700">
            <span role="status">{statusMessage}</span>
            <button
              type="button"
              onClick={() => {
                if (!hasMentorId) retryMentorIdentity();
                setDashboardRefreshKey((value) => value + 1);
              }}
              className="shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}
        <MentorBanner
          as="header"
          variant="dashboard"
          image={MENTOR_BANNERS.dashboard}
          eyebrow={formattedDate}
          eyebrowStyle="text"
          title={<>{greeting}, {mentorName} <span className="mentor-banner__wave" aria-hidden="true">👋</span></>}
          subtitle="Here's what's happening in your teaching workspace today."
          meta={(
            <>
              <span className="mentor-banner-pill"><i />{!isDemo && !dataAvailable.classes ? "\u2014" : dashboardStats.todayClasses ?? apiData.today.length} classes today</span>
              <span className="mentor-banner-pill"><i className="is-green" />{upcomingLoading || upcomingError ? "\u2014" : dashboardStats.upcomingClasses ?? apiData.upcoming.length} upcoming classes</span>
            </>
          )}
          script={["Organize", "Teach", "Inspire"]}
          actions={(
            <>
              <button type="button" onClick={openClassScheduler} className="mentor-hero-btn mentor-hero-btn--primary">
                <Plus aria-hidden="true" />
                Schedule class
              </button>
              <button
                type="button"
                data-leave-action="true"
                onClick={() => navigate(ROUTES.MENTOR.LEAVE, { state: { openAdd: true } })}
                className="mentor-hero-btn mentor-hero-btn--soft"
              >
                <ClipboardCheck aria-hidden="true" />
                Apply leave
              </button>
              <button type="button" data-ui="view-schedule-action" onClick={() => go("calendar")} className="mentor-hero-btn mentor-hero-btn--ghost">
                <CalendarDays aria-hidden="true" />
                View schedule
              </button>
            </>
          )}
        />

        <section className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Assigned courses"
            value={
              !isDemo && !dataAvailable.courses ? "\u2014" : dashboardStats.totalCourses ??
              dashboardStats.assignedCourses ??
              dashboardStats.courseCount ??
              0
            }
            hint="View courses"
            icon={BookOpen}
            tone="blue"
            onClick={() => go("courses")}
          />
          <StatCard
            label="Batches"
            value={
              !isDemo && !dataAvailable.batches ? "\u2014" : dashboardStats.totalBatches ??
              dashboardStats.activeBatches ??
              dashboardStats.batchCount ??
              0
            }
            hint="View batches"
            icon={Layers3}
            tone="green"
            onClick={() => go("batches")}
          />
          <StatCard
            label="Total students"
            value={
              !isDemo && !dataAvailable.students ? "\u2014" : dashboardStats.totalStudents ?? dashboardStats.studentCount ?? 0
            }
            hint="View students"
            icon={Users}
            tone="violet"
            onClick={() => go("students")}
          />
          <StatCard
            label="Today's classes"
            value={!isDemo && !dataAvailable.classes ? "\u2014" : dashboardStats.todayClasses ?? apiData.today.length}
            hint="View classes"
            icon={CalendarDays}
            tone="orange"
            onClick={() => go("classes")}
          />
          {canViewAttendance && <StatCard
              label="Student attendance"
              value={attendancePercentage == null ? "\u2014" : `${attendancePercentage}%`}
              hint="View attendance"
              icon={BarChart3}
              tone="teal"
              onClick={() => go("performance")}
            />}
        </section>

        <section className="grid items-start gap-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,.8fr)]">
          <article className={panel}>
            <SectionHeader
              icon={GraduationCap}
              title="Today's teaching plan"
              subtitle="Your assigned sessions and current syllabus topics"
              action="View full schedule"
              onAction={() => go("calendar")}
            />
            <div className="space-y-2 p-2.5">
              {displayedTeachingPlan.map((item) => (
                <TeachingCard
                  key={item.id}
                  item={item}
                  onTopic={() => setSelectedTopic(item)}
                  onPrimary={() => go("calendar")}
                />
              ))}
              {displayedTeachingPlan.length === 0 && (
                <EmptyState
                  icon={CalendarDays}
                  title={upcomingLoading ? "Loading today's classes..." : !isDemo && !dataAvailable.classes ? "Today's classes are temporarily unavailable." : "No classes are scheduled for today."}
                  text={upcomingLoading || (!isDemo && !dataAvailable.classes) ? "" : "Use Schedule class to plan a session."}
                />
              )}
            </div>
          </article>
          <div className="space-y-2">
            <article className={panel}>
              <SectionHeader
                icon={CalendarCheck2}
                title="Upcoming Classes"
                subtitle="Your next scheduled teaching sessions"
                action="View schedule"
                onAction={() => go("calendar")}
              />
              <div className="space-y-2 p-2.5">
                {upcomingLoading ? (
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ) : upcomingError ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-xs font-medium text-rose-700">
                    <span>Upcoming classes are temporarily unavailable.</span>
                    <button
                      type="button"
                      onClick={() => {
                if (!hasMentorId) retryMentorIdentity();
                setDashboardRefreshKey((value) => value + 1);
              }}
                      className="shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      Retry
                    </button>
                  </div>
                ) : apiData.upcoming.length ? (
                  apiData.upcoming.map((item, index) => (
                    <UpcomingClassCard
                      key={item.id ?? item.classId ?? item.scheduleId ?? index}
                      item={item}
                      onOpen={() => go("calendar")}
                    />
                  ))
                ) : (
                  <EmptyState icon={CalendarDays} title="No upcoming classes scheduled." text="Enjoy your free time or plan a new session." />
                )}
              </div>
            </article>
          </div>
        </section>

        <article className={`${panel} mentor-attention-panel`}>
          <SectionHeader icon={TriangleAlert} tone="red" title="Needs attention" subtitle="Items requiring action today" />
          <div className="mentor-attention-content px-4">
            {displayedAttentionItems.map((item) => {
              const Icon = item.icon || AlertCircle;
              const colors = {
                rose: "bg-rose-50 text-rose-600",
                amber: "bg-amber-50 text-amber-600",
                orange: "bg-orange-50 text-orange-600",
                blue: "bg-orange-50 text-orange-600",
              };
              return (
                <button
                  key={item.id ?? item.text}
                  onClick={() => item.path ? navigate(item.path) : go(item.route)}
                  className="group flex items-center gap-2.5 py-2 text-left"
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${colors[item.tone] ?? colors.blue}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    {item.text}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#e97800]" />
                </button>
              );
            })}
            {displayedAttentionItems.length === 0 && (
              <EmptyState icon={Inbox} title="Nothing needs attention right now." text="You're all set! Keep up the great work." />
            )}
          </div>
        </article>

        <section
          onClickCapture={handleProgressSliceClick}
          className="mv17-insights grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-4"
        >
          <article className={panel}>
            <SectionHeader
              icon={ClipboardList}
              tone="blue"
              title="Assessment overview"
              action="View all"
              onAction={() => go("assessments")}
            />
            {isDemo ? <>
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    React Hooks Quiz
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    React Morning Batch
                  </p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                  Published
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 divide-x divide-slate-200 text-center">
                <div>
                  <b className="block text-base">26</b>
                  <span className="text-[8px] text-slate-500">Attempted</span>
                </div>
                <div>
                  <b className="block text-base text-emerald-600">22</b>
                  <span className="text-[8px] text-slate-500">Passed</span>
                </div>
                <div>
                  <b className="block text-base">78%</b>
                  <span className="text-[8px] text-slate-500">Average</span>
                </div>
                <div>
                  <b className="block text-base">85%</b>
                  <span className="text-[8px] text-slate-500">Pass rate</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDashboardResults({
                    id: "as1",
                    name: "React Hooks Quiz",
                    batch: "React Morning Batch",
                    total: 30,
                    pass: 15,
                    avg: "21.5/30",
                    status: "Results Published",
                  })
                }
                className="mt-3 w-full rounded-lg border border-blue-200 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
              >
                View results
              </button>
            </div>
            </> : <div className="mv17-dcard-body">
              <p className="mv17-dcard-text">Open assessments to review your published quizzes and results.</p>
              <div className="mv17-dcard-foot">
                {pendingReviews != null ? <p><b>{pendingReviews}</b><span>Pending Reviews</span></p> : <span />}
                <AssessmentIllustration />
              </div>
            </div>}
          </article>
          <article className={`${panel} overflow-hidden`}>
            <SectionHeader icon={LineChart} title="Attendance trend" subtitle="Student attendance trend" action="Last 7 days" tone="orange" onAction={() => go("performance")} />
            <div className="mt-2 flex items-baseline gap-2 px-4">
              <b className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {attendancePercentage == null && !attendanceTrend.length ? "\u2014" : `${trendAverage}%`}
              </b>
              {attendanceChange !== null && (
                <span className={`text-[10px] font-bold ${attendanceChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {attendanceChange >= 0 ? "+" : ""}{attendanceChange}% vs last week
                </span>
              )}
            </div>
            <div className="px-3 pt-1">
              <svg
                viewBox="0 0 200 92"
                className="h-[108px] w-full overflow-visible"
                role="img"
                aria-label={attendanceTrend.length ? `Attendance trend for the last ${attendanceTrend.length} days` : "No attendance trend data"}
              >
                <defs>
                  <linearGradient
                    id="attendanceArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f39924" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#f39924" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[22, 49, 76].map((y) => (
                  <line
                    key={y}
                    x1="10"
                    x2="190"
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 4"
                    strokeWidth="1"
                  />
                ))}
                {attendanceTrend.length > 1 && <>
                  <polygon points={`12,82 ${attendancePoints} 188,82`} fill="url(#attendanceArea)" />
                  <polyline points={attendancePoints} fill="none" stroke="#f39924" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </>}
                {attendanceTrend.length ? attendanceTrend.map((item, index) => {
                  const x = 12 + (index * 176) / Math.max(1, attendanceTrend.length - 1);
                  const y = Math.max(12, Math.min(76, 76 - (item.value - 70) * 1.8));
                  return <g key={`${item.day}-${index}`}><circle cx={x} cy={y} r="3" fill="white" stroke="#f39924" strokeWidth="2" /><text x={x} y="90" textAnchor="middle" fontSize="8" fill="#64748b">{item.day}</text></g>;
                }) : <text x="100" y="52" textAnchor="middle" fontSize="9" fill="#64748b">No trend data</text>}
              </svg>
            </div>
            <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
              <div className="px-4 py-2.5">
                <p className="text-[9px] text-slate-500">Weekly target</p>
                <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {apiData.attendance?.weeklyTarget != null ? `${apiData.attendance.weeklyTarget}%` : "Not available"}
                </p>
              </div>
              <div className="border-l border-slate-100 px-4 py-2.5 dark:border-slate-800">
                <p className="text-[9px] text-slate-500">Best day</p>
                <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {bestAttendance ? `${bestAttendance.day} / ${Math.round(bestAttendance.value)}%` : "Not available"}
                </p>
              </div>
            </div>
          </article>
          <article className={panel}>
            <SectionHeader icon={BarChart3} tone="green" title="Student progress" action="View students" onAction={() => go("performance")} />
            <div className="px-3.5 pb-3.5">
            {isDemo ? <>
            <div className="relative mx-auto h-[112px] w-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progress}
                    dataKey="value"
                    innerRadius={34}
                    outerRadius={49}
                    strokeWidth={0}
                    isAnimationActive={false}
                    className="cursor-pointer"
                    onClick={() => go("performance")}
                  >
                    {progress.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                        cursor="pointer"
                        onClick={() => go("performance")}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <button
                type="button"
                onClick={() => go("performance")}
                aria-label="Open student progress analytics"
                className="absolute left-1/2 top-1/2 grid h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full text-center transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
              >
                <b className="text-base leading-none text-slate-950 dark:text-white">
                  68%
                </b>
                <span className="mt-1 text-[8px] font-medium text-slate-500">
                  On track
                </span>
              </button>
            </div>
            <div className="grid gap-0.5 border-t border-slate-100 pt-1.5 dark:border-slate-800">
              {progress.map((item) => (
                <button
                  key={item.name}
                  onClick={() => go("performance")}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[11px] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-left text-slate-600 dark:text-slate-300">
                    {item.name}
                  </span>
                  <b>{item.value}%</b>
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                </button>
              ))}
            </div>
            </> : <div className="mv17-dcard-body !p-0">
              <p className="mv17-dcard-text">Open student reports to review individual learning progress.</p>
              <ProgressIllustration />
            </div>}
            </div>
          </article>
          <article
            role="link"
            tabIndex={0}
            onClick={() => go("courses")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") go("courses");
            }}
            className={`${panel} group cursor-pointer transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
          >
            <SectionHeader icon={BookOpen} tone="purple" title="Teaching progress" action="View course" onAction={() => go("courses")} />
            <div className="px-4 pb-4">
            {isDemo ? <>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">React Development</h3>
                <p className="text-[11px] text-slate-500">
                  28 / 45 sessions completed
                </p>
              </div>
              <b className="text-xl">62%</b>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-[62%] rounded-full bg-blue-600 transition-all group-hover:bg-blue-700" />
            </div>
            <dl className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Expected progress</dt>
                <dd className="font-semibold">65%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                  On track
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Next topic</dt>
                <dd className="font-semibold">Context API</dd>
              </div>
            </dl>
            </> : <div className="mv17-dcard-body !p-0">
              <p className="mv17-dcard-text">Open your courses to review syllabus completion.</p>
              <SyllabusIllustration />
            </div>}
            </div>
          </article>
        </section>

        <article className={panel}>
          <SectionHeader
            icon={Users}
            title="At-risk students"
            subtitle="Students who need academic follow-up"
            action="View all students"
            onAction={() => go("performance")}
          />
          <div data-ui="mentor-risk-table" className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                <tr>
                  {[
                    "Student",
                    "Batch",
                    "Attendance",
                    "Progress",
                    "Risk reason",
                    "Last active",
                    "Action",
                  ].map((heading) => (
                    <th key={heading} className="px-5 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedAtRiskStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-blue-50/30"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {student.batch}
                    </td>
                    <td className="px-5 py-3 font-semibold text-rose-600">
                      {student.attendance}%
                    </td>
                    <td className="px-5 py-3 font-semibold">
                      {student.progress}%
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-rose-50 px-2 py-1 font-medium text-rose-700">
                        {student.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {student.lastActive}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openStudentProfile(student.id)}
                        aria-label={`Open ${student.name}'s profile`}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        View profile <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedAtRiskStudents.length === 0 && (
              <div className="px-4 pb-4"><EmptyState icon={Users} title="No at-risk students were returned for this mentor." text="All your students are on track!" /></div>
            )}
          </div>
        </article>

        <article className={panel}>
          <SectionHeader
            icon={Layers3}
            tone="blue"
            title="Batch progress"
            subtitle="Completion across your assigned batches"
            action="View all batches"
            onAction={() => go("batches")}
          />
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {displayedBatchProgress.map((batch) => (
              <button
                key={batch.id}
                onClick={() => navigate(`${ROUTES.MENTOR.BATCHES}/${batch.id}`)}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                      {batch.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {batch.course} / {batch.students} students
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold ${batch.status === "On track" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {batch.status}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-[11px] text-slate-500">
                    {batch.completed} of {batch.total} sessions
                  </p>
                  <b className="text-lg text-slate-950 dark:text-white">
                    {batch.progress}%
                  </b>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${batch.status === "On track" ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${batch.progress}%` }}
                  />
                </div>
              </button>
            ))}
            {displayedBatchProgress.length === 0 && (
              <p className="mentor-empty-state col-span-full rounded-xl border border-dashed border-[#d9e2e8] bg-[#fbfcfd] px-4 py-6 text-center text-xs text-slate-500">
                No batch-progress data was returned for this mentor.
              </p>
            )}
          </div>
        </article>
      </div>

      {selectedTopic && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedTopic(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-title"
            className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,.24)] dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${selectedTopic.status === "Live" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${selectedTopic.status === "Live" ? "bg-emerald-500" : "bg-blue-500"}`}
                  />
                  {selectedTopic.status}
                </span>
                <h2
                  id="topic-title"
                  className="mt-2 text-xl font-bold text-slate-950 dark:text-white"
                >
                  {selectedTopic.topic}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedTopic.batch} / {selectedTopic.course}
                </p>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                aria-label="Close topic details"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-600">
                  Current syllabus topic
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  This session covers <strong>{selectedTopic.topic}</strong> in
                  the <strong>{selectedTopic.module}</strong> module. Review the
                  teaching plan before starting the class.
                </p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Time", `${selectedTopic.time} - ${selectedTopic.end}`],
                  ["Module", selectedTopic.module],
                  ["Session", selectedTopic.session],
                  ["Students", selectedTopic.students],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700"
                  >
                    <dt className="text-[10px] font-medium text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedTopic(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  go("calendar");
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold text-white ${selectedTopic.status === "Live" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {selectedTopic.status === "Live"
                  ? "Start class"
                  : "View schedule"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {selectedProgressCategory && (
        <div
          className="fixed inset-0 z-[75] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            setSelectedProgressCategory(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="progress-category-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,.24)] dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-600">
                  Student progress
                </p>
                <h2
                  id="progress-category-title"
                  className="mt-1 text-xl font-bold text-slate-950 dark:text-white"
                >
                  {selectedProgressCategory}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProgressCategory(null)}
                aria-label="Close progress summary"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="p-5">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white"
                  style={{
                    backgroundColor:
                      progressDetails[selectedProgressCategory].color,
                  }}
                >
                  {progressDetails[selectedProgressCategory].count}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Students in this category
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {progressDetails[selectedProgressCategory].summary}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  Recommended next step
                </p>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {progressDetails[selectedProgressCategory].action}
                </p>
              </div>
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedProgressCategory(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => openProgressCategory(selectedProgressCategory)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                View filtered students
              </button>
            </footer>
          </section>
        </div>
      )}

      <AssessmentResults
        assessment={dashboardResults}
        onClose={() => setDashboardResults(null)}
        onAudit={() => {}}
        onPublish={() => {}}
      />
    </main>
  );
}

/* Small decorative illustrations for the insight cards (design v17). */
function AssessmentIllustration() {
  return (
    <svg className="mv17-dillus" viewBox="0 0 140 90" aria-hidden="true">
      <ellipse cx="78" cy="58" rx="60" ry="30" fill="#e8f0fd" />
      <rect x="52" y="14" width="52" height="66" rx="8" fill="#ffffff" stroke="#c9d9f2" strokeWidth="2" />
      {[30, 44, 58].map((y) => <g key={y}><rect x="60" y={y - 5} width="10" height="10" rx="2.5" fill="#dff5e8" stroke="#22c55e" strokeWidth="1.5" /><path d={`M62 ${y} l3 3 l5 -6`} stroke="#16a34a" strokeWidth="1.8" fill="none" strokeLinecap="round" /><rect x="75" y={y - 2} width="22" height="4" rx="2" fill="#c9d9f2" /></g>)}
      <path d="M112 12 L124 24 L100 66 L90 70 L92 60 Z" fill="#f39924" />
      <path d="M90 70 L92 60 L100 66 Z" fill="#0f2a4a" />
    </svg>
  );
}
function ProgressIllustration() {
  return (
    <svg className="mv17-dillus mv17-dillus--wide" viewBox="0 0 200 90" aria-hidden="true">
      <ellipse cx="110" cy="80" rx="80" ry="8" fill="#eef3fb" />
      <rect x="50" y="62" width="14" height="16" rx="3" fill="#bfd6f8" />
      <rect x="72" y="50" width="14" height="28" rx="3" fill="#8fb8f3" />
      <rect x="94" y="36" width="14" height="42" rx="3" fill="#f7b267" />
      <rect x="116" y="20" width="14" height="58" rx="3" fill="#c4a8f5" />
      <circle cx="160" cy="44" r="12" fill="#1d4f91" />
      <path d="M144 78 C144 62 176 62 176 78 Z" fill="#2f6fe4" />
      <path d="M148 34 L160 28 L172 34 L160 40 Z" fill="#0f2a4a" />
    </svg>
  );
}
function SyllabusIllustration() {
  return (
    <svg className="mv17-dillus mv17-dillus--wide" viewBox="0 0 200 90" aria-hidden="true">
      <ellipse cx="120" cy="54" rx="70" ry="34" fill="#f1ebfd" />
      <rect x="76" y="10" width="72" height="72" rx="8" fill="#ffffff" stroke="#d9cdf5" strokeWidth="2" />
      {[24, 38, 52, 66].map((y, index) => <g key={y}><circle cx="88" cy={y} r="4.5" fill={index < 3 ? "#f39924" : "#e4dcf7"} /><rect x="98" y={y - 2.5} width={index % 2 ? 30 : 40} height="5" rx="2.5" fill={index < 3 ? "#5b8def" : "#e4dcf7"} /></g>)}
      <circle cx="160" cy="64" r="16" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
      <circle cx="160" cy="64" r="8" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
      <circle cx="160" cy="64" r="2.5" fill="#ef4444" />
    </svg>
  );
}
