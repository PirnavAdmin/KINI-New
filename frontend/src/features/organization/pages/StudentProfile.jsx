import { courseService } from '@shared/services/courseService';
import toast from 'react-hot-toast';
import "./student-profile-attendance.css";
import { loadStudentPayments } from "@shared/services/studentPaymentData";
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import OrgShowcaseHero from "../components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "../constants/orgBanners";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Award, BadgeCheck, BookOpen, CalendarDays, ChevronLeft, ChevronRight, CreditCard, Download, Globe, GraduationCap, LayoutGrid, Laptop, Mail, MapPin, Pencil, Phone, FolderOpen, TrendingUp, UserRound, UsersRound, Wallet, ClipboardList } from "lucide-react";
import KPI from "@/components/common/KPI";
import { studentsApi } from "@/api/students";
import { ROUTES } from "@shared/constants/routeConstants";
import { Button } from "@shared/components/FormElements";
import EmptyState from "@shared/components/EmptyState";
import { TableSkeleton } from "@shared/ui/Skeleton";
import { courseMaterialService } from "@shared/services/courseMaterialService";
import useStudentAssessmentPerformance from "@/hooks/useStudentAssessmentPerformance";
import StudentAssessmentResults from "../components/StudentAssessmentResults";
import { useProfilePhoto } from "@shared/hooks/useProfilePhoto";
import { PROFILE_TYPE } from "@shared/services/profilePhotoService";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { buildEnrollmentRows } from "../utils/studentEnrollments";
import AddStudentCourse from "../components/AddStudentCourse";
import { batchService } from "@shared/services/batchService";
import { isPresentStatus, normalizeAttendanceRow } from "@/pages/students/studentAttendance";

const TABS = ["Overview", "Academic", "Payments", "Attendance", "Progress", "Materials", "Assessment Results"];
// URL form of a tab: ?tab=Attendance, ?tab=AssessmentResults. Older links
// ("Assessment Results", "Quiz Results", any casing) still resolve.
const tabKey = (label) => label.replace(/\s+/g, "");
const tabFromParam = (value) => {
  const key = String(value ?? "").replace(/\s+/g, "").toLowerCase();
  if (key === "quizresults") return "Assessment Results";
  return TABS.find((label) => tabKey(label).toLowerCase() === key) ?? "Overview";
};
const TAB_ICONS = { Overview: LayoutGrid, Academic: GraduationCap, Payments: Wallet, Attendance: CalendarDays, Progress: TrendingUp, Materials: FolderOpen, "Assessment Results": ClipboardList };
const display = (value) => value === undefined || value === null || value === "" ? "Not provided" : String(value);
const studentIdOf = (student = {}) => student.studentId ?? student.id ?? student.StudentId;

