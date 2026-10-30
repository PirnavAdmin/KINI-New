import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { batchService } from "@shared/services/batchService";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Search,
  Users,
  X,
} from "lucide-react";
import FilterSelect from "@shared/components/FilterSelect";
import { ListTable, ListTableBody, ListTableCell, ListTableHead, ListTableHeaderCell, ListTableRow } from "@shared/components/ListTable";
import { LIST_TABLE_CARD_CLASS } from "@shared/components/listTableStyles";
import { useProfilePhotos } from "@shared/hooks/useProfilePhoto";
import { toProfileId } from "@shared/services/profilePhotoService";
import { StatusPill, StudentAvatar } from "./StudentBadges";
import { isPendingApprovalStudent } from "@shared/utils/studentApprovalStatus";
import { buildRosterIndex, enrollmentsOf } from "./studentCourseEnrollments";
import { avatarTone, getInitials, matchesStatus } from "./studentUi";
import EnrollmentsPopover from "./EnrollmentsPopover";
import useStudentAttendance from "./useStudentAttendance";

const studentPhotoId = (student) => toProfileId(student?.studentId ?? student?.id);

const ACTION_BUTTON_CLASS =
  "grid h-9.5 w-9.5 shrink-0 place-items-center rounded-[9px] border border-[#DCE6F3] bg-white text-[#123F6B] shadow-[0_2px_8px_rgba(38,83,130,.05)] transition hover:bg-[#F3F8FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
const CHECKBOX_CLASS = "h-4 w-4 cursor-pointer rounded accent-[#0877F9]";
const PAGE_BUTTON_CLASS =
  "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 disabled:cursor-not-allowed disabled:opacity-40";
const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
  { value: "At Risk", label: "At Risk" },
  { value: "On Leave", label: "On Leave" },
  { value: "Rejected", label: "Rejected" },
];
const PAGE_SIZES = [10, 25, 50];
// Fixed table layout with proportional widths (keyed by column id): control
// columns get pixels, the rest a share of the card by priority — Student and
// Email first, then Course/Batch, Mentor, Mobile, Attendance, Status. Email
// takes whatever remains. Every column fits the card at 1280px and up; long
// values are ellipsised and shown in full on hover (title).
const COLUMN_WIDTHS = {
  select: "34px",
  rowNumber: "34px",
  name: "15%",
  mobile: "8.5%",
  course: "12%",
  batch: "11.5%",
  mentorName: "12%",
  attendance: "8.5%",
  status: "7%",
  actions: "64px",
};
const TEXT_CAP = "block truncate";

/**
 * The student's first enrollment record (course, batch or mentor column), so
 * every row is one line high and a row's course, batch and mentor always come
 * from the same record. The course column adds "+N more", which opens every
 * course/batch/mentor assignment in a popover.
 */
function PrimaryEnrollment({ enrollments, field, tone, onMore }) {
  if (!enrollments.length) return <span className="students-muted">{field === "mentor" ? "Unassigned" : "Not assigned"}</span>;
  const [first] = enrollments;
  const value = first[field];
  const hidden = enrollments.length - 1;
  let content;
  if (tone) {
    content = <span className={`students-chip-cell osh-pill osh-pill--${tone}`} title={value}>{value || "Not assigned"}</span>;
  } else if (field === "mentor") {
    if (!value) return <span className="students-muted">Unassigned</span>;
    const avatar = avatarTone(value);
    content = (
      <span className="students-mentor" title={value}>
        <span aria-hidden="true" className="students-mentor__initials" style={{ backgroundColor: avatar.bg, color: avatar.fg }}>{getInitials(value)}</span>
        <span className="students-mentor__name">{value}</span>
      </span>
    );
  } else {
    content = <span className={TEXT_CAP} title={value || "Not assigned"}>{value || "Not assigned"}</span>;
  }
  if (!onMore || hidden <= 0) return content;
  return (
    <span className="students-enrollment-cell">
      {content}
      <button
        type="button"
        data-enrollments-trigger
        aria-haspopup="dialog"
        aria-label={`+${hidden} more: show all ${enrollments.length} course enrollments`}
        title={enrollments.map((item) => `${item.course} → ${item.batch || "Not assigned"}`).join("\n")}
        onClick={(event) => { event.stopPropagation(); onMore(event.currentTarget.getBoundingClientRect()); }}
        className="students-more"
      >
        +{hidden}<span className="students-more__word"> more</span>
      </button>
    </span>
  );
}
function AttendanceMeter({ percentage, title, tone }) {
  const low = percentage < 60;
  return (
    <span className="students-attendance" title={title}>
      <span className={`students-attendance__value ${low ? "text-[#E11D48]" : "text-[#173A63] dark:text-slate-200"}`}>
        {percentage}%{tone === "unconfirmed" && <sup aria-hidden="true">*</sup>}
      </span>
      <span className="students-attendance__bar" aria-hidden="true">
        <span className={low ? "bg-[#F43F5E]" : "bg-[#10B981]"} style={{ width: `${Math.max(0, Math.min(100, Number(percentage)))}%` }} />
      </span>
    </span>
  );
}

