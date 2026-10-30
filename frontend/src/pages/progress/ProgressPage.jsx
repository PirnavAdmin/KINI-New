import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MessageCircle,
  Search,
  Sparkles,
  Target,
  Users,
  UserX,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
const people = [
  {
    id: 1,
    name: "Pooja Singh",
    batch: "React Morning",
    course: "Full Stack Dev",
    completion: 35,
    attendance: 42,
    assign: "8/15",
    quiz: 48,
    last: "8 days ago",
    risk: "At Risk",
    reason: "Attendance below 60% for 2 consecutive weeks",
  },
  {
    id: 2,
    name: "Arjun Kumar",
    batch: "Node.js Afternoon",
    course: "Full Stack Dev",
    completion: 48,
    attendance: 55,
    assign: "10/15",
    quiz: 55,
    last: "5 days ago",
    risk: "At Risk",
    reason: "Low attendance and incomplete assignments",
  },
  {
    id: 3,
    name: "Meera Nair",
    batch: "React Advanced",
    course: "React Advanced",
    completion: 52,
    attendance: 48,
    assign: "11/15",
    quiz: 60,
    last: "3 days ago",
    risk: "At Risk",
    reason: "Attendance below 60% for 2 consecutive weeks",
  },
  {
    id: 4,
    name: "Anjali Sharma",
    batch: "React Morning",
    course: "Full Stack Dev",
    completion: 78,
    attendance: 86,
    assign: "14/15",
    quiz: 84,
    last: "Today",
    risk: "On Track",
  },
  {
    id: 5,
    name: "Kiran Mehta",
    batch: "Node.js Afternoon",
    course: "Full Stack Dev",
    completion: 64,
    attendance: 70,
    assign: "11/15",
    quiz: 68,
    last: "Yesterday",
    risk: "At Risk",
    reason: "Attendance and course progress require mentor follow-up",
  },
  {
    id: 6,
    name: "Rohan Verma",
    batch: "React Advanced",
    course: "React Advanced",
    completion: 22,
    attendance: 64,
    assign: "4/15",
    quiz: 44,
    last: "14 days ago",
    risk: "Inactive",
  },
  {
    id: 7,
    name: "Vikram Patel",
    batch: "React Morning",
    course: "Full Stack Dev",
    completion: 72,
    attendance: 79,
    assign: "13/15",
    quiz: 76,
    last: "Today",
    risk: "On Track",
  },
];
const riskOrder = {
  "At Risk": 0,
  Inactive: 1,
  "On Track": 2,
};
const bar = (value, color = "bg-blue-600") => (
  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
    <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
  </div>
);
export default function ProgressPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRisk = searchParams.get("risk");
  const initialRisk = ["On Track", "At Risk", "Inactive"].includes(requestedRisk) ? requestedRisk : "All";
  const [filter, setFilter] = useState({
      batch: "All",
      risk: initialRisk,
      course: "All",
      search: "",
    }),
    [detail, setDetail] = useState(null),
    [update, setUpdate] = useState(null),
    [notes, setNotes] = useState("");
  const rows = useMemo(
    () =>
      people
        .filter(
          (p) =>
            (filter.batch === "All" || p.batch === filter.batch) &&
            (filter.risk === "All" || p.risk === filter.risk) &&
            (filter.course === "All" || p.course === filter.course) &&
            p.name.toLowerCase().includes(filter.search.toLowerCase()),
        )
        .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]),
    [filter],
  );
  const set = (k, v) => setFilter((x) => ({ ...x, [k]: v }));
  return (
    <div className="mentor-progress-page mx-auto max-w-[1500px] space-y-2.5 px-2 pb-3 pt-0 sm:px-3">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/70 to-cyan-50 px-4 py-3 shadow-[0_10px_30px_rgba(15,85,247,0.08)] dark:border-slate-700 dark:from-slate-900 dark:via-blue-950/30 dark:to-cyan-950/20">
        <h1 className="text-xl font-bold sm:text-2xl">Student Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Progress for students assigned to your batches only.
        </p>
      </section>
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["Total Students", 62, Users, "#2563eb"],
          ["On Track", 42, Target, "#10b981"],
          ["At Risk", 6, AlertTriangle, "#ef4444"],
          ["Inactive", 1, UserX, "#64748b"],
          ["Completed", 1, CheckCircle2, "#06b6a8"],
        ].map(([x, y, Icon, color]) => (
          <button
            key={x}
            onClick={() =>
              x !== "Total Students" &&
              set("risk", x === "Completed" ? "All" : x)
            }
            className="group relative min-h-[68px] overflow-hidden rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
          >
            <span
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: color }}
            />
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}12`, color }}
              >
                <Icon size={16} />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase leading-3 tracking-[0.08em] text-slate-500">
                  {x}
                </p>
                <p
                  className="mt-0.5 text-lg font-extrabold leading-none"
                  style={{ color }}
                >
                  {y}
                </p>
              </div>
            </div>
          </button>
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              value={filter.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="Search students by name..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          {[
            [
              "batch",
              ["All", "React Morning", "Node.js Afternoon", "React Advanced"],
            ],
            [
              "risk",
              ["All", "On Track", "At Risk", "Inactive"],
            ],
            ["course", ["All", "Full Stack Dev", "React Advanced"]],
          ].map(([key, options]) => (
            <select
              key={key}
              value={filter[key]}
              onChange={(e) => set(key, e.target.value)}
              className="rounded-xl border px-3 py-2.5 dark:bg-slate-800"
            >
              {options.map((x) => (
                <option key={x} value={x}>
                  {x === "All"
                    ? `All ${key === "batch" ? "batches" : key === "risk" ? "risk levels" : "courses"}`
                    : x}
                </option>
              ))}
            </select>
          ))}
        </div>
        <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[1230px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[155px]" /><col className="w-[145px]" /><col className="w-[170px]" />
              <col className="w-[105px]" /><col className="w-[120px]" /><col className="w-[90px]" />
              <col className="w-[110px]" /><col className="w-[125px]" /><col className="w-[210px]" />
            </colgroup>
            <thead className="border-y border-slate-200 bg-slate-50/90 text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                {['Student', 'Batch', 'Course completion', 'Attendance', 'Assignments', 'Quiz avg', 'Last active', 'Risk', 'Actions'].map((label) => <th key={label} className="whitespace-nowrap px-3 py-3 font-bold">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const attend =
                  p.attendance > 75
                    ? "text-emerald-600"
                    : p.attendance >= 60
                      ? "text-amber-600"
                      : "text-rose-600";
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    onClick={() => setDetail(p)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setDetail(p);
                      }
                    }}
                    className={`cursor-pointer border-t transition hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${p.risk === "At Risk" ? "bg-rose-50/50" : ""}`}
                  >
                    <td className="px-3 py-3 font-bold text-blue-700 hover:underline">
                      {p.name}
                    </td>
                    <td className="px-3 py-3">{p.batch}</td>
                    <td className="px-3 py-3">
                      <b>{p.completion}%</b>
                      {bar(p.completion)}
                    </td>
                    <td className={`px-3 py-3 ${attend}`}>
                      <b>{p.attendance}%</b>
                    </td>
                    <td className="px-3 py-3">
                      {p.assign}
                      {bar(
                        (+p.assign.split("/")[0] / 15) * 100,
                        "bg-violet-500",
                      )}
                    </td>
                    <td className="px-3 py-3">{p.quiz}%</td>
                    <td className="px-3 py-3">{p.last}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${p.risk === "At Risk" ? "bg-rose-100 text-rose-700" : p.risk === "On Track" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {p.risk}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setDetail(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          <Eye size={13} /> Details
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate('/mentor/messages', { state: { recipient: { id: p.id, name: p.name, course: p.course, avatar: p.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() } } });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          <MessageCircle size={13} /> Chat
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setUpdate(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-violet-600 hover:bg-violet-50"
                        >
                          <Sparkles size={13} /> Note
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {detail && (
        <Intervention person={detail} onClose={() => setDetail(null)} />
      )}{" "}
      {update && (
        <Update
          person={update}
          notes={notes}
          setNotes={setNotes}
          onClose={() => setUpdate(null)}
        />
      )}
    </div>
  );
}
function Intervention({ person, onClose }) {
  const [notes, setNotes] = useState("");
  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35"
      onMouseDown={onClose}
    >
      <aside
        onMouseDown={(e) => e.stopPropagation()}
        className="h-full w-full max-w-[560px] overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <button onClick={onClose} className="float-right">
          <X />
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Student Progress Profile
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20">
            {person.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div>
            <h2 className="text-2xl font-bold">{person.name}</h2>
            <p className="text-sm text-slate-500">
              {person.batch} · {person.course}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            ["Course completion", `${person.completion}%`],
            ["Attendance", `${person.attendance}%`],
            ["Assignments", person.assign],
            ["Quiz average", `${person.quiz}%`],
            ["Last active", person.last],
            ["Risk status", person.risk],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        {person.reason && (
          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle className="mr-2 inline" size={17} />
            {person.reason}
          </div>
        )}
        <Trends
          label="Attendance trend · last 4 weeks"
          values={[58, 53, 49, person.attendance]}
          color="bg-rose-500"
        />
        <Trends
          label="Progress trend · last 4 weeks"
          values={[24, 28, 31, person.completion]}
          color="bg-blue-600"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add intervention notes"
          className="mt-5 w-full rounded-xl border p-3 dark:bg-slate-800"
          rows="4"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => toast.success("Warning message sent to student.")}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            Send warning message
          </button>
          <button
            onClick={() => toast.success("Case escalated to coordinator.")}
            className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700"
          >
            Escalate to coordinator
          </button>
          <button
            onClick={() => toast.success("Recovery plan marked active.")}
            className="rounded-lg border px-3 py-2 text-sm font-bold"
          >
            Mark recovery plan active
          </button>
        </div>
      </aside>
    </div>
  );
}
function Trends({ label, values, color }) {
  return (
    <section className="mt-5">
      <p className="text-sm font-bold">{label}</p>
      <div className="mt-2 flex h-28 items-end gap-3 rounded-xl bg-slate-50 p-4">
        {values.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <span className="text-xs">{v}%</span>
            <div
              className={`mt-1 w-full ${color} rounded-t`}
              style={{ height: `${v}px` }}
            />
            <span className="mt-1 text-[10px]">W{i + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function Update({ person, notes, setNotes, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35"
      onMouseDown={onClose}
    >
      <aside
        onMouseDown={(e) => e.stopPropagation()}
        className="h-full w-full max-w-[480px] bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <button onClick={onClose} className="float-right">
          <X />
        </button>
        <h2 className="text-xl font-bold">Update progress · {person.name}</h2>
        <p className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          Current progress is auto-calculated: {person.completion}% from
          lessons, assignments and assessments.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Manual notes — e.g. Student resumed after medical leave..."
          rows="5"
          className="mt-4 w-full rounded-xl border p-3 dark:bg-slate-800"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input type="date" className="rounded-lg border p-2" />
          <input type="date" className="rounded-lg border p-2" />
        </div>
        <input
          placeholder="Missed items / recovery plan"
          className="mt-3 w-full rounded-lg border p-2 dark:bg-slate-800"
        />
        <button
          onClick={() => {
            toast.success("Progress notes saved.");
            onClose();
          }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
        >
          Save progress notes
        </button>
      </aside>
    </div>
  );
}
