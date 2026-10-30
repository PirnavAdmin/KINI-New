import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, LogIn, LogOut, X } from "lucide-react";
import { describeAttendanceError, formatDuration, formatTime, mentorAttendanceEvent, mentorWorkAttendance, workingMinutes } from "../services/mentorWorkAttendance";
import { ROUTES } from "@shared/constants/routeConstants";

export default function MentorAttendanceControl() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(() => mentorWorkAttendance.getToday());
  const dismissalKey = `kini-mentor-attendance-dismissed-${new Date().toISOString().slice(0, 10)}`;
  const [dismissed, setDismissed] = useState(() => window.localStorage.getItem(dismissalKey) === "true");
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    const refresh = () => setRecord(mentorWorkAttendance.getToday());
    mentorWorkAttendance.load().catch((error) => showToast(describeAttendanceError(error, mentorWorkAttendance.getIdentity(), "Unable to load attendance.")));
    window.addEventListener(mentorAttendanceEvent, refresh);
    return () => window.removeEventListener(mentorAttendanceEvent, refresh);
  }, []);

  useEffect(() => {
    const refreshFromServer = () => {
      if (document.visibilityState !== "visible") return;
      mentorWorkAttendance.load()
        .then(() => setRecord(mentorWorkAttendance.getToday()))
        .catch((error) => showToast(describeAttendanceError(error, mentorWorkAttendance.getIdentity(), "Unable to refresh attendance.")));
    };
    window.addEventListener("focus", refreshFromServer);
    document.addEventListener("visibilitychange", refreshFromServer);
    return () => {
      window.removeEventListener("focus", refreshFromServer);
      document.removeEventListener("visibilitychange", refreshFromServer);
    };
  }, []);

  useEffect(() => {
    if (!record?.checkIn || record?.checkOut) return undefined;
    const timer = setInterval(() => tick((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, [record]);

  const working = Boolean(record?.checkIn && !record?.checkOut);
  const complete = Boolean(record?.checkOut);
  const checkIn = async () => {
    setBusy(true);
    try {
      const next = await mentorWorkAttendance.checkIn();
      setRecord(next);
      showToast(`Checked in successfully at ${formatTime(next.checkIn)}`);
    } catch (error) { showToast(describeAttendanceError(error, mentorWorkAttendance.getIdentity(), "Unable to check in.")); }
    finally { setBusy(false); }
  };
  const checkOut = async () => {
    setBusy(true);
    try {
      const next = await mentorWorkAttendance.checkOut();
      setRecord(next);
      showToast(`Checked out successfully at ${formatTime(next.checkOut)}`);
      window.setTimeout(() => {
        window.localStorage.setItem(dismissalKey, "true");
        setDismissed(true);
      }, 3200);
    } catch (error) { showToast(describeAttendanceError(error, mentorWorkAttendance.getIdentity(), "Unable to check out.")); }
    finally { setBusy(false); }
    setConfirmCheckout(false);
  };

  const dismissCompleted = () => {
    window.localStorage.setItem(dismissalKey, "true");
    setDismissed(true);
  };

  if (complete && dismissed) return <>
    <button type="button" onClick={() => setShowSummary(true)} className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-900 dark:bg-slate-900" aria-label="View today's work attendance">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50"><CheckCircle2 className="h-4 w-4" /></span>
      <span><span className="block text-[10px] font-bold text-slate-900 dark:text-white">Attendance</span><span className="block text-[9px] font-semibold text-emerald-600">Completed today</span></span>
    </button>
    {showSummary && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && setShowSummary(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="attendance-summary-title" className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div><h2 id="attendance-summary-title" className="text-base font-bold text-slate-950 dark:text-white">Today&apos;s work attendance</h2><p className="mt-1 text-xs text-slate-500">Your attendance has been completed for today.</p></div></div>
          <button type="button" onClick={() => setShowSummary(false)} aria-label="Close attendance summary" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </header>
        <div className="grid grid-cols-3 gap-2 p-5">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Check in</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formatTime(record.checkIn)}</p></div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Check out</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formatTime(record.checkOut)}</p></div>
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40"><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Total</p><p className="mt-1 text-sm font-bold text-emerald-700">{formatDuration(workingMinutes(record))}</p></div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <button type="button" onClick={() => { setShowSummary(false); navigate(ROUTES.MENTOR.ATTENDANCE); }} className="rounded-lg border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300">View full attendance</button>
          <button type="button" onClick={() => setShowSummary(false)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Done</button>
        </footer>
      </section>
    </div>}
  </>;

  return <>
    <section aria-label="Work attendance" className={`relative flex min-h-[62px] min-w-[350px] items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${working || complete ? "border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-white dark:border-emerald-900/70" : "border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-white dark:border-slate-700"}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${working || complete ? "bg-emerald-500" : "bg-blue-600"}`} aria-hidden="true" />
      <span className={`ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${working || complete ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-blue-100 text-blue-700 ring-blue-200"}`}>
        {working ? <Clock3 className="h-5 w-5" /> : complete ? <CheckCircle2 className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-950 dark:text-slate-100">Work attendance</p>
          <span className={`h-1.5 w-1.5 rounded-full ${working ? "animate-pulse bg-emerald-500" : complete ? "bg-emerald-500" : "bg-amber-400"}`} />
        </div>
        <p className={`mt-1 text-[11px] font-semibold ${working || complete ? "text-emerald-700" : "text-slate-500"}`}>
          {working ? `Checked in · ${formatTime(record.checkIn)}` : complete ? `${formatTime(record.checkIn)} – ${formatTime(record.checkOut)}` : "You have not checked in today"}
        </p>
        {(working || complete) && <p className="mt-0.5 text-[10px] font-medium text-slate-500">{working ? "Working" : "Total"} · {formatDuration(workingMinutes(record))}</p>}
      </div>
      {!complete && <button type="button" disabled={busy} onClick={working ? () => setConfirmCheckout(true) : checkIn} className={`min-w-[88px] rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${working ? "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"}`}>{busy ? "Saving…" : working ? "Check out" : "Check in"}</button>}
      {complete && <><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">Completed</span><button type="button" onClick={dismissCompleted} aria-label="Dismiss completed attendance" title="Dismiss" className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button></>}
    </section>

    {confirmCheckout && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && setConfirmCheckout(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between"><div><h2 id="checkout-title" className="text-lg font-bold text-slate-950 dark:text-white">Check out for today?</h2><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date())}</p></div><button type="button" onClick={() => setConfirmCheckout(false)} aria-label="Close checkout confirmation" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button></div>
        <div className="my-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><p className="text-xs text-slate-500">Your working time so far</p><p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatDuration(workingMinutes(record))}</p><p className="mt-1 text-xs text-slate-500">Checked in at {formatTime(record?.checkIn)}</p></div>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirmCheckout(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold dark:border-slate-600">Cancel</button><button type="button" disabled={busy} onClick={checkOut} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"><LogOut className="h-4 w-4" />{busy ? "Saving…" : "Confirm check out"}</button></div>
      </section>
    </div>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">{toast}</div>}
  </>;
}
