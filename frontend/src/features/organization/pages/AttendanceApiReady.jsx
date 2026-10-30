import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import KPI from "@/components/common/KPI";
import OrgShowcaseHero from "../components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "../constants/orgBanners";
import {
  AlertCircle,
  BarChart3,
  CalendarCheck,
  Clock3,
  SearchX,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
} from "lucide-react";
import { employeeService } from "@shared/services/employeeService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import DataTable from "@shared/components/DataTable";
import EmptyState from "@shared/components/EmptyState";
import StatusBadge from "@shared/components/StatusBadge";
import "./attendance-page.css";

const pick = (row, ...keys) =>
  keys
    .map((key) => row?.[key])
    .find((item) => item !== undefined && item !== null && item !== "");
const display = (item) =>
  item === undefined || item === null || item === "" ? "—" : String(item);
const displayValue = (item) => {
  const value = display(item);
  const codePoints = Array.from(value).map((character) => character.codePointAt(0)).join(",");
  return codePoints === "226,8364,8221" || value === "?" ? "\u2014" : value;
};
const statusOf = (row) =>
  displayValue(pick(row, "status", "attendanceStatus", "AttendanceStatus"))
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
const toneOf = (status) => {
  const key = String(status).toLowerCase();
  if (key.includes("present")) return "success";
  if (key.includes("late") || key.includes("half")) return "warning";
  if (key.includes("leave")) return "info";
  if (key.includes("absent")) return "danger";
  return "neutral";
};
const dateOf = (row) =>
  pick(row, "attendanceDate", "AttendanceDate", "date", "createdDate", "createdAt", "Date");
const formatAttendanceTime = (input) => {
  if (!input) return "—";
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime())
    ? String(input)
    : parsed.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
};
const formatDate = (input) => {
  if (!input) return "—";
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime())
    ? String(input)
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};
const attendanceDateSearchValues = (input) => {
  if (!input) return [];
  const raw = String(input).trim();
  // Date-only values are calendar days, not UTC instants. Parsing them as a
  // Date can shift to the previous day in negative UTC offsets and also
  // produces locale-dependent search strings. Extract the calendar portion
  // first, then add deterministic spellings for the table search.
  const datePart = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)?.slice(1);
  const parsed = datePart
    ? new Date(Number(datePart[0]), Number(datePart[1]) - 1, Number(datePart[2]))
    : new Date(input);
  if (Number.isNaN(parsed.getTime())) return [raw];

  // Search in the displayed format plus common numeric and ISO formats.
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const monthShort = parsed.toLocaleDateString("en-IN", { month: "short" });
  const monthLong = parsed.toLocaleDateString("en-IN", { month: "long" });
  return [
    raw,
    formatDate(input),
    `${day}/${month}/${year}`,
    `${month}/${day}/${year}`,
    `${year}-${month}-${day}`,
    `${month}-${day}-${year}`,
    `${day}-${month}-${year}`,
    `${day} ${monthShort} ${year}`,
    `${monthLong} ${day}, ${year}`,
  ];
};
const formatWorkingHours = (row) => {
  const stored = pick(row, "workingHours", "totalWorkingHours", "workedHours", "WorkingHours");
  const checkIn = pick(row, "checkInTime", "checkIn", "CheckInTime", "CheckIn");
  const checkOut = pick(row, "checkOutTime", "checkOut", "CheckOutTime", "CheckOut");
  if (stored !== undefined && stored !== null && stored !== "" && Number(stored) > 0) return stored;
  if (!checkIn || checkOut) return stored ?? "—";
  const start = new Date(checkIn);
  if (Number.isNaN(start.getTime())) return stored ?? "—";
  const minutes = Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};
const employeeName = (row) =>
  pick(
    row,
    "employeeName",
    "EmployeeName",
    "fullName",
    "name",
    "studentName",
  ) ||
  [
    pick(row, "firstName", "employeeFirstName"),
    pick(row, "lastName", "employeeLastName"),
  ]
    .filter(Boolean)
    .join(" ") ||
  "Unknown employee";
const employeeId = (row) =>
  pick(row, "employeeCode", "employeeId", "EmployeeId", "userId", "studentId");
const matchingEmployeeId = (row) =>
  pick(
    row,
    "employeeId",
    "EmployeeId",
    "employeeCode",
    "EmployeeCode",
    "userId",
    "UserId",
    "id",
    "Id",
  );
const hasAttendanceCheckIn = (row) =>
  Boolean(pick(row, "checkIn", "checkInTime", "CheckIn", "CheckInTime"));
const initials = (name) =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "—";

