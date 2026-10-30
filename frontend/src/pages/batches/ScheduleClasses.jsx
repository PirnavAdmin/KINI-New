import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  List,
  MoreVertical,
  Play,
  Plus,
  Search,
  Tag,
  Users,
  Video,
  X,
} from "lucide-react";
import StatusBadge from "@shared/components/StatusBadge";
import EmptyState from "@shared/components/EmptyState";
import { getInitials } from "@features/live-classes/utils/liveClassUi";

const STATUS_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];
const STATUS_FILTER_MAP = { Upcoming: "scheduled", Completed: "completed", Cancelled: "cancelled" };

const monthDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "---", weekday: "---" };
  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};
// Local calendar day, not UTC — a class at 11pm local must still land in
// "Today" rather than rolling into tomorrow via toISOString().
const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const attendanceLabel = (item) =>
  item.attendancePercentage > 0
    ? `${item.attendancePercentage}% present`
    : item.status === "completed"
      ? "Not Available"
      : "Not started";

function DateBlock({ startAt }) {
  const { day, month, weekday } = monthDay(startAt);
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5">
      <span className="text-[9px] font-bold uppercase tracking-wide text-[#64748B]">{month}</span>
      <span className="text-base font-extrabold leading-none text-[#0F172A]">{day}</span>
      <span className="text-[9px] text-[#64748B]">{weekday}</span>
    </div>
  );
}

function MentorCell({ name, avatar }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {avatar ? (
        <img src={avatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#133B5D]/10 text-[10px] font-bold text-[#133B5D]">
          {getInitials(name)}
        </span>
      )}
      <span className="truncate text-sm font-medium text-[#0F172A]">{name}</span>
    </div>
  );
}

