import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleX,
  Clock,
  Plus,
  ChevronRight,
  Clock3,
  List,
  Play,
  Search,
  Users,
  Upload,
  Video,
  X,
  BookOpen,
  CalendarClock,
  FileText,
  Info,
  Layers3,
  Monitor,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";
import KiniDialog from "@shared/components/KiniDialog";
import { LeaveArt } from "@features/mentor/components/MentorHeroArt";
import { readLocalScheduledClasses, saveScheduledClass } from "@shared/services/localScheduleStore";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { getLiveClassLifecycleStatus, normalizeLiveClassList } from "@features/live-classes/utils/liveClassMappers";
import { getApiErrorMessage } from "@shared/services/apiServices";

const initialClasses = [
  { id: 1, dateKey: "2026-08-03", time: "10:00–11:30 AM", batch: "React Morning Batch", topic: "React Hooks", students: 28, status: "Completed", attendance: "Marked", color: "blue" },
  { id: 2, dateKey: "2026-08-03", time: "11:00 AM–12:30 PM", batch: "React Advanced", topic: "Lazy Loading", students: 12, status: "Completed", attendance: "Marked", color: "violet" },
  { id: 3, dateKey: "2026-08-04", time: "2:00–3:30 PM", batch: "Node.js Afternoon", topic: "REST APIs", students: 22, status: "Completed", attendance: "Not marked", color: "amber" },
  { id: 4, dateKey: "2026-08-04", time: "11:00 AM–12:30 PM", batch: "React Advanced", topic: "Code Splitting", students: 12, status: "Completed", attendance: "Marked", color: "violet" },
  { id: 5, dateKey: "2026-08-10", time: "10:00–11:30 AM", batch: "React Morning Batch", topic: "React Context API", students: 28, status: "Upcoming", attendance: "Pending", color: "blue" },
  { id: 6, dateKey: "2026-08-11", time: "2:00–3:30 PM", batch: "Node.js Afternoon", topic: "Express Middleware", students: 22, status: "Upcoming", attendance: "Pending", color: "amber" },
  { id: 7, dateKey: "2026-08-13", time: "11:00 AM–12:30 PM", batch: "React Advanced", topic: "Performance", students: 12, status: "Upcoming", attendance: "Pending", color: "violet" },
].map((item) => ({ ...item, materials: item.status === "Completed" && item.id !== 3 }));

