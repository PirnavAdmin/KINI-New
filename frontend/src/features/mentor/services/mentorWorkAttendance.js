import employeeAttendanceService from "@shared/services/employeeAttendanceService";
import { getApiErrorMessage, readableApiMessage } from "@shared/services/apiServices";
import { API_ENDPOINTS } from "@/api/endpoints";

// Attendance is owned by the API. This cache is not persisted and is replaced
// whenever the attendance endpoints are loaded.
let memoryRecords = [];
const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};
const employeeIdentity = (user = storedUser()) => ({
  id: user?.employeeId ?? user?.EmployeeId
      ?? user?.employeeRecordId ?? user?.staffId
      ?? user?.employee?.employeeId ?? user?.employee?.id
      ?? user?.data?.employeeId ?? user?.data?.employeeRecordId ?? user?.data?.staffId
      ?? localStorage.getItem("employeeId"),
  email: String(user?.email ?? user?.Email ?? user?.data?.email ?? localStorage.getItem("user_email") ?? "").trim().toLowerCase(),
  mentorId: user?.mentorId ?? user?.MentorId ?? user?.mentor?.mentorId ?? user?.mentor?.id ?? localStorage.getItem("mentorId"),
  user,
});
export const mentorAttendanceEvent = "mentor-attendance-change";
const dateKey = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const pick = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== "");
const toIso = (value, date) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const combined = new Date(`${date}T${value}`);
  return Number.isNaN(combined.getTime()) ? value : combined.toISOString();
};
const normalize = (row = {}) => {
  const rawDate = pick(row, "date", "attendanceDate", "AttendanceDate", "dateKey", "workDate", "createdAt", "CreatedAt");
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const date = Number.isNaN(parsedDate.getTime()) ? String(rawDate).slice(0, 10) : dateKey(parsedDate);
  const checkIn = toIso(pick(row, "checkIn", "checkInTime", "CheckIn", "CheckInTime", "checkInAt", "CheckInAt", "clockIn", "ClockIn"), date);
  const checkOut = toIso(pick(row, "checkOut", "checkOutTime", "CheckOut", "CheckOutTime", "checkOutAt", "CheckOutAt", "clockOut", "ClockOut"), date);
  return { ...row, id: pick(row, "id", "attendanceId", "employeeAttendanceId", "AttendanceId") ?? date, employeeId: pick(row, "employeeId", "EmployeeId", "employeeRecordId", "EmployeeRecordId", "staffId", "StaffId") ?? row?.employee?.employeeId ?? row?.Employee?.employeeId, employeeEmail: String(pick(row, "email", "Email", "employeeEmail", "EmployeeEmail") ?? row?.employee?.email ?? row?.Employee?.email ?? "").trim().toLowerCase(), date, checkIn, checkOut, status: pick(row, "status", "attendanceStatus", "Status", "attendanceState", "AttendanceState") ?? (checkOut ? "Present" : checkIn ? "Working" : "Absent") };
};
const belongsToEmployee = (row, employee) => {
  const rowId = row?.employeeId;
  const rowEmail = String(row?.employeeEmail || "").toLowerCase();
  if (rowId === undefined && !rowEmail) return true;
  return (employee.id !== undefined && employee.id !== null && String(rowId) === String(employee.id))
    || (employee.email && rowEmail === employee.email);
};
const read = () => memoryRecords;
const write = (records) => {
  memoryRecords = records;
  window.dispatchEvent(new CustomEvent(mentorAttendanceEvent));
};
const responseRecord = (payload) => {
  const value = payload?.attendance ?? payload?.record ?? payload?.result ?? payload?.data ?? payload;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = normalize(value);
  return record.checkIn || record.checkOut ? record : null;
};
const attendanceRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ["attendance", "record", "result", "items", "records", "content", "results", "rows", "data"])
    if (payload[key] !== undefined) {
      const rows = attendanceRows(payload[key]);
      if (rows.length) return rows;
    }

  const record = normalize(payload);
  return record.checkIn || record.checkOut ? [payload] : [];
};
let loadRequest;
let loadRequestKey = "";
let latestLoadSequence = 0;
let reportRequest;
const isAlreadyCheckedIn = (error) => {
  const payload = error?.response?.data;
  let message;
  try {
    message = JSON.stringify(payload ?? "");
  } catch {
    message = String(payload ?? "");
  }
  return `${message} ${error?.message ?? ""}`.toLowerCase().includes("already checked in");
};
const isMissingServerCheckIn = (error) => {
  const payload = error?.response?.data;
  let serializedPayload;
  try {
    serializedPayload = JSON.stringify(payload ?? "");
  } catch {
    serializedPayload = String(payload ?? "");
  }
  const message = `${serializedPayload} ${error?.message ?? ""}`.toLowerCase();
  return (
    message.includes("not checked in") ||
    message.includes("has not checked in") ||
    message.includes("check in before") ||
    message.includes("no active check-in")
  );
};