function RecordingCell({ item }) {
  if (!item.hasRecording) return <span className="text-sm text-[#64748B]">—</span>;
  return (
    <a
      href={item.recordingUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-[#133B5D] hover:underline"
    >
      <Play className="h-3.5 w-3.5" /> Available
    </a>
  );
}

function RowMenu({ item, onAction }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More actions for ${item.title}`}
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:border-[#133B5D]/30 hover:text-[#133B5D]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {createPortal(<div className="fixed z-[200] w-48 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white py-1 text-left shadow-xl" style={{ top: Math.max(8, (buttonRef.current?.getBoundingClientRect().bottom || 0) + 6), left: Math.max(8, (buttonRef.current?.getBoundingClientRect().right || 0) - 192) }}>
            <button
              type="button"
              onClick={() => { setOpen(false); onAction("details", item); }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onAction("attendance", item); }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              View Attendance
            </button>
            {item.hasRecording && (
              <button
                type="button"
                onClick={() => { setOpen(false); onAction("recording", item); }}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                View Recording
              </button>
            )}
          </div>, document.body)}
        </>
      )}
    </div>
  );
}

function PrimaryAction({ item, onOpen, onDetails }) {
  const isLive = ["scheduled", "live"].includes(item.status);
  return (
    <button
      type="button"
      onClick={() => (isLive ? onOpen(item) : onDetails(item))}
      className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#133B5D] transition hover:border-[#133B5D]/40 hover:bg-[#133B5D]/5"
    >
      {isLive ? "Open Class" : "View Details"}
    </button>
  );
}

function TodayCard({ item, onOpen, onDetails, onMenuAction }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#F39924]/30 bg-[#F39924]/[0.04] p-3.5 sm:flex-row sm:items-center">
      <DateBlock startAt={item.startAt} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#0F172A]">{item.title}</p>
        {item.courseName && item.courseName !== "-" && (
          <p className="truncate text-xs text-[#64748B]">{item.courseName}</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
          <Clock className="h-3 w-3" /> {item.timeLabel || "Not Available"}
        </p>
      </div>
      <MentorCell name={item.mentorName} avatar={item.mentorAvatar} />
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <StatusBadge status={item.statusTone} label={item.statusLabel} size="sm" pulse={item.status === "live"} />
        <span className="text-xs text-[#64748B]">{attendanceLabel(item)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <PrimaryAction item={item} onOpen={onOpen} onDetails={onDetails} />
        <RowMenu item={item} onAction={onMenuAction} />
      </div>
    </div>
  );
}

function ClassTableRow({ item, onOpen, onDetails, onMenuAction }) {
  return (
    <tr className="transition hover:bg-[#F8FAFC]">
      <td className="px-3 py-3"><DateBlock startAt={item.startAt} /></td>
      <td className="min-w-0 px-3 py-3">
        <p className="truncate text-sm font-semibold text-[#0F172A]">{item.title}</p>
        {item.courseName && item.courseName !== "-" && (
          <p className="truncate text-xs text-[#64748B]">{item.courseName}</p>
        )}
      </td>
      <td className="px-3 py-3"><MentorCell name={item.mentorName} avatar={item.mentorAvatar} /></td>
      <td className="px-3 py-3">
        <StatusBadge status={item.statusTone} label={item.statusLabel} size="sm" pulse={item.status === "live"} />
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-[#64748B]">{attendanceLabel(item)}</td>
      <td className="px-3 py-3"><RecordingCell item={item} /></td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <PrimaryAction item={item} onOpen={onOpen} onDetails={onDetails} />
          <RowMenu item={item} onAction={onMenuAction} />
        </div>
      </td>
    </tr>
  );
}

function ClassMobileCard({ item, onOpen, onDetails, onMenuAction }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5">
      <div className="flex items-start gap-3">
        <DateBlock startAt={item.startAt} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#0F172A]">{item.title}</p>
          <p className="truncate text-xs text-[#64748B]">{item.timeLabel || "Not Available"}</p>
          <div className="mt-1.5"><MentorCell name={item.mentorName} avatar={item.mentorAvatar} /></div>
        </div>
        <RowMenu item={item} onAction={onMenuAction} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.statusTone} label={item.statusLabel} size="sm" pulse={item.status === "live"} />
          <span className="text-xs text-[#64748B]">{attendanceLabel(item)}</span>
        </div>
        <PrimaryAction item={item} onOpen={onOpen} onDetails={onDetails} />
      </div>
    </div>
  );
}

function CalendarCard({ item, onOpen, onDetails }) {
  const isLive = ["scheduled", "live"].includes(item.status);
  return (
    <button
      type="button"
      onClick={() => (isLive ? onOpen(item) : onDetails(item))}
      className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <DateBlock startAt={item.startAt} />
        <StatusBadge status={item.statusTone} label={item.statusLabel} size="sm" pulse={item.status === "live"} />
      </div>
      <p className="mt-2.5 truncate text-sm font-bold text-[#0F172A]">{item.title}</p>
      <p className="mt-1 text-xs text-[#64748B]">{item.timeLabel || "Not Available"}</p>
      <p className="mt-2 truncate text-xs font-medium text-[#64748B]">{item.mentorName}</p>
    </button>
  );
}

function DrawerField({ icon: Icon, children }) {
  return (
    <p className="flex items-center gap-2 text-sm text-[#0F172A]">
      <Icon className="h-4 w-4 shrink-0 text-[#64748B]" />
      {children}
    </p>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div className="border-t border-[#E2E8F0] px-5 py-4 first:border-t-0">
      <h4 className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{title}</h4>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function ClassDetailsDrawer({ item, onClose, onOpenFull, onViewAttendance }) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Class details"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Class Details</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close class details"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#F8FAFC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pt-4">
                <p className="text-base font-bold text-[#0F172A]">{item.title}</p>
                <div className="mt-2">
                  <StatusBadge status={item.statusTone} label={item.statusLabel} size="sm" pulse={item.status === "live"} />
                </div>
                <div className="mt-3 space-y-2">
                  <DrawerField icon={CalendarDays}>{item.dateLabel || "Not Available"}</DrawerField>
                  <DrawerField icon={Clock}>{item.timeLabel || "Not Available"}</DrawerField>
                  <DrawerField icon={Users}>{item.mentorName}</DrawerField>
                  <DrawerField icon={Users}>{item.studentsCount || 0} Students</DrawerField>
                  <DrawerField icon={Tag}>Class ID: {item.id}</DrawerField>
                </div>
              </div>

              <DrawerSection title="Attendance">
                <p className="text-sm text-[#64748B]">{attendanceLabel(item)}</p>
                <button
                  type="button"
                  onClick={() => onViewAttendance(item)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#133B5D] hover:bg-[#F8FAFC]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Attendance
                </button>
              </DrawerSection>

              <DrawerSection title="Class Notes">
                <p className="text-sm leading-6 text-[#64748B]">{item.notesText || "No notes added for this class."}</p>
              </DrawerSection>

              <DrawerSection title="Materials">
                {item.resources?.length ? (
                  <ul className="space-y-1.5">
                    {item.resources.map((resource) => (
                      <li key={resource} className="flex items-center gap-2 text-sm text-[#0F172A]">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[#64748B]" /> {resource}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#64748B]">No materials uploaded.</p>
                )}
              </DrawerSection>

              <DrawerSection title="Recording">
                {item.hasRecording ? (
                  <a
                    href={item.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#133B5D] hover:underline"
                  >
                    <Video className="h-3.5 w-3.5" /> Open recording
                  </a>
                ) : (
                  <p className="text-sm text-[#64748B]">No recording available yet.</p>
                )}
              </DrawerSection>
            </div>

            <div className="border-t border-[#E2E8F0] px-5 py-4">
              <button
                type="button"
                onClick={() => onOpenFull(item)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#133B5D] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                <ExternalLink className="h-4 w-4" /> Open in Live Classes
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ScheduleClasses({ classes, loading, error, onRetry }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [mentorFilter, setMentorFilter] = useState("All Mentors");
  const [view, setView] = useState("list");
  const [detailsItem, setDetailsItem] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentTimestamp] = useState(() => Date.now());

  const mentors = useMemo(() => {
    const names = new Set();
    classes.forEach((item) => {
      if (item.mentorName && item.mentorName !== "Not Assigned") names.add(item.mentorName);
    });
    return ["All Mentors", ...[...names].sort()];
  }, [classes]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const statusKey = STATUS_FILTER_MAP[statusFilter];
    return classes.filter((item) => {
      if (statusKey && item.status !== statusKey) return false;
      // A stale scheduled/live record must not appear in the upcoming area
      // after its end time has passed.
      if (["scheduled", "live"].includes(item.status)) {
        const cutoff = item.endAt || item.startAt;
        if (cutoff && new Date(cutoff).getTime() < currentTimestamp) return false;
      }
      if (mentorFilter !== "All Mentors" && item.mentorName !== mentorFilter) return false;
      if (query) {
        const haystack = item.searchIndex || `${item.title} ${item.mentorName} ${item.courseName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [classes, search, statusFilter, mentorFilter, currentTimestamp]);

  const statusCounts = useMemo(() => Object.fromEntries(STATUS_FILTERS.map((label) => [
    label,
    label === "All" ? classes.length : classes.filter((item) => item.status === STATUS_FILTER_MAP[label]).length,
  ])), [classes]);
  const today = todayKey();
  const todayItems = filtered.filter((item) => item.startDate === today && ["scheduled", "live"].includes(item.status));
  const restItems = filtered
    // The lower section is specifically upcoming. Completed and cancelled
    // sessions belong in their respective status filters, not here.
    .filter((item) => item.status === "scheduled" && item.startDate !== today)
    .slice()
    .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0));
  const completedItems = filtered.filter((item) => item.status === "completed").sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));
  const cancelledItems = filtered.filter((item) => item.status === "cancelled").sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));
  const displayedItems = statusFilter === "Completed" ? completedItems : statusFilter === "Cancelled" ? cancelledItems : [...todayItems, ...restItems];

  // Deep-links into the real, fully-wired Live Classes workspace (Start/End/
  // Cancel/Edit/Upload) instead of re-implementing those mutations here — the
  // search-based `?class=` and id-based `?attendance=` params already exist
  // on that page (see LiveClasses.jsx) for exactly this purpose.
  const openInLiveClasses = (item) => {
    const query = [item.title, item.batchName].filter(Boolean).join(" ");
    navigate(`/organization/live-classes?class=${encodeURIComponent(query)}`);
  };
  const openAttendance = (item) => {
    navigate(`/organization/live-classes?attendance=${encodeURIComponent(item.id)}`);
  };
  const pageCount = Math.max(1, Math.ceil(displayedItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = displayedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handleMenuAction = (action, item) => {
    if (action === "details") setDetailsItem(item);
    else if (action === "attendance") openAttendance(item);
    else if (action === "recording" && item.recordingUrl) window.open(item.recordingUrl, "_blank", "noreferrer");
  };

  return (
    <>
      <section className="sc-panel overflow-hidden rounded-[18px] border border-[#e6edf6] bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e3edfc] text-[#1d63d8]" aria-hidden="true"><CalendarDays className="h-7 w-7" /></span>
            <div>
              <h2 className="text-[22px] font-extrabold text-[#0b1f3f]">Schedule & Classes</h2>
              <p className="mt-0.5 text-sm text-[#3b5270]">Manage and track all classes for this batch.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/organization/live-classes")} className="pk-btn pk-btn--orange">
            <Plus /> Schedule Class
          </button>
        </header>

        <div className="sc-toolbar flex flex-col gap-3 px-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                aria-pressed={statusFilter === label}
                onClick={() => { setStatusFilter(label); setPage(1); }}
                className={`sc-pill sc-pill--${label.toLowerCase()}`}
              >
                {label} ({statusCounts[label]})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search classes, topic or mentor..."
                className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-3 text-xs outline-none focus:border-[#133B5D] sm:w-52"
              />
            </label>
            <select
              value={mentorFilter}
              onChange={(event) => { setMentorFilter(event.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#0F172A] outline-none focus:border-[#133B5D]"
            >
              {mentors.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5">
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView("list")}
                className={`rounded p-1.5 ${view === "list" ? "bg-[#133B5D] text-white" : "text-[#64748B]"}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Calendar view"
                onClick={() => setView("calendar")}
                className={`rounded p-1.5 ${view === "calendar" ? "bg-[#133B5D] text-white" : "text-[#64748B]"}`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="grid min-h-56 place-items-center rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
              Loading classes…
            </div>
          ) : error ? (
            <div className="grid min-h-56 place-items-center rounded-xl border border-rose-200 p-8 text-center">
              <div>
                <p className="text-sm font-semibold text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 rounded-lg bg-[#133B5D] px-3 py-2 text-xs font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !classes.length ? (
            <EmptyState
              icon={CalendarDays}
              title="No classes scheduled"
              description="Schedule your first class for this batch."
              action={
                <button
                  type="button"
                  onClick={() => navigate("/organization/live-classes")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F39924] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" /> Schedule Class
                </button>
              }
            />
          ) : (
            <>
              {todayItems.length > 0 && (
                <div className="sc-today mb-6">
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className="sc-today__badge">
                      Today
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {todayItems.length} class{todayItems.length === 1 ? "" : "es"} scheduled
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {todayItems.map((item) => (
                      <TodayCard
                        key={item.id}
                        item={item}
                        onOpen={openInLiveClasses}
                        onDetails={setDetailsItem}
                        onMenuAction={handleMenuAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3 flex items-center justify-between gap-3 border-t border-[#edf1f6] pt-5">
                <h3 className="text-[19px] font-extrabold text-[#0b1f3f]">{statusFilter === "Completed" ? "Completed Classes" : statusFilter === "Cancelled" ? "Cancelled Classes" : "Upcoming Classes"} ({displayedItems.length})</h3>
                {displayedItems.length > pageSize && (
                  <button type="button" className="sc-viewall" onClick={() => { setPageSize(displayedItems.length); setPage(1); }}>
                    View All <ChevronRight aria-hidden="true" />
                  </button>
                )}
              </div>
              {!displayedItems.length ? (
                <EmptyState
                  icon={Search}
                  title="No classes found"
                  description="Try changing your search or filters."
                  compact
                />
              ) : view === "calendar" ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pageItems.map((item) => (
                    <CalendarCard key={item.id} item={item} onOpen={openInLiveClasses} onDetails={setDetailsItem} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto rounded-xl border border-[#E2E8F0] md:block">
                    <table className="sc-table w-full min-w-[860px] text-left text-xs">
                      <thead>
                        <tr>
                          {["Date", "Class / Topic", "Mentor", "Status", "Attendance", "Recording", "Actions"].map((heading) => (
                            <th key={heading} className={`px-3 py-3 font-bold ${heading === "Actions" ? "text-right" : ""}`}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {pageItems.map((item) => (
                          <ClassTableRow
                            key={item.id}
                            item={item}
                            onOpen={openInLiveClasses}
                            onDetails={setDetailsItem}
                            onMenuAction={handleMenuAction}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2.5 md:hidden">
                    {pageItems.map((item) => (
                      <ClassMobileCard
                        key={item.id}
                        item={item}
                        onOpen={openInLiveClasses}
                        onDetails={setDetailsItem}
                        onMenuAction={handleMenuAction}
                      />
                    ))}
                  </div>
                </>
              )}
              {displayedItems.length > 0 && (
                <div className="pk-pager">
                  <p>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedItems.length)} of {displayedItems.length} classes</p>
                  <div className="pk-pager__nav">
                    <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></button>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                      <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
                    ))}
                    <button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight /></button>
                    <select className="pk-select !min-w-[110px]" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Classes per page">
                      {[...new Set([10, 25, 50, pageSize])].sort((a, b) => a - b).map((size) => <option key={size} value={size}>{size} / page</option>)}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <ClassDetailsDrawer
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onOpenFull={openInLiveClasses}
        onViewAttendance={openAttendance}
      />
    </>
  );
}
