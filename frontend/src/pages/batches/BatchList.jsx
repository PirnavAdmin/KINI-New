import { useMemo, useState } from "react";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";
const tones = {
  Active: "bg-emerald-50 text-emerald-700",
  Planned: "bg-amber-50 text-amber-700",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-700",
};
export default function BatchList({
  batches,
  onView,
  onEdit,
  onAction,
  onCancel,
}) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All courses");
  const [trainer, setTrainer] = useState("All mentors");
  const [status, setStatus] = useState("All statuses");
  const [mode, setMode] = useState("All modes");
  const [date, setDate] = useState("");
  const [menu, setMenu] = useState(null);
  const rows = useMemo(
    () =>
      batches.filter(
        (item) =>
          `${item.name} ${item.code}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (course === "All courses" || item.course === course) &&
          (trainer === "All mentors" || item.trainer === trainer) &&
          (status === "All statuses" || item.status === status) &&
          (mode === "All modes" || item.mode === mode) &&
          (!date || item.startDate === date),
      ),
    [batches, course, date, mode, query, status, trainer],
  );
  const options = (key) => [...new Set(batches.map((item) => item[key]))];
  const actions = [
    "View",
    "Edit",
    "Add Students",
    "Schedule",
    "Attendance",
    "Change Mentor",
    "Cancel",
  ];
  const run = (action, item) => {
    setMenu(null);
    if (action === "View") onView(item);
    else if (action === "Edit") onEdit(item);
    else if (action === "Cancel") onCancel(item);
    else onAction(action, item);
  };
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b p-3">
        <label className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batch name or code"
            className="h-10 w-full rounded-lg border bg-slate-50 pl-9 pr-3 text-sm"
          />
        </label>
        {[
          [course, setCourse, "All courses", options("course")],
          [trainer, setTrainer, "All mentors", options("trainer")],
          [
            status,
            setStatus,
            "All statuses",
            ["Active", "Planned", "Completed", "Cancelled"],
          ],
          [mode, setMode, "All modes", ["Online", "Offline", "Hybrid"]],
        ].map(([value, setter, label, items]) => (
          <label key={label} className="relative">
            <select
              aria-label={label}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="h-10 appearance-none rounded-lg border bg-white pl-3 pr-8 text-xs"
            >
              <option>{label}</option>
              {items.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5" />
          </label>
        ))}
        <input
          aria-label="Start date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-lg border px-3 text-xs"
        />
        <button
          onClick={() => {
            setQuery("");
            setCourse("All courses");
            setTrainer("All mentors");
            setStatus("All statuses");
            setMode("All modes");
            setDate("");
          }}
          className="px-2 text-xs font-semibold text-blue-600"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2 p-3 md:hidden">
        {rows.map((item) => {
          const ratio = (item.students / item.capacity) * 100;
          const bar =
            ratio >= 95
              ? "bg-red-500"
              : ratio >= 80
                ? "bg-amber-500"
                : "bg-emerald-500";
          return (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => onView(item)}
                  className="min-w-0 text-left"
                >
                  <b className="block truncate text-sm text-slate-900">
                    {item.name}
                  </b>
                  <span className="text-xs text-slate-500">
                    {item.course} · {item.trainer}
                  </span>
                </button>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tones[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{item.schedule}</span>
                  <b>
                    {item.students}/{item.capacity}
                  </b>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <i
                    className={`block h-full ${bar}`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>
                <p className="mt-2">
                  {item.startDate} – {item.endDate} · {item.mode}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1250px] text-left text-xs">
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
            <tr>
              {[
                "Name",
                "Course",
                "Mentor",
                "Students",
                "Schedule",
                "Start",
                "End",
                "Mode",
                "Status",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-4 py-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((item) => {
              const ratio = (item.students / item.capacity) * 100;
              const bar =
                ratio >= 95
                  ? "bg-red-500"
                  : ratio >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500";
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onView(item)}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {item.name}
                    </button>
                    <p className="font-mono text-[10px] text-slate-400">
                      {item.code}
                    </p>
                  </td>
                  <td className="px-4">{item.course}</td>
                  <td className="px-4">{item.trainer}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        {item.students}/{item.capacity}
                      </span>
                      {item.students >= item.capacity && (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                          FULL
                        </span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${bar}`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4">{item.schedule}</td>
                  <td className="px-4">{item.startDate}</td>
                  <td className="px-4">{item.endDate}</td>
                  <td className="px-4">{item.mode}</td>
                  <td className="px-4">
                    <span
                      className={`rounded-full px-2 py-1 font-semibold ${tones[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="relative px-4">
                    <button
                      onClick={() => setMenu(menu === item.id ? null : item.id)}
                      className="rounded p-2 hover:bg-slate-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menu === item.id && (
                      <div className="absolute right-8 top-8 z-30 w-44 rounded-lg border bg-white p-1 shadow-xl">
                        {actions.map((action) => (
                          <button
                            key={action}
                            onClick={() => run(action, item)}
                            className={`block w-full rounded px-3 py-2 text-left hover:bg-slate-50 ${action === "Cancel" ? "text-red-600" : ""}`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="grid h-52 place-items-center text-sm text-slate-500">
            No batches match these filters.
          </div>
        )}
      </div>
    </section>
  );
}
