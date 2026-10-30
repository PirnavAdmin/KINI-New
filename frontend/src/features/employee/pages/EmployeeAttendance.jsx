import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  LogIn,
  LogOut,
  PenSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import employeeAttendanceService from "@shared/services/employeeAttendanceService";
import { formatWorkDuration, formatWorkTime } from "@shared/services/employeeWorkAttendance";
import { getApiErrorMessage } from "@shared/services/apiServices";
import Modal from "@shared/components/Modal";
import KPI from "@/components/common/KPI";

const emptyCorrectionForm = () => ({ employeeAttendanceId: "", requestedCheckIn: "", requestedCheckOut: "", reason: "" });

// The backend's AttendanceCorrectionRequestDto expects full ISO date-times, not
// bare times, so the entered clock time is combined with the selected record's date.
const toIsoDateTime = (dateKeyValue, timeValue) => {
  if (!dateKeyValue || !timeValue) return null;
  const iso = new Date(`${dateKeyValue}T${timeValue}:00`);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
};

const dayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeRecord = (record = {}) => ({
  ...record,
  id: record.attendanceId ?? record.id ?? record.employeeAttendanceId,
  date: String(record.attendanceDate ?? record.date ?? record.dateKey ?? "").slice(0, 10),
  checkIn: record.checkInTime ?? record.checkIn ?? record.checkInAt ?? null,
  checkOut: record.checkOutTime ?? record.checkOut ?? record.checkOutAt ?? null,
  // A check-in without a checkout is an incomplete record. Keep the live
  // check-in state separate (it still drives the Check out action below), so
  // a stale/optimistic API status cannot present an unfinished day as Present
  // or Working in the attendance history.
  status: (() => {
    const checkIn = record.checkInTime ?? record.checkIn ?? record.checkInAt ?? null;
    const checkOut = record.checkOutTime ?? record.checkOut ?? record.checkOutAt ?? null;
    const supplied = String(record.status ?? "").trim();
    if (supplied && supplied.toLowerCase() !== "working" && checkOut) return supplied;
    if (checkOut) return supplied || "Present";
    if (checkIn) return supplied.toLowerCase() === "working" || !supplied ? "Incomplete" : supplied;
    return supplied || "Absent";
  })(),
});

const listFromResponse = (value) => {
  if (Array.isArray(value)) return value;
  return [value?.content, value?.items, value?.records, value?.results, value?.data]
    .find(Array.isArray) || [];
};

const dateLabel = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

