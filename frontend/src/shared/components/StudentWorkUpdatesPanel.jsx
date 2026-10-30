import { useEffect, useState } from "react";
import { Activity, Clock3, HeartPulse, LifeBuoy } from "lucide-react";

const KEY = "kini:student-work-updates";
const readUpdates = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export default function StudentWorkUpdatesPanel({ compact = false, title = "Student Work Updates", subtitle = "Authorized view of daily activity, support and medical-leave requests" }) {
  const [updates, setUpdates] = useState(readUpdates);
  useEffect(() => {
    const refresh = () => setUpdates(readUpdates());
    window.addEventListener("storage", refresh);
    window.addEventListener("student-work-updated", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("student-work-updated", refresh); };
  }, []);
  const visible = updates.slice(0, compact ? 3 : 5);
  return (
    <section className={`rounded-2xl border border-slate-300/75 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${compact ? "p-3" : "p-3.5"}`}>
      <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Activity className="h-4 w-4 text-blue-600"/>{title}</h2><p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{updates.length} updates</span></div>
      {visible.length ? <div className={`${compact ? "mt-2" : "mt-3"} grid gap-2 lg:grid-cols-2`}>{visible.map((item)=><div key={item.id} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.type==="Medical Leave"?"bg-rose-50 text-rose-600":"bg-blue-50 text-blue-600"}`}>{item.type==="Medical Leave"?<HeartPulse className="h-4 w-4"/>:<LifeBuoy className="h-4 w-4"/>}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{item.type || item.action}</p><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">{item.status}</span></div><p className="mt-0.5 truncate text-[10px] text-slate-500">Student: {item.studentName || item.responsibleUserId} · Org: {item.organizationId}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400"><Clock3 className="h-3 w-3"/>{new Date(item.timestamp).toLocaleString()}</p></div></div>)}</div>:<div className={`${compact ? "mt-2 py-3" : "mt-3 py-5"} rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-700`}>No student work updates submitted yet.</div>}
    </section>
  );
}
