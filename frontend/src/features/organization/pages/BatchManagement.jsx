import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KPI_ACCENTS as KPI_TONES } from "@/components/common/kpiAccents";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Eye,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  BookOpen,
  UserRound,
  CalendarRange,
  Layers3,
  UserCheck,
  BarChart3,
  Clock3,
} from "lucide-react";

import Modal from "@shared/components/Modal";
import EmptyState from "@shared/components/EmptyState";
import { TableSkeleton } from "@shared/ui/Skeleton";
import { Button, Input, Select } from "@shared/components/FormElements";
import KpiWaveCard from "@shared/components/KpiWaveCard";
import ModalHero from "@shared/components/ModalHero";
import FilterSelect from "@shared/components/FilterSelect";
import { ListTable, ListTableBody, ListTableCell, ListTableHead, ListTableHeaderCell, ListTableRow } from "@shared/components/ListTable";
import { LIST_TABLE_CARD_CLASS } from "@shared/components/listTableStyles";
import { employeeApi, getApiErrorMessage, readableApiMessage } from "@shared/services/apiServices";
import { batchService } from "@shared/services/batchService";
import { DEFAULT_BATCH_CAPACITY } from "@shared/services/batchCapacityService";
import { courseService } from "@shared/services/courseService";
import { mentorService } from "@shared/services/mentorService";
import { studentsApi } from "@/api/students";
import { reconcileBatchRoster } from "@shared/utils/batchRoster";
import { useProfilePhotos } from "@shared/hooks/useProfilePhoto";
import { toProfileId } from "@shared/services/profilePhotoService";
import OrgShowcaseHero from "@features/organization/components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import { BatchActionButtons, BatchAvatar, BatchStatusPill, CourseTag, MentorAvatar } from "@features/organization/components/batch-management/batchUi";
import "./batches-density.css";
import useHrPermissions from "@features/hr/hooks/useHrPermissions";
import { useAuth } from "@shared/hooks/useAuth";
import { normalizeRole } from "@shared/constants/roles";

// Fixed widths keep the Batch Code and action columns visible and aligned in
// every row, even when the content varies in length.
const BATCH_COLUMN_WIDTHS = [
  "44px", // #
  "250px", // batch name
  "110px", // batch code
  "180px", // course
  "170px", // mentor
  "110px", // duration
  "90px", // students
  "120px", // status
  "160px", // view, edit and delete actions
];
// One toast slot for batch create/update, so a save shows exactly one notification.
const BATCH_SAVE_TOAST = "batch-save";
// The backend's own message when it sends one (validation, authorization,
// conflicts); otherwise a plain sentence for the kind of failure.
const batchSaveErrorMessage = (error, action) => {
  const fallback = `Failed to ${action} batch. Please try again.`;
  const serverMessage = readableApiMessage(error?.response?.data);
  if (serverMessage) return serverMessage;
  const status = error?.response?.status;
  if (!error?.response) {
    return error?.code === "ERR_NETWORK" || /network/i.test(String(error?.message ?? ""))
      ? `Failed to ${action} batch: the server could not be reached. Check your connection and try again.`
      : getApiErrorMessage(error, fallback);
  }
  if (status === 400 || status === 422) return `Failed to ${action} batch. Please check the entered details and try again.`;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return `You do not have permission to ${action} batches.`;
  if (status === 404) return "This batch no longer exists. Refresh the list and try again.";
  if (status >= 500) return `Failed to ${action} batch: the server could not complete the request. Please try again.`;
  return fallback;
};
// Compact inline padding and header labels for the dense table; the "!" lets
// them win over the shared header theme, which sets both with !important.
const CELL_PAD = "px-2!";
const HEAD_TEXT = "text-[10.5px]! tracking-[.03em]!";

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PAGE_BUTTON_CLASS =
  "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 disabled:cursor-not-allowed disabled:opacity-40";
const PAGE_BUTTON_IDLE = "border-[#DCE6F3] bg-white text-[#173A63] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
const isDemoSession = () => localStorage.getItem("isDemo") === "true";
const DEMO_COURSES = [
  { courseId: 101, courseName: "Full Stack Web Development" },
  { courseId: 102, courseName: "Data Science & Artificial Intelligence" },
  { courseId: 103, courseName: "UI/UX Product Design" },
  { courseId: 104, courseName: "Cloud & DevOps Engineering" },
];
const DEMO_MENTORS = [
  { mentorId: 201, mentorName: "Rahul Kumar" }, { mentorId: 202, mentorName: "Priya Sharma" },
  { mentorId: 203, mentorName: "Neha Verma" }, { mentorId: 204, mentorName: "Arjun Kapoor" },
];
const DEMO_BATCHES = [
  { batchId: 301, batchName: "Full Stack Morning", courseId: 101, mentorId: 201, studentsCount: 28, capacity: 30, startDate: "2026-07-06", endDate: "2026-12-18", status: "Active", batchType: "Hybrid", scheduleDays: ["Monday","Wednesday","Friday"], startTime: "09:00", endTime: "11:00" },
  { batchId: 302, batchName: "Full Stack Weekend", courseId: 101, mentorId: 201, studentsCount: 24, capacity: 30, startDate: "2026-08-01", endDate: "2027-01-30", status: "Active", batchType: "Online", scheduleDays: ["Saturday","Sunday"], startTime: "10:00", endTime: "13:00" },
  { batchId: 303, batchName: "Data Science Evening", courseId: 102, mentorId: 202, studentsCount: 26, capacity: 30, startDate: "2026-08-10", endDate: "2027-02-19", status: "Active", batchType: "Online", scheduleDays: ["Tuesday","Thursday","Saturday"], startTime: "18:00", endTime: "20:00" },
  { batchId: 304, batchName: "UI/UX September Cohort", courseId: 103, mentorId: 203, studentsCount: 18, capacity: 25, startDate: "2026-09-07", endDate: "2026-12-28", status: "Upcoming", batchType: "Hybrid", scheduleDays: ["Monday","Wednesday"], startTime: "14:00", endTime: "16:00" },
  { batchId: 305, batchName: "DevOps Professional", courseId: 104, mentorId: 204, studentsCount: 22, capacity: 28, startDate: "2026-08-24", endDate: "2027-01-15", status: "Upcoming", batchType: "Online", scheduleDays: ["Tuesday","Thursday"], startTime: "19:00", endTime: "21:00" },
  { batchId: 306, batchName: "Data Science Foundation", courseId: 102, mentorId: 202, studentsCount: 30, capacity: 30, startDate: "2026-02-02", endDate: "2026-07-31", status: "Completed", batchType: "Classroom", scheduleDays: ["Monday","Wednesday","Friday"], startTime: "10:00", endTime: "12:00" },
];

const BATCH_STATUS_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Draft", label: "Draft" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Archived", label: "Archived" },
];

const BATCH_TYPE_OPTIONS = [
  { value: "Online", label: "Online" },
  { value: "Classroom", label: "Classroom" },
  { value: "Hybrid", label: "Hybrid" },
];

const BATCH_SHIFT_OPTIONS = [
  { value: "Morning", label: "Morning (9:00 AM – 11:00 AM)" },
  { value: "Afternoon", label: "Afternoon (2:00 PM – 4:00 PM)" },
  { value: "Evening", label: "Evening (6:00 PM – 8:00 PM)" },
];
const SHIFT_TIMES = {
  Morning: { startTime: "09:00", endTime: "11:00" },
  Afternoon: { startTime: "14:00", endTime: "16:00" },
  Evening: { startTime: "18:00", endTime: "20:00" },
};
const shiftFromTime = (time = "") => time >= "17:00"
  ? "Evening"
  : time >= "12:00"
    ? "Afternoon"
    : "Morning";

const INITIAL_FORM = {
  batchName: "",
  courseId: "",
  mentorId: "",
  batchType: "Online",
  shift: "Morning",
  startDate: "",
  endDate: "",
  capacity: String(DEFAULT_BATCH_CAPACITY),
  description: "",
  scheduleDays: [],
  startTime: "09:00",
  endTime: "11:00",
  status: "Upcoming",
};

