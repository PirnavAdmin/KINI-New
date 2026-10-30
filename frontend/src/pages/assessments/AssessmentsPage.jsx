import useDashboardFormReturn from '@shared/hooks/useDashboardFormReturn';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowUpDown, BarChart3, CalendarClock, CheckCircle2, CircleCheck, ClipboardList, Clock, Eye, Filter, LockKeyhole, Pencil, Plus, RotateCcw, Search, Send, Settings2, Trash2, X, Users, FileText } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAssessments } from "../../hooks/useAssessments";
import CreateAssessment from "./CreateAssessment";
import AssessmentResults from "./AssessmentResults";
import assessmentService, { toAssessmentScheduleTimestamp, toQuestionPayload } from "../../services/assessmentService";
import {
  OrgEmpty,
  OrgHero,
  OrgKpiCard,
  OrgPage,
  OrgRowMenu,
  OrgSearch,
  OrgSelect,
  OrgStatus,
  OrgTableFooter,
  monthOverMonth,
  toDate,
  usePaged,
} from "@features/organization/components/org-ui/OrgPageKit";
import { AssessmentArt } from "@features/organization/components/org-ui/OrgIllustrations";
import OrgShowcaseHero from "@features/organization/components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";

const PAGE_SIZE = 10;
// Accent colours cycled across table rows (left edge + soft tint).
const ROW_TONES = ["blue", "orange", "sky", "green", "purple", "amber", "indigo", "rose"];
const DEFAULT_FILTERS = { batch: "All", type: "All", status: "All", search: "", from: "", to: "" };
const SORT_OPTIONS = [
  ["latest", "Sort by: Newest"],
  ["oldest", "Sort by: Oldest"],
  ["name", "Sort by: Name"],
  ["pass", "Sort by: Pass %"],
  ["attempted", "Sort by: Attempts"],
];
const STATUS_STYLE = {
  Published: { tone: "success", icon: CircleCheck },
  "Results Published": { tone: "success", icon: CircleCheck },
  Completed: { tone: "success", icon: CircleCheck },
  Scheduled: { tone: "info", icon: CalendarClock },
  Active: { tone: "purple", icon: Activity },
  Draft: { tone: "muted", icon: Clock },
  default: { tone: "muted", icon: null },
};
import Modal from "@shared/components/Modal";
import { getApiErrorMessage } from "@shared/services/apiServices";

const toEditorQuestion = (question = {}) => {
  const options = Array.isArray(question.options) ? question.options : [];
  const correctIndex = options.findIndex((option) => option?.isCorrect);
  return {
    id: question.questionId ?? question.id,
    apiQuestionId: question.questionId ?? question.id,
    text: question.questionText ?? question.text ?? "",
    type: question.questionType ?? question.type ?? "MCQ",
    marks: Number(question.marks) || 1,
    difficulty: question.difficulty ?? "",
    options: options.length ? options.map((option) => option?.optionText ?? String(option ?? "")) : ["", "", "", ""],
    correct: correctIndex >= 0 ? correctIndex : 0,
    answer: question.correctAnswer ?? question.answer ?? "",
  };
};

