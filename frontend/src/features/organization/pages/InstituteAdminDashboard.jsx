import { buildApprovalQueue } from "@/pages/students/studentApproval";
import usePendingEnrollmentApprovals from '@/hooks/usePendingEnrollmentApprovals';
import { notificationService } from '@shared/services/notificationService';
import { notificationDestination } from '@shared/utils/notificationDestination';
import { useCallback, useEffect, useRef, useState } from "react";
import useScrollReveal from "@shared/hooks/useScrollReveal";

// One orchestrated entrance: the hero, then the KPI row in a short stagger.
// Panels further down appear without motion (AOS respects reduced motion).
const REVEAL_PLAN = [
  { selector: ".kd-hero", aos: "fade-up", duration: 500 },
  { selector: ".kd-kpis > .kini-kpi", aos: "fade-up", duration: 400, stagger: 40 },
];
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  BookOpen,
  CalendarDays,
  ClipboardList,
  ChevronDown,
  IndianRupee,
  Plus,
  UserCheck,
  UserPlus,
  Video,
} from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import {
  dashboardApi,
  employeeApi,
  getApiErrorMessage,
  paymentApi,
  readStoredOrganizationId,
} from "@shared/services/apiServices";
import employeeAttendanceService from "@shared/services/employeeAttendanceService";
import { studentsApi } from "@/api/students";
import { mentorService } from "@shared/services/mentorService";
import { batchService } from "@shared/services/batchService";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { normalizeLiveClassList } from "@features/live-classes/utils/liveClassMappers";
import { courseService } from "@shared/services/courseService";
import {
  BatchPerformanceCard,
  CertificatesCard,
  DashboardHero,
  DashboardKpis,
  LearningProgressCard,
  LiveSessionCard,
  QuickActions,
  RecentActivityCard,
  UpcomingClassesCard,
} from "@features/organization/components/dashboard/OrgDashboardSections";
import {
  AtRiskCard,
  AttendanceCard,
  OperationsCard,
  RecentPaymentsCard,
  RevenueCard,
  StudentProgressCard,
} from "@features/organization/components/dashboard/OrgDashboardInsights";
import StudentForm from "@/pages/students/StudentForm";
import EmployeeFormModal from "@features/organization/components/EmployeeFormModal";
import {
  ENROLLMENT_APPROVAL_EVENT,
  getPendingEnrollmentApprovals,
} from "@shared/services/enrollmentApprovalStore";
import { buildDashboardSchedule, loadDashboardLearning } from "@features/organization/utils/dashboardCards";
import { latestActivity } from "@features/organization/utils/recentActivity";
import { isPendingApprovalStudent } from "@shared/utils/studentApprovalStatus";
import {
  employeeAttendanceEvent,
  employeeWorkAttendance,
} from "@shared/services/employeeWorkAttendance";

const CREATE_ACTIONS = [
  ["Add Student", UserPlus, "/organization/students?create=true"],
  ["Add Employee", BriefcaseBusiness, "/organization/employees?create=true"],
  ["Create Course", BookOpen, "/organization/courses?create=true"],
  ["Create Batch", CalendarDays, "/organization/batches?create=true"],
  ["Schedule Class", Video, "/organization/live-classes?create=true"],
  ["Create Assessment", ClipboardList, "/organization/assessments?create=true"],
  ["Record Payment", IndianRupee, "/organization/finance?create=true"],
];
// Dashboard metric → global KPI component (dashboard tones map onto KPI accents).

const asArray = (...values) => values.find(Array.isArray) ?? [];
const numberValue = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};
const money = (value) => `₹${numberValue(value).toLocaleString("en-IN")}`;
const textValue = (value, fallback = "—") => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value.label ?? value.name ?? value.title ?? fallback;
  return String(value);
};
const normalizeDocuments = (documents, issues) => asArray(documents, issues).map((document, index) => {
  if (Array.isArray(document)) return [textValue(document[0], `Document ${index + 1}`), Boolean(document[1])];
  if (document && typeof document === "object") {
    return [
      textValue(document.label ?? document.documentName ?? document.name ?? document.type, `Document ${index + 1}`),
      Boolean(document.verified ?? document.isVerified ?? document.valid ?? document.ok),
    ];
  }
  return [textValue(document, `Document ${index + 1}`), false];
});