const buildPageWindow = (currentPage, totalPages) => {
  const windowSize = 5;
  if (totalPages <= windowSize)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + windowSize - 1);
  const adjustedStart = Math.max(1, end - windowSize + 1);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
};

const normalizeBatchStatus = (status) => {
  if (typeof status === "boolean") return status ? "active" : "completed";
  const value = String(status ?? "")
    .trim()
    .toLowerCase();
  if (["upcoming", "pending", "scheduled"].includes(value)) return "upcoming";
  if (["active", "running", "open"].includes(value)) return "active";
  if (["completed", "complete", "finished", "closed"].includes(value))
    return "completed";
  return value || "upcoming";
};

// Respect explicit terminal/planned statuses, but derive the lifecycle from
// the dates when an API row still carries the default Upcoming/Active value.
const getEffectiveBatchStatus = (batch, now = new Date()) => {
  const status = normalizeBatchStatus(batch.status);
  if (["completed", "cancelled", "draft", "archived"].includes(status)) return status;
  const start = batch.startDate ? new Date(batch.startDate) : null;
  const end = batch.endDate ? new Date(batch.endDate) : null;
  if (end && !Number.isNaN(end.getTime()) && end < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return "completed";
  if (start && !Number.isNaN(start.getTime()) && start > new Date(now.getFullYear(), now.getMonth(), now.getDate())) return "upcoming";
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) return "active";
  return status;
};

const getBatchStatusLabel = (status) => {
  const normalized = normalizeBatchStatus(status);
  if (normalized === "upcoming") return "Upcoming";
  if (normalized === "active") return "Active";
  if (normalized === "completed") return "Completed";
  return String(status ?? "-");
};

const getCourseLabel = (course) => {
  const id = course.courseId ?? course.id;
  return (
    course.courseName ??
    course.title ??
    course.name ??
    (id ? `Course ${id}` : "-")
  );
};

const isPlaceholderMentorName = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return !normalized || /^(string)(\s+string)*$/.test(normalized);
};

const validMentorName = (...values) =>
  values.find((value) => !isPlaceholderMentorName(value));