const ATTENDANCE_STATUS_OPTIONS = ["All", "Present", "Incomplete", "Absent", "Late", "Half Day", "On Leave", "Not Marked"];
const normalizeAttendanceStatus = (value) => {
  const status = String(value || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
  const key = status.toLowerCase().replace(/\s+/g, " ");
  if (key === "halfday" || key === "half day") return "Half Day";
  if (key === "leave" || key === "on leave" || key === "onleave") return "On Leave";
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const KPI_ACCENT_BY_TONE = { blue: "blue", green: "green", red: "red", amber: "orange", violet: "purple" };
function KpiCard({ label, count, icon, tone, description }) {
  return <KPI value={count} label={label} description={description} icon={icon} accent={KPI_ACCENT_BY_TONE[tone] ?? "blue"} size="compact" decoration="bars" className="h-full" />;
}

export default function AttendanceApiReady() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const [selectedStatus, setSelectedStatus] = useState("All");
  const dateChangeScrollRef = useRef(null);

  const handleAttendanceDateChange = (event) => {
    let scrollContainer = event.currentTarget.parentElement;
    while (scrollContainer && scrollContainer !== document.body) {
      const overflowY = window.getComputedStyle(scrollContainer).overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        dateChangeScrollRef.current = { element: scrollContainer, top: scrollContainer.scrollTop };
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }
    if (!dateChangeScrollRef.current) {
      dateChangeScrollRef.current = { element: window, top: window.scrollY };
    }
    setSelectedDate(event.target.value);
  };

  useLayoutEffect(() => {
    const saved = dateChangeScrollRef.current;
    if (!saved) return;
    if (saved.element === window) window.scrollTo(0, saved.top);
    else saved.element.scrollTop = saved.top;
    dateChangeScrollRef.current = null;
  }, [selectedDate]);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const employeePage = await employeeService.getEmployees({ pageNumber: 1, pageSize: 100 });
      const employeeRows = employeePage?.data ?? [];
      const attendanceResponses = await Promise.all(
        employeeRows
          .map((employee) => matchingEmployeeId(employee))
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map(async (employeeId) => ({
            employeeId,
            response: await employeeService.getAttendance(employeeId),
          })),
      );
      const apiRecords = attendanceResponses.flatMap(({ employeeId, response }) => {
        const payload = response?.data ?? response;
        const attachEmployeeId = (row) => ({
          ...row,
          employeeId: matchingEmployeeId(row) ?? employeeId,
        });
        if (Array.isArray(payload)) return payload.map(attachEmployeeId);
        if (Array.isArray(payload?.data)) return payload.data.map(attachEmployeeId);
        if (Array.isArray(payload?.items)) return payload.items.map(attachEmployeeId);
        if (Array.isArray(payload?.records)) return payload.records.map(attachEmployeeId);
        return payload && typeof payload === "object" ? [attachEmployeeId(payload)] : [];
      });
      setEmployees(employeeRows);
      setRecords(apiRecords);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to load attendance data."),
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const joinedRecords = useMemo(() => {
    const recordsForDate = selectedDate
      ? records.filter((row) => String(dateOf(row) ?? "").slice(0, 10) === selectedDate)
      : records;

    return employees.map((employee) => {
      const id = matchingEmployeeId(employee);
      const attendance = recordsForDate.find(
        (record) => String(matchingEmployeeId(record)) === String(id),
      );
      const apiStatus = attendance ? statusOf(attendance) : "";
      return {
        ...employee,
        ...(attendance ?? {}),
        employeeId: id,
        employeeName: employeeName(employee),
        attendanceDate: attendance ? dateOf(attendance) : selectedDate,
        attendanceDateSearch: attendanceDateSearchValues(attendance ? dateOf(attendance) : selectedDate).join(" "),
        status: !attendance
          ? "Not Marked"
          : apiStatus && apiStatus !== "—"
            ? apiStatus
            : hasAttendanceCheckIn(attendance)
              ? "Incomplete"
              : "Not Marked",
      };
    });
  }, [employees, records, selectedDate]);

  const statuses = useMemo(
    () => [
      ...new Set([
        ...ATTENDANCE_STATUS_OPTIONS,
        ...joinedRecords.map((row) => normalizeAttendanceStatus(statusOf(row))).filter((item) => item && item !== "—"),
      ]),
    ],
    [joinedRecords],
  );
  const filtered = useMemo(
    () =>
      joinedRecords.filter(
        (row) => selectedStatus === "All" || normalizeAttendanceStatus(statusOf(row)) === selectedStatus,
      ),
    [joinedRecords, selectedStatus],
  );
  const summary = useMemo(() => {
    const has = (name) =>
      filtered.filter((row) => statusOf(row).toLowerCase().includes(name))
        .length;
    return {
      total: employees.length,
      present: filtered.filter(
        (row) => hasAttendanceCheckIn(row) || statusOf(row).toLowerCase().includes("present"),
      ).length,
      absent: has("absent"),
      leave: has("leave"),
      late: has("late"),
    };
  }, [employees.length, filtered]);

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employeeName",
        width: "22%",
        render: (row) => {
          const name = employeeName(row);
          return (
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900 dark:text-white">
                  {name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {displayValue(
                    pick(
                      row,
                      "email",
                      "employeeEmail",
                      "departmentName",
                      "department",
                    ),
                  )}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: "Employee ID",
        accessor: "employeeId",
        render: (row) => (
          <span className="font-mono text-xs font-semibold">
            {displayValue(employeeId(row))}
          </span>
        ),
      },
      {
        header: "Date",
        accessor: "attendanceDateSearch",
        render: (row) => formatDate(dateOf(row)),
      },
      {
        header: "Check-In",
        accessor: "checkIn",
        render: (row) =>
          formatAttendanceTime(
            pick(row, "checkInTime", "checkIn", "CheckInTime"),
          ),
      },
      {
        header: "Check-Out",
        accessor: "checkOut",
        render: (row) =>
          formatAttendanceTime(
            pick(row, "checkOutTime", "checkOut", "CheckOutTime"),
          ),
      },
      {
        header: "Working Hours",
        accessor: "workingHours",
        render: (row) => displayValue(formatWorkingHours(row)),
      },
      {
        header: "Status",
        accessor: "status",
        render: (row) => {
          const status = statusOf(row);
          return (
            <StatusBadge status={toneOf(status)} label={status} size="sm" />
          );
        },
      },
      {
        header: "Leave",
        accessor: "leave",
        render: (row) =>
          displayValue(
            pick(row, "leaveType", "leaveName", "applicableLeave", "LeaveType"),
          ),
      },
    ],
    [],
  );

  return (
    <main className="organization-attendance-page mx-auto w-full max-w-[1680px] space-y-3 px-3 pb-6 sm:px-4 lg:px-5">
      <OrgShowcaseHero
        variant="v14"
        className="osh-v14--attendance-compact"
        title={["Attendance", "Management"]}
        subtitle="Monitor employee attendance, check-in/check-out activity, working hours, attendance status, and applicable leave information."
        features={[
          { icon: CalendarCheck, label: ["Track", "Attendance"], tone: "blue" },
          { icon: UserCog, label: ["Manage", "Leave"], tone: "purple" },
          { icon: Clock3, label: ["Working", "Hours"], tone: "orange" },
          { icon: BarChart3, label: ["Real-time", "Reports"], tone: "green" },
        ]}
        art={ORG_BANNERS.attendance}
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total Employees"
          description="Organization workforce"
          count={summary.total}
          icon={Users}
          tone="blue"
        />
        <KpiCard
          label="Present"
          description="Currently active"
          count={summary.present}
          icon={UserCheck}
          tone="green"
        />
        <KpiCard
          label="Absent"
          description="Not checked in"
          count={summary.absent}
          icon={UserMinus}
          tone="red"
        />
        <KpiCard
          label="On Leave"
          description="Approved leave"
          count={summary.leave}
          icon={CalendarCheck}
          tone="violet"
        />
        <KpiCard label="Late" description="Arrived late" count={summary.late} icon={Clock3} tone="amber" />
      </section>
      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-white p-8 dark:border-rose-900/50 dark:bg-slate-900">
          <EmptyState
            icon={AlertCircle}
            title="Unable to load attendance data"
            description={error}
            action={
              <button
                onClick={loadAttendance}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
              >
                Retry
              </button>
            }
          />
        </section>
      ) : (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-extrabold text-[#0f2a4a] dark:text-white">
                Attendance List
              </h2>
              <p className="text-sm text-slate-500">
                Check-in, check-out, working hours and leave information from the
                existing attendance service.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-500">
                Attendance date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleAttendanceDateChange}
                  className="mt-1 block h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0f2a4a] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Status
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mt-1 block h-10 min-w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0f2a4a] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            pageSize={10}
            searchPlaceholder="Search employee, ID, date or status..."
            emptyIcon={SearchX}
            emptyTitle="No attendance records found"
            emptyDescription="Attendance records will appear here once employee attendance data is available."
            tableClassName="min-w-[1120px]"
          />
        </section>
      )}
      {!loading && !error && filtered.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Attendance Summary
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Present", summary.present, "bg-emerald-500"],
              ["Absent", summary.absent, "bg-rose-500"],
              ["On Leave", summary.leave, "bg-violet-500"],
              ["Late", summary.late, "bg-amber-500"],
            ].map(([label, count, color]) => {
              const percent = Math.round(
                (Number(count) / filtered.length) * 100,
              );
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {label}
                    </span>
                    <b>{percent}%</b>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