function StudentHeroAvatar({ studentId, initials }) {
  const { photoUrl } = useProfilePhoto(PROFILE_TYPE.STUDENT, studentId);
  return <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#2f8cf5] to-[#12b8d8] text-3xl font-bold text-white shadow-[0_12px_24px_-12px_rgba(31,111,229,.8)]"><AvatarPhoto src={photoUrl} alt="" fallback={initials} /></div>;
}
const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not provided";
const money = (value) => value === undefined || value === null ? "Not provided" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
const title = (value) => String(value ?? "").replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
function Card({ heading, children }) { return <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900"><h2 className="mb-4 text-lg font-bold text-[#0f2a4a] dark:text-white">{heading}</h2>{children}</section>; }
function Details({ items }) { return <div className="grid gap-3 sm:grid-cols-2">{items.map(([name, value]) => <div key={name} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{name}</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{display(value)}</p></div>)}</div>; }
function ResourceTable({ rows }) {
  const keys = rows[0] ? Object.keys(rows[0]).slice(0, 7) : [];
  return <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-400">{keys.map((key) => <th key={key} className="p-3">{title(key)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index} className="border-b border-slate-100 dark:border-slate-800">{keys.map((key) => <td key={key} className="p-3">{display(row[key])}</td>)}</tr>)}</tbody></table></div>;
}
function TabState({ loading, error, onRetry, empty, emptyTitle, emptyDescription, icon: Icon, children }) {
  if (loading) return <TableSkeleton rows={4} columns={4} />;
  if (error) return <EmptyState icon={Icon} title={`Unable to load ${emptyTitle.toLowerCase()}`} description={error} action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined} />;
  if (empty) return <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />;
  return children;
}

// Attendance rows and the "Present"/"Late" rule are shared with the Students
// table (src/pages/students/studentAttendance.js) so both show the same %.

const isPaidPayment = (record) => ["paid", "paid in full", "completed", "success", "successful"]
  .includes(String(record?.status ?? record?.paymentStatus ?? "").toLowerCase());

// Payment rows can come from three different real endpoints (see loadPayments
// below), each with its own field naming, so the invoice id is read the same
// defensive way the student's own "My Payments" page reads it.
const invoiceIdOf = (row) => row?.invoiceId ?? row?.InvoiceId ?? row?.invoice?.invoiceId ?? row?.invoice?.id ?? null;
const isInvoiceIdColumn = (key) => /invoice/i.test(key) && /(id|no|number)/i.test(key);

// Course, Batch and Enrollment Status always; Mentor and Payment Status only
// when some row actually has them (the enrollments API doesn't send them).
const ENROLLMENT_COLUMNS = [["course", "Course"], ["batch", "Batch"], ["mentor", "Mentor", true], ["enrollmentStatus", "Enrollment Status"], ["paymentStatus", "Payment Status", true]];

/** One row per course the student is enrolled in. */
function EnrollmentsTable({ rows }) {
  const columns = ENROLLMENT_COLUMNS.filter(([key, , optional]) => !optional || rows.some((row) => row[key] && row[key] !== "Not reported"));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead><tr className="border-b text-left text-xs uppercase text-slate-400">{columns.map(([key, label]) => <th key={key} scope="col" className="p-3">{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 dark:border-slate-800">
              {columns.map(([key]) => (
                <td key={key} className={`p-3 ${key === "course" ? "font-semibold text-[#0f2a4a] dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsTable({ rows, onOpenInvoice }) {
  const keys = rows[0] ? Object.keys(rows[0]).slice(0, 7) : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead><tr className="border-b text-left text-xs uppercase text-slate-400">{keys.map((key) => <th key={key} className="p-3">{title(key)}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => {
            const invoiceId = invoiceIdOf(row);
            return (
              <tr key={row.id ?? index} className="border-b border-slate-100 dark:border-slate-800">
                {keys.map((key) => (
                  <td key={key} className="p-3">
                    {invoiceId && isInvoiceIdColumn(key) ? (
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(invoiceId)}
                        className="font-semibold text-[#133B5D] underline-offset-2 transition-colors hover:text-[#F39924] hover:underline dark:text-blue-300"
                      >
                        {display(row[key])}
                      </button>
                    ) : display(row[key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const ATTENDANCE_PAGE_SIZE = 15;
const attendanceTone = (status) => isPresentStatus(status) ? "bg-emerald-50 text-emerald-600" : String(status).toLowerCase() === "absent" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600";
const formatAttendanceDate = (value) => {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return `${parsed.toISOString().slice(0, 10)} ${parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

function AttendancePanel({ rows, loading, error, onRetry, studentName }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef(null);
  useEffect(() => {
    if (!rangeOpen) return;
    const outside = event => { if (!rangeRef.current?.contains(event.target)) setRangeOpen(false); };
    const escape = event => { if (event.key === 'Escape') setRangeOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [rangeOpen]);
  const [page, setPage] = useState(1);
  const [asc, setAsc] = useState(false);
  const filtered = useMemo(() => rows
    .filter((row) => {
      const day = String(row.date ?? "").slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    })
    .sort((a, b) => (asc ? 1 : -1) * ((new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0))), [rows, from, to, asc]);
  const pages = Math.max(1, Math.ceil(filtered.length / ATTENDANCE_PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * ATTENDANCE_PAGE_SIZE, current * ATTENDANCE_PAGE_SIZE);
  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [["ID", "Date", "Class", "Status", "Join", "Leave"], ...filtered.map((row) => [row.id, formatAttendanceDate(row.date), row.class, row.status, row.checkIn, row.checkOut])];
    const url = URL.createObjectURL(new Blob([lines.map((line) => line.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${String(studentName || "student").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-attendance.csv`;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast.success("Attendance exported successfully.");
  };
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e6edf6] bg-white shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-4 border-b border-[#eef2f7] px-5 py-4 dark:border-slate-800">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8f1ff] text-[#2f6fe4]"><CalendarDays className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1"><h2 className="text-lg font-bold text-[#0f2a4a] dark:text-white">Attendance</h2><p className="text-sm text-[#4b5f78]">View student attendance details for all classes.</p></div>
        <div className="relative" ref={rangeRef}>
          <button type="button" onClick={() => setRangeOpen((open) => !open)} aria-expanded={rangeOpen} className="inline-flex h-11 min-w-[200px] items-center gap-2.5 rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-sm text-[#4b5f78] dark:border-slate-700 dark:bg-slate-800"><CalendarDays className="h-4 w-4 text-[#133b5d]" />{from || to ? `${from || "Any"} → ${to || "Any"}` : "Select Date Range"}</button>
          {rangeOpen && <div className="absolute right-0 z-20 mt-2 grid w-64 gap-2.5 rounded-xl border border-[#e6edf6] bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <label className="grid gap-1 text-xs font-bold text-slate-600">From<input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="rounded-lg border px-2.5 py-2 text-sm" /></label>
            <label className="grid gap-1 text-xs font-bold text-slate-600">To<input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} className="rounded-lg border px-2.5 py-2 text-sm" /></label>
            <div className="flex justify-between"><button type="button" onClick={() => { setFrom(""); setTo(""); }} className="text-xs font-semibold text-slate-500">Clear</button><button type="button" onClick={() => setRangeOpen(false)} className="rounded-lg bg-[#F39924] px-3 py-1.5 text-xs font-bold text-white">Apply</button></div>
          </div>}
        </div>
        <button type="button" onClick={exportCsv} disabled={!filtered.length} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-sm font-semibold text-[#133b5d] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Download className="h-4 w-4" />Export</button>
      </div>
      {loading || error || !rows.length ? (
        <div className="p-5"><TabState loading={loading} error={error} onRetry={onRetry} empty={!rows.length} emptyTitle="No attendance records found" emptyDescription="No attendance has been recorded for this student yet." icon={CalendarDays}>{null}</TabState></div>
      ) : (
        <>
          <div className="overflow-x-auto p-2">
            <table className="student-profile-attendance w-full min-w-[860px] border-separate border-spacing-x-1 text-left text-sm">
              <thead><tr>
                <th data-th-variant="purple" className="w-16">ID</th>
                <th data-th-variant="blue"><button type="button" onClick={() => setAsc((value) => !value)} className="uppercase">Date {asc ? "↑" : "↓"}</button></th>
                <th data-th-variant="orange">Class</th>
                <th data-th-variant="green">Status</th>
                <th data-th-variant="red">Join</th>
                <th data-th-variant="purple">Leave</th>
              </tr></thead>
              <tbody>{visible.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="border-b border-slate-100 px-3 py-3 text-[#0f2a4a] dark:border-slate-800 dark:text-white">{row.id}</td>
                  <td className="border-b border-slate-100 px-3 py-3 text-[#0f2a4a] dark:border-slate-800 dark:text-slate-200">{formatAttendanceDate(row.date)}</td>
                  <td className="border-b border-slate-100 px-3 py-3 text-[#0f2a4a] dark:border-slate-800 dark:text-slate-200">{row.class}</td>
                  <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${attendanceTone(row.status)}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{row.status}</span></td>
                  <td className="border-b border-slate-100 px-3 py-3 text-[#4b5f78] dark:border-slate-800">{row.checkIn}</td>
                  <td className="border-b border-slate-100 px-3 py-3 text-[#4b5f78] dark:border-slate-800">{row.checkOut}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2f7] px-5 py-3.5 text-sm text-[#4b5f78] dark:border-slate-800">
            <p>Showing {filtered.length ? (current - 1) * ATTENDANCE_PAGE_SIZE + 1 : 0} to {Math.min(current * ATTENDANCE_PAGE_SIZE, filtered.length)} of {filtered.length} records</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === current ? "page" : undefined} className={`grid h-10 min-w-10 place-items-center rounded-xl px-3 font-bold ${number === current ? "bg-[#F39924] text-white" : "border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{number}</button>)}
              <button type="button" aria-label="Next page" disabled={current >= pages} onClick={() => setPage(current + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function StudentProfile() {
  const { studentId } = useParams();
  return <StudentProfileContent key={studentId} />;
}
function StudentProfileContent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const tab = tabFromParam(search.get("tab"));

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const name = useMemo(() => [student?.firstName, student?.lastName].filter(Boolean).join(" ") || student?.name || "Student", [student]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStudent(null);
    setError("");
    if (!studentId) {
      setError("Student ID is missing from this record.");
      setLoading(false);
      return () => { active = false; };
    }
    studentsApi.getById(studentId)
      .then((response) => {
        const responseStudentId = studentIdOf(response.data);
        if (responseStudentId !== undefined && String(responseStudentId) !== String(studentId)) {
          throw new Error("Student response identity does not match.");
        }
        if (active) setStudent(response.data);
      })
      .catch(async (requestError) => {
        try {
          const response = await studentsApi.list({ pageNumber: 1, pageSize: 100 });
          const fallback = (response?.data || []).find((item) =>
            String(studentIdOf(item)) === String(studentId),
          );
          if (!fallback) throw requestError;
          if (active) setStudent(fallback);
        } catch (fallbackError) {
          if (active) setError(studentsApi.getErrorMessage(fallbackError));
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [studentId]);

  // Attendance and Payments load with the profile. Assessment performance is
  // requested only while its tab is active and then also supplies Average Score.
  const [attendance, setAttendance] = useState({ loading: true, rows: [], error: "" });
  const loadAttendance = useCallback(async () => {
    setAttendance((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await studentsApi.getAttendance(studentId);
      const rows = Array.isArray(response.data) ? response.data : response.data?.items ?? [];
      setAttendance({ loading: false, rows: rows.map(normalizeAttendanceRow), error: "" });
    } catch (requestError) {
      setAttendance({ loading: false, rows: [], error: studentsApi.getErrorMessage(requestError) });
    }
  }, [studentId]);
  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const [progress, setProgress] = useState({ loading: false, data: null, error: "" });
  const loadProgress = useCallback(async () => {
    setProgress((current) => ({ ...current, loading: true, error: "" }));
    try {
      // GET .../progress returns a single object (getPayload), not a list —
      // the previous implementation ran it through an Array.isArray check
      // meant for list endpoints, which made this tab always render empty.
      const response = await studentsApi.getProgress(studentId);
      const data = response.data && typeof response.data === "object" && !Array.isArray(response.data) ? response.data : null;
      setProgress({ loading: false, data, error: "" });
    } catch (requestError) {
      setProgress({ loading: false, data: null, error: studentsApi.getErrorMessage(requestError) });
    }
  }, [studentId]);

  const [payments, setPayments] = useState({ loading: true, rows: [], error: "" });
  const loadPayments = useCallback(async () => {
    setPayments((current) => ({ ...current, loading: true, error: "" }));
    try {
      const rows = await loadStudentPayments(studentId, student?.userId);
      setPayments({ loading: false, rows, error: "" });
    } catch (requestError) {
      setPayments({ loading: false, rows: [], error: studentsApi.getErrorMessage(requestError) });
    }
  }, [studentId, student?.userId]);
  useEffect(() => { if (student) loadPayments(); }, [loadPayments, student]);

  const selectedStudentId = student ? studentIdOf(student) ?? studentId : null;
  const performance = useStudentAssessmentPerformance(selectedStudentId, Boolean(student) && tab === "Assessment Results");

  // Materials and Activity don't power a KPI card, so they only fetch the
  // first time their tab is actually visited (including a direct/refreshed
  // ?tab=Materials or ?tab=Activity URL).
  const [materials, setMaterials] = useState({ loading: false, loaded: false, rows: [], pdf: null, error: "" });
  const loadMaterials = useCallback(async () => {
    const courseId = student?.courseId ?? student?.course?.courseId ?? student?.course?.id;
    if (!courseId) {
      setMaterials({ loading: false, loaded: true, rows: [], pdf: null, error: "" });
      return;
    }
    setMaterials({ loading: true, loaded: false, rows: [], pdf: null, error: "" });
    try {
      const pdf = await courseMaterialService.file({ courseId });
      const rows = [{ id: courseId, title: `${student.course?.courseName ?? student.courseName ?? "Course"} material`, materialType: "PDF" }];
      setMaterials({ loading: false, loaded: true, rows, pdf, error: "" });
    } catch (requestError) {
      const status = requestError?.response?.status;
      setMaterials({ loading: false, loaded: true, rows: [], pdf: null, error: status === 404 ? "" : studentsApi.getErrorMessage(requestError) });
    }
  }, [student]);
  useEffect(() => {
    if (tab === "Materials" && student && !materials.loaded && !materials.loading) loadMaterials();
  }, [tab, student, materials.loaded, materials.loading, loadMaterials]);

  // Every course enrollment of this student; fetched the first time Academic opens.
  const [enrollments, setEnrollments] = useState({ loading: false, loaded: false, rows: [], error: "" });
  const loadEnrollments = useCallback(async () => {
    setEnrollments({ loading: true, loaded: false, rows: [], error: "" });
    try {
      const response = await studentsApi.getEnrollments(studentId);
      setEnrollments({ loading: false, loaded: true, rows: Array.isArray(response.data) ? response.data : [], error: "" });
    } catch (requestError) {
      // 404 = no enrollments endpoint data for this student: the record's own course still shows.
      const status = requestError?.response?.status;
      setEnrollments({ loading: false, loaded: true, rows: [], error: status === 404 ? "" : studentsApi.getErrorMessage(requestError) });
    }
  }, [studentId]);
  useEffect(() => {
    if (tab === "Academic" && !enrollments.loaded && !enrollments.loading) loadEnrollments();
  }, [tab, enrollments.loaded, enrollments.loading, loadEnrollments]);
  // GET /api/v1/organization/batches, loaded with the Academic tab: gives each
  // enrollment its own batch mentor and start/end dates.
  const [courseCatalog, setCourseCatalog] = useState([]);
  useEffect(() => {
    if (tab !== 'Academic') return;
    let active = true;
    courseService.getCourses({ pageNumber: 1, pageSize: 1000 }).then(result => { if (active) setCourseCatalog(result.data ?? []); }).catch(() => {});
    return () => { active = false; };
  }, [tab, studentId]);
  const [orgBatches, setOrgBatches] = useState(null);
  useEffect(() => {
    if (tab !== "Academic" || orgBatches) return undefined;
    let active = true;
    batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 })
      .then((response) => { if (active) setOrgBatches(response?.data ?? []); })
      .catch(() => { if (active) setOrgBatches([]); });
    return () => { active = false; };
  }, [tab, orgBatches]);

  const [activity, setActivity] = useState({ loading: false, loaded: false, rows: [], error: "" });
  const loadActivity = useCallback(async () => {
    setActivity({ loading: true, loaded: false, rows: [], error: "" });
    try {
      const response = await studentsApi.getActivity(studentId);
      const rows = Array.isArray(response.data) ? response.data : response.data?.items ?? [];
      setActivity({ loading: false, loaded: true, rows, error: "" });
    } catch (requestError) {
      setActivity({ loading: false, loaded: true, rows: [], error: studentsApi.getErrorMessage(requestError) });
    }
  }, [studentId]);
  useEffect(() => {
    if (tab === "Activity" && !activity.loaded && !activity.loading) loadActivity();
  }, [tab, activity.loaded, activity.loading, loadActivity]);

  const choose = (next) => {
    if (next === "Quiz Results") next = "Assessment Results";
    const nextSearch = new URLSearchParams(search);
    next === "Overview" ? nextSearch.delete("tab") : nextSearch.set("tab", tabKey(next));
    setSearch(nextSearch);
  };

  if (loading) return <div className="p-6"><TableSkeleton rows={5} columns={4} /></div>;
  if (!student) return <div className="p-6"><EmptyState icon={UserRound} title="Student not found" description={error || "The student is unavailable."} action={<Button onClick={() => navigate(ROUTES.ORG_ADMIN.STUDENTS)}>Back to Students</Button>} /></div>;

  const attendancePercentage = attendance.rows.length
    ? Math.round((attendance.rows.filter((row) => isPresentStatus(row.status)).length / attendance.rows.length) * 100)
    : null;
  const progressPercentage = (() => {
    if (!progress.data) return null;
    const value = progress.data.percentage ?? progress.data.progressPercentage ?? progress.data.courseProgress ?? progress.data.progress;
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number) : null;
  })();
  const quizAverage = performance.data?.averageScore == null ? null : Math.round(performance.data.averageScore);
  const paidTotal = payments.rows.reduce((sum, payment) => sum + (isPaidPayment(payment)
    ? Number(payment.paidAmount ?? payment.amount ?? payment.totalAmount ?? payment.grandTotal ?? 0) || 0
    : 0), 0);
  const paymentKpiValue = payments.loading
    ? "…"
    : payments.rows.length
      ? `${money(paidTotal)} paid`
      : "No payment records";

  const progressDetailItems = progress.data
    ? [
        ["Overall progress", progressPercentage != null ? `${progressPercentage}%` : undefined],
        ...Object.entries(progress.data)
          .filter(([key, value]) => typeof value !== "object" && !["percentage", "progressPercentage", "courseProgress", "progress"].includes(key))
          .slice(0, 6)
          .map(([key, value]) => [title(key), value]),
      ]
    : [];

  const enrollmentRows = buildEnrollmentRows({ enrollments: enrollments.rows, student, payments: payments.rows, batches: orgBatches ?? [] }).map(row => ({ ...row, duration: row.duration ?? courseCatalog.find(course => String(course.courseId ?? course.id) === String(row.courseId))?.duration }));
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const courseName = student.course?.courseName ?? student.courseName;
  const batchName = student.batch?.batchName ?? student.batchName;
  const mentorName = student.batch?.trainerName ?? student.trainerName ?? student.mentorName;
  const isActive = String(student.status ?? "").toLowerCase() === "active";
  const learningStatus = attendancePercentage == null && progressPercentage == null
    ? "Not started"
    : (attendancePercentage ?? 100) < 60 || (quizAverage ?? 100) < 40 ? "Needs attention" : "On track";
  const kpis = [
    ["Attendance", attendance.loading ? "…" : attendancePercentage != null ? `${attendancePercentage}%` : "—", CalendarDays, "green", "Attendance"],
    ["Course Progress", progress.loading ? "…" : progressPercentage != null ? `${progressPercentage}%` : "—", TrendingUp, "blue", "Progress"],
    ["Average Score", performance.loading ? "…" : quizAverage != null ? `${quizAverage}%` : "—", Award, "purple", "Assessment Results"],
    ["Learning Status", learningStatus, GraduationCap, "orange", "Progress"],
  ];
  const infoCard = (heading, Icon, tone, rows) => (
    <section className="overflow-hidden rounded-2xl border border-[#e6edf6] bg-white shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
      <h2 className={`flex items-center gap-2.5 px-4 py-[8px] text-base font-bold text-[#0f2a4a] dark:text-white ${tone.bg}`}><span className={`grid h-[30px] w-[30px] place-items-center rounded-lg bg-white/80 ${tone.icon}`}><Icon className="h-4 w-4" /></span>{heading}</h2>
      <dl className="mx-3 my-2.5 divide-y divide-[#eef2f7] rounded-xl border border-[#eef2f7] px-3 dark:divide-slate-800 dark:border-slate-800">
        {rows.map(([label, value, RowIcon]) => (
          <div key={label} className="flex items-center gap-3 py-[8px] text-[14.5px] leading-[21px]">
            <RowIcon className="h-4 w-4 shrink-0 text-[#4b5f78]" />
            <dt className="flex-1 text-[#4b5f78]">{label}</dt>
            <dd className="min-w-0 truncate text-right font-medium text-[#0f2a4a] dark:text-white">{display(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  return (
    <main className="mx-auto max-w-[1500px] space-y-3.5 px-3 py-3 sm:px-4">
      <button type="button" onClick={() => navigate(ROUTES.ORG_ADMIN.STUDENTS)} className="inline-flex h-11 items-center gap-2.5 rounded-full border border-[#e6edf6] bg-white px-5 text-[15px] font-semibold text-[#0f2a4a] shadow-sm hover:bg-[#f6f9fd] dark:border-slate-700 dark:bg-slate-900 dark:text-white"><ArrowLeft className="h-4 w-4" />Back to students</button>

      <OrgShowcaseHero
        variant="profile"
        leading={<StudentHeroAvatar studentId={studentIdOf(student)} initials={initials} />}
        title={name}
        titleAside={<span className="rounded-lg bg-white/85 px-2.5 py-1 text-sm font-bold text-[#0f2a4a]">#{student.studentCode ?? student.studentId}</span>}
        meta={
          <>
            <p className="text-lg text-[#133b5d] dark:text-slate-300"><b>{courseName ?? "No course assigned"}</b>{batchName ? <><span className="mx-2">•</span><b>{batchName}</b></> : null}{mentorName ? <><span className="mx-2">•</span>Mentor: {mentorName}</> : null}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-bold ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}><span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{student.status ?? "Not provided"}</span>
              <span className="text-[15px] text-[#4b5f78]">Enrolled: {student.registrationDate ? date(student.registrationDate) : "-"}</span>
            </div>
          </>
        }
        art={ORG_BANNERS.studentProfile}
        script={["Learn", "Grow", "Succeed"]}
        actions={
          <button type="button" onClick={() => {
            const returnTo = `${location.pathname}${location.search}`;
            sessionStorage.setItem("organization-student-edit-return", returnTo);
            navigate(`${ROUTES.ORG_ADMIN.STUDENTS}?edit=${encodeURIComponent(student.studentId ?? studentId)}&returnTo=${encodeURIComponent(returnTo)}`, { state: { returnTo } });
          }} className="osh-btn osh-btn--white">
            <Pencil className="h-4 w-4" />Edit
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Student summary">
        {kpis.map(([label, value, Icon, accent, target]) => (
          <KPI key={label} accent={accent} icon={Icon} label={label} value={value} showArrow onClick={() => choose(target)} size="compact" className="h-full" />
        ))}
      </section>

      <nav className="overflow-x-auto rounded-2xl border border-[#e6edf6] bg-white p-[3px] shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex min-w-max gap-1">
          {TABS.map((item) => {
            const TabIcon = TAB_ICONS[item] ?? LayoutGrid;
            return <button key={item} type="button" onClick={() => choose(item)} aria-current={tab === item ? "page" : undefined} className={`inline-flex h-[36px] items-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition ${tab === item ? "bg-[#F39924] text-white shadow-sm" : "text-[#133b5d] hover:bg-[#f6f9fd] dark:text-slate-300 dark:hover:bg-slate-800"}`}><TabIcon className="h-4 w-4" />{item}</button>;
          })}
        </div>
      </nav>

      {tab === "Overview" ? (
        <div className="grid gap-3.5 lg:grid-cols-2">
          {infoCard("Contact Information", Phone, { bg: "bg-gradient-to-r from-[#eaf8f1] to-white", icon: "text-[#13a36b]" }, [["Email", student.email, Mail], ["Mobile", student.phone ?? student.mobile, Phone], ["Alternate", student.alternatePhone, Phone], ["Country", student.country, Globe], ["Address", student.address, MapPin]])}
          {infoCard("Enrollment Details", GraduationCap, { bg: "bg-gradient-to-r from-[#fff4e6] to-white", icon: "text-[#ea8a0b]" }, [["Course", courseName, BookOpen], ["Batch", batchName ?? "No batch assigned", UsersRound], ["Mode", student.mode ?? student.batch?.mode ?? student.batchType, Laptop], ["Mentor", mentorName, UserRound], ["Enrolled", student.registrationDate ? date(student.registrationDate) : undefined, CalendarDays], ["Status", student.status, BadgeCheck]])}
        </div>
      ) : tab === "Attendance" ? (
        <AttendancePanel rows={attendance.rows} loading={attendance.loading} error={attendance.error} onRetry={loadAttendance} studentName={name} />
      ) : tab === "Academic" ? (
        <div className="space-y-3.5">
          <Card heading="Enrolled courses">
            <AddStudentCourse
              studentId={student.studentId ?? studentId}
              enrolledCourseIds={new Set(enrollmentRows.map((row) => row.courseId).filter(Boolean))}
              onAdded={loadEnrollments}
            />
            <TabState loading={enrollments.loading} error={enrollments.error} onRetry={loadEnrollments} empty={!enrollmentRows.length} emptyTitle="No course enrollments" emptyDescription="This student isn't enrolled in a course yet." icon={BookOpen}>
              <EnrollmentsTable rows={enrollmentRows} />
            </TabState>
          </Card>
          {/* One card per enrollment, from the same list as the table above. */}
          {enrollmentRows.length > 0 && (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {enrollmentRows.map((row, index) => {
                const isRecordCourse = row.courseId && String(row.courseId) === String(student.courseId ?? student.course?.courseId ?? student.course?.id ?? "");
                return (
                  <Card key={row.key} heading={`Course ${index + 1} — ${row.course}`}>
                    <Details items={[
                      ["Course", row.course],
                      ["Batch", row.batch],
                      ["Mentor", row.mentor],
                      ["Enrollment status", row.enrollmentStatus],
                      // Only the course on the student record carries a duration.
                      ["Course duration", (row.duration ?? (isRecordCourse ? student.course?.duration ?? student.courseDuration : null)) ?? "Not provided"],
                      ["Batch starts", date(row.batchStart ?? (isRecordCourse ? student.batch?.startDate ?? student.batchStartDate : null))],
                      ["Batch ends", date(row.batchEnd ?? (isRecordCourse ? student.batch?.endDate ?? student.batchEndDate : null))],
                    ]} />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : tab === "Payments" ? (
        <Card heading="Payments">
          <TabState loading={payments.loading} error={payments.error} onRetry={loadPayments} empty={!payments.rows.length} emptyTitle="No payment records found" emptyDescription="This student has no recorded payments yet." icon={CreditCard}>
            <PaymentsTable rows={payments.rows} onOpenInvoice={(invoiceId) => navigate(ROUTES.ORG_ADMIN.INVOICE_DETAILS.replace(":invoiceId", encodeURIComponent(invoiceId)))} />
          </TabState>
        </Card>
      ) : tab === "Progress" ? (
        <Card heading="Course progress">
          <TabState loading={progress.loading} error={progress.error} onRetry={loadProgress} empty={!progress.data} emptyTitle="No progress data available" emptyDescription="Course progress has not been recorded for this student yet." icon={GraduationCap}>
            <Details items={progressDetailItems} />
          </TabState>
        </Card>
      ) : tab === "Materials" ? (
        <Card heading="Materials">
          <TabState loading={materials.loading} error={materials.error} onRetry={loadMaterials} empty={!materials.rows.length} emptyTitle="No materials available" emptyDescription="No materials have been shared for this student's course yet." icon={BookOpen}>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#e6edf6] bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div><p className="font-bold text-[#0f2a4a] dark:text-white">{materials.rows[0]?.title}</p><p className="mt-1 text-sm text-[#4b5f78]">Course PDF</p></div>
              <button type="button" onClick={() => { const url = URL.createObjectURL(materials.pdf); const link = document.createElement("a"); link.href = url; link.download = `${courseName ?? "course"}-material.pdf`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast.success("Course material downloaded successfully."); }} className="inline-flex items-center gap-2 rounded-xl bg-[#F39924] px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" />Download PDF</button>
            </div>
          </TabState>
        </Card>
      ) : tab === "Assessment Results" ? (
        <StudentAssessmentResults key={selectedStudentId} studentName={name} courseName={courseName} batchName={batchName} mentorName={mentorName} performance={performance} />
      ) : (
        <Card heading="Activity">
          <TabState loading={activity.loading} error={activity.error} onRetry={loadActivity} empty={!activity.rows.length} emptyTitle="No activity available" emptyDescription="No activity has been recorded for this student yet." icon={UserRound}>
            <ResourceTable rows={activity.rows} />
          </TabState>
        </Card>
      )}
    </main>
  );
}
