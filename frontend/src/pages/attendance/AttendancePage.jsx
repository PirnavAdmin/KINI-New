import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClockAlert,
  Search,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import useAttendance from "@/hooks/useAttendance";
import ClassAttendanceSheet from "./ClassAttendanceSheet";
import CorrectionRequests from "./CorrectionRequests";
import employeeAttendanceService from "@shared/services/employeeAttendanceService";
import { formatWorkDuration, formatWorkTime } from "@shared/services/employeeWorkAttendance";
const statusTone = {
  Live: "bg-emerald-50 text-emerald-700",
  Upcoming: "bg-amber-50 text-amber-700",
  Completed: "bg-blue-50 text-blue-700",
};
export default function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scope =
    searchParams.get("scope") === "employees" ? "employees" : "students";
  const {
    classes,
    requests,
    students,
    loading,
    stats,
    saveSheet,
    resolveRequest,
  } = useAttendance();
  const [tab, setTab] = useState("overview");
  const [view, setView] = useState("class");
  const [course, setCourse] = useState("All courses");
  const [batch, setBatch] = useState("All batches");
  const [trainer, setTrainer] = useState("All mentors");
  const [date, setDate] = useState("2026-08-04");
  const [status, setStatus] = useState("All statuses");
  const [sheet, setSheet] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  const [studentQuery, setStudentQuery] = useState("");
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);
  const filtered = useMemo(
    () =>
      classes.filter(
        (item) =>
          (course === "All courses" || item.course === course) &&
          (batch === "All batches" || item.batch === batch) &&
          (trainer === "All trainers" || item.trainer === trainer) &&
          (status === "All statuses" ||
            (status === "Marked" ? item.marked : !item.marked)) &&
          (!date || item.date === date),
      ),
    [batch, classes, course, date, status, trainer],
  );
  const unique = (key) => [...new Set(classes.map((item) => item[key]))];
  const studentCards = [
    [
      "Today's Classes",
      stats.classes,
      CalendarCheck,
      "bg-blue-50 text-blue-600",
    ],
    ["Marked", stats.marked, CheckCircle2, "bg-emerald-50 text-emerald-600"],
    ["Not Marked", stats.unmarked, ClockAlert, "bg-red-50 text-red-600"],
    [
      "Monthly Avg",
      `${stats.average}%`,
      TrendingUp,
      "bg-violet-50 text-violet-600",
    ],
  ];
  const employeeCards = [
    ["Total Employees", 12, UsersRound, "bg-blue-50 text-blue-600"],
    ["Present Today", 9, UserRoundCheck, "bg-emerald-50 text-emerald-600"],
    ["Absent", 1, ClockAlert, "bg-red-50 text-red-600"],
    ["On Leave", 2, CalendarCheck, "bg-violet-50 text-violet-600"],
  ];
  const cards = scope === "employees" ? employeeCards : studentCards;
  const setScope = (nextScope) => {
    const next = new URLSearchParams(searchParams);
    next.set("scope", nextScope);
    next.set("period", next.get("period") || "7-days");
    setSearchParams(next);
    setTab("overview");
    setView("class");
  };
  if (loading)
    return (
      <main className="min-h-full bg-slate-50 p-4">
        <div className="h-[520px] animate-pulse rounded-xl bg-slate-200" />
      </main>
    );
  return (
    <main className="min-h-full overflow-x-hidden bg-slate-50 p-3 text-slate-800 sm:p-4">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-3">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Operations · Daily records
            </p>
            <h1 className="mt-0.5 text-xl font-semibold sm:text-2xl">
              {scope === "employees"
                ? "Employee Attendance"
                : "Student Attendance"}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {scope === "employees"
                ? "Review staff presence, leave, working hours and attendance exceptions."
                : "Monitor class attendance, student thresholds and correction approvals."}
            </p>
          </div>
          <div
            className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            aria-label="Attendance scope"
          >
            <button
              onClick={() => setScope("students")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${scope === "students" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Students
            </button>
            <button
              onClick={() => setScope("employees")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${scope === "employees" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Employees
            </button>
          </div>
        </header>
        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cards.map(([label, value, Icon, tone]) => (
            <button
              key={label}
              onClick={() => label === "Not Marked" && setStatus("Not Marked")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue-200"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-none text-slate-900">
                    {value}
                  </p>
                </div>
                <span className={`rounded-lg p-1.5 ${tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </section>
        {scope === "students" && (
          <div className="grid gap-2 lg:grid-cols-2">
            <button
              onClick={() => {
                setTab("overview");
                setStatus("Not Marked");
              }}
              className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs text-amber-800 sm:text-sm"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="flex-1">
                <b>4 classes</b> have no attendance marked today
              </span>
              <span className="font-semibold">View →</span>
            </button>
            <button
              onClick={() => {
                setTab("overview");
                setView("student");
              }}
              className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs text-amber-800 sm:text-sm"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="flex-1">
                <b>7 students</b> below 75% threshold this month
              </span>
              <span className="font-semibold">View →</span>
            </button>
          </div>
        )}
        <nav className="flex border-b border-slate-200">
          <button
            onClick={() => setTab("overview")}
            className={`border-b-2 px-3 py-2.5 text-sm font-semibold ${tab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            {scope === "employees" ? "Employee Overview" : "Student Overview"}
          </button>
          <button
            onClick={() => setTab("corrections")}
            className={`border-b-2 px-3 py-2.5 text-sm font-semibold ${tab === "corrections" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            Correction Requests{" "}
            <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">
              {requests.length}
            </span>
          </button>
        </nav>
        {tab === "corrections" ? (
          <CorrectionRequests
            requests={requests}
            onResolve={resolveRequest}
            notify={setToast}
          />
        ) : scope === "employees" ? (
          <EmployeeAttendanceView />
        ) : (
          <>
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_150px_auto]">
              {[
                [course, setCourse, "All courses", unique("course")],
                [batch, setBatch, "All batches", unique("batch")],
                [trainer, setTrainer, "All mentors", unique("trainer")],
                [status, setStatus, "All statuses", ["Marked", "Not Marked"]],
              ].map(([value, setter, label, items]) => (
                <select
                  key={label}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-blue-500"
                >
                  <option>{label}</option>
                  {items.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ))}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 min-w-0 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
              />
              <div className="flex justify-self-stretch rounded-lg border border-slate-200 p-1 lg:justify-self-end">
                <button
                  onClick={() => setView("class")}
                  className={`rounded px-3 py-1.5 text-xs font-semibold ${view === "class" ? "bg-slate-900 text-white" : ""}`}
                >
                  By Class
                </button>
                <button
                  onClick={() => setView("student")}
                  className={`rounded px-3 py-1.5 text-xs font-semibold ${view === "student" ? "bg-slate-900 text-white" : ""}`}
                >
                  By Student
                </button>
              </div>
            </div>
            {view === "class" ? (
              <ClassView rows={filtered} onOpen={setSheet} />
            ) : (
              <StudentView
                students={students}
                selected={selectedStudent}
                setSelected={setSelectedStudent}
                query={studentQuery}
                setQuery={setStudentQuery}
              />
            )}
          </>
        )}
      </div>
      {sheet && (
        <ClassAttendanceSheet
          classItem={sheet}
          students={students}
          onClose={() => setSheet(null)}
          onSave={(records, notify) => {
            saveSheet(sheet.id, records, notify);
            setToast("Attendance saved and audit logged");
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[90] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
          {toast}
        </div>
      )}
    </main>
  );
}
function ClassView({ rows, onOpen }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[13%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
            <tr>
              {[
                "Class Name",
                "Batch",
                "Mentor",
                "Time",
                "Status",
                "Marked?",
                "Present",
                "Absent",
                "Late",
                "%",
                "Actions",
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-2.5 py-2.5">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80">
                <td
                  className="truncate px-2.5 py-3 font-semibold"
                  title={item.name}
                >
                  {item.name}
                </td>
                <td className="truncate px-2.5" title={item.batch}>
                  {item.batch}
                </td>
                <td className="truncate px-2.5" title={item.trainer}>
                  {item.trainer}
                </td>
                <td className="whitespace-nowrap px-2.5">{item.time}</td>
                <td className="px-2.5">
                  <span
                    className={`rounded-full px-2 py-1 ${statusTone[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-2.5">
                  <span
                    className={`font-semibold ${item.marked ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {item.marked ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-2.5">{item.present}</td>
                <td className="px-2.5">{item.absent}</td>
                <td className="px-2.5">{item.late}</td>
                <td className="px-2.5 font-mono">
                  {item.marked ? `${item.percent}%` : "—"}
                </td>
                <td className="px-2.5 text-right">
                  <button
                    onClick={() => onOpen(item)}
                    className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-blue-600 px-2.5 font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    View Sheet
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="grid h-52 place-items-center text-sm text-slate-500">
          No classes match these filters.
        </div>
      )}
    </div>
  );
}

function EmployeeAttendanceView() {
  const [apiEmployees, setApiEmployees] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");
  useEffect(() => {
    employeeAttendanceService.report()
      .then((result) => setApiEmployees(Array.isArray(result) ? result : result?.content || result?.items || result?.records || result?.results || []))
      .catch((e) => setAttendanceError(e?.response?.data?.message || e?.message || "Unable to load employee attendance."))
      .finally(() => setAttendanceLoading(false));
  }, []);
  const employees = [
    ["Mallesh Malli", "HR", "09:04 AM", "06:12 PM", "9h 08m", "Present"],
    ["Mani Teja", "HR", "09:18 AM", "06:05 PM", "8h 47m", "Late"],
    ["Narendra Kumar", "Training", "08:56 AM", "05:48 PM", "8h 52m", "Present"],
    ["Poorna Sai", "Training", "—", "—", "—", "On leave"],
    ["Srinivas Sree", "Academic", "—", "—", "—", "Absent"],
  ];
  const visibleEmployees = apiEmployees;
  const tones = {
    Present: "bg-emerald-50 text-emerald-700",
    Late: "bg-amber-50 text-amber-700",
    "On leave": "bg-violet-50 text-violet-700",
    Absent: "bg-red-50 text-red-700",
  };
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Today’s employee attendance
          </h2>
          <p className="text-xs text-slate-500">
            Live staff check-in, working hours, absence and leave status.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            defaultValue="2026-08-13"
            className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
          />
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500">
            <option>All departments</option>
            <option>HR</option>
            <option>Training</option>
            <option>Academic</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {attendanceLoading && <div className="p-6 text-center text-sm text-slate-500">Loading attendance...</div>}
        {attendanceError && !attendanceLoading && <div className="p-6 text-center text-sm text-red-600">{attendanceError}</div>}
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-600">
            <tr>
              {[
                "Employee",
                "Department",
                "Check in",
                "Check out",
                "Working hours",
                "Status",
              ].map((head) => (
                <th key={head} className="px-4 py-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!attendanceLoading && !attendanceError && visibleEmployees.map((employee) => (
              Array.isArray(employee) ? (
              <tr key={employee[0]} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {employee[0]}
                </td>
                {employee.slice(1, 5).map((value, index) => (
                  <td
                    key={`${employee[0]}-${index}`}
                    className="px-4 py-3 text-slate-600"
                  >
                    {value}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${tones[employee[5]]}`}
                  >
                    {employee[5]}
                  </span>
                </td>
              </tr>
              ) : (() => {
                const checkIn = employee.checkInTime || employee.checkIn || employee.checkInAt;
                const checkOut = employee.checkOutTime || employee.checkOut || employee.checkOutAt;
                const status = employee.status || (checkOut ? "Present" : checkIn ? "Working" : "Absent");
                const name = employee.employeeName || employee.fullName || employee.name || `Employee ${employee.employeeId ?? ""}`;
                return <tr key={employee.attendanceId || employee.id || name} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-900">{name}</td><td className="px-4 py-3 text-slate-600">{employee.departmentName || employee.department || "—"}</td><td className="px-4 py-3 text-slate-600">{formatWorkTime(checkIn)}</td><td className="px-4 py-3 text-slate-600">{formatWorkTime(checkOut)}</td><td className="px-4 py-3 text-slate-600">{checkIn ? formatWorkDuration({ checkIn, checkOut }) : "—"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 font-semibold ${tones[status] || "bg-slate-100 text-slate-600"}`}>{status}</span></td></tr>;
              })()
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StudentView({ students, selected, setSelected, query, setQuery }) {
  const matches = students.filter((item) =>
    `${item.name} ${item.studentId}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <section className="rounded-xl border bg-white p-3 shadow-sm">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student"
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs"
          />
        </label>
        <div className="mt-3 max-h-[500px] space-y-1 overflow-y-auto">
          {matches.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelected(student)}
              className={`w-full rounded-lg p-3 text-left ${selected?.id === student.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
            >
              <b className="text-sm">{student.name}</b>
              <p className="font-mono text-[10px] text-slate-400">
                {student.studentId}
              </p>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">{selected?.name}</h2>
              <p className="text-xs text-slate-500">August 2026 attendance</p>
            </div>
            <span className="font-mono text-2xl font-semibold text-amber-600">
              72%
            </span>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day}
                title={`August ${day}`}
                className={`grid aspect-square place-items-center rounded text-[10px] ${day % 9 === 0 ? "bg-red-100 text-red-700" : day % 7 === 0 ? "bg-amber-100 text-amber-700" : day > 20 ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-700"}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Date", "Class", "Status", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["Aug 4", "React Hooks", "Present", "Joined on time"],
                ["Aug 3", "Components", "Late", "12 minutes late"],
                ["Aug 1", "React Basics", "Absent", "Correction requested"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((value) => (
                    <td key={value} className="px-4 py-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