// A 403 with no explanatory body is still an authorization failure, but it
// must not be mislabeled as "the org admin disabled this permission" unless
// the server actually says so. Organization > Employee Access can show
// Attendance enabled for a mentor while the EmployeeAttendance endpoint still
// 403s (a backend permission-mapping bug) — asserting "not enabled" in that
// case would hide the real problem instead of surfacing it. See requirement
// #7 in the attendance fix task: only claim "disabled" when confirmed.
const PERMISSION_DENIAL_PATTERN = /permission|not enabled|access is disabled|access denied|disabled|unauthorized to|forbidden/i;

// Single source of truth for turning an attendance API error into a message,
// shared by the attendance page and the header check-in/out widget so both
// surfaces describe the same failure the same way.
export const describeAttendanceError = (error, identity, fallback = "Request failed.") => {
  const status = error?.response?.status;
  const employeeSuffix = identity?.id ? ` (employee ID ${identity.id})` : "";

  if (!error?.response) {
    return `Unable to reach the attendance service${employeeSuffix}. Check your connection or the API server, then retry.`;
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again to continue.";
  }

  if (status === 403) {
    const serverText = readableApiMessage(error.response.data);
    if (serverText && PERMISSION_DENIAL_PATTERN.test(serverText)) {
      return `${serverText} Ask the organization admin to enable Attendance in Access & Permissions for this mentor${employeeSuffix}, then retry.`;
    }
    return `The server rejected this attendance request with 403 Forbidden${employeeSuffix}${serverText ? `: ${serverText}` : ""}. If Attendance access shows enabled in Organization → Employee Access for this mentor, this is a backend authorization/permission-mapping issue rather than a disabled permission — please report it to your administrator with this employee ID.`;
  }

  if (status === 404) {
    return "The attendance service could not find this record. It may not exist yet for today.";
  }

  if (status === 409) {
    // The correct status for a business-rule conflict (already checked in /
    // already checked out) — surface the server's own message when present,
    // since apiServices.js's generic 409 fallback text is written for
    // registration conflicts, not attendance ones.
    return readableApiMessage(error.response.data) || "This attendance action conflicts with your current state today.";
  }

  if (status >= 500) {
    return `${fallback} The attendance server encountered an error. Please try again shortly.`;
  }

  return getApiErrorMessage(error, fallback);
};

export const formatTime = (value) => value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
export const formatDuration = (minutes = 0) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
export const workingMinutes = (record, now = new Date()) => {
  if (!record?.checkIn) return 0;
  const checkIn = new Date(record.checkIn);
  if (Number.isNaN(checkIn.getTime())) return 0;
  const today = dateKey(now);
  const recordDate = record.date || dateKey(checkIn);
  if (!record.checkOut && recordDate !== today) return 0;
  const end = new Date(record.checkOut || now);
  return Number.isNaN(end.getTime()) ? 0 : Math.max(0, Math.floor((end - checkIn) / 60000));
};