const normalizeDashboard = (payload = {}) => {
  const payloadRoot = payload?.data ?? payload;
  const root = payloadRoot && typeof payloadRoot === "object" && !Array.isArray(payloadRoot)
    ? payloadRoot
    : {};
  const summarySource = root.summary ?? root.stats ?? root;
  const summary = summarySource && typeof summarySource === "object" && !Array.isArray(summarySource)
    ? summarySource
    : {};
  const metric = (key, label, value, note, tone, icon, path) => ({
    key,
    label: textValue(label, key),
    value: textValue(value, "0"),
    note: textValue(note, ""),
    tone,
    icon,
    path,
  });
  const totalStudents = numberValue(summary.totalStudents, summary.studentCount);
  const activeStudents = numberValue(summary.activeStudents, summary.activeStudentCount);
  const revenue = numberValue(summary.revenueCollected, summary.collectedRevenue, summary.monthlyRevenue);
  const pending = numberValue(summary.pendingPayments, summary.pendingAmount);
  const revenuePeriod = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date());
  const metrics = [
    metric("enrollments", "Total Students", totalStudents.toLocaleString("en-IN"), summary.totalStudentsNote ?? "Registered students", "blue", "students", "/organization/students"),
    metric("students", "Active Students", activeStudents.toLocaleString("en-IN"), summary.activeStudentsNote ?? (totalStudents ? `${Math.round(activeStudents / totalStudents * 100)}% of total` : "Currently active"), "teal", "active", "/organization/students?status=active"),
    metric("trainers", "Mentors", numberValue(summary.trainers, summary.totalTrainers, summary.totalTutors).toLocaleString("en-IN"), summary.trainersNote ?? "Organization mentors", "teal", "trainers", "/organization/tutors"),
    metric("employees", "Employees", numberValue(summary.employees, summary.totalEmployees).toLocaleString("en-IN"), summary.employeesNote ?? "Organization employees", "blue", "employees", "/organization/employees"),
    metric("batches", "Total Batches", numberValue(summary.totalBatches, summary.batches, summary.activeBatches).toLocaleString("en-IN"), summary.batchesNote ?? "Organization batches", "blue", "batches", "/organization/batches"),
    metric("classes", "Classes Today", numberValue(summary.classesToday, summary.todayClassesCount).toLocaleString("en-IN"), summary.classesNote ?? "Today's schedule", "amber", "classes", "/organization/classes?date=today"),
    metric("revenue", `Revenue · ${revenuePeriod}`, money(revenue), summary.revenueNote ?? "Organization collections this month", "blue", "revenue", "/organization/revenue"),
    metric("payments", "Pending Payments", money(pending), summary.pendingPaymentsNote ?? "Current organization outstanding balance", "rose", "pending", "/organization/finance?tab=pending-payments"),
  ];
  const classes = asArray(root.todayClasses, root.classesToday).filter((item) => item && typeof item === "object").map((item, index) => ({
    ...item, id: textValue(item.id ?? item.classId, String(index)), course: textValue(item.className ?? item.topic ?? item.courseName ?? item.course, "Class"),
    batch: textValue(item.batchName ?? item.batch, "Batch not provided"), time: textValue(item.time, `${textValue(item.startTime)}–${textValue(item.endTime)}`),
    trainer: textValue(item.trainerName ?? item.tutorName ?? item.trainer, "No mentor assigned"), students: textValue(item.attendanceText ?? item.enrollmentText, `${numberValue(item.presentCount, item.enrolledCount)}/${numberValue(item.totalStudents, item.capacity)}`),
    status: item.status ?? "Upcoming", room: item.modeAndRoom ?? item.meetingPlatform ?? item.room ?? item.mode ?? "—",
    state: item.state ?? (item.trainerId || item.trainerName || item.trainer ? String(item.status ?? "").toLowerCase().includes("live") ? "live" : "upcoming" : "issue"),
    action: textValue(item.actionLabel, item.trainerId || item.trainerName || item.trainer ? "View class" : "Assign mentor"),
  }));
  const approvals = asArray(root.pendingApprovals, root.approvals).filter((item) => item && typeof item === "object").map((item, index) => ({
    ...item, id: textValue(item.id ?? item.approvalId, String(index)), name: textValue(item.personName ?? item.studentName ?? item.employeeName ?? item.name, "Applicant"),
    type: item.approvalType ?? item.type ?? "Approval", course: item.courseName ?? item.departmentName ?? item.course ?? "—",
    sla: textValue(item.pendingDuration ?? item.sla ?? item.time, "Pending"), docs: normalizeDocuments(item.docs, item.issues),
    path: item.path ?? item.targetPath,
  }));
  const studentProgress = asArray(root.studentProgress, root.progressDistribution)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      ...item,
      name: textValue(item.name ?? item.label ?? item.status, `Group ${index + 1}`),
      value: numberValue(item.value, item.percentage, item.progress),
      count: numberValue(item.count, item.students, item.studentCount),
      color: textValue(item.color, ["#d97706", "#0d9488", "#f59e0b", "#f43f5e"][index % 4]),
    }));
  const atRiskStudents = asArray(root.atRiskStudents)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      ...item,
      name: textValue(item.name ?? item.studentName ?? item.student),
      course: textValue(item.courseName ?? item.course),
      attendance: numberValue(item.attendance, item.attendancePercentage),
      progress: numberValue(item.progress, item.progressPercentage),
      reason: textValue(item.reason ?? item.riskReason, "Needs attention"),
      risk: textValue(item.risk ?? item.riskLevel, "Monitor"),
    }));
  const batchPerformance = asArray(root.batchPerformance)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      ...item,
      batch: textValue(item.batchName ?? item.batch),
      students: numberValue(item.students, item.studentCount),
      attendance: numberValue(item.attendance, item.attendancePercentage),
      progress: numberValue(item.progress, item.progressPercentage),
      trainer: textValue(item.trainerName ?? item.mentorName ?? item.trainer ?? item.mentor, "Unassigned"),
      status: textValue(item.status, "Monitor"),
    }));
  const recentPayments = asArray(root.recentPayments)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      ...item,
      student: textValue(item.studentName ?? item.student ?? item.payerName),
      amount: money(item.amount ?? item.paidAmount ?? item.totalAmount),
      date: textValue(item.paymentDate ?? item.paidAt ?? item.date),
      status: textValue(item.status ?? item.paymentStatus, "Pending"),
    }));
  const recentActivity = asArray(root.recentActivity, root.activity)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      ...item,
      type: textValue(item.type, "update").toLowerCase(),
      text: textValue(item.text ?? item.message ?? item.title, "Organization updated"),
      time: textValue(item.time ?? item.createdAt ?? item.date, "Recently"),
      timestamp: item.createdAt ?? item.timestamp ?? item.date ?? item.time ?? null,
      path: typeof item.path === "string" ? item.path : "/organization/notifications",
    }));
  const financeSource = root.financeSummary ?? root.finance;
  const finance = financeSource && typeof financeSource === "object" && !Array.isArray(financeSource)
    ? financeSource
    : { collected: revenue, pending };
  return {
    metrics, classes, approvals,
    batchCapacityAlerts: [],
    attendanceTrend: asArray(root.attendanceTrend, root.studentAttendanceTrend).filter((item) => item && typeof item === "object" && !Array.isArray(item)),
    employeeAttendanceTrend: asArray(root.employeeAttendanceTrend).filter((item) => item && typeof item === "object" && !Array.isArray(item)),
    studentProgress,
    revenueTrend: asArray(root.revenueTrend, root.monthlyRevenueTrend).filter((item) => item && typeof item === "object" && !Array.isArray(item)),
    atRiskStudents, batchPerformance,
    recentPayments, recentActivity,
    attendance: (() => {
      const value = root.attendanceSummary ?? root.attendance;
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    })(),
    finance,
  };
};

const EMPTY_DASHBOARD = normalizeDashboard({});
const EMPTY_PROGRESS = { name: "No progress data", value: null, count: 0, color: "#cbd5e1" };
const resultRows = (result) => {
  if (result?.status !== "fulfilled") return [];
  const value = result.value?.data?.data ?? result.value?.data ?? result.value;
  const rows = value?.items ?? value?.records ?? value?.results ?? value?.payments ?? value;
  // Resource APIs can include null placeholders. Downstream dashboard
  // selectors read row fields, so discard malformed list entries once here.
  return Array.isArray(rows)
    ? rows.filter((row) => row && typeof row === "object" && !Array.isArray(row))
    : [];
};
const recordStatus = (record) => String(record?.status ?? record?.isActive ?? record?.active ?? "active").trim().toLowerCase();
const activeRecord = (record) => !["inactive", "disabled", "false", "0", "archived", "cancelled"].includes(recordStatus(record));
const activeStudentRecord = (record) => ["active", "enabled", "true", "1"].includes(recordStatus(record));
const activityTime = (value, fallback = "Recently") => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime())
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed)
    : fallback;
};
const recordCreatedAt = (record) => record?.createdAt ?? record?.createdDate ?? record?.createdOn
  ?? record?.registrationDate ?? record?.registeredAt ?? record?.joinedAt ?? record?.dateCreated
  ?? record?.CreatedAt ?? record?.CreatedDate ?? record?.CreatedOn ?? record?.RegistrationDate
  ?? record?.RegisteredAt ?? record?.JoinedAt ?? record?.DateCreated ?? null;
// Organization notifications as Recent Activity entries (rows from
// notificationService.getOrganizationNotifications, already normalized).
const notificationActivity = (rows, organizationScope) => (Array.isArray(rows) ? rows : [])
  .filter((item) => item && typeof item === "object" && !Array.isArray(item))
  .filter((item) => {
    const owner = item.organizationId ?? item.OrganizationId ?? item.orgId ?? item.OrgId;
    return owner == null || String(owner) === String(organizationScope);
  })
  .map((item) => ({
    key: (item.notificationId ?? item.id) != null ? `notification:${item.notificationId ?? item.id}` : undefined,
    // A student join names the student, whose name may contain "HR"; so the
    // student match wins over the employee one.
    type: /student|enrol/i.test(`${item.notificationType ?? ""} ${item.title ?? ""}`) ? "student" : /\bhr\b|employee/i.test(`${item.notificationType ?? ""} ${item.title ?? ""}`) ? "employee" : "update",
    text: textValue(item.title ?? item.subject, "Organization notification"),
    detail: item.description ?? item.message,
    timestamp: item.createdAt,
    path: notificationDestination(item, "org-admin"),
  }));