const normalizeSearchText = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const getMentorLabel = (mentor) => {
  const mentorName = [mentor.firstName, mentor.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const id = mentor.mentorId ?? mentor.id ?? mentor.employeeId;
  return validMentorName(
    mentor.mentorName,
    mentor.fullName,
    mentorName,
    mentor.name,
  ) || (id ? `Mentor ${id}` : "-");
};

// Batches reference Mentor.MentorId, which differs from the mentor's EmployeeId.
// An employee ID is never a valid batch mentor ID.
const getMentorId = (mentor = {}) =>
  mentor.mentorId ?? mentor.id;

const getMentorCourseIds = (mentor = {}) => {
  const rawValues = mentor.courseIds ?? mentor.courseIdsCsv ?? mentor.courses ?? [];
  const values = Array.isArray(rawValues)
    ? rawValues
    : String(rawValues || "").split(",");

  return values
    .map((value) => Number(
      typeof value === "object"
        ? value?.courseId ?? value?.id
        : String(value).trim(),
    ))
    .filter((value) => Number.isInteger(value) && value > 0);
};

const isActiveMentor = (mentor = {}) => {
  const status = mentor.status ?? mentor.isActive ?? mentor.active;
  if (status === undefined || status === null || status === "") return true;
  if (typeof status === "boolean") return status;
  return !["inactive", "disabled", "false", "0"].includes(
    String(status).trim().toLowerCase(),
  );
};

const isMentorEmployee = (employee = {}) => {
  const roleText = [
    employee.role,
    employee.roleName,
    employee.designation,
    employee.employeeType,
    employee.userRole,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return roleText.includes("mentor") || roleText.includes("tutor");
};

const normalizeBatch = (
  batch,
  courseMap = new Map(),
  mentorMap = new Map(),
) => {
  const batchId = batch.batchId ?? batch.id;
  const courseId = batch.courseId ?? batch.course?.courseId ?? batch.course?.id;
  const mentorId = batch.mentorId ?? batch.mentor?.mentorId ?? batch.mentor?.id;
  const courseName =
    batch.courseName ??
    batch.course?.courseName ??
    courseMap.get(Number(courseId))?.courseName ??
    courseMap.get(Number(courseId))?.title ??
    "-";
  const mappedMentor = mentorMap.get(Number(mentorId));
  const mentorName = validMentorName(
    mappedMentor && getMentorLabel(mappedMentor),
    batch.mentorName,
    batch.mentor?.mentorName,
    batch.mentor?.name,
    [batch.mentorFirstName, batch.mentorLastName].filter(Boolean).join(" "),
    [batch.firstName, batch.lastName].filter(Boolean).join(" "),
    getMentorLabel(batch.mentor || {}),
  ) || "-";

  return {
    ...batch,
    id: batchId,
    batchId,
    batchName: batch.batchName ?? batch.name ?? "-",
    batchCode: batch.batchCode ?? batch.BatchCode ?? batch.batch_code ?? batch.code ?? batch.batchNumber ?? "",
    courseId,
    courseName,
    mentorId,
    mentorName,
    batchType: batch.batchType ?? "-",
    studentsCount: Number(
      batch.studentsCount ?? batch.enrolledStudents ?? batch.studentCount ?? 0,
    ),
    enrolledStudents: Number(
      batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0,
    ),
    liveClasses: Number(batch.liveClasses ?? 0),
    recordedClasses: Number(batch.recordedClasses ?? 0),
    startDate: batch.startDate ?? null,
    endDate: batch.endDate ?? null,
    capacity: Math.min(DEFAULT_BATCH_CAPACITY, Number(batch.capacity ?? DEFAULT_BATCH_CAPACITY)),
    description: batch.description ?? "",
    scheduleDays: Array.isArray(batch.scheduleDays ?? batch.days)
      ? (batch.scheduleDays ?? batch.days)
      : [],
    startTime: batch.startTime ?? batch.classStartTime ?? "",
    endTime: batch.endTime ?? batch.classEndTime ?? "",
    status: batch.status ?? "Upcoming",
  };
};

const normalizeForm = (batch = {}) => ({
  batchName: batch.batchName ?? "",
  courseId: String(batch.courseId ?? batch.course?.courseId ?? batch.course?.id ?? ""),
  mentorId: String(batch.mentorId ?? batch.mentor?.mentorId ?? batch.mentor?.id ?? ""),
  // The API's "Offline" type is shown as the form's "Classroom" option.
  batchType: String(batch.batchType ?? batch.mode ?? "Online").toLowerCase() === "offline" ? "Classroom" : (batch.batchType ?? batch.mode ?? "Online"),
  shift: batch.shift ?? batch.batchShift ?? shiftFromTime(batch.startTime ?? batch.classStartTime),
  startDate: batch.startDate ? String(batch.startDate).slice(0, 10) : "",
  endDate: batch.endDate ? String(batch.endDate).slice(0, 10) : "",
  capacity:
    batch.capacity !== undefined && batch.capacity !== null
      ? String(batch.capacity)
      : String(DEFAULT_BATCH_CAPACITY),
  description: batch.description ?? "",
  scheduleDays: batch.scheduleDays ?? [],
  startTime: batch.startTime ?? "",
  endTime: batch.endTime ?? "",
  status: batch.status ?? "Upcoming",
});

const toPayload = (form) => ({
  batchName: form.batchName.trim(),
  courseId: Number(form.courseId),
  mentorId: Number(form.mentorId),
  batchType: form.batchType,
  shift: form.shift,
  startDate: form.startDate,
  endDate: form.endDate,
  capacity: Number(form.capacity),
  description: form.description.trim(),
  scheduleDays: form.scheduleDays,
  startTime: form.startTime,
  endTime: form.endTime,
  status: normalizeBatchStatus(form.status),
});

const buildCourseOptions = (courses) => [
  { value: "", label: "Select course" },
  ...courses.map((course) => ({
    value: String(course.courseId ?? course.id),
    label: `${getCourseLabel(course)}${(course.courseId ?? course.id) ? ` (#${course.courseId ?? course.id})` : ""}`,
  })),
];

const batchCourseId = (batch) => String(batch.courseId ?? batch.course?.courseId ?? batch.course?.id ?? "");
const batchMentorId = (batch) => String(batch.mentorId ?? batch.mentor?.mentorId ?? batch.mentor?.id ?? "");

/**
 * Mentors eligible for a course. Course assignments on a mentor's profile are
 * an eligibility rule; when no mentor has one for this course, every active
 * organization mentor is eligible (the API checks only organization
 * ownership). Mentors already running a batch of the course are listed first
 * and marked, but never used to exclude anyone else.
 */
const mentorsForCourse = (courseId, mentors, batches) => {
  if (!courseId) return { mentors: [], currentIds: new Set() };
  const selected = String(courseId);
  const assigned = mentors.filter((mentor) => getMentorCourseIds(mentor).some((id) => String(id) === selected));
  const currentIds = new Set(batches.filter((batch) => batchCourseId(batch) === selected).map(batchMentorId).filter(Boolean));
  const eligible = assigned.length ? assigned : mentors;
  const isCurrent = (mentor) => currentIds.has(String(getMentorId(mentor) ?? ""));
  return {
    mentors: [...eligible].sort((a, b) => Number(isCurrent(b)) - Number(isCurrent(a))),
    currentIds,
  };
};

const buildMentorOptions = (mentors, currentIds = new Set()) => [
  {
    value: "",
    label: mentors.length
      ? `Select mentor (${mentors.length} available)`
      : "No mentors available",
  },
  ...mentors
    .filter((mentor) => getMentorId(mentor) !== undefined && getMentorId(mentor) !== null)
    .map((mentor) => ({
      value: String(getMentorId(mentor)),
      label: `${getMentorLabel(mentor)} (#${getMentorId(mentor)})${currentIds.has(String(getMentorId(mentor))) ? " · teaches this course" : ""}`,
    })),
];

const formatDateParts = (value) => {
  if (!value) return { date: "-", time: "-" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: String(value), time: "-" };
  return {
    date: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  };
};

export default function BatchManagement({ createOnly = false, initialBatch = null, onClose, onCreated } = {}) {
  const navigate = useNavigate();
  const { can: canHrAction } = useHrPermissions();
  const { user, role } = useAuth();
  const organizationId = user?.organizationId ?? user?.OrganizationId
    ?? user?.organization?.organizationId ?? user?.organization?.id
    ?? localStorage.getItem('organization_id') ?? localStorage.getItem('organizationId');
  const isOrganizationAdmin = normalizeRole(user?.userRole ?? user?.role ?? role) === "org-admin";
  const canEditBatch = isOrganizationAdmin || canHrAction('batches', 'edit');
  const canDeleteBatch = isOrganizationAdmin || canHrAction('batches', 'delete');
  const [searchParams, setSearchParams] = useSearchParams();
  const [returnToDashboard, setReturnToDashboard] = useState(
    !createOnly && searchParams.get("create") === "true",
  );
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalLoading, setModalLoading] = useState(Boolean(initialBatch) && !isDemoSession());
  const [detailError, setDetailError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [mentorFilter, setMentorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(createOnly);
  const [mode, setMode] = useState(initialBatch ? "edit" : "create");
  const [selectedBatch, setSelectedBatch] = useState(initialBatch);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(() => initialBatch ? normalizeForm(initialBatch) : INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [exporting, setExporting] = useState(false);
  const [rosterCounts, setRosterCounts] = useState({});
  const [rosterLoading, setRosterLoading] = useState(false);
  const rosterRequestRef = useRef(0);

  const courseMap = useMemo(
    () =>
      new Map(
        courses.map((course) => [Number(course.courseId ?? course.id), course]),
      ),
    [courses],
  );

  const mentorMap = useMemo(
    () =>
      new Map(
        mentors.map((mentor) => [Number(getMentorId(mentor)), mentor]),
      ),
    [mentors],
  );

  // Student counts come from each batch's StudentBatch roster, the same source
  // the batch detail page lists. A count is a number once its roster loads,
  // undefined while it is loading and null when the roster request failed.
  const normalizedBatches = useMemo(() => batches.map((batch) => {
    const normalized = normalizeBatch(batch, courseMap, mentorMap);
    if (isDemoSession()) return normalized;
    const count = rosterCounts[String(normalized.batchId ?? "")];
    const studentsCount = typeof count === "number" ? count : rosterLoading ? undefined : null;
    return { ...normalized, studentsCount, enrolledStudents: studentsCount };
  }), [batches, courseMap, mentorMap, rosterCounts, rosterLoading]);

  const courseOptions = useMemo(() => buildCourseOptions(courses), [courses]);
  const availableMentors = useMemo(() => {
    const mentorById = new Map();

    mentors.filter(isActiveMentor).forEach((mentor) => {
      const mentorId = getMentorId(mentor);
      if (mentorId !== undefined && mentorId !== null) {
        mentorById.set(String(mentorId), mentor);
      }
    });

    batches.forEach((batch) => {
      const mentorId = batch.mentorId ?? batch.mentor?.mentorId ?? batch.mentor?.id;
      if (mentorId === undefined || mentorId === null || mentorById.has(String(mentorId))) return;
      mentorById.set(String(mentorId), {
        ...(batch.mentor || {}),
        mentorId,
        mentorName: batch.mentorName ?? batch.mentor?.mentorName ?? batch.mentor?.name,
      });
    });

    return Array.from(mentorById.values());
  }, [batches, mentors]);

  const courseMentors = useMemo(
    () => mentorsForCourse(form.courseId, availableMentors, batches),
    [availableMentors, batches, form.courseId],
  );
  const mentorsForSelectedCourse = courseMentors.mentors;

  const mentorOptions = useMemo(
    () => form.courseId
      ? buildMentorOptions(courseMentors.mentors, courseMentors.currentIds)
      : [{ value: "", label: "Select a course first" }],
    [form.courseId, courseMentors],
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.courseId ?? course.id) === String(form.courseId)),
    [courses, form.courseId],
  );
  const selectedMentor = useMemo(
    () => availableMentors.find((mentor) => String(getMentorId(mentor)) === String(form.mentorId)),
    [availableMentors, form.mentorId],
  );

  const resetView = () => {
    setPageNumber(1);
  };

  const filteredBatches = useMemo(() => {
    const q = normalizeSearchText(search);
    return normalizedBatches.filter((batch) => {
      const mentorNames = [batch.mentorName, batch.mentor?.mentorName, batch.mentor?.fullName,
        [batch.mentor?.firstName, batch.mentor?.lastName].filter(Boolean).join(' '),
        ...(Array.isArray(batch.mentors) ? batch.mentors.flatMap(mentor => [mentor.mentorName, mentor.fullName, [mentor.firstName, mentor.lastName].filter(Boolean).join(' '), mentor.name]) : []),
      ];
      const matchesQuery = !q || [batch.batchName, batch.batchCode, batch.courseName, ...mentorNames]
        .some(value => normalizeSearchText(value).includes(q));
      const matchesCourse = !courseFilter || String(batch.courseId ?? "") === courseFilter;
      const matchesMentor = !mentorFilter || String(batch.mentorId ?? "") === mentorFilter;
      const matchesStatus = !statusFilter || getEffectiveBatchStatus(batch) === statusFilter;
      return matchesQuery && matchesCourse && matchesMentor && matchesStatus;
    });
  }, [normalizedBatches, search, courseFilter, mentorFilter, statusFilter]);

  const derivedTotalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const currentPage = Math.min(pageNumber, derivedTotalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageRows = filteredBatches.slice(firstIndex, firstIndex + pageSize);
  const showingFrom = filteredBatches.length ? firstIndex + 1 : 0;
  const showingTo = Math.min(firstIndex + pageSize, filteredBatches.length);

  const { photos: mentorPhotos } = useProfilePhotos("mentor", pageRows.map((batch) => batch.mentorId));

  const courseFilterOptions = useMemo(
    () => [
      { value: "", label: "All Courses" },
      ...courses.map((course) => ({
        value: String(course.courseId ?? course.id),
        label: getCourseLabel(course),
      })),
    ],
    [courses],
  );
  const mentorFilterOptions = useMemo(
    () => [
      { value: "", label: "All Mentors" },
      ...availableMentors.map((mentor) => ({
        value: String(getMentorId(mentor)),
        label: getMentorLabel(mentor),
      })),
    ],
    [availableMentors],
  );
  // Only the statuses actually present in the data are offered, each labeled
  // with the app's own status text (see getBatchStatusLabel) rather than a
  // fixed guessed list.
  const statusFilterOptions = useMemo(() => {
    const seen = new Map();
    normalizedBatches.forEach((batch) => {
      const key = getEffectiveBatchStatus(batch);
      if (!seen.has(key)) seen.set(key, key[0].toUpperCase() + key.slice(1));
    });
    return [
      { value: "", label: "All Statuses" },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ];
  }, [normalizedBatches]);

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setMentorFilter("");
    setStatusFilter("");
    resetView();
  };
  const handleKpiClick = (key) => {
    setSearch("");
    setCourseFilter("");
    setMentorFilter("");
    setStatusFilter(key === "total" ? "" : key === "active" ? "active" : key === "upcoming" ? "upcoming" : "completed");
    resetView();
  };
  const goToPage = (nextPage) => {
    setPageNumber(Math.min(Math.max(1, nextPage), derivedTotalPages));
  };

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    const course = courses.find((item) => String(item.courseId ?? item.id) === String(courseId));
    const eligible = mentorsForCourse(courseId, availableMentors, batches);
    // Pre-select only an unambiguous choice: the sole eligible mentor, or the
    // one mentor already teaching this course. The others stay selectable.
    const teaching = eligible.mentors.filter((mentor) => eligible.currentIds.has(String(getMentorId(mentor))));
    const preselected = eligible.mentors.length === 1 ? eligible.mentors[0] : teaching.length === 1 ? teaching[0] : null;
    const existingBatchCount = batches.filter((batch) => batchCourseId(batch) === String(courseId)).length;

    setForm((current) => ({
      ...current,
      courseId,
      mentorId: preselected ? String(getMentorId(preselected)) : "",
      batchName: mode === "create" && course
        ? `${getCourseLabel(course)} ${existingBatchCount + 1}`
        : current.batchName,
    }));
    setFormErrors((current) => ({ ...current, courseId: "", mentorId: "", batchName: "" }));
  };
  const batchMetrics = useMemo(() => {
    const totalStudents = Array.isArray(students)
      ? students.length
      : normalizedBatches.reduce(
          (sum, batch) => sum + Number(batch.studentsCount || 0),
          0,
        );
    const activeBatches = normalizedBatches.filter(
      (batch) => getEffectiveBatchStatus(batch) === "active",
    ).length;
    const upcomingBatches = normalizedBatches.filter(
      (batch) => getEffectiveBatchStatus(batch) === "upcoming",
    ).length;

    return {
      totalStudents,
      activeBatches,
      upcomingBatches,
      completedBatches: normalizedBatches.filter((batch) => getEffectiveBatchStatus(batch) === "completed").length,
      cancelledBatches: normalizedBatches.filter((batch) => getEffectiveBatchStatus(batch) === "cancelled").length,
    };
  }, [normalizedBatches, students]);

  const loadRosterCounts = useCallback(async (rows) => {
    const requestId = rosterRequestRef.current + 1;
    rosterRequestRef.current = requestId;
    const batchIds = [...new Set(rows
      .map((batch) => batch?.batchId ?? batch?.id)
      .filter((id) => id != null && String(id).trim() !== "")
      .map(String))];
    setRosterLoading(true);
    const [results, organizationResult] = await Promise.all([
      Promise.allSettled(batchIds.map((batchId) => batchService.getStudents(batchId))),
      studentsApi.list().then(response => response.data ?? []).catch(() => []),
    ]);
    if (requestId !== rosterRequestRef.current) return;
    setRosterCounts(Object.fromEntries(batchIds.map((batchId, index) => [
      batchId,
      results[index].status === "fulfilled"
        ? reconcileBatchRoster(rows.find(row => String(row.batchId ?? row.id) === batchId), results[index].value, organizationResult).length
        : null,
    ])));
    setRosterLoading(false);
  }, []);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError("");
    if (isDemoSession()) {
      setBatches(DEMO_BATCHES);
      setTotalRecords(DEMO_BATCHES.length);
      setLoading(false);
      return;
    }
    try {
      // Organization batch counts are small. Load them all once and do
      // search/course/mentor/status filtering and pagination on the client
      // (the same pattern as the Students and Courses pages) so the Course
      // and Mentor filters — which the backend list endpoint has no
      // parameters for — stay correct across every page, not just the one
      // the server would have returned.
      const response = await batchService.getOrganizationBatches({
        pageNumber: 1,
        pageSize: 1000,
      });
      const rows = Array.isArray(response?.data) ? response.data : [];
      setBatches(rows);
      setTotalRecords(rows.length);
      // The edit-only dialog (createOnly) never shows the table.
      if (!createOnly) void loadRosterCounts(rows);
    } catch (requestError) {
      setBatches([]);
      setTotalRecords(0);
      setError(getApiErrorMessage(requestError, "Unable to load organization batches."));
    } finally {
      setLoading(false);
    }
  }, [createOnly, loadRosterCounts]);

  // Assigning or removing a student elsewhere in the app announces itself with
  // this event; reload the rosters so the counts follow.
  useEffect(() => {
    if (createOnly || isDemoSession()) return undefined;
    const refreshCounts = () => { void loadRosterCounts(batches); };
    window.addEventListener("kini:student-updated", refreshCounts);
    return () => window.removeEventListener("kini:student-updated", refreshCounts);
  }, [batches, createOnly, loadRosterCounts]);

  useEffect(() => {
    let active = true;

    const loadReferenceData = async () => {
      setReferenceLoading(true);
      if (isDemoSession()) {
        setCourses(DEMO_COURSES); setMentors(DEMO_MENTORS); setStudents(null); setReferenceLoading(false);
        return;
      }
      try {
        const [coursesResponse, mentorsResponse, employeesResponse, studentsResponse] = await Promise.allSettled([
          courseService.getCourses({
            organizationId: organizationId || undefined,
            page: 1,
            pageSize: 1000,
            sortBy: "CourseName",
            sortOrder: "asc",
          }),
          mentorService.getMentors({
            OrganizationId: organizationId || undefined,
            PageNumber: 1,
            PageSize: 1000,
            SortBy: "MentorName",
            IsDescending: false,
          }),
          employeeApi.list({ pageNumber: 1, pageSize: 1000 }),
          studentsApi.list(),
        ]);

        if (!active) return;

        setStudents(
          studentsResponse.status === "fulfilled"
            ? (studentsResponse.value?.data ?? [])
            : null,
        );

        const mentorRows = mentorsResponse.status === "fulfilled"
          ? (mentorsResponse.value?.data ?? mentorsResponse.value)
          : [];
        const employeeRows = employeesResponse.status === "fulfilled"
          ? (employeesResponse.value?.data ?? employeesResponse.value)
          : [];
        const allCourseRows = coursesResponse.status === "fulfilled"
          ? (coursesResponse.value.data ?? [])
          : [];
        // The course selector must represent the complete organization course
        // catalogue. Previously this list was restricted to courses already
        // linked to a mentor or an existing batch, so a new/unassigned course
        // could never be used while creating its first batch.
        setCourses((Array.isArray(allCourseRows) ? allCourseRows : []).filter(course => {
          const ownerId = course.organizationId ?? course.OrganizationId ?? course.organization?.id;
          return !organizationId || ownerId == null || String(ownerId) === String(organizationId);
        }));
        const mergedMentors = new Map();

        (Array.isArray(mentorRows) ? mentorRows : []).forEach((mentor) => {
          const mentorId = getMentorId(mentor);
          if (mentorId !== undefined && mentorId !== null) {
            mergedMentors.set(String(mentorId), mentor);
          }
        });

        // Employee rows only enrich an organization Mentor record (matched by
        // its EmployeeId or email). A mentor-role employee without a Mentor
        // record can't be assigned: the API would reject its employee ID.
        (Array.isArray(employeeRows) ? employeeRows : [])
          .filter(isMentorEmployee)
          .forEach((employee) => {
            const employeeId = employee.employeeId ?? employee.id;
            const employeeEmail = String(employee.email ?? "").trim().toLowerCase();
            const match = Array.from(mergedMentors.entries()).find(([, mentor]) =>
              (employeeId != null && mentor.employeeId != null && String(mentor.employeeId) === String(employeeId))
              || (employeeEmail && String(mentor.email ?? "").trim().toLowerCase() === employeeEmail),
            );
            if (!match) return;
            const [mapKey, existing] = match;
            mergedMentors.set(mapKey, {
              ...employee,
              ...existing,
              mentorId: getMentorId(existing),
              employeeId: existing.employeeId ?? employeeId,
              firstName: employee.firstName ?? existing?.firstName,
              lastName: employee.lastName ?? existing?.lastName,
              email: employee.email ?? existing?.email,
              mentorName: validMentorName(
                employee.mentorName,
                employee.fullName,
                employee.name,
                [employee.firstName, employee.lastName].filter(Boolean).join(" "),
                existing?.mentorName,
              ),
            });
          });

        setMentors(Array.from(mergedMentors.values()));

        if (!mergedMentors.size && mentorsResponse.status === "rejected") {
          toast.error(
            getApiErrorMessage(
              mentorsResponse.reason,
              "Unable to load mentors for batch assignment.",
            ),
            { id: "organization-batch-reference-error" },
          );
        }
      } finally {
        if (active) {
          setReferenceLoading(false);
        }
      }
    };

    void loadReferenceData();

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadBatches();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadBatches]);

  const resetForm = useCallback((batch = null) => {
    setForm(normalizeForm(batch || INITIAL_FORM));
    setFormErrors({});
  }, []);

  const initialBatchId = initialBatch?.batchId ?? initialBatch?.id;
  useEffect(() => {
    if (!createOnly || initialBatchId == null || isDemoSession()) return;
    const controller = new AbortController();
    setModalLoading(true);
    setDetailError("");
    batchService.getById(initialBatchId, { signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      const details = response?.data ?? response;
      setSelectedBatch(details);
      resetForm(details);
    }).catch(error => {
      if (!controller.signal.aborted) setDetailError(getApiErrorMessage(error, "Unable to load this batch. Close and reopen the form to retry."));
    }).finally(() => {
      if (!controller.signal.aborted) setModalLoading(false);
    });
    return () => controller.abort();
  }, [createOnly, initialBatchId, resetForm]);

  const openCreateModal = useCallback(() => {
    setMode("create");
    setSelectedBatch(null);
    resetForm(INITIAL_FORM);
    setIsModalOpen(true);
  }, [resetForm]);

  const closeBatchModal = useCallback(() => {
    if (saving) return;
    setIsModalOpen(false);
    setSelectedBatch(null);
    resetForm(INITIAL_FORM);
    if (createOnly) { onClose?.(); return; }
    if (returnToDashboard) {
      setReturnToDashboard(false);
      navigate("/organization/dashboard");
    }
  }, [navigate, resetForm, returnToDashboard, createOnly, onClose, saving]);

  useEffect(() => {
    if (createOnly || searchParams.get("create") !== "true") return;
    const timer = window.setTimeout(() => {
      openCreateModal();
      const next = new URLSearchParams(searchParams);
      next.delete("create");
      setSearchParams(next, { replace: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [openCreateModal, searchParams, setSearchParams, createOnly]);

  const openEditModal = async (batch) => {
    const batchId = batch?.batchId ?? batch?.id;
    setMode("edit");
    setIsModalOpen(true);
    setModalLoading(true);
    setSelectedBatch(batch);
    if (isDemoSession()) {
      const normalized = normalizeBatch(batch, courseMap, mentorMap);
      setSelectedBatch(normalized); resetForm(normalized); setModalLoading(false);
      return;
    }
    try {
      if (batchId === undefined || batchId === null) throw new Error("Batch ID is missing.");
      const response = await batchService.getById(batchId);
      const details = response?.data ?? response;
      const normalized = normalizeBatch(details, courseMap, mentorMap);
      setSelectedBatch(normalized);
      resetForm(normalized);
    } catch (err) {
      const fallback = normalizeBatch(batch, courseMap, mentorMap);
      setSelectedBatch(fallback);
      resetForm(fallback);
      toast.error(getApiErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const today = new Date().toISOString().slice(0, 10);
    const maximumDate = `${new Date().getFullYear() + 10}-12-31`;
    const isValidBatchDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
      && value >= "1900-01-01"
      && value <= maximumDate;

    if (!form.batchName.trim()) nextErrors.batchName = "Batch name is required";
    if (!String(form.courseId).trim())
      nextErrors.courseId = "Course is required";
    else if (!selectedCourse)
      nextErrors.courseId = "Select a course from your organization's available courses. The current course could not be verified.";
    if (!String(form.mentorId).trim())
      nextErrors.mentorId = "Mentor is required";
    else if (!mentorsForSelectedCourse.some(
      (mentor) => String(getMentorId(mentor)) === String(form.mentorId),
    ))
      nextErrors.mentorId = "Selected mentor is not assigned to this course";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    else if (!isValidBatchDate(form.startDate)) nextErrors.startDate = `Enter a valid start date no later than ${maximumDate}`;
    else if (mode === "create" && form.startDate < today) nextErrors.startDate = "Start date cannot be in the past";
    if (!form.endDate) nextErrors.endDate = "End date is required";
    else if (!isValidBatchDate(form.endDate)) nextErrors.endDate = `Enter a valid end date no later than ${maximumDate}`;
    if (!String(form.capacity).trim())
      nextErrors.capacity = "Capacity is required";
    else if (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) <= 0)
      nextErrors.capacity = "Maximum students must be a positive whole number";
    else if (Number(form.capacity) > DEFAULT_BATCH_CAPACITY)
      nextErrors.capacity = `Maximum ${DEFAULT_BATCH_CAPACITY} students are allowed per batch`;
    if (form.startTime && form.endTime && form.endTime <= form.startTime) nextErrors.endTime = "End time must be after start time";
    if (!form.status.trim()) nextErrors.status = "Status is required";

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end <= start
      ) {
        nextErrors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || modalLoading || detailError || referenceLoading) return;

    const action = mode === "edit" ? "update" : "create";
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      toast.error(`Couldn't ${action} the batch. Fix the highlighted fields and try again.`, { id: BATCH_SAVE_TOAST, duration: 6000 });
      return;
    }

    const selectedBatchId = selectedBatch?.batchId ?? selectedBatch?.id;
    // An edit must never fall through to "create" (that would add a duplicate batch).
    if (mode === "edit" && (selectedBatchId === undefined || selectedBatchId === null)) {
      toast.error("This batch could not be identified. Close the form, refresh and try again.", { id: BATCH_SAVE_TOAST, duration: 6000 });
      return;
    }

    const payload = toPayload(form);
    setSaving(true);

    try {
      if (isDemoSession()) {
        if (mode === "edit" && selectedBatchId !== undefined && selectedBatchId !== null) {
          const index = DEMO_BATCHES.findIndex((item) => String(item.batchId ?? item.id) === String(selectedBatchId));
          if (index >= 0) DEMO_BATCHES[index] = { ...DEMO_BATCHES[index], ...payload };
          toast.success("Demo batch updated successfully.");
        } else {
          DEMO_BATCHES.unshift({ ...payload, batchId: Date.now(), studentsCount: 0 });
          toast.success("Demo batch created successfully.");
        }
        setReturnToDashboard(false); setIsModalOpen(false); setSelectedBatch(null); resetForm(INITIAL_FORM); await loadBatches();
        if (createOnly) await onCreated?.();
        return;
      }
      // batchService throws on HTTP errors and on a 2xx body with success: false,
      // so reaching the toast means the API confirmed the save.
      if (mode === "edit") {
        await batchService.update(selectedBatchId, payload);
        toast.success("Batch updated successfully!", { id: BATCH_SAVE_TOAST, duration: 4000 });
      } else {
        await batchService.create(payload);
        toast.success("Batch created successfully!", { id: BATCH_SAVE_TOAST, duration: 4000 });
      }

      setReturnToDashboard(false);
      setIsModalOpen(false);
      setSelectedBatch(null);
      resetForm(INITIAL_FORM);
      await loadBatches();
      if (createOnly) await onCreated?.();
    } catch (err) {
      // The form stays open with the entered data so the user can correct it.
      const message = batchSaveErrorMessage(err, action);
      if (/selected course does not belong to your organization/i.test(message)) {
        setFormErrors(current => ({ ...current, courseId: "The server rejected this course's organization assignment. Select another organization course or ask your administrator to correct the assignment." }));
      }
      if (/selected mentor does not belong to your organization/i.test(message)) {
        setFormErrors(current => ({ ...current, mentorId: "The server didn't accept this mentor for your organization. Select another mentor, or add this person under Mentors first." }));
      }
      toast.error(message, { id: BATCH_SAVE_TOAST, duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      if (isDemoSession()) {
        const index = DEMO_BATCHES.findIndex((item) => item.batchId === deleteTarget.batchId);
        if (index >= 0) DEMO_BATCHES.splice(index, 1);
        toast.success("Demo batch deleted successfully."); setDeleteTarget(null); await loadBatches();
        return;
      }
      await batchService.deleteWithDetails(deleteTarget.batchId);
      toast.success("Batch deleted successfully.");
      setDeleteTarget(null);
      await loadBatches();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleExportReport = useCallback(async () => {
    if (!normalizedBatches.length) {
      toast.error("No batch data available to export.");
      return;
    }
    setExporting(true);
    try {
      if (!isDemoSession()) {
        const blob = await batchService.export({ search });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `batch-report-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast.success("Batch report exported successfully.");
        return;
      }

      // Demo mode has no backend, so keep the local CSV export available.
      const headers = [
        "Batch ID",
        "Batch Name",
        "Batch Code",
        "Course",
        "Mentor",
        "Students",
        "Start Date",
        "End Date",
        "Status",
      ];
      const escapeCsv = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

      const rows = normalizedBatches.map((batch) => {
        const startParts = formatDateParts(batch.startDate);
        const endParts = formatDateParts(batch.endDate);
        return [
          batch.batchId,
          escapeCsv(batch.batchName),
          escapeCsv(batch.batchCode),
          escapeCsv(batch.courseName),
          escapeCsv(batch.mentorName),
          batch.studentsCount ?? "",
          startParts.date,
          endParts.date,
          getBatchStatusLabel(getEffectiveBatchStatus(batch)),
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Batch report exported successfully.");
    } catch {
      toast.error("Unable to export batch report.");
    } finally {
      setExporting(false);
    }
  }, [normalizedBatches, search]);

  const pageButtons = buildPageWindow(currentPage, derivedTotalPages);
  const hasAnyBatches = normalizedBatches.length > 0;
  const isEmpty = !loading && !error && filteredBatches.length === 0;

  const footer =
    mode === "view" ? (
      <div className="flex justify-end">
        <Button variant="outline" onClick={closeBatchModal}>
          Close
        </Button>
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          variant="outline"
          onClick={closeBatchModal}
          disabled={saving || modalLoading}
        >
          Cancel
        </Button>
        <Button type="submit" form="batch-management-form" disabled={saving || modalLoading || Boolean(detailError) || referenceLoading}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {mode === "edit" ? "Update Batch" : "Create Batch"}
        </Button>
      </div>
    );

  return (
    <div className={createOnly ? undefined : "batch-management-page mx-auto w-full space-y-3 p-3 sm:px-4 sm:py-3"}>
      {!createOnly && <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE6F3] bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-bold text-[#12365B] dark:text-white">Batch Management</h1>
          <p className="text-sm text-[#5B78A0] dark:text-slate-400">Create and manage course batches, mentors, and schedules.</p>
        </div>
        <span aria-label="Batch header actions" className="v14-actions">
          <button type="button" onClick={loadBatches} disabled={loading} className="v14-btn">
            <RefreshCw className={loading ? "animate-spin" : undefined} aria-hidden="true" /> Refresh
          </button>
          <button type="button" data-page-new onClick={openCreateModal} className="v14-btn v14-btn--primary">
            <Plus aria-hidden="true" /> Add Batch
          </button>
        </span>
      </div>
      <OrgShowcaseHero
        variant="v14"
        badge={{ icon: Users, label: "Batch Management" }}
        title={["Batch", "Management"]}
        subtitle="Organize your course batches, assign mentors, track student progress and manage schedules effortlessly."
        features={[
          { icon: Users, label: ["Manage", "Batches"], tone: "blue" },
          { icon: UserCheck, label: ["Assign", "Mentors"], tone: "green" },
          { icon: CalendarDays, label: ["Track", "Schedules"], tone: "orange" },
          { icon: BarChart3, label: ["Monitor", "Progress"], tone: "purple" },
        ]}
        art={ORG_BANNERS.batches}
      />

      <div
        aria-label="Batch statistics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-4"
      >
        <KpiWaveCard
          decoration="bars"
          stat={{
            key: "total",
            label: "Total Batches",
            value: totalRecords,
            caption: "All course batches",
            icon: CalendarDays,
            tone: KPI_TONES.blue,
          }}
          onClick={() => handleKpiClick("total")}
        />
        <KpiWaveCard
          decoration="bars"
          stat={{
            key: "active",
            label: "Active Batches",
            value: batchMetrics.activeBatches,
            caption: `${totalRecords ? Math.round((batchMetrics.activeBatches / totalRecords) * 100) : 0}% of total`,
            captionColor: "#16A34A",
            icon: BarChart3,
            tone: KPI_TONES.green,
          }}
          onClick={() => handleKpiClick("active")}
        />
        <KpiWaveCard
          decoration="bars"
          stat={{
            key: "upcoming",
            label: "Upcoming Batches",
            value: batchMetrics.upcomingBatches,
            caption: `${totalRecords ? Math.round((batchMetrics.upcomingBatches / totalRecords) * 100) : 0}% of total`,
            captionColor: "#EA8A0B",
            icon: Clock3,
            tone: KPI_TONES.orange,
          }}
          onClick={() => handleKpiClick("upcoming")}
        />
        <KpiWaveCard
          decoration="bars"
          stat={{
            key: "completed",
            label: "Completed Batches",
            value: batchMetrics.completedBatches,
            caption: "Across all batches",
            icon: CircleCheck,
            tone: KPI_TONES.purple,
          }}
          onClick={() => handleKpiClick("completed")}
        />
      </div>

      <div className="grid gap-3 [&_select:focus-visible]:ring-2 [&_select:focus-visible]:ring-blue-400 rounded-[14px] border border-[#E2EAF5] bg-white p-3 shadow-[0_4px_18px_rgba(38,83,130,.05)] sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.7fr)_minmax(150px,.8fr)_minmax(150px,.8fr)_minmax(150px,.8fr)_auto] dark:border-slate-700 dark:bg-slate-900">
        <label className="relative min-w-0 rounded-[10px] border border-[#D8E4F1] bg-white sm:col-span-2 xl:col-span-1 dark:border-slate-600 dark:bg-slate-800">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#173F69] dark:text-slate-300" />
          <input
            aria-label="Search batches"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetView();
            }}
            placeholder="Search batches, course name or mentor..."
            className="h-[42px] w-full rounded-[10px] border-0 bg-transparent pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:text-white"
          />
        </label>
        <FilterSelect
          label="Course"
          value={courseFilter}
          onChange={(event) => {
            setCourseFilter(event.target.value);
            resetView();
          }}
          options={courseFilterOptions}
        />
        <FilterSelect
          label="Mentor"
          value={mentorFilter}
          onChange={(event) => {
            setMentorFilter(event.target.value);
            resetView();
          }}
          options={mentorFilterOptions}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            resetView();
          }}
          options={statusFilterOptions}
        />
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#D8E4F1] bg-white px-5 text-sm font-semibold text-[#173A63] transition hover:bg-[#F3F8FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <section className={`${LIST_TABLE_CARD_CLASS} osh-batches-table`}>
        <div className="flex flex-col gap-2 border-b border-[#EDF2F7] px-3 py-2.5 md:flex-row md:items-center md:justify-between dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-slate-600 xl:flex-nowrap dark:text-slate-300">
            <div className="osh-chips" role="group" aria-label="Filter batches by status">
              {[
                ["", "All", normalizedBatches.length, "blue"],
                ["active", "Active", batchMetrics.activeBatches, "green"],
                ["upcoming", "Upcoming", batchMetrics.upcomingBatches, "orange"],
                ["completed", "Completed", batchMetrics.completedBatches, "purple"],
                ["cancelled", "Cancelled", batchMetrics.cancelledBatches, "red"],
              ].map(([value, label, count, tone]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={statusFilter === value}
                  onClick={() => { setStatusFilter(value); resetView(); }}
                  className={`osh-chip osh-chip--${tone}`}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative rounded-[10px] border border-[#D8E4F1] bg-white dark:border-slate-600 dark:bg-slate-800">
              <select
                aria-label="Rows per page"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  resetView();
                }}
                className="h-9 cursor-pointer appearance-none rounded-[10px] border-0 bg-transparent pl-3 pr-8 text-[11px] font-semibold outline-none dark:text-white"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#174B7A] dark:text-slate-300" />
            </div>
            <button
              type="button"
              onClick={handleExportReport}
              disabled={loading || exporting || normalizedBatches.length === 0}
              title="Export Report as CSV"
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#D8E4F1] bg-white px-3 text-[11px] font-semibold text-[#0877F9] transition hover:bg-[#F3F8FE] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting..." : "Export Report"}
            </button>

          </div>
        </div>

        {loading ? (
          <div className="px-5 py-5">
            <TableSkeleton rows={5} columns={10} />
          </div>
        ) : error ? (
          <div className="px-5 py-6">
            <EmptyState icon={CircleAlert} title="Unable to load batches" description={error} />
          </div>
        ) : isEmpty ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={CalendarDays}
              title={hasAnyBatches ? "No batches match your filters" : "No batches found"}
              description={hasAnyBatches ? "Try a different search term or clear the filters." : "Create your first batch to get started."}
              action={hasAnyBatches ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
            />
          </div>
        ) : (
          <>
            <ListTable label="Batches" widths={BATCH_COLUMN_WIDTHS} minWidth={1040} layout="fixed">
              <ListTableHead>
                {["#", "Batch Name", "Batch Code", "Course", "Mentor", "Duration", "Students", "Status", "Actions"].map((label) => (
                  <ListTableHeaderCell key={label} compact={label === "#"} align={label === "Actions" ? "center" : "left"} className={label === "#" ? HEAD_TEXT : `${CELL_PAD} ${HEAD_TEXT}`}>
                    {label}
                  </ListTableHeaderCell>
                ))}
              </ListTableHead>
              <ListTableBody>
                    {pageRows.map((batch, index) => {
                      const normalizedStatus = getEffectiveBatchStatus(batch);
                      const statusLabel = normalizedStatus[0].toUpperCase() + normalizedStatus.slice(1);
                      return (
                        <ListTableRow
                          key={batch.batchId}
                          onClick={() => navigate(`/organization/batches/${batch.batchId}/details`)}
                        >
                          <ListTableCell compact className="text-[13px] font-medium text-[#5B78A0]">{firstIndex + index + 1}</ListTableCell>
                          <ListTableCell className={CELL_PAD}>
                            <div className="flex min-w-0 items-center gap-3">
                              <BatchAvatar name={batch.batchName} />
                              <div className="min-w-0">
                                <Link to={`/organization/batches/${batch.batchId}/details`} className="block max-w-[200px] truncate rounded text-[14px] font-semibold text-[#12365B] lg:!text-[13px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white" title={batch.batchName}>
                                  {batch.batchName || "-"}
                                </Link>
                              </div>
                            </div>
                          </ListTableCell>
                          <ListTableCell truncate={false} className={`${CELL_PAD} font-mono text-[13px] text-[#345D86] dark:text-slate-300`}>
                            {batch.batchCode || "—"}
                          </ListTableCell>
                          <ListTableCell className={CELL_PAD}>
                            <CourseTag name={batch.courseName} className="max-w-[220px] lg:!py-1 lg:!text-[12px]" />
                          </ListTableCell>
                          <ListTableCell className={CELL_PAD}>
                            <div className="flex min-w-0 items-center gap-2">
                              <MentorAvatar name={batch.mentorName} photoUrl={mentorPhotos[toProfileId(batch.mentorId)]} />
                              <p className="min-w-0 truncate text-[13px] font-semibold text-[#12365B] dark:text-white">
                                {batch.mentorName || "Not Assigned"}
                              </p>
                            </div>
                          </ListTableCell>
                          <ListTableCell className={`${CELL_PAD} text-[13px] font-medium text-[#345D86] dark:text-slate-300`}>
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays aria-hidden="true" className="h-4 w-4 text-[#315F91]" />
                              {batch.startDate && batch.endDate
                                ? `${Math.max(1, Math.round((new Date(batch.endDate) - new Date(batch.startDate)) / 86400000))} days`
                                : "—"}
                            </span>
                          </ListTableCell>
                          <ListTableCell className={CELL_PAD}>
                            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#345D86] dark:text-slate-300">
                              <Users aria-hidden="true" className="h-4 w-4 text-[#315F91]" />
                              {typeof batch.studentsCount === "number" ? batch.studentsCount
                                : batch.studentsCount === undefined
                                  ? <span aria-label="Loading student count" className="text-slate-400">…</span>
                                  : <span aria-label="Student count unavailable" title="This batch's student roster could not be loaded." className="text-slate-400">—</span>}
                            </span>
                          </ListTableCell>
                          <ListTableCell className={CELL_PAD}>
                            <BatchStatusPill normalized={normalizedStatus} label={statusLabel} />
                          </ListTableCell>
                          <ListTableCell truncate={false} className={CELL_PAD} onClick={(event) => event.stopPropagation()}>
                            <div className="flex justify-center">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/organization/batches/${batch.batchId}/details`}
                                  title="View batch"
                                  aria-label={`View ${batch.batchName}`}
                                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[#D8E4F1] bg-white text-[#133B5D] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  <Eye aria-hidden="true" className="h-4 w-4" />
                                </Link>
                                <BatchActionButtons name={batch.batchName} onEdit={canEditBatch ? () => openEditModal(batch) : undefined} onDelete={canDeleteBatch ? () => setDeleteTarget(batch) : undefined} />
                              </div>
                            </div>
                          </ListTableCell>
                        </ListTableRow>
                      );
                    })}
              </ListTableBody>
            </ListTable>

            <div className="flex flex-col gap-3 border-t border-[#EDF2F7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-700">
              <p className="text-[13px] text-[#5B78A0] dark:text-slate-400">
                Showing {showingFrom} to {showingTo} of {filteredBatches.length} batches
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className={`${PAGE_BUTTON_CLASS} ${PAGE_BUTTON_IDLE}`}
                >
                  <span className="inline-flex items-center gap-1"><ChevronLeft className="h-4 w-4" />Previous</span>
                </button>
                {pageButtons.map((pageValue) => (
                  <button
                    key={pageValue}
                    type="button"
                    aria-label={`Page ${pageValue}`}
                    aria-current={pageValue === currentPage ? "page" : undefined}
                    onClick={() => goToPage(pageValue)}
                    className={`${PAGE_BUTTON_CLASS} ${pageValue === currentPage ? "border-[#0877F9] bg-[#0877F9] text-white shadow-[0_4px_12px_rgba(8,119,249,.28)]" : PAGE_BUTTON_IDLE}`}
                  >
                    {pageValue}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === derivedTotalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className={`${PAGE_BUTTON_CLASS} ${PAGE_BUTTON_IDLE}`}
                >
                  <span className="inline-flex items-center gap-1">Next<ChevronRight className="h-4 w-4" /></span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      </>}
      <Modal
        open={isModalOpen}
        trapFocus
        ariaLabelledBy="batch-form-title"
        onClose={closeBatchModal}
        title={`${mode === "edit" ? "Edit" : mode === "view" ? "View" : "Add"} Batch`}
        description={
          mode === "view"
            ? "Batch details from the live backend."
            : "Configure the academic batch, mentor, capacity and class schedule."
        }
        size="lg"
        hero={
          <ModalHero
            titleId="batch-form-title"
            icon={Users}
            title={mode === "edit" ? "Edit" : mode === "view" ? "View" : "Add"}
            accent="Batch"
            subtitle={
              mode === "view"
                ? "Batch details from the live backend."
                : "Configure the academic batch, mentor, capacity and class schedule to organize your learning program."
            }
            art={ORG_BANNERS.addBatch.src}
            onClose={closeBatchModal}
          />
        }
        className="!w-[min(960px,calc(100vw-2rem))] !max-w-[960px] !min-h-0 !rounded-3xl !border-white/70 shadow-[0_32px_90px_-24px_rgba(15,23,42,0.5)] ring-1 ring-blue-500/10"
        headerClassName="!border-0 !bg-gradient-to-r !from-[#1746a2] !via-blue-600 !to-cyan-500 !px-6 !py-5 [&_h2]:!text-white [&_p]:!text-blue-50 [&_button]:!bg-white/15 [&_button]:hover:!bg-white/25 [&_button_svg]:!text-white"
        bodyClassName="!min-h-0 !overflow-y-auto !overscroll-contain !bg-white !p-5 sm:!p-6"
        footerClassName="!border-slate-200 !bg-white !px-6 !py-4"
        footer={
          mode === "view" ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeBatchModal}>
                Close
              </Button>
            </div>
          ) : (
            footer
          )
        }
      >
        {modalLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading batch details...
          </div>
        ) : (
          <form id="batch-management-form" onSubmit={handleSubmit} className="space-y-4">
            {detailError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{detailError}</p>}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)]">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Batch information</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Core academic and enrollment details</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Required fields</span>
              </div>
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                <span className="font-bold">How it works:</span> 1. Select Course → 2. Select an active Mentor → 3. Batch Name is generated automatically.
                Course ID and Mentor ID are sent to the backend; you do not need to type IDs manually.
              </div>
              <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
              <Select
                label="1. Select Course"
                value={form.courseId}
                onChange={handleCourseChange}
                options={courseOptions}
                error={formErrors.courseId}
                icon={BookOpen}
                required
                disabled={mode === "view" || saving || referenceLoading}
              />

              <Select
                label="2. Assigned Mentor"
                value={form.mentorId}
                onChange={(event) =>
                  setForm({ ...form, mentorId: event.target.value })
                }
                options={mentorOptions}
                error={formErrors.mentorId}
                icon={UserRound}
                required
                disabled={mode === "view" || saving || referenceLoading || !form.courseId || availableMentors.length === 0}
              />

              <Input
                label="3. Batch Name"
                value={form.batchName}
                onChange={(event) =>
                  setForm({ ...form, batchName: event.target.value })
                }
                placeholder="Generated after course selection"
                error={formErrors.batchName}
                icon={Layers3}
                required
                disabled={mode === "view" || saving || !form.courseId}
              />

              <Select
                label="Batch Type"
                value={form.batchType}
                onChange={(event) =>
                  setForm({ ...form, batchType: event.target.value })
                }
                options={BATCH_TYPE_OPTIONS}
                disabled={mode === "view" || saving}
              />

              <Select
                label="Batch Shift"
                value={form.shift}
                onChange={(event) => {
                  const shift = event.target.value;
                  setForm({ ...form, shift, ...(SHIFT_TIMES[shift] || {}) });
                }}
                options={BATCH_SHIFT_OPTIONS}
                disabled={mode === "view" || saving}
              />

              {form.courseId && (
                <div className="md:col-span-2 -mt-1 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Automatic assignment: </span>
                  {getCourseLabel(selectedCourse || {})} (Course ID: {form.courseId})
                  <span className="mx-2 text-blue-500">→</span>
                  {selectedMentor
                    ? `${getMentorLabel(selectedMentor)} (Mentor ID: ${form.mentorId})`
                    : mentorsForSelectedCourse.length
                      ? `${mentorsForSelectedCourse.length} assigned mentors available — select one`
                      : "No active mentors are available. Create or activate a mentor first."}
                </div>
              )}

              <Input
                label="Start Date"
                type="date"
                min={mode === "create" ? new Date().toISOString().slice(0, 10) : "1900-01-01"}
                max={`${new Date().getFullYear() + 10}-12-31`}
                value={form.startDate}
                onChange={(event) => {
                  const date = event.target.value;
                  if (date && date.split("-")[0].length > 4) return;
                  setForm({ ...form, startDate: date });
                  setFormErrors((current) => ({ ...current, startDate: "" }));
                }}
                error={formErrors.startDate}
                icon={CalendarRange}
                required
                disabled={mode === "view" || saving}
              />

              <Input
                label="End Date"
                type="date"
                min={form.startDate || new Date().toISOString().slice(0, 10)}
                max={`${new Date().getFullYear() + 10}-12-31`}
                value={form.endDate}
                onChange={(event) => {
                  const date = event.target.value;
                  if (date && date.split("-")[0].length > 4) return;
                  setForm({ ...form, endDate: date });
                  setFormErrors((current) => ({ ...current, endDate: "" }));
                }}
                error={formErrors.endDate}
                icon={CalendarRange}
                required
                disabled={mode === "view" || saving}
              />

              <Input
                label="Total Seats (Maximum Students)"
                type="number"
                min="1"
                max={DEFAULT_BATCH_CAPACITY}
                value={form.capacity}
                onChange={(event) => {
                  const value = event.target.value;
                  const capacity = value === "" ? "" : String(Math.min(DEFAULT_BATCH_CAPACITY, Math.max(1, Number(value) || 1)));
                  setForm({ ...form, capacity });
                  if (Number(value) > DEFAULT_BATCH_CAPACITY) {
                    setFormErrors((errors) => ({ ...errors, capacity: `Maximum ${DEFAULT_BATCH_CAPACITY} students are allowed per batch` }));
                  } else {
                    setFormErrors((errors) => ({ ...errors, capacity: "" }));
                  }
                }}
                error={formErrors.capacity}
                icon={Users}
                hint={`${form.capacity || DEFAULT_BATCH_CAPACITY} total seats in this batch · maximum allowed is ${DEFAULT_BATCH_CAPACITY}. The next batch is created automatically when full.`}
                required
                disabled={mode === "view" || saving}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                options={BATCH_STATUS_OPTIONS}
                error={formErrors.status}
                required
                disabled={mode === "view" || saving}
              />
              <label className="md:col-span-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Enter batch description"
                  rows={3}
                  disabled={mode === "view" || saving}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                />
              </label>
              </div>
            </section>
            {mode === "__legacy_schedule__" && <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)] dark:border-slate-700 dark:bg-slate-900">
              <legend className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-bold text-violet-800 dark:bg-violet-500/10 dark:text-violet-200">Class Schedule <span className="text-red-500">*</span></legend>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{[["Mon","Monday"],["Tue","Tuesday"],["Wed","Wednesday"],["Thu","Thursday"],["Fri","Friday"],["Sat","Saturday"],["Sun","Sunday"]].map(([short, day]) => <label key={day} className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.scheduleDays.includes(day)} disabled={mode === "view" || saving} onChange={() => setForm((current) => ({ ...current, scheduleDays: current.scheduleDays.includes(day) ? current.scheduleDays.filter((item) => item !== day) : [...current.scheduleDays, day] }))} />{short}</label>)}</div>
              {formErrors.scheduleDays && <p className="mt-2 text-xs text-red-600">{formErrors.scheduleDays}</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-3"><Input label="Start Time" type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} error={formErrors.startTime} required disabled={mode === "view" || saving} /><Input label="End Time" type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} error={formErrors.endTime} required disabled={mode === "view" || saving} /><div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration</p><p className="mt-1.5 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{form.startTime && form.endTime && form.endTime > form.startTime ? `${Math.round((new Date(`1970-01-01T${form.endTime}`) - new Date(`1970-01-01T${form.startTime}`)) / 60000)} Minutes` : "—"}</p></div></div>
            </fieldset>}
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Batch"
        description="This action cannot be undone."
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete Batch
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.batchName || "this batch"}</strong>?
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            This will permanently remove the batch record from the organization
            dashboard.
          </p>
        </div>
      </Modal>
    </div>
  );
}