/**
 * Attendance from the student's attendance records (as on Student Details):
 * a real percentage, "Not recorded" when there are no records (never a fake
 * 0%), and — only if the records request failed — the value on the student
 * record, marked as unconfirmed.
 */
function AttendanceCell({ record, listValue }) {
  if (!record || record.status === "loading") {
    return <span className="students-attendance is-loading" aria-label="Loading attendance"><span className="students-attendance__bar" /></span>;
  }
  if (record.status === "ready") {
    if (!record.summary) return <span className="students-not-recorded" title="No attendance has been recorded for this student yet.">Not recorded</span>;
    const { percentage, attended, total } = record.summary;
    return <AttendanceMeter percentage={percentage} title={`${attended} of ${total} classes attended`} />;
  }
  if (listValue != null) {
    return <AttendanceMeter percentage={listValue} tone="unconfirmed" title={`${listValue}% from the student record — attendance records could not be loaded`} />;
  }
  return <span className="students-not-recorded" title="Attendance records could not be loaded.">Unavailable</span>;
}

// Snug columns (number, badges, attendance) need less inline padding than
// the text columns; the checkbox column keeps ListTable's compact padding.
const SNUG_COLUMNS = new Set(["rowNumber", "course", "batch", "attendance", "status"]);
const columnPadding = (id) => (id === "select" ? "" : SNUG_COLUMNS.has(id) ? "px-1.5!" : "px-2!");