export default function EmployeeAttendance() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [, tick] = useState(0);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState(emptyCorrectionForm);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const refresh = async () => {
    // GET /api/EmployeeAttendance/my and /my/report resolve the employee
    // from the bearer token — this page only ever shows the signed-in
    // employee's own attendance, so it uses the self-scoped endpoints
    // rather than the explicit-employeeId ones (which take an employeeId
    // query param intended for admin/HR looking up another employee).
    const [currentResponse, reportResponse] = await Promise.allSettled([
      employeeAttendanceService.my(),
      employeeAttendanceService.myReport(),
    ]);
    if (currentResponse.status === "rejected" && reportResponse.status === "rejected") {
      throw currentResponse.reason;
    }
    const currentResult = currentResponse.status === "fulfilled" ? currentResponse.value : [];
    const reportResult = reportResponse.status === "fulfilled" ? reportResponse.value : [];
    const currentRows = listFromResponse(currentResult);
    const reportRows = listFromResponse(reportResult);
    const rows = (reportRows.length ? reportRows : currentRows)
      .map(normalizeRecord)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    setHistory(rows);
    setToday(rows.find((row) => row.date === dayKey()) || null);
  };
  const loadAttendance = () => {
    setLoadError("");
    return refresh().catch((error) => {
      // Today's check-in/out state could not be confirmed — leave the check
      // in/out action disabled rather than guessing, so the user never posts
      // a check-in against unknown server state.
      const message = error?.response?.status === 403
        ? "Your account is not authorized to view attendance. Ask the administrator to enable EmployeeAttendance access."
        : getApiErrorMessage(error, "Unable to load attendance.");
      setLoadError(message);
      toast.error(message);
    });
  };
  useEffect(() => {
    loadAttendance().finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!today?.checkIn || today?.checkOut) return undefined;
    const timer = setInterval(() => tick((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, [today]);
  const working = Boolean(today?.checkIn && !today?.checkOut);
  const completed = Boolean(today?.checkOut);
  const stats = useMemo(
    () => ({
      present: history.filter((r) => r.status === "Present").length,
      working: history.filter((r) => r.status === "Working").length,
      hours:
        history.reduce(
          (sum, r) =>
            sum +
            Math.max(
              0,
              new Date(r.checkOut || Date.now()) - new Date(r.checkIn),
            ),
          0,
        ) / 3600000,
    }),
    [history],
  );
  const action = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = working
        ? await employeeAttendanceService.checkOut()
        : await employeeAttendanceService.checkIn();
      const record = normalizeRecord(saved);
      setLoadError("");
      await refresh();
      toast.success(
        working
          ? `Checked out at ${formatWorkTime(record.checkOut)}`
          : `Checked in at ${formatWorkTime(record.checkIn)}`,
      );
    } catch (error) {
      const message = error?.response?.status === 403
        ? "Your account is not authorized to record attendance. Ask the administrator to enable EmployeeAttendance access."
        : getApiErrorMessage(error, "Unable to update attendance.");
      toast.error(message, { id: "employee-attendance-error", duration: 5000 });
    } finally {
      setBusy(false);
    }
  };
  const submitCorrection = async (event) => {
    event.preventDefault();
    if (correctionSubmitting) return;
    if (!correctionForm.employeeAttendanceId || !correctionForm.reason.trim()) {
      toast.error("Please select the attendance record and provide a reason.");
      return;
    }
    if (!correctionForm.requestedCheckIn && !correctionForm.requestedCheckOut) {
      toast.error("Please provide a corrected check-in and/or check-out time.");
      return;
    }
    const record = history.find((row) => String(row.id) === String(correctionForm.employeeAttendanceId));
    setCorrectionSubmitting(true);
    try {
      await employeeAttendanceService.correctionRequest({
        employeeAttendanceId: Number(correctionForm.employeeAttendanceId),
        requestedCheckIn: toIsoDateTime(record?.date, correctionForm.requestedCheckIn),
        requestedCheckOut: toIsoDateTime(record?.date, correctionForm.requestedCheckOut),
        reason: correctionForm.reason.trim(),
      });
      toast.success("Correction request submitted.");
      setCorrectionOpen(false);
      setCorrectionForm(emptyCorrectionForm());
      await refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to submit correction request."));
    } finally {
      setCorrectionSubmitting(false);
    }
  };
  if (loading) return <main className="mx-auto w-full max-w-[1500px]"><div className="h-40 animate-pulse rounded-2xl bg-slate-100" /></main>;
  const download = () => {
    const csv = [
      "Date,Check In,Check Out,Working Hours,Status",
      ...history.map((r) =>
        [
          r.date,
          formatWorkTime(r.checkIn),
          formatWorkTime(r.checkOut),
          formatWorkDuration(r),
          r.status,
        ].join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "my-attendance.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-blue-600">
            Employee · Workforce
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            My Attendance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your check-in and check-out are visible to your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!history.length}
            onClick={() => setCorrectionOpen(true)}
            title={history.length ? undefined : "No attendance records yet"}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900"
          >
            <PenSquare className="h-4 w-4" />
            Request Correction
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold shadow-sm dark:bg-slate-900"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </header>
      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={loadAttendance}
            className="inline-flex h-8 shrink-0 items-center rounded-lg border border-rose-200 bg-white px-3 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:bg-slate-900 dark:text-rose-200 dark:hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-white to-blue-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-12 w-12 place-items-center rounded-2xl ${working || completed ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}
            >
              {working ? <Clock3 /> : completed ? <CheckCircle2 /> : <LogIn />}
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Today’s work attendance
              </p>
              <h2 className="mt-1 text-lg font-black">
                {working
                  ? "Currently working"
                  : completed
                    ? "Attendance completed"
                    : "Ready to check in"}
              </h2>
              {today && (
                <p className="mt-1 text-xs text-slate-500">
                  {formatWorkTime(today.checkIn)} –{" "}
                  {formatWorkTime(today.checkOut)} · {formatWorkDuration(today)}
                </p>
              )}
            </div>
          </div>
          {!completed && (
            <button
              disabled={busy || Boolean(loadError)}
              title={loadError ? "Today's attendance state could not be confirmed" : undefined}
              onClick={action}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${working ? "bg-slate-800" : "bg-blue-600"}`}
            >
              {working ? (
                <LogOut className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy ? "Saving…" : working ? "Check out" : "Check in"}
            </button>
          )}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat label="Present days" value={stats.present} icon={CheckCircle2} accent="green" />
        <Stat label="In progress" value={stats.working} icon={LogIn} accent="blue" />
        <Stat label="Recorded hours" value={`${stats.hours.toFixed(1)}h`} icon={Clock3} accent="orange" />
      </section>
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b px-4 py-3">
          <h2 className="font-extrabold">Attendance history</h2>
          <p className="text-xs text-slate-500">
            Organization-scoped work attendance records
          </p>
        </div>
        {history.length ? (
          <div className="overflow-x-auto">
          <div className="divide-y min-w-[640px]">
            {history.map((row) => (
              <article
                key={row.id}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="font-bold">{dateLabel(row.date)}</span>
                <span>{formatWorkTime(row.checkIn)}</span>
                <span>{formatWorkTime(row.checkOut)}</span>
                <span>{formatWorkDuration(row)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row.status === "Present" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                >
                  {row.status}
                </span>
              </article>
            ))}
          </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">
            <CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            No attendance recorded yet.
          </div>
        )}
      </section>
      <Modal
        open={correctionOpen}
        onClose={() => { if (!correctionSubmitting) setCorrectionOpen(false); }}
        title="Request Attendance Correction"
        description="Ask your organization to review and correct a check-in/out record."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={correctionSubmitting}
              onClick={() => setCorrectionOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="attendance-correction-form"
              disabled={correctionSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {correctionSubmitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        }
      >
        <form id="attendance-correction-form" onSubmit={submitCorrection} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Attendance record</label>
            <select
              required
              value={correctionForm.employeeAttendanceId}
              onChange={(e) => setCorrectionForm((f) => ({ ...f, employeeAttendanceId: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="" disabled>Select a date to correct</option>
              {history.map((row) => (
                <option key={row.id} value={row.id}>
                  {dateLabel(row.date)} · {formatWorkTime(row.checkIn)} – {formatWorkTime(row.checkOut)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Correct check-in</label>
              <input
                type="time"
                value={correctionForm.requestedCheckIn}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, requestedCheckIn: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Correct check-out</label>
              <input
                type="time"
                value={correctionForm.requestedCheckOut}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, requestedCheckOut: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Reason</label>
            <textarea
              required
              rows={3}
              value={correctionForm.reason}
              onChange={(e) => setCorrectionForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Explain why this record needs correction"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </form>
      </Modal>
    </main>
  );
}
// Summary cards use the global KPI card (same design in every portal).
function Stat({ label, value, icon, accent }) {
  return <KPI label={label} value={value} icon={icon} accent={accent} />;
}
