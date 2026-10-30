import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MentorPageHeader from "../components/MentorPageHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Clock,
  Users,
  Calendar,
  X,
  Copy,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  UserCheck,
  UserX,
  StopCircle,
  BookOpen,
  XCircle,
  Clock3,
  GraduationCap,
  Loader2,
  CalendarDays,
  ListChecks,
  ArrowUpDown,
  Zap,
  Plus,
  AlertCircle,
  Database,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  MoreVertical,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@shared/hooks/useAuth";
import { liveClassService } from "../services/mentorCrudService";
import { readLocalScheduledClasses } from "@shared/services/localScheduleStore";
import { getMentorSessionIdentity } from "@features/mentor/utils/mentorSessionIdentity";
import { getApiErrorMessage } from "@shared/services/apiServices";
// The dedicated /api/Attendance/liveclass/* controller — the same service the
// Organization Live Classes screen uses (see useLiveClasses.js). Mentor Live
// Class attendance previously called mentorCrudService's own attendanceService,
// a separate/older implementation that only exposed batch-wide endpoints
// (getByBatch, bulkCreate) with no per-live-class GET/PUT at all, so "Take
// Attendance" here never actually loaded or saved anything for the selected
// class. There must be exactly one Attendance API integration; this file now
// uses the same one as the admin screen instead of a second, divergent one.
import attendanceService from "@shared/services/attendanceService";
import { canJoinLiveClass, getLiveClassLifecycleStatus, normalizeAttendanceRows } from "@features/live-classes/utils/liveClassMappers";
import JitsiMeetingModal from "@shared/components/JitsiMeetingModal";
import { MEETING_PLATFORM_OPTIONS, toModuleId } from "@features/live-classes/utils/liveClassOptions";
import { liveClassFieldErrors, liveClassSaveErrorMessage, logLiveClassSaveError } from "@features/live-classes/utils/liveClassSaveError";
import useCourseSyllabusModules from "@features/live-classes/hooks/useCourseSyllabusModules";
import { filenameFromDisposition, triggerFileDownload } from "@shared/utils/download";

const SCHEDULED_CLASSES_STORAGE_KEY = "mentorScheduledLiveClasses";

const saveScheduledClass = (liveClass) => {
  try {
    const existing = JSON.parse(
      localStorage.getItem(SCHEDULED_CLASSES_STORAGE_KEY) || "[]",
    );
    const id = liveClass.liveClassId || liveClass.id;
    const next = [
      liveClass,
      ...existing.filter((item) => (item.liveClassId || item.id) !== id),
    ];
    localStorage.setItem(SCHEDULED_CLASSES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The in-memory list still works when browser storage is unavailable.
  }
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  try {
    const parts = timeStr.split(":");
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const formatTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) return "—";
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Live":
    case "live":
    case "Ongoing":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    case "Scheduled":
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    case "Completed":
    case "completed":
      return "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-600";
    case "Cancelled":
    case "cancelled":
    case "Canceled":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-200 dark:border-red-500/20";
    default:
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Live":
    case "live":
    case "Ongoing":
      return Zap;
    case "Scheduled":
    case "scheduled":
      return Clock;
    case "Completed":
    case "completed":
      return CheckCircle;
    case "Cancelled":
    case "cancelled":
    case "Canceled":
      return XCircle;
    default:
      return Clock3;
  }
};

const isToday = (isoString) => {
  if (!isoString) return false;
  try {
    const d = new Date(isoString);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  } catch {
    return false;
  }
};

// Display status comes only from the backend lifecycle (shared rule in
// liveClassMappers). The wall clock previously showed a never-started class as
// "Live" inside its window and any class past its end time as "Completed".
const MENTOR_STATUS_LABEL = { live: "Live", completed: "Completed", cancelled: "Cancelled" };
const toMentorStatus = (status) => MENTOR_STATUS_LABEL[getLiveClassLifecycleStatus(status)] || "Scheduled";

const getCountdown = (scheduledDate, startTime) => {
  if (!scheduledDate) return null;
  try {
    const dateStr = startTime
      ? `${scheduledDate.split("T")[0] || scheduledDate}T${startTime}`
      : scheduledDate;
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  } catch {
    return null;
  }
};

const MEETING_PLATFORMS = {
  "Google Meet": { icon: "G", color: "from-emerald-500 to-teal-500" },
  Zoom: { icon: "Z", color: "from-blue-500 to-indigo-500" },
  "Microsoft Teams": { icon: "T", color: "from-purple-500 to-pink-500" },
  Jitsi: { icon: "J", color: "from-sky-500 to-cyan-500" },
};

// ── Build a descriptive error message from the API error ──
const getErrorMessage = (err) => {
  // Network error (no response received) — CORS, DNS, or connectivity
  if (!err?.response) {
    if (err?.message === "Network Error") {
      return "Network error — unable to reach the server. Check your connection or the API endpoint URL.";
    }
    return `Connection failed: ${err?.message || "Unknown error"}`;
  }

  const status = err.response.status;
  const responseData = err.response.data;
  const serverMsg =
    responseData?.message ||
    responseData?.error ||
    responseData?.error_description ||
    "";

  // Build a human-readable reason for known status codes
  const statusLabels = {
    400: "Bad Request",
    401: "Unauthorized — please log in again",
    403: "Forbidden — you do not have permission",
    404: "Not Found — the endpoint does not exist",
    422: "Validation Error",
    429: "Too Many Requests — please wait and try again",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };

  const label = statusLabels[status] || `HTTP ${status}`;
  const details = serverMsg ? ` — ${serverMsg}` : "";
  return `${label}${details}`;
};

// ─────────────────────────────────────────────────────────────
// AttendanceToggle sub-component
// ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    key: "present",
    icon: UserCheck,
    bgColor: "#d1fae5",
    textColor: "#059669",
    ringColor: "rgba(5,150,105,0.3)",
    label: "Present",
  },
  {
    key: "absent",
    icon: UserX,
    bgColor: "#fee2e2",
    textColor: "#dc2626",
    ringColor: "rgba(220,38,38,0.3)",
    label: "Absent",
  },
  {
    key: "late",
    icon: Clock,
    bgColor: "#fef3c7",
    textColor: "#d97706",
    ringColor: "rgba(217,119,6,0.3)",
    label: "Late",
  },
];

function AttendanceToggle({ currentStatus, onToggle }) {
  return (
    <div className="flex items-center gap-1.5">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onToggle(opt.key)}
          className="p-2 rounded-lg transition-all"
          style={{
            backgroundColor:
              currentStatus === opt.key ? opt.bgColor : "transparent",
            color: currentStatus === opt.key ? opt.textColor : "#94a3b8",
            boxShadow:
              currentStatus === opt.key ? `0 0 0 2px ${opt.ringColor}` : "none",
          }}
          onMouseEnter={(e) => {
            if (currentStatus !== opt.key) {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#475569";
            }
          }}
          onMouseLeave={(e) => {
            if (currentStatus !== opt.key) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }
          }}
          title={opt.label}
        >
          <opt.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

// Reads only fields the /dashboard response actually sends — never invents a
// stat. Different backend field-naming conventions (camelCase / PascalCase /
// short aliases) are all checked, but a field this dashboard doesn't return
// simply isn't shown, instead of rendering a fabricated 0.
const DASHBOARD_STAT_FIELDS = [
  { label: "Total", keys: ["totalStudents", "TotalStudents", "total", "Total", "totalCount"] },
  { label: "Present", keys: ["present", "Present", "presentCount", "PresentCount", "totalPresent"] },
  { label: "Absent", keys: ["absent", "Absent", "absentCount", "AbsentCount", "totalAbsent"] },
  { label: "Late", keys: ["late", "Late", "lateCount", "LateCount"] },
  { label: "Pending", keys: ["pending", "Pending", "pendingCount", "PendingCount", "notMarked"] },
  { label: "Attendance %", keys: ["attendancePercentage", "AttendancePercentage", "percentage", "Percentage", "attendanceRate"], suffix: "%" },
];

