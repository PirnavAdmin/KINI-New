/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  FileWarning,
  GraduationCap,
  Layers3,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import hotToast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import useBatches from "@/hooks/useBatches";
import { batchService } from "@shared/services/batchService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { studentsApi } from "@/api/students";
import { reconcileBatchRoster } from "@shared/utils/batchRoster";
import { getMentorDashboardBatches } from "@shared/services/mentorService";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { normalizeLiveClass, normalizeAttendanceRows } from "@features/live-classes/utils/liveClassMappers";
import { attendanceService } from "@shared/services/attendanceService";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { useProfilePhotos } from "@shared/hooks/useProfilePhoto";
import { toProfileId } from "@shared/services/profilePhotoService";
import assessmentService from "@/services/assessmentService";
import StatusBadge from "@shared/components/StatusBadge";
import EmptyState from "@shared/components/EmptyState";
import { TableSkeleton } from "@shared/ui/Skeleton";
import Modal from "@shared/components/Modal";
import BatchForm from "./BatchForm";
import ScheduleClasses from "./ScheduleClasses";
import { EntityHero, ProfileTabs, StatTile } from "@features/organization/components/profile/ProfileKit";
import "./batch-detail-density.css";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import { ClipboardCheck, FileCheck2, Home, MonitorPlay } from "lucide-react";

const TAB_ICONS = {
  Overview: Home,
  "Schedule & Classes": CalendarDays,
  Students: MonitorPlay,
  "Attendance Summary": ClipboardCheck,
  Assessments: FileCheck2,
};
const tabs = [
  "Overview",
  "Schedule & Classes",
  "Students",
  "Attendance Summary",
  "Assessments",
];
const liveClassMatchesBatch = (liveClass, batchId) =>
  liveClass?.batchId != null && String(liveClass.batchId) === String(batchId);
