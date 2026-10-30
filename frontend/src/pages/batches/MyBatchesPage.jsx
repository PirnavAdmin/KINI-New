import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, ChevronDown, Eye, Filter, GraduationCap, Layers3, LayoutGrid, List, MoreVertical, Search, UserCheck, UserRound, Users } from "lucide-react";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getMentorDashboardBatches } from "@shared/services/mentorService";
import { getMentorSessionIdentity } from "@features/mentor/utils/mentorSessionIdentity";
import { useAuth } from "@shared/hooks/useAuth";
import MentorBanner from "@features/mentor/components/MentorBanner";
import CourseCover from "@features/mentor/components/CourseCover";
import Pager from "@features/mentor/components/Pager";
import { MENTOR_BANNERS } from "@features/mentor/constants/mentorBanners";
import KPI from "@/components/common/KPI";

const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
// Compact card range: "1 Jun – 1 Dec 2026" when both dates share a year,
// otherwise both years are shown. The full range stays in the tooltip.
const formatShortRange = (start, end) => {
  const from = start ? new Date(start) : null;
  const to = end ? new Date(end) : null;
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from.getFullYear() !== to.getFullYear()) return `${formatDate(start)} – ${formatDate(end)}`;
  return `${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(from)} – ${formatDate(end)}`;
};
const normalize = (value) => String(value ?? "").trim().toLowerCase();
const active = (status) => ["active", "ongoing", "in progress", "in-progress"].includes(normalize(status));

const normalizeDashboardBatches = (payload) => {
  const source = payload?.batches ?? payload?.items ?? payload?.records ?? payload?.data ?? payload;
  const rows = Array.isArray(source) ? source : [];
  return rows.map((batch) => ({
    ...batch,
    batchId: batch.batchId ?? batch.id ?? batch.BatchId,
    batchName: batch.batchName ?? batch.name ?? batch.BatchName,
    courseName: batch.courseName ?? batch.course?.name ?? batch.course?.courseName ?? batch.CourseName,
    studentCount: Number(batch.studentCount ?? batch.studentsCount ?? batch.enrolledStudents ?? 0),
    capacity: Number(batch.capacity ?? 25),
  }));
};

const getStatusOptions = (batches) => Array.from(batches.reduce((options, batch) => {
  const value = normalize(batch.status);
  if (value && !options.has(value)) options.set(value, String(batch.status).trim());
  return options;
}, new Map([["completed", "Completed"], ["active", "Active"]])), ([value, label]) => ({ value, label }));

