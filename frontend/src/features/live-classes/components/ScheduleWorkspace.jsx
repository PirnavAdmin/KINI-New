import { useMemo, useState } from "react";
import { KPI_ACCENTS as KPI_TONES } from "@/components/common/kpiAccents";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import ScheduleCalendar from "./ScheduleCalendar";
import LiveClassTable from "./LiveClassTable";
import MentorBanner from "@features/mentor/components/MentorBanner";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import EmptyState from "@shared/components/EmptyState";
import KpiWaveCard from "@shared/components/KpiWaveCard";
import FilterSelect from "@shared/components/FilterSelect";
import "./live-classes.css";


const VIEW_TABS = [
  { key: "calendar", label: "Calendar" },
  { key: "list", label: "List" },
  { key: "mine", label: "My Classes" },
];

const recordDate = (record) => {
  const value = record.startAt || record.date || record.scheduledDate || record.startDate;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

// Best-effort match against the backend's free-text createdBy field — there is
// no createdByUserId on the normalized record, so this is a real (not
// fabricated) but fuzzy comparison against the signed-in identity.
const matchesCreator = (record, user) => {
  const createdBy = String(record.createdBy || "").trim().toLowerCase();
  if (!createdBy) return false;
  const candidates = [user?.name, user?.organizationName, user?.email]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  return candidates.some(
    (candidate) => candidate && (createdBy === candidate || createdBy.includes(candidate) || candidate.includes(createdBy)),
  );
};

const STATUS_DOT_TONE = {
  live: "bg-blue-500",
  success: "bg-emerald-500",
  danger: "bg-rose-500",
  pending: "bg-[#F39924]",
  default: "bg-slate-400",
};

export default function ScheduleWorkspace({ live, onNew, onRefresh, onExport, currentUser, tableState, bulkActions }) {
  const [date, setDate] = useState(new Date());
  const [calView, setCalView] = useState("week");
  const [viewMode, setViewMode] = useState("calendar");
  const [batchFilter, setBatchFilter] = useState("");
  const [mentorFilter, setMentorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kpiFilter, setKpiFilter] = useState("");
  const [sidebarMonth, setSidebarMonth] = useState(() => startOfMonth(new Date()));

  const records = useMemo(() => live.filteredRecords || [], [live.filteredRecords]);
  const mentors = useMemo(() => live.dropdowns?.mentors || [], [live.dropdowns?.mentors]);
  const loading = Boolean(live.activeState?.loading) && !live.activeState?.loaded;
  const loadError = live.activeState?.error;

  const kpis = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const in7Days = addDays(now, 7);
    const statusOf = (record) => String(record.status || "").toLowerCase();
    const today = records.filter((record) => {
      const recordAt = recordDate(record);
      return recordAt && isSameDay(recordAt, now);
    }).length;
    const upcoming = records.filter((record) => {
      const recordAt = recordDate(record);
      return recordAt && recordAt >= now && recordAt <= in7Days && !["cancelled", "completed"].includes(statusOf(record));
    }).length;
    const conflicts = records.filter(
      (record) => record.conflict || record.hasConflict || statusOf(record) === "conflict",
    ).length;
    const cancelled = records.filter((record) => {
      const recordAt = recordDate(record);
      return recordAt && recordAt >= weekStart && recordAt <= weekEnd && statusOf(record) === "cancelled";
    }).length;
    return { today, upcoming, mentors: mentors.length, conflicts, cancelled };
  }, [records, mentors.length]);

  const batchOptions = useMemo(() => {
    const seen = new Map();
    (live.dropdowns?.batches || []).forEach((batch) => {
      const id = String(batch.batchId ?? batch.id ?? "");
      const label = batch.batchName ?? batch.name ?? batch.title;
      if (!id || !label || seen.has(id)) return;
      seen.set(id, label);
    });
    return [...seen.entries()];
  }, [live.dropdowns?.batches]);

  const mentorOptions = useMemo(() => {
    const seen = new Map();
    mentors.forEach((mentor) => {
      const id = String(mentor.mentorId ?? mentor.id ?? "");
      const label = mentor.mentorName ?? [mentor.firstName, mentor.lastName].filter(Boolean).join(" ") ?? mentor.name;
      if (!id || !label || seen.has(id)) return;
      seen.set(id, label);
    });
    return [...seen.entries()];
  }, [mentors]);

  const statusOptions = useMemo(() => {
    const seen = new Set();
    records.forEach((record) => {
      const status = String(record.status || "").trim();
      if (status) seen.add(status);
    });
    return [...seen].sort();
  }, [records]);

  const visibleRecords = useMemo(
    () =>
      records.filter((record) => {
        if (batchFilter && String(record.batchId ?? "") !== batchFilter) return false;
        if (mentorFilter && String(record.mentorId ?? "") !== mentorFilter) return false;
        if (statusFilter && String(record.status ?? "") !== statusFilter) return false;
        if (kpiFilter) {
          const recordAt = recordDate(record);
          const now = new Date();
          if (kpiFilter === "today" && (!recordAt || !isSameDay(recordAt, now))) return false;
          if (kpiFilter === "upcoming" && (!recordAt || recordAt < now || ["cancelled", "completed"].includes(String(record.status ?? "").toLowerCase()))) return false;
        }
        return true;
      }),
    [records, batchFilter, mentorFilter, statusFilter, kpiFilter],
  );

  const mineRecords = useMemo(
    () => visibleRecords.filter((record) => matchesCreator(record, currentUser)),
    [visibleRecords, currentUser],
  );

  const tableRows = viewMode === "mine" ? mineRecords : visibleRecords;
  const openKpiList = (key) => {
    setViewMode("list");
    setKpiFilter(key === "today" || key === "upcoming" ? key : "");
    if (key === "conflicts") setStatusFilter("Conflict");
    else setStatusFilter("");
  };

  const sidebarUpcoming = useMemo(() => {
    const now = new Date();
    return records
      .filter((record) => {
        const recordAt = recordDate(record);
        return recordAt && recordAt >= now && !["cancelled", "completed"].includes(String(record.status || "").toLowerCase());
      })
      .sort((a, b) => recordDate(a) - recordDate(b))
      .slice(0, 5);
  }, [records]);

  const miniCalendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(sidebarMonth), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [sidebarMonth]);

  return (
    <div className="lc-workspace mx-auto w-full max-w-[1600px] space-y-3 px-3 py-3 sm:px-4">
      <MentorBanner
        variant="live"
        image={ORG_BANNERS.liveClasses}
        eyebrow="Live Learning"
        eyebrowIcon={Video}
        title="Live"
        highlight="Classes"
        subtitle={<>Plan, schedule and manage live learning<br className="hidden 2xl:inline" /> sessions across your organization.</>}
        featureShape="stack"
        features={[
          { icon: CircleDot, title: "Interactive", text: "Sessions", tone: "purple" },
          { icon: Users, title: "Engage", text: "Students", tone: "green" },
          { icon: CalendarCheck, title: "Track", text: "Attendance", tone: "orange" },
          { icon: GraduationCap, title: "Better", text: "Learning Outcomes", tone: "blue" },
        ]}
        script={["Connect.", "Learn.", "Grow."]}
        actions={(
          <>
            {onExport && (
              <button type="button" onClick={onExport} className="mentor-hero-btn mentor-hero-btn--ghost">
                <Download aria-hidden="true" />
                Export
              </button>
            )}
            {onRefresh && (
              <button type="button" onClick={onRefresh} title="Refresh" aria-label="Refresh" className="mentor-hero-btn mentor-hero-btn--ghost !px-3">
                <RefreshCw aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={onNew} data-page-new className="mentor-hero-btn mentor-hero-btn--blue">
              <Plus aria-hidden="true" />
              Schedule Class
            </button>
          </>
        )}
      />

      {loadError ? (
        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>Unable to load live classes.</span>
          {onRefresh && (
            <button type="button" onClick={onRefresh} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">
              Retry
            </button>
          )}
        </div>
      ) : (
        <div aria-label="Live class statistics" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-3">
          <KpiWaveCard
            stat={{
              key: "today",
              label: "Today's Classes",
              value: kpis.today,
              caption: kpis.today === 0 ? "No classes scheduled" : `${kpis.today} scheduled today`,
              icon: Video,
              tone: KPI_TONES.blue,
            }}
            onClick={() => openKpiList("today")}
          />
          <KpiWaveCard
            stat={{
              key: "upcoming",
              label: "Upcoming Classes",
              value: kpis.upcoming,
              caption: "Next 7 days",
              icon: CalendarClock,
              tone: KPI_TONES.green,
            }}
            onClick={() => openKpiList("upcoming")}
          />
          <KpiWaveCard
            stat={{
              key: "mentors",
              label: "Available Mentors",
              value: kpis.mentors,
              caption: "Ready to teach",
              icon: Users,
              tone: KPI_TONES.purple,
            }}
            onClick={() => openKpiList("mentors")}
          />
          <KpiWaveCard
            stat={{
              key: "conflicts",
              label: "Schedule Conflicts",
              value: kpis.conflicts,
              caption: kpis.conflicts === 0 ? "All clear" : "Needs attention",
              captionColor: kpis.conflicts === 0 ? undefined : "#C2410C",
              icon: AlertTriangle,
              tone: KPI_TONES.orange,
            }}
            onClick={() => openKpiList("conflicts")}
          />
        </div>
      )}

      <section className="lc-schedule rounded-[14px] border border-[#E1EAF4] bg-white shadow-[0_5px_20px_rgba(38,83,130,.05)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-[#EDF2F7] px-3 py-2 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700">
          <div className="flex rounded-[9px] border border-[#D8E4F1] bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setViewMode(tab.key)}
                className={`h-[28px] rounded-[7px] px-3 text-[11px] font-bold transition ${viewMode === tab.key ? "bg-gradient-to-br from-[#FF9418] to-[#FE8204] text-white shadow-[0_4px_12px_rgba(254,130,4,.18)]" : "text-[#173F69] hover:bg-[#F3F8FE] dark:text-slate-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {viewMode === "calendar" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDate(subWeeks(date, 1))}
                aria-label="Previous week"
                className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#D8E4F1] bg-white text-[#173F69] transition hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDate(new Date())}
                className="h-[30px] rounded-[8px] border border-[#BFD8F6] bg-white px-3 text-[11.5px] font-bold text-[#0877F9] transition hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(addWeeks(date, 1))}
                aria-label="Next week"
                className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#D8E4F1] bg-white text-[#173F69] transition hover:bg-[#F3F8FE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-b border-[#EDF2F7] px-3 py-2 lg:flex-row lg:items-center dark:border-slate-700">
          <label className="lc-class-search flex h-[34px] min-w-0 flex-1 items-center gap-2 rounded-[9px] border border-[#D8E4F1] bg-white px-3 focus-within:border-[#0877F9]/50 dark:border-slate-600 dark:bg-slate-800">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#173F69] dark:text-slate-300" />
            <input
              value={live.search}
              onChange={(event) => live.setSearch(event.target.value)}
              placeholder="Search classes, topics..."
              className="h-full w-full !border-0 !bg-transparent p-0 text-[12px] !shadow-none outline-none placeholder:text-[#6480A0] focus:!border-0 focus:!ring-0 dark:text-white"
            />
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterSelect
              label="Batch"
              value={batchFilter}
              onChange={(event) => setBatchFilter(event.target.value)}
              options={[{ value: "", label: "All Batches" }, ...batchOptions.map(([value, label]) => ({ value, label }))]}
            />
            <FilterSelect
              label="Mentor"
              value={mentorFilter}
              onChange={(event) => setMentorFilter(event.target.value)}
              options={[{ value: "", label: "All Mentors" }, ...mentorOptions.map(([value, label]) => ({ value, label }))]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={[{ value: "", label: "All Status" }, ...statusOptions.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))]}
            />
            {viewMode === "calendar" && (
              <div className="flex rounded-[9px] border border-[#D8E4F1] bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800">
                {["day", "week", "month"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCalView(item)}
                    className={`h-[28px] rounded-[7px] px-2.5 text-[11px] font-bold capitalize transition ${calView === item ? "bg-[#0877F9] text-white" : "text-[#173F69] hover:bg-[#F3F8FE] dark:text-slate-300"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List/My Classes reuse LiveClassTable's fixed-width (1080px) layout, and an
            app-wide style rule disables horizontal scroll on tables inside this
            dashboard — so those views need the full row instead of sharing it with
            the sidebar, or their rightmost columns become unreachable. */}
        <div className={`grid gap-3 p-3 ${viewMode === "calendar" ? "lg:grid-cols-[minmax(0,1fr)_248px] xl:grid-cols-[minmax(0,1fr)_264px] 2xl:grid-cols-[minmax(0,1fr)_288px]" : ""}`}>
          <div className="min-w-0">
            {loading ? (
              <div className="grid min-h-64 place-items-center rounded-[14px] border border-[#E1EAF4] text-sm text-[#5B78A0] dark:border-slate-700">
                Loading schedule…
              </div>
            ) : !records.length ? (
              <EmptyState
                icon={CalendarDays}
                title="No classes scheduled"
                description="There are no live classes for this period."
                action={
                  <button
                    type="button"
                    onClick={onNew}
                    className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-[#0877F9] to-[#0068E8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(8,119,249,.18)] transition hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4" /> Schedule Class
                  </button>
                }
              />
            ) : viewMode === "calendar" ? (
              !visibleRecords.length ? (
                <EmptyState icon={Search} title="No classes found" description="Try changing your search or filters." compact />
              ) : (
                <>
                  <ScheduleCalendar records={visibleRecords} date={date} view={calView} onOpen={live.openDetails} />
                  <div className="mt-2 flex flex-wrap justify-end gap-2 text-[10px] text-[#5B78A0]">
                    {[
                      ["bg-blue-500", "Lecture"],
                      ["bg-emerald-500", "Lab"],
                      ["bg-violet-500", "Assessment"],
                      ["bg-orange-500", "Meeting"],
                      ["bg-rose-500", "Cancelled"],
                      ["bg-slate-400", "Completed"],
                    ].map(([color, label]) => (
                      <span key={label} className="inline-flex items-center gap-1">
                        <i className={`h-2 w-2 rounded-full ${color}`} />
                        {label}
                      </span>
                    ))}
                  </div>
                </>
              )
            ) : (
              <>
                {bulkActions && bulkActions.count > 0 && (
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#BFD8F6] bg-[#EAF3FF] px-3.5 py-2">
                    <span className="text-xs font-bold text-[#0877F9]">{bulkActions.count} selected</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={bulkActions.onExport}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D8E4F1] bg-white px-2.5 text-xs font-bold text-[#173F69] hover:bg-[#F3F8FE]"
                      >
                        <Download className="h-3.5 w-3.5" /> Export
                      </button>
                      <button
                        type="button"
                        onClick={bulkActions.onDelete}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-rose-200 bg-white px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                      <button
                        type="button"
                        onClick={bulkActions.onClear}
                        aria-label="Clear selection"
                        className="grid h-8 w-8 place-items-center rounded-[8px] text-[#173F69] hover:bg-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <LiveClassTable
                  rows={tableRows}
                  loading={false}
                  loaded
                  error={null}
                  errorStatus={null}
                  onRetry={onRefresh}
                  density={tableState.density}
                  visibleColumns={tableState.visibleColumns}
                  pageSize={tableState.pageSize}
                  selectedIds={tableState.selectedIds}
                  onToggleRow={tableState.onToggleRow}
                  onToggleAllOnPage={tableState.onToggleAllOnPage}
                  onRowClick={live.openDetails}
                  onView={(record) => live.openDetails(record)}
                  onEdit={(record) => live.openForm(record)}
                />
              </>
            )}
          </div>

          {viewMode === "calendar" && (
          <div className="lc-side space-y-2.5">
            <div className="rounded-[14px] border border-[#E1EAF4] bg-white p-3 shadow-[0_5px_20px_rgba(38,83,130,.05)] dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSidebarMonth((current) => subMonths(current, 1))}
                  aria-label="Previous month"
                  className="grid h-[26px] w-[26px] place-items-center rounded-lg text-[#173F69] hover:bg-[#F3F8FE] dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <b className="text-[13.5px] font-bold text-[#102D50] dark:text-white">{format(sidebarMonth, "MMMM yyyy")}</b>
                <button
                  type="button"
                  onClick={() => setSidebarMonth((current) => addMonths(current, 1))}
                  aria-label="Next month"
                  className="grid h-[26px] w-[26px] place-items-center rounded-lg text-[#173F69] hover:bg-[#F3F8FE] dark:text-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center text-[10px] font-bold text-[#5B78A0]">
                {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-0.5">
                {miniCalendarDays.map((day) => {
                  const inMonth = isSameMonth(day, sidebarMonth);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <span
                      key={day.toISOString()}
                      className={`mx-auto grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] ${isToday ? "bg-[#0877F9] font-bold text-white shadow-[0_4px_10px_rgba(8,119,249,.28)]" : inMonth ? "text-[#173F69] dark:text-slate-200" : "text-[#A7B9CC]"}`}
                    >
                      {format(day, "d")}
                    </span>
                  );
                })}
              </div>
            </div>

            <div data-testid="upcoming-classes-panel" className="rounded-[14px] border border-[#E1EAF4] bg-white p-3 shadow-[0_5px_20px_rgba(38,83,130,.05)] dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-[13.5px] font-bold text-[#102D50] dark:text-white">Upcoming Classes</h3>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="text-[11.5px] font-semibold text-[#0877F9] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {loading ? (
                  <p className="px-1 py-2.5 text-center text-[11.5px] text-[#5B78A0]">Loading…</p>
                ) : sidebarUpcoming.length ? (
                  sidebarUpcoming.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => live.openDetails(item)}
                      className="flex w-full items-center gap-2 rounded-[9px] px-1.5 py-1.5 text-left transition hover:bg-[#F3F8FE] dark:hover:bg-slate-800"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_TONE[item.statusTone] || STATUS_DOT_TONE.default}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-[#102D50] dark:text-white">{item.title}</span>
                        <span className="block truncate text-[11px] text-[#5B78A0]">
                          {item.dateLabel} · {item.timeLabel}
                        </span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
                    </button>
                  ))
                ) : (
                  <p className="px-1 py-2.5 text-center text-[11.5px] text-[#5B78A0]">No upcoming classes.</p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[14px] border border-[#DDEAF6] bg-gradient-to-br from-[#F8FBFF] to-[#EAF4FF] p-3 shadow-[0_5px_20px_rgba(38,83,130,.045)] dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
              <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#DCEBFA]" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-[#DCEBFA]/70" />
              <svg aria-hidden="true" viewBox="0 0 60 48" className="relative h-8 w-[40px]">
                <path d="M30 4 L56 14 L30 24 L4 14 Z" fill="#12407D" />
                <path d="M30 4 L56 14 L30 24 Z" fill="#0F3670" />
                <path d="M30 24 L56 14 V28 C56 34 44 38 30 38 C16 38 4 34 4 28 V14 Z" fill="#0B2E5E" />
                <path d="M30 14 L52 22 V30" fill="none" stroke="#FE8204" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="52" cy="32" r="3" fill="#FE8204" />
              </svg>
              <p
                className="relative mt-1.5 text-[17.5px] leading-[1.15] text-[#0877F9]"
                style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: "italic" }}
              >
                Live Classes
                <br />
                Create Brighter Futures.
              </p>
              <span aria-hidden="true" className="relative mt-1 block h-[3px] w-14 rounded-full bg-[#FE8204]" />
              <p className="relative mt-1.5 text-[12.5px] font-semibold leading-5 text-[#4D73A0] dark:text-slate-400">
                Teach. Inspire. Empower.
              </p>
            </div>
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