// Existing app convention on this screen: 75% is the Good/Low attendance cutoff.
const ATTENDANCE_HEALTHY_THRESHOLD = 75;
// Below this attendance a student counts as "At Risk" in the Student
// distribution chart (the organization dashboard's high-risk line).
const ATTENDANCE_AT_RISK_THRESHOLD = 50;
const ATTENDANCE_COL_TONES = ["blue", "green", "red", "blue", "purple", "purple", "blue", "orange", "green", "red", "blue", "purple", "purple"];
// Heatmap-only compact form of a class's real date ("08 Sep") — the year is
// shown once in the panel subtitle instead of on every column, which is what
// was forcing each header into a 3-line wrap and blowing out the table width.
const formatCompactDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};
const ASSESSMENT_STATUSES = ["Scheduled", "Active", "Published", "Results Published", "Draft", "Cancelled"];
// Published/Active/Results Published are all "the assessment is live or its
// results are out" in this app's existing vocabulary (see AssessmentsPage.jsx's
// own badge logic) — reused here rather than inventing a new status taxonomy.
const assessmentStatusClasses = (status) => {
  const value = String(status ?? "Draft");
  if (["Published", "Active", "Results Published"].includes(value)) return "bg-[#E8F8F1] text-[#10A875]";
  if (value === "Scheduled") return "bg-[#FFF4E5] text-[#F39924]";
  if (value === "Cancelled") return "bg-[#FFF0F0] text-[#E05252]";
  return "bg-[#EFF4F8] text-[#647C91]";
};
// The reference alternates each row's Name-column icon tint (blue/purple/
// orange) by assessment type rather than one fixed color for every row.
const ASSESSMENT_TYPE_TINTS = {
  MCQ: { bg: "#EAF4FF", fg: "#2F80ED" },
  Coding: { bg: "#F1ECFF", fg: "#8B5CF6" },
  Mixed: { bg: "#FFF4E5", fg: "#F39924" },
};
const ASSESSMENT_TINT_CYCLE = [{ bg: "#EAF4FF", fg: "#2F80ED" }, { bg: "#F1ECFF", fg: "#8B5CF6" }, { bg: "#FFF4E5", fg: "#F39924" }];
const assessmentTint = (type, index) => ASSESSMENT_TYPE_TINTS[type] ?? ASSESSMENT_TINT_CYCLE[index % ASSESSMENT_TINT_CYCLE.length];
const formatAssessmentDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : null;
};
// Matches the existing day-first format already used for the batch header's
// own start/end dates ("7 Sept 2026"), distinct from the assessments table's
// US month-first style above.
const formatDayMonthYear = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
};
const formatAssessmentTime = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;
};
const ASSESSMENTS_PAGE_SIZE = 10;
function Panel({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border bg-white shadow-sm ${className}`}>
      <h2 className="border-b px-5 py-4 text-sm font-semibold lg:px-4 lg:py-3">{title}</h2>
      <div className="p-5 lg:p-4">{children}</div>
    </section>
  );
}
export default function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveBatch } = useBatches();
  const [batch, setBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatus, setStudentStatus] = useState("All");
  const [storedScheduleClasses, setScheduleClasses] = useState([]);
  const [classClock, setClassClock] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setClassClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const scheduleClasses = useMemo(() => storedScheduleClasses.map((item) => normalizeLiveClass(item, { now: classClock })), [storedScheduleClasses, classClock]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [classAttendance, setClassAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);
  const [attendanceClassFilter, setAttendanceClassFilter] = useState("all");
  const [pageOpenedAt] = useState(() => Date.now());
  const [attendanceSelected, setAttendanceSelected] = useState(() => new Set());
  const [markMenuOpen, setMarkMenuOpen] = useState(false);
  const markMenuRef = useRef(null);
  useEffect(() => {
    if (!markMenuOpen) return undefined;
    const close = (event) => { if (!markMenuRef.current?.contains(event.target)) setMarkMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [markMenuOpen]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [form, setForm] = useState(false);
  const [remove, setRemove] = useState(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  // loadBatchStudents itself calls setBatch(...) below, which produces a new
  // `batch` object on every successful load. Depending on `batch` directly
  // would recreate this callback each time, retrigger the effect that calls
  // it, and loop forever (visible as "Loading enrolled students..." never
  // settling). A ref sidesteps that without losing the current batch name.
  const batchNameRef = useRef("");
  useEffect(() => {
    batchNameRef.current = String(batch?.name ?? "").trim().toLowerCase();
  }, [batch?.name]);
  const loadBatchStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError("");
    const [batchStudentsResult, organizationStudentsResult] = await Promise.allSettled([
      batchService.getStudents(batchId),
      studentsApi.list(),
    ]);

    try {
      if (batchStudentsResult.status === "rejected" && organizationStudentsResult.status === "rejected") {
        throw batchStudentsResult.reason;
      }
      const payload = batchStudentsResult.status === "fulfilled"
        ? (batchStudentsResult.value?.data ?? batchStudentsResult.value)
        : [];
      const endpointRows = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.students || [];
      const organizationRows = organizationStudentsResult.status === "fulfilled"
        ? (organizationStudentsResult.value?.data ?? [])
        : [];
      const rows = reconcileBatchRoster(
        { batchId, name: batchNameRef.current }, endpointRows, organizationRows,
      );
      setBatchStudents(rows);
      setBatch((current) => {
        if (!current) return current;
        const enrolledStudents = rows.length;
        const capacity = Number(payload?.capacity || current.capacity || 0);
        return {
          ...current,
          enrolledStudents,
          students: enrolledStudents,
          capacity,
          availableSeats: Math.max(0, capacity - enrolledStudents),
        };
      });
    } catch (error) {
        setBatchStudents([]);
        setStudentsError(
          getApiErrorMessage(error, "Unable to load enrolled students."),
        );
    } finally {
      setStudentsLoading(false);
    }
  }, [batchId]);
  useEffect(() => {
    let active = true;
    const isMentorRoute = location.pathname.startsWith("/mentor/");
    const loadBatchList = isMentorRoute
      ? getMentorDashboardBatches()
      : batchService.getOrganizationBatches({ pageSize: 25 });
    Promise.resolve(loadBatchList)
      .then((response) => {
        if (!active) return;
        const source = response?.batches ?? response?.items ?? response?.records ?? response?.data ?? response;
        const rows = Array.isArray(source) ? source : [];
        const item = rows.find(
          (candidate) => String(candidate.batchId ?? candidate.id) === String(batchId),
        );
        if (!item) {
          setBatch(null);
          return;
        }
        setBatch({
          ...item,
          id: String(item.batchId ?? item.id),
          batchId: item.batchId ?? item.id,
          name: item.batchName ?? item.name ?? "Untitled batch",
          code: item.batchCode ?? item.BatchCode ?? item.batch_code ?? item.code ?? item.batchNumber ?? "",
          course: item.courseName ?? "—",
          trainer: item.mentorName ?? "Unassigned",
          mode: item.batchType ?? "—",
          students: Number(item.enrolledStudents ?? item.studentsCount ?? item.studentCount ?? 0),
          enrolledStudents: Number(item.enrolledStudents ?? item.studentsCount ?? item.studentCount ?? 0),
          capacity: Number(item.capacity ?? 0),
          liveClasses: Number(item.liveClasses ?? 0),
          recordedClasses: Number(item.recordedClasses ?? 0),
          availableSeats: Number(
            item.availableSeats ?? Math.max(0, Number(item.capacity ?? 0) - Number(item.enrolledStudents ?? 0)),
          ),
        });
      })
      .catch((error) => {
        if (!active) return;
        setBatch(null);
        hotToast.error(
          getApiErrorMessage(error, "Unable to load batch details."),
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [batchId, location.pathname]);
  useEffect(() => {
    const refresh = () => loadBatchStudents();
    window.addEventListener('kini:student-updated', refresh);
    return () => window.removeEventListener('kini:student-updated', refresh);
  }, [loadBatchStudents]);

  const loadSchedule = useCallback(async (silent = false) => {
    if (!silent) setScheduleLoading(true);
    setScheduleError("");
    setClassAttendance({});
    setAttendanceLoaded(false);
    setAttendanceError("");
    try {
      const response = await liveClassService.list({ batchId, page: 1, pageSize: 1000 });
      const rows = Array.isArray(response) ? response : [];
      const normalized = rows
        .map(normalizeLiveClass)
        .filter((item) => liveClassMatchesBatch(item, batchId))
        .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0));
      setScheduleClasses(normalized);
    } catch (error) {
      setScheduleClasses([]);
      setScheduleError(
        getApiErrorMessage(error, "Unable to load the schedule for this batch."),
      );
    } finally {
      setScheduleLoading(false);
    }
  }, [batchId]);
  useEffect(() => {
    loadSchedule().catch(() => {});
    const timer = window.setInterval(() => loadSchedule(true).catch(() => {}), 30000);
    return () => window.clearInterval(timer);
  }, [loadSchedule]);
  const loadAttendance = useCallback(async () => {
    if (!storedScheduleClasses.length) {
      setClassAttendance({});
      setAttendanceLoaded(true);
      return;
    }
    setAttendanceLoading(true);
    setAttendanceError("");
    const results = await Promise.allSettled(
      storedScheduleClasses.map((cls) => attendanceService.byLiveClass(cls.id)),
    );
    const map = {};
    let failures = 0;
    let lastError = null;
    results.forEach((result, index) => {
      const classId = storedScheduleClasses[index].id;
      if (result.status === "fulfilled") {
        const rows = Array.isArray(result.value) ? result.value : [];
        map[classId] = normalizeAttendanceRows(rows);
      } else {
        failures += 1;
        lastError = result.reason;
      }
    });
    setClassAttendance(map);
    // GET /api/Attendance/liveclass/{liveClassId} is per-session — a single
    // class failing (e.g. attendance never generated for it) must not hide
    // every other class's real records, so only surface an error banner when
    // every request failed.
    if (failures && failures === results.length) {
      setAttendanceError(
        getApiErrorMessage(lastError, "Unable to load attendance for this batch."),
      );
    }
    setAttendanceLoading(false);
    setAttendanceLoaded(true);
  }, [storedScheduleClasses]);
  useEffect(() => {
    // Overview needs it too: the Student distribution chart is built from it.
    if ((tab !== "Attendance Summary" && tab !== "Overview") || attendanceLoaded || scheduleLoading) return;
    loadAttendance().catch(() => {});
  }, [tab, attendanceLoaded, scheduleLoading, loadAttendance]);
  const [assessments, setAssessments] = useState({ loading: true, rows: [], error: "" });
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("All");
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState("All");
  const [assessmentDateFilter, setAssessmentDateFilter] = useState("");
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [assessmentMenuId, setAssessmentMenuId] = useState(null);
  // getAssessments() is the same real, existing org-wide endpoint the
  // Assessments management page uses (assessmentService.getAssessments →
  // GET /api/Assessment) — there is no per-batch assessment endpoint, so this
  // fetches once and filters to this batch client-side, same as useAssessments.js.
  const loadAssessments = useCallback(async () => {
    setAssessments((current) => ({ ...current, loading: true, error: "" }));
    try {
      const rows = await assessmentService.getAssessments();
      setAssessments({ loading: false, rows: Array.isArray(rows) ? rows : [], error: "" });
    } catch (error) {
      setAssessments({ loading: false, rows: [], error: getApiErrorMessage(error, "Unable to load assessments for this batch.") });
    }
  }, []);
  useEffect(() => {
    if (tab === "Assessments") loadAssessments();
  }, [tab, loadAssessments]);
  const batchAssessments = useMemo(() => {
    const batchNameLower = String(batch?.name ?? "").trim().toLowerCase();
    return assessments.rows.filter((row) => {
      if (row.batchId != null && String(row.batchId) === String(batchId)) return true;
      const rowBatchName = String(row.batchName ?? "").trim().toLowerCase();
      return Boolean(batchNameLower) && rowBatchName === batchNameLower;
    });
  }, [assessments.rows, batchId, batch?.name]);
  // Built from whichever real assessmentType values this batch's own
  // assessments actually use — never the fixed MCQ/Coding/Mixed list, so a
  // batch that only has one type doesn't show empty filter options.
  const assessmentTypeOptions = useMemo(() => {
    const seen = new Set();
    batchAssessments.forEach((row) => {
      const type = row.assessmentType ?? row.type;
      if (type) seen.add(type);
    });
    return Array.from(seen);
  }, [batchAssessments]);
  const filteredAssessments = useMemo(() => {
    const query = assessmentSearch.trim().toLowerCase();
    return batchAssessments.filter((row) => {
      const title = String(row.title ?? "");
      const matchesSearch = !query || title.toLowerCase().includes(query);
      const status = row.status ?? "Draft";
      const matchesStatus = assessmentStatusFilter === "All" || status === assessmentStatusFilter;
      const type = row.assessmentType ?? row.type;
      const matchesType = assessmentTypeFilter === "All" || type === assessmentTypeFilter;
      const rawDate = row.startDate ?? row.start;
      const matchesDate = !assessmentDateFilter
        || (rawDate && !Number.isNaN(new Date(rawDate).getTime()) && new Date(rawDate).toISOString().slice(0, 10) === assessmentDateFilter);
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [batchAssessments, assessmentSearch, assessmentStatusFilter, assessmentTypeFilter, assessmentDateFilter]);
  useEffect(() => {
    setAssessmentPage(1);
  }, [assessmentSearch, assessmentStatusFilter, assessmentTypeFilter, assessmentDateFilter, tab]);
  const assessmentTotalPages = Math.max(1, Math.ceil(filteredAssessments.length / ASSESSMENTS_PAGE_SIZE));
  const pagedAssessments = useMemo(() => {
    const start = (assessmentPage - 1) * ASSESSMENTS_PAGE_SIZE;
    return filteredAssessments.slice(start, start + ASSESSMENTS_PAGE_SIZE);
  }, [filteredAssessments, assessmentPage]);
  const resetAssessmentFilters = () => {
    setAssessmentSearch("");
    setAssessmentStatusFilter("All");
    setAssessmentTypeFilter("All");
    setAssessmentDateFilter("");
  };
  // One batch photo request for the whole roster, only once the attendance grid is shown.
  const { photos: studentPhotos } = useProfilePhotos(
    "student",
    batchStudents.map((student) => student.studentId ?? student.id),
    { enabled: tab === "Attendance Summary" },
  );
  const attendanceSummaryRows = batchStudents.map((student) => {
    const studentId = String(student.studentId ?? student.id);
    const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
    const name = student.studentName ?? student.fullName ?? student.name ?? fullName ?? "Student";
    let present = 0;
    let absent = 0;
    let late = 0;
    const cells = scheduleClasses.map((cls) => {
      const rows = classAttendance[cls.id] || [];
      const record = rows.find((row) => String(row.studentId) === studentId);
      const status = record?.status;
      if (status === "present" || status === "attended") present += 1;
      else if (status === "late") late += 1;
      else if (status === "absent" || status === "missed") absent += 1;
      return { classId: cls.id, status: status || null };
    });
    const recorded = present + absent + late;
    const percentage = recorded ? Math.round(((present + late) / recorded) * 100) : null;
    return {
      studentId,
      name,
      cells,
      present,
      absent,
      late,
      percentage,
      status: percentage == null ? null : percentage < ATTENDANCE_HEALTHY_THRESHOLD ? "Low" : "Good",
    };
  });
  const hasAnyAttendanceRecord = Object.values(classAttendance).some((rows) => rows.length > 0);
  // Student distribution (Overview), from each student's recorded attendance:
  // On Track at or above ATTENDANCE_HEALTHY_THRESHOLD, At Risk below
  // ATTENDANCE_AT_RISK_THRESHOLD, Needs Attention in between. Students with no
  // recorded attendance are counted separately rather than guessed.
  const studentDistribution = (() => {
    const recordedRows = attendanceSummaryRows.filter((row) => row.percentage != null);
    const count = (test) => recordedRows.filter((row) => test(row.percentage)).length;
    const recorded = recordedRows.length;
    const segments = [
      { name: "On Track", label: "On Track", color: "#10b981", textClass: "text-emerald-600", value: count((pct) => pct >= ATTENDANCE_HEALTHY_THRESHOLD) },
      { name: "Needs Attention", label: "Needs Attn", color: "#f59e0b", textClass: "text-amber-600", value: count((pct) => pct >= ATTENDANCE_AT_RISK_THRESHOLD && pct < ATTENDANCE_HEALTHY_THRESHOLD) },
      { name: "At Risk", label: "At Risk", color: "#ef4444", textClass: "text-red-600", value: count((pct) => pct < ATTENDANCE_AT_RISK_THRESHOLD) },
    ].map((segment) => ({ ...segment, percent: recorded ? Math.round((segment.value / recorded) * 100) : 0 }));
    return { recorded, unrecorded: attendanceSummaryRows.length - recorded, segments };
  })();
  // Real class dates can span one month or several — shown once here instead
  // of repeating the year on every compact "08 Sep" column header.
  const attendanceMonthLabel = (() => {
    const months = [];
    scheduleClasses.forEach((cls) => {
      const date = new Date(cls.startAt);
      if (Number.isNaN(date.getTime())) return;
      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!months.includes(label)) months.push(label);
    });
    if (!months.length) return "";
    return months.length === 1 ? months[0] : `${months[0]} – ${months[months.length - 1]}`;
  })();
  // Two distinct real live classes can share a calendar day. Same-day columns
  // stay separate (each is a real, distinct liveClassId) but get a second
  // line with the class's own real startTime so they aren't visually
  // identical — never an invented time or a "#1/#2" counter.
  const visibleAttendanceColumns = scheduleClasses
    .map((cls, index) => ({ cls, index }))
    .filter(({ cls }) => attendanceClassFilter === "all" || String(cls.status ?? "").toLowerCase() === attendanceClassFilter);
  // "Mark Attendance" opens the live-class attendance screen for the class
  // running today, otherwise the most recent class that has started.
  const markableClass = (() => {
    const nowMs = pageOpenedAt;
    const started = scheduleClasses.filter((cls) => new Date(cls.startAt).getTime() <= nowMs);
    return started[started.length - 1] ?? scheduleClasses[0] ?? null;
  })();
  const sameDayClassCounts = scheduleClasses.reduce((counts, cls) => {
    const key = formatCompactDate(cls.startAt);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const filteredStudents = batchStudents.filter((student) => {
    const fullName = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();
    const query = studentSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      String(student.email || "").toLowerCase().includes(query) ||
      String(student.phone || "").toLowerCase().includes(query) ||
      String(student.studentId || "").includes(query);
    const matchesStatus =
      studentStatus === "All" ||
      String(student.status || "").toLowerCase() === studentStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  const capacityPercentage =
    batch?.capacity > 0
      ? Math.min(100, Math.round((Number(batch.enrolledStudents ?? 0) / batch.capacity) * 100))
      : 0;
  // Attendance Rate is the average of each class's own backend-computed
  // attendancePercentage — only classes with recorded attendance count, so an
  // all-scheduled batch shows "—" instead of a misleading 0%.
  const kpis = useMemo(() => {
    const completedClasses = scheduleClasses.filter((item) => item.status === "completed");
    const upcomingClasses = scheduleClasses
      .filter((item) => item.status === "scheduled" && Date.parse(item.startAt) > classClock)
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0));
    const attended = scheduleClasses.filter((item) => item.attendancePercentage > 0);
    const attendanceRate = attended.length
      ? Math.round(attended.reduce((sum, item) => sum + item.attendancePercentage, 0) / attended.length)
      : null;
    return {
      totalClasses: scheduleClasses.length,
      completed: completedClasses.length,
      upcoming: upcomingClasses.length,
      nextUpcomingAt: upcomingClasses[0]?.startAt ?? null,
      attendanceRate,
    };
  }, [scheduleClasses, classClock]);
  const batchCode = batch?.batchCode ?? batch?.BatchCode ?? batch?.batch_code ?? batch?.code ?? batch?.batchNumber ?? "";
  useEffect(() => {
    if (batch?.id) loadBatchStudents().catch(() => {});
  }, [loadBatchStudents, batch?.id]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);
  if (loading)
    return (
      <main className="min-h-full bg-slate-50 p-6">
        <div className="h-[650px] animate-pulse rounded-xl bg-slate-200" />
      </main>
    );
  if (!batch)
    return (
      <main className="grid min-h-full place-items-center">
        <button
          onClick={() => navigate("/organization/courses")}
          className="text-blue-600"
        >
          Batch not found · Back
        </button>
      </main>
    );
  return (
    <main className="org-batch-detail min-h-full p-4 text-[#133B5D] sm:p-5">
      <div className="mx-auto max-w-[1500px] space-y-5 lg:space-y-3">
        <button
          onClick={() => navigate("/organization/batches")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647C96] transition hover:text-[#133B5D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </button>
        <EntityHero
          icon={Layers3}
          title={batch.name}
          status={batch.status}
          statusTone={String(batch.status ?? "").toLowerCase() === "active" ? "green" : /cancel/i.test(String(batch.status ?? "")) ? "red" : /upcoming/i.test(String(batch.status ?? "")) ? "blue" : "gray"}
          lines={[["Course", batch.course], ["Mentor", batch.trainer]]}
          meta={[
            {
              icon: CalendarDays,
              text: `${new Date(batch.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(batch.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
            },
            { icon: Users, text: `${batch.enrolledStudents ?? batch.students ?? 0} Students` },
            ...(batchCode ? [{ icon: Tag, text: `Batch ID: ${batchCode}` }] : []),
          ]}
          image={ORG_BANNERS.batchDetail?.src}
          action={
            <button type="button" onClick={() => setForm(true)} className="pk-btn pk-btn--navy">
              <Edit3 /> Edit Batch
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-5">
          {[
            { label: "Students", value: batch.enrolledStudents ?? batch.students ?? 0, icon: Users, tone: "blue", sub: "Enrolled in batch", onClick: () => setTab("Students") },
            { label: "Total Classes", value: kpis.totalClasses, icon: Layers3, tone: "purple", onClick: () => setTab("Schedule & Classes") },
            { label: "Completed", value: kpis.completed, icon: CheckCircle2, tone: "green", sub: kpis.totalClasses ? `${Math.round((kpis.completed / kpis.totalClasses) * 100)}% of total` : null, onClick: () => setTab("Schedule & Classes") },
            { label: "Upcoming", value: kpis.upcoming, icon: CalendarClock, tone: "orange", sub: kpis.nextUpcomingAt ? `Next: ${formatDayMonthYear(kpis.nextUpcomingAt)}` : null, onClick: () => setTab("Schedule & Classes") },
            { label: "Attendance Rate", value: kpis.attendanceRate == null ? "—" : `${kpis.attendanceRate}%`, icon: TrendingUp, tone: "pink", sub: "Across all classes", onClick: () => setTab("Attendance Summary") },
          ].map((stat) => (
            <StatTile
              key={stat.label}
              size="sm"
              tone={stat.tone}
              icon={stat.icon}
              value={scheduleLoading && stat.label !== "Students" ? "…" : stat.value}
              label={stat.label}
              sub={stat.sub}
              onClick={stat.onClick}
            />
          ))}
        </div>

        <ProfileTabs
          label="Batch sections"
          active={tab}
          onChange={setTab}
          items={tabs.map((item) => ({ id: item, label: item, icon: TAB_ICONS[item] }))}
        />
        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-3">
            <Panel title="Batch information" className="lg:col-span-2">
              <dl className="grid gap-4 sm:grid-cols-2 lg:gap-x-4 lg:gap-y-3">
                {[
                  ["Course", batch.course],
                  ["Mentor", batch.trainer],
                  ["Schedule", batch.schedule || "—"],
                  ["Mode", batch.mode],
                  ["Start", formatDayMonthYear(batch.startDate) ?? batch.startDate ?? "—"],
                  ["End", formatDayMonthYear(batch.endDate) ?? batch.endDate ?? "—"],
                ].map(([a, b]) => (
                  <div key={a}>
                    <dt className="text-[10px] font-semibold uppercase text-slate-400">
                      {a}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold lg:mt-0.5 lg:text-[13px]">{b}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 lg:mt-4">
                <div className="flex justify-between text-sm">
                  <b>Batch capacity</b>
                  <span className="font-mono">{batch.enrolledStudents} / {batch.capacity} students</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${capacityPercentage}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{capacityPercentage}% filled · {batch.availableSeats} seats available</p>
              </div>
            </Panel>
            <Panel title="Student distribution">
              {attendanceLoading || !attendanceLoaded ? (
                <div className="grid h-[150px] place-items-center text-xs text-slate-500">Loading attendance…</div>
              ) : !studentDistribution.recorded ? (
                <div className="grid h-[150px] place-items-center px-4 text-center">
                  <div>
                    <p className="text-sm font-semibold text-[#133B5D]">No attendance recorded yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      The chart appears once attendance is marked for this batch&apos;s classes.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-52 lg:h-[150px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={studentDistribution.segments}
                          dataKey="value"
                          innerRadius={45}
                          outerRadius={68}
                        >
                          {studentDistribution.segments.map((segment) => (
                            <Cell key={segment.name} fill={segment.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px]">
                    {studentDistribution.segments.map((segment) => (
                      <span key={segment.name} className={segment.textClass}>
                        ● {segment.label} {segment.percent}%
                      </span>
                    ))}
                  </div>
                  {studentDistribution.unrecorded > 0 && (
                    <p className="mt-1 text-center text-[10px] text-slate-500">
                      {studentDistribution.unrecorded} student{studentDistribution.unrecorded === 1 ? "" : "s"} without recorded attendance
                    </p>
                  )}
                </>
              )}
            </Panel>
          </div>
        )}
        {tab === "Schedule & Classes" && (
          <ScheduleClasses
            classes={scheduleClasses}
            loading={scheduleLoading}
            error={scheduleError}
            onRetry={loadSchedule}
          />
        )}
        {tab === "Students" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Enrolled students
                </p>
                <p className="text-xs text-slate-500">
                  {filteredStudents.length} of {batch.enrolledStudents} enrolled shown ·{" "}
                  {batch.availableSeats} available
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search students..."
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none"
                />
                <select
                  value={studentStatus}
                  onChange={(event) => setStudentStatus(event.target.value)}
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            {studentsLoading ? (
              <div className="grid min-h-56 place-items-center rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                Loading enrolled students…
              </div>
            ) : studentsError ? (
              <div className="grid min-h-56 place-items-center rounded-xl border border-rose-200 bg-white p-8 text-center">
                <div>
                  <p className="text-sm font-semibold text-rose-700">
                    {studentsError}
                  </p>
                  <button
                    onClick={loadBatchStudents}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : batchStudents.length ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="border-b bg-slate-50 text-slate-500">
                    <tr>
              {[
                "Student",
                "Student ID",
                "Email",
                "Mentor",
                "Attendance",
                "Assessments",
                "Status",
                "Actions",
              ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 font-semibold uppercase tracking-wide"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => {
                      const id = student.studentId ?? student.id ?? index;
                      const combinedName = [student.firstName, student.lastName]
                        .filter(Boolean)
                        .join(" ");
                      const name =
                        student.studentName ??
                        student.fullName ??
                        student.name ??
                        combinedName;
                      return (
                        <tr key={id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <button
                              onClick={() =>
                                navigate(
                                  `/organization/batches/${batchId}/students/${student.studentId ?? student.id}`,
                                )
                              }
                              className="text-left font-semibold text-blue-700 hover:underline"
                            >
                              {name || "Student"}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {student.studentId ?? student.id ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {student.email ?? student.emailAddress ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {student.mentorName ?? student.mentor?.name ?? student.trainerName ?? batch?.mentorName ?? batch?.mentor?.name ?? "Unassigned"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{Number(student.attendance ?? 0)}%</td>
                          <td className="px-4 py-3 text-slate-600">{Number(student.assessmentsCleared ?? 0)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                              {student.status ?? "Enrolled"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                navigate(
                                  `/organization/batches/${batchId}/students/${student.studentId ?? student.id}`,
                                )
                              }
                              className="text-xs font-semibold text-blue-600"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid min-h-56 place-items-center rounded-xl border border-slate-200 bg-white p-8 text-center">
                <div>
                  <Users className="mx-auto h-8 w-8 text-blue-500" />
                  <h2 className="mt-3 text-sm font-semibold text-slate-900">
                    No students enrolled
                  </h2>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Add students to this batch to see their details here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "Attendance Summary" && (
          <section className="pk-panel ba-panel">
            <div className="ba-head">
              <span className="ba-head__icon" aria-hidden="true"><Layers3 /></span>
              <div className="min-w-0 flex-1">
                <h2>Batch Attendance</h2>
                <p>View and manage student attendance for each class session.</p>
              </div>
              <div className="ba-tools">
                <span className="ba-range"><CalendarDays aria-hidden="true" />{attendanceMonthLabel || "No classes yet"}</span>
                <select className="pk-select !min-w-[140px]" value={attendanceClassFilter} onChange={(event) => setAttendanceClassFilter(event.target.value)} aria-label="Filter classes">
                  <option value="all">All Classes</option>
                  <option value="completed">Completed</option>
                  <option value="scheduled">Upcoming</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="ba-mark" ref={markMenuRef}>
                  <button type="button" className="pk-btn pk-btn--orange rounded-r-none" disabled={!markableClass} onClick={() => markableClass && navigate(`/organization/live-classes?attendance=${encodeURIComponent(markableClass.id)}`)}>
                    Mark Attendance
                  </button>
                  <button type="button" className="pk-btn pk-btn--orange rounded-l-none border-l border-white/40 !px-2.5" aria-label="Choose a class to mark attendance" aria-expanded={markMenuOpen} disabled={!scheduleClasses.length} onClick={() => setMarkMenuOpen((open) => !open)}>
                    <ChevronRight className="rotate-90" />
                  </button>
                  {markMenuOpen && (
                    <div className="pk-menu max-h-72 overflow-y-auto" role="menu">
                      {[...scheduleClasses].reverse().map((cls) => (
                        <button key={cls.id} type="button" role="menuitem" onClick={() => { setMarkMenuOpen(false); navigate(`/organization/live-classes?attendance=${encodeURIComponent(cls.id)}`); }}>
                          {formatCompactDate(cls.startAt)} · {cls.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="ba-legend" aria-label="Legend">
              <span><b className="is-p">P</b>Present</span>
              <span><b className="is-a">A</b>Absent</span>
              <span><b className="is-n">—</b>Not Conducted</span>
              <span><b className="is-l">L</b>Late</span>
            </div>

            {scheduleLoading || (attendanceLoading && !attendanceLoaded) ? (
              <div className="ba-state">Loading attendance…</div>
            ) : !batchStudents.length ? (
              <div className="ba-state">No students found for this batch.</div>
            ) : scheduleError ? (
              <div className="ba-state is-error">
                <p>{scheduleError}</p>
                <button onClick={loadSchedule} className="pk-btn pk-btn--navy pk-btn--sm mt-3">Retry</button>
              </div>
            ) : !scheduleClasses.length ? (
              <div className="ba-state">No classes scheduled for this batch.</div>
            ) : attendanceError ? (
              <div className="ba-state is-error">
                <p>{attendanceError}</p>
                <button onClick={() => { setAttendanceLoaded(false); setAttendanceError(""); }} className="pk-btn pk-btn--navy pk-btn--sm mt-3">Retry</button>
              </div>
            ) : (
              <div className="ba-grid-wrap">
                <table className="ba-grid" aria-label="Batch attendance">
                  <thead>
                    <tr>
                      <th scope="col" className="ba-grid__student">
                        <label className="inline-flex items-center gap-3">
                          <input type="checkbox" checked={attendanceSelected.size > 0 && attendanceSelected.size === attendanceSummaryRows.length} onChange={(event) => setAttendanceSelected(event.target.checked ? new Set(attendanceSummaryRows.map((row) => row.studentId)) : new Set())} aria-label="Select all students" />
                          Student ({attendanceSummaryRows.length})
                        </label>
                      </th>
                      {visibleAttendanceColumns.map(({ cls, index }) => {
                        const date = new Date(cls.startAt);
                        const valid = !Number.isNaN(date.getTime());
                        return (
                          <th key={cls.id} scope="col" title={[cls.title, cls.dateLabel, cls.timeLabel].filter(Boolean).join(" • ") || undefined} className={`ba-col is-${ATTENDANCE_COL_TONES[index % ATTENDANCE_COL_TONES.length]}`}>
                            <b>{valid ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase() : "—"}</b>
                            <span>{valid ? date.toLocaleDateString("en-US", { weekday: "short" }) : ""}</span>
                            {cls.timeLabel && <small>{cls.timeLabel}</small>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummaryRows.map((row) => (
                      <tr key={row.studentId}>
                        <th scope="row" className="ba-grid__student">
                          <label className="inline-flex min-w-0 items-center gap-3">
                            <input type="checkbox" checked={attendanceSelected.has(row.studentId)} onChange={() => setAttendanceSelected((current) => { const next = new Set(current); if (next.has(row.studentId)) next.delete(row.studentId); else next.add(row.studentId); return next; })} aria-label={`Select ${row.name}`} />
                            <span className="ba-avatar overflow-hidden" aria-hidden="true"><AvatarPhoto src={studentPhotos[toProfileId(row.studentId)]} fallback={String(row.name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()} /></span>
                            <span className="truncate">{row.name}</span>
                          </label>
                        </th>
                        {visibleAttendanceColumns.map(({ cls, index }) => {
                          const cell = row.cells[index];
                          const status = cell?.status;
                          const isPresent = status === "present" || status === "attended";
                          const isLate = status === "late";
                          const isAbsent = status === "absent" || status === "missed";
                          const label = isPresent ? "P" : isLate ? "L" : isAbsent ? "A" : "—";
                          const tone = isPresent ? "is-p" : isLate ? "is-l" : isAbsent ? "is-a" : "is-n";
                          return (
                            <td key={cls.id}>
                              <span className={`ba-cell ${tone}`} title={status ? `${cls.title}: ${status}` : "Not conducted / not marked"}>{label}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!hasAnyAttendanceRecord && <p className="ba-note">No attendance has been marked for these classes yet.</p>}
              </div>
            )}
          </section>
        )}
        {tab === "Assessments" && (
          <section className="overflow-hidden rounded-2xl border border-[#E1EAF3] bg-gradient-to-br from-white to-[#F7FBFF] shadow-[0_4px_18px_rgba(20,70,110,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E1EAF3] p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF4FF] text-[#2F80ED]">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[#133B5D] sm:text-2xl">Assessments</h2>
                  <p className="mt-1 text-sm text-[#6B829C]">Track and manage all assessments for this batch</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/organization/assessments?batch=${encodeURIComponent(batchId)}`)}
                className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#123F67] to-[#0A3154] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-[#E1EAF3] p-5">
              <label className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B7FA3]" />
                <input
                  value={assessmentSearch}
                  onChange={(event) => setAssessmentSearch(event.target.value)}
                  placeholder="Search assessments..."
                  className="h-[42px] w-full rounded-[10px] border border-[#D7E3EE] bg-white pl-10 pr-3 text-sm text-[#133B5D] outline-none transition placeholder:text-[#7890A8] focus:border-[#133B5D] focus:ring-2 focus:ring-[#133B5D]/10"
                />
              </label>
              <select
                value={assessmentTypeFilter}
                onChange={(event) => setAssessmentTypeFilter(event.target.value)}
                className="h-[42px] rounded-[10px] border border-[#D7E3EE] bg-white px-3.5 text-sm font-semibold text-[#133B5D] outline-none focus:border-[#133B5D]"
              >
                <option value="All">All Types</option>
                {assessmentTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={assessmentStatusFilter}
                onChange={(event) => setAssessmentStatusFilter(event.target.value)}
                className="h-[42px] rounded-[10px] border border-[#D7E3EE] bg-white px-3.5 text-sm font-semibold text-[#133B5D] outline-none focus:border-[#133B5D]"
              >
                <option value="All">All Status</option>
                {ASSESSMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="date"
                value={assessmentDateFilter}
                onChange={(event) => setAssessmentDateFilter(event.target.value)}
                className="h-[42px] rounded-[10px] border border-[#D7E3EE] bg-white px-3.5 text-sm font-semibold text-[#133B5D] outline-none focus:border-[#133B5D]"
              />
              <button
                type="button"
                onClick={resetAssessmentFilters}
                title="Reset filters"
                aria-label="Reset filters"
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] border border-[#D7E3EE] bg-white text-[#5B7FA3] transition hover:border-[#133B5D]/30 hover:text-[#133B5D]"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {assessments.loading ? (
              <div className="p-4"><TableSkeleton rows={4} columns={6} /></div>
            ) : assessments.error ? (
              <EmptyState
                icon={FileWarning}
                title="Unable to load assessments"
                description={assessments.error}
                action={<button onClick={loadAssessments} className="rounded-[10px] bg-[#133B5D] px-4 py-2 text-xs font-bold text-white hover:brightness-110">Retry</button>}
              />
            ) : !batchAssessments.length ? (
              <EmptyState
                icon={ClipboardList}
                title="No assessments yet"
                description="Create an assessment to evaluate students in this batch."
                action={<button onClick={() => navigate(`/organization/assessments?batch=${encodeURIComponent(batchId)}`)} className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#133B5D] px-4 py-2 text-xs font-bold text-white hover:brightness-110"><Plus className="h-3.5 w-3.5" />New Assessment</button>}
              />
            ) : !filteredAssessments.length ? (
              <EmptyState icon={Search} title="No assessments found" description="Try changing your search or filters." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-[#F7FAFD] text-[11px] font-semibold uppercase tracking-wide text-[#345575]">
                    <tr>
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Total Marks</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EBF3]">
                    {pagedAssessments.map((row, index) => {
                      const rowId = row.assessmentId ?? row.id;
                      const marks = row.totalMarks ?? row.total;
                      const type = row.assessmentType ?? row.type;
                      const date = formatAssessmentDate(row.startDate ?? row.start);
                      const startTime = formatAssessmentTime(row.startDate ?? row.start);
                      const endTime = formatAssessmentTime(row.endDate ?? row.end);
                      const nameTint = assessmentTint(type, index);
                      return (
                        <tr key={rowId} className="transition hover:bg-[#F8FBFE]">
                          <td className="px-5 py-6 align-middle">
                            <div className="flex items-start gap-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ backgroundColor: nameTint.bg, color: nameTint.fg }}>
                                <ClipboardList className="h-4 w-4" />
                              </span>
                              <p className="truncate text-sm font-semibold text-[#133B5D]">{row.title}</p>
                            </div>
                          </td>
                          <td className="px-5 py-6 align-middle">
                            {type ? (
                              <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: nameTint.bg, color: nameTint.fg }}>
                                {type}
                              </span>
                            ) : <span className="text-xs text-[#647C96]">—</span>}
                          </td>
                          <td className="px-5 py-6 align-middle">
                            {date ? (
                              <div className="flex items-start gap-1.5 text-xs text-[#133B5D]">
                                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#647C96]" />
                                <div>
                                  <p className="font-semibold">{date}</p>
                                  {startTime && endTime && <p className="mt-0.5 text-[#647C96]">{startTime} – {endTime}</p>}
                                </div>
                              </div>
                            ) : <span className="text-xs text-[#647C96]">—</span>}
                          </td>
                          <td className="px-5 py-6 align-middle text-sm font-semibold text-[#133B5D]">{marks ?? <span className="font-normal text-[#647C96]">—</span>}</td>
                          <td className="px-5 py-6 align-middle">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${assessmentStatusClasses(row.status)}`}>
                              {row.status ?? "Draft"}
                            </span>
                          </td>
                          <td className="px-5 py-6 align-middle">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => navigate(`/organization/assessments?batch=${encodeURIComponent(batchId)}&view=${encodeURIComponent(rowId)}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6E2ED] px-2.5 py-1.5 text-xs font-bold text-[#2F80ED] transition hover:border-[#133B5D]/30 hover:bg-[#133B5D]/5"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setAssessmentMenuId((current) => (current === rowId ? null : rowId))}
                                  aria-label="More assessment actions"
                                  className="grid h-8 w-8 place-items-center rounded-lg text-[#647C96] transition hover:bg-[#F5F9FD] hover:text-[#133B5D]"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {assessmentMenuId === rowId && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setAssessmentMenuId(null)} />
                                    <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border border-[#E1EAF3] bg-white py-1 shadow-lg">
                                      <button
                                        onClick={() => { setAssessmentMenuId(null); navigate(`/organization/assessments?batch=${encodeURIComponent(batchId)}`); }}
                                        className="block w-full px-3.5 py-2.5 text-left text-xs font-medium text-[#133B5D] hover:bg-[#F5F9FD]"
                                      >
                                        Open in Assessments
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!assessments.loading && !assessments.error && filteredAssessments.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E1EAF3] px-5 py-4 text-xs text-[#647C96]">
                <span>{filteredAssessments.length} assessment{filteredAssessments.length === 1 ? "" : "s"} found</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={assessmentPage <= 1}
                    onClick={() => setAssessmentPage((page) => Math.max(1, page - 1))}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#D6E2ED] text-[#647C96] transition hover:border-[#133B5D]/30 hover:text-[#133B5D] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: assessmentTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setAssessmentPage(page)}
                      className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition ${page === assessmentPage ? "bg-[#133B5D] text-white" : "border border-[#D6E2ED] text-[#647C96] hover:border-[#133B5D]/30 hover:text-[#133B5D]"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={assessmentPage >= assessmentTotalPages}
                    onClick={() => setAssessmentPage((page) => Math.min(assessmentTotalPages, page + 1))}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#D6E2ED] text-[#647C96] transition hover:border-[#133B5D]/30 hover:text-[#133B5D] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <BatchForm
        open={form}
        batch={batch}
        onClose={() => setForm(false)}
        onSave={async (values, id) => {
          const saved = await saveBatch(values, id);
          setBatch((current) => ({ ...current, ...saved }));
          setToast("Batch updated");
        }}
        onEnrollmentChanged={loadBatchStudents}
      />
      {remove && (
        <ReasonModal
          name={remove}
          reason={reason}
          setReason={setReason}
          onClose={() => {
            setRemove(null);
            setReason("");
          }}
          onConfirm={() => {
            setRemove(null);
            setReason("");
            setToast(`${remove} removed from batch`);
          }}
        />
      )}
      {toast && (
        <div className="fixed right-5 top-20 z-[90] rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}
function LegacyAddModal({ batch, onClose }) {
  const seatsRemaining = Math.max(0, batch.capacity - batch.students);
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-students-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              id="add-students-title"
              className="text-base font-bold text-slate-950"
            >
              Add students to batch
            </h2>
            <p className="mt-1 text-xs text-slate-500">{batch.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add students dialog"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </header>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Enrolled
              </p>
              <p className="mt-1 text-xl font-bold text-slate-950">
                {batch.students} / {batch.capacity}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Seats available
              </p>
              <p className="mt-1 text-xl font-bold text-blue-700">
                {seatsRemaining}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Student enrollment is not connected yet
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              The enrolled-student list is available, but adding students needs
              a StudentBatch enrollment POST endpoint. No student data will be
              changed from this screen until that endpoint is connected.
            </p>
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
function ReasonModal({ name, reason, setReason, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
        className="w-full max-w-md rounded-xl bg-white p-5"
      >
        <h2 className="font-semibold">Remove {name}?</h2>
        <p className="mt-2 text-sm text-slate-500">
          The student will lose this batch schedule and access.
        </p>
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for removal"
          rows="3"
          className="mt-4 w-full rounded-lg border p-3 text-sm"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">
            Remove student
          </button>
        </div>
      </form>
    </div>
  );
}