// Calendar status palette: live red, completed green, upcoming blue,
// cancelled orange. Event cards are a light tint of the status colour.
const CLASS_STATUS_CONFIG = {
  live: { label: "Live", dot: "bg-red-500", event: "border-red-100 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100" },
  completed: { label: "Completed", dot: "bg-emerald-500", event: "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100" },
  upcoming: { label: "Upcoming", dot: "bg-blue-500", event: "border-blue-100 bg-[#EEF4FC] text-[#133B5D] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100" },
  cancelled: { label: "Cancelled", dot: "bg-orange-400", event: "border-orange-100 bg-orange-50 text-slate-500 line-through dark:border-orange-900 dark:bg-orange-950/40 dark:text-slate-400" },
};
const MAX_VISIBLE_DAY_EVENTS = 3;
const statusKey = (value) => String(value || "").trim().toLowerCase();
// Backend lifecycle status is the source of truth (getLiveClassLifecycleStatus).
// This used to re-derive status from the scheduled window every 15s, which
// flipped a backend-live class to "Completed" once its end time passed and
// showed a never-started class as "Live" inside its window.
const displayStatus = (item) => {
  const lifecycle = getLiveClassLifecycleStatus(item.status || item.liveStatus);
  if (lifecycle === "cancelled") return "Cancelled";
  if (lifecycle === "completed") return "Completed";
  if (lifecycle === "live") return "Live";
  return "Upcoming";
};
// "11:30:00" / "2026-09-07T11:30" → "11:30 AM"
const to12Hour = (value) => {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  return `${((hours + 11) % 12) + 1}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
};
const timeRange = (item) => {
  const start = to12Hour(item.startTime);
  const end = to12Hour(item.endTime);
  if (start && end) return `${start} - ${end}`;
  return String(item.time || "").replace(/\s*[–-]\s*/, " - ");
};
const dateFromKey = (key) => new Date(`${key}T12:00:00`);
const keyFromDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const todayKey = keyFromDate(new Date());
const displayDate = (key) => dateFromKey(key).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const displayDay = (key) => dateFromKey(key).toLocaleDateString("en-US", { weekday: "short" });
const classDate = (item) => String(item?.dateKey || item?.date || item?.classDate || item?.scheduledDate || item?.startDate || '').slice(0, 10);
const classTime = (item) => String(item?.startTime || item?.time || item?.timeLabel || '').slice(0, 5);
const sameClass = (left, right) => (
  (left?.id != null && right?.id != null && String(left.id) === String(right.id))
  || (classDate(left) && classDate(left) === classDate(right) && classTime(left) && classTime(left) === classTime(right))
);
const mergeClasses = (current, incoming) => {
  const merged = [...current];
  incoming.forEach((item) => {
    const index = merged.findIndex((existing) => sameClass(existing, item));
    if (index >= 0) merged[index] = { ...merged[index], ...item };
    else merged.push(item);
  });
  return merged;
};

// Short 24h range used on calendar chips ("13:05 - 14:00").
const shortRange = (item) => {
  const pick = (value) => { const match = String(value || "").match(/(\d{1,2}):(\d{2})/); return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null; };
  const start = pick(item.startTime);
  const end = pick(item.endTime);
  if (start && end) return `${start} - ${end}`;
  return String(item.time || "").replace(/\s*[–-]\s*/, " - ");
};
const STATUS_ICON = { live: Video, completed: CheckCircle2, upcoming: Clock, cancelled: CircleX };
const MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const courseOf = (item) => item.courseName || item.course?.name || item.course || "";
const weekStartOf = (date) => { const result = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const offset = (result.getDay() + 6) % 7; result.setDate(result.getDate() - offset); return result; };

// view / onViewChange — optional controlled Calendar ⇄ Class list toggle.
// onScheduleClass — renders a "Schedule Class" button in the filter row.
export default function SchedulePage({ embedded = false, scheduledClasses = [], view: controlledView, onViewChange, onScheduleClass }) {
  const navigate = useNavigate();
  const [localView, setLocalView] = useState("calendar");
  const view = controlledView ?? localView;
  const setView = (next) => { if (onViewChange) onViewChange(next); else setLocalView(next); };
  const [range, setRange] = useState("month");
  const [weekAnchor, setWeekAnchor] = useState(() => weekStartOf(new Date()));
  const [batchFilter, setBatchFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [classes, setClasses] = useState(() => [...initialClasses, ...readLocalScheduledClasses()]);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (!scheduledClasses.length) return;
    setClasses((current) => mergeClasses(current, scheduledClasses));
  }, [scheduledClasses]);

  useEffect(() => {
    let active = true;
    liveClassService.list()
      .then((rows) => {
        if (!active) return;
        const apiClasses = normalizeLiveClassList(rows).map((item) => ({
          ...item,
          id: item.id ?? item.liveClassId ?? item.classId,
          dateKey: classDate(item),
          time: item.timeLabel || item.time || item.startTime || "Scheduled time",
          batch: item.batchName || item.batch?.name || item.courseName || "Assigned batch",
          topic: item.title || item.topic || item.sessionTitle || item.courseName || "Class session",
          students: item.studentsCount ?? item.studentCount ?? item.students ?? 0,
          // liveStatus keeps the raw backend value for join-eligibility checks;
          // status is the calendar's four-way display state (adds Live and
          // Cancelled instead of collapsing everything to Completed/Upcoming).
          liveStatus: item.status,
          status: displayStatus(item),
          attendance: item.attendance || "Pending",
        })).filter((item) => item.id != null && item.dateKey);
        if (!apiClasses.length) return;
        setClasses((current) => mergeClasses(current, apiClasses));
        const firstDate = apiClasses[0].dateKey;
        const date = dateFromKey(firstDate);
        if (!Number.isNaN(date.getTime())) setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      })
      .catch(() => {})
    return () => { active = false };
  }, []);

  useEffect(() => {
    const refreshStatuses = () => setClasses((current) => current.map((item) => {
      const status = displayStatus(item);
      return item.status === status ? item : { ...item, status };
    }));
    refreshStatuses();
    const timer = window.setInterval(refreshStatuses, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const firstDate = scheduledClasses[0]?.dateKey;
    if (!firstDate) return;
    const date = dateFromKey(firstDate);
    if (!Number.isNaN(date.getTime())) setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [scheduledClasses]);

  // liveClassService.start() already succeeded by the time this runs (see
  // ClassDetail's handleStart) — patch the local copy so the badge and the
  // Start/Join button swap immediately, without waiting on a full refetch.
  const markStarted = (id) => {
    const patch = (item) => item.id === id ? { ...item, status: "Live", liveStatus: "live" } : item;
    setClasses((items) => items.map(patch));
    setSelected((current) => current && current.id === id ? patch(current) : current);
  };
  const removeDeletedClass = (id) => {
    setClasses((items) => items.filter((item) => String(item.id) !== String(id)));
    setSelected(null);
  };
  const open = (item) => setSelected(item);
  const monthClasses = classes.filter((item) => {
    const date = dateFromKey(item.dateKey);
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  });
  const query = search.trim().toLowerCase();
  const matchesFilters = (item) => {
    const matchesSearch = !query || [item.topic, item.batch, item.status, courseOf(item)].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesSearch
      && (statusFilter === "all" || statusKey(item.status) === statusFilter)
      && (batchFilter === "all" || item.batch === batchFilter)
      && (subjectFilter === "all" || courseOf(item) === subjectFilter);
  };
  const visibleClasses = monthClasses.filter(matchesFilters);
  const batchOptions = [...new Set(classes.map((item) => item.batch).filter(Boolean))].sort();
  const subjectOptions = [...new Set(classes.map(courseOf).filter(Boolean))].sort();
  const filtersActive = Boolean(query) || statusFilter !== "all" || batchFilter !== "all" || subjectFilter !== "all";
  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setBatchFilter("all"); setSubjectFilter("all"); };
  const completed = monthClasses.filter((item) => statusKey(item.status) === "completed").length;
  const uniqueStudents = [...new Map(classes.map((item) => [item.batch, item.students])).values()].reduce((sum, count) => sum + count, 0);
  // Monday-first grid. Month view pads with blank cells for the neighbouring
  // months; week view shows the 7 days of the week containing weekAnchor.
  const firstDayOffset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = range === "week"
    ? Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekAnchor.getFullYear(), weekAnchor.getMonth(), weekAnchor.getDate() + index);
      return { date, inMonth: true };
    })
    : Array.from({ length: Math.ceil((firstDayOffset + daysInMonth) / 7) * 7 }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index - firstDayOffset + 1);
      return { date, inMonth: date.getMonth() === month.getMonth() };
    });
  const weekClasses = range === "week"
    ? classes.filter((item) => calendarDays.some(({ date }) => keyFromDate(date) === item.dateKey)).filter(matchesFilters)
    : [];
  const gridClasses = range === "week" ? weekClasses : visibleClasses;
  const changeMonth = (amount) => {
    if (range === "week") {
      setWeekAnchor((current) => new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount * 7));
      return;
    }
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };
  const goToday = () => {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setWeekAnchor(weekStartOf(today));
  };
  const changeRange = (next) => {
    setRange(next);
    if (next === "week") {
      const today = new Date();
      const sameMonth = today.getMonth() === month.getMonth() && today.getFullYear() === month.getFullYear();
      setWeekAnchor(weekStartOf(sameMonth ? today : month));
    }
  };
  const weekEnd = new Date(weekAnchor.getFullYear(), weekAnchor.getMonth(), weekAnchor.getDate() + 6);
  const periodLabel = range === "week"
    ? `${weekAnchor.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main className={`class-schedule-page mv17 min-w-0 min-h-full overflow-x-hidden bg-[#fbf8f2] dark:bg-slate-950 ${embedded ? "px-2 pb-2 pt-0 sm:px-3" : "px-3 py-3 sm:px-4 lg:px-5"}`}>
      <div className="mx-auto min-w-0 max-w-[1500px] space-y-3">
        {!embedded && <header className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/70 to-cyan-50 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:from-slate-900 dark:via-blue-950/30 dark:to-cyan-950/20">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 sm:grid"><CalendarDays className="h-5 w-5" /></div>
            <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-600">Teaching workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Class Schedule</h1>
            <p className="mt-0.5 text-sm text-slate-500">Plan and review all assigned teaching sessions.</p>
            </div>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {[["calendar", CalendarDays, "Calendar"], ["list", List, "List"]].map(([value, Icon, label]) => (
              <button key={value} onClick={() => setView(value)} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ${view === value ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          </div>
        </header>}

        {!embedded && <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            ["This month", monthClasses.length, CalendarDays, "bg-blue-50 text-blue-600", "border-l-blue-500"],
            ["Completed", completed, CheckCircle2, "bg-emerald-50 text-emerald-600", "border-l-emerald-500"],
            ["Upcoming", monthClasses.length - completed, Clock3, "bg-amber-50 text-amber-600", "border-l-amber-500"],
            ["Batch enrollments", uniqueStudents, Users, "bg-violet-50 text-violet-600", "border-l-violet-500"],
          ].map(([label, value, Icon, iconClass, accentClass]) => (
            <div key={label} className={`flex items-center gap-3 rounded-xl border border-l-4 border-slate-200/90 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${accentClass}`}>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconClass}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">{String(value).padStart(2, "0")}</p></div>
            </div>
          ))}
        </section>}

        <section className="mentor-schedule-surface mv17-sched overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mv17-sched__filters">
            <label className="mv17-search mv17-sched__search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search classes" placeholder="Search class topic, course or batch..." /></label>
            <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)} aria-label="Filter by batch" className="mv17-select"><option value="all">All Batches</option>{batchOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filter by subject" className="mv17-select"><option value="all">All Subjects</option>{subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter classes by status" className="mv17-select"><option value="all">All Statuses</option>{Object.entries(CLASS_STATUS_CONFIG).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select>
            {onScheduleClass && <button type="button" onClick={onScheduleClass} className="mv17-tool-btn mv17-tool-btn--navy mv17-sched__cta"><Plus aria-hidden="true" />Schedule Class</button>}
          </div>
          <div className="mv17-sched__toolbar">
            <div className="mv17-sched__nav">
              <button type="button" onClick={() => changeMonth(-1)} aria-label={range === "week" ? "Previous week" : "Previous month"}><ChevronLeft /></button>
              <h2>{periodLabel}</h2>
              <button type="button" onClick={() => changeMonth(1)} aria-label={range === "week" ? "Next week" : "Next month"}><ChevronRight /></button>
              <button type="button" className="mv17-sched__today" onClick={goToday}>Today</button>
            </div>
            <div className="mv17-sched__right">
              <div className="mv17-viewtoggle" role="group" aria-label="Schedule view">
                {[["calendar", CalendarDays, "Calendar"], ["list", List, "Class List"]].map(([value, Icon, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}><Icon aria-hidden="true" />{label}</button>)}
              </div>
              <div className="mv17-legend">{Object.entries(CLASS_STATUS_CONFIG).map(([key, config]) => <span key={key}><i className={`is-${key}`} />{config.label}</span>)}</div>
              {view === "calendar" && <label className="mv17-range"><select value={range} onChange={(event) => changeRange(event.target.value)} aria-label="Calendar range"><option value="month">Month</option><option value="week">Week</option></select><ChevronDown aria-hidden="true" /></label>}
            </div>
          </div>

          {gridClasses.length === 0 && filtersActive && <div className="flex flex-col items-start justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm sm:flex-row sm:items-center dark:border-amber-900/70 dark:bg-amber-950/35"><div><p className="font-semibold text-amber-900 dark:text-amber-100">No classes match your search or filters.</p><p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">Try another topic, course, batch or status.</p></div><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-200"><X className="h-3.5 w-3.5" />Clear filters</button></div>}

          {view === "calendar" ? (
            <div className={`overflow-x-auto ${range === "week" ? "mv17-week-scroll" : ""}`}>
              <div className={`mv17-cal ${range === "week" ? "is-week" : ""}`}>
                <div className="mv17-cal__head">
                  {MONDAY_FIRST.map((day, index) => <div key={day} className={index >= 5 ? "is-weekend" : undefined}>{range === "week" ? `${day} ${calendarDays[index].date.getDate()}` : day}</div>)}
                </div>
                <div className="mv17-cal__grid">
                  {calendarDays.map(({ date, inMonth }) => {
                    const dateKey = keyFromDate(date);
                    const isToday = dateKey === todayKey;
                    const events = inMonth ? gridClasses.filter((item) => item.dateKey === dateKey).sort((left, right) => String(left.startTime || left.time).localeCompare(String(right.startTime || right.time))) : [];
                    const limit = range === "week" ? events.length : MAX_VISIBLE_DAY_EVENTS;
                    const visibleEvents = events.slice(0, limit);
                    const hiddenCount = events.length - visibleEvents.length;
                    return (
                      <div key={dateKey} className={`mv17-cal__cell ${inMonth ? "" : "is-out"} ${isToday ? "is-today" : ""}`}>
                        {inMonth && <span className="mv17-cal__day">{date.getDate()}</span>}
                        <div className="mv17-cal__events">
                          {visibleEvents.map((item) => {
                            const key = statusKey(item.status) in CLASS_STATUS_CONFIG ? statusKey(item.status) : "upcoming";
                            const StatusIcon = STATUS_ICON[key];
                            const label = [item.batch, item.topic].filter(Boolean).join(" - ");
                            return (
                              <button key={item.id} type="button" onClick={() => open(item)} title={`${timeRange(item)} · ${label}`} className={`mv17-ev is-${key}`}>
                                <span className="mv17-ev__body">
                                  <b>{shortRange(item)}</b>
                                  <span>{label}</span>
                                </span>
                                <StatusIcon className="mv17-ev__icon" aria-label={CLASS_STATUS_CONFIG[key].label} />
                              </button>
                            );
                          })}
                          {hiddenCount > 0 && (
                            <button type="button" onClick={() => setExpandedDay({ dateKey, day: date.getDate(), events })} aria-label={`Show ${hiddenCount} more classes on ${displayDate(dateKey)}`} className="mv17-cal__more">+{hiddenCount} more</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[120px]" /><col className="w-[72px]" /><col className="w-[135px]" />
                  <col className="w-[155px]" /><col className="w-[180px]" /><col className="w-[90px]" />
                  <col className="w-[105px]" /><col className="w-[120px]" /><col className="w-[100px]" />
                  <col className="w-[190px]" />
                </colgroup>
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800"><tr>{["Date", "Day", "Time", "Batch", "Topic", "Duration", "Status", "Attendance", "Materials", "Actions"].map((x) => <th key={x} className="px-3 py-3 align-middle">{x}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visibleClasses.length ? visibleClasses.map((item) => (
                  <tr key={item.id} className={item.attendance === "Not marked" ? "bg-amber-50/60 dark:bg-amber-950/20" : ""}>
                    <td className="px-3 py-3 align-middle">{displayDate(item.dateKey)}</td><td className="px-3 py-3 align-middle">{displayDay(item.dateKey)}</td><td className="px-3 py-3 align-middle">{item.time}</td><td className="truncate px-3 py-3 align-middle font-semibold" title={item.batch}>{item.batch}</td><td className="truncate px-3 py-3 align-middle" title={item.topic}>{item.topic}</td><td className="px-3 py-3 align-middle">90 min</td><td className="px-3 py-3 align-middle">{item.status}</td>
                    <td className={`px-3 py-3 align-middle ${item.attendance === "Not marked" ? "font-semibold text-amber-700" : "text-emerald-600"}`}>{item.attendance}</td><td className="px-3 py-3 align-middle">{item.materials ? "Uploaded" : "Missing"}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-middle"><button type="button" onClick={() => open(item)} className="mr-3 font-semibold text-blue-600">View class</button><button type="button" onClick={() => open(item)} className="font-semibold text-slate-600">Upload notes</button></td>
                  </tr>
                )) : <tr><td colSpan="10" className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">{monthClasses.length ? "No classes match your search or filters." : "No classes scheduled for this month."}</td></tr>}</tbody>
              </table>
            </div>
          )}
        </section>
        {expandedDay && <DayOverflowModal
          day={expandedDay}
          onClose={() => setExpandedDay(null)}
          onSelect={(item) => { setExpandedDay(null); open(item); }}
        />}
        {selected && <ClassDetail item={selected} onClose={() => setSelected(null)} onDelete={removeDeletedClass} onStart={markStarted} onMark={() => {
          if (!selected.id || String(selected.id).startsWith("scheduled-")) {
            toast.error("This class is not synced yet. Refresh after it is saved by the live-class service.");
            return;
          }
          setSelected(null);
          navigate(`/mentor/live-classes?attendance=${encodeURIComponent(selected.id)}`);
        }} />}
      </div>
    </main>
  );
}

// Reuses the same fixed-overlay + rounded-card pattern as ClassDetail so a
// day with many classes gets one consistent way to see them all, instead of
// forcing every event card into the month grid.
function DayOverflowModal({ day, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <section className="max-h-[80vh] w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{displayDate(day.dateKey)}</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-950 dark:text-white">{day.events.length} classes</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[60vh] space-y-1.5 overflow-y-auto p-3">
          {day.events.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`block w-full rounded-xl border px-3 py-2 text-left text-xs shadow-sm transition hover:-translate-y-px hover:shadow-md ${CLASS_STATUS_CONFIG[statusKey(item.status)]?.event}`}
            >
              <span className="flex items-center gap-1.5">
                {statusKey(item.status) === "live" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />}
                <span className="shrink-0 font-bold">{item.time}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{item.batch} · {item.topic}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// Same resolution pattern already used by the Student live-class join flow
// (features/student/pages/StudentCalendar.jsx) — kept local rather than a
// shared export because that file also duplicates it locally.
const meetingUrlFrom = (payload) => {
  const sources = [payload, payload?.data, payload?.result, payload?.meeting, payload?.data?.meeting, payload?.result?.meeting];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const url = source.meetingUrl || source.meetingLink || source.joinUrl || source.joinLink
      || source.virtualRoomUrl || source.classUrl || source.url || source.link;
    if (url) return String(url).trim();
  }
  return "";
};
const isLiveClassStatus = (status) => ["live", "in-progress", "started"].includes(String(status || "").trim().toLowerCase());

// "10:00-10:30", "10:00–11:30 AM", "1:30 PM – 2:15 PM" → minutes between the two times.
const durationMinutes = (time) => {
  const parts = String(time || "").split(/\s*(?:-|–|â€“|to)\s*/i).filter(Boolean);
  if (parts.length < 2) return null;
  const suffix = (parts[1].match(/[ap]m/i) || [""])[0];
  const toMinutes = (value, fallbackSuffix) => {
    const match = String(value).match(/(\d{1,2}):(\d{2})\s*([ap]m)?/i);
    if (!match) return null;
    const meridiem = (match[3] || fallbackSuffix || "").toLowerCase();
    let hours = Number(match[1]);
    if (meridiem) hours = (hours % 12) + (meridiem === "pm" ? 12 : 0);
    return hours * 60 + Number(match[2]);
  };
  const start = toMinutes(parts[0], suffix);
  const end = toMinutes(parts[1], suffix);
  if (start == null || end == null) return null;
  const diff = end >= start ? end - start : end + 1440 - start;
  return diff > 0 && diff < 1440 ? diff : null;
};

function ClassDetail({ item, onClose, onMark, onStart, onDelete }) {
  const navigate = useNavigate();
  const materialInputRef = useRef(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [request, setRequest] = useState({ date: item.dateKey, time: "", reason: "" });
  // Derived from item.status (the same value the Status badge below renders),
  // not item.liveStatus. Multiple sources feed `classes` here — the API fetch,
  // localStorage-cached scheduled classes, and the scheduledClasses prop — and
  // mergeClasses() shallow-merges them, so a later source missing a liveStatus
  // key can leave a stale one in place while status itself gets updated. That
  // let this join gate believe a class was "live" (and fire the real /join
  // request, which the backend correctly 403'd) while the visible badge still
  // said "Upcoming". Reading the same field the user can already see makes the
  // two impossible to disagree.
  const rawStatus = statusKey(item.status);
  const isUnsynced = !item.id || String(item.id).startsWith("scheduled-");
  // A mentor can always join a session they're personally scheduled to teach —
  // that's independent of the "Live Classes" module permission, which governs
  // access to the separate /mentor/live-classes management page.
  const canJoin = !isUnsynced && !["completed", "cancelled", "canceled"].includes(rawStatus);
  // Mutually exclusive with Join: before the backend has actually marked this
  // class live, there is nothing to join yet — the mentor's own Start action
  // is what makes that transition happen (normalizeLiveClass no longer infers
  // "live" from the scheduled time window alone, so this can't shortcut it).
  const canStart = canJoin && !isLiveClassStatus(rawStatus);
  const canReschedule = !isUnsynced && ["scheduled", "upcoming", "pending"].includes(rawStatus);
  if (import.meta.env.DEV) {
    console.debug("[ClassDetail] join button visibility:", {
      itemId: item.id, itemLiveClassId: item.liveClassId, isUnsynced, rawStatus, itemStatus: item.status, itemLiveStatus: item.liveStatus, canJoin, canStart,
    });
  }
  const handleStart = async () => {
    if (starting || isUnsynced) return;
    setStarting(true);
    try {
      await liveClassService.start(item.id);
      toast.success("Class started.");
      onStart?.(item.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to start the class."));
    } finally {
      setStarting(false);
    }
  };
  const handleJoin = async () => {
    if (joining) return;
    if (isUnsynced) {
      toast.error("This class is not synced yet. Refresh after it is saved by the live-class service.");
      return;
    }
    // Open the popup synchronously (before any await) so browsers don't
    // treat it as an unrequested popup and block it.
    const popup = window.open("", "_blank");
    setJoining(true);
    try {
      if (rawStatus && !isLiveClassStatus(rawStatus)) {
        popup?.close();
        toast("Join will be available once the class starts.", { id: "mentor-live-class-open" });
        return;
      }
      // Always go through the dedicated join action rather than short-
      // circuiting to a meetingUrl already cached in the list response,
      // which would silently skip it on every class that already has a
      // configured link.
      const response = await liveClassService.join(item.id);
      const joinUrl = meetingUrlFrom(response) || item.meetingUrl;
      if (joinUrl && popup) popup.location.href = joinUrl;
      else if (joinUrl) window.location.href = joinUrl;
      else {
        popup?.close();
        toast("The meeting room is not published yet.", { id: "mentor-live-class-open" });
      }
    } catch (error) {
      popup?.close();
      toast.error(getApiErrorMessage(error, "Unable to join this live class."), { id: "mentor-live-class-open" });
    } finally {
      setJoining(false);
    }
  };
  const handleDelete = async () => {
    if (deleting || isUnsynced) return;
    setDeleting(true);
    try {
      await liveClassService.remove(item.id);
      const remaining = normalizeLiveClassList(await liveClassService.list());
      if (remaining.some((entry) => String(entry.id ?? entry.liveClassId ?? entry.classId) === String(item.id))) {
        throw new Error("The class still exists after the delete request.");
      }
      onDelete?.(item.id);
      toast.success("Class deleted successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete the class."));
    } finally {
      setDeleting(false);
    }
  };
  const chooseMaterial = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    toast.error(`Selected ${file.name}. Material upload requires a backend endpoint.`);
    event.target.value = "";
  };
  const submitReschedule = async (event) => {
    event.preventDefault();
    if (rescheduleSaving) return;
    if (!request.date || !request.time || !request.reason.trim()) return toast.error("Enter the requested date, time and reason.");
    const currentStart = String(item.time || "").match(/(\d{1,2}:\d{2})/);
    const currentEnd = String(item.time || "").match(/(?:-|â€“|–)\s*(\d{1,2}:\d{2})/);
    const startTime = request.time;
    const [newHours, newMinutes] = startTime.split(":").map(Number);
    const [oldStartHours, oldStartMinutes] = (currentStart?.[1] || startTime).split(":").map(Number);
    const [oldEndHours, oldEndMinutes] = (currentEnd?.[1] || startTime).split(":").map(Number);
    const duration = Math.max(15, (oldEndHours * 60 + oldEndMinutes) - (oldStartHours * 60 + oldStartMinutes));
    const endTotal = newHours * 60 + newMinutes + duration;
    const endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
    setRescheduleSaving(true);
    try {
      if (String(item.id).startsWith("scheduled-")) {
        saveScheduledClass({
          ...item,
          dateKey: request.date,
          time: `${startTime}–${endTime}`,
          attendance: "Pending",
          rescheduleReason: request.reason.trim(),
        });
      } else {
        await liveClassService.update(item.id, {
          title: item.topic,
          classTitle: item.topic,
          date: request.date,
          classDate: request.date,
          scheduledDate: request.date,
          startTime,
          endTime,
          startDateTime: `${request.date}T${startTime}`,
          endDateTime: `${request.date}T${endTime}`,
          rescheduleReason: request.reason.trim(),
        });
      }
      toast.success("Reschedule request submitted successfully.");
      setRescheduleOpen(false);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to submit the reschedule request.");
    } finally {
      setRescheduleSaving(false);
    }
  };
  const minutes = durationMinutes(item.time);
  const statusTone = { completed: "bg-emerald-50 text-emerald-600", live: "bg-rose-50 text-rose-600", cancelled: "bg-slate-100 text-slate-500", canceled: "bg-slate-100 text-slate-500" }[rawStatus] || "bg-orange-50 text-orange-600";
  const attendanceMarked = item.attendance === "Marked";
  const row = "flex min-h-[62px] flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#eef2f7] py-3 last:border-b-0 dark:border-slate-800";
  const label = "w-28 shrink-0 text-[15px] font-bold text-[#0f2a4a] dark:text-white";
  const value = "min-w-0 flex-1 text-[15px] text-[#0f2a4a] dark:text-slate-200";
  const quick = "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60";
  return (
    <KiniDialog
      open
      onClose={onClose}
      eyebrow="Class detail"
      icon={CalendarDays}
      title={item.topic || "Class session"}
      subtitle="View complete details, manage attendance and take actions."
      art={<LeaveArt />}
      width={980}
    >
      <input ref={materialInputRef} type="file" hidden onChange={chooseMaterial} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e6edf6] px-5 dark:border-slate-700">
            <div className={row}><CalendarDays className="h-6 w-6 shrink-0 text-[#2f6fe4]" /><span className={label}>Date &amp; Time</span><span className={value}>{displayDate(item.dateKey)}, {item.time}</span>{minutes && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#e8f1ff] px-3 py-1.5 text-sm font-semibold text-[#2f6fe4]"><Clock3 className="h-4 w-4" />{minutes} mins</span>}</div>
            <div className={row}><Layers3 className="h-6 w-6 shrink-0 text-[#2f6fe4]" /><span className={label}>Batch</span><span className={value}>{item.batch}{item.courseName && item.courseName !== "-" ? ` - ${item.courseName}` : ""}</span></div>
            <div className={row}><Users className="h-6 w-6 shrink-0 text-[#2f6fe4]" /><span className={label}>Students</span><span className={value}>{item.students ?? 0} / {attendanceMarked ? "Marked" : "Not marked"}</span><button type="button" onClick={() => navigate(item.batchId ? `/mentor/batches/${item.batchId}?tab=students` : "/mentor/students")} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#e8f1ff] px-4 py-2 text-sm font-bold text-[#1d4f91] hover:bg-[#d8e8ff]">View Students<ChevronRight className="h-4 w-4" /></button></div>
            <div className={row}><CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" /><span className={label}>Status</span><span className={value}><span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold capitalize ${statusTone}`}>{item.status}</span></span></div>
            <div className={row}><UserCheck className="h-6 w-6 shrink-0 text-[#2f6fe4]" /><span className={label}>Attendance</span><span className={value}>{item.attendance || "Not marked"}</span>{!attendanceMarked && <button type="button" onClick={onMark} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#f7c68a] bg-[#fff4e6] px-5 py-2.5 text-sm font-bold text-[#e27410] hover:bg-[#ffecd5]"><UserCheck className="h-4 w-4" />Mark Attendance</button>}</div>
            <div className={row}><FileText className="h-6 w-6 shrink-0 text-[#2f6fe4]" /><span className={label}>Materials</span><span className={value}>{item.materials ? "Uploaded" : "Not uploaded"}</span><button type="button" onClick={() => materialInputRef.current?.click()} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-[#f6f9fd] px-5 py-2.5 text-sm font-bold text-[#133b5d] hover:bg-[#eef3f9] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Upload className="h-4 w-4" />Upload Materials</button></div>
          </section>
          <section className="rounded-2xl border border-[#e6edf6] p-4 dark:border-slate-700">
            <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><FileText className="h-5 w-5 text-[#2f6fe4]" />Notes</h3>
            <p className="mt-3 rounded-xl bg-[#f6f8fb] px-4 py-3.5 text-sm text-[#4b5f78] dark:bg-slate-800 dark:text-slate-300">{item.description || item.notes || "No additional notes for this class."}</p>
          </section>
          {rescheduleOpen && <form onSubmit={submitReschedule} className="space-y-3 rounded-2xl border border-[#e6edf6] bg-[#f8fafd] p-4 dark:border-slate-700 dark:bg-slate-800/60"><div><p className="text-sm font-bold text-[#0f2a4a] dark:text-white">Request a new schedule</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current: {displayDate(item.dateKey)}, {item.time}</p></div><div className="grid gap-2 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Requested date<input type="date" value={request.date} onChange={(event) => setRequest((current) => ({ ...current, date: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" /></label><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Requested time<input type="time" value={request.time} onChange={(event) => setRequest((current) => ({ ...current, time: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" /></label></div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Reason<textarea value={request.reason} onChange={(event) => setRequest((current) => ({ ...current, reason: event.target.value }))} rows="2" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" /></label><div className="flex justify-end gap-2"><button type="button" disabled={rescheduleSaving} onClick={() => setRescheduleOpen(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:text-slate-300">Cancel</button><button type="submit" disabled={rescheduleSaving} className="rounded-lg bg-[#F39924] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{rescheduleSaving ? "Submitting..." : "Submit request"}</button></div></form>}
        </div>
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e6edf6] bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><Info className="h-5 w-5 text-[#2f6fe4]" />Additional Information</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-[#4b5f78]" /><dt className="w-20 text-[#4b5f78]">Course</dt><dd className="font-bold text-[#0f2a4a] dark:text-white">{item.courseName && item.courseName !== "-" ? item.courseName : "—"}</dd></div>
              <div className="flex items-center gap-3"><Monitor className="h-5 w-5 text-[#4b5f78]" /><dt className="w-20 text-[#4b5f78]">Class Type</dt><dd className="font-bold text-[#0f2a4a] dark:text-white">{item.classType || (item.meetingUrl || item.meetingPlatform ? "Live Session" : "Class")}</dd></div>
            </dl>
          </section>
          <section className="rounded-2xl border border-[#e6edf6] bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><Zap className="h-5 w-5 text-[#2f6fe4]" />Quick Actions</h3>
            <div className="mt-3 space-y-2.5">
              {canStart && <button type="button" disabled={starting} onClick={handleStart} className={`${quick} bg-[#e3f7ef] text-[#0f8c5b]`}><Play className="h-5 w-5" /><span className="flex-1 text-left">{starting ? "Starting..." : "Start Class"}</span><ChevronRight className="h-4 w-4" /></button>}
              {canJoin && !canStart && <button type="button" disabled={joining} onClick={handleJoin} className={`${quick} bg-[#e3f7ef] text-[#0f8c5b]`}><Video className="h-5 w-5" /><span className="flex-1 text-left">{joining ? "Joining..." : "Join Live Class"}</span><ChevronRight className="h-4 w-4" /></button>}
              <button type="button" onClick={() => materialInputRef.current?.click()} className={`${quick} bg-[#e8f1ff] text-[#1d5fcc]`}><Upload className="h-5 w-5" /><span className="flex-1 text-left">Upload Materials</span><ChevronRight className="h-4 w-4" /></button>
              {canReschedule && <button type="button" onClick={() => setRescheduleOpen(true)} className={`${quick} border border-[#e6edf6] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200`}><CalendarClock className="h-5 w-5" /><span className="flex-1 text-left">Request Reschedule</span><ChevronRight className="h-4 w-4" /></button>}
              {!isUnsynced && <button type="button" onClick={() => setDeleteOpen(true)} className={`${quick} border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300`}><Trash2 className="h-5 w-5" /><span className="flex-1 text-left">Delete Class</span><ChevronRight className="h-4 w-4" /></button>}
            </div>
          </section>
        </div>
      </div>
      {deleteOpen && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30"><p className="text-sm font-bold text-red-900 dark:text-red-100">Delete this class permanently?</p><p className="mt-1 text-xs text-red-700 dark:text-red-300">This removes the class from the schedule and cannot be undone.</p><div className="mt-3 flex justify-end gap-2"><button type="button" disabled={deleting} onClick={() => setDeleteOpen(false)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">Keep Class</button><button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete Class"}</button></div></div>}
    </KiniDialog>
  );
}