export default function AssessmentsPage() {
  const { assessments, setAssessments, batches, courses, stats, audit, setAudit, loading, error, refresh } =
    useAssessments();
  const [searchParams, setSearchParams] = useSearchParams();
  // Organization gets the illustrated v18 banner; mentors keep their v17 hero.
  const pathname = useLocation().pathname;
  const isOrgView = pathname.startsWith("/organization");
  // The import endpoint is the mentor one (POST /api/v1/mentor/assessments/import-pdf).
  const isMentorView = pathname.startsWith("/mentor");
  // Preserve API-provided types (including legacy Test records) without
  // extending the backend's accepted create/edit enum.
  const typeOptions = useMemo(() => {
    const types = new Map(["MCQ", "Coding", "Mixed"].map((type) => [type.toLowerCase(), type]));
    assessments.forEach(({ type }) => {
      const value = String(type ?? "").trim();
      if (value) types.set(value.toLowerCase(), value.toLowerCase() === "test" ? "Test" : value);
    });
    return [["All", "All types"], ...[...types].map(([value, label]) => [value, label])];
  }, [assessments]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS),
    [sortBy, setSortBy] = useState("latest"),
    [showAdvanced, setShowAdvanced] = useState(false),
    [selected, setSelected] = useState(() => new Set()),
    [bulkDeleteOpen, setBulkDeleteOpen] = useState(false),
    [drawer, setDrawer] = useState(false),
    [editing, setEditing] = useState(null),
    [results, setResults] = useState(null),
    [editingLoading, setEditingLoading] = useState(false),
    [publishingId, setPublishingId] = useState(null),
    [deleteTarget, setDeleteTarget] = useState(null),
    [deleting, setDeleting] = useState(false);
  useDashboardFormReturn(drawer);
  useEffect(() => {
    if (searchParams.get("create") !== "true" || loading) return;
    setEditing(null);
    setDrawer(true);
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    setSearchParams(next, { replace: true });
  }, [loading, searchParams, setSearchParams]);
  const getBatch = (id) => batches.find((b) => b.id === id);
  const handlePublish = async (assessment) => {
    const assessmentId = assessment.assessmentId ?? assessment.id;
    setPublishingId(assessmentId);
    try {
      // The backend rejects publish (400) unless SUM(question.marks) exactly
      // equals assessment.totalMarks. Re-check against freshly-fetched data
      // (never the locally-cached list row) before sending the request, so
      // a stale/mismatched paper is caught with a clear message instead of
      // a round-trip 400 — and so the check reflects every question the
      // backend actually has, not just whatever was last rendered here.
      const [freshAssessment, freshQuestions] = await Promise.all([
        assessmentService.getAssessmentById(assessmentId),
        assessmentService.getQuestions(assessmentId),
      ]);
      const assessmentTotalMarks = Number(freshAssessment?.totalMarks ?? freshAssessment?.total ?? 0);
      const questionMarksTotal = (Array.isArray(freshQuestions) ? freshQuestions : [])
        .reduce((sum, question) => sum + Number(question?.marks ?? 0), 0);
      if (questionMarksTotal !== assessmentTotalMarks) {
        const diff = Math.abs(assessmentTotalMarks - questionMarksTotal);
        toast.error(
          questionMarksTotal < assessmentTotalMarks
            ? `Cannot publish. Add ${diff} more mark${diff === 1 ? "" : "s"} to questions (currently ${questionMarksTotal}/${assessmentTotalMarks}).`
            : `Cannot publish. Reduce question marks by ${diff} (currently ${questionMarksTotal}/${assessmentTotalMarks}).`,
          { duration: 6000 },
        );
        return;
      }
      const result = await assessmentService.publishAssessment(assessmentId);
      toast.success(result?.message || "Assessment published.");
      await refresh();
      setAssessments((items) => items.map((item) => String(item.id) === String(assessmentId) ? { ...item, status: "Published" } : item));
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to publish assessment."));
    } finally {
      setPublishingId(null);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const assessmentId = deleteTarget.assessmentId ?? deleteTarget.id;
    setDeleting(true);
    try {
      await assessmentService.deleteAssessment(assessmentId);
      toast.success("Assessment deleted.");
      setDeleteTarget(null);
      await refresh();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to delete assessment."));
    } finally {
      setDeleting(false);
    }
  };
  const openEditor = async (assessment) => {
    setEditingLoading(true);
    try {
      const assessmentId = assessment.assessmentId ?? assessment.id;
      const [details, questions] = await Promise.all([
        assessmentService.getAssessmentById(assessmentId),
        assessmentService.getQuestions(assessmentId),
      ]);
      setEditing({
        ...assessment,
        ...details,
        id: details.assessmentId ?? details.id ?? assessmentId,
        assessmentId: details.assessmentId ?? details.id ?? assessmentId,
        name: details.title ?? assessment.name,
        batchId: String(details.batchId ?? assessment.batchId),
        type: details.assessmentType ?? assessment.type ?? "MCQ",
        start: details.startDate ?? details.start ?? details.scheduledAt ?? details.scheduledDate ?? assessment.start,
        end: details.endDate ?? details.end ?? assessment.end,
        total: Number(details.totalMarks ?? details.total ?? assessment.total),
        pass: Number(details.passingMarks ?? details.passMarks ?? details.pass ?? assessment.pass),
        questions: [...questions].sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0)).map(toEditorQuestion),
      });
      setDrawer(true);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to load assessment details."));
    } finally {
      setEditingLoading(false);
    }
  };
  // Deep-linked from Batch Details → Assessments ("Add Assessment"/"View
  // Details"), which cannot safely preset the create/edit drawer itself (its
  // open/edit branching keys off `editing` being non-null, so a synthetic
  // partial object would be misread as "editing an existing assessment").
  // Preselecting the batch filter and opening the read-only results view are
  // both safe, additive uses of existing state.
  const batchParam = searchParams.get("batch");
  useEffect(() => {
    if (batchParam && batches.some((b) => b.id === batchParam)) {
      setFilters((current) => (current.batch === batchParam ? current : { ...current, batch: batchParam }));
    }
  }, [batchParam, batches]);
  const viewParam = searchParams.get("view");
  useEffect(() => {
    if (!viewParam || loading) return;
    const target = assessments.find((a) => String(a.id ?? a.assessmentId) === String(viewParam));
    if (target) setResults({ ...target, batch: target.batchName || getBatch(target.batchId)?.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam, loading, assessments]);
  const list = useMemo(() => {
    const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;
    const rows = assessments.filter((a) => {
      if (filters.batch !== "All" && a.batchId !== filters.batch) return false;
      if (filters.type !== "All" && String(a.type ?? "").trim().toLowerCase() !== filters.type) return false;
      if (filters.status !== "All" && a.status !== filters.status) return false;
      if (filters.search && !String(a.name ?? "").toLowerCase().includes(filters.search.toLowerCase())) return false;
      const date = toDate(a.date);
      if (from && (!date || date < from)) return false;
      if (to && (!date || date > to)) return false;
      return true;
    });
    const time = (a) => toDate(a.date)?.getTime() ?? 0;
    const passPct = (a) => (a.total ? a.pass / a.total : 0);
    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "oldest": return time(a) - time(b);
        case "name": return String(a.name).localeCompare(String(b.name));
        case "pass": return passPct(b) - passPct(a);
        case "attempted": return (b.attempted || 0) - (a.attempted || 0);
        default: return time(b) - time(a);
      }
    });
  }, [assessments, filters, sortBy]);
  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const { page, rows, setPage } = usePaged(list, PAGE_SIZE, JSON.stringify(filters) + sortBy);
  const trends = useMemo(() => {
    const dateOf = (a) => a.date;
    const statusIs = (...values) => (a) => values.includes(String(a.status).toLowerCase());
    return {
      total: monthOverMonth(assessments, dateOf),
      scheduled: monthOverMonth(assessments, dateOf, statusIs("scheduled")),
      live: monthOverMonth(assessments, dateOf, statusIs("active")),
      completed: monthOverMonth(assessments, dateOf, statusIs("completed", "results published")),
    };
  }, [assessments]);
  const rowIds = rows.map((a) => String(a.assessmentId ?? a.id));
  const allOnPageSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id));
  const toggleRow = (id) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePage = () => setSelected((current) => {
    const next = new Set(current);
    if (allOnPageSelected) rowIds.forEach((id) => next.delete(id));
    else rowIds.forEach((id) => next.add(id));
    return next;
  });
  const handleBulkDelete = async () => {
    const ids = [...selected];
    setDeleting(true);
    const results = await Promise.allSettled(ids.map((id) => assessmentService.deleteAssessment(id)));
    const failed = results.filter((result) => result.status === "rejected").length;
    setDeleting(false);
    setBulkDeleteOpen(false);
    setSelected(new Set());
    if (failed) toast.error(`${failed} of ${ids.length} assessments could not be deleted.`);
    else toast.success(`${ids.length} assessment${ids.length === 1 ? "" : "s"} deleted.`);
    await refresh();
  };
  const advancedActive = Boolean(filters.from || filters.to);
  const isEditable = (a) => a.status === "Scheduled" || a.status === "Draft";
  return (
    <OrgPage className="mentor-assessments-page">
      {isOrgView ? (
        <OrgShowcaseHero
          variant="v14"
          badge={{ icon: CalendarClock, label: "Assessments" }}
          title={<>Assess<em>ments</em></>}
          subtitle="Create, manage, and evaluate assessments to track learning progress effectively."
          features={[
            { icon: FileText, label: ["Create", "Assessments"], tone: "blue" },
            { icon: Settings2, label: ["Manage", "Question Bank"], tone: "purple" },
            { icon: Users, label: ["Assign", "to Batches"], tone: "green" },
            { icon: BarChart3, label: ["Analyze", "Results"], tone: "orange" },
          ]}
          art={ORG_BANNERS.assessments}
        />
      ) : (
        <OrgHero
          icon={ClipboardList}
          title="Assessments"
          subtitle="Schedule assessments and review results for your assigned subjects."
          art={<AssessmentArt />}
          motto={["Assess", "Learn", "Improve", "Succeed"]}
          quote={["Better Assessments", "Build Brighter Futures"]}
          action={null}
        />
      )}
      <section className="kx-grid kx-grid--5" aria-label="Assessment summary">
        <OrgKpiCard decoration="bars" tone="blue" icon={ClipboardList} label="Total Assessments" value={stats.total} trend={trends.total} loading={loading} />
        <OrgKpiCard decoration="bars" tone="orange" icon={CalendarClock} label="Scheduled" value={stats.scheduled} trend={trends.scheduled} loading={loading} />
        <OrgKpiCard decoration="bars" tone="purple" icon={Activity} label="Live Now" value={stats.active} trend={trends.live} loading={loading} />
        <OrgKpiCard decoration="bars" tone="green" icon={CheckCircle2} label="Completed" value={stats.completed} trend={trends.completed} loading={loading} />
        <OrgKpiCard decoration="bars" tone="blue" icon={BarChart3} label="Avg. Pass Rate" value={stats.passRate} trend={0} loading={loading} />
      </section>
      <div className="kx-toolbar" role="search">
        <OrgSearch icon={Search} value={filters.search} onChange={(value) => set("search", value)} placeholder="Search assessments..." label="Search assessments" />
        <OrgSelect label="Filter by batch" value={filters.batch} onChange={(value) => set("batch", value)} options={[["All", "All batches"], ...batches.map((b) => [b.id, b.name])]} />
        <OrgSelect label="Filter by type" value={filters.type} onChange={(value) => set("type", value)} options={typeOptions} />
        <OrgSelect label="Filter by status" value={filters.status} onChange={(value) => set("status", value)} options={[["All", "All statuses"], "Scheduled", "Active", "Published", "Results Published", "Draft"]} />
        <OrgSelect label="Sort assessments" icon={ArrowUpDown} value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
        <button type="button" className="kx-btn kx-btn--ghost" style={{ height: "calc(44px * var(--ui-space))" }} aria-expanded={showAdvanced} onClick={() => setShowAdvanced((value) => !value)}>
          <Filter aria-hidden="true" /> Filters{advancedActive ? " (1)" : ""}
        </button>
        {showAdvanced && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, width: "100%" }}>
            <label style={{ display: "grid", gap: 4, fontSize: 12.5, fontWeight: 600, color: "var(--kx-muted)" }}>
              From date
              <input type="date" className="kx-input kx-input--plain" style={{ width: 180 }} value={filters.from} onChange={(e) => set("from", e.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 12.5, fontWeight: 600, color: "var(--kx-muted)" }}>
              To date
              <input type="date" className="kx-input kx-input--plain" style={{ width: 180 }} value={filters.to} min={filters.from || undefined} onChange={(e) => set("to", e.target.value)} />
            </label>
            <button type="button" className="kx-btn kx-btn--text" onClick={() => setFilters(DEFAULT_FILTERS)}>
              <RotateCcw aria-hidden="true" /> Reset all filters
            </button>
          </div>
        )}
      </div>
      <section className="kx-panel kx-panel--flush" aria-label="Assessments">
        {!loading && error && (
          <div className="kx-note kx-note--error" role="alert" style={{ marginBottom: 10 }}>
            <AlertTriangle aria-hidden="true" />
            <span>{error}</span>
            <button type="button" className="kx-note__action" onClick={refresh}>Retry</button>
          </div>
        )}
        {selected.size > 0 && (
          <div className="kx-bulkbar" role="status">
            {selected.size} selected
            <button type="button" className="kx-btn kx-btn--text kx-btn--sm" onClick={() => setSelected(new Set())}>Clear</button>
            <button type="button" className="kx-btn kx-btn--ghost kx-btn--sm" style={{ color: "#c73236" }} onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 aria-hidden="true" /> Delete selected
            </button>
          </div>
        )}
        <div className="kx-table-wrap">
          <table className="kx-table mv17-atable" style={{ minWidth: "calc(880px * var(--ui-text))" }}>
            <thead>
              <tr>
                <th className="kx-check-col">
                  <input type="checkbox" className="kx-check" checked={allOnPageSelected} onChange={togglePage} aria-label="Select all assessments on this page" disabled={!rows.length} />
                </th>
                <th>Name</th>
                <th>Batch</th>
                <th>Type</th>
                <th>
                  <button type="button" className="mv17-th-sort" onClick={() => setSortBy((value) => (value === "latest" ? "oldest" : "latest"))} aria-label={`Sort by date, ${sortBy === "oldest" ? "oldest first" : "newest first"}`}>
                    Date <ArrowUpDown aria-hidden="true" />
                  </button>
                </th>
                <th>Duration</th>
                <th>Pass %</th>
                <th>Attempted</th>
                <th>Passed</th>
                <th>Status</th>
                <th className="kx-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }, (_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: 11 }, (__, cell) => (
                    <td key={cell}><span className="kx-skel" style={{ display: "block", height: 16, width: cell === 0 ? 20 : "70%" }} /></td>
                  ))}
                </tr>
              ))}
              {!loading && error && (
                <tr><td colSpan={11}><OrgEmpty icon={AlertTriangle} title="Unable to load assessments" text="Use Retry above to load the records again." /></td></tr>
              )}
              {!loading && !error && !rows.length && (
                <tr>
                  <td colSpan={11}>
                    {Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key]) ? (
                      <OrgEmpty icon={Search} title="No assessments match these filters" text="Try another batch, type, status or date range." action={<button type="button" className="kx-btn kx-btn--ghost kx-btn--sm" onClick={() => setFilters(DEFAULT_FILTERS)}><RotateCcw aria-hidden="true" /> Clear filters</button>} />
                    ) : (
                      <OrgEmpty icon={ClipboardList} title="No assessments found." text="Create an assessment for a batch to start measuring progress." action={<button type="button" className="kx-btn kx-btn--primary kx-btn--sm" onClick={() => { setEditing(null); setDrawer(true); }}><Plus aria-hidden="true" /> Create Assessment</button>} />
                    )}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.map((a, index) => {
                const id = String(a.assessmentId ?? a.id);
                const date = toDate(a.start ?? a.date);
                const editable = isEditable(a);
                const status = STATUS_STYLE[a.status] ?? STATUS_STYLE.default;
                return (
                  <tr key={a.id} data-selected={selected.has(id) ? "true" : undefined} className={`mv17-arow mv17-arow--${ROW_TONES[index % ROW_TONES.length]}`}>
                    <td className="kx-check-col">
                      <input type="checkbox" className="kx-check" checked={selected.has(id)} onChange={() => toggleRow(id)} aria-label={`Select ${a.name}`} />
                    </td>
                    <td className="kx-strong">{a.name}</td>
                    <td style={{ color: "var(--kx-text)" }}>{a.batchName || getBatch(a.batchId)?.name || "Not assigned"}</td>
                    <td><span className={`kx-pill kx-pill--square mv17-type mv17-type--${String(a.type || "").toLowerCase()}`}>{a.type}</span></td>
                    <td className="kx-num" style={{ whiteSpace: "nowrap" }}>
                      {date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      {date && <span className="kx-cell-sub">{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{a.duration} min</td>
                    <td className="kx-num kx-strong">{a.total ? `${Math.round((a.pass / a.total) * 100)}%` : "—"}</td>
                    <td className="kx-num">{a.attempted}</td>
                    <td className="kx-num">{a.passed}</td>
                    <td><OrgStatus tone={status.tone} icon={status.icon}>{a.status}</OrgStatus></td>
                    <td className="kx-actions-col">
                      <div className="kx-cell-actions">
                        <button type="button" className="kx-btn kx-btn--soft kx-btn--sm" style={{ height: 38 }} onClick={() => setResults({ ...a, batch: a.batchName || getBatch(a.batchId)?.name })}>
                          <Eye aria-hidden="true" /> View results
                        </button>
                        <button
                          type="button"
                          className="kx-icon-btn"
                          onClick={() => openEditor(a)}
                          disabled={!editable || editingLoading}
                          aria-label={editable ? `Edit ${a.name}` : `${a.name} is published and locked`}
                          title={editable ? "Edit assessment" : "Published assessments cannot be edited"}
                        >
                          {editable ? <Pencil aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
                        </button>
                        <OrgRowMenu
                          label={`More actions for ${a.name}`}
                          openUp={index >= rows.length - 2 && rows.length > 3}
                          items={[
                            { label: "View results", icon: Eye, onClick: () => setResults({ ...a, batch: a.batchName || getBatch(a.batchId)?.name }) },
                            editable && { label: publishingId === (a.assessmentId ?? a.id) ? "Publishing…" : "Publish", icon: Send, disabled: publishingId === (a.assessmentId ?? a.id), onClick: () => handlePublish(a) },
                            { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(a) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && !error && list.length > 0 && (
          <OrgTableFooter page={page} pageSize={PAGE_SIZE} total={list.length} noun={list.length === 1 ? "assessment" : "assessments"} onPageChange={setPage} />
        )}
      </section>
      {audit.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <div className="flex justify-between">
            <b>Marks audit log</b>
            <button onClick={() => setAudit([])}>
              <X size={16} />
            </button>
          </div>
          {audit.map((x, i) => (
            <p key={i}>
              {x.student}: {x.old} → {x.next}; {x.reason}; {x.time}
            </p>
          ))}
        </section>
      )}
      <CreateAssessment
        key={editing?.id || "new-assessment"}
        open={drawer}
        initialData={editing}
        allowPdfImport={isMentorView}
        onClose={() => { setDrawer(false); setEditing(null); }}
        batches={batches}
        courses={courses}
        onSave={async (assessment) => {
          const batch = batches.find((item) => String(item.id) === String(assessment.batchId));
          const courseId = Number(assessment.courseId || batch?.courseId || batch?.courseID || batch?.course?.courseId || batch?.course?.id);
          const batchId = Number(assessment.batchId);
          if (!Number.isInteger(courseId) || courseId <= 0) {
            throw new Error("The selected batch is missing a valid course ID.");
          }
          if (!Number.isInteger(batchId) || batchId <= 0) {
            throw new Error("The selected batch is missing a valid batch ID.");
          }
          const payload = {
            title: String(assessment.name).trim(),
            description: assessment.description ?? "",
            courseId,
            batchId,
            durationMinutes: Number(assessment.duration),
            totalMarks: Number(assessment.total),
            passingMarks: Number(assessment.pass),
            assessmentType: assessment.type,
            startDate: toAssessmentScheduleTimestamp(assessment.start),
            endDate: toAssessmentScheduleTimestamp(assessment.end),
          };
          if (import.meta.env.DEV) {
            console.log("[ASSESSMENT CREATE] payload", payload);
          }
          let assessmentId = editing?.assessmentId ?? editing?.id;
          if (editing) {
            await assessmentService.updateAssessment(assessmentId, payload);
            const existingQuestions = await assessmentService.getQuestions(assessmentId);
            const retainedQuestionIds = new Set(
              assessment.questions.map((question) => Number(question.apiQuestionId)).filter(Number.isInteger),
            );
            await Promise.all((Array.isArray(existingQuestions) ? existingQuestions : [])
              .filter((question) => !retainedQuestionIds.has(Number(question.questionId ?? question.id)))
              .map((question) => assessmentService.deleteQuestion(question.questionId ?? question.id)));
            await Promise.all(assessment.questions.map((question, index) => {
              const questionId = Number(question.apiQuestionId);
              const questionPayload = toQuestionPayload(assessmentId, question, index);
              return Number.isInteger(questionId)
                ? assessmentService.updateQuestion(questionId, questionPayload)
                : assessmentService.createQuestion(questionPayload);
            }));
          }
          else {
            const created = await assessmentService.createAssessment(payload);
            assessmentId = created?.assessmentId ?? created?.id;
          }
          if (!assessmentId && assessment.questions.length) throw new Error("Assessment API did not return an ID for saving questions.");
          if (!editing && assessmentId) {
            await Promise.all(assessment.questions.map((question, index) =>
              assessmentService.createQuestion(toQuestionPayload(assessmentId, question, index)),
            ));
          }
          await refresh();
        }}
      />
      <AssessmentResults
        assessment={results}
        onClose={() => setResults(null)}
        onAudit={(x) => setAudit((xs) => [x, ...xs])}
        onPublish={(id) =>
          setAssessments((items) =>
            items.map((item) =>
              item.id === id ? { ...item, status: "Results Published" } : item,
            ),
          )
        }
      />
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
        title="Delete assessment"
        description={deleteTarget ? `This will permanently delete "${deleteTarget.name}". This cannot be undone.` : ""}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      />
      <Modal
        open={bulkDeleteOpen}
        onClose={() => { if (!deleting) setBulkDeleteOpen(false); }}
        title="Delete selected assessments"
        description={`This will permanently delete ${selected.size} assessment${selected.size === 1 ? "" : "s"}. This cannot be undone.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={deleting} onClick={() => setBulkDeleteOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" disabled={deleting} onClick={handleBulkDelete} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {deleting ? "Deleting…" : `Delete ${selected.size}`}
            </button>
          </div>
        }
      />
    </OrgPage>
  );
}
