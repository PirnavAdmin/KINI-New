import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowDown,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  CircleX,
  Clock3,
  ClipboardList,
  Download,
  FileText,
  Filter,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { HeroWaves } from "@features/organization/components/org-ui/OrgIllustrations";
import { ResultsArt } from "@features/mentor/components/MentorHeroArt";
import toast from "react-hot-toast";
import StudentPerformanceModal from "./StudentPerformanceModal";
import { normalizeAssessmentStudentResults, scoreDistribution, displayValue } from "./assessmentResultsData";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import assessmentService from "@/services/assessmentService";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AssessmentResults(props) {
  return <AssessmentResultsContent key={props.assessment?.assessmentId ?? props.assessment?.id} {...props} />;
}

function AssessmentResultsContent({
  assessment,
  onClose,
  onPublish,
}) {
  const [rows, setRows] = useState([]);
  const [panel, setPanel] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState({ key: "index", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuFor, setMenuFor] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [performanceCache] = useState(() => new Map());
  const selectedAssessmentId = assessment?.assessmentId ?? assessment?.id;
  const totalMarks = resultData?.totalMarks ?? null;

  useEffect(() => {
    if (!assessment) return undefined;

    const close = (event) => { if (event.key === "Escape" && !performance) onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [assessment, onClose, performance]);

  useEffect(() => {
    if (!assessment) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError(''); setRows([]);
      try {
        const payload = await assessmentService.getAssessmentStudentResults(selectedAssessmentId, { search: query.trim(), pageNumber: page, pageSize }, { signal: controller.signal });
        const data = normalizeAssessmentStudentResults(payload, selectedAssessmentId);
        if (!controller.signal.aborted) { setRows(data.students); setResultData(data); }
      } catch (failure) {
        if (!controller.signal.aborted) { setRows([]); setResultData(null); setError(getApiErrorMessage(failure, 'Unable to load assessment results.')); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selectedAssessmentId, assessment, page, pageSize, query, reloadKey]);

  const evaluated = rows.length > 0 && rows.every((r) => r.state !== "Pending evaluation");
  const attemptedRows = rows.filter((row) => row.attempts > 0);
  const passedRows = rows.filter((row) => row.state === "Pass");
  const failedRows = rows.filter((row) => row.state === "Fail");
  const absentRows = rows.filter((row) => row.state === "Absent");
  const scoredRows = rows.filter((row) => typeof row.score === "number");
  const average =
    scoredRows.length > 0
      ? `${(
          scoredRows.reduce((sum, row) => sum + row.score, 0) / scoredRows.length
        ).toFixed(1)}/${displayValue(totalMarks)}`
      : "—";
  const highest =
    scoredRows.length > 0
      ? `${Math.max(...scoredRows.map((row) => row.score))}/${displayValue(totalMarks)}`
      : "—";
  const lowest =
    scoredRows.length > 0
      ? `${Math.min(...scoredRows.map((row) => row.score))}/${displayValue(totalMarks)}`
      : "—";
  const distribution = useMemo(() => scoreDistribution(rows), [rows]);

  const visibleRows = useMemo(() => {
    const list = rows
      .map((row, index) => ({ ...row, index }))
      .filter((row) => stateFilter === "all" || row.state === stateFilter);
    const value = (row) => {
      if (sort.key === "name") return String(row.name).toLowerCase();
      if (sort.key === "email") return String(row.email).toLowerCase();
      if (sort.key === "at") return new Date(row.at).getTime() || 0;
      if (sort.key === "score") return row.score ?? -1;
      if (sort.key === "state") return row.state;
      return row.index;
    };
    return list.sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const result = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === "asc" ? result : -result;
    });
  }, [rows, stateFilter, sort]);

  if (!assessment) return null;

  const pageCount = Math.max(1, resultData?.totalPages ?? 1);
  const currentPage = resultData?.pageNumber ?? page;
  const pageRows = visibleRows;
  const firstShown = visibleRows.length ? (currentPage - 1) * (resultData?.pageSize ?? pageSize) + 1 : 0;
  const lastShown = firstShown ? firstShown + visibleRows.length - 1 : 0;
  const toggleSort = (key) => setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));
  const exportRows = () => {
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [["Student", "Email", "Attempted at", "Score", "Percentage", "Status", "Attempts"], ...visibleRows.map((row) => [row.name, row.email, formatDateTime(row.at), row.score ?? "", row.percentage == null ? "" : String(row.percentage) + "%", row.state, row.attempts])];
    const url = URL.createObjectURL(new Blob([lines.map((line) => line.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${String(resultData?.assessmentTitle || "assessment").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-results.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast.success("Results exported");
  };
  const initials = (name) => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const avatarTones = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-orange-100 text-orange-700", "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700"];
  const statePill = (state) => state === "Unavailable" ? ["bg-slate-100 text-slate-600", "bg-slate-400"] : state === "Submitted" ? ["bg-blue-50 text-blue-700", "bg-blue-500"] : state === "Pass" ? ["bg-emerald-50 text-emerald-700", "bg-emerald-500"] : state === "Fail" ? ["bg-rose-50 text-rose-700", "bg-rose-500"] : state === "Absent" ? ["bg-slate-100 text-slate-600", "bg-slate-400"] : ["bg-orange-50 text-orange-700", "bg-orange-500"];
  const bucketColors = ["#2f6fe4", "#16b889", "#f39924", "#7c4ddb", "#0ea5e9"];
  const maxBucket = Math.max(15, ...distribution.map((bucket) => bucket.count));
  const kpis = [
    ["Attempted", attemptedRows.length, ClipboardList, "#2f6fe4", "#e8f1ff", "all"],
    ["Passed", passedRows.length, CircleCheck, "#13a36b", "#e3f7ef", "Pass"],
    ["Failed", failedRows.length, CircleX, "#e5484d", "#ffe6e8", "Fail"],
    ["Absent", absentRows.length, Clock3, "#ea8a0b", "#fff1df", "Absent"],
    ["Average", average, BarChart3, "#7c4ddb", "#f1ebfe", null],
    ["Highest", highest, TrendingUp, "#0d9488", "#e3f6f4", null],
    ["Lowest", lowest, ArrowDown, "#4b5f78", "#eef2f7", null],
  ];
  const sortTh = (key, label, variant, alignment = "justify-between") => (
    <th data-th-variant={variant} className="whitespace-nowrap">
      <button type="button" onClick={() => toggleSort(key)} className={`inline-flex w-full items-center ${alignment} gap-2 whitespace-nowrap uppercase`}>
        {label}<ChevronsUpDown className={`h-3.5 w-3.5 ${sort.key === key ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
      </button>
    </th>
  );

  const openPerformance = row => { setMenuFor(null); setPerformance(row); };
  const refreshResults = () => {
    if (performance) performanceCache.delete(String(performance.id));
    setReloadKey(key => key + 1);
  };

  const evaluate = () => toast.error("Evaluation submission is unavailable: no evaluation API is configured for this screen.");

  return createPortal(
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#0b1f36]/45 p-3 backdrop-blur-[3px]"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-results-title"
        className="flex max-h-[calc(100vh-24px)] w-full max-w-[1200px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#f8fafd] shadow-[0_30px_90px_rgba(15,23,42,.3)] dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="relative isolate flex shrink-0 justify-between overflow-hidden bg-gradient-to-r from-[#f7faff] via-[#eff5fd] to-[#e3edfb] px-6 py-4 dark:from-slate-900 dark:to-slate-800">
          <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-20"><HeroWaves tone="blue" /></div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#2f6fe4]">Assessment results</p>
            <h2 id="assessment-results-title" className="mt-1 text-[28px] font-extrabold leading-tight !text-[#0f2a4a] dark:!text-white">{displayValue(resultData?.assessmentTitle)}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#4b5f78] dark:text-slate-300">
              <span className="inline-flex items-center gap-2"><Users className="h-5 w-5 text-[#2f6fe4]" />{displayValue(resultData?.courseName)} · {displayValue(resultData?.batchName)}</span>
              <span className="h-4 w-px bg-[#c9d6e6]" aria-hidden="true" />
              <span className="inline-flex items-center gap-2"><FileText className="h-5 w-5 text-[#2f6fe4]" />{displayValue(totalMarks)} Total Marks</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#2f6fe4]" />{displayValue(resultData?.passingMarks)} Pass Marks</span>
            </p>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-20 hidden h-[110px] w-[200px] md:block"><ResultsArt /></div>
          <button
            onClick={onClose}
            aria-label="Close assessment results"
            className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#133b5d] hover:bg-white/80 dark:text-slate-200"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {kpis.map(([label, value, Icon, color, soft, filter]) => {
              const Tag = filter ? "button" : "div";
              return (
                <Tag
                  key={label}
                  {...(filter ? { type: "button", onClick: () => { setStateFilter(filter); setPage(1); }, "aria-label": `Show ${label.toLowerCase()} students` } : {})}
                  className={`relative flex min-h-[100px] items-center gap-3 overflow-hidden rounded-2xl border bg-white px-3.5 py-3 text-left shadow-[0_4px_14px_rgba(15,42,74,.05)] transition dark:bg-slate-900 ${filter ? "hover:-translate-y-0.5" : ""} ${filter && stateFilter === filter && filter !== "all" ? "ring-2 ring-offset-1" : ""}`}
                  style={{ borderColor: `${color}33`, "--tw-ring-color": `${color}66` }}
                >
                  <svg aria-hidden="true" viewBox="0 0 200 70" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 right-0 h-[60%] w-[70%]"><path d="M0 70 C40 68 70 40 120 30 C150 24 180 22 200 18 V70 Z" fill={color} fillOpacity=".12" /><path d="M60 70 C95 66 120 48 150 42 C175 37 190 34 200 32 V70 Z" fill={color} fillOpacity=".16" /></svg>
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: soft, color }}><Icon className="h-6 w-6" /></span>
                  <div className="relative min-w-0">
                    <p className="truncate text-[26px] font-extrabold leading-none" style={{ color: label === "Attempted" ? "#0f2a4a" : color }}>{value}</p>
                    <p className="mt-1.5 text-[14px] font-semibold text-[#133b5d] dark:text-slate-200">{label}</p>
                  </div>
                  <span aria-hidden="true" className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full" style={{ backgroundColor: soft, color }}><ChevronRight className="h-3.5 w-3.5" /></span>
                </Tag>
              );
            })}
          </div>

          <section className="mt-3 rounded-2xl border border-[#e6edf6] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(15,42,74,.04)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1ff] text-[#2f6fe4]"><BarChart3 className="h-5 w-5" /></span>Score Distribution</h3>
              <select aria-label="Distribution grouping" className="h-10 rounded-xl border border-[#dfe7f1] bg-white px-3 text-sm font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option>Percentage ranges</option></select>
            </div>
            <div className="mt-3 flex gap-3">
              <div className="flex h-[110px] flex-col justify-between pb-6 text-right text-xs text-[#4b5f78]" aria-hidden="true">{[maxBucket, Math.round(maxBucket * 2 / 3), Math.round(maxBucket / 3), 0].map((tick) => <span key={tick}>{tick}</span>)}</div>
              <div className="flex h-[110px] flex-1 items-end gap-4 border-b border-l border-[#e3e9f1] px-4 dark:border-slate-700">
                {distribution.map((bucket, index) => (
                  <div key={bucket.label} className="relative flex h-full flex-1 flex-col items-center justify-end">
                    <span className="mb-2 grid h-8 min-w-9 place-items-center rounded-lg px-2 text-base font-bold" style={{ backgroundColor: `${bucketColors[index]}1f`, color: bucketColors[index] }}>{bucket.count}</span>
                    <div className="w-full rounded-t-md" style={{ height: `${Math.max(4, (bucket.count / maxBucket) * 70)}px`, backgroundColor: bucketColors[index] }} />
                    <span className="absolute -bottom-6 text-sm text-[#133b5d] dark:text-slate-300">{bucket.label.replace("–", " – ")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-6" /><p className="mt-2 text-xs text-slate-500">Summary, distribution, filters and export cover the current page.</p>
          </section>

          {error && (
            <div role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
              <div className="flex items-center justify-between gap-3">
                <span>{error}</span>
                <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 dark:bg-slate-900 dark:text-rose-200">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2.5" role="search">
            <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-slate-400 focus-within:border-[#2f6fe4] dark:border-slate-700 dark:bg-slate-800">
              <Search className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Search students</span>
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by student name or email..." className="h-full w-full !border-0 !bg-transparent !p-0 text-[15px] text-slate-900 !shadow-none !outline-none !ring-0 dark:text-white" />
            </label>
            <div className="relative">
              <button type="button" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-[15px] font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Filter className="h-4 w-4" />Filter{stateFilter !== "all" ? " (1)" : ""}</button>
              {filterOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#e6edf6] bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {[["all", "All students"], ["Pending evaluation", "Pending evaluation"], ["Pass", "Passed"], ["Fail", "Failed"], ["Absent", "Absent"]].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => { setStateFilter(value); setPage(1); setFilterOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${stateFilter === value ? "bg-[#fff4e6] font-bold text-[#133b5d]" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>{label}</button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={exportRows} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-[15px] font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Download className="h-4 w-4" />Export</button>
            <button type="button" onClick={() => { setFilterOpen(false); refreshResults(); }} aria-label="Refresh results" className="grid h-11 w-11 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /></button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e6edf6] bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full min-w-[1080px] table-fixed border-separate border-spacing-x-1 text-left text-sm">
              <colgroup>
                <col style={{ width: 42 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 190 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 170 }} />
                <col style={{ width: 78 }} />
                <col style={{ width: 120 }} />
              </colgroup>
              <thead>
                <tr>
                  <th data-th-variant="blue" className="w-10">#</th>
                  {sortTh("name", "Student", "purple")}
                  {sortTh("email", "Email", "blue", "justify-center")}
                  {sortTh("at", "Attempted at", "green", "justify-center")}
                  {sortTh("score", "Score", "orange", "justify-center")}
                  <th data-th-variant="red" className="whitespace-nowrap text-center">Percentage</th>
                  {sortTh("state", "Status", "blue")}
                  <th data-th-variant="purple" className="whitespace-nowrap text-center">Attempts</th>
                  <th data-th-variant="blue" className="whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan={9}>
                      <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading assessment results...</span>
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan={9}>{rows.length ? "No students match your filters." : "No student results available."}</td>
                  </tr>
                ) : (
                  pageRows.map((row, position) => {
                    const [pill, dot] = statePill(row.state);
                    return (
                      <tr key={String(row.id) + ":" + (row.studentAssessmentId ?? position)} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="border-b border-slate-100 px-3 py-2.5 text-[#4b5f78] dark:border-slate-800">{firstShown + position}</td>
                        <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800"><span className="flex items-center gap-2.5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${avatarTones[row.index % avatarTones.length]}`}>{row.profilePhotoUrl ? <img src={row.profilePhotoUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : initials(row.name)}</span><b className="text-[#0f2a4a] dark:text-white">{row.name}</b></span></td>
                        <td className="border-b border-slate-100 px-3 py-2.5 text-center text-[#2f5fa8] dark:border-slate-800 dark:text-blue-300"><span className="block truncate">{row.email}</span></td>
                        <td className="border-b border-slate-100 px-3 py-2.5 text-center dark:border-slate-800">{formatDateTime(row.at)}</td>
                        <td className="border-b border-slate-100 px-3 py-2.5 text-center dark:border-slate-800">{row.score === null ? "—" : `${row.score}/${displayValue(totalMarks)}`}</td>
                        <td className="border-b border-slate-100 px-3 py-2.5 text-center dark:border-slate-800">{row.percentage === null ? "—" : `${row.percentage}%`}</td>
                        <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${pill}`}><span className={`h-2 w-2 rounded-full ${dot}`} />{row.state}</span></td>
                        <td className="border-b border-slate-100 px-3 py-2.5 text-center dark:border-slate-800">{displayValue(row.attempts)}</td>
                        <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                          <div className="relative flex items-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => { setPanel(row); setMarks(row.score ?? ""); setFeedback(""); setReason(""); }}
                              className="rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-xs font-bold text-[#1d4f91] hover:bg-[#d8e8ff]"
                            >
                              {row.state === "Pending evaluation" ? "Evaluate" : row.score !== null ? "Recheck" : "View answers"}
                            </button>
                            <button type="button" aria-label={`More actions for ${row.name}`} aria-expanded={menuFor === row.id} onClick={() => setMenuFor((current) => (current === row.id ? null : row.id))} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><MoreVertical className="h-4 w-4" /></button>
                            {menuFor === row.id && (
                              <div role="menu" className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-[#e6edf6] bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <button type="button" role="menuitem" disabled={row.id == null} onClick={() => openPerformance(row)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#133B5D] hover:bg-slate-50">View Performance</button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={!(row.attempts > 0 && row.state !== "Pending evaluation")}
                                  onClick={() => {
                                    setFlagged((items) => items.includes(row.id) ? items.filter((id) => id !== row.id) : [...items, row.id]);
                                    toast.success(flagged.includes(row.id) ? `Review flag removed for ${row.name}.` : `${row.name}'s submission was flagged for review.`);
                                    setMenuFor(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                                >
                                  <AlertTriangle size={14} />{flagged.includes(row.id) ? "Remove review flag" : "Flag for review"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {panel && (
            <div className="mb-4 mt-3 rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
                  <h3 className="font-bold">Student written answer</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    Written answers are not included in the results API response.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold">Evaluation: {panel.name}</h3>
                  {panel.score !== null && (
                    <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
                      Existing score: {panel.score}/{totalMarks}. A reason
                      is required to change it.
                    </p>
                  )}
                  <input
                    type="number"
                    min="0"
                    max={totalMarks}
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder={`Marks out of ${totalMarks}`}
                    className="mt-3 w-full rounded-lg border p-2 dark:bg-slate-900"
                  />
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback"
                    className="mt-2 w-full rounded-lg border p-2 dark:bg-slate-900"
                    rows="3"
                  />
                  {panel.score !== null && (
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for changing marks *"
                      className="mt-2 w-full rounded-lg border p-2 dark:bg-slate-900"
                    />
                  )}
                  <button
                    onClick={evaluate}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Submit evaluation
                  </button>
                </div>
              </div>
            </div>
          )}

          {performance && <StudentPerformanceModal key={performance.id} studentId={performance.id} cache={performanceCache} refreshKey={reloadKey} onClose={() => setPerformance(null)} onRefresh={refreshResults} />}

        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#e6edf6] bg-white px-6 py-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[15px] text-[#4b5f78]">Showing {firstShown} to {lastShown} of {resultData?.totalStudents ?? 0} records</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Previous page" disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, index) => Math.max(1, Math.min(currentPage - 2, pageCount - 4)) + index).map((number) => (
              <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)} className={`grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold ${number === currentPage ? "bg-[#1f6fe5] text-white" : "border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{number}</button>
            ))}
            <button type="button" aria-label="Next page" disabled={loading || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
            <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-10 rounded-xl border border-[#dfe7f1] bg-white px-3 text-sm font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{[10, 20, 50].map((size) => <option key={size} value={size}>{size} per page</option>)}</select>
            <span className="mx-1 hidden h-8 w-px bg-[#e3e9f1] lg:block" aria-hidden="true" />
          {assessment.status === "Results Published" ? (
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Results published
            </span>
          ) : (
            <button
              disabled={!evaluated}
              onClick={() => {
                onPublish?.(assessment.id);
                toast.success(
                  "Results published to all students. They have been notified.",
                );
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish results
            </button>
          )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