function ConfirmDialog({ student, mode, onClose, onConfirm }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  if (!student) return null;
  const deleting = mode === "delete";
  const allowed = !deleting || text === student.name;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close confirmation"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-slate-900">
          {deleting
            ? "Delete student permanently?"
            : "Deactivate student account?"}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {deleting
            ? `This removes ${student.name} and their linked records. This action cannot be undone.`
            : `${student.name} will lose access until the account is reactivated.`}
        </p>
        {deleting && (
          <label className="mt-4 block text-xs font-semibold text-slate-700">
            Type <span className="text-red-600">{student.name}</span> to confirm
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </label>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!allowed || submitting}
            onClick={async () => {
              setSubmitting(true);
              setError("");
              try {
                await onConfirm();
              } catch (requestError) {
                setError(requestError?.message || "Unable to update the student. Please try again.");
                setSubmitting(false);
              }
            }}
            className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {submitting ? (deleting ? "Deleting..." : "Deactivating...") : (deleting ? "Delete student" : "Deactivate")}
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default function StudentList({
  students,
  initialStatus = "All",
  onEdit,
  onView,
  onDelete,
  onDeactivate,
  notify,
  onAssignBatch,
  onSendInvoiceEmail,
  onStudentsChange,
  onRowsChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All batches");
  const [sorting, setSorting] = useState([]);
  const [selection, setSelection] = useState({});
  // Most organizations currently have fewer than 25 students. Showing 25 by
  // default keeps the roster consistent with the total card instead of making
  // a 17-student roster look like it only contains 10 records.
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [menu, setMenu] = useState(null);
  useEffect(() => { setMenu(null); }, [location, query, course, status, batch, pagination.pageIndex]);
  useEffect(() => {
    if (!menu) return undefined;
    const outside = event => { if (!event.target.closest('[data-student-actions]')) setMenu(null); };
    const escape = event => { if (event.key === 'Escape') setMenu(null); };
    const close = () => setMenu(null);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [menu]);
  const [confirm, setConfirm] = useState(null);
  const [bulkDialog, setBulkDialog] = useState(null);
  const [bulkValue, setBulkValue] = useState("");
  const [operation, setOperation] = useState(null);
  const operationRef = useRef(null);
  const [overrides, setOverrides] = useState({});
  const [organizationBatches, setOrganizationBatches] = useState([]);
  // Students added to each batch (GET /api/StudentBatch/{batchId}/students):
  // one request per batch gives every student's further courses.
  const [rosters, setRosters] = useState([]);
  // { student, anchor } for the "+N more" / "View enrollments" popover.
  const [enrollmentView, setEnrollmentView] = useState(null);
  const closeEnrollments = useCallback(() => setEnrollmentView(null), []);
  useEffect(() => { setEnrollmentView(null); }, [location, query, course, status, batch, pagination.pageIndex]);

  useEffect(() => {
    setStatus(initialStatus);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [initialStatus]);

  useEffect(() => {
    let active = true;
    batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 })
      .then((response) => {
        if (active) setOrganizationBatches(response?.data || []);
      })
      .catch(() => {
        if (active) setOrganizationBatches([]);
      });
    return () => { active = false; };
  }, []);

  // Reloaded with the student list, so a newly added course shows right away.
  useEffect(() => {
    if (!organizationBatches.length) return undefined;
    let active = true;
    Promise.allSettled(organizationBatches.map((item) => batchService.getStudents(item.batchId ?? item.id)))
      .then((results) => {
        if (!active) return;
        setRosters(results.flatMap((result, index) => (result.status === "fulfilled"
          ? [{ batchId: organizationBatches[index].batchId ?? organizationBatches[index].id, students: result.value.students }]
          : [])));
      });
    return () => { active = false; };
  }, [organizationBatches, students]);

  useEffect(() => {
    if (!operation?.done || operation.failed?.length) return undefined;
    const timer = window.setTimeout(() => setOperation(null), 1400);
    return () => window.clearTimeout(timer);
  }, [operation?.done, operation?.failed?.length]);

  useEffect(() => {
    if (!operation?.done) return undefined;
    const closeOutside = (event) => {
      if (!operationRef.current?.contains(event.target)) setOperation(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOperation(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [operation?.done]);

  const rosterIndex = useMemo(() => buildRosterIndex(organizationBatches, rosters), [organizationBatches, rosters]);
  const displayStudents = useMemo(
    () => students.map((student) => {
      const merged = { ...student, ...overrides[student.id] };
      return { ...merged, enrollments: enrollmentsOf(merged, rosterIndex, organizationBatches) };
    }),
    [organizationBatches, overrides, rosterIndex, students],
  );


  const searchTerm = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      displayStudents.filter((student) => {
        // Only real values are searched (a missing email must not match "null").
        const matchesQuery = !searchTerm || [student.name, student.email, student.mobile ?? student.phone ?? student.mobileNumber, student.studentId]
          .filter((value) => value !== undefined && value !== null && value !== "")
          .some((value) => String(value).toLowerCase().includes(searchTerm));
        return (
          matchesQuery &&
          (status === "All" || (status === "Pending" ? isPendingApprovalStudent(student) : matchesStatus(student.status, status))) &&
          // Course and batch must describe the same enrollment.
          ((course === "All" && batch === "All batches") || student.enrollments.some((item) =>
            (course === "All" || item.course === course) &&
            (batch === "All batches" || item.batch === batch)))
        );
      }),
    [batch, course, displayStudents, searchTerm, status],
  );

  // Summary and Export use precisely the same filtered rows as pagination.
  useEffect(() => { onRowsChange?.(filtered); }, [filtered, onRowsChange]);

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [batch, course, query, status, students.length]);

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            aria-label="Select all students"
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            aria-label={`Select ${row.original.name}`}
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        // v14 — the design shows a running number; the student ID stays
        // searchable and is shown on the profile page.
        id: "rowNumber",
        header: "#",
        enableSorting: false,
        cell: ({ row, table: instance }) => {
          const { pageIndex, pageSize } = instance.getState().pagination;
          const position = instance.getRowModel().rows.findIndex((item) => item.id === row.id);
          return <span className="font-semibold text-[#5E7089]">{pageIndex * pageSize + position + 1}</span>;
        },
      },
      {
        accessorKey: "name",
        header: "Student",
        // studentPhotos is passed into the cell context at render time (see flexRender below).
        cell: ({ row, studentPhotos }) => (
          <div className="flex min-w-0 items-center gap-2">
            <StudentAvatar name={row.original.name} photoUrl={studentPhotos?.[studentPhotoId(row.original)]} className="students-avatar h-7 w-7 shrink-0 text-[10px]" />
            <button
              type="button"
              onClick={() => onView(row.original)}
              title={row.original.name || "Unnamed student"}
              className="students-name min-w-0 flex-1 text-left text-[13px] font-semibold text-[#12365B] transition-colors hover:text-[#0877F9] dark:text-white"
            >
              {row.original.name || "Unnamed student"}
            </button>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { cellClassName: "text-[#4D7198]" },
        cell: ({ getValue }) => <span className={TEXT_CAP} title={getValue() || undefined}>{getValue() || "—"}</span>,
      },
      {
        accessorKey: "mobile",
        // Short visible label so it never runs into Course; full name for assistive tech.
        header: () => <span title="Mobile number"><span aria-hidden="true">Mobile</span><span className="sr-only">Mobile number</span></span>,
        cell: ({ row }) => row.original.mobile || row.original.phone || row.original.mobileNumber || <span className="students-muted">—</span>,
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => (
          <PrimaryEnrollment
            enrollments={row.original.enrollments}
            field="course"
            tone="blue"
            onMore={(anchor) => setEnrollmentView((current) => current?.student.id === row.original.id ? null : { student: row.original, anchor })}
          />
        ),
      },
      {
        accessorKey: "batch",
        header: "Batch",
        cell: ({ row }) => <PrimaryEnrollment enrollments={row.original.enrollments} field="batch" tone="orange" />,
      },
      {
        accessorKey: "mentorName",
        header: "Mentor",
        // Each course's own batch mentor, aligned with the course column.
        cell: ({ row }) => <PrimaryEnrollment enrollments={row.original.enrollments} field="mentor" />,
      },
      {
        accessorKey: "attendance",
        header: "Attendance",
        // studentAttendance (records per visible student) is passed into the
        // cell context at render time, like studentPhotos.
        cell: ({ row, getValue, studentAttendance }) => (
          <AttendanceCell
            record={studentAttendance?.[String(row.original.studentId ?? row.original.id)]}
            listValue={getValue()}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusPill status={getValue()} className="students-status-pill" />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label={`Actions for ${row.original.name}`}
              title="More actions"
              data-student-actions
              aria-haspopup="menu"
              aria-expanded={menu?.id === row.original.id}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                // Keep the portal next to the clicked row. The previous 300px
                // estimate pushed the menu much farther upward than its real
                // height, making it cover the KPI/hero section.
                const menuHeight = 292;
                const menuWidth = 200;
                const gap = 6;
                const top = rect.bottom + menuHeight + gap <= window.innerHeight
                  ? rect.bottom + gap
                  : Math.max(8, rect.top - menuHeight - gap);
                setMenu((current) => current?.id === row.original.id ? null : {
                  id: row.original.id,
                  left: Math.min(
                    Math.max(8, rect.right - menuWidth),
                    Math.max(8, window.innerWidth - menuWidth - 8),
                  ),
                  top,
                });
              }}
              className={ACTION_BUTTON_CLASS}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menu?.id === row.original.id && createPortal(
              <div role="menu" aria-label="Student actions" data-student-actions className="students-menu" style={{ left: menu.left, top: menu.top }}>
                {[
                  ["View student", () => onView(row.original)],
                  ["Edit student", () => onEdit(row.original)],
                  ["View enrollments", (anchor) => setEnrollmentView({ student: row.original, anchor })],
                  ["Assign course & batch", () => onAssignBatch?.(row.original)],
                  ["View attendance", () => navigate(`/organization/students/${encodeURIComponent(row.original.studentId ?? row.original.id)}?tab=Attendance`)],
                  ["View progress", () => navigate(`/organization/students/${encodeURIComponent(row.original.studentId ?? row.original.id)}?tab=Progress`)],
                  ["Send invoice email", () => onSendInvoiceEmail?.(row.original)],
                  // Destructive: opens the type-the-name confirmation first.
                  ["Delete student", () => setConfirm({ student: row.original, mode: "delete" })],
                ].map(([label, action]) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    data-enrollments-trigger={label === "View enrollments" || undefined}
                    onClick={(event) => {
                      const anchor = event.currentTarget.closest("[role=menu]").getBoundingClientRect();
                      setMenu(null);
                      action({ left: anchor.left - 150, top: anchor.top, bottom: anchor.top });
                    }}
                    className={`students-menu__item${label === "Delete student" ? " is-danger" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>,
              document.body,
            )}
          </div>
        ),
      },
    ],
    [menu, navigate, onAssignBatch, onEdit, onSendInvoiceEmail, onView],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection: selection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  // Only the students on the current page need photos — one batch request per page.
  const { photos: studentPhotos } = useProfilePhotos(
    "student",
    table.getRowModel().rows.map((row) => row.original.studentId ?? row.original.id),
  );
  // Attendance records for the visible page only (no bulk endpoint exists);
  // refetched when the roster itself is reloaded.
  const studentAttendance = useStudentAttendance(
    table.getRowModel().rows.map((row) => row.original.studentId ?? row.original.id),
    students,
  );
  const selectedCount = table.getSelectedRowModel().rows.length;
  const courses = [...new Set(displayStudents.flatMap((item) => item.enrollments.map((entry) => entry.course)))];
  const batches = useMemo(() => {
    const labels = organizationBatches
      .map((item) => item.batchName ?? item.name)
      .filter(Boolean);
    return [...new Set([
      ...labels,
      ...displayStudents
        .flatMap((item) => item.enrollments.map((entry) => entry.batch))
        .filter((item) => item && item !== "Not assigned" && item !== "—"),
    ])];
  }, [displayStudents, organizationBatches]);
  const clear = () => {
    setQuery("");
    setStatus("All");
    setCourse("All");
    setBatch("All batches");
  };
  const activeFilters = [searchTerm, status !== "All", course !== "All", batch !== "All batches"].filter(Boolean).length;
  const emptyState = filtered.length === 0 && (
    <div className="students-empty" role="status">
      <span className="students-empty__icon" aria-hidden="true"><Users /></span>
      {students.length === 0 ? (
        <>
          <p className="students-empty__title">No students yet</p>
          <p className="students-empty__text">Students you add or approve appear here.</p>
        </>
      ) : (
        <>
          <p className="students-empty__title">No students match {searchTerm ? <>“{query.trim()}”</> : "these filters"}</p>
          <p className="students-empty__text">
            {[status !== "All" && `Status: ${status}`, course !== "All" && `Course: ${course}`, batch !== "All batches" && `Batch: ${batch}`].filter(Boolean).join(" · ") || "Try a different name, email or mobile number."}
          </p>
          <button type="button" onClick={clear} className="students-empty__action">Clear filters</button>
        </>
      )}
    </div>
  );
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = pagination.pageIndex + 1;
  const pageWindow = (() => {
    const windowSize = 5;
    if (pageCount <= windowSize) return Array.from({ length: pageCount }, (_, index) => index + 1);
    const start = Math.min(Math.max(1, currentPage - 2), pageCount - windowSize + 1);
    return Array.from({ length: windowSize }, (_, index) => start + index);
  })();
  const showingFrom = filtered.length ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const showingTo = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filtered.length);

  const selectedStudents = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const exportSelected = () => {
    const headers = ["Student", "ID", "Email", "Mobile", "Course", "Batch", "Mentor", "Status"];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      headers.join(","),
      ...selectedStudents.map((student) =>
        [student.name, student.studentId, student.email, student.mobile, student.enrollments.map((item) => item.course).join("; "), student.enrollments.map((item) => item.batch).join("; "), student.enrollments.map((item) => item.mentor || "Unassigned").join("; "), student.status]
          .map(escape)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected-students.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify(`${selectedCount} student records exported`);
  };

  const runBulkOperation = async () => {
    if (!bulkDialog || !bulkValue) return;
    const chosen = selectedStudents;
    const selectedBatch = bulkDialog === "batch"
      ? organizationBatches.find((item) => (item.batchName ?? item.name) === bulkValue)
      : null;
    if (bulkDialog === "batch" && !(selectedBatch?.batchId ?? selectedBatch?.id)) {
      notify("The selected batch is unavailable. Please refresh and try again.");
      return;
    }
    setOperation({
      label: bulkDialog === "batch" ? "Assigning batch" : bulkDialog === "notify" ? "Sending notifications" : "Updating status",
      total: chosen.length,
      completed: 0,
      failed: [],
    });
    const failed = [];
    const nextOverrides = {};
    const assignBatchToStudent = student => batchService.assignStudents({ studentId: student.studentId ?? student.id, batchId: selectedBatch.batchId ?? selectedBatch.id });
    for (let index = 0; index < chosen.length; index += 1) {
      const student = chosen[index];
      try {
        if (bulkDialog === "batch") {
          await assignBatchToStudent(student);
        }
        if (bulkDialog !== "notify") {
          nextOverrides[student.id] =
            bulkDialog === "batch" ? { batch: bulkValue } : { status: bulkValue };
        }
      } catch (requestError) {
        failed.push({
          name: student.name,
          reason: requestError?.response?.data?.message ?? requestError?.message ?? "Unable to update this student",
        });
      }
      setOperation((current) => ({
        ...current,
        completed: index + 1,
        failed: [...failed],
      }));
    }
    setOverrides((current) => ({ ...current, ...nextOverrides }));
    onStudentsChange?.(nextOverrides);
    setSelection({});
    setBulkDialog(null);
    setBulkValue("");
    setOperation((current) => ({ ...current, done: true }));
  };

  return (
    <div className="students-list-stack min-w-0 space-y-2.5">
      {status === "At Risk" && (
        <div className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200">
          <span>
            <strong>At-risk students</strong> · Showing students who need
            intervention.
          </span>
          <button
            type="button"
            onClick={() => setStatus("All")}
            className="font-semibold text-orange-700 hover:underline dark:text-orange-300"
          >
            Show all students
          </button>
        </div>
      )}
      <div className="students-filter-bar grid gap-3 rounded-[14px] border border-[#E0E9F3] bg-white p-3 shadow-[0_4px_18px_rgba(38,83,130,.05)] sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.7fr)_minmax(140px,.7fr)_minmax(150px,.8fr)_minmax(170px,.9fr)_auto] dark:border-slate-700 dark:bg-slate-900">
        <label className="relative min-w-0 rounded-[10px] border border-[#D8E4F1] bg-white sm:col-span-2 xl:col-span-1 dark:border-slate-600 dark:bg-slate-800">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#174B7A] dark:text-slate-300"
          />
          <input
            aria-label="Search students"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, mobile number..."
            className="h-[42px] w-full rounded-[10px] border-0 bg-transparent pl-10 pr-3 text-sm outline-none dark:text-white"
          />
        </label>
        <FilterSelect
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={STATUS_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Course"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          options={[
            { value: "All", label: "All Courses" },
            ...courses.map((item) => ({ value: item, label: item })),
          ]}
        />
        <FilterSelect
          label="Batch"
          value={batch}
          onChange={(event) => setBatch(event.target.value)}
          options={[
            { value: "All batches", label: "All Batches" },
            ...batches.map((item) => ({ value: item, label: item })),
          ]}
        />
        <button
          type="button"
          onClick={clear}
          disabled={!activeFilters}
          className="students-clear inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#D8E4F1] bg-white px-4 text-sm font-semibold text-[#173A63] transition hover:bg-[#F3F8FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <Filter className="h-4 w-4" />
          Clear Filters
          {activeFilters > 0 && <span className="students-clear__count" aria-label={`${activeFilters} active`}>{activeFilters}</span>}
        </button>
      </div>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#053662] px-4 py-3 text-white shadow-[0_8px_24px_rgba(5,54,98,.22)]">
          <span className="mr-auto text-sm font-semibold">
            {selectedCount} selected
          </span>
          {["Assign batch", "Change status", "Notify", "Export"].map(
            (label) => (
              <button
                key={label}
                onClick={() => {
                  if (label === "Assign batch") setBulkDialog("batch");
                  else if (label === "Change status") setBulkDialog("status");
                  else if (label === "Notify") setBulkDialog("notify");
                  else exportSelected();
                }}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              >
                {label}
              </button>
            ),
          )}
        </div>
      )}
      <div className="space-y-2 md:hidden">
        {emptyState}
        {table.getRowModel().rows.map((row) => {
          const student = row.original;
          return (
            <article
              key={row.id}
              className="rounded-[16px] border border-[#E2EAF5] bg-white p-3 shadow-[0_4px_18px_rgba(38,83,130,.06)] dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start gap-3">
                <input
                  aria-label={`Select ${student.name}`}
                  type="checkbox"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  className={`mt-1 ${CHECKBOX_CLASS}`}
                />
                <button
                  onClick={() => onView(student)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <StudentAvatar name={student.name} photoUrl={studentPhotos[studentPhotoId(student)]} className="h-9 w-9 text-xs" />
                  <span className="min-w-0">
                    <b className="block truncate text-sm text-[#12365B] dark:text-white">
                      {student.name}
                    </b>
                    <span className="block truncate text-xs text-[#5B78A0] dark:text-slate-400">
                      {student.studentId}
                    </span>
                  </span>
                </button>
                <StatusPill status={student.status} className="shrink-0" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#EDF2F7] pt-3 text-xs dark:border-slate-800">
                <div>
                  <dt className="text-[#7C93AE]">Mobile Number</dt><dd className="mt-0.5 font-medium text-[#173A63]">{student.mobile || student.phone || student.mobileNumber || "—"}</dd></div>
                <div className="col-span-2">
                  <dt className="text-[#7C93AE]">Course · Batch</dt>
                  <dd className="mt-1 flex flex-col gap-1">
                    {student.enrollments.length ? student.enrollments.map((item) => (
                      <span key={`${item.batchId ?? item.course}-pair`} className="students-enrollments__pair">
                        <span className="osh-pill osh-pill--blue">{item.course}</span>
                        <span className="osh-pill osh-pill--orange">{item.batch || "Not assigned"}</span>
                      </span>
                    )) : <span className="font-medium text-[#8a9bb2]">Not assigned</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#7C93AE]">Attendance</dt>
                  <dd className="mt-1">
                    <AttendanceCell record={studentAttendance[String(student.studentId ?? student.id)]} listValue={student.attendance} />
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
      <div className={`hidden md:block ${LIST_TABLE_CARD_CLASS}`}>
        <ListTable
          label="Students"
          widths={table.getVisibleLeafColumns().map((column) => COLUMN_WIDTHS[column.id])}
          minWidth={1060}
          layout="fixed"
          headerStyle="plain"
        >
          {table.getHeaderGroups().map((group) => (
            <ListTableHead key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const alwaysShowSort = false;
                return (
                  <ListTableHeaderCell
                    key={header.id}
                    compact={header.column.id === "select"}
                    align={header.column.id === "actions" ? "center" : "left"}
                    className={`students-th students-th--${header.column.id} whitespace-nowrap ${columnPadding(header.column.id)}`}
                    ariaSort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="group/sort inline-flex items-center gap-1.5 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown
                          aria-hidden="true"
                          className={`h-3 w-3 shrink-0 ${sorted || alwaysShowSort ? "opacity-100" : "hidden group-hover/sort:block group-focus-visible/sort:block"}`}
                        />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </ListTableHeaderCell>
                );
              })}
            </ListTableHead>
          ))}
          <ListTableBody>
            {table.getRowModel().rows.map((row) => (
              <ListTableRow key={row.id} selected={row.getIsSelected()}>
                {row.getVisibleCells().map((cell) => (
                  <ListTableCell
                    key={cell.id}
                    compact={cell.column.id === "select"}
                    truncate={cell.column.id !== "actions"}
                    title={["string", "number"].includes(typeof cell.getValue()) ? String(cell.getValue()) : undefined}
                    className={`text-[13px] font-medium dark:text-slate-300 ${columnPadding(cell.column.id)} ${cell.column.columnDef.meta?.cellClassName ?? "text-[#173A63]"}`}
                  >
                    {flexRender(cell.column.columnDef.cell, { ...cell.getContext(), studentPhotos, studentAttendance })}
                  </ListTableCell>
                ))}
              </ListTableRow>
            ))}
          </ListTableBody>
        </ListTable>
        {emptyState}
        <footer className="students-table-footer flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF2F7] px-5 py-4 text-[13px] text-[#5B78A0] dark:border-slate-700 dark:text-slate-400">
          <span>
            Showing {showingFrom} to {showingTo} of {filtered.length} students
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className={`${PAGE_BUTTON_CLASS} border-[#DCE6F3] bg-white text-[#173A63] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageWindow.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                onClick={() => table.setPageIndex(pageNumber - 1)}
                className={`${PAGE_BUTTON_CLASS} ${pageNumber === currentPage ? "border-[#0877F9] bg-[#0877F9] text-white shadow-[0_4px_12px_rgba(8,119,249,.28)]" : "border-[#DCE6F3] bg-white text-[#173A63] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className={`${PAGE_BUTTON_CLASS} border-[#DCE6F3] bg-white text-[#173A63] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="relative ml-1 rounded-lg border border-[#DCE6F3] bg-white dark:border-slate-600 dark:bg-slate-800">
              <select
                aria-label="Rows per page"
                value={pagination.pageSize}
                onChange={(event) =>
                  table.setPageSize(Number(event.target.value))
                }
                className="h-9 cursor-pointer appearance-none rounded-lg border-0 bg-transparent pl-3 pr-8 text-[13px] font-semibold outline-none dark:text-white"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#174B7A] dark:text-slate-300"
              />
            </div>
          </div>
        </footer>
      </div>
      {enrollmentView && (
        <EnrollmentsPopover student={enrollmentView.student} anchor={enrollmentView.anchor} onClose={closeEnrollments} />
      )}
      <ConfirmDialog
        student={confirm?.student}
        mode={confirm?.mode}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm.mode === "delete") await onDelete(confirm.student.id);
          else await onDeactivate(confirm.student);
          notify(
            confirm.mode === "delete"
              ? `${confirm.student.name} deleted`
              : `${confirm.student.name} deactivated`,
          );
          setConfirm(null);
        }}
      />
      {bulkDialog && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Bulk operation
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {bulkDialog === "batch"
                ? "Assign students to batch"
                : bulkDialog === "notify"
                  ? "Notify selected students"
                  : "Change student status"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {bulkDialog === "notify" ? "Write a message for" : "This will update"} {selectedCount} selected students.
            </p>
            {bulkDialog === "notify" ? (
              <textarea
                autoFocus
                value={bulkValue}
                onChange={(event) => setBulkValue(event.target.value)}
                placeholder="Enter notification message"
                rows={4}
                className="mt-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <select
                value={bulkValue}
                onChange={(event) => setBulkValue(event.target.value)}
                className="mt-4 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">
                  Select {bulkDialog === "batch" ? "a batch" : "a status"}
                </option>
                {(bulkDialog === "batch"
                  ? batches
                  : ["Active", "Pending", "At Risk", "On Leave", "Inactive"]
                ).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setBulkDialog(null);
                  setBulkValue("");
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={!bulkValue}
                onClick={runBulkOperation}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {bulkDialog === "notify" ? "Send notification" : `Apply to ${selectedCount} students`}
              </button>
            </div>
          </div>
        </div>
      )}
      {operation && (
        <div ref={operationRef} className="fixed right-5 top-20 z-[80] w-[330px] rounded-xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>{operation.label}</span>
            <span>
              {operation.completed}/{operation.total}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-emerald-400 transition-all"
              style={{
                width: `${(operation.completed / operation.total) * 100}%`,
              }}
            />
          </div>
          {operation.done && (
            <div className="mt-3 text-xs text-slate-200">
              <b>{operation.total - operation.failed.length} succeeded</b>
              {operation.failed.length
                ? `, ${operation.failed.length} failed`
                : ""}
              {operation.failed.map((item) => (
                <p key={item.name} className="mt-1 text-rose-300">
                  {item.name}: {item.reason}
                </p>
              ))}
              <button
                onClick={() => setOperation(null)}
                className="mt-3 font-semibold text-blue-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
