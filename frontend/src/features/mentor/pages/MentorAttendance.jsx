import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  LogIn,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  GraduationCap,
  Timer,
} from "lucide-react";
import MentorBanner from "../components/MentorBanner";
import KPI from "@/components/common/KPI";
import "./mentor-attendance-density.css";
import { MENTOR_BANNERS } from "../constants/mentorBanners";
import { describeAttendanceError, formatDuration, formatTime, mentorAttendanceEvent, mentorWorkAttendance, workingMinutes } from "../services/mentorWorkAttendance";
import { useAuth } from "@shared/hooks/useAuth";
import usePermission from "@shared/hooks/usePermission";
import { useCurrentUserPhoto } from "@shared/hooks/useProfilePhoto";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { useNavigate } from "react-router-dom";
import { mentorService } from "@shared/services/mentorService";
import { getMentorSessionIdentity, logMentorSessionIdentity } from "../utils/mentorSessionIdentity";
import { getAttendancePeriodRange, isWeekendDate, listAttendanceDateKeys } from "../utils/attendanceDateRange";

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatLongDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatRange = (start, end) => {
  const formatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};


function MentorAttendanceContent() {
  const { user, employeeIdResolving } = useAuth();
  const [clock, setClock] = useState(() => Date.now());
  const now = new Date(clock);
  const [period, setPeriod] = useState("Week");
  const [statusFilter, setStatusFilter] = useState("All");
  const [recordSearch, setRecordSearch] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "asc" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(() => mentorWorkAttendance.getHistory());
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(null);
  const historySectionRef = useRef(null);
  const loadedIdentityRef = useRef("");
  const sessionIdentity = useMemo(() => getMentorSessionIdentity(user), [user]);
  const attendanceIdentity = useMemo(() => ({
    ...mentorWorkAttendance.getIdentity(user),
    id: mentorWorkAttendance.getIdentity(user).id ?? resolvedEmployeeId,
  }), [user, resolvedEmployeeId]);
  const attendanceIdentityKey = `${attendanceIdentity.id ?? ""}:${attendanceIdentity.email ?? ""}`;
  const { hasPermission: hasAttendancePermission, role: permissionRole } = usePermission();
  const frontendGateGrantsAttendance = hasAttendancePermission("attendance");

  useEffect(() => {
    logMentorSessionIdentity(user, sessionIdentity);
  }, [user, sessionIdentity]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // Surfaces the exact mismatch this feature is prone to: the frontend
    // permission gate (Organization > Employee Access, via usePermission)
    // can say "attendance" is granted while the EmployeeAttendance API
    // still 403s — that combination is a backend authorization bug, not a
    // disabled permission, and this log is what proves which side is at
    // fault for a given mentor/employeeId.
    console.log("[Mentor Attendance] permission vs. API gate", {
      employeeId: attendanceIdentity.id ?? null,
      role: permissionRole,
      frontendGateGrantsAttendance,
    });
  }, [attendanceIdentity.id, permissionRole, frontendGateGrantsAttendance]);
  const mentorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.fullName ||
    "Mentor";
  const mentorDisplayName = mentorName.replace(/\b\w/g, (letter) => letter.toUpperCase());

  useEffect(() => {
    if (attendanceIdentity.id || !sessionIdentity.mentorId) return undefined;
    let active = true;
    mentorService.getMentor(sessionIdentity.mentorId)
      .then((profile) => {
        if (!active) return;
        const employeeId = profile?.employeeId ?? profile?.EmployeeId
          ?? profile?.employee?.employeeId ?? profile?.employee?.id
          ?? profile?.data?.employeeId ?? profile?.data?.EmployeeId;
        if (employeeId !== undefined && employeeId !== null && String(employeeId).trim()) {
          setResolvedEmployeeId(employeeId);
          localStorage.setItem("employeeId", String(employeeId));
        }
      })
      .catch(() => {
        // Some deployments do not expose the mentor profile endpoint. In that
        // case the attendance API still uses the authenticated session scope.
      });
    return () => { active = false; };
  }, [attendanceIdentity.id, sessionIdentity.mentorId]);

  const todayKey = dateKey(now);
  const today = history.find((item) => item.date === todayKey) || null;
  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);
  const working = hasCheckedIn && !hasCheckedOut;
  const completed = hasCheckedOut;
  const todayMinutes = today ? workingMinutes(today, now) : 0;
  const selectedRange = useMemo(() => getAttendancePeriodRange(period), [period]);

  const reloadAttendance = useCallback(async () => {
    try {
      await mentorWorkAttendance.load(attendanceIdentity, selectedRange);
      setHistory(mentorWorkAttendance.getHistory());
      setError("");
    } catch (requestError) {
      setError(describeAttendanceError(requestError, attendanceIdentity, "Unable to load today's attendance. Please try again."));
    }
  }, [attendanceIdentity, selectedRange]);

  useEffect(() => {
    // AuthContext may still be resolving employeeId (login response didn't
    // include one, so it's checking the profile fallbacks) — wait for that
    // to settle instead of firing GET /api/EmployeeAttendance with no
    // employeeId filter and then refetching a moment later once it resolves.
    if (employeeIdResolving) return undefined;
    if (loadedIdentityRef.current === attendanceIdentityKey) return undefined;
    loadedIdentityRef.current = attendanceIdentityKey;
    void reloadAttendance();
    const refresh = () => setHistory(mentorWorkAttendance.getHistory());
    window.addEventListener(mentorAttendanceEvent, refresh);
    return () => {
      window.removeEventListener(mentorAttendanceEvent, refresh);
    };
  }, [attendanceIdentityKey, employeeIdResolving, reloadAttendance]);

  useEffect(() => {
    const refreshFromServer = () => {
      if (document.visibilityState === "visible") void reloadAttendance();
    };
    window.addEventListener("focus", refreshFromServer);
    document.addEventListener("visibilitychange", refreshFromServer);
    return () => {
      window.removeEventListener("focus", refreshFromServer);
      document.removeEventListener("visibilitychange", refreshFromServer);
    };
  }, [reloadAttendance]);

  useEffect(() => {
    if (!working) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [working]);

  const visibleRows = useMemo(() => {
    const records = history
      .filter((row) => {
        const rowDate = new Date(`${row.date}T12:00:00`);
        const periodMatch = rowDate >= selectedRange.start && rowDate <= selectedRange.end;

        const normalizedStatus = String(row.status || "").toLowerCase();
        const statusMatch =
          statusFilter === "All" ||
          normalizedStatus === statusFilter.toLowerCase() ||
          (statusFilter === "Present" && Boolean(row.checkIn));

        return periodMatch && statusMatch;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Week views list every calendar day. Days without a record become
    // display-only placeholders — no attendance fields are fabricated.
    if (statusFilter !== "All") return records;
    const recordsByDate = new Map();
    records.forEach((row) => {
      if (!recordsByDate.has(row.date)) recordsByDate.set(row.date, row);
    });
    return listAttendanceDateKeys(selectedRange.start, selectedRange.end).map(
      (date) => recordsByDate.get(date) ?? { id: `day-${date}`, date, placeholder: true },
    );
  }, [history, period, selectedRange, statusFilter]);

  const periodRange = formatRange(selectedRange.start, selectedRange.end);

  // Display-only rows for the records table: label, tone and minutes are
  // derived once so search, sort, export and pagination all agree.
  const recordRows = useMemo(() => visibleRows.map((row) => {
    const rowDate = new Date(`${row.date}T12:00:00`);
    const rowStatus = String(row.status || "").toLowerCase();
    const statusLabel = row.placeholder
      ? isWeekendDate(rowDate) ? "Weekend" : "Absent"
      : rowStatus === "working" && !row.checkOut && row.date !== todayKey ? "Present" : row.status || "Not marked";
    const tone = row.placeholder
      ? isWeekendDate(rowDate) ? "orange" : "gray"
      : rowStatus === "present" || rowStatus === "presented" ? "green"
        : rowStatus === "working" && row.date !== todayKey ? "green"
          : rowStatus === "working" ? "blue"
          : rowStatus === "late" ? "orange"
            : rowStatus === "absent" ? "red" : "gray";
    const minutes = row.placeholder ? null
      : row.checkIn && (row.checkOut || row.date === todayKey) ? workingMinutes(row, now) : 0;
    return {
      row,
      rowDate,
      day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(rowDate),
      dateText: new Intl.DateTimeFormat("en-GB").format(rowDate),
      checkIn: row.checkIn ? formatTime(row.checkIn) : "",
      checkOut: row.checkOut ? formatTime(row.checkOut) : "",
      minutes,
      statusLabel,
      tone,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [visibleRows, todayKey, clock]);

  const recordQuery = recordSearch.trim().toLowerCase();
  const sortedRecords = useMemo(() => {
    const filtered = recordRows.filter((item) => !recordQuery
      || [item.day, item.dateText, item.statusLabel, item.checkIn, item.checkOut].some((value) => String(value).toLowerCase().includes(recordQuery)));
    const valueOf = (item) => {
      if (sort.key === "checkIn") return item.row.checkIn || "";
      if (sort.key === "checkOut") return item.row.checkOut || "";
      if (sort.key === "hours") return item.minutes ?? -1;
      if (sort.key === "status") return item.statusLabel;
      return item.row.date;
    };
    return [...filtered].sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      const result = typeof left === "number" ? left - right : String(left).localeCompare(String(right));
      return sort.dir === "asc" ? result : -result;
    });
  }, [recordRows, recordQuery, sort]);

  const PAGE_SIZE = 10;
  const pageCount = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRecords = sortedRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key) => setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));

  const exportRecords = () => {
    const header = ["#", "Day", "Date", "Check In", "Check Out", "Working Hours", "Status"];
    const lines = sortedRecords.map((item, index) => [
      index + 1, item.day, item.dateText, item.checkIn || "-", item.checkOut || "-",
      item.minutes == null ? "-" : formatDuration(item.minutes), item.statusLabel,
    ]);
    const csv = [header, ...lines].map((cells) => cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${dateKey(selectedRange.start)}-to-${dateKey(selectedRange.end)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitAttendance = async (action) => {
    if (actionLoading || completed || (action === "checkIn" && working) || (action === "checkOut" && !working)) return;
    setActionLoading(true);
    setError("");

    try {
      if (action === "checkIn") await mentorWorkAttendance.checkIn(attendanceIdentity);
      else await mentorWorkAttendance.checkOut(attendanceIdentity);
      setHistory(mentorWorkAttendance.getHistory());
  } catch (requestError) {
    setHistory(mentorWorkAttendance.getHistory());
    setError(describeAttendanceError(requestError, attendanceIdentity, action === "checkIn" ? "Unable to check in." : "Unable to check out."));
    } finally {
      setActionLoading(false);
    }
  };

  const scrollToHistory = () => historySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const summaryCards = [
    {
      label: "Check In",
      value: hasCheckedIn ? formatTime(today?.checkIn) : "--",
      note: hasCheckedIn ? "First punch of the day" : "Not checked in yet",
      icon: Clock3,
      tone: "emerald",
      onClick: scrollToHistory,
    },
    {
      label: "Check Out",
      value: hasCheckedOut ? formatTime(today?.checkOut) : "--",
      note: hasCheckedOut ? "Shift ended" : working ? "Pending check-out" : "Awaiting checkout",
      icon: LogOut,
      tone: "slate",
      onClick: scrollToHistory,
    },
    {
      label: "Working Hours",
      value: formatDuration(todayMinutes),
      note: completed ? "Total duration" : "Running total",
      icon: Timer,
      tone: "amber",
      onClick: scrollToHistory,
    },
  ];

  const ownPhoto = useCurrentUserPhoto();
  const initials = mentorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "M";
  const statTones = { emerald: "green", slate: "blue", amber: "orange" };

  return (
    <main className="mentor-attendance-v15 mv15 mv17 mx-auto max-w-[1500px] space-y-2.5 px-3 py-2 sm:px-4">
      <MentorBanner
        variant="attendance"
        className="mv20-att-banner"
        eyebrow="Mentor Portal"
        eyebrowStyle="text"
        title="My"
        highlight="Attendance"
        subtitle={<>Track your check in and out, manage your working hours, and stay<br className="mv15-hide-md" /> consistent with your teaching commitments.</>}
        features={[
          { icon: ShieldCheck, title: "Be Consistent", tone: "blue" },
          { icon: Timer, title: "Track Your Hours", tone: "purple" },
          { icon: GraduationCap, title: "Build Better Learning", tone: "blue" },
        ]}
        featureShape="chip"
        art={(
          <div className="mv20-att-art">
            <AttendanceCalendarArt />
            <img src={MENTOR_BANNERS.attendance.src} alt="" draggable={false} decoding="async" onError={(event) => { if (MENTOR_BANNERS.attendance.fallbackSrc && !event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = "1"; event.currentTarget.src = MENTOR_BANNERS.attendance.fallbackSrc; } }} />
          </div>
        )}
        script={["Your", "Commitment", "Builds", "Brighter Futures"]}
        actions={(
          <>
            <button
              type="button"
              disabled={actionLoading || hasCheckedIn || completed}
              onClick={() => submitAttendance("checkIn")}
              className="mentor-hero-btn mentor-hero-btn--primary mv17-btn-lg min-w-[150px]"
            >
              <ArrowRight className="h-4 w-4" />
              {actionLoading && !hasCheckedIn ? "Checking in..." : "Check In"}
            </button>
            <button
              type="button"
              disabled={actionLoading || !working}
              onClick={() => submitAttendance("checkOut")}
              className="mentor-hero-btn mentor-hero-btn--ghost mv17-btn-lg mv17-btn-navy-outline min-w-[150px]"
            >
              <LogOut className="h-4 w-4" />
              {actionLoading && working ? "Checking out..." : "Check Out"}
            </button>
          </>
        )}
      />

      {error && (
        <div className="mv15-alert" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reloadAttendance}>
            <RefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <section className="mv15-card mv15-identity" aria-label="Today">
        <div className="mv15-identity__who">
          <span className="mv15-avatar mv15-avatar--navy overflow-hidden"><AvatarPhoto src={ownPhoto} alt="" fallback={initials} /></span>
          <div>
            <p className="mv15-identity__name">{mentorDisplayName}</p>
            <p className="mv15-identity__role">Mentor</p>
          </div>
        </div>
        <span className="mv15-identity__divider" aria-hidden="true" />
        <p className="mv15-date-pill"><CalendarDays aria-hidden="true" />{formatLongDate(now)}</p>
        <span className="mv15-identity__divider" aria-hidden="true" />
        <div className="mv15-identity__status">
          <span className={`mv15-status-icon ${completed ? "is-done" : working ? "is-working" : "is-idle"}`} aria-hidden="true">
            {completed ? <Check /> : working ? <Clock3 /> : <CalendarDays />}
          </span>
          <div>
            <p className="mv15-identity__status-title">
              {completed ? "Your shift is completed for today." : working ? "You are currently working." : "Start your attendance for today."}
            </p>
            <p className="mv15-identity__status-text">
              {completed ? "You can view your attendance summary below." : working ? "Remember to check out when your shift ends." : "Use Check In above to record your first punch."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 md:grid-cols-3" aria-label="Today's attendance summary">
        {summaryCards.map(({ label, value, note, icon: Icon, tone, onClick }) => (
          <KPI
            key={label}
            label={label}
            value={value}
            description={note}
            icon={Icon}
            accent={statTones[tone] || "blue"}
            onClick={onClick}
          />
        ))}
      </section>

      <section ref={historySectionRef} className="mv15-card mv15-history mv17-records scroll-mt-20" aria-label="Attendance records">
        <div className="mv17-records__head">
          <div className="mv17-records__title">
            <span className="mv17-records__icon" aria-hidden="true"><CalendarDays /></span>
            <h2>Attendance Records</h2>
            <span>{periodRange}</span>
          </div>
          <div className="mv17-records__tools">
            <label className="mv17-search">
              <Search aria-hidden="true" />
              <input
                value={recordSearch}
                onChange={(event) => { setRecordSearch(event.target.value); setPage(1); }}
                placeholder="Search by date or status..."
                aria-label="Search attendance records"
              />
            </label>
            <div className="mv17-menu-wrap">
              <button type="button" className={`mv17-tool-btn ${statusFilter !== "All" ? "is-active" : ""}`} aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}>
                <Filter aria-hidden="true" />
                {statusFilter === "All" ? "Filter" : statusFilter}
              </button>
              {filterOpen && (
                <div className="mv17-menu" role="menu">
                  {["All", "Present", "Working", "Late", "Absent"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="menuitemradio"
                      aria-checked={statusFilter === item}
                      onClick={() => { setStatusFilter(item); setFilterOpen(false); setPage(1); }}
                    >
                      {item === "All" ? "All statuses" : item}
                      {statusFilter === item && <Check aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="mv17-tool-btn mv17-tool-btn--navy" onClick={exportRecords} disabled={!sortedRecords.length}>
              <Download aria-hidden="true" />
              Export
            </button>
            <div className="mv17-segmented" role="group" aria-label="Attendance period">
              {["Week", "Last Week", "Month", "Last Month"].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={period === item}
                  onClick={() => { setPeriod(item); setPage(1); }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mv17-table-wrap">
          <table data-table-header="plain" className="mv17-table">
            <thead>
              <tr>
                <th scope="col" className="mv17-col-num">#</th>
                {[
                  ["date", "Day", CalendarDays, "is-navy"],
                  ["date", "Date", CalendarDays, "is-blue"],
                  ["checkIn", "Check In", LogIn, "is-green"],
                  ["checkOut", "Check Out", LogOut, "is-blue"],
                  ["hours", "Working Hours", Timer, "is-orange"],
                  ["status", "Status", ArrowRight, "is-navy"],
                ].map(([key, label, Icon, tone], index) => (
                  <th key={label} scope="col" aria-sort={sort.key === key && index !== 0 ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                    <button type="button" className="mv17-th" onClick={() => toggleSort(key)}>
                      <Icon className={tone} aria-hidden="true" />
                      {label}
                      <ArrowUpDown className="mv17-th__sort" aria-hidden="true" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRecords.map((item, index) => (
                <tr key={item.row.id} data-today={item.row.date === todayKey || undefined}>
                  <td className="mv17-col-num">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="text-center"><span className="mv17-day-pill">{item.day}</span></td>
                  <td>{item.dateText}</td>
                  <td>{item.checkIn ? <span className="mv17-punch"><i className="is-green" />{item.checkIn}</span> : <span className="mv17-dash">—</span>}</td>
                  <td>{item.checkOut ? <span className="mv17-punch"><i className="is-blue" />{item.checkOut}</span> : <span className="mv17-dash">—</span>}</td>
                  <td>
                    <span className={`mv17-hours ${item.minutes > 0 ? "is-active" : ""}`}>
                      <Clock3 aria-hidden="true" />
                      {item.minutes == null ? "—" : formatDuration(item.minutes)}
                    </span>
                  </td>
                  <td><span className={`mv17-status mv17-status--${item.tone}`}><i />{item.statusLabel}</span></td>
                </tr>
              ))}
              {!pagedRecords.length && (
                <tr>
                  <td colSpan="7" className="mv15-empty-cell">
                    {recordQuery ? "No records match your search." : "No attendance records available for this period."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mv17-table-foot">
          <p>
            {sortedRecords.length
              ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(currentPage * PAGE_SIZE, sortedRecords.length)} of ${sortedRecords.length} records`
              : "Showing 0 records"}
          </p>
          <div className="mv17-pager" aria-label="Pagination">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
            ))}
            <button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight /></button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MentorAttendance() {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermission();

  useEffect(() => {
    if (!isLoading && !hasPermission("attendance")) {
      navigate("/mentor/dashboard", { replace: true });
    }
  }, [hasPermission, isLoading, navigate]);

  if (isLoading || !hasPermission("attendance")) return null;
  return <MentorAttendanceContent />;
}

/* Calendar + alarm clock drawn next to the mentor artwork (attendance banner). */
function AttendanceCalendarArt() {
  return (
    <svg className="mv20-att-art__cal" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <g transform="rotate(-8 70 80)">
        <rect x="14" y="30" width="112" height="96" rx="14" fill="#ffffff" stroke="#c9d9f2" strokeWidth="2" />
        <path d="M14 44 a14 14 0 0 1 14 -14 H112 a14 14 0 0 1 14 14 V56 H14 Z" fill="#2f6fe4" />
        {[34, 58, 82, 106].map((x) => <rect key={x} x={x - 4} y="20" width="8" height="20" rx="4" fill="#1c3f78" />)}
        {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => <rect key={`${row}-${col}`} x={26 + col * 24} y={66 + row * 18} width="16" height="11" rx="3" fill="#e4ecf8" />))}
        <circle cx="96" cy="98" r="18" fill="#2f6fe4" />
        <path d="M88 98 L94 104 L105 91" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(150 40)">
        <circle r="30" fill="#f39924" />
        <circle r="24" fill="#ffffff" />
        <path d="M0 -14 V0 L10 6" stroke="#0f2a4a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle r="2.5" fill="#0f2a4a" />
        <path d="M-26 -22 L-18 -30 M26 -22 L18 -30" stroke="#f39924" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
