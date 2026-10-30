/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Armchair, CalendarDays, CalendarRange, CheckCircle2, ChevronRight, Clock, FileText, FolderOpen, Info, LayoutDashboard, Layers3, ListChecks, Search, User, UserPlus, Users, UsersRound, Video } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { batchService } from "@shared/services/batchService";
import { getMentorDashboardStudents } from "@shared/services/mentorService";
import assessmentService from "@/services/assessmentService";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { canJoinLiveClass, normalizeLiveClass } from "@features/live-classes/utils/liveClassMappers";
import { getMentorSessionIdentity } from "../utils/mentorSessionIdentity";
import { toMentorBatchStudent } from "../utils/mentorBatchStudent";
import ProfileImage from "@/components/common/ProfileImage";
import { PROFILE_TYPE } from "@shared/services/profilePhotoService";
import WorkspaceHeader from "../components/batchWorkspace/WorkspaceHeader";
import BatchMetrics from "../components/batchWorkspace/BatchMetrics";
import WorkspaceTabs from "../components/batchWorkspace/WorkspaceTabs";
import Pager from "../components/Pager";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "live-classes", label: "Schedule & Classes", icon: Video },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance Summary", icon: Clock },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "assessments", label: "Assessments", icon: ListChecks },
];

const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
const mentorNameOf = (user) => user?.mentorName || user?.name || user?.fullName
  || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
  || user?.email || "Assigned mentor";
const listRows = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["students", "items", "records", "results", "data"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return value.data && typeof value.data === "object" ? listRows(value.data) : [];
};
const assessmentMatchesBatch = (assessment, batchId, batchName) => {
  const assessmentBatchId = assessment.batchId ?? assessment.batch?.batchId ?? assessment.batch?.id;
  const assessmentBatchName = String(assessment.batchName ?? assessment.batch?.batchName ?? assessment.batch?.name ?? assessment.batch ?? "").trim().toLowerCase();
  return (assessmentBatchId != null && String(assessmentBatchId) === String(batchId))
    || (batchName && assessmentBatchName === batchName);
};

const liveClassMatchesBatch = (liveClass, batchId, batchName) => {
  const classBatchId = liveClass?.batchId ?? liveClass?.batch?.batchId ?? liveClass?.batch?.id;
  const classBatchName = String(liveClass?.batchName ?? liveClass?.batch?.batchName ?? liveClass?.batch?.name ?? "").trim().toLowerCase();
  return (classBatchId != null && String(classBatchId) === String(batchId))
    || (batchName && classBatchName === batchName);
};

const classDateTime = (liveClass) => {
  const dateValue = liveClass?.scheduledDate ?? liveClass?.date;
  if (!dateValue) return null;
  const value = new Date(`${String(dateValue).slice(0, 10)}T${String(liveClass?.startTime || "00:00:00").slice(0, 8)}`);
  return Number.isNaN(value.getTime()) ? null : value;
};

