import employeeAttendanceService from "./employeeAttendanceService";
import { readStoredOrganizationId } from "./apiServices";

const PREFIX = "kini:employee-work-attendance";
export const employeeAttendanceEvent = "employee-attendance-change";
const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);
const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null") || {};
  } catch {
    return {};
  }
};
const identity = () => {
  const user = currentUser();
  return {
    employeeId:
      user.employeeId ??
      user.id ??
      localStorage.getItem("employeeId") ??
      localStorage.getItem("userId"),
    organizationId:
      user.organizationId ?? user.orgId ?? readStoredOrganizationId(),
    employeeName:
      user.fullName ??
      user.name ??
      ([user.firstName, user.lastName].filter(Boolean).join(" ") || "Employee"),
    email: user.email ?? "",
    department: user.departmentName ?? user.department ?? "",
  };
};
const storageKey = () => `${PREFIX}:${identity().organizationId ?? "unknown"}`;
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey()) || "[]");
  } catch {
    return [];
  }
};
const write = (rows) => {
  localStorage.setItem(storageKey(), JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(employeeAttendanceEvent));
};
const minutes = (record, now = new Date()) =>
  record?.checkIn
    ? Math.max(
        0,
        Math.floor(
          (new Date(record.checkOut || now) - new Date(record.checkIn)) / 60000,
        ),
      )
    : 0;
export const formatWorkTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
export const formatWorkDuration = (record) =>
  `${Math.floor(minutes(record) / 60)}h ${String(minutes(record) % 60).padStart(2, "0")}m`;

export const employeeWorkAttendance = {
  getToday: () => read().find((row) => row.date === dayKey()) || null,
  getHistory: read,
  // Mentors use a dedicated self-service screen, but their punch records are
  // still workforce attendance and must appear in organization reporting.
  upsertOrganizationRecord(record = {}) {
    const employee = identity();
    const normalized = {
      ...record,
      employeeId: record.employeeId ?? record.EmployeeId ?? employee.employeeId,
      organizationId: record.organizationId ?? record.OrganizationId ?? employee.organizationId,
      employeeName: record.employeeName ?? record.name ?? employee.employeeName,
      email: record.email ?? record.employeeEmail ?? employee.email,
      department: record.department ?? employee.department,
      date: record.date ?? record.attendanceDate ?? dayKey(),
      checkIn: record.checkIn ?? record.checkInTime ?? null,
      checkOut: record.checkOut ?? record.checkOutTime ?? null,
      status: record.status ?? (record.checkOut ? "Present" : record.checkIn ? "Working" : "Absent"),
      source: record.source ?? "mentor",
    };
    const rows = read();
    const index = rows.findIndex((item) =>
      item.date === normalized.date && (
        String(item.employeeId ?? "") === String(normalized.employeeId ?? "") ||
        (normalized.email && String(item.email ?? "").toLowerCase() === String(normalized.email).toLowerCase())
      ),
    );
    if (index >= 0) rows[index] = { ...rows[index], ...normalized };
    else rows.unshift(normalized);
    write(rows);
    return normalized;
  },
  async checkIn() {
    const rows = read();
    if (rows.some((row) => row.date === dayKey()))
      throw new Error("You have already checked in today.");
    let record = {
      id: `${identity().employeeId ?? "employee"}-${dayKey()}`,
      ...identity(),
      date: dayKey(),
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: "Working",
      source: "local",
    };
    try {
      const saved = await employeeAttendanceService.checkIn();
      record = {
        ...record,
        ...saved,
        id: saved?.attendanceId ?? saved?.id ?? record.id,
        source: "api",
      };
    } catch {
      /* offline/demo fallback */
    }
    write([record, ...rows]);
    return record;
  },
  async checkOut() {
    const rows = read();
    const index = rows.findIndex((row) => row.date === dayKey());
    if (index < 0) throw new Error("Please check in before checking out.");
    if (rows[index].checkOut)
      throw new Error("Attendance is already completed for today.");
    let record = {
      ...rows[index],
      checkOut: new Date().toISOString(),
      status: "Present",
    };
    if (record.source === "api") {
      try {
        record = {
          ...record,
          ...(await employeeAttendanceService.checkOut()),
        };
      } catch {
        /* retain synchronized local state */
      }
    }
    rows[index] = record;
    write(rows);
    return record;
  },
  getOrganizationRecords(organizationId = readStoredOrganizationId()) {
    try {
      return JSON.parse(
        localStorage.getItem(`${PREFIX}:${organizationId ?? "unknown"}`) ||
          "[]",
      );
    } catch {
      return [];
    }
  },
};

export default employeeWorkAttendance;
