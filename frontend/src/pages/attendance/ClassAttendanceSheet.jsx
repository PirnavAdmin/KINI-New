import { useMemo, useState } from "react";
import { BellRing, Check, Search, X } from "lucide-react";
const styles = {
  Present: "bg-emerald-50 border-emerald-200",
  Absent: "bg-red-50 border-red-200",
  Late: "bg-amber-50 border-amber-200",
  Leave: "bg-violet-50 border-violet-200",
};
const buttonStyles = {
  Present: "bg-emerald-600 text-white",
  Absent: "bg-red-600 text-white",
  Late: "bg-amber-500 text-white",
  Leave: "bg-violet-600 text-white",
};
export default function ClassAttendanceSheet({
  classItem,
  students,
  onClose,
  onSave,
}) {
  const initial = Object.fromEntries(
    students.map((student) => [student.id, student.status]),
  );
  const [records, setRecords] = useState(initial);
  const [unmarkedOnly, setUnmarkedOnly] = useState(false);
  const [notify, setNotify] = useState(false);
  const [query, setQuery] = useState("");
  const visible = students.filter(
    (student) =>
      (!unmarkedOnly || !records[student.id]) &&
      `${student.name} ${student.studentId}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const summary = useMemo(
    () =>
      students.reduce(
        (acc, student) => {
          const key = records[student.id] || "Unmarked";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        { Present: 0, Absent: 0, Late: 0, Leave: 0, Unmarked: 0 },
      ),
    [records, students],
  );
  const markAll = (status) =>
    setRecords(
      Object.fromEntries(students.map((student) => [student.id, status])),
    );
  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/45 p-2 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-xl bg-slate-50 shadow-2xl"
      >
        <header className="flex items-start justify-between border-b bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold">
              {classItem.batch} · Aug 4, 2026
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {classItem.name} · Mentor: {classItem.trainer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-wrap gap-2 border-b bg-white p-3">
          <button
            onClick={() => markAll("Present")}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll("Absent")}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Mark All Absent
          </button>
          <button
            onClick={() => setUnmarkedOnly(!unmarkedOnly)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${unmarkedOnly ? "border-blue-300 bg-blue-50 text-blue-700" : ""}`}
          >
            Show Unmarked Only
          </button>
          <label className="relative ml-auto min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students"
              className="h-9 w-full rounded-lg border pl-9 pr-3 text-xs"
            />
          </label>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-5">
          {visible.map((student) => {
            const selected = records[student.id];
            return (
              <div
                key={student.id}
                className={`flex flex-col gap-3 rounded-lg border bg-white p-3 transition sm:flex-row sm:items-center ${selected ? styles[selected] : ""}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm">
                  {student.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div className="flex-1">
                  <b className="text-sm">{student.name}</b>
                  <p className="font-mono text-[10px] text-slate-500">
                    {student.studentId}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    ["Present", "P"],
                    ["Absent", "A"],
                    ["Late", "L"],
                    ["Leave", "Leave"],
                  ].map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() =>
                        setRecords((current) => ({
                          ...current,
                          [student.id]: status,
                        }))
                      }
                      aria-pressed={selected === status}
                      className={`min-w-9 rounded-lg border px-2.5 py-2 text-xs font-semibold ${selected === status ? buttonStyles[status] : "bg-white text-slate-500"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="grid h-40 place-items-center text-sm text-slate-500">
              No unmarked students found.
            </div>
          )}
        </div>
        <footer className="border-t bg-white">
          <div className="flex flex-wrap gap-3 bg-slate-900 px-5 py-3 text-xs text-white">
            <b>Present: {summary.Present}</b>
            <b>Absent: {summary.Absent}</b>
            <b>Late: {summary.Late}</b>
            <b>Leave: {summary.Leave}</b>
            <b>Not Marked: {summary.Unmarked}</b>
          </div>
          <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="accent-blue-600"
              />
              <BellRing className="h-4 w-4" />
              Also notify absentees via SMS/Email
            </label>
            <button
              onClick={() => {
                onSave(records, notify);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              Save Attendance
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