const pickDashboardStats = (dashboard) => {
  if (!dashboard || typeof dashboard !== "object") return [];
  return DASHBOARD_STAT_FIELDS
    .map(({ label, keys, suffix }) => {
      const key = keys.find((candidate) => dashboard[candidate] !== undefined && dashboard[candidate] !== null);
      if (!key) return null;
      return { label, value: `${dashboard[key]}${suffix || ""}` };
    })
    .filter(Boolean);
};

function SortIndicator({ field, sortField, sortDir }) {
  if (sortField !== field)
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
  return (
    <ArrowUpDown
      className={`w-3 h-3 ml-1 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;
const weekdayOf = (value) => {
  const parsed = new Date(`${String(value || "").slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-US", { weekday: "short" });
};

// allowCreate defaults true for this page's standalone route
// (/mentor/live-classes, reached from a batch workspace), which keeps its own
// "Schedule Class" affordance. MentorCalendar.jsx passes allowCreate={false}
// when embedding this same component as its Live/Completed tabs — that page
// already has its own separate "Schedule Class" form on its Schedule tab
// posting to the identical POST /api/v1/live-classes endpoint, and having
// both live side by side let a mentor create the same class from either one
// without the other knowing, which is what the backend's 409 "Mentor already
// has a class during this time" was actually catching.
// embedded — rendered inside Class Schedule (My Classes): hides this page's own
// heading and adds a "Schedule Class" button that opens the parent's scheduler
// through onScheduleClass.
export default function MentorLiveClasses({ initialStatus = "all", allowCreate = true, embedded = false, onScheduleClass, viewToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Mentor.mentorId is a distinct backend field from the authenticated
  // User's own id/userId (Swagger-confirmed) — never a stand-in for it.
  // Falling back to user.id/userId here previously let an unresolved mentor
  // profile silently submit the wrong entity's id as the class's mentorId
  // instead of surfacing "no mentor profile" and blocking submission.
  const mentorId = getMentorSessionIdentity(user).mentorId;

  // ── Data State ────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // ── UI State ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("scheduledDate");
  const [sortDir, setSortDir] = useState("desc");
  const [countdowns, setCountdowns] = useState({});
  const [jitsiSession, setJitsiSession] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [rowMenu, setRowMenu] = useState(null);

  // ── Attendance Drawer ─────────────────────────────────────
  const [attendanceDrawer, setAttendanceDrawer] = useState(null);
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceDashboard, setAttendanceDashboard] = useState(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [generatingAttendance, setGeneratingAttendance] = useState(false);
  const [exportingAttendance, setExportingAttendance] = useState("");

  // ── Create / Edit Live Class Modal ─────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [launchContext, setLaunchContext] = useState(null);
  const [editingClass, setEditingClass] = useState(null); // null = create, object = edit
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    classTitle: "",
    description: "",
    courseId: "",
    batchId: "",
    moduleId: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    meetingPlatform: "",
    meetingLink: "",
    recordingEnabled: true,
  });
  const [formErrors, setFormErrors] = useState({});
  // Syllabus modules of the entered course; the class needs one (moduleId ≥ 1).
  const courseModules = useCourseSyllabusModules(createForm.courseId, showCreateModal);
  // Only a module of the current course's syllabus counts as chosen.
  const moduleChosen = courseModules.options.some((option) => option.value === String(createForm.moduleId));

  // ── View Details Modal ───────────────────────────────────
  const [viewingClass, setViewingClass] = useState(null);

  // ── Delete Confirmation ──────────────────────────────────
  const [deleteConfirmClass, setDeleteConfirmClass] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Cancel Confirmation ───────────────────────────────────
  const [cancelConfirmClass, setCancelConfirmClass] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Tracks which single class currently has a start/end/cancel request in
  // flight, so only that class's buttons disable — not every row on the page.
  const [pendingAction, setPendingAction] = useState(null); // { id, type: 'start' | 'end' }

  // ── Fetch Live Classes ───────────────────────────────────
  const fetchClasses = useCallback(
    async (showRefreshToast = false) => {
      try {
        setError("");
        if (showRefreshToast) {
          setRefreshing(true);
          toast.loading("Loading classes...", { id: "refresh-classes" });
        } else if (!loading) {
          // Silent refresh still shows spinner in header
          setRefreshing(true);
        }

        const result = await liveClassService.list();
        const apiClasses = Array.isArray(result?.data) ? result.data : [];
        const localClasses = readLocalScheduledClasses();
        const rawClasses = [...apiClasses, ...localClasses.filter((localItem) => {
          const localId = localItem.liveClassId || localItem.id;
          return !apiClasses.some((apiItem) => String(apiItem.liveClassId || apiItem.id) === String(localId));
        })];

        if (import.meta.env.DEV) {
          console.debug("[MentorLiveClasses] API response:", {
            totalRecords: result?.totalRecords,
            recordsCount: rawClasses.length,
            mentorId,
            sampleKeys: rawClasses.length > 0 ? Object.keys(rawClasses[0]) : [],
          });
        }

        const hasMentorAssignments = rawClasses.some((c) => c.mentorId != null || c.mentor?.id != null || c.mentor?.mentorId != null);
        const mentorMatches = rawClasses.filter((c) => String(c.mentorId ?? c.mentor?.id ?? c.mentor?.mentorId) === String(mentorId));
        // Keep API-scoped records when legacy mentor identifiers do not match the auth id.
        const filtered = mentorId && hasMentorAssignments && mentorMatches.length
          ? mentorMatches
          : rawClasses;

        const enriched = filtered.map((c) => ({
          ...c,
          computedStatus: toMentorStatus(c.status || c.classStatus),
        }));

        setClasses(enriched);
        setUsingMockData(false);
        if (showRefreshToast)
          toast.success(`Loaded ${enriched.length} classes`, {
            id: "refresh-classes",
          });
      } catch (err) {
        const msg = getErrorMessage(err);

        if (import.meta.env.DEV) {
          console.warn(
            "[MentorLiveClasses] API unavailable — falling back to mock data:",
            {
              error: err,
              status: err?.response?.status,
              data: err?.response?.data,
              message: msg,
            },
          );
        }

        // ── Fall back to static mock data so the page always shows content ──
        setClasses([]);
        setUsingMockData(false);
        setError(msg);
        if (showRefreshToast) toast.error(msg, { id: "refresh-classes" });
        /*
        const relevantMock = mentorId
          ? mockData.filter((c) => String(c.mentorId) === String(mentorId))
          : mockData;
        const enrichedMock = relevantMock.map((c) => {
          let status = c.status || "Scheduled";
          if (
            status !== "Completed" &&
            status !== "Cancelled" &&
            status !== "cancelled"
          ) {
            if (isLiveNow(c)) status = "Live";
            else if (
              isToday(c.scheduledDate) &&
              new Date(c.scheduledDate) > new Date()
            )
              status = "Scheduled";
            else if (
              !isToday(c.scheduledDate) &&
              new Date(c.scheduledDate) < new Date()
            ) {
              if (status !== "Cancelled" && status !== "cancelled")
                status = "Completed";
            }
          }
          return { ...c, computedStatus: status };
        });

        setClasses(enrichedMock);
        setUsingMockData(true);
        setError(msg);
        if (showRefreshToast)
          toast.error(`${msg} — showing demo data`, { id: "refresh-classes" });
        */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mentorId],
  );

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = {};
      classes.forEach((c) => {
        if (
          c.scheduledDate &&
          (c.computedStatus === "Scheduled" || c.computedStatus === "Live")
        ) {
          const cd = getCountdown(c.scheduledDate, c.startTime);
          if (cd) updates[c.liveClassId || c.id] = cd;
        }
      });
      setCountdowns(updates);
    }, 10000);
    return () => clearInterval(interval);
  }, [classes]);

  const uniqueCourses = useMemo(
    () => [...new Set(classes.map((c) => c.courseName).filter(Boolean))],
    [classes],
  );
  const uniqueBatches = useMemo(
    () => [...new Set(classes.map((c) => c.batchName).filter(Boolean))],
    [classes],
  );

  const stats = useMemo(
    () => ({
      today: classes.filter(
        (c) =>
          isToday(c.scheduledDate) &&
          c.computedStatus !== "Cancelled" &&
          c.computedStatus !== "cancelled",
      ).length,
      live: classes.filter((c) => c.computedStatus === "Live").length,
      upcoming: classes.filter(
        (c) =>
          c.computedStatus === "Scheduled" &&
          new Date(c.scheduledDate) > new Date() &&
          !isToday(c.scheduledDate),
      ).length,
      completed: classes.filter((c) => c.computedStatus === "Completed").length,
      totalStudents: classes.reduce(
        (sum, c) => sum + (c.attendanceCount || 0),
        0,
      ),
    }),
    [classes],
  );

  const statusCounts = useMemo(
    () => ({
      all: classes.length,
      live: classes.filter((c) => c.computedStatus === "Live").length,
      today: classes.filter(
        (c) =>
          isToday(c.scheduledDate) &&
          c.computedStatus !== "Cancelled" &&
          c.computedStatus !== "cancelled",
      ).length,
      scheduled: classes.filter((c) => c.computedStatus === "Scheduled").length,
      upcoming: classes.filter(
        (c) =>
          c.computedStatus === "Scheduled" &&
          new Date(c.scheduledDate) > new Date() &&
          !isToday(c.scheduledDate),
      ).length,
      completed: classes.filter((c) => c.computedStatus === "Completed").length,
      cancelled: classes.filter(
        (c) =>
          c.computedStatus === "Cancelled" || c.computedStatus === "cancelled",
      ).length,
    }),
    [classes],
  );

  // ── Filtering & Sorting ──────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...classes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.classTitle || "").toLowerCase().includes(q) ||
          (c.courseName || "").toLowerCase().includes(q) ||
          (c.batchName || "").toLowerCase().includes(q) ||
          (c.mentorName || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "live")
        result = result.filter((c) => c.computedStatus === "Live");
      else if (statusFilter === "today")
        result = result.filter(
          (c) =>
            isToday(c.scheduledDate) &&
            c.computedStatus !== "Cancelled" &&
            c.computedStatus !== "cancelled",
        );
      else if (statusFilter === "scheduled")
        result = result.filter((c) => c.computedStatus === "Scheduled");
      else if (statusFilter === "upcoming")
        result = result.filter(
          (c) =>
            c.computedStatus === "Scheduled" &&
            new Date(c.scheduledDate) > new Date() &&
            !isToday(c.scheduledDate),
        );
      else if (statusFilter === "completed")
        result = result.filter((c) => c.computedStatus === "Completed");
      else if (statusFilter === "cancelled")
        result = result.filter(
          (c) =>
            c.computedStatus === "Cancelled" ||
            c.computedStatus === "cancelled",
        );
    }

    if (courseFilter !== "all")
      result = result.filter((c) => c.courseName === courseFilter);
    if (batchFilter !== "all")
      result = result.filter((c) => c.batchName === batchFilter);

    if (dateFilter) {
      result = result.filter((c) => {
        if (!c.scheduledDate) return false;
        try {
          const clsDate = new Date(c.scheduledDate);
          const filterDate = new Date(dateFilter);
          return (
            clsDate.getFullYear() === filterDate.getFullYear() &&
            clsDate.getMonth() === filterDate.getMonth() &&
            clsDate.getDate() === filterDate.getDate()
          );
        } catch {
          return false;
        }
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      const aDate = new Date(a.scheduledDate || 0).getTime();
      const bDate = new Date(b.scheduledDate || 0).getTime();
      if (sortField === "scheduledDate") cmp = aDate - bDate;
      else if (sortField === "classTitle")
        cmp = (a.classTitle || "").localeCompare(b.classTitle || "");
      else if (sortField === "courseName")
        cmp = (a.courseName || "").localeCompare(b.courseName || "");
      else if (sortField === "batchName")
        cmp = (a.batchName || "").localeCompare(b.batchName || "");
      else if (sortField === "status")
        cmp = (a.computedStatus || "").localeCompare(b.computedStatus || "");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    classes,
    searchQuery,
    statusFilter,
    courseFilter,
    batchFilter,
    dateFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // ── Handlers ─────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const joinMeeting = (cls) => {
    if (!(cls.liveClassId || cls.id)) {
      toast.error("This class has no valid ID yet.");
      return;
    }
    setJitsiSession(cls);
  };

  useEffect(() => {
    if (rowMenu == null) return undefined;
    const close = (event) => { if (!event.target.closest?.("[data-rowmenu]")) setRowMenu(null); };
    const onKey = (event) => { if (event.key === "Escape") setRowMenu(null); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", onKey); };
  }, [rowMenu]);

  const toggleRowSelection = (cls) => {
    const id = String(cls.liveClassId || cls.id);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const togglePageSelection = () => {
    const ids = paginated.map((cls) => String(cls.liveClassId || cls.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = ids.every((id) => next.has(id));
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };
  const exportSelected = () => {
    const rows = classes.filter((cls) => selectedIds.has(String(cls.liveClassId || cls.id)));
    if (!rows.length) return;
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [
      ["Class Title", "Course", "Batch", "Date", "Start", "End", "Meeting", "Attendance", "Status"],
      ...rows.map((cls) => [cls.classTitle, cls.courseName, cls.batchName, String(cls.scheduledDate || "").slice(0, 10), cls.startTime, cls.endTime, cls.meetingPlatform, cls.attendanceCount || 0, cls.computedStatus]),
    ];
    const url = URL.createObjectURL(new Blob([lines.map((line) => line.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "classes.csv";
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
  };

  const copyMeetingLink = async (cls) => {
    const link = cls.meetingLink || "";
    if (!link) {
      toast.error("No meeting link to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Meeting link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const startLiveClass = async (cls) => {
    const id = cls.liveClassId || cls.id;
    if (pendingAction) return; // one class action in flight at a time
    // Only the backend status blocks a start — a class whose scheduled end has
    // passed may still be started late if the backend accepts it.
    const status = toMentorStatus(cls.status || cls.classStatus || cls.computedStatus);
    if (status === "Completed" || status === "Cancelled") {
      toast("Completed classes cannot be started again", { icon: "ℹ️" });
      return;
    }
    setPendingAction({ id, type: "start" });
    try {
      await liveClassService.start(id);
      toast.success("Class started!");
      // The backend is the source of truth for the resulting status — refetch
      // rather than assume it matches a hardcoded "Live".
      await fetchClasses();
    } catch (error) {
      const message = error?.response?.data?.error
        || error?.response?.data?.message
        || error?.response?.data?.title;
      toast.error(message || "Failed to start class");
    } finally {
      setPendingAction(null);
    }
  };

  const endLiveClass = async (cls) => {
    const id = cls.liveClassId || cls.id;
    if (pendingAction) return;
    setPendingAction({ id, type: "end" });
    try {
      await liveClassService.end(id);
      toast.success("Class ended");
      await fetchClasses();
    } catch (error) {
      const message = error?.response?.data?.error
        || error?.response?.data?.message
        || error?.response?.data?.title;
      toast.error(message || "Failed to end class");
    } finally {
      setPendingAction(null);
    }
  };

  const cancelLiveClass = async () => {
    if (!cancelConfirmClass) return;
    const id = cancelConfirmClass.liveClassId || cancelConfirmClass.id;
    setCancelling(true);
    try {
      await liveClassService.cancel(id);
      toast.success("Class cancelled");
      setCancelConfirmClass(null);
      await fetchClasses();
    } catch (error) {
      const message = error?.response?.data?.error
        || error?.response?.data?.message
        || error?.response?.data?.title;
      toast.error(message || "Unable to cancel this class");
    } finally {
      setCancelling(false);
    }
  };

  const attendanceLiveClassId = (cls) => cls?.liveClassId ?? cls?.id ?? null;

  const loadAttendanceRows = useCallback(async (liveClassId) => {
    if (!liveClassId) {
      setAttendanceStudents([]);
      setAttendanceDashboard(null);
      setAttendanceError("This class does not have a valid ID yet.");
      return;
    }
    setAttendanceLoading(true);
    setAttendanceError("");
    try {
      // GET /api/Attendance/liveclass/{liveClassId} — attendance for THIS
      // specific session, not the batch as a whole. The previous
      // implementation fetched by batchId via a since-removed endpoint, so a
      // mentor's own live class always showed as empty here regardless of
      // whether students had actually joined.
      const rows = await attendanceService.byLiveClass(liveClassId);
      setAttendanceStudents(normalizeAttendanceRows(rows));
    } catch (error) {
      setAttendanceStudents([]);
      setAttendanceError(getApiErrorMessage(error, "Unable to load attendance for this class."));
    } finally {
      setAttendanceLoading(false);
    }
    // GET /api/Attendance/liveclass/{id}/dashboard — best-effort: some
    // deployments may not have this wired up yet, so a failure here must
    // never block the attendance list itself from rendering.
    try {
      const dashboard = await attendanceService.liveClassDashboard(liveClassId);
      setAttendanceDashboard(dashboard && typeof dashboard === "object" ? dashboard : null);
    } catch {
      setAttendanceDashboard(null);
    }
  }, []);

  const openAttendance = async (cls) => {
    setAttendanceDrawer(cls);
    setAttendanceStudents([]);
    setAttendanceDashboard(null);
    await loadAttendanceRows(attendanceLiveClassId(cls));
  };

  useEffect(() => {
    const requestedId = new URLSearchParams(location.search).get("attendance");
    if (!requestedId || loading) return;
    const record = classes.find((item) => String(item.liveClassId || item.id) === requestedId);
    if (record) {
      openAttendance(record);
    } else {
      toast.error("This class is not available in the live-class records.");
    }
    navigate(location.pathname, { replace: true });
  }, [classes, loading, location.pathname, location.search, navigate]);

  const saveAttendance = async () => {
    const cls = attendanceDrawer;
    const liveClassId = attendanceLiveClassId(cls);
    if (!liveClassId || !attendanceStudents.length) return;
    setSavingAttendance(true);
    try {
      const date = cls?.scheduledDate
        ? new Date(cls.scheduledDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // PUT /api/Attendance — the same per-student write the Organization
      // Live Classes screen uses (useLiveClasses.js submitAttendance), so
      // both surfaces write through one contract instead of two.
      await Promise.all(attendanceStudents.map((s) => attendanceService.updateLiveClassAttendance({
        studentId: s.studentId ?? s.id,
        liveClassId,
        status: s.status,
        date,
      })));
      toast.success(`Attendance saved for ${attendanceStudents.length} students`);

      const presentCount = attendanceStudents.filter(
        (s) => s.status === "present" || s.status === "late",
      ).length;
      setClasses((prev) =>
        prev.map((c) =>
          attendanceLiveClassId(c) === liveClassId
            ? { ...c, attendanceCount: presentCount }
            : c,
        ),
      );
      setAttendanceDrawer(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save attendance."));
    } finally {
      setSavingAttendance(false);
    }
  };

  const generateAttendance = async () => {
    const liveClassId = attendanceLiveClassId(attendanceDrawer);
    if (!liveClassId || generatingAttendance) return;
    setGeneratingAttendance(true);
    try {
      // POST /api/Attendance/liveclass/{id}/generate — auto-fills attendance
      // from the meeting platform's join/leave logs for a class nobody has
      // manually marked yet. Only fires on this explicit click, never on
      // page load, so repeated visits never regenerate records.
      await attendanceService.generateForLiveClass(liveClassId);
      await loadAttendanceRows(liveClassId);
      toast.success("Attendance generated from join logs.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to generate attendance."));
    } finally {
      setGeneratingAttendance(false);
    }
  };

  const exportAttendanceReport = async (format) => {
    const liveClassId = attendanceLiveClassId(attendanceDrawer);
    if (!liveClassId || exportingAttendance) return;
    setExportingAttendance(format);
    try {
      const response = format === "excel"
        ? await attendanceService.liveClassReportExcel(liveClassId)
        : await attendanceService.liveClassReportPdf(liveClassId);
      const extension = format === "excel" ? "xlsx" : "pdf";
      const safeTitle = String(attendanceDrawer?.classTitle || "live-class").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = filenameFromDisposition(response) || `attendance-${safeTitle}-${liveClassId}.${extension}`;
      triggerFileDownload(response.data, filename);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to download the ${format === "excel" ? "Excel" : "PDF"} report.`));
    } finally {
      setExportingAttendance("");
    }
  };

  const getInitials = (name) => {
    return (name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // ── Create / Edit Live Class handler ────────────────────
  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.classTitle.trim())
      errors.classTitle = "Class title is required";
    if (!Number.isInteger(Number(createForm.courseId)) || Number(createForm.courseId) <= 0)
      errors.courseId = "A valid course ID is required";
    if (!Number.isInteger(Number(createForm.batchId)) || Number(createForm.batchId) <= 0)
      errors.batchId = "A valid batch ID is required";
    // The backend rejects a new class without a module (moduleId ≥ 1). Edit
    // sends one only when a module of the course is chosen.
    const courseEntered = Number(createForm.courseId) > 0;
    if (courseEntered && courseModules.status === "loading") errors.moduleId = "Modules are still loading";
    else if (!editingClass && courseEntered && courseModules.status === "error") errors.moduleId = "Modules couldn't be loaded for this course";
    else if (!editingClass && courseEntered && !courseModules.options.length) errors.moduleId = "This course has no syllabus modules. Add one before scheduling";
    else if (!editingClass && (!moduleChosen || !toModuleId(createForm.moduleId)))
      errors.moduleId = "Module is required";
    if (!createForm.mentorId || !Number.isInteger(Number(createForm.mentorId)) || Number(createForm.mentorId) <= 0)
      errors.mentorId = "A valid mentor is required";
    if (!createForm.scheduledDate) errors.scheduledDate = "Date is required";
    if (!createForm.startTime) errors.startTime = "Start time is required";
    if (!createForm.endTime) errors.endTime = "End time is required";
    else if (createForm.startTime && createForm.endTime.slice(0, 5) <= createForm.startTime.slice(0, 5))
      errors.endTime = "End time must be after start time";
    if (!createForm.meetingPlatform.trim())
      errors.meetingPlatform = "Platform is required";
    if (!createForm.meetingLink.trim())
      errors.meetingLink = "Meeting link is required";
    else if (!/^https?:\/\//i.test(createForm.meetingLink.trim()))
      errors.meetingLink = "Must be a valid URL (http/https)";
    if (!createForm.status.trim())
      errors.status = "Status is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setLaunchContext(null);
    setCreateForm({
      classTitle: "",
      description: "",
      courseId: "",
      batchId: "",
      moduleId: "",
      // Unlike openEditModal/the launch-context effect below, this entry
      // point previously never set mentorId at all — createForm.mentorId
      // stayed undefined, so validateCreateForm's "A valid mentor is
      // required" check failed for every direct Schedule Class submission,
      // independent of whether the mentor's own id had resolved correctly.
      mentorId: mentorId ? String(mentorId) : "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      meetingPlatform: "",
      meetingLink: "",
      recordingEnabled: true,
    });
    setFormErrors({});
    setCreateError("");
    setShowCreateModal(true);
  };

  useEffect(() => {
    const context = location.state?.createLiveClass;
    if (!context || !allowCreate) return;

    setEditingClass(null);
    setLaunchContext(context);
    setCreateForm({
      classTitle: context.classTitle || "",
      description:
        context.courseName && context.batchName
          ? `${context.courseName} · ${context.batchName}`
          : "",
      courseId: String(context.courseId ?? ""),
      batchId: String(context.batchId ?? ""),
      moduleId: "",
      mentorId: mentorId ? String(mentorId) : "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      meetingPlatform: "",
      meetingLink: "",
      meetingId: "",
      meetingPassword: "",
      status: "scheduled",
      recordingEnabled: true,
    });
    setFormErrors({});
    setCreateError("");
    setShowCreateModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [allowCreate, location.pathname, location.state, navigate]);

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setCreateForm({
      classTitle: cls.classTitle || "",
      description: cls.description || "",
      courseId: String(cls.courseId || ""),
      batchId: String(cls.batchId || ""),
      moduleId: toModuleId(cls.moduleId) ? String(cls.moduleId) : "",
      mentorId: String(cls.mentorId || mentorId || ""),
      scheduledDate: cls.scheduledDate ? cls.scheduledDate.split("T")[0] : "",
      startTime: cls.startTime || "",
      endTime: cls.endTime || "",
      meetingPlatform: cls.meetingPlatform || "",
      meetingLink: cls.meetingLink || "",
      meetingId: cls.meetingId || "",
      meetingPassword: cls.meetingPassword || cls.password || "",
      status: cls.status || "scheduled",
      recordingEnabled: cls.recordingEnabled ?? true,
    });
    setFormErrors({});
    setCreateError("");
    setShowCreateModal(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    setCreating(true);
    setCreateError("");
    try {
      const payload = {
        classTitle: createForm.classTitle.trim(),
        description: createForm.description.trim(),
        courseId: Number(createForm.courseId),
        batchId: Number(createForm.batchId),
        moduleId: moduleChosen ? toModuleId(createForm.moduleId) : undefined,
        mentorId: Number(createForm.mentorId),
        meetingPlatform: createForm.meetingPlatform.trim(),
        meetingLink: createForm.meetingLink.trim(),
        meetingId: createForm.meetingId.trim(),
        meetingPassword: createForm.meetingPassword.trim(),
        scheduledDate: createForm.scheduledDate,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        status: createForm.status,
        recordingEnabled: Boolean(createForm.recordingEnabled),
      };

      if (editingClass) {
        const id = editingClass.liveClassId || editingClass.id;
        const updatedClass = await liveClassService.update(id, payload);
        setClasses((prev) => prev.map((c) =>
          (c.liveClassId || c.id) === id
            ? { ...c, ...updatedClass, computedStatus: updatedClass.status ? toMentorStatus(updatedClass.status) : c.computedStatus }
            : c,
        ));
        toast.success("Live class updated successfully!");
      } else {
        const createdClass = await liveClassService.create(payload);
        setClasses((prev) => [
          { ...createdClass, computedStatus: toMentorStatus(createdClass.status) },
          ...prev.filter((c) => (c.liveClassId || c.id) !== (createdClass.liveClassId || createdClass.id)),
        ]);
        saveScheduledClass(createdClass);
        toast.success("Class scheduled successfully!");
      }

      setShowCreateModal(false);
      setEditingClass(null);
      setCreateForm({
        classTitle: "",
        description: "",
        courseId: "",
        batchId: "",
        moduleId: "",
        mentorId: mentorId ? String(mentorId) : "",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        meetingPlatform: "",
        meetingLink: "",
        meetingId: "",
        meetingPassword: "",
        status: "scheduled",
        recordingEnabled: true,
      });
      setFormErrors({});
      if (!editingClass && launchContext?.batchId) {
        navigate(`/mentor/batches/${launchContext.batchId}?tab=live-classes`);
      }
    } catch (err) {
      logLiveClassSaveError(err, editingClass ? "PUT /api/v1/live-classes/{id}" : "POST /api/v1/live-classes");
      const msg = liveClassSaveErrorMessage(err, { mode: editingClass ? "update" : "create" });
      // Only a 400/422 validation response marks fields.
      setFormErrors((current) => ({ ...current, ...liveClassFieldErrors(err) }));
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────
  const handleDeleteClass = async () => {
    if (!deleteConfirmClass) return;
    const id = deleteConfirmClass.liveClassId || deleteConfirmClass.id;
    setDeleting(true);
    try {
      // Wait for backend confirmation before touching the UI — a fire-and-forget
      // delete with the result swallowed would tell the user it succeeded even
      // if the backend rejected it (403/404/409), with no way to notice.
      await liveClassService.remove(id);
      setClasses((prev) => prev.filter((c) => (c.liveClassId || c.id) !== id));
      toast.success("Live class deleted successfully!");
      setDeleteConfirmClass(null);
    } catch (error) {
      const message = error?.response?.data?.error
        || error?.response?.data?.message
        || error?.response?.data?.title;
      toast.error(message || "Failed to delete class");
    } finally {
      setDeleting(false);
    }
  };

  // ── View Details ─────────────────────────────────────────
  const openViewDetails = async (cls) => {
    setViewingClass(cls);
    const id = cls.liveClassId || cls.id;
    if (!id || String(id).startsWith("scheduled-")) return;
    try {
      const latest = await liveClassService.get(id);
      setViewingClass((current) => current && String(current.liveClassId || current.id) === String(id)
        ? { ...current, ...latest, computedStatus: latest.status ? toMentorStatus(latest.status) : current.computedStatus }
        : current);
    } catch {
      // The list record still contains enough information for the details view.
    }
  };

  // ── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700/50 animate-pulse"
            />
          ))}
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/40 overflow-hidden">
          <div className="p-5 space-y-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mv17 mv17-live mx-auto min-w-0 max-w-[1500px] overflow-x-hidden px-3 sm:px-4 lg:px-5 ${embedded ? "pb-3 pt-0" : "py-3"}`}>
      {/* ─── Header (standalone route only) ───────────────── */}
      {!embedded && (
      <MentorPageHeader
        className="mentor-section-heading"
        title="My Live Classes"
        subtitle="Manage your scheduled and live classes"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchClasses(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-sm font-bold text-[#133b5d] shadow-sm transition hover:bg-[#f6f9fd] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {allowCreate && (
              <button
                onClick={openCreateModal}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F39924] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#e2860f]"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule Class
              </button>
            )}
          </div>
        }
      />
      )}

      {/* ─── Demo Data Banner (when mock data is active) ─── */}
      {usingMockData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-500/[0.04] dark:to-yellow-500/[0.04] p-4 mb-6"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0 shadow-sm">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Showing demo data
                </h3>
                <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                  The live server is currently unreachable.
                  {error ? ` ${error.replace(/\.$/, "")}.` : ""} Sample classes
                  are displayed below. Click <strong>Retry</strong> to attempt a
                  live connection.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fetchClasses(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />{" "}
                Retry
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Stats Cards ───────────────────────────────── */}
      <div className="mv17-lkpis">
        {[
          { label: "Total Classes", value: statusCounts.all ?? classes.length, icon: CalendarDays, tone: "blue", filter: "all" },
          { label: "Live Now", value: stats.live, icon: Radio, tone: "green", filter: "live" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, tone: "orange", filter: "upcoming" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, tone: "purple", filter: "completed" },
          { label: "Total Students", value: stats.totalStudents, icon: Users, tone: "pink", filter: null },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            disabled={!card.filter}
            onClick={() => { if (card.filter) { setStatusFilter(card.filter); setCurrentPage(1); } }}
            className={`mv17-lkpi mv17-lkpi--${card.tone}`}
            aria-pressed={card.filter ? statusFilter === card.filter : undefined}
          >
            <span className="mv17-lkpi__icon" aria-hidden="true"><card.icon /></span>
            <span className="min-w-0">
              <b>{card.value}</b>
              <small>{card.label}</small>
            </span>
            <span className="mv17-lkpi__bars" aria-hidden="true"><i /><i /><i /><i /></span>
          </button>
        ))}
      </div>

      {/* ─── Search & Filters ──────────────────────────── */}
      <div className="mv17-lfilters">
        <div className="mv17-lfilters__row">
          <label className="mv17-search mv17-lfilters__search">
            <Search aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by class title, course, batch or topic..."
              aria-label="Search classes"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <select
            aria-label="Filter by course"
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mv17-select"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by batch"
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mv17-select"
          >
            <option value="all">All Batches</option>
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mv17-select"
          >
            <option value="all">All Statuses</option>
            <option value="live">Live</option>
            <option value="today">Today</option>
            <option value="scheduled">Scheduled</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="mv17-date">
            <CalendarDays aria-hidden="true" />
            <input
              type="date"
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            {dateFilter && (
              <button
                type="button"
                aria-label="Clear date filter"
                onClick={() => {
                  setDateFilter("");
                  setCurrentPage(1);
                }}
              >
                <X />
              </button>
            )}
          </div>
          {(onScheduleClass || allowCreate) && (
            <button type="button" onClick={onScheduleClass ?? openCreateModal} className="mv17-tool-btn mv17-tool-btn--navy mv17-lfilters__cta">
              <Plus aria-hidden="true" />
              Schedule Class
            </button>
          )}
        </div>

        <div className="mv17-chips" role="group" aria-label="Class status">
          {[
            { key: "all", label: "All", tone: "navy" },
            { key: "live", label: "Live", tone: "green" },
            { key: "today", label: "Today", tone: "orange" },
            { key: "scheduled", label: "Scheduled", tone: "blue" },
            { key: "upcoming", label: "Upcoming", tone: "purple" },
            { key: "completed", label: "Completed", tone: "mint" },
            { key: "cancelled", label: "Cancelled", tone: "rose" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={statusFilter === tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`mv17-chip mv17-chip--${tab.tone}`}
            >
              {tab.label}
              <span>{statusCounts[tab.key]}</span>
            </button>
          ))}
          {selectedIds.size > 0 && (
            <span className="mv17-chips__selection" role="status">
              {selectedIds.size} selected
              <button type="button" onClick={exportSelected}><Download aria-hidden="true" /> Export</button>
              <button type="button" onClick={() => setSelectedIds(new Set())}>Clear</button>
            </span>
          )}
          {viewToggle && <span className="mv17-chips__end">{viewToggle}</span>}
        </div>
      </div>

      {/* ─── Empty State ────────────────────────────────── */}
      {filtered.length === 0 && !loading && (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/10 dark:to-indigo-500/10">
            <Video className="h-7 w-7 text-purple-500 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {usingMockData
              ? "All classes filtered out"
              : `No Live Classes${statusFilter !== "all" ? ` (${statusFilter})` : ""}`}
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            {usingMockData
              ? "No demo classes match your current filters. Try adjusting or clearing them."
              : searchQuery
                ? "No classes match your search criteria. Try adjusting your filters."
                : statusFilter === "live" ? "No class is live right now. Open the Today or Scheduled filter to view your next class." : "You currently have no scheduled classes. New classes will appear here when assigned."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {statusFilter === "live" && !searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("today");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff8800] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e97800]"
              >
                <CalendarDays className="h-3.5 w-3.5" /> View today&apos;s classes
              </button>
            )}
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
                setCourseFilter("all");
                setBatchFilter("all");
                setDateFilter("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        </div>
      )}

      {/* ─── Desktop Table ──────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="mv17-ltable hidden lg:block rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/40 overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto px-px">
            <table className="w-full min-w-[1240px] table-fixed">
              <colgroup>
                <col className="w-[48px]" /><col className="w-[44px]" /><col className="w-[170px]" /><col className="w-[145px]" />
                <col className="w-[118px]" /><col className="w-[142px]" /><col className="w-[120px]" />
                <col className="w-[120px]" /><col className="w-[125px]" /><col className="w-[115px]" />
                <col className="w-[200px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/40 bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="sticky top-0 z-10 px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    #
                  </th>
                  <th className="sticky top-0 z-10 px-2 py-3.5 text-center">
                    <input
                      type="checkbox"
                      className="mv17-check"
                      aria-label="Select all classes on this page"
                      checked={paginated.length > 0 && paginated.every((cls) => selectedIds.has(String(cls.liveClassId || cls.id)))}
                      onChange={togglePageSelection}
                      disabled={!paginated.length}
                    />
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <button
                      onClick={() => handleSort("classTitle")}
                      className="inline-flex items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      Class Title{" "}
                      <SortIndicator
                        field="classTitle"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </button>
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <button
                      onClick={() => handleSort("courseName")}
                      className="inline-flex items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      Course{" "}
                      <SortIndicator
                        field="courseName"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </button>
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <button
                      onClick={() => handleSort("batchName")}
                      className="inline-flex items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      Batch{" "}
                      <SortIndicator
                        field="batchName"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </button>
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <button
                      onClick={() => handleSort("scheduledDate")}
                      className="inline-flex items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      Date{" "}
                      <SortIndicator
                        field="scheduledDate"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </button>
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Meeting
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Attendance
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <button
                      onClick={() => handleSort("status")}
                      className="inline-flex items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      Status{" "}
                      <SortIndicator
                        field="status"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </button>
                  </th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {paginated.map((cls, idx) => {
                  const StatusIcon = getStatusIcon(cls.computedStatus);
                  const isTodayClass = isToday(cls.scheduledDate);
                  const cd = countdowns[cls.liveClassId || cls.id];
                  const plat = MEETING_PLATFORMS[cls.meetingPlatform] || {
                    icon: "L",
                    color: "from-purple-500 to-indigo-500",
                  };
                  const presentCount = cls.attendanceCount || 0;
                  return (
                    <tr
                      key={cls.liveClassId || cls.id}
                      className={`group transition-all duration-200 hover:bg-purple-50/30 dark:hover:bg-purple-500/[0.03] ${isTodayClass ? "bg-amber-50/30 dark:bg-amber-500/[0.03]" : ""}`}
                    >
                      <td className="px-3 py-4 text-center">
                        <span className="text-xs font-medium text-slate-400">
                          {(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <input
                          type="checkbox"
                          className="mv17-check"
                          aria-label={`Select ${cls.classTitle || "class"}`}
                          checked={selectedIds.has(String(cls.liveClassId || cls.id))}
                          onChange={() => toggleRowSelection(cls)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5" data-platform={plat.icon}>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                              {cls.classTitle}
                            </p>
                            {cd && (
                              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Starts in {cd}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10">
                          <BookOpen className="w-3 h-3" />
                          {cls.courseName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {cls.batchName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#f39924]" />
                          <span className="whitespace-nowrap text-sm font-medium leading-tight text-slate-700 dark:text-slate-300">
                            {formatDate(cls.scheduledDate)}
                            <small className="block text-[11px] font-medium text-slate-500">{weekdayOf(cls.scheduledDate)}</small>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-[#2f6fe4]" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {formatTimeRange(cls.startTime, cls.endTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="mv17-meet">
                            <Video aria-hidden="true" />
                            {cls.meetingPlatform || "Platform"}
                          </span>
                          {canJoinLiveClass(cls) && (
                            <button
                              onClick={() => joinMeeting(cls)}
                              className="p-1 rounded-md text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-500/15 transition-colors"
                              title="Join Meeting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor:
                              presentCount > 0
                                ? "rgba(5,150,105,0.1)"
                                : "rgba(148,163,184,0.1)",
                            color: presentCount > 0 ? "#059669" : "#94a3b8",
                          }}
                        >
                          <UserCheck className="w-3 h-3" />
                          {presentCount > 0
                            ? `${presentCount} Present`
                            : "0 Attendance"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`mv17-lstatus mv17-lstatus--${String(cls.computedStatus || "").toLowerCase()} inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(cls.computedStatus)}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cls.computedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex min-h-8 flex-wrap items-center justify-end gap-1">
                          {cls.computedStatus === "Scheduled" && (
                            <>
                              <button
                                onClick={() => joinMeeting(cls)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-500/15 transition-colors"
                              >
                                Join
                              </button>
                              <button
                                onClick={() => startLiveClass(cls)}
                                disabled={pendingAction?.id === (cls.liveClassId || cls.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {pendingAction?.id === (cls.liveClassId || cls.id) && pendingAction.type === "start" ? "Starting…" : "Start"}
                              </button>
                              <button
                                onClick={() => setCancelConfirmClass(cls)}
                                className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/15 text-slate-400 hover:text-amber-600 transition-colors"
                                title="Cancel Class"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openViewDetails(cls)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(cls)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmClass(cls)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {cls.computedStatus === "Live" && (
                            <>
                              <button
                                onClick={() => joinMeeting(cls)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                              >
                                <span className="relative flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                                  Join
                                </span>
                              </button>
                              <button
                                onClick={() => openAttendance(cls)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/15 transition-colors"
                              >
                                Attendance
                              </button>
                              <button
                                onClick={() => endLiveClass(cls)}
                                disabled={pendingAction?.id === (cls.liveClassId || cls.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                title={pendingAction?.id === (cls.liveClassId || cls.id) && pendingAction.type === "end" ? "Ending…" : "End Class"}
                              >
                                <StopCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openViewDetails(cls)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(cls)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmClass(cls)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {cls.computedStatus === "Completed" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openAttendance(cls)}
                                className="mv17-att-btn inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[11px] font-bold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Attendance
                              </button>
                              <button
                                type="button"
                                onClick={() => copyMeetingLink(cls)}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10"
                                title="Copy Link"
                                aria-label={`Copy ${cls.classTitle || "class"} meeting link`}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <div className="relative" data-rowmenu="true">
                                <button
                                  type="button"
                                  onClick={() => setRowMenu((current) => (current === (cls.liveClassId || cls.id) ? null : cls.liveClassId || cls.id))}
                                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  aria-haspopup="menu"
                                  aria-expanded={rowMenu === (cls.liveClassId || cls.id)}
                                  aria-label={`More actions for ${cls.classTitle || "class"}`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {rowMenu === (cls.liveClassId || cls.id) && (
                                  <div role="menu" className={`mv17-rowmenu ${idx >= paginated.length - 2 && paginated.length > 3 ? "is-up" : ""}`}>
                                    <button type="button" role="menuitem" onClick={() => { setRowMenu(null); openViewDetails(cls); }}><Eye aria-hidden="true" /> View details</button>
                                    <button type="button" role="menuitem" onClick={() => { setRowMenu(null); openAttendance(cls); }}><UserCheck aria-hidden="true" /> Attendance</button>
                                    <button type="button" role="menuitem" onClick={() => { setRowMenu(null); copyMeetingLink(cls); }}><Copy aria-hidden="true" /> Copy meeting link</button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                          {(cls.computedStatus === "Cancelled" ||
                            cls.computedStatus === "cancelled") && (
                            <>
                              <button
                                onClick={() => openViewDetails(cls)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmClass(cls)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Mobile Cards ────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="lg:hidden space-y-3">
          {paginated.map((cls) => {
            const StatusIcon = getStatusIcon(cls.computedStatus);
            const isTodayClass = isToday(cls.scheduledDate);
            const cd = countdowns[cls.liveClassId || cls.id];
            const presentCount = cls.attendanceCount || 0;
            return (
              <div
                key={cls.liveClassId || cls.id}
                className={`rounded-2xl border p-4 transition-all ${isTodayClass ? "border-amber-200/60 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/[0.03]" : "border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${MEETING_PLATFORMS[cls.meetingPlatform]?.color || "from-purple-500 to-indigo-500"} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {cls.classTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cls.courseName || ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${getStatusStyle(cls.computedStatus)}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cls.computedStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(cls.scheduledDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimeRange(cls.startTime, cls.endTime)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {cls.batchName || "No batch"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {presentCount || 0} present
                  </div>
                </div>
                {cd && (
                  <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Starts in {cd}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/30">
                  <button
                    type="button"
                    onClick={() => openViewDetails(cls)}
                    className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/15"
                    title="View Details"
                    aria-label={`View ${cls.classTitle || "class"} details`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {cls.computedStatus === "Scheduled" && (
                    <>
                      <button
                        onClick={() => joinMeeting(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-500/25 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Join
                      </button>
                      <button
                        onClick={() => startLiveClass(cls)}
                        disabled={pendingAction?.id === (cls.liveClassId || cls.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ListChecks className="w-3.5 h-3.5" /> {pendingAction?.id === (cls.liveClassId || cls.id) && pendingAction.type === "start" ? "Starting…" : "Start"}
                      </button>
                      <button
                        onClick={() => setCancelConfirmClass(cls)}
                        className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/15 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Cancel Class"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyMeetingLink(cls)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {cls.computedStatus === "Live" && (
                    <>
                      <button
                        onClick={() => joinMeeting(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-500/25 transition-all"
                      >
                        <span className="relative flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                          Join Live
                        </span>
                      </button>
                      <button
                        onClick={() => openAttendance(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-500/25 transition-all"
                      >
                        <ListChecks className="w-3.5 h-3.5" /> Attendance
                      </button>
                      <button
                        onClick={() => endLiveClass(cls)}
                        disabled={pendingAction?.id === (cls.liveClassId || cls.id)}
                        title={pendingAction?.id === (cls.liveClassId || cls.id) && pendingAction.type === "end" ? "Ending…" : "End Class"}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {cls.computedStatus === "Completed" && (
                    <>
                      <button
                        onClick={() => openAttendance(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-500/25 transition-all"
                      >
                        <ListChecks className="w-3.5 h-3.5" /> Attendance
                      </button>
                      {cls.meetingLink && (
                        <button
                          onClick={() => copyMeetingLink(cls)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </button>
                      )}
                    </>
                  )}
                  {(cls.computedStatus === "Cancelled" ||
                    cls.computedStatus === "cancelled") && (
                    <span className="text-xs text-slate-400 italic">
                      No actions available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="mv17-lpager flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} classes
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) pageNum = i + 1;
                else if (safePage <= 4) pageNum = i + 1;
                else if (safePage >= totalPages - 3)
                  pageNum = totalPages - 6 + i;
                else pageNum = safePage - 3 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={safePage === pageNum ? "page" : undefined}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${safePage === pageNum ? "bg-[#f39924] text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Attendance Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {attendanceDrawer && (
          <>
            <div
              className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
              onClick={() => setAttendanceDrawer(null)}
            />
            <div
              className="fixed right-0 top-0 z-[1000] h-full w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col"
              style={{ transform: "none" }}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Attendance
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {attendanceDrawer?.classTitle}
                  </p>
                </div>
                <button
                  onClick={() => setAttendanceDrawer(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/30">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Course</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {attendanceDrawer?.courseName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Batch</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {attendanceDrawer?.batchName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {formatDate(attendanceDrawer?.scheduledDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700/30">
                <button
                  type="button"
                  onClick={generateAttendance}
                  disabled={generatingAttendance || attendanceLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-60 transition-colors"
                >
                  {generatingAttendance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {generatingAttendance ? "Generating..." : "Generate from Join Logs"}
                </button>
                <button
                  type="button"
                  onClick={() => exportAttendanceReport("pdf")}
                  disabled={Boolean(exportingAttendance) || attendanceLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-60 transition-colors"
                >
                  {exportingAttendance === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => exportAttendanceReport("excel")}
                  disabled={Boolean(exportingAttendance) || attendanceLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-60 transition-colors"
                >
                  {exportingAttendance === "excel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  Excel
                </button>
              </div>

              {pickDashboardStats(attendanceDashboard).length > 0 && (
                <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700/30 bg-slate-50/60 dark:bg-slate-800/30">
                  {pickDashboardStats(attendanceDashboard).map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs">
                      <span className="text-slate-400 font-medium">{stat.label}:</span>{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {attendanceLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-sm text-slate-400">
                      Loading attendance...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    {attendanceError ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <AlertTriangle className="w-10 h-10 mb-3 text-amber-500 opacity-80" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{attendanceError}</p>
                        <button
                          type="button"
                          onClick={() => loadAttendanceRows(attendanceLiveClassId(attendanceDrawer))}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retry
                        </button>
                      </div>
                    ) : attendanceStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No attendance records yet</p>
                        <p className="text-xs mt-1 text-slate-400">Attendance will appear once students join, or use Generate from Join Logs.</p>
                      </div>
                    ) : (
                      attendanceStudents.map((student) => (
                        <div
                          key={student.id || student.studentId}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                              {getInitials(student.fullName || student.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {student.fullName || student.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {student.rollNo ||
                                  `#${student.studentId || student.id}`}
                              </p>
                            </div>
                          </div>
                          <AttendanceToggle
                            currentStatus={student.status}
                            onToggle={(newStatus) => {
                              setAttendanceStudents((prev) =>
                                prev.map((s) =>
                                  s.id === student.id ||
                                  s.studentId === student.studentId
                                    ? { ...s, status: newStatus }
                                    : s,
                                ),
                              );
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="w-3.5 h-3.5" />{" "}
                          {
                            attendanceStudents.filter(
                              (s) =>
                                s.status === "present" || s.status === "late",
                            ).length
                          }{" "}
                          Present
                        </span>
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <UserX className="w-3.5 h-3.5" />{" "}
                          {
                            attendanceStudents.filter(
                              (s) => s.status === "absent",
                            ).length
                          }{" "}
                          Absent
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Total: {attendanceStudents.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAttendanceDrawer(null)}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveAttendance}
                        disabled={savingAttendance || !attendanceStudents.length}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 transition-all"
                      >
                        {savingAttendance ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-4 h-4" /> Save
                            Attendance
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Create Live Class Modal ───────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <div
              className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError("");
                setFormErrors({});
              }}
            />
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError("");
                setFormErrors({});
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Schedule Class
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Schedule a live session for the selected course and batch
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError("");
                      setFormErrors({});
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSaveClass} className="p-5 space-y-4">
                  {createError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">
                        {createError}
                      </p>
                    </div>
                  )}

                  {launchContext && !editingClass && (
                    <div className="flex flex-col gap-2 rounded-xl border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-500/25 dark:bg-violet-500/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                          Selected batch
                        </p>
                        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                          {launchContext.batchName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {launchContext.courseName}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <span className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300">
                          Course ID: {launchContext.courseId}
                        </span>
                        <span className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300">
                          Batch ID: {launchContext.batchId}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class Title */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Class Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.classTitle}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            classTitle: e.target.value,
                          }))
                        }
                        placeholder="e.g. React Hooks Deep Dive"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${
                          formErrors.classTitle
                            ? "border-red-300 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      {formErrors.classTitle && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {formErrors.classTitle}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={createForm.description}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Optional class description..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none"
                      />
                    </div>

                    {/* Course ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Course ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={createForm.courseId}
                        readOnly={!!launchContext && !editingClass}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            courseId: e.target.value,
                            // A module belongs to the previous course's syllabus.
                            moduleId: "",
                          }))
                        }
                        placeholder="Optional"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${formErrors.courseId ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-slate-700"} ${launchContext && !editingClass ? "bg-slate-100 dark:bg-slate-700/60 cursor-not-allowed font-semibold" : "bg-white dark:bg-slate-900"}`}
                      />
                      {formErrors.courseId && <p className="mt-1 text-[10px] text-red-500">{formErrors.courseId}</p>}
                    </div>

                    {/* Batch ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Batch ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={createForm.batchId}
                        readOnly={!!launchContext && !editingClass}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            batchId: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${formErrors.batchId ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-slate-700"} ${launchContext && !editingClass ? "bg-slate-100 dark:bg-slate-700/60 cursor-not-allowed font-semibold" : "bg-white dark:bg-slate-900"}`}
                      />
                      {formErrors.batchId && <p className="mt-1 text-[10px] text-red-500">{formErrors.batchId}</p>}
                    </div>

                    {/* Module (syllabus moduleId of the course) */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Module <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={moduleChosen ? String(createForm.moduleId) : ""}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            moduleId: e.target.value,
                          }))
                        }
                        disabled={courseModules.status !== "ready" || !courseModules.options.length}
                        aria-invalid={Boolean(formErrors.moduleId) || undefined}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/60 ${formErrors.moduleId ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        <option value="">
                          {courseModules.status === "idle" ? "Enter a course first"
                            : courseModules.status === "loading" ? "Loading modules…"
                              : courseModules.status === "error" ? "Couldn't load modules"
                                : courseModules.options.length ? "Select module" : "No modules in this course"}
                        </option>
                        {courseModules.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      {formErrors.moduleId && <p className="mt-1 text-[10px] text-red-500">{formErrors.moduleId}</p>}
                    </div>

                    {/* Scheduled Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={createForm.scheduledDate}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            scheduledDate: e.target.value,
                          }))
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all [color-scheme:light] dark:[color-scheme:dark] ${
                          formErrors.scheduledDate
                            ? "border-red-300 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      {formErrors.scheduledDate && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {formErrors.scheduledDate}
                        </p>
                      )}
                    </div>

                    {/* Start Time / End Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={createForm.startTime}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all [color-scheme:light] dark:[color-scheme:dark] ${
                            formErrors.startTime
                              ? "border-red-300 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                        {formErrors.startTime && (
                          <p className="mt-1 text-[10px] text-red-500">
                            {formErrors.startTime}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={createForm.endTime}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all [color-scheme:light] dark:[color-scheme:dark] ${
                            formErrors.endTime
                              ? "border-red-300 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                        {formErrors.endTime && (
                          <p className="mt-1 text-[10px] text-red-500">
                            {formErrors.endTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meeting Platform */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Meeting Platform <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.meetingPlatform}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            meetingPlatform: e.target.value,
                          }))
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${
                          formErrors.meetingPlatform
                            ? "border-red-300 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <option value="">Select platform...</option>
                        {MEETING_PLATFORM_OPTIONS.map((platform) => (
                          <option key={platform.id} value={platform.name}>{platform.name}</option>
                        ))}
                      </select>
                      {formErrors.meetingPlatform && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {formErrors.meetingPlatform}
                        </p>
                      )}
                    </div>

                    {/* Meeting Link */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Meeting Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={createForm.meetingLink}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            meetingLink: e.target.value,
                          }))
                        }
                        placeholder="https://meet.google.com/..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${
                          formErrors.meetingLink
                            ? "border-red-300 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      {formErrors.meetingLink && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {formErrors.meetingLink}
                        </p>
                      )}
                    </div>

                    {/* Recording Enabled */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={createForm.recordingEnabled}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              recordingEnabled: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/30"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Enable Recording
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Automatically record this session for later playback
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/30">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreateError("");
                        setFormErrors({});
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 transition-all"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          {editingClass ? "Updating..." : "Scheduling..."}
                        </>
                      ) : (
                        <>
                          <CalendarDays className="w-4 h-4" />{" "}
                          {editingClass ? "Update Class" : "Schedule Class"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {viewingClass && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setViewingClass(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="live-class-details-title" className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Live class details</p>
                <h2 id="live-class-details-title" className="mt-1 truncate text-xl font-bold text-slate-950 dark:text-white">{viewingClass.classTitle || viewingClass.title || "Untitled Class"}</h2>
                <p className="mt-1 text-sm text-slate-500">{viewingClass.courseName || "Course not specified"}</p>
              </div>
              <button type="button" aria-label="Close class details" onClick={() => setViewingClass(null)} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["Batch", viewingClass.batchName || "Not assigned"],
                ["Status", viewingClass.computedStatus || viewingClass.status || "Scheduled"],
                ["Date", formatDate(viewingClass.scheduledDate)],
                ["Time", formatTimeRange(viewingClass.startTime, viewingClass.endTime)],
                ["Platform", viewingClass.meetingPlatform || "Not specified"],
                ["Students", viewingClass.studentsCount ?? viewingClass.attendanceCount ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{viewingClass.description || "No description provided."}</p>
              </div>
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              {canJoinLiveClass(viewingClass) && <button type="button" onClick={() => joinMeeting(viewingClass)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" />Join Class</button>}
              <button type="button" onClick={() => setViewingClass(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200">Close</button>
            </footer>
          </section>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmClass && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 dark:bg-red-500/15">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete this class?</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {deleteConfirmClass.classTitle || "This class"} will be permanently deleted. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmClass(null)}
                className="flex-1 rounded-lg border px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                Keep Class
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteClass}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…</> : "Delete Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      {cancelConfirmClass && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cancel this class?</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {cancelConfirmClass.classTitle || "This class"} will be marked cancelled and students will no longer be able to join. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelConfirmClass(null)}
                className="flex-1 rounded-lg border px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                Keep Class
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={cancelLiveClass}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Cancelling…</> : "Cancel Class"}
              </button>
            </div>
          </div>
        </div>
      )}
      {jitsiSession && (
        <JitsiMeetingModal liveClass={jitsiSession} onClose={() => setJitsiSession(null)} />
      )}
    </div>
  );
}
