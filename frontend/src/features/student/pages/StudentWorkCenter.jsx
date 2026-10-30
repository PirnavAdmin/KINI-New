import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CalendarCheck, CheckCircle2, ClipboardList, FileText, HeartPulse, LifeBuoy, LockKeyhole, MessageSquareText, Route, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";

const DAILY_TASKS = [
  ["schedule", "Check today's schedule", "/student/my-classes"],
  ["class", "Attend class", "/student/my-classes"],
  ["notes", "Review notes and lessons", "/student/courses"],
  ["assignment", "Complete pending assignment", "/student/courses"],
  ["announcement", "Check announcements", "/student/notifications"],
  ["question", "Ask a course question", "/student/mentor-chat"],
  ["progress", "Review learning progress", "/student/learning-paths"],
];

const LIFECYCLE = ["Registered", "Verified", "Approved", "Course assigned", "Batch assigned", "Mentor assigned", "Learning", "Assessment", "Progress review", "Certificate eligible", "Placement eligible", "Completed"];

const accessCards = [
  [CalendarCheck, "Attendance", "View-only attendance recorded from assigned classes", "/student/my-classes"],
  [ClipboardList, "Assignments", "Submit work from your enrolled course workspace", "/student/courses"],
  [FileText, "Assessments", "Write assigned tests and review results", "/student/assessments"],
  [MessageSquareText, "Marks & feedback", "Review mentor feedback; marks cannot be edited", "/student/assessments"],
];

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export default function StudentWorkCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = String(user?.userId || user?.id || user?.email || "demo-student");
  const organizationId = String(user?.organizationId || user?.orgId || "demo-organization");
  const prefix = `kini:student-work:${organizationId}:${userId}`;
  const [completed, setCompleted] = useState(() => read(`${prefix}:daily`, []));
  const [support, setSupport] = useState({ category: "Course question", subject: "", description: "" });
  const [leave, setLeave] = useState({ from: "", to: "", reason: "", documentName: "" });
  const [requests, setRequests] = useState(() => read(`${prefix}:requests`, []));
  const progress = Math.round((completed.length / DAILY_TASKS.length) * 100);
  const currentLifecycle = 6;

  const audit = (action, target, status) => {
    const key = `${prefix}:audit`;
    const entry = { id: crypto.randomUUID(), organizationId, responsibleUserId: userId, action, target, status, timestamp: new Date().toISOString(), approvalStatus: "Pending review" };
    localStorage.setItem(key, JSON.stringify([entry, ...read(key, [])].slice(0, 100)));
    const globalKey = "kini:student-work-updates";
    const sharedEntry = { ...entry, studentName: user?.name || user?.fullName || user?.email || "Student" };
    localStorage.setItem(globalKey, JSON.stringify([sharedEntry, ...read(globalKey, [])].slice(0, 250)));
    window.dispatchEvent(new Event("student-work-updated"));
    return entry;
  };

  const toggleTask = (id) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next); localStorage.setItem(`${prefix}:daily`, JSON.stringify(next));
    audit("DAILY_TASK_STATUS_UPDATED", id, next.includes(id) ? "Completed" : "Pending");
  };

  const submitRequest = (type, payload, reset) => {
    if (type === "Support" && (!payload.subject.trim() || !payload.description.trim())) return toast.error("Subject and description are required.");
    if (type === "Medical Leave" && (!payload.from || !payload.to || !payload.reason.trim())) return toast.error("Dates and medical reason are required.");
    const item = { ...audit(type === "Support" ? "SUPPORT_REQUEST_RAISED" : "MEDICAL_LEAVE_REQUESTED", type, "Submitted"), type, ...payload };
    const next = [item, ...requests]; setRequests(next); localStorage.setItem(`${prefix}:requests`, JSON.stringify(next)); reset();
    toast.success(`${type} request submitted for institute review.`);
  };

  const summary = useMemo(() => ({ pending: DAILY_TASKS.length - completed.length, requests: requests.length }), [completed, requests]);

  return (
    <div className="w-full min-w-0 space-y-3 overflow-x-hidden">
      <header data-ui="dashboard-hero" className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white shadow-lg shadow-blue-500/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-100">PDF-aligned student workspace</p><h1 className="mt-1 text-2xl font-extrabold">My Work Center</h1><p className="mt-1 text-sm text-blue-50">Daily learning, requests, eligibility and lifecycle in one protected workspace.</p></div>
        <div className="grid w-full min-w-0 grid-cols-3 gap-2 text-center lg:w-auto">{[[`${progress}%`, "Daily"], [summary.pending, "Pending"], [summary.requests, "Requests"]].map(([value,label])=><div key={label} className="min-w-0 rounded-xl bg-white/15 px-2 py-2 backdrop-blur sm:px-3"><p className="text-lg font-black">{value}</p><p className="truncate text-[10px] font-bold uppercase">{label}</p></div>)}</div>
      </header>

      <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="h-5 w-5 text-blue-600"/>Today's work</h2><span className="text-xs font-bold text-slate-400">{completed.length}/{DAILY_TASKS.length}</span></div>
          <div className="grid gap-2 sm:grid-cols-2">{DAILY_TASKS.map(([id,label,path])=><div key={id} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"><button type="button" onClick={()=>toggleTask(id)} className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${completed.includes(id)?"bg-emerald-500 text-white":"bg-slate-100 text-slate-400 dark:bg-slate-800"}`} aria-label={`Mark ${label}`}><CheckCircle2 className="h-4 w-4"/></button><button type="button" onClick={()=>navigate(path)} className={`min-w-0 flex-1 text-left text-xs font-bold ${completed.includes(id)?"text-slate-400 line-through":"text-slate-700 dark:text-slate-200"}`}>{label}</button></div>)}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 flex items-center gap-2 font-extrabold"><Route className="h-5 w-5 text-teal-500"/>Student lifecycle</h2>
          <div className="flex flex-wrap gap-1.5">{LIFECYCLE.map((step,index)=><span key={step} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${index<currentLifecycle?"bg-emerald-50 text-emerald-700":index===currentLifecycle?"bg-blue-600 text-white":"bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>{index+1}. {step}</span>)}</div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200"><ShieldCheck className="h-4 w-4 shrink-0"/><p>Current status: <b>Learning</b>. Certificates and job opportunities are available when released by your organization.</p></div>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{accessCards.map(([Icon,title,text,path])=><button key={title} type="button" onClick={()=>navigate(path)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900"><Icon className="h-5 w-5 text-blue-600"/><h3 className="mt-2 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></button>)}</section>

      <section className="grid gap-3 xl:grid-cols-2">
        <form onSubmit={(e)=>{e.preventDefault();submitRequest("Support",support,()=>setSupport({category:"Course question",subject:"",description:""}))}} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 font-extrabold"><LifeBuoy className="h-5 w-5 text-blue-600"/>Raise support request</h2><div className="mt-3 grid gap-2 sm:grid-cols-2"><select value={support.category} onChange={e=>setSupport({...support,category:e.target.value})} className="rounded-xl border p-2.5 text-sm dark:bg-slate-800"><option>Course question</option><option>Technical issue</option><option>Attendance query</option><option>Marks or feedback query</option></select><input value={support.subject} onChange={e=>setSupport({...support,subject:e.target.value})} placeholder="Subject" className="rounded-xl border p-2.5 text-sm dark:bg-slate-800"/></div><textarea value={support.description} onChange={e=>setSupport({...support,description:e.target.value})} placeholder="Explain your issue clearly" rows="2" className="mt-2 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-800"/><button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"><Send className="h-3.5 w-3.5"/>Submit request</button>
        </form>
        <form onSubmit={(e)=>{e.preventDefault();submitRequest("Medical Leave",leave,()=>setLeave({from:"",to:"",reason:"",documentName:""}))}} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 font-extrabold"><HeartPulse className="h-5 w-5 text-rose-500"/>Medical leave & return</h2><div className="mt-3 grid grid-cols-2 gap-2"><input type="date" aria-label="Leave from" value={leave.from} onChange={e=>setLeave({...leave,from:e.target.value})} className="rounded-xl border p-2.5 text-sm dark:bg-slate-800"/><input type="date" aria-label="Leave to" value={leave.to} onChange={e=>setLeave({...leave,to:e.target.value})} className="rounded-xl border p-2.5 text-sm dark:bg-slate-800"/></div><input value={leave.reason} onChange={e=>setLeave({...leave,reason:e.target.value})} placeholder="Medical reason / return support needed" className="mt-2 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-800"/><input value={leave.documentName} onChange={e=>setLeave({...leave,documentName:e.target.value})} placeholder="Document reference (optional)" className="mt-2 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-800"/><button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white"><Send className="h-3.5 w-3.5"/>Request review</button>
        </form>
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900"><LockKeyhole className="h-4 w-4 shrink-0 text-slate-600"/><p><b>Student restrictions enforced:</b> You can only access your own enrolled content. Attendance, marks, certificates, trainer and batch changes remain read-only and require authorized institute approval.</p></div>
    </div>
  );
}