const mentorEmployee = (record) => [record?.role, record?.roleName, record?.designation, record?.employeeType, record?.userRole]
  .filter(Boolean)
  .join(" ")
  .toLowerCase()
  .match(/mentor|tutor/);
const normalizeDateKey = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, "0"),
      String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
  }
  // Keep ISO values usable even if a browser cannot parse a non-standard
  // timestamp supplied by an older attendance API.
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10)
    : "";
};
const classDateKey = (record) => normalizeDateKey(
  record?.startDate
    ?? record?.date
    ?? record?.scheduledDate
    ?? record?.classDate
    ?? record?.startDateTime,
);
const normalizeDashboardClass = (record, index) => ({
  ...record,
  id: textValue(record.id ?? record.liveClassId ?? record.classId, String(index)),
  course: textValue(record.title ?? record.courseName ?? record.course, "Class"),
  batch: textValue(record.batchName ?? record.batch, "Batch not provided"),
  time: textValue(record.timeLabel, `${textValue(record.startTime)}-${textValue(record.endTime)}`),
  trainer: textValue(record.mentorName ?? record.trainerName ?? record.trainer, "No mentor assigned"),
  students: textValue(record.studentsCount ?? record.enrolledCount, "0"),
  status: record.statusLabel ?? record.status ?? "Scheduled",
  room: textValue(record.platform ?? record.meetingPlatform ?? record.room, "-"),
  state: record.status === "live" ? "live" : record.status === "completed" ? "completed" : "upcoming",
  action: "View class",
});
const attendanceDateKey = (record) => normalizeDateKey(
  record?.date ?? record?.attendanceDate ?? record?.AttendanceDate ?? record?.workDate,
);
const recentDayKeys = (days = 7) => Array.from({ length: days }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - index - 1));
  return date.toISOString().slice(0, 10);
});
const isPresentAttendanceStatus = (status) => {
  const key = String(status ?? "").trim().toLowerCase();
  if (!key) return false;
  return ["present", "working", "checkedin", "checked-in", "check in", "on duty", "active", "late", "half day", "halfday"].some((value) => key.includes(value));
};
const buildEmployeeAttendanceSnapshot = (employeeRows, attendance = {}, trend = [], reportRecords = []) => {
  const totalEmployees = employeeRows.length;
  const storedRecords = employeeWorkAttendance.getOrganizationRecords();
  const allRecords = [...reportRecords, ...storedRecords];
  const localRecords = Array.from(
    new Map(
      allRecords.map((record) => [
        `${attendanceDateKey(record)}:${record?.employeeId ?? record?.EmployeeId ?? record?.employeeID ?? record?.userId ?? record?.staffId ?? record?.email ?? record?.employeeEmail ?? record?.id}`,
        record,
      ]),
    ).values(),
  );
  if (!localRecords.length || !totalEmployees) {
    return {
      attendance,
      trend,
    };
  }

  const dayKeys = recentDayKeys(7);
  const trendByDay = dayKeys.map((dateKey) => {
    const dayRecords = localRecords.filter((row) => attendanceDateKey(row) === dateKey);
    const presentEmployees = new Set(
      dayRecords
        .filter((row) => isPresentAttendanceStatus(row?.status) || Boolean(row?.checkIn ?? row?.checkInTime ?? row?.checkInAt))
        .map((row) => row?.employeeId ?? row?.EmployeeId ?? row?.employeeID ?? row?.userId ?? row?.staffId ?? row?.email ?? row?.id)
        .filter((id) => id !== undefined && id !== null && String(id).trim() !== ""),
    );
    const present = presentEmployees.size;
    return {
      day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(dateKey)),
      date: dateKey,
      present,
      absent: Math.max(0, totalEmployees - present),
    };
  });
  const todayKey = dayKeys[dayKeys.length - 1];
  const todayTrend = trendByDay.find((row) => row.date === todayKey) ?? trendByDay[trendByDay.length - 1];
  const employeePercentage = totalEmployees
    ? Math.round((todayTrend.present / totalEmployees) * 100)
    : 0;
  const hasApiPercentage =
    attendance?.employeePercentage !== undefined
    && attendance?.employeePercentage !== null
    && attendance?.employeePercentage !== "";
  const hasApiTrend = Array.isArray(trend) && trend.length > 0;
  // A mentor may have just checked in through the self-service attendance
  // page while the aggregate API still returns its earlier 0% snapshot.
  const hasLiveLocalAttendance = todayTrend.present > 0;

  return {
    attendance: hasApiPercentage && !hasLiveLocalAttendance
      ? attendance
      : {
          ...attendance,
          employees: employeePercentage,
          employeePercentage,
        },
    trend: hasApiTrend && !hasLiveLocalAttendance ? trend : trendByDay,
  };
};