export default function MyBatchesPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [batches, setBatches] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [menuFor, setMenuFor] = useState(null);
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // The mentor is resolved from the Bearer token on the backend — this widget
  // needs no employeeId/mentorId/userId. Guessing an ID here previously drove
  // calls at /organization/employees/{userId}/batches and the full
  // organization batch list, neither of which is a valid source for a
  // mentor's own assigned batches.
  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await getMentorDashboardBatches();
      const normalizedBatches = normalizeDashboardBatches(payload);
      const confirmedEmployeeId = payload?.employeeId ?? payload?.data?.employeeId;
      if (confirmedEmployeeId !== undefined && confirmedEmployeeId !== null && String(confirmedEmployeeId).trim()) {
        localStorage.setItem("employeeId", String(confirmedEmployeeId));
      }
      setMetadata(payload);
      setBatches(normalizedBatches);
    } catch (requestError) {
      const statusCode = requestError?.response?.status;
      if (import.meta.env.DEV) {
        const identity = getMentorSessionIdentity(user);
        console.error("[API ERROR]", {
          endpoint: API_ENDPOINTS.mentorDashboard.batches,
          method: "GET",
          status: statusCode ?? "network error",
          component: "MyBatchesPage",
          apiHelper: "getMentorDashboardBatches",
          userId: identity.userId,
          employeeId: identity.employeeId,
          mentorId: identity.mentorId,
          role,
        });
      }
      setBatches([]);
      const apiMessage = requestError?.response?.data?.message || requestError?.response?.data?.title;
      setError(
        statusCode === 403
          ? "Batches access is not enabled for your mentor account. Ask your organization admin to enable Batches in Access & Permissions, then retry."
          : apiMessage || (statusCode ? `Unable to load your assigned batches (HTTP ${statusCode}).` : requestError?.message || "Unable to load your assigned batches."),
      );
    } finally {
      setLoading(false);
    }
  }, [user, role]);
  useEffect(() => {
    const timer = window.setTimeout(() => loadBatches(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBatches]);
  const filtered = useMemo(() => {
    const query = normalize(search);
    return batches.filter((batch) => {
      const matchesSearch = !query || [batch.batchName, batch.courseName]
        .some((value) => normalize(value).includes(query));
      const batchStatus = normalize(batch.status);
      const matchesStatus = status === "all"
        || batchStatus === status
        || (status === "active" && active(batchStatus))
        || (status === "completed" && batchStatus.includes("complete"));
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === "name") return String(a.batchName).localeCompare(String(b.batchName));
      const at = new Date(a.startDate).getTime() || 0;
      const bt = new Date(b.startDate).getTime() || 0;
      return sortBy === "oldest" ? at - bt : bt - at;
    });
  }, [batches, search, status, sortBy]);
  const totalStudents = batches.reduce((sum, batch) => sum + Number(batch.studentCount ?? 0), 0);
  const uniqueCourses = new Set(batches.map((batch) => batch.courseName).filter(Boolean)).size;
  useEffect(() => {
    if (menuFor == null) return undefined;
    const close = () => setMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuFor]);
  const statusOptions = useMemo(() => getStatusOptions(batches), [batches]);

  const progressOf = (batch) => Math.max(0, Math.min(100, Math.round(Number(batch.progress ?? batch.completionPercentage ?? batch.progressPercentage ?? 0) || 0)));

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = Math.min(currentPage * pageSize, filtered.length);
  const toneOf = (batch) => {
    const value = normalize(batch.status);
    if (active(value)) return "green";
    if (value.includes("complete")) return "blue";
    if (value.includes("cancel") || value.includes("inactive")) return "red";
    return "orange";
  };
  const showStatus = (value) => { setStatus((current) => (current === value ? "all" : value)); setPage(1); };
  const activeStatusValue = statusOptions.find((option) => active(option.value))?.value;

  return <main className="mentor-batches-page mv15 min-h-full px-3 py-3 sm:px-4"><div className="mentor-batches-content mx-auto max-w-[1500px]">
    <MentorBanner
      variant="batches"
      image={MENTOR_BANNERS.batches}
      eyebrow="Mentor Portal"
      eyebrowIcon={GraduationCap}
      title="My"
      highlight="Batches"
      subtitle="Manage and view all your assigned course batches in one place."
      featureShape="square"
      features={[
        { icon: Users, title: "Track", text: "Students", tone: "purple" },
        { icon: CalendarDays, title: "Manage", text: "Schedules", tone: "green" },
        { icon: BarChart3, title: "Monitor", text: "Progress", tone: "orange" },
        { icon: UserCheck, title: "Build", text: "Better Learners", tone: "blue" },
      ]}
      script={["Empower Learners", "Build Tomorrow"]}
    />
    <section className="mentor-batches-summary" aria-label="Batch summary">
      <KPI variant="top" iconShape="circle" showArrow accent="blue" icon={Layers3} label="Total Batches" value={metadata?.totalRecords ?? batches.length} description="Assigned to you" loading={loading} onClick={() => showStatus("all")} />
      <KPI variant="top" iconShape="circle" showArrow accent="green" icon={CheckCircle2} label="Active Batches" value={batches.filter((batch) => active(batch.status)).length} description="Currently teaching" loading={loading} onClick={() => activeStatusValue && showStatus(activeStatusValue)} />
      <KPI variant="top" iconShape="circle" showArrow accent="purple" icon={Users} label="Total Students" value={totalStudents} description="Across all batches" loading={loading} onClick={() => navigate("/mentor/students")} />
      <KPI variant="top" iconShape="circle" showArrow accent="orange" icon={BookOpen} label="Total Courses" value={uniqueCourses} description="Unique courses" loading={loading} onClick={() => navigate("/mentor/courses")} />
    </section>
    <section className="mv15-toolbar" role="search">
      <label htmlFor="mentor-batch-search" className="mv15-field mv15-field--grow">
        <Search aria-hidden="true" />
        <input id="mentor-batch-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search batches or courses..." />
      </label>
      <div className="relative">
        <button type="button" className="mv15-field mv15-field--select w-full" aria-label="Filter batches by status" aria-expanded={statusMenuOpen} onClick={() => setStatusMenuOpen((open) => !open)}>
          <Filter aria-hidden="true" />
          <span>{status === "all" ? "All Statuses" : statusOptions.find((option) => option.value === status)?.label ?? status}</span>
          <ChevronDown aria-hidden="true" className={`mv15-field__chevron transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
        </button>
        {statusMenuOpen && <div className="mv15-menu__list absolute right-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="menu">
          {[{ value: "all", label: "All Statuses" }, ...statusOptions].map((option) => <button key={option.value} type="button" role="menuitem" className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${status === option.value ? "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"}`} onClick={() => { setStatus(option.value); setStatusMenuOpen(false); setPage(1); }}>{option.label}</button>)}
        </div>}
      </div>
      <label className="mv15-field mv15-field--select">
        <ArrowDownUp aria-hidden="true" />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort batches"><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="name">Name A–Z</option></select>
        <ChevronDown aria-hidden="true" className="mv15-field__chevron" />
      </label>
      <div className="mv15-view-toggle" role="group" aria-label="Layout">
        <button type="button" aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => setView("grid")}><LayoutGrid /></button>
        <button type="button" aria-pressed={view === "list"} aria-label="List view" onClick={() => setView("list")}><List /></button>
      </div>
    </section>
    {loading ? <div className="grid gap-3.5 lg:grid-cols-2">{[1, 2].map((key) => <div key={key} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}</div> : error ? <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center"><p className="text-sm font-semibold text-rose-600">{error}</p><button onClick={loadBatches} className="mt-3 rounded-xl bg-[#f39924] px-4 py-2 text-sm font-semibold text-white">Retry</button></div> : <section className={`mv15-batch-grid ${view === "list" ? "is-list" : ""}`}>{pageRows.map((batch) => {
      const tone = toneOf(batch);
      const progress = progressOf(batch);
      const students = Number(batch.studentCount ?? 0);
      const capacity = Number(batch.capacity ?? 25);
      const seatsLeft = Math.max(0, capacity - students);
      const description = batch.courseDescription ?? batch.course?.description ?? batch.description;
      const open = () => navigate(`/mentor/batches/${batch.batchId}`);
      return <article key={batch.batchId} data-ui="mentor-batch-card" className={`mv15-batch mv15-batch--${tone}`}>
        <div className="mv15-batch__cover">
          <CourseCover name={batch.courseName || batch.batchName} imageUrl={batch.courseImageUrl ?? batch.imageUrl ?? batch.course?.imageUrl} />
          <span className={`mv15-batch__badge mv15-batch__badge--${tone}`}>{batch.status || "—"}</span>
        </div>
        <div className="mv15-batch__body">
          <div className="mv15-batch__head">
            <div className="min-w-0">
              <div className="mv15-batch__titlerow"><h2>{batch.batchName}</h2><span className="mv15-chip">Batch ID: {batch.batchId}</span></div>
              <p className="mv15-batch__course">Course: {batch.courseName || "—"}</p>
            </div>
            <div className="relative">
              <button type="button" className="mv15-kebab" aria-label={`More actions for ${batch.batchName}`} aria-haspopup="menu" aria-expanded={menuFor === batch.batchId} onClick={(event) => { event.stopPropagation(); setMenuFor((current) => (current === batch.batchId ? null : batch.batchId)); }}><MoreVertical /></button>
              {menuFor === batch.batchId && <div role="menu" className="mv15-menu__list">
                <button type="button" role="menuitem" onClick={open}><Eye />View batch</button>
                <button type="button" role="menuitem" onClick={() => navigate(`/mentor/batches/${batch.batchId}?tab=students`)}><Users />View students</button>
              </div>}
            </div>
          </div>
          {description && <p className="mv15-batch__desc">{description}</p>}
          <div className="mv15-batch__stats">
            <div><Users aria-hidden="true" /><span><b>{students} / {capacity}</b><small>Students</small></span></div>
            <div><CalendarDays aria-hidden="true" /><span title={`${formatDate(batch.startDate)} – ${formatDate(batch.endDate)}`}><b>{formatShortRange(batch.startDate, batch.endDate)}</b><small>Duration</small></span></div>
            <div className="mv15-batch__progress"><span className="mv15-batch__bar"><i style={{ width: `${progress}%` }} /></span><b>{progress}%</b><small>Progress</small></div>
          </div>
          <div className="mv15-batch__foot">
            <div className="mv15-batch__seats">
              {students > 0 && <span className="mv15-avatars" aria-hidden="true">
                {Array.from({ length: Math.min(3, students) }, (_, index) => <i key={index} className={`mv15-avatars__dot mv15-avatars__dot--${index}`}><UserRound /></i>)}
                {students > 3 && <i className="mv15-avatars__more">+{students - 3}</i>}
              </span>}
              <span>{seatsLeft} seats remaining</span>
            </div>
            <button type="button" onClick={open} className={`mv15-outline-btn mv15-outline-btn--${tone}`}><Eye />View Batch<ArrowRight /></button>
          </div>
        </div>
      </article>;
    })}</section>}
    {!loading && !error && !filtered.length && <div className="mentor-batches-empty rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">{batches.length ? "No batches match your filters." : "No batches assigned yet."}</div>}
    {!loading && !error && filtered.length > 0 && <Pager label="batches" first={firstShown} last={lastShown} total={filtered.length} page={currentPage} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={(size) => { setPageSize(size); setPage(1); }} />}
  </div></main>;
}
