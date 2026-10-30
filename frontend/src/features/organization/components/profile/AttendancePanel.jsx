import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Clock3, Download, Eye, X, XCircle } from "lucide-react";
import { StatTile, StatusPill } from "./ProfileKit";

const dayKey = (value) => String(value ?? "").slice(0, 10);
const toInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fmtDate = (value) => {
  const parsed = new Date(`${dayKey(value)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "-" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed).replace("Sep ", "Sept ");
};
const fmtRange = (value) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
};
const fmtTime = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(parsed).toLowerCase();
};
const duration = (minutes) => (minutes == null ? "—" : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`);

/** Classifies one attendance row the same way the old table did. */
const classifyAttendance = (row) => {
  const status = String(row.status ?? "").toLowerCase();
  if (/half/.test(status)) return "Half Day";
  if (row.checkOut) return "Present";
  if (row.checkIn) return "Incomplete";
  if (/present|complete/.test(status)) return "Present";
  return row.status || "Absent";
};

/**
 * Employee attendance (Employee profile › Attendance): KPI tiles, date range,
 * CSV export, selectable rows with a details dialog, and pagination.
 * rows: [{ id, date, checkIn, checkOut, status }]; minutesOf(row) → number|null
 */
export default function AttendancePanel({ rows, minutesOf, fileName = "attendance" }) {
  const latest = useMemo(() => {
    const dates = rows.map((row) => dayKey(row.date)).filter(Boolean).sort();
    return dates.length ? new Date(`${dates[dates.length - 1]}T00:00:00`) : new Date();
  }, [rows]);
  const [from, setFrom] = useState(() => toInput(new Date(latest.getFullYear(), latest.getMonth(), 1)));
  const [to, setTo] = useState(() => toInput(new Date(latest.getFullYear(), latest.getMonth() + 1, 0)));
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => rows
    .filter((row) => { const key = dayKey(row.date); return (!from || key >= from) && (!to || key <= to); })
    .map((row, index) => ({ ...row, key: row.id ?? `${row.date}-${index}`, label: classifyAttendance(row), minutes: minutesOf(row) }))
    .sort((a, b) => dayKey(b.date).localeCompare(dayKey(a.date))), [rows, from, to, minutesOf]);

  const total = filtered.length;
  const present = filtered.filter((row) => row.label === "Present").length;
  const half = filtered.filter((row) => row.label === "Half Day").length;
  const absent = total - present - half;
  const pct = (value) => (total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%");
  const monthLabel = from ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(`${from}T00:00:00`)) : "";

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const allChecked = pageRows.length > 0 && pageRows.every((row) => selected.has(row.key));

  const toggle = (key) => setSelected((set) => { const next = new Set(set); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const toggleAll = () => setSelected((set) => { const next = new Set(set); pageRows.forEach((row) => (allChecked ? next.delete(row.key) : next.add(row.key))); return next; });

  const exportCsv = () => {
    const source = selected.size ? filtered.filter((row) => selected.has(row.key)) : filtered;
    const lines = [["Date", "Check In", "Check Out", "Working Hours", "Status"], ...source.map((row) => [fmtDate(row.date), fmtTime(row.checkIn), fmtTime(row.checkOut), duration(row.minutes), row.label])];
    const url = URL.createObjectURL(new Blob([lines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${fileName}-${from || "all"}-to-${to || "all"}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };
  const swap = () => { setFrom(to); setTo(from); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile size="sm" tone="blue" icon={CalendarDays} value={total} label="Total Days" badge={monthLabel} />
        <StatTile size="sm" tone="green" icon={CheckSquare} value={present} label="Present Days" badge={pct(present)} />
        <StatTile size="sm" tone="orange" icon={Clock3} value={half} label="Half Days" badge={pct(half)} />
        <StatTile size="sm" tone="red" icon={XCircle} value={absent} label="Absent / Incomplete" badge={pct(absent)} />
      </div>

      <section className="pk-panel">
        <header className="pk-panel__head flex-wrap">
          <span className="pk-panel__icon" aria-hidden="true"><CalendarDays /></span>
          <h3>Attendance Records</h3>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="pk-range">
              <CalendarDays aria-hidden="true" />
              <input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} aria-label="From date" />
              <span>-</span>
              <input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} aria-label="To date" />
              <button type="button" onClick={swap} aria-label="Swap dates" title={`${fmtRange(from)} - ${fmtRange(to)}`}>⇅</button>
            </div>
            <button type="button" className="pk-btn pk-btn--navy" onClick={exportCsv} disabled={!total}><Download /> Export</button>
          </div>
        </header>
        <div className="pk-panel__body">
          <div className="pk-table-wrap">
            <table className="pk-table">
              <thead>
                <tr>
                  <th className="w-12"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all rows on this page" disabled={!pageRows.length} /></th>
                  <th className="w-14">#</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row.key}>
                    <td><input type="checkbox" checked={selected.has(row.key)} onChange={() => toggle(row.key)} aria-label={`Select ${fmtDate(row.date)}`} /></td>
                    <td>{(current - 1) * pageSize + index + 1}</td>
                    <td className="font-bold">{fmtDate(row.date)}</td>
                    <td>{fmtTime(row.checkIn)}</td>
                    <td>{fmtTime(row.checkOut)}</td>
                    <td className="font-bold">{duration(row.minutes)}</td>
                    <td><StatusPill status={row.label} /></td>
                    <td><button type="button" className="pk-eye" onClick={() => setDetail(row)} aria-label={`View ${fmtDate(row.date)}`}><Eye /></button></td>
                  </tr>
                ))}
                {!pageRows.length && <tr><td colSpan="8" className="py-10 text-center text-slate-500">No attendance records in this date range.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="pk-pager">
            <p>{total ? `Showing ${(current - 1) * pageSize + 1} to ${Math.min(current * pageSize, total)} of ${total} records` : "Showing 0 records"}</p>
            <div className="pk-pager__nav">
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)}><ChevronLeft /></button>
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-current={number === current ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>)}
              <button type="button" aria-label="Next page" disabled={current >= pages} onClick={() => setPage(current + 1)}><ChevronRight /></button>
              <select className="pk-select !min-w-[110px]" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page">
                {[10, 25, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label="Attendance details" onClick={() => setDetail(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#0b1f3f] dark:text-white">{fmtDate(detail.date)}</h3>
              <button type="button" className="pk-icon-btn" onClick={() => setDetail(null)} aria-label="Close"><X /></button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[["Check In", fmtTime(detail.checkIn)], ["Check Out", fmtTime(detail.checkOut)], ["Working Hours", duration(detail.minutes)], ["Status", detail.label]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#f6f9fd] p-3 dark:bg-slate-800"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-bold text-[#0b1f3f] dark:text-white">{value}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

AttendancePanel.propTypes = { rows: PropTypes.array.isRequired, minutesOf: PropTypes.func.isRequired, fileName: PropTypes.string };
