import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  CalendarDays,
  BarChart3,
  CirclePlus,
  FileCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock3,
  Copy,
  Eye,
  FileText,
  Filter,
  House,
  Briefcase,
  MessageSquareText,
  MoreVertical,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  XCircle,
  Paperclip,
  Send,
  Upload,
  CalendarCheck,
  NotebookPen,
} from "lucide-react";
import toast from "react-hot-toast";
import leaveRequestService from "@shared/services/leaveRequestService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import KiniDialog, { KiniDetailRow } from "@shared/components/KiniDialog";
import KPI from "@/components/common/KPI";
import { thVariant } from "@/components/common/Table/tableHeaderVariants";
import MentorBanner from "@features/mentor/components/MentorBanner";
import { MENTOR_BANNERS } from "@features/mentor/constants/mentorBanners";
import { LeaveArt, WorkFromHomeArt } from "@features/mentor/components/MentorHeroArt";
import "./leave-request-modal.css";

const LEAVE_TYPES = ["Casual", "Sick", "Earned", "Work From Home", "Other"];

const STATUS_STYLE = {
  pending: { pill: "bg-amber-50 text-amber-700 ring-amber-100", dot: "bg-amber-500" },
  approved: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-100", dot: "bg-emerald-500" },
  rejected: { pill: "bg-rose-50 text-rose-700 ring-rose-100", dot: "bg-rose-500" },
};
const FALLBACK_STATUS = { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" };

// Icon + tint per leave type (matches the design's coloured type chips).
const TYPE_STYLE = {
  sick: { icon: Plus, className: "bg-rose-50 text-rose-500 ring-rose-100" },
  "work from home": { icon: House, className: "bg-blue-50 text-blue-600 ring-blue-100" },
  casual: { icon: Plane, className: "bg-amber-50 text-amber-600 ring-amber-100" },
  earned: { icon: Briefcase, className: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
};
const typeStyle = (type) =>
  TYPE_STYLE[String(type ?? "").trim().toLowerCase()] ?? { icon: FileText, className: "bg-violet-50 text-violet-600 ring-violet-100" };

const PAGE_SIZES = [10, 20, 50];
const REASON_MAX = 500;
const ATTACHMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const TYPE_BADGE = { "work from home": "WFH", sick: "SL", casual: "CL", earned: "EL" };
const leaveTypeLabel = (type) => (type === "Work From Home" || type === "Other" ? type : `${type} Leave`);

const toDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Inclusive calendar-day span; only used when the API does not send totalDays.
const spanDays = (start, end) => {
  const a = toDay(start);
  const b = toDay(end);
  if (!a || !b || b < a) return null;
  return Math.round((b - a) / 86400000) + 1;
};

const durationLabel = (row) => {
  const days = row.days ?? spanDays(row.startDate, row.endDate);
  if (days == null || days === "") return "—";
  const n = Number(days);
  return Number.isFinite(n) ? `${n} day${n === 1 ? "" : "s"}` : String(days);
};

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const normalizeRequest = (item = {}) => ({
  id: item.leaveRequestId ?? item.leaveId ?? item.id,
  type: item.leaveType ?? item.type ?? "Leave",
  startDate: item.startDate ?? item.fromDate ?? item.start,
  endDate: item.endDate ?? item.toDate ?? item.end,
  days: item.totalDays ?? item.days ?? null,
  reason: item.reason ?? "",
  status: String(item.status ?? "Status unavailable").trim().toLowerCase(),
  rejectionReason: item.rejectionReason ?? item.rejectReason ?? item.comments ?? "",
});

const emptyForm = { leaveType: LEAVE_TYPES[0], startDate: "", endDate: "", reason: "" };

export default function EmployeeLeaveRequests({ audience = "employee" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(Boolean(location.state?.openAdd));
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [sort, setSort] = useState({ key: "index", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [selected, setSelected] = useState(() => new Set());
  const [viewing, setViewing] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const fileRef = useRef(null);
  const requestController = useRef(null);
  const submitLock = useRef(false);

  const refresh = async () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await leaveRequestService.mine(undefined, controller.signal);
      if (controller.signal.aborted) return;
      setRequests((Array.isArray(rows) ? rows : []).map(normalizeRequest));
    } catch (error) {
      if (controller.signal.aborted) return;
      const status = error.response?.status;
      setLoadError({
        message: status === 403 ? "You do not have access to your leave history. Please contact HR."
          : getApiErrorMessage(error, "Unable to load your leave requests. Please try again."),
        retryable: ![401, 403].includes(status),
      });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) refresh(); });
    return () => { active = false; requestController.current?.abort(); };
  }, []);

  useEffect(() => {
    if (location.state?.openAdd) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = toDay(dateFrom);
    const to = toDay(dateTo);
    const rows = requests
      .map((row, index) => ({ ...row, index }))
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        if (query) {
          const haystack = [row.type, row.reason, row.status, dateLabel(row.startDate), dateLabel(row.endDate), row.id]
            .filter((value) => value != null)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        // Keep requests that overlap the chosen range.
        const start = toDay(row.startDate);
        const end = toDay(row.endDate) ?? start;
        if (from && end && end < from) return false;
        if (to && start && start > to) return false;
        return true;
      });
    const valueOf = (row) => {
      switch (sort.key) {
        case "type": return String(row.type).toLowerCase();
        case "date": return toDay(row.startDate)?.getTime() ?? 0;
        case "duration": return Number(row.days ?? spanDays(row.startDate, row.endDate) ?? 0);
        case "reason": return String(row.reason).toLowerCase();
        case "status": return row.status;
        default: return row.index;
      }
    };
    return [...rows].sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);
      const result = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === "asc" ? result : -result;
    });
  }, [requests, search, statusFilter, dateFrom, dateTo, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = Math.min(currentPage * pageSize, filtered.length);
  const rowKey = (row) => String(row.id ?? `row-${row.index}`);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(rowKey(row)));
  const filtersActive = Boolean(search || statusFilter !== "all" || dateFrom || dateTo);

  const toggleSort = (key) => setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));
  const toggleRow = (row) => setSelected((current) => {
    const next = new Set(current);
    const key = rowKey(row);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const togglePage = () => setSelected((current) => {
    const next = new Set(current);
    pageRows.forEach((row) => (allOnPageSelected ? next.delete(rowKey(row)) : next.add(rowKey(row))));
    return next;
  });
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };
  const showStatus = (status) => {
    setStatusFilter((current) => (current === status ? "all" : status));
    setPage(1);
  };
  const openNewRequest = (prefill) => {
    setSubmitError("");
    setForm(prefill ? { ...emptyForm, leaveType: LEAVE_TYPES.includes(prefill.type) ? prefill.type : LEAVE_TYPES[0], reason: prefill.reason || "" } : emptyForm);
    setAttachment(null);
    setFormOpen(true);
  };

  const pickAttachment = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ATTACHMENT_TYPES.includes(file.type)) { setSubmitError("Attachment must be a PDF, JPG or PNG file."); return; }
    if (file.size > ATTACHMENT_MAX_BYTES) { setSubmitError("Attachment must be 5 MB or smaller."); return; }
    setSubmitError("");
    setAttachment(file);
  };

  const goToRequest = (row) => {
    setViewing(null);
    const index = filtered.findIndex((item) => rowKey(item) === rowKey(row));
    if (index >= 0) setPage(Math.floor(index / pageSize) + 1);
    setHighlightId(rowKey(row));
    window.setTimeout(() => {
      document.querySelector(`[data-leave-row="${CSS.escape(rowKey(row))}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    window.setTimeout(() => setHighlightId(null), 2400);
  };

  useEffect(() => {
    if (menuFor == null) return undefined;
    const close = () => setMenuFor(null);
    const onKey = (event) => { if (event.key === "Escape") close(); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuFor]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLock.current) return;
    setSubmitError("");
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason.trim()) {
      setSubmitError("Please fill in leave type, dates and a reason.");
      return;
    }
    const today = localDateKey();
    if (form.startDate < today) {
      setSubmitError("Start date cannot be in the past.");
      return;
    }
    if (form.endDate < form.startDate) {
      setSubmitError("End date cannot be before the start date.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    try {
      await leaveRequestService.create({
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      });
      toast.success("Leave request submitted.");
      setConfirmation("Leave request submitted successfully. Track the HR decision in Request history below.");
      setFormOpen(false);
      setForm(emptyForm);
      setAttachment(null);
      await refresh();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to submit leave request. Please try again."));
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const loadingOrError = loading || Boolean(loadError);
  const statusCards = [
    { key: "pending", label: "Pending", description: "Requests awaiting approval", icon: Clock3, accent: "orange", value: stats.pending },
    { key: "approved", label: "Approved", description: "Requests approved by HR", icon: CheckCircle2, accent: "green", value: stats.approved },
    { key: "rejected", label: "Rejected", description: "Requests rejected by HR", icon: XCircle, accent: "red", value: stats.rejected },
  ];
  const sortHeader = (column, label, Icon) => (
    <button type="button" onClick={() => toggleSort(column)} className="inline-flex w-full items-center justify-between gap-2 uppercase" aria-label={`Sort by ${label === "#" ? "number" : label}`}>
      <span className="inline-flex items-center gap-2">{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{label}</span>
      <ArrowUpDown className={`h-3.5 w-3.5 ${sort.key === column ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
    </button>
  );

  return (
    <main className="leave-requests-page mx-auto w-full max-w-[1500px] space-y-2.5">
      <MentorBanner
        variant="leave"
        image={MENTOR_BANNERS.leave}
        leaves
        eyebrow={audience === "mentor" ? "Mentor Portal" : "Employee Portal"}
        title="My"
        highlight="Leave Requests"
        lead={<>Submit and manage <b>your leave requests easily.</b></>}
        subtitle={audience === "mentor"
          ? "Keep your teaching commitments organized and maintain a healthy work-life balance."
          : "Plan your time off and keep track of HR approvals in one place."}
        features={[
          { icon: CalendarDays, title: "Submit", text: "Leave Request", tone: "blue" },
          { icon: FileCheck2, title: "Track", text: "Approval Status", tone: "green" },
          { icon: BarChart3, title: "Manage", text: "Your Time Better", tone: "orange" },
        ]}
        script={["Take a break", "Do better tomorrow"]}
        actions={
          <button type="button" onClick={() => openNewRequest()} className="mentor-hero-btn mentor-hero-btn--primary">
            <CirclePlus aria-hidden="true" />
            New Leave Request
          </button>
        }
        aria-label={`${audience === "mentor" ? "Mentor" : "Employee"} leave management`}
      />

      {confirmation && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{confirmation}</p>}

      <section className="grid grid-cols-1 gap-2.5 md:grid-cols-3" aria-label="Leave request summary">
        {statusCards.map((card) => (
          <KPI
            key={card.key}
            accent={card.accent}
            icon={card.icon}
            label={card.label}
            value={loadingOrError ? "—" : card.value}
            description={card.description}
            loading={loading}
            size="compact"
            showArrow
            iconShape="circle"
            onClick={() => showStatus(card.key)}
            ariaLabel={`${card.label}: ${loadingOrError ? "unavailable" : card.value}. ${statusFilter === card.key ? "Showing only these — click to show all" : "Show only these requests"}`}
            className={statusFilter === card.key ? "ring-2 ring-[#F39924]/45" : ""}
          />
        ))}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-[#e6edf6] bg-white p-2 shadow-[0_4px_16px_rgba(15,42,74,.05)] lg:flex-row lg:items-center dark:border-slate-700 dark:bg-slate-900" role="search">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-slate-400 focus-within:border-[#F39924] focus-within:ring-2 focus-within:ring-[#F39924]/20 dark:border-slate-700 dark:bg-slate-800">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">Search leave requests</span>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search leave requests by type, reason or date..."
            className="h-full w-full !border-0 !bg-transparent !p-0 text-sm text-slate-900 !shadow-none !outline-none !ring-0 placeholder:text-slate-400 dark:text-white"
          />
        </label>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
          className="h-10 min-w-[170px] rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-sm font-semibold text-[#133b5d] outline-none focus:border-[#F39924] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateOpen((open) => !open)}
            aria-expanded={dateOpen}
            className="inline-flex h-10 w-full min-w-[200px] items-center gap-2.5 rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-left text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <CalendarDays className="h-4 w-4 text-[#133b5d] dark:text-slate-300" aria-hidden="true" />
            {dateFrom || dateTo ? `${dateFrom ? dateLabel(dateFrom) : "Any"} – ${dateTo ? dateLabel(dateTo) : "Any"}` : "Select Date Range"}
          </button>
          {dateOpen && (
            <div className="absolute right-0 z-30 mt-2 grid w-[280px] gap-3 rounded-xl border border-[#e6edf6] bg-white p-3.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <label className="grid gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">From
                <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">To
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <div className="flex justify-between gap-2">
                <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">Clear</button>
                <button type="button" onClick={() => setDateOpen(false)} className="rounded-lg bg-[#F39924] px-3 py-1.5 text-xs font-bold text-white">Apply</button>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!filtersActive}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-3.5 text-sm font-bold text-[#133b5d] transition hover:bg-[#f6f9fd] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Clear Filters
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={loading || loadError?.retryable === false}
          aria-label="Refresh leave requests"
          title="Refresh"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e6edf6] bg-white shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <div role="status" aria-label="Loading leave requests" className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : loadError ? (
          <div role="alert" className="p-5 text-sm text-rose-700">
            <p>{loadError.message}</p>
            {loadError.retryable && <button type="button" className="mt-3 rounded-lg border px-3 py-2 font-semibold" onClick={refresh}>Retry</button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto p-1.5">
              <table className="w-full min-w-[980px] border-separate border-spacing-x-1.5 text-left text-sm [--ui-space:0.6]">
                <thead>
                  <tr>
                    <th {...thVariant("purple")} className="w-12">
                      <input type="checkbox" aria-label="Select all requests on this page" checked={allOnPageSelected} onChange={togglePage} className="h-4 w-4 accent-[#F39924]" />
                    </th>
                    <th {...thVariant("purple")} className="w-16">{sortHeader("index", "#")}</th>
                    <th {...thVariant("blue")}>{sortHeader("type", "Leave Type", FileText)}</th>
                    <th {...thVariant("orange")}>{sortHeader("date", "Date Range", CalendarDays)}</th>
                    <th {...thVariant("green")}>{sortHeader("duration", "Duration", Clock3)}</th>
                    <th {...thVariant("blue")}>{sortHeader("reason", "Reason", MessageSquareText)}</th>
                    <th {...thVariant("purple")}>{sortHeader("status", "Status", CircleDot)}</th>
                    <th {...thVariant("purple")} className="w-32"><span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4" aria-hidden="true" />Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, position) => {
                    const type = typeStyle(row.type);
                    const TypeIcon = type.icon;
                    const status = STATUS_STYLE[row.status] ?? FALLBACK_STATUS;
                    const key = rowKey(row);
                    return (
                      <tr key={key} data-leave-row={key} className={`group transition-colors ${highlightId === key ? "bg-[#fff6ea]" : ""}`}>
                        <td className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <input type="checkbox" aria-label={`Select request ${row.id ?? position + 1}`} checked={selected.has(key)} onChange={() => toggleRow(row)} className="h-4 w-4 accent-[#F39924]" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">{firstShown + position}</td>
                        <td className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${type.className}`}><TypeIcon className="h-5 w-5" aria-hidden="true" /></span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-bold leading-tight text-[#0f2a4a] dark:text-white">{row.type}</p>
                              {row.id != null && <p className="text-[11px] leading-tight text-slate-500">Request #{row.id}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                            <CalendarDays className="h-4 w-4 text-[#2f6fe4]" aria-hidden="true" />
                            {dateLabel(row.startDate)} – {dateLabel(row.endDate)}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700 dark:border-slate-800 dark:text-slate-200">{durationLabel(row)}</td>
                        <td className="max-w-[260px] border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <p className="truncate text-slate-600 dark:text-slate-300" title={row.reason}>{row.reason || "—"}</p>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${status.pill}`}>
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                            {row.status}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <div className="relative flex items-center gap-2">
                            <button type="button" onClick={() => setViewing(row)} aria-label={`View request ${row.id ?? ""}`} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dfe7f1] bg-white text-[#133b5d] transition hover:border-[#F39924] hover:text-[#F39924] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="More actions"
                              aria-haspopup="menu"
                              aria-expanded={menuFor === key}
                              onClick={(event) => { event.stopPropagation(); setMenuFor((current) => (current === key ? null : key)); }}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-[#dfe7f1] bg-white text-[#133b5d] transition hover:bg-[#f6f9fd] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {menuFor === key && (
                              <div role="menu" onClick={(event) => event.stopPropagation()} className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-[#e6edf6] bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <button type="button" role="menuitem" onClick={() => { setViewing(row); setMenuFor(null); }} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  <Eye className="h-4 w-4" /> View details
                                </button>
                                <button type="button" role="menuitem" onClick={() => { openNewRequest(row); setMenuFor(null); }} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  <Copy className="h-4 w-4" /> Request similar leave
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!pageRows.length && (
                <div className="py-12 text-center text-sm text-slate-500">
                  <ClipboardList className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  {requests.length ? "No leave requests match your filters." : "No submitted leave requests yet. Use New Leave Request to send one to HR."}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <p>
                Showing {firstShown} to {lastShown} of {filtered.length} records
                {selected.size ? <span className="ml-2 font-semibold text-[#133b5d] dark:text-slate-200">· {selected.size} selected</span> : null}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: pageCount }, (_, index) => index + 1)
                  .filter((number) => pageCount <= 7 || Math.abs(number - currentPage) <= 2 || number === 1 || number === pageCount)
                  .map((number) => (
                    <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined} className={`grid h-9 min-w-9 place-items-center rounded-xl px-3 text-sm font-bold ${number === currentPage ? "bg-[#2f6fe4] text-white" : "border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{number}</button>
                  ))}
                <button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><ChevronRight className="h-4 w-4" /></button>
                <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-9 rounded-xl border border-[#dfe7f1] bg-white px-3 text-sm font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
                </select>
              </div>
            </div>
          </>
        )}
      </section>

      <KiniDialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        icon={CalendarDays}
        title={viewing ? `${viewing.type} leave` : "Leave request"}
        subtitle={
          <>
            {viewing?.id != null && <span className="block text-[15px] font-medium text-[#4b5f78]">Request #{viewing.id}</span>}
            <span className="mt-1.5 block">Here are the details of your submitted leave request.</span>
          </>
        }
        art={String(viewing?.type).toLowerCase() === "work from home" ? <WorkFromHomeArt /> : <LeaveArt />}
        artClassName="pointer-events-none absolute bottom-0 right-5 hidden h-[130px] w-[250px] sm:block"
        width={660}
        footer={
          <>
            <button type="button" onClick={() => setViewing(null)} className="h-12 min-w-[124px] rounded-xl border border-[#d7e1ec] bg-white px-6 text-[15px] font-bold text-[#0f2a4a] hover:bg-[#f6f9fd]">Close</button>
            <button type="button" onClick={() => goToRequest(viewing)} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#F39924] px-7 text-[15px] font-bold text-white shadow-[0_10px_20px_-10px_rgba(243,153,36,.9)] hover:bg-[#e2860f]"><Send className="h-4 w-4" />Go to Request</button>
          </>
        }
      >
        {viewing && (
          <div className="space-y-2.5">
            <KiniDetailRow icon={CalendarDays} label="Leave Type" tone="blue" aside={<span className="rounded-full bg-[#e8f1ff] px-3.5 py-1.5 text-sm font-bold text-[#2f6fe4]">{TYPE_BADGE[String(viewing.type).toLowerCase()] ?? "Leave"}</span>}>{viewing.type}</KiniDetailRow>
            <KiniDetailRow icon={CalendarDays} label="Dates" aside={<span className="rounded-full bg-[#e8f1ff] px-3.5 py-1.5 text-sm font-bold text-[#2f6fe4]">{durationLabel(viewing)}</span>}>{dateLabel(viewing.startDate)} – {dateLabel(viewing.endDate)}</KiniDetailRow>
            <KiniDetailRow icon={Clock3} label="Status">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold capitalize ring-1 ${(STATUS_STYLE[viewing.status] ?? FALLBACK_STATUS).pill}`}>
                <span className={`h-2 w-2 rounded-full ${(STATUS_STYLE[viewing.status] ?? FALLBACK_STATUS).dot}`} />{viewing.status}
              </span>
            </KiniDetailRow>
            <KiniDetailRow icon={FileText} label="Reason">
              <p className="break-words rounded-xl bg-[#f6f8fb] px-4 py-3 font-medium dark:bg-slate-800">{viewing.reason || "—"}</p>
            </KiniDetailRow>
            {viewing.rejectionReason && (
              <KiniDetailRow icon={MessageSquareText} label="HR response" tone="orange">
                <p className="break-words rounded-xl bg-[#f6f8fb] px-4 py-3 font-medium dark:bg-slate-800">{viewing.rejectionReason}</p>
              </KiniDetailRow>
            )}
          </div>
        )}
      </KiniDialog>

      <KiniDialog
        open={formOpen}
        onClose={() => { if (!submitting) setFormOpen(false); }}
        icon={CalendarCheck}
        title="New Leave Request"
        subtitle="Submit your leave request for approval. You can track its status in the request history."
        art={<LeaveArt />}
        width={780}
        className="leave-request-modal"
        footer={
          <>
            <button type="button" disabled={submitting} onClick={() => setFormOpen(false)} className="h-12 min-w-[124px] rounded-xl border border-[#d7e1ec] bg-white px-6 text-[15px] font-bold text-[#0f2a4a] hover:bg-[#f6f9fd] disabled:opacity-50">Cancel</button>
            <button type="submit" form="employee-leave-request-form" disabled={submitting} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#F39924] px-6 text-[15px] font-bold text-white shadow-[0_10px_20px_-10px_rgba(243,153,36,.9)] hover:bg-[#e2860f] disabled:cursor-not-allowed disabled:opacity-60">
              <Send className="h-4 w-4" />{submitting ? "Submitting…" : "Send to HR Review"}
            </button>
          </>
        }
      >
        <form id="employee-leave-request-form" onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#edf1f7] p-4 dark:border-slate-700">
          {submitError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{submitError}</p>}
          <fieldset disabled={submitting} className="space-y-3.5">
            <div>
              <label htmlFor="leave-type" className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><CircleDot className="h-4 w-4 text-[#2f6fe4]" />Leave Type <span className="text-rose-500">*</span></label>
              <div className="relative flex h-[46px] items-center rounded-xl border border-[#dfe7f1] bg-white focus-within:border-[#2f6fe4] focus-within:ring-2 focus-within:ring-[#2f6fe4]/15 dark:border-slate-700 dark:bg-slate-800">
                {(() => { const TypeIcon = typeStyle(form.leaveType).icon; return <span className="ml-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f1ebfe] text-[#7c4ddb]"><TypeIcon className="h-4.5 w-4.5" /></span>; })()}
                <select id="leave-type" value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))} className="h-full w-full appearance-none !border-0 !bg-transparent pl-3 pr-10 text-[15px] font-medium text-[#0f2a4a] !shadow-none !outline-none !ring-0 dark:text-white">
                  {LEAVE_TYPES.map((type) => <option key={type} value={type}>{leaveTypeLabel(type)}</option>)}
                </select>
                <ChevronRight className="pointer-events-none absolute right-4 h-4 w-4 rotate-90 text-[#133b5d]" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[["leave-start", "Start Date", "startDate"], ["leave-end", "End Date", "endDate"]].map(([id, label, key]) => (
                <div key={id}>
                  <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><CalendarDays className="h-4 w-4 text-[#2f6fe4]" />{label} <span className="text-rose-500">*</span></label>
                  <div className="flex h-[46px] items-center rounded-xl border border-[#dfe7f1] bg-white focus-within:border-[#2f6fe4] focus-within:ring-2 focus-within:ring-[#2f6fe4]/15 dark:border-slate-700 dark:bg-slate-800">
                    <span className="grid h-full w-12 shrink-0 place-items-center border-r border-[#e8eef5] text-[#133b5d] dark:border-slate-700 dark:text-slate-200"><CalendarDays className="h-4.5 w-4.5" /></span>
                    <input id={id} type="date" required value={form[key]} min={key === "startDate" ? localDateKey() : form.startDate || localDateKey()} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="h-full w-full !border-0 !bg-transparent px-3.5 text-[15px] font-medium text-[#0f2a4a] !shadow-none !outline-none !ring-0 dark:text-white" />
                  </div>
                </div>
              ))}
            </div>
            <div className="-mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[#5b6f88]">Leave will be calculated for selected dates.</p>
              {spanDays(form.startDate, form.endDate) != null && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#e8f1ff] px-3 py-1.5 text-sm font-bold text-[#2f6fe4]"><CalendarDays className="h-4 w-4" />{spanDays(form.startDate, form.endDate)} Day{spanDays(form.startDate, form.endDate) === 1 ? "" : "s"}</span>
              )}
            </div>
            <div>
              <label htmlFor="leave-reason" className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><NotebookPen className="h-4 w-4 text-[#133b5d]" />Reason <span className="text-rose-500">*</span></label>
              <div className="relative flex gap-3 rounded-xl border border-[#dfe7f1] bg-white p-2.5 focus-within:border-[#2f6fe4] focus-within:ring-2 focus-within:ring-[#2f6fe4]/15 dark:border-slate-700 dark:bg-slate-800">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eef3f9] text-[#133b5d]"><FileText className="h-4.5 w-4.5" /></span>
                <textarea id="leave-reason" required rows={3} maxLength={REASON_MAX} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for the leave request..." className="min-h-[72px] w-full resize-y !border-0 !bg-transparent !p-0 pt-2 text-[15px] text-[#0f2a4a] !shadow-none !outline-none !ring-0 placeholder:text-slate-400 dark:text-white" />
                <span className="absolute bottom-1.5 right-4 text-[11px] text-[#5b6f88]">{form.reason.length}/{REASON_MAX}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-[#d7e1ec] px-3.5 py-2.5 dark:border-slate-700">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1df] text-[#F39924]"><Paperclip className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#0f2a4a] dark:text-white">{attachment ? attachment.name : "Add Attachment (Optional)"}</p>
                <p className="text-sm text-[#5b6f88]">{attachment ? `${Math.max(1, Math.round(attachment.size / 1024))} KB · kept with this request form` : "Upload supporting documents (PDF, JPG, PNG, max 5MB)"}</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={pickAttachment} />
              {attachment ? (
                <button type="button" onClick={() => setAttachment(null)} className="h-10 rounded-xl border border-[#d7e1ec] bg-white px-4 text-sm font-bold text-[#0f2a4a]">Remove</button>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#bcd2f1] bg-white px-4.5 text-sm font-bold text-[#2f6fe4] hover:bg-[#f3f8ff]"><Upload className="h-4.5 w-4.5" />Upload File</button>
              )}
            </div>
          </fieldset>
        </form>
      </KiniDialog>
    </main>
  );
}