// Swagger-confirmed: GET /api/EmployeeAttendance and /report accept
// fromDate/toDate (YYYY-MM-DD). The UI previously sent only employeeId,
// which likely left the backend applying its own (probably narrower)
// default window — too narrow for the Week/Last Week/Month/Last Month
// filters this page offers, since those are computed client-side from
// whatever rows come back. Covers the prior calendar month through a few
// days ahead, to tolerate timezone differences on "today".
const defaultAttendanceRange = () => {
  const now = new Date();
  return {
    fromDate: dateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    toDate: dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)),
  };
};

export const mentorWorkAttendance = {
  getIdentity: (user) => employeeIdentity(user),
  getToday: () => read().find((item) => item.date === dateKey()) || null,
  getHistory: read,
  async load(params, range = defaultAttendanceRange()) {
    const dateRangeParams = {
      fromDate: range?.fromDate ?? defaultAttendanceRange().fromDate,
      toDate: range?.toDate ?? defaultAttendanceRange().toDate,
    };
    const requestKey = `${dateRangeParams.fromDate}:${dateRangeParams.toDate}`;
    if (!loadRequest || loadRequestKey !== requestKey) {
      const loadSequence = ++latestLoadSequence;
      loadRequestKey = requestKey;
      const suppliedIdentity = params && typeof params === "object" ? params : {};
      const sessionEmployee = employeeIdentity(suppliedIdentity.user || storedUser());
      const employee = {
        ...sessionEmployee,
        id: suppliedIdentity.employeeId ?? suppliedIdentity.EmployeeId ?? sessionEmployee.id,
      };
        // GET /api/EmployeeAttendance/my and /my/report resolve the employee
        // from the bearer token — no employeeId param, same as check-in/out.
        // "My Attendance" is inherently the caller's own record, so this uses
        // the self-scoped endpoints rather than the explicit-employeeId ones
        // (GET /api/EmployeeAttendance?employeeId=... / /report?employeeId=...),
        // which is the pair that was observed 403ing even with a confirmed-
        // correct employeeId and permission — the self-scoped pair avoids
        // whatever ownership check was rejecting that path.
        if (import.meta.env.DEV) {
          console.log("[Attendance API]", { method: "GET", url: API_ENDPOINTS.employeeAttendance.my, params: dateRangeParams });
          console.log("[Attendance API]", { method: "GET", url: API_ENDPOINTS.employeeAttendance.myReport, params: dateRangeParams });
        }
        loadRequest = employeeAttendanceService.my(dateRangeParams)
        .then(async (listPayload) => {
          if (import.meta.env.DEV) console.log("[Attendance API] response", { url: API_ENDPOINTS.employeeAttendance.my, data: listPayload });
          return {
          listPayload,
          reportPayload: await employeeAttendanceService.myReport(dateRangeParams).then((reportPayload) => {
            if (import.meta.env.DEV) console.log("[Attendance API] response", { url: API_ENDPOINTS.employeeAttendance.myReport, data: reportPayload });
            return reportPayload;
          }).catch((reportError) => {
            if (import.meta.env.DEV) {
              console.warn("[EmployeeAttendance] GET my/report failed", { employeeId: employee.id ?? null, status: reportError?.response?.status, data: reportError?.response?.data });
            }
            return null;
          }),
        };
        })
        .catch(async (listError) => {
          if (import.meta.env.DEV) {
            console.warn("[EmployeeAttendance] GET my failed", { employeeId: employee.id ?? null, status: listError?.response?.status, data: listError?.response?.data });
          }
          try {
            return { listPayload: null, reportPayload: await employeeAttendanceService.myReport(dateRangeParams) };
          } catch {
            throw listError;
          }
        })
        .then(async ({ listPayload, reportPayload }) => {
          let rows = [...attendanceRows(listPayload), ...attendanceRows(reportPayload)].map(normalize);
          if (employee.id !== undefined && employee.id !== null && employee.id !== "") {
            rows = rows.filter((row) => belongsToEmployee(row, employee));
          }

          rows = rows.filter((row, index, allRows) => allRows.findIndex((candidate) =>
            String(candidate.id ?? "") === String(row.id ?? "") || candidate.date === row.date,
          ) === index);

          rows.sort((a, b) => b.date.localeCompare(a.date));
          if (loadSequence === latestLoadSequence) write(rows);
          return rows;
        })
        .finally(() => {
          if (loadSequence === latestLoadSequence) {
            loadRequest = undefined;
            loadRequestKey = "";
          }
        });
    }
    return loadRequest;
  },
  report(params) {
    if (!reportRequest) {
      reportRequest = employeeAttendanceService.report(params)
        .catch((error) => {
          throw error;
        })
        .finally(() => { reportRequest = undefined; });
    }
    return reportRequest;
  },
  async checkIn(identity) {
    // Idempotency guard: never send a second check-in for the same day. This
    // keeps the displayed time stable when a slow/failed API response causes
    // the user to press the button again.
    const existingToday = this.getToday();
    if (existingToday?.checkIn) return existingToday;
    const employeeId = identity?.id ?? identity?.employeeId ?? null;
    if (import.meta.env.DEV) {
      // employeeId here is informational only — check-in/out are self-scoped
      // by the bearer token (see employeeAttendanceService.js), so it is
      // NOT sent in the body; the body always matches the Swagger-confirmed
      // { remarks } shape.
      console.log("[Attendance API]", { method: "POST", url: API_ENDPOINTS.employeeAttendance.checkIn, body: { remarks: "Checked in via Mentor Attendance" }, employeeId });
    }
    let response;
    try {
      response = await employeeAttendanceService.checkIn(identity);
      if (import.meta.env.DEV) console.log("[Attendance API] response", { url: API_ENDPOINTS.employeeAttendance.checkIn, data: response });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[EmployeeAttendance] POST check-in failed", { employeeId, status: error?.response?.status, data: error?.response?.data });
      }
      if (!isAlreadyCheckedIn(error)) throw error;
      loadRequest = undefined;
      const rows = await this.load(identity);
      const record = rows.find((item) => item.date === dateKey() && item.checkIn);
      if (record) return record;
      // Do not manufacture a local record: the backend must return the
      // existing attendance before the UI can enter the working state.
      throw error;
    }
    const rows = await this.load(identity);
    const record = rows.find((item) => item.date === dateKey());
    if (record?.checkIn) return record;
    const backendRecord = responseRecord(response);
    if (!backendRecord?.checkIn) {
      throw new Error("The server did not return a check-in record. Please refresh and try again.");
    }
    write([backendRecord, ...rows.filter((item) => item.date !== backendRecord.date)]);
    return backendRecord;
  },
  async checkOut(identity) {
    const current = this.getToday();
    if (!current) throw new Error("Please check in before checking out.");
    if (current.checkOut) throw new Error("Attendance has already been completed for today.");
    const employeeId = identity?.id ?? identity?.employeeId ?? null;
    if (import.meta.env.DEV) {
      console.log("[Attendance API]", { method: "POST", url: API_ENDPOINTS.employeeAttendance.checkOut, body: { remarks: "Checked out via Mentor Attendance" }, employeeId });
    }
    let record;
    try {
      const response = await employeeAttendanceService.checkOut(identity);
      if (import.meta.env.DEV) console.log("[Attendance API] response", { url: API_ENDPOINTS.employeeAttendance.checkOut, data: response });
      const rows = await this.load(identity);
      record = rows.find((item) => item.date === current.date);
      if (!record?.checkOut) {
        record = responseRecord(response);
        if (!record?.checkOut) {
          throw new Error("The server did not return a check-out record. Please refresh and try again.");
        }
        write([record, ...rows.filter((item) => item.date !== record.date)]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[EmployeeAttendance] POST check-out failed", { employeeId, status: error?.response?.status, data: error?.response?.data });
      }
      if (isMissingServerCheckIn(error)) {
        const synchronizedError = new Error(
          "Your previous check-in was not found on the server. Please check in again, then check out.",
        );
        synchronizedError.cause = error;
        throw synchronizedError;
      }
      throw error;
    }
    return record;
  },
};