export default function MentorBatchWorkspace() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchError, setBatchError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [assessmentsError, setAssessmentsError] = useState("");
  const [query, setQuery] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [classPage, setClassPage] = useState(1);
  const [classPageSize, setClassPageSize] = useState(10);
  const activeTab = tabs.some((tab) => tab.id === params.get("tab")) ? params.get("tab") : "overview";

  const loadWorkspace = useCallback(async () => {
    setLoading(true); setBatchError(""); setStudentsError(""); setAssessmentsError("");
    const identity = getMentorSessionIdentity(user);
    const mentorIdentity = identity.employeeId ?? identity.mentorId ?? identity.userId;
    const [batchesResult, studentsResult, dashboardStudentsResult, assessmentsResult, liveClassesResult] = await Promise.allSettled([
      batchService.getMentorBatches(mentorIdentity).then((response) =>
        response?.batches?.find((item) => String(item.batchId) === String(batchId)) ?? null,
      ),
      batchService.getStudents(batchId),
      getMentorDashboardStudents(),
      assessmentService.getAssessments(),
      liveClassService.list({ batchId, page: 1, pageSize: 1000 }),
    ]);
    if (batchesResult.status === "fulfilled") {
      const selected = batchesResult.value;
      setBatch(selected || null);
      if (!selected) setBatchError("Batch not found");
    } else setBatchError("Unable to load batch details.");
    const batchFromList = batchesResult.status === "fulfilled" ? batchesResult.value : null;
    const rosterResponse = studentsResult.status === "fulfilled" ? studentsResult.value || {} : null;
    const rosterRows = Array.isArray(rosterResponse?.students) ? rosterResponse.students : [];
    const dashboardRows = dashboardStudentsResult.status === "fulfilled"
      ? listRows(dashboardStudentsResult.value)
      : [];
    const batchName = String(batchFromList?.batchName ?? batchFromList?.name ?? "").trim().toLowerCase();
    const workspaceBatchName = String(rosterResponse?.batchName ?? batchFromList?.batchName ?? batchFromList?.name ?? "").trim().toLowerCase();
    if (liveClassesResult.status === "fulfilled") {
      const classRows = Array.isArray(liveClassesResult.value) ? liveClassesResult.value : [];
      setLiveClasses(classRows
        .filter((liveClass) => liveClassMatchesBatch(liveClass, batchId, workspaceBatchName || batchName))
        .sort((a, b) => (classDateTime(a)?.getTime() || 0) - (classDateTime(b)?.getTime() || 0)));
    } else {
      setLiveClasses([]);
    }
    if (assessmentsResult.status === "fulfilled") {
      setAssessments(assessmentsResult.value.filter((assessment) => assessmentMatchesBatch(assessment, batchId, workspaceBatchName || batchName)));
    } else {
      setAssessments([]);
      setAssessmentsError("Unable to load assessments for this batch.");
    }
    const fallbackRows = dashboardRows.filter((student) => {
      const studentBatchId = student.batchId ?? student.batch?.batchId ?? student.batch?.id;
      const studentBatchName = String(student.batchName ?? student.batch?.batchName ?? student.batch?.name ?? student.batch ?? "").trim().toLowerCase();
      return (studentBatchId != null && String(studentBatchId) === String(batchId))
        || (batchName && studentBatchName === batchName);
    });
    // StudentBatch is preferred when it has records. Mentor dashboard data is
    // the fallback for deployments where that roster endpoint is unavailable
    // or has not caught up with a newly created enrollment.
    const response = rosterResponse || {};
    const rows = rosterRows.length ? rosterRows : fallbackRows;
    if (studentsResult.status === "fulfilled" || fallbackRows.length) {
      setStudents(rows.map(toMentorBatchStudent));
      // The mentor-scoped roster endpoint is authoritative for assigned batches.
      // It can succeed even when the organization batch-detail endpoint is not
      // permitted for a mentor, so construct the workspace from this response.
      setBatch((current) => ({
        ...(current || {}),
        batchId: response.batchId ?? current?.batchId ?? Number(batchId),
        batchName: response.batchName || current?.batchName || batchFromList?.batchName || `Batch ${batchId}`,
        courseName: response.courseName || current?.courseName || batchFromList?.courseName || "Assigned course",
        mentorName: response.mentorName || current?.mentorName || batchFromList?.mentorName || mentorNameOf(user),
        batchType: response.batchType || response.mode || current?.batchType || batchFromList?.batchType || "Online",
        description: response.description || current?.description || batchFromList?.description || `Active batch for ${response.courseName || current?.courseName || batchFromList?.courseName || "the assigned course"}.`,
        status: response.status ?? current?.status ?? batchFromList?.status ?? "Active",
        startDate: response.startDate ?? current?.startDate ?? batchFromList?.startDate,
        endDate: response.endDate ?? current?.endDate ?? batchFromList?.endDate,
        capacity: Number(response.capacity ?? current?.capacity ?? batchFromList?.capacity ?? 0),
        enrolledStudents: Number(response.enrolledStudents ?? current?.enrolledStudents ?? rows.length),
        availableSeats: Number(response.availableSeats ?? current?.availableSeats ?? Math.max(0, Number(response.capacity ?? current?.capacity ?? batchFromList?.capacity ?? 0) - rows.length)),
      }));
      setBatchError("");
      if (import.meta.env.DEV && Number(response.enrolledStudents ?? rows.length) !== rows.length) console.warn(`[MentorBatchWorkspace] Batch ${batchId} count mismatch: enrolledStudents=${response.enrolledStudents}, students=${rows.length}`);
    } else { setStudents([]); setStudentsError("Unable to load students."); }
    setLoading(false);
  }, [batchId, user]);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);
  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return students.filter((student) => !search || [student.name, student.studentCode].some((value) => String(value || "").toLowerCase().includes(search)));
  }, [query, students]);
  // Progress only appears when the roster API actually provides it.
  const showProgress = students.some((student) => student.progress != null);
  // Schedule & Classes pagination. The page is clamped here rather than in an
  // effect, so a shrinking class list can never leave it past the last page.
  const classPageCount = Math.max(1, Math.ceil(liveClasses.length / classPageSize));
  const currentClassPage = Math.min(classPage, classPageCount);
  const classStart = (currentClassPage - 1) * classPageSize;
  const pagedLiveClasses = liveClasses.slice(classStart, classStart + classPageSize);
  const occupancy = batch?.capacity > 0 ? Math.round((Number(batch.enrolledStudents || 0) / Number(batch.capacity)) * 100) : 0;
  const setTab = (tab) => setParams({ tab }, { replace: true });
  const shareBatch = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast.success("Batch link copied"); }
    catch { toast.error("Unable to copy the link"); }
  };
  const exportRoster = () => {
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [["Name", "Attendance", "Assessments Cleared", "Status"], ...students.map((student) => [student.name, `${student.attendance}%`, student.assessmentsCleared, student.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${String(batch?.batchName || `batch-${batchId}`).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-students.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast.success("Student list exported");
  };

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading batch workspace...</div>;
  if (batchError || !batch) return <div className="mx-auto max-w-xl p-8 text-center"><AlertCircle className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-3 text-lg font-bold">{batchError || "Batch not found"}</h1><p className="mt-1 text-sm text-slate-500">The requested batch does not exist or you do not have access to it.</p><div className="mt-4 flex justify-center gap-3"><button onClick={loadWorkspace} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Retry</button><button onClick={() => navigate("/mentor/batches")} className="rounded-lg border px-3 py-2 text-sm font-semibold">Back to My Batches</button></div></div>;

  return <main className="mv17 min-h-full p-3 sm:p-4"><div className="mx-auto max-w-[1500px] space-y-3.5">
    <WorkspaceHeader batch={{ ...batch, status: String(batch.status || "").toLowerCase() }} onBack={() => navigate("/mentor/batches")} onExport={exportRoster} onShare={shareBatch} onGenerateReport={() => navigate("/mentor/reports")} />
    <BatchMetrics batch={{ ...batch, liveClasses: liveClasses.length }} assessmentsCount={assessments.length} onSelect={setTab} />
    <WorkspaceTabs tabs={tabs.map((tab) => tab.id === "assessments" ? { ...tab, label: `Assessments (${assessments.length})` } : tab)} activeTab={activeTab} onChange={setTab} />
    {activeTab === "overview" && <section className="grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
      <article className="mv17-card mv17-binfo">
        <div className="mv17-card-title"><span className="mv17-card-title__icon is-purple"><FileText aria-hidden="true" /></span><div><h2>Batch Information</h2><p>Key details about this batch.</p></div></div>
        <div className="mv17-binfo__grid">{[
          ["Mentor", batch.mentorName, User, "purple", () => navigate("/mentor/profile")],
          ["Batch Type", batch.batchType, Layers3, "orange", () => setTab("live-classes")],
          ["Start Date", date(batch.startDate), CalendarDays, "green", () => setTab("live-classes")],
          ["End Date", date(batch.endDate), CalendarRange, "red", () => setTab("live-classes")],
          ["Capacity", batch.capacity, UsersRound, "blue", () => setTab("students")],
          ["Enrolled", batch.enrolledStudents, UserPlus, "purple", () => setTab("students")],
          ["Available Seats", batch.availableSeats, Armchair, "orange", () => setTab("students")],
          ["Status", <span key="status" className={`mv17-status mv17-status--auto mv17-status--sm ${/active|ongoing/i.test(batch.status) ? "mv17-status--green" : /upcoming/i.test(batch.status) ? "mv17-status--blue" : "mv17-status--gray"}`}>{String(batch.status || "—").replace(/^\w/, (letter) => letter.toUpperCase())}</span>, CheckCircle2, "green", () => setTab("students")],
        ].map(([label, value, Icon, tone, onClick]) => <button key={label} type="button" onClick={onClick} className={`mv17-binfo__row is-${tone}`}><span className="mv17-binfo__icon"><Icon aria-hidden="true" /></span><span className="min-w-0 flex-1"><small>{label}</small><b>{value}</b></span><ChevronRight className="mv17-binfo__chev" aria-hidden="true" /></button>)}</div>
        {batch.description && <button type="button" onClick={() => setAboutOpen((open) => !open)} aria-expanded={aboutOpen} className="mv17-binfo__about"><span className="mv17-binfo__about-icon"><Info aria-hidden="true" /></span><span className="min-w-0 flex-1"><b>About this batch</b><small className={aboutOpen ? "" : "line-clamp-1"}>{batch.description}</small></span><ChevronRight className={`mv17-binfo__chev transition ${aboutOpen ? "rotate-90" : ""}`} aria-hidden="true" /></button>}
      </article>
      <article className="mv17-card mv17-enroll">
        <div className="mv17-card-title"><span className="mv17-card-title__icon is-orange"><UsersRound aria-hidden="true" /></span><div><h2>Enrollment</h2><p>Student enrollment and seat availability.</p></div></div>
        <Users className="mv17-enroll__deco" aria-hidden="true" />
        <p className="mv17-enroll__count">{batch.enrolledStudents} / {batch.capacity}</p>
        <p className="mv17-enroll__seats">{batch.availableSeats} seats available</p>
        <div className="mv17-enroll__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, occupancy)} aria-label="Seats filled"><i style={{ width: `${Math.min(100, occupancy)}%` }} /></div>
        <div className="mv17-enroll__scale"><span>{occupancy}% full</span><span>100%</span></div>
        <p className="mv17-enroll__note"><span aria-hidden="true"><CalendarDays /></span>{/active|ongoing/i.test(batch.status) ? (Number(batch.capacity) <= 0 ? "Seat capacity has not been set for this batch yet." : Number(batch.availableSeats) > 0 ? "This batch is currently active and students can enroll." : "This batch is active and all seats are filled.") : /upcoming/i.test(batch.status) ? "This batch has not started yet." : "This batch is closed for enrollment."}</p>
      </article>
    </section>}
    {activeTab === "students" && <section className="rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="text-sm font-bold">Students ({batch.enrolledStudents})</h2><p className="text-xs text-slate-500">Students enrolled in this batch only</p></div><label className="flex h-9 items-center gap-2 rounded-lg border px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students..." aria-label="Search students" className="w-64 max-w-[60vw] border-0 bg-transparent p-0 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0" /></label></div>{studentsError ? <div className="p-8 text-center"><p className="text-sm text-rose-600">{studentsError}</p><button onClick={loadWorkspace} className="mt-3 text-sm font-semibold text-blue-600">Retry</button></div> : filteredStudents.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Student", "Attendance", "Assessments", ...(showProgress ? ["Progress"] : []), "Status", "Action"].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody>{filteredStudents.map((student) => <tr key={student.studentId} className="border-t"><td className="px-4 py-3"><div className="flex items-center gap-3"><ProfileImage profileType={PROFILE_TYPE.STUDENT} profileId={student.studentId} name={student.name} size="sm" className="text-xs" fallbackClassName="bg-blue-50 text-blue-700" /><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.studentCode ? `Student ID: ${student.studentCode}` : "Student"}</p></div></div></td><td className="px-4 py-3">{student.attendance}%</td><td className="px-4 py-3">{assessments.length ? `${student.assessmentsCleared} / ${assessments.length}` : student.assessmentsCleared}</td>{showProgress && <td className="px-4 py-3">{student.progress == null ? "—" : `${student.progress}%`}</td>}<td className="px-4 py-3">{student.status}</td><td className="px-4 py-3"><button onClick={() => navigate(`/mentor/batches/${batchId}/students/${student.studentId}`)} className="font-semibold text-blue-600">View</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-500"><Users className="mx-auto mb-2 h-7 w-7" />No students enrolled in this batch.</div>}</section>}
    {activeTab === "assessments" && <section className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="text-sm font-bold">Batch assessments</h2><p className="text-xs text-slate-500">Quizzes, tests, and all assessments created for this batch</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{assessments.length} total</span></div>{assessmentsError ? <div className="p-8 text-center"><p className="text-sm text-rose-600">{assessmentsError}</p><button onClick={loadWorkspace} className="mt-3 text-sm font-semibold text-blue-600">Retry</button></div> : assessments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Assessment", "Type", "Date", "Duration", "Marks", "Status"].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody>{assessments.map((assessment) => <tr key={assessment.id} className="border-t transition hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-900">{assessment.title}</td><td className="px-4 py-3">{assessment.assessmentType ?? assessment.type ?? "Assessment"}</td><td className="px-4 py-3">{date(assessment.startDate ?? assessment.date ?? assessment.scheduledDate)}</td><td className="px-4 py-3">{Number(assessment.duration ?? assessment.durationMinutes ?? 0)} min</td><td className="px-4 py-3">{Number(assessment.totalMarks ?? assessment.total ?? 0)} / {Number(assessment.passingMarks ?? assessment.passMarks ?? assessment.pass ?? 0)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{assessment.status ?? "Draft"}</span></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-500"><ListChecks className="mx-auto mb-2 h-7 w-7" />No assessments have been created for this batch yet.</div>}</section>}
    {activeTab === "live-classes" && <section className="mv15 mentor-workspace-classes overflow-hidden rounded-xl border bg-white text-sm text-slate-500">{liveClasses.length ? <><div className="px-6 pt-4 pb-2 sm:px-10 sm:pt-8">{pagedLiveClasses.map((liveClass) => { const session = normalizeLiveClass(liveClass); return <div key={liveClass.liveClassId || liveClass.id} className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 text-left last:border-b-0"><div><p className="font-semibold text-slate-900">{liveClass.classTitle || "Untitled class"}</p><p className="mt-1 text-xs text-slate-500">{date(liveClass.scheduledDate)} · {liveClass.startTime || "—"} - {liveClass.endTime || "—"} · {liveClass.mentorName || batch.mentorName || "—"}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{session.statusLabel}</span>{canJoinLiveClass(session) ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">Join meeting</a> : session.status === "completed" && session.recordingUrl ? <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">View recording</a> : null}</div></div>; })}</div><div className="border-t border-[#eef2f7]"><Pager label="classes" first={classStart + 1} last={classStart + pagedLiveClasses.length} total={liveClasses.length} page={currentClassPage} pageCount={classPageCount} onPage={setClassPage} pageSize={classPageSize} onPageSize={(size) => { setClassPageSize(size); setClassPage(1); }} sizes={[10, 20, 30]} /></div></> : <p className="p-10 text-center">No live classes are scheduled for this batch yet.</p>}</section>}
    {!["overview", "students", "assessments", "live-classes"].includes(activeTab) && <section className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">{activeTab === "attendance" ? "Attendance data unavailable." : "No resources available for this batch."}</section>}
  </div></main>;
}