export default function InstituteAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const organizationScope = String(user?.organizationId ?? user?.orgId ?? readStoredOrganizationId() ?? "");
  const menuRef = useRef(null);
  const dashboardScopeRef = useRef(organizationScope);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [approvalStudents, setApprovalStudents] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [updated, setUpdated] = useState(null);
  const [attendanceScope, setAttendanceScope] = useState("students");
  const [selectedProgress, setSelectedProgress] = useState(EMPTY_PROGRESS);
  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (dashboardScopeRef.current !== organizationScope) {
      dashboardScopeRef.current = organizationScope;
      setDashboard(EMPTY_DASHBOARD);
      setApprovalStudents(null);
      setSelectedProgress(EMPTY_PROGRESS);
      setUpdated(null);
    }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setLoadError("");
    if (!organizationScope) {
      setDashboard(EMPTY_DASHBOARD);
      setApprovalStudents(null);
      setSelectedProgress(EMPTY_PROGRESS);
      setUpdated(null);
      setLoadError("Your session does not include an organization ID. Sign in again to load organization data.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [dashboardResult, statsResult, studentsResult, employeesResult, mentorsResult, batchesResult, paymentsResult, attendanceReportResult, classesResult, todayClassesResult, coursesResult, notificationsResult] = await Promise.allSettled([
        dashboardApi.organizationDashboard({ organizationId: organizationScope }),
        dashboardApi.organizationStats({ organizationId: organizationScope }),
        studentsApi.list({ organizationId: organizationScope, pageNumber: 1, pageSize: 1000 }),
        employeeApi.list({ organizationId: organizationScope, pageNumber: 1, pageSize: 1000 }),
        mentorService.getMentors({ organizationId: organizationScope, PageNumber: 1, PageSize: 1000, SortBy: "MentorName", IsDescending: false }),
        batchService.getOrganizationBatches({ organizationId: organizationScope, pageNumber: 1, pageSize: 1000 }),
        paymentApi.paymentHistory({ organizationId: organizationScope, pageNumber: 1, pageSize: 1000 }),
        employeeAttendanceService.report({ organizationId: organizationScope }).then((records) =>
          Array.isArray(records) && records.length
            ? records
            : employeeAttendanceService.list({ organizationId: organizationScope }),
        ),
        liveClassService.list({ organizationId: organizationScope, page: 1, pageSize: 1000 }),
        liveClassService.today({ organizationId: organizationScope, page: 1, pageSize: 1000 }),
        courseService.getCourses({ organizationId: organizationScope, page: 1, pageSize: 1000 }),
        notificationService.getOrganizationNotifications(organizationScope),
      ]);

      const basePayload = dashboardResult.status === "fulfilled"
        ? dashboardResult.value
        : statsResult.status === "fulfilled"
          ? statsResult.value
          : {};
      const result = normalizeDashboard(basePayload);
      // Dashboard aggregates are occasionally broader than the authenticated
      // organization. Build these panels from the organization resource APIs
      // below so an empty organization cannot inherit another tenant's feed.
      result.attendance = {};
      result.attendanceTrend = [];
      result.employeeAttendanceTrend = [];
      result.studentProgress = [];
      result.revenueTrend = [];
      result.upcomingClasses = [];
      result.liveSession = null;
      result.learning = null;
      result.metrics = result.metrics.map((metric) => ({ ...metric, value: "—", note: "Organization data unavailable" }));
      result.approvals = result.approvals.filter(item => String(item.organizationId ?? item.orgId ?? '') === organizationScope);
      result.recentActivity = [];
      result.recentPayments = [];
      result.batchPerformance = [];
      result.atRiskStudents = [];
      const hasOrganizationOwner = (row) => {
        const owner = row.organizationId ?? row.OrganizationId ?? row.orgId ?? row.OrgId
          ?? row.organizationID ?? row.organization?.id ?? row.organization?.organizationId
          ?? row.organisation?.id ?? row.organisation?.organizationId;
        return owner == null || String(owner) === organizationScope;
      };
      const studentRows = resultRows(studentsResult).filter(hasOrganizationOwner);
      setApprovalStudents(studentsResult.status === "fulfilled" ? studentRows : null);
      const enrolledStudents = studentRows.filter((student) => {
        const status = recordStatus(student);
        return !["pending", "pending approval", "awaiting approval", "rejected", "declined", "cancelled", "canceled", "inactive", "disabled", "archived"].includes(status);
      });
      // The Students → Pending Approval tab is the source of truth for
      // registration approvals (see ApprovalQueue.jsx / isPendingApprovalStudent).
      // Reuse it here instead of relying on a dashboard-summary field the
      // backend doesn't populate.
      const pendingApprovalStudents = studentRows.filter(isPendingApprovalStudent).map((student) => ({
        id: textValue(student.studentId ?? student.id),
        name: textValue(student.name ?? student.fullName, "Applicant"),
        type: "Registration approval",
        course: textValue(student.course),
        sla: textValue(student.registrationDate, "Pending"),
        docs: normalizeDocuments(student.docs, student.issues),
        path: "/organization/students?tab=approvals",
      }));
      // Pending enrollment approvals live in the shared approval store (the
      // same source the Approvals page and the Students → Pending approval tab
      // read). Merge the pending ones into the dashboard payload so a
      // successful purchase actually appears here, without duplicating
      // anything already shown above.
      const pendingEnrollmentApprovals = getPendingEnrollmentApprovals()
        .filter((approval) => approval.organizationId != null && String(approval.organizationId) === organizationScope)
        .filter((approval) =>
          !pendingApprovalStudents.some((existing) => String(existing.id) === String(approval.id))
          && !result.approvals.some((existing) => String(existing.id) === String(approval.id)),
        );
      result.approvals = [...pendingApprovalStudents, ...pendingEnrollmentApprovals, ...result.approvals];
      const employeeRows = resultRows(employeesResult).filter(hasOrganizationOwner);
      const mentorRows = resultRows(mentorsResult).filter(hasOrganizationOwner);
      const batchRows = resultRows(batchesResult);
      const backendPaymentRows = resultRows(paymentsResult);
      // The authenticated organization batch endpoint is tenant-scoped; older
      // payloads may omit the owner field. Explicitly owned rows still must match.
      const scopedBatchRows = batchRows.filter((row) => {
        const owner = row.organizationId ?? row.OrganizationId ?? row.orgId ?? row.OrgId
          ?? row.organizationID ?? row.organization?.id ?? row.organization?.organizationId
          ?? row.organisation?.id ?? row.organisation?.organizationId;
        return owner == null || String(owner) === organizationScope;
      });
      const organizationBatchIds = new Set(scopedBatchRows
        .map((row) => row.batchId ?? row.BatchId ?? row.id)
        .filter((id) => id != null)
        .map(String));
      const organizationStudentIds = new Set(studentRows
        .map((row) => row.studentId ?? row.StudentId ?? row.id)
        .filter((id) => id != null)
        .map(String));
      // Finance is organization-scoped. Require a payment to reference a
      // student from this organization's roster, or to carry this org ID.
      const paymentRows = paymentsResult.status === "fulfilled" ? backendPaymentRows.filter((payment) => {
        const owner = payment.organizationId ?? payment.OrganizationId ?? payment.orgId ?? payment.OrgId
          ?? payment.organization?.id ?? payment.organization?.organizationId;
        if (owner != null) return String(owner) === organizationScope;
        const studentId = payment.studentId ?? payment.StudentId ?? payment.student?.studentId ?? payment.student?.id;
        return studentId != null && organizationStudentIds.has(String(studentId));
      }) : [];
      const employeeIds = new Set(employeeRows.map((row) => row.employeeId ?? row.id).filter((id) => id != null).map(String));
      const attendanceRows = resultRows(attendanceReportResult).filter((row) => {
        if (!hasOrganizationOwner(row)) return false;
        const employeeId = row.employeeId ?? row.EmployeeId ?? row.employeeID ?? row.userId ?? row.staffId;
        return employeeId == null || employeeIds.has(String(employeeId));
      });
      const paymentCollectedRevenue = paymentRows.reduce(
        (total, payment) => total + numberValue(
          payment.amount,
          payment.paidAmount,
          payment.totalAmount,
          payment.collectedAmount,
        ),
        0,
      );
      const collectedRevenue = paymentsResult.status === "fulfilled"
        ? paymentCollectedRevenue
        : null;
      const pendingPayments = paymentRows
        .filter((payment) => !["paid", "successful", "completed", "refunded"].includes(String(payment.status ?? payment.paymentStatus ?? "").trim().toLowerCase()))
        .reduce((total, payment) => total + numberValue(payment.amount, payment.dueAmount, payment.pendingAmount, payment.totalAmount), 0);
      const classBelongsToOrganization = (row) => {
        const owner = row.organizationId ?? row.OrganizationId ?? row.orgId ?? row.OrgId
          ?? row.organization?.id ?? row.organization?.organizationId;
        if (owner != null) return String(owner) === organizationScope;
        const batchId = row.batchId ?? row.BatchId ?? row.batch?.batchId ?? row.batch?.id;
        return batchId != null && organizationBatchIds.has(String(batchId));
      };
      const classRows = classesResult.status === "fulfilled"
        ? normalizeLiveClassList(resultRows(classesResult).filter(classBelongsToOrganization))
        : [];
      const todayRows = todayClassesResult.status === "fulfilled"
        ? normalizeLiveClassList(resultRows(todayClassesResult).filter(classBelongsToOrganization))
        : [];
      const todayKey = normalizeDateKey(new Date());
      const listTodayRows = classRows.filter((row) =>
        classDateKey(row) === todayKey && !["cancelled", "canceled"].includes(recordStatus(row)),
      );
      const todayClassRows = (todayRows.length ? todayRows : listTodayRows)
        .filter((row) => !["cancelled", "canceled"].includes(recordStatus(row)));
      if (classesResult.status === "fulfilled" || todayClassesResult.status === "fulfilled") {
        result.classes = todayClassRows.map(normalizeDashboardClass);
      }
      const employeeMentors = employeeRows.filter(mentorEmployee);
      const authoritativeMentors = employeesResult.status === "fulfilled" ? employeeMentors : mentorRows;
      const mentorIds = new Set(
        authoritativeMentors
          .map((row) => row.mentorId ?? row.employeeId ?? row.id)
          .filter((id) => id !== undefined && id !== null)
          .map(String),
      );
      const actualValues = {
        enrollments: studentsResult.status === "fulfilled"
          ? studentRows.length
          : null,
        students: studentsResult.status === "fulfilled"
          ? studentRows.filter(activeStudentRecord).length
          : null,
        trainers: mentorsResult.status === "fulfilled" || employeesResult.status === "fulfilled" ? mentorIds.size : null,
        employees: employeesResult.status === "fulfilled" ? employeeRows.length : null,
        batches: batchesResult.status === "fulfilled" ? scopedBatchRows.length : null,
        classes: classesResult.status === "fulfilled" || todayClassesResult.status === "fulfilled"
          ? todayClassRows.length
          : null,
        revenue: paymentsResult.status === "fulfilled" ? collectedRevenue : null,
        payments: paymentsResult.status === "fulfilled" ? pendingPayments : null,
      };
      if (employeesResult.status !== "fulfilled") {
        result.attendance = {};
        result.employeeAttendanceTrend = [];
      }
      result.finance = {
        ...result.finance,
        collected: collectedRevenue,
        revenueCollected: collectedRevenue,
        paid: collectedRevenue,
        pending: paymentsResult.status === "fulfilled" ? pendingPayments : null,
        overdue: paymentsResult.status === "fulfilled"
          ? paymentRows
            .filter((payment) => String(payment.status ?? payment.paymentStatus ?? "").trim().toLowerCase() === "overdue")
            .reduce((total, payment) => total + numberValue(payment.amount, payment.dueAmount, payment.pendingAmount, payment.totalAmount), 0)
          : null,
        collectionRate: paymentsResult.status === "fulfilled"
          ? (() => {
            const billed = paymentRows.reduce((total, payment) => total + numberValue(payment.totalAmount, payment.amount, payment.dueAmount), 0);
            return billed > 0 ? Math.round(paymentCollectedRevenue / billed * 100) : 0;
          })()
          : null,
        billed: paymentsResult.status === "fulfilled"
          ? paymentRows.reduce((total, payment) => total + numberValue(payment.totalAmount, payment.amount, payment.dueAmount), 0)
          : null,
      };
      if (paymentsResult.status === "fulfilled") {
        result.finance.overduePayments = result.finance.overdue;
        result.finance.pendingPayments = result.finance.pending;
        result.finance.totalBilled = result.finance.billed;
      } else {
        result.finance.overduePayments = null;
        result.finance.pendingPayments = null;
        result.finance.totalBilled = null;
      }
      result.metrics = result.metrics.map((metric) => {
        const actualValue = actualValues[metric.key];
        if (actualValue === undefined) {
          return metric;
        }
        if (actualValue === null || !Number.isFinite(Number(actualValue))) {
          return { ...metric, value: "—", note: "Organization data unavailable" };
        }
        return {
            ...metric,
            value: ["revenue", "payments"].includes(metric.key) ? money(actualValue) : Number(actualValue).toLocaleString("en-IN"),
            note: metric.key === "batches"
              ? `${scopedBatchRows.filter((row) => recordStatus(row) === "active").length} active · ${scopedBatchRows.filter((row) => ["upcoming", "planned", "scheduled"].includes(recordStatus(row))).length} upcoming`
              : metric.key === "employees"
                ? `${employeeRows.filter(activeRecord).length} active employees`
                : metric.key === "trainers"
                  ? `${mentorIds.size} organization mentors`
                  : metric.note,
          };
      });

      const studentBatchMatches = (student, batch) => {
        const studentBatchId = student.batchId ?? student.batch?.batchId ?? student.batch?.id;
        const batchId = batch.batchId ?? batch.id;
        const studentBatchName = textValue(
          student.batchName ?? student.batch?.batchName ?? student.batch?.name ?? student.batch,
          "",
        ).trim().toLowerCase();
        const batchName = textValue(batch.batchName ?? batch.name, "").trim().toLowerCase();
        return (studentBatchId != null && String(studentBatchId) === String(batchId))
          || Boolean(studentBatchName && batchName && studentBatchName === batchName);
      };
      const percentage = (record, ...keys) => {
        for (const key of keys) {
          const value = record?.[key];
          if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
            return Math.max(0, Math.min(100, Number(value)));
          }
        }
        return null;
      };
      const studentName = (student) => textValue(
        student.name ?? student.fullName ?? student.studentName
          ?? [student.firstName, student.lastName].filter(Boolean).join(" "),
        "Student",
      );

      if (studentsResult.status === "fulfilled") {
        result.atRiskStudents = enrolledStudents.map((student) => {
          const attendance = percentage(student, "attendance", "attendancePercentage");
          const progress = percentage(student, "progress", "progressPercentage", "courseProgress");
          // Missing metrics are unknown; don't turn a new student with no
          // attendance/progress history into a false high-risk alert.
          const reasons = [attendance !== null && attendance < 75 ? "Low attendance" : "", progress !== null && progress < 50 ? "Low progress" : ""].filter(Boolean);
          return {
            ...student,
            name: studentName(student),
            course: textValue(student.courseName ?? student.course),
            attendance: attendance ?? 0,
            progress: progress ?? 0,
            reason: reasons.join(" & ") || "Needs attention",
            risk: (attendance !== null && attendance < 50) || (progress !== null && progress < 30) ? "High Risk" : "Monitor",
            hasRiskSignal: reasons.length > 0,
          };
        }).filter((student) => student.hasRiskSignal);
      }

      if (batchesResult.status === "fulfilled") {
        result.batchPerformance = scopedBatchRows.map((batch) => {
          const assignedStudents = studentRows.filter((student) => studentBatchMatches(student, batch));
          const average = (keyList) => {
            const values = assignedStudents
              .map((student) => percentage(student, ...keyList))
              .filter((value) => value !== null);
            return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
          };
          const attendance = average(["attendance", "attendancePercentage"]);
          const progress = average(["progress", "progressPercentage", "courseProgress"]);
          return {
            batch: textValue(batch.batchName ?? batch.name, "Batch"),
            students: assignedStudents.length,
            attendance,
            progress,
            trainer: textValue(batch.mentorName ?? batch.trainerName ?? batch.mentor?.name, "Unassigned"),
            status: attendance >= 75 && progress >= 60 ? "Healthy" : attendance >= 50 && progress >= 30 ? "Monitor" : "Needs Attention",
          };
        });
      }

      result.batchCapacityAlerts = scopedBatchRows.map((batch) => {
        const assignedStudents = studentRows.filter((student) => studentBatchMatches(student, batch));
        const capacity = Number(batch.capacity || 25);
        const enrolled = Math.max(
          assignedStudents.length,
          Number(batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0),
        );
        const remaining = Math.max(0, capacity - enrolled);
        return {
          id: batch.batchId ?? batch.id,
          name: textValue(batch.batchName ?? batch.name, "Batch"),
          course: textValue(batch.courseName ?? batch.course?.courseName ?? batch.course?.name, "Course"),
          enrolled,
          capacity,
          remaining,
          full: remaining === 0,
        };
      }).filter((batch) => batch.remaining <= 1);

      if (paymentsResult.status === "fulfilled") {
        result.recentPayments = paymentRows.map((payment) => ({
          ...payment,
          student: textValue(payment.studentName ?? payment.userName ?? payment.payerName ?? payment.student?.name, "Student"),
          amount: money(payment.amount ?? payment.paidAmount ?? payment.totalAmount),
          date: textValue(payment.paymentDate ?? payment.paidAt ?? payment.createdAt ?? payment.date),
          status: textValue(payment.status ?? payment.paymentStatus, "Pending"),
        }));
      }

      // Recent Activity: the organization's notifications plus its own
      // records, newest first (latestActivity in utils/recentActivity.js).
      // The record entries are kept so a notifications-only refresh can merge
      // new notifications without reloading every module.
      const recordActivity = [
        ...studentRows.map((student) => ({
          key: `student:${student.studentId ?? student.id}`,
          type: "student",
          text: `${studentName(student)} joined as a student`,
          timestamp: recordCreatedAt(student),
          path: `/organization/students/${student.studentId ?? student.id}`,
        })),
        ...employeeRows.map((employee) => ({ key: `employee:${employee.employeeId ?? employee.id}`, type: "employee", text: `${textValue(employee.name ?? employee.fullName ?? [employee.firstName, employee.lastName].filter(Boolean).join(" "), "Employee")} joined as an employee`, timestamp: recordCreatedAt(employee), path: `/organization/employees/${employee.employeeId ?? employee.id}` })),
        ...scopedBatchRows.map((batch) => ({ key: `batch:${batch.batchId ?? batch.id}`, type: "batch", text: `${textValue(batch.batchName ?? batch.name, "Batch")} updated`, timestamp: batch.updatedAt ?? recordCreatedAt(batch), path: `/organization/batches/${batch.batchId ?? batch.id}/details` })),
        ...mentorRows.map((mentor) => ({ key: `mentor:${mentor.mentorId ?? mentor.id}`, type: "mentor", text: `${textValue(mentor.name ?? mentor.fullName, "Mentor")} joined`, timestamp: recordCreatedAt(mentor), path: `/organization/tutors/${mentor.mentorId ?? mentor.id}` })),
        ...classRows
          .filter((item) => item.createdAt || item.createdDate || item.updatedAt || item.updatedDate)
          .map((item) => ({ key: `class:${item.liveClassId ?? item.classId ?? item.id}`, type: "class", text: `${textValue(item.title ?? item.classTitle, "Live class")} scheduled`, timestamp: item.createdAt ?? item.createdDate ?? item.updatedAt ?? item.updatedDate, path: "/organization/live-classes" })),
      ].filter((item) => item.path);
      result.activityRecords = recordActivity;
      result.activityUnavailable = notificationsResult.status === "rejected";
      result.recentActivity = latestActivity([...notificationActivity(resultRows(notificationsResult), organizationScope), ...recordActivity]);

      const employeeAttendanceSnapshot = buildEmployeeAttendanceSnapshot(
        employeeRows,
        result.attendance,
        result.employeeAttendanceTrend,
        attendanceRows,
      );
      result.attendance = employeeAttendanceSnapshot.attendance;
      result.employeeAttendanceTrend = employeeAttendanceSnapshot.trend;
      if (employeesResult.status === "fulfilled" && employeeRows.length === 0) {
        result.attendance = {};
        result.employeeAttendanceTrend = [];
      }

      // ── v20 dashboard cards ────────────────────────────────────────────
      const courseRows = resultRows(coursesResult);
      const scopedCourseRows = courseRows.filter((course) => {
        const owner = course.organizationId ?? course.OrganizationId ?? course.orgId ?? course.OrgId
          ?? course.organizationID ?? course.organization?.id ?? course.organization?.organizationId
          ?? course.organisation?.id ?? course.organisation?.organizationId;
        return owner == null || String(owner) === organizationScope;
      });
      result.courseCount = coursesResult.status === "fulfilled"
        ? scopedCourseRows.length
        : null;
      result.certificates = {
        count: null,
        trend: null,
        recent: [],
      };
      if (studentsResult.status === "fulfilled") {
        const measuredProgressStudents = enrolledStudents.filter((student) =>
          percentage(student, "progress", "progressPercentage", "courseProgress") !== null,
        );
        const progressGroups = [
          { name: "Not started", count: 0 },
          { name: "In progress", count: 0 },
          { name: "Completed", count: 0 },
        ];
        enrolledStudents.forEach((student) => {
          const progress = percentage(student, "progress", "progressPercentage", "courseProgress");
          if (progress === null) return;
          progressGroups[progress >= 100 ? 2 : progress > 0 ? 1 : 0].count += 1;
        });
        result.studentProgress = progressGroups.filter((group) => group.count > 0).map((group, index) => ({
          ...group,
          value: measuredProgressStudents.length
            ? Math.round(group.count / measuredProgressStudents.length * 100)
            : 0,
          color: ["#d97706", "#0d9488", "#f59e0b"][index],
        }));
        if (measuredProgressStudents.length === 0) result.studentProgress = [];
        if (enrolledStudents.length === 0) result.attendanceTrend = [];
      }
      if (studentsResult.status !== "fulfilled" || enrolledStudents.length === 0) {
        result.attendance = {};
        result.attendanceTrend = [];
      }
      if (paymentsResult.status === "fulfilled") {
        const monthTotals = new Map();
        paymentRows.forEach((payment) => {
          const rawDate = payment.paymentDate ?? payment.paidAt ?? payment.createdAt ?? payment.date;
          const date = rawDate ? new Date(rawDate) : null;
          if (!date || Number.isNaN(date.getTime())) return;
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthTotals.set(key, (monthTotals.get(key) ?? 0) + numberValue(payment.amount, payment.paidAmount, payment.totalAmount));
        });
        result.revenueTrend = [...monthTotals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value }));
      }
      // The Classes page and these cards share normalized timestamps/statuses.
      // Include today's endpoint when the full list is unavailable or incomplete.
      const scheduleRows = [...new Map([...classRows, ...todayRows].map(row => [String(row.id), row])).values()];
      Object.assign(result, buildDashboardSchedule(scheduleRows));
      result.learning = await loadDashboardLearning(enrolledStudents, {
        available: studentsResult.status === "fulfilled",
        organizationId: organizationScope,
        getEnrollments: studentsApi.getEnrollments,
        getProgress: studentsApi.getProgress,
      });

      if (dashboardScopeRef.current !== organizationScope) return;
      setDashboard(result);
      setSelectedProgress(result.studentProgress[0] ?? EMPTY_PROGRESS);
      setUpdated(new Date());
      if (dashboardResult.status === "rejected" && statsResult.status === "rejected") {
        setLoadError("Dashboard summary is unavailable; live module totals are shown.");
      }
    } catch (error) {
      setDashboard(EMPTY_DASHBOARD);
      setApprovalStudents(null);
      setSelectedProgress(EMPTY_PROGRESS);
      setLoadError(getApiErrorMessage(error, "Unable to load the organization dashboard."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [organizationScope]);
  useEffect(() => {
    const timer = window.setTimeout(() => loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);
  useEffect(() => {
    const reloadApprovals = () => {
      loadDashboard(true);
    };
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible") reloadApprovals();
    };
    window.addEventListener("kini:student-updated", reloadApprovals);
    window.addEventListener(ENROLLMENT_APPROVAL_EVENT, reloadApprovals);
    window.addEventListener(employeeAttendanceEvent, reloadApprovals);
    window.addEventListener("storage", reloadApprovals);
    window.addEventListener("focus", reloadApprovals);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      window.removeEventListener("kini:student-updated", reloadApprovals);
      window.removeEventListener(ENROLLMENT_APPROVAL_EVENT, reloadApprovals);
      window.removeEventListener(employeeAttendanceEvent, reloadApprovals);
      window.removeEventListener("storage", reloadApprovals);
      window.removeEventListener("focus", reloadApprovals);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [loadDashboard]);
  // Recent Activity stays current without reloading every module: only the
  // notifications feed is re-read (on a new notification, and once a minute
  // while the tab is visible) and merged with the records already loaded.
  const refreshActivity = useCallback(async () => {
    if (!organizationScope || document.visibilityState !== "visible") return;
    try {
      const rows = await notificationService.getOrganizationNotifications(organizationScope);
      if (dashboardScopeRef.current !== organizationScope) return;
      setDashboard((current) => ({
        ...current,
        activityUnavailable: false,
        recentActivity: latestActivity([...notificationActivity(rows, organizationScope), ...(current.activityRecords ?? [])]),
      }));
    } catch {
      setDashboard((current) => ({ ...current, activityUnavailable: true }));
    }
  }, [organizationScope]);
  useEffect(() => {
    window.addEventListener("kini:notification-created", refreshActivity);
    const timer = window.setInterval(refreshActivity, 60000);
    return () => {
      window.removeEventListener("kini:notification-created", refreshActivity);
      window.clearInterval(timer);
    };
  }, [refreshActivity]);
  useEffect(() => {
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setCreateOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = textValue(user?.firstName || user?.name || user?.organizationName, "Admin").split(" ")[0];
  const date = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const enrollmentApprovals = usePendingEnrollmentApprovals();
  const scopedApprovals = asArray(enrollmentApprovals)
    .filter(item => item && typeof item === "object" && !Array.isArray(item))
    .filter(item => item.organizationId != null && String(item.organizationId) === organizationScope);
  const queueItems = approvalStudents == null ? dashboard.approvals
    : buildApprovalQueue(approvalStudents, scopedApprovals).items.map(item => ({
      ...item,
      ...dashboard.approvals.find(existing => String(existing.id) === String(item.id)),
      course: item.course,
      time: dashboard.approvals.find(existing => String(existing.id) === String(item.id))?.time ?? (item.raw ? item.raw.time : item.time),
      type: item.kind ? "Enrollment approval" : "Registration approval",
      path: "/organization/students?tab=approvals",
    }));
  const approvalRows = queueItems
    .map((item) => {
      // Demo enrollment responses provide createdAt, while stored approvals
      // already have time/sla. Normalize both sources before sorting/rendering.
      const time = item.time ?? activityTime(item.createdAt, "");
      const sla = item.pendingDuration ?? item.sla;
      return {
        ...item,
        type: textValue(item.type, "Approval"),
        course: textValue(item.course),
        time: typeof time === "string" || typeof time === "number" ? String(time) : "",
        sla: typeof sla === "string" || typeof sla === "number" ? String(sla) : "",
        docs: normalizeDocuments(item.docs, item.issues),
      };
    });
  const revealRef = useRef(null);
  useScrollReveal(revealRef, REVEAL_PLAN);
  const metricOf = (key) => dashboard.metrics.find((metric) => metric.key === key);
  // Count exactly the records opened by the Inactive Students link.
  const inactiveStudents = approvalStudents == null ? null
    : approvalStudents.filter(student => recordStatus(student) === "inactive").length.toLocaleString("en-IN");
  // Month-over-month change from the revenue series itself; no figure is shown
  // without two months of data.
  const revenueTrendNote = (() => {
    const values = dashboard.revenueTrend.map((point) => Number(point.value)).filter(Number.isFinite);
    if (values.length < 2 || !values[values.length - 2]) return "Monthly collections trend";
    const change = Math.round(((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 1000) / 10;
    return `Monthly collections trend · ${change > 0 ? "+" : ""}${change}% vs last month`;
  })();
  const attendanceValue = attendanceScope === "students"
    ? dashboard.attendance.studentPercentage ?? dashboard.attendance.students
    : dashboard.attendance.employeePercentage ?? dashboard.attendance.employees;
  const attendanceSeries = attendanceScope === "students"
    ? dashboard.attendanceTrend
    : dashboard.employeeAttendanceTrend;
  const hasAttendanceData = attendanceValue !== undefined && attendanceValue !== null
    || attendanceSeries.some((item) => Number.isFinite(Number(item.present)) || Number.isFinite(Number(item.absent)));
  const handleCreateAction = (label, path) => {
    setCreateOpen(false);
    if (label === "Add Student") {
      setStudentFormOpen(true);
      return;
    }
    if (label === "Add Employee") {
      setEmployeeFormOpen(true);
      return;
    }
    navigate(path + (path.includes('?') ? '&' : '?') + 'returnTo=%2Forganization%2Fdashboard');
  };
  const saveStudent = async (values) => {
    await studentsApi.create(values);
    setToast("Student added successfully.");
    window.setTimeout(() => setToast(""), 2600);
    loadDashboard(true);
  };
  const withReturn = (path) => path + (path.includes("?") ? "&" : "?") + "returnTo=%2Forganization%2Fdashboard";
  const updatedLabel = updated
    ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(updated)
    : "—";
  if (loading)
    return (
      <main className="kd kd-loading" aria-busy="true" aria-label="Loading dashboard">
        <div className="kd-skeleton is-hero" />
        <div className="kd-kpis">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="kd-skeleton is-kpi" />)}
        </div>
        <div className="kd-row is-3">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="kd-skeleton is-panel" />)}
        </div>
      </main>
    );
  return (
    <main ref={revealRef} className="kd">
      <DashboardHero
        name={name}
        today={{
          date,
          greeting: `${greeting}, ${name}`,
          updated: updatedLabel,
          refreshing,
          onRefresh: () => !refreshing && loadDashboard(true),
        }}
        actions={
          <div ref={menuRef} className="kd-menu">
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              aria-expanded={createOpen}
              aria-haspopup="menu"
              className="kd-btn is-ghost"
            >
              <Plus aria-hidden="true" />
              Create
              <ChevronDown aria-hidden="true" />
            </button>
            {createOpen && (
              <div role="menu" className="kd-menu__list">
                {CREATE_ACTIONS.map(([label, Icon, path]) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    onClick={() => handleCreateAction(label, path)}
                    className="kd-menu__item"
                  >
                    <span className="kd-chip is-small is-blue" aria-hidden="true"><Icon /></span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {loadError && (
        <section role="alert" className="kd-alert is-error">
          <span>{loadError}</span>
          <button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="kd-btn is-small is-danger">Retry</button>
        </section>
      )}

      <DashboardKpis
        onOpen={(path) => navigate(path)}
        items={[
          { key: "students", label: "Total Students", value: metricOf("enrollments")?.value, note: "Registered learners", path: "/organization/students" },
          { key: "active", label: "Active Students", value: metricOf("students")?.value, note: "Currently learning", path: "/organization/students?status=active" },
          { key: "inactive", label: "Inactive Students", value: inactiveStudents, note: "Not currently learning", path: "/organization/students?status=inactive" },
          { key: "mentors", label: "Mentors", value: metricOf("trainers")?.value, note: "Expert mentors", path: "/organization/tutors" },
          { key: "courses", label: "Total Courses", value: dashboard.courseCount == null ? null : Number(dashboard.courseCount).toLocaleString("en-IN"), note: "Published courses", path: "/organization/courses" },
          { key: "employees", label: "Total Employees", value: metricOf("employees")?.value, note: metricOf("employees")?.note || "Organization employees", path: "/organization/employees" },
        ]}
      />

      {dashboard.batchCapacityAlerts.length > 0 && (
        <section className="kd-alert is-warning" aria-label="Batch capacity alerts">
          <header className="kd-alert__head">
            <AlertTriangle aria-hidden="true" />
            <div>
              <h2>Batch capacity alerts</h2>
              <p>Batches that are full or have only one seat left</p>
            </div>
            <button type="button" className="kd-link" onClick={() => navigate("/organization/batches")}>
              Manage batches <ArrowRight aria-hidden="true" />
            </button>
          </header>
          <div className="kd-alert__grid">
            {dashboard.batchCapacityAlerts.map((batch) => (
              <button key={batch.id} type="button" onClick={() => navigate(`/organization/batches/${batch.id}/details`)} className="kd-alert__item">
                <span><b>{batch.name}</b><small>{batch.course} · {batch.enrolled}/{batch.capacity} students</small></span>
                <span className={`kd-pill ${batch.full ? "is-red" : "is-orange"}`}>{batch.full ? "Full · next batch ready" : "1 seat left"}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="kd-row is-learning">
        <UpcomingClassesCard
          classes={dashboard.upcomingClasses ?? []}
          onSchedule={() => navigate("/organization/live-classes?create=true")}
          onViewAll={() => navigate("/organization/live-classes")}
          // Open the live-class workspace without replaying a possibly stale
          // title search. The live-classes page is the source of truth for
          // currently available sessions.
          onJoin={(item) => {
            const query = item?.query || item?.title;
            navigate(query
              ? `/organization/live-classes?class=${encodeURIComponent(query)}`
              : "/organization/live-classes");
          }}
        />
        <LearningProgressCard
          progress={dashboard.learning ?? { completed: 0, inProgress: 0, notStarted: 0, overall: null, current: null }}
          onViewAll={() => navigate("/organization/students")}
        />
        <LiveSessionCard
          session={dashboard.liveSession ?? null}
          onView={() => navigate("/organization/live-classes")}
          onDetails={() => navigate(dashboard.liveSession?.query
            ? `/organization/live-classes?class=${encodeURIComponent(dashboard.liveSession.query)}`
            : "/organization/live-classes")}
          onJoin={() => navigate(dashboard.liveSession?.query
            ? `/organization/live-classes?class=${encodeURIComponent(dashboard.liveSession.query)}`
            : "/organization/live-classes")}
        />
      </div>

      <QuickActions onOpen={(path) => navigate(withReturn(path))} />

      <div className="kd-row is-activity">
        <BatchPerformanceCard
          rows={dashboard.batchPerformance.map((row) => ({ ...row, assessments: row.assessments ?? row.assessmentScore ?? null }))}
          onViewAll={() => navigate("/organization/batches")}
        />
        <RecentActivityCard
          items={dashboard.recentActivity.map((item) => ({ ...item, detail: item.detail ?? item.subtitle }))}
          unavailable={Boolean(dashboard.activityUnavailable)}
          onViewAll={() => navigate("/organization/notifications")}
          onOpen={(path) => navigate(path)}
        />
        <CertificatesCard
          certificates={{ count: null, inProgress: null, thisMonth: null, recent: [], ...dashboard.certificates }}
          onViewAll={() => navigate("/organization/certificates")}
        />
      </div>

      <div className="kd-row is-3">
        <OperationsCard
          approvals={approvalRows}
          onViewAll={() => navigate("/organization/students?tab=approvals")}
          onReview={(item, hasIssues) => navigate(
            item.path || `/organization/approvals?approvalId=${item.id}${hasIssues ? "" : "&action=approve"}`,
          )}
        />
        <RevenueCard
          finance={{
            collected: dashboard.finance.collected ?? dashboard.finance.revenueCollected,
            pending: dashboard.finance.pending ?? dashboard.finance.pendingPayments,
            overdue: dashboard.finance.overdue ?? dashboard.finance.overduePayments,
            collectionRate: numberValue(dashboard.finance.collectionRate),
            billed: numberValue(dashboard.finance.billed ?? dashboard.finance.totalBilled),
          }}
          trend={dashboard.revenueTrend}
          note={revenueTrendNote}
          available={(dashboard.finance.collected ?? dashboard.finance.revenueCollected) != null}
          onViewFinance={() => navigate("/organization/finance?tab=overview")}
          onOpenTab={(tab) => navigate(`/organization/finance?tab=${tab}`)}
        />
        <AttendanceCard
          scope={attendanceScope}
          onScope={setAttendanceScope}
          value={attendanceValue}
          series={attendanceSeries}
          hasData={hasAttendanceData}
          change={dashboard.attendance.change}
          onAnalytics={() => navigate(
            attendanceScope === "students"
              ? "/organization/attendance?period=7-days&scope=students"
              : "/employee/hr-attendance",
          )}
        />
      </div>

      <div className="kd-row is-insights">
        <StudentProgressCard
          groups={dashboard.studentProgress}
          selected={selectedProgress}
          onSelect={setSelectedProgress}
          onViewAll={() => navigate("/organization/students")}
        />
        <AtRiskCard
          students={dashboard.atRiskStudents}
          onViewAll={() => {
            sessionStorage.setItem("organization-at-risk-students", JSON.stringify(dashboard.atRiskStudents ?? []));
            navigate("/organization/students?risk=at-risk");
          }}
          onView={(student) => navigate(student.studentId ?? student.id
            ? `/organization/students/${student.studentId ?? student.id}`
            : `/organization/students?risk=at-risk&student=${encodeURIComponent(student.name)}`)}
        />
      </div>

      <RecentPaymentsCard
        payments={dashboard.recentPayments}
        onViewAll={() => navigate("/organization/finance?tab=payment-history")}
        onOpen={(payment) => navigate(
          payment.status === "Paid"
            ? `/organization/finance?tab=payment-history&student=${encodeURIComponent(payment.student)}`
            : `/organization/finance?tab=pending&student=${encodeURIComponent(payment.student)}`,
        )}
      />
      <StudentForm
        open={studentFormOpen}
        student={null}
        onClose={() => setStudentFormOpen(false)}
        onSave={saveStudent}
      />
      <EmployeeFormModal
        open={employeeFormOpen}
        onClose={() => setEmployeeFormOpen(false)}
        onCreated={() => {
          loadDashboard(true);
        }}
      />
      {toast && createPortal(
        <div
          id="dashboard-action-toast"
          role="status"
          aria-live="polite"
          className="fixed right-4 top-20 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-2xl sm:right-5"
          style={{
            zIndex: 10000,
            width: "min(24rem, calc(100vw - 2rem))",
            backgroundColor: "#047857",
            color: "#ffffff",
            border: "1px solid #065f46",
            fontWeight: 700,
          }}
        >
          <UserCheck className="h-4 w-4 shrink-0" style={{ color: "#ffffff" }} />
          <span className="min-w-0 leading-5" style={{ color: "#ffffff" }}>{toast}</span>
        </div>,
        document.body,
      )}
    </main>
  );
}
