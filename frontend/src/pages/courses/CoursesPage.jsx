import { useEffect, useMemo, useRef, useState } from "react";
import { KPI_ACCENTS as KPI_TONES } from "@/components/common/kpiAccents";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coins,
  IndianRupee,
  Layers3,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useCourses from "@/hooks/useCourses";
import { courseService } from "@/shared/services/courseService";
import FilterSelect from "@shared/components/FilterSelect";
import { ListTable, ListTableBody, ListTableCell, ListTableHead, ListTableHeaderCell, ListTableRow } from "@shared/components/ListTable";
import { LIST_TABLE_CARD_CLASS } from "@shared/components/listTableStyles";
import KpiWaveCard from "@shared/components/KpiWaveCard";
import useRouteAos from "@shared/hooks/useRouteAos";
import CoursesPageHero from "./CoursesPageHero";
import "./courses-density.css";
import { CourseIcon, CourseStatusPill, LevelBadge } from "./courseUi";

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const PAGE_SIZES = [10, 25, 50];
const CHECKBOX_CLASS = "block h-4 w-4 cursor-pointer rounded accent-[#0877F9]";
const PAGE_BUTTON_CLASS =
  "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 disabled:cursor-not-allowed disabled:opacity-40";
const PAGE_BUTTON_IDLE = "border-[#DCE6F3] bg-white text-[#173A63] hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courses, loading, stats, removeCourse, reload } = useCourses();
  const { rootRef, aos, refresh: refreshAos } = useRouteAos();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Selection is scoped to the current view: it resets whenever the filters,
  // page or page size change.
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleting, setDeleting] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const bulkBusyRef = useRef(false);

  const filtered = useMemo(
    () =>
      courses.filter((course) => {
        const q = query.trim().toLowerCase();
        return (
          (!q || [course.name, course.code, course.category].some((v) => String(v || "").toLowerCase().includes(q))) &&
          (!level || course.category === level) &&
          (!status || course.status === status)
        );
      }),
    [courses, query, level, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(firstIndex, firstIndex + pageSize);
  const showingFrom = filtered.length ? firstIndex + 1 : 0;
  const showingTo = Math.min(firstIndex + pageSize, filtered.length);
  const pageWindow = (() => {
    const windowSize = 5;
    if (totalPages <= windowSize) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const start = Math.min(Math.max(1, currentPage - 2), totalPages - windowSize + 1);
    return Array.from({ length: windowSize }, (_, index) => start + index);
  })();
  const pageIds = pageRows.map((course) => course.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someSelected = pageIds.some((id) => selectedIds.has(id)) && !allSelected;

  const hasModuleData = courses.some((course) => Number(course.totalModules) > 0);
  // Column widths follow the Batches table: compact columns are fixed and sized
  // to their pastel header label; Course (no width) takes the remaining space.
  const courseHeaders = ["#", "Course", "Course Code", "Category", "Duration", "Fee", ...(hasModuleData ? ["Modules"] : []), "Batches", "Students", "Status", "Actions"];
  // Auto layout: columns are sized to their content, so Course gets the width
  // its name needs instead of what ~980px of fixed columns left (≈88px at
  // 1280px). Only the control columns carry a width (minimums in auto layout).
  const courseColumnWidths = [
    "32px", // select
    "36px", // #
    undefined, // course
    undefined, // course code
    undefined, // category
    undefined, // duration
    undefined, // fee
    ...(hasModuleData ? [undefined] : []), // modules
    undefined, // batches
    undefined, // students
    undefined, // status
    "88px", // actions
  ];
  const totalBatches = courses.reduce((s, c) => s + Number(c.totalBatches || c.batches || 0), 0);
  // Sum of the fee set on each course (the catalogue value, not collected revenue).
  const totalFees = courses.reduce((s, c) => s + Number(c.fee || 0), 0);
  const activeShare = stats.total ? Math.round((stats.published / stats.total) * 100) : 0;
  const cards = [
    { key: "total", label: "Total Courses", value: stats.total, caption: "All available courses", icon: BookOpen, tone: KPI_TONES.blue },
    { key: "active", label: "Active Courses", value: stats.published, caption: `${activeShare}% of total`, captionColor: "#16A34A", icon: Play, tone: KPI_TONES.green },
    { key: "batches", label: "Total Batches", value: totalBatches, caption: "Across all courses", icon: Users, tone: KPI_TONES.purple },
    { key: "fees", label: "Total Course Fees", value: totalFees, display: currency(totalFees), caption: "Combined fee of all courses", icon: Coins, tone: KPI_TONES.orange },
    ...(hasModuleData
      ? [{ key: "modules", label: "Total Modules", value: courses.reduce((s, c) => s + Number(c.totalModules || 0), 0), caption: "Across all courses", icon: Layers3, tone: KPI_TONES.cyan }]
      : []),
  ];

  const resetView = () => {
    setPage(1);
    setSelectedIds(new Set());
  };
  const clear = () => {
    setQuery("");
    setLevel("");
    setStatus("");
    resetView();
  };
  const handleKpiClick = (key) => {
    if (key === "active") {
      setQuery("");
      setLevel("");
      setStatus("Active");
      resetView();
      return;
    }
    if (key === "batches") {
      navigate("/organization/batches");
      return;
    }
    // Total courses and fee totals both return focus to the complete course list.
    clear();
  };
  const toggleAllRows = () =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  const toggleRow = (id) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    if (searchParams.get("create") !== "true") return;
    navigate("/organization/courses/add", {
      replace: true,
      state: { returnTo: "/organization/dashboard" },
    });
  }, [navigate, searchParams]);

  // Recalculate AOS positions once the table rows have rendered; the
  // entrance animation itself is not replayed on refetch.
  useEffect(() => {
    if (!loading) refreshAos();
  }, [loading, refreshAos]);

  const remove = async (course) => {
    if (!window.confirm(`Delete ${course.name}? Courses with linked records should be archived instead.`)) return;
    try {
      setDeleting(course.id);
      await removeCourse(course.courseId ?? course.id);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(course.id);
        return next;
      });
      toast.success("Course deleted successfully.");
    } catch {
      toast.error("Unable to delete this course. It may have linked records; archive it instead.");
    } finally {
      setDeleting(null);
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    const selected = courses.filter((course) => selectedIds.has(course.id));
    if (!selected.length || bulkBusyRef.current) return;
    bulkBusyRef.current = true;
    setBulkBusy(true);
    try {
      // PUT uses the complete editable course contract, not a status-only patch.
      const results = await Promise.allSettled(selected.map(async (course) => {
        const id = course.courseId ?? course.id;
        // Preserve authoritative editable values rather than list display defaults.
        const response = await courseService.getCourse(id);
        const record = response?.data ?? response;
        if (!record || !(record.courseName ?? record.title ?? record.name)) throw new Error("Course details unavailable");
        return courseService.updateCourse(id, { ...record, status: nextStatus });
      }));
      reportBulkResults(selected, results, "updated");
      reload();
    } finally { bulkBusyRef.current = false; setBulkBusy(false); }
  };

  const reportBulkResults = (selected, results, action) => {
    const succeeded = selected.filter((_, index) => results[index].status === "fulfilled");
    const failed = selected.filter((_, index) => results[index].status === "rejected");
    setSelectedIds(new Set(failed.map((course) => course.id)));
    if (succeeded.length) toast.success(`${succeeded.length} course${succeeded.length === 1 ? "" : "s"} ${action}.`);
    if (failed.length) toast.error(`${failed.length} course${failed.length === 1 ? "" : "s"} could not be ${action}. Check your permissions and linked records, then retry.`);
  };

  const bulkDelete = async () => {
    const selected = courses.filter((course) => selectedIds.has(course.id));
    if (!selected.length || bulkBusyRef.current || !window.confirm(`Delete ${selected.length} selected course${selected.length === 1 ? "" : "s"}?`)) return;
    bulkBusyRef.current = true;
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(selected.map((course) => removeCourse(course.courseId ?? course.id)));
      reportBulkResults(selected, results, "deleted");
    } finally { bulkBusyRef.current = false; setBulkBusy(false); }
  };

  return (
    <main ref={rootRef} className="org-courses-page min-h-full min-w-0 p-3 text-[#102D50] sm:p-5 dark:text-slate-100">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-4">
        <CoursesPageHero
          title="Organization Courses"
          subtitle="Manage your organization's courses, curriculum, batches and fees."
          icon={BookOpen}
          aos={aos}
          action={
            <button
              type="button"
              onClick={() => navigate("/organization/courses/add")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#FF9418] to-[#F39924] px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(243,153,36,.18)] transition hover:-translate-y-0.5 hover:from-[#F28A0F] hover:to-[#E88F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9418]/50"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          }
        />

        <div
          aria-label="Course statistics"
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:gap-4 ${cards.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
        >
          {cards.map((card, index) => (
            <div key={card.key} {...aos("fade-up", 100 * (index + 1))} className="min-w-0">
              <KpiWaveCard stat={card} onClick={() => handleKpiClick(card.key)} />
            </div>
          ))}
        </div>

        <div {...aos("fade-up", 450)} className="grid gap-3 rounded-[14px] border border-[#E2EAF5] bg-white p-3 shadow-[0_4px_18px_rgba(38,83,130,.05)] sm:grid-cols-2 xl:grid-cols-[minmax(240px,2fr)_minmax(160px,.7fr)_minmax(160px,.7fr)_auto] dark:border-slate-700 dark:bg-slate-900">
          <label className="relative min-w-0 rounded-[10px] border border-[#D8E4F1] bg-white sm:col-span-2 xl:col-span-1 dark:border-slate-600 dark:bg-slate-800">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#173F69] dark:text-slate-300" />
            <input
              aria-label="Search courses"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetView();
              }}
              placeholder="Search courses by name, code or category..."
              className="h-[42px] w-full rounded-[10px] border-0 bg-transparent pl-10 pr-3 text-sm outline-none dark:text-white"
            />
          </label>
          <FilterSelect
            label="Category"
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
              resetView();
            }}
            options={[
              { value: "", label: "All Categories" },
              ...[...new Set(courses.map((c) => c.category).filter(Boolean))].map((v) => ({ value: v, label: v })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              resetView();
            }}
            options={[
              { value: "", label: "All Statuses" },
              ...[...new Set(courses.map((c) => c.status).filter(Boolean))].map((v) => ({ value: v, label: v })),
            ]}
          />
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#D8E4F1] bg-white px-5 text-sm font-semibold text-[#173A63] transition hover:bg-[#F3F8FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Persistent wrapper: animates on route entry only, never on refetch/filter. */}
        <div {...aos("fade-up", 500)}>
        {loading ? (
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
        ) : filtered.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#C9D6E6] bg-white p-10 text-center dark:border-slate-600 dark:bg-slate-900">
            <BookOpen className="mx-auto h-8 w-8 text-[#B7C6D9]" />
            <h2 className="mt-3 font-semibold text-[#12365B] dark:text-white">{courses.length ? "No Courses Found" : "No Courses Yet"}</h2>
            <p className="mt-1 text-sm text-[#5B78A0]">
              {courses.length ? "No courses match your current filters." : "Create your first course to start building curriculum and batches."}
            </p>
            <button
              type="button"
              onClick={courses.length ? clear : () => navigate("/organization/courses/add")}
              className="mt-4 text-sm font-semibold text-[#0877F9]"
            >
              {courses.length ? "Clear Filters" : "+ Add Course"}
            </button>
          </div>
        ) : (
          <div className={LIST_TABLE_CARD_CLASS}>
            {selectedIds.size > 0 && <div role="toolbar" aria-label="Course bulk actions" aria-busy={bulkBusy} className="flex flex-wrap items-center gap-2 border-b border-[#EDF2F7] bg-[#F7FAFE] px-5 py-3 dark:border-slate-700 dark:bg-slate-800/60"><span className="mr-auto text-sm font-bold text-[#173A63] dark:text-white">{selectedIds.size} selected</span><button type="button" disabled={bulkBusy} onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold text-blue-600">Clear selection</button><button type="button" disabled={bulkBusy} onClick={() => bulkUpdateStatus("Active")} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Set Active</button><button type="button" disabled={bulkBusy} onClick={() => bulkUpdateStatus("Draft")} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Set Draft</button><button type="button" disabled={bulkBusy} onClick={bulkDelete} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">Delete selected</button></div>}
            <ListTable label="Courses" widths={courseColumnWidths} minWidth={0} layout="auto">
              <ListTableHead>
                <ListTableHeaderCell compact>
                  <input
                    type="checkbox"
                    ref={(element) => {
                      if (element) element.indeterminate = someSelected;
                    }}
                    checked={allSelected}
                    disabled={bulkBusy}
                    onChange={toggleAllRows}
                    aria-label="Select all courses on this page"
                    className={CHECKBOX_CLASS}
                  />
                </ListTableHeaderCell>
                {courseHeaders.map((label) => (
                  <ListTableHeaderCell key={label} compact={label === "#"} align={label === "Actions" ? "center" : "left"} className={label === "#" ? "text-[10.5px]! tracking-[.03em]!" : "px-2! text-[10.5px]! tracking-[.03em]!"}>
                    {label}
                  </ListTableHeaderCell>
                ))}
              </ListTableHead>
              <ListTableBody>
                {pageRows.map((course, index) => {
                  const selected = selectedIds.has(course.id);
                  const batchCount = course.totalBatches ?? course.batches ?? 0;
                  return (
                    <ListTableRow key={course.id} selected={selected}>
                      <ListTableCell compact>
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={bulkBusy}
                          onChange={() => toggleRow(course.id)}
                          aria-label={`Select ${course.name}`}
                          className={CHECKBOX_CLASS}
                        />
                      </ListTableCell>
                      <ListTableCell compact className="text-[13px] font-medium text-[#5B78A0]">{firstIndex + index + 1}</ListTableCell>
                      <ListTableCell className="px-2!">
                        <button
                          type="button"
                          onClick={() => navigate(`/organization/courses/${course.id}/details`)}
                          aria-label={`View ${course.name} course`}
                          className="group flex min-w-0 max-w-full items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40"
                        >
                          <CourseIcon name={course.name} />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-[#12365B] underline-offset-2 lg:max-w-[240px] lg:!text-[13px] transition-colors group-hover:text-[#0877F9] group-hover:underline dark:text-white dark:group-hover:text-blue-300" title={course.name}>
                              {course.name}
                            </p>
                          </div>
                        </button>
                      </ListTableCell>
                      <ListTableCell truncate={false} className="px-2! font-mono text-[13px] font-medium text-[#345D86] dark:text-slate-300">
                        {course.code || "—"}
                      </ListTableCell>
                      <ListTableCell className="px-2!">
                        <LevelBadge value={course.category} />
                      </ListTableCell>
                      <ListTableCell className="px-2!">
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#345D86] dark:text-slate-300">
                          <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4C78A3]" />
                          {course.duration}
                        </span>
                      </ListTableCell>
                      <ListTableCell className="px-2!">
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#173A63] dark:text-slate-200">
                          <IndianRupee aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4C78A3]" />
                          {Number(course.fee || 0).toLocaleString("en-IN")}
                        </span>
                      </ListTableCell>
                      {hasModuleData && <ListTableCell className="px-2! text-[13px] font-medium text-[#426D99]">{course.totalModules}</ListTableCell>}
                      <ListTableCell className="px-2!">
                        <span className={`inline-flex items-center gap-2 text-[13px] font-medium ${batchCount ? "text-[#426D99]" : "text-[#8FA3BA]"}`}>
                          <Users aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {batchCount}
                        </span>
                      </ListTableCell>
                      <ListTableCell className="px-2!">
                        <span
                          className={`inline-flex items-center gap-2 text-[13px] font-medium ${course.students ? "text-[#426D99]" : "text-[#8FA3BA]"}`}
                          title={course.students == null ? "Student count unavailable — the student roster could not be loaded" : `${course.students} enrolled student${course.students === 1 ? "" : "s"}`}
                        >
                          <Users aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {course.students == null ? "—" : course.students}
                        </span>
                      </ListTableCell>
                      <ListTableCell className="px-2!">
                        <CourseStatusPill status={course.status} />
                      </ListTableCell>
                      <ListTableCell truncate={false} className="px-2!">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${course.name}`}
                            title="Edit course"
                            onClick={() => navigate(`/organization/courses/${course.id}/edit`)}
                            className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-[9px] border border-[#DCE6F3] bg-white text-[#173A63] shadow-[0_2px_8px_rgba(38,83,130,.05)] transition hover:bg-[#F3F8FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${course.name}`}
                            title="Delete course"
                            disabled={deleting === course.id}
                            onClick={() => remove(course)}
                            className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-[9px] border border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-slate-800 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </ListTableCell>
                    </ListTableRow>
                  );
                })}
              </ListTableBody>
            </ListTable>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF2F7] px-5 py-4 lg:py-1.5 text-[13px] text-[#5B78A0] dark:border-slate-700 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing {showingFrom} to {showingTo} of {filtered.length} courses
                </span>
                {selectedIds.size > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#FFF3DD] px-3 py-1.5 font-semibold text-[#B86600]">
                    {selectedIds.size} selected
                    <button
                      type="button"
                      onClick={() => setSelectedIds(new Set())}
                      className="rounded px-1 text-xs font-bold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39924]/40"
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setPage(currentPage - 1);
                    setSelectedIds(new Set());
                  }}
                  className={`${PAGE_BUTTON_CLASS} ${PAGE_BUTTON_IDLE}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageWindow.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    aria-label={`Page ${pageNumber}`}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    onClick={() => {
                      setPage(pageNumber);
                      setSelectedIds(new Set());
                    }}
                    className={`${PAGE_BUTTON_CLASS} ${pageNumber === currentPage ? "border-[#0877F9] bg-[#0877F9] text-white shadow-[0_4px_12px_rgba(8,119,249,.28)]" : PAGE_BUTTON_IDLE}`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setPage(currentPage + 1);
                    setSelectedIds(new Set());
                  }}
                  className={`${PAGE_BUTTON_CLASS} ${PAGE_BUTTON_IDLE}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="relative ml-1 rounded-lg border border-[#DCE6F3] bg-white dark:border-slate-600 dark:bg-slate-800">
                  <select
                    aria-label="Rows per page"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      resetView();
                    }}
                    className="h-9 cursor-pointer appearance-none rounded-lg border-0 bg-transparent pl-3 pr-8 text-[13px] font-semibold outline-none dark:text-white"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#174B7A] dark:text-slate-300" />
                </div>
              </div>
            </footer>
          </div>
        )}
        </div>
      </div>

    </main>
  );
}


