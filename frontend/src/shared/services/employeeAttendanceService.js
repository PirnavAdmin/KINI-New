import { API_ENDPOINTS } from "@/api/endpoints";
import apiClient from "./apiClient";
import { getListPayload, getPayload } from "./apiServices";

const endpoints = API_ENDPOINTS.employeeAttendance;

const employeeIdOf = (identity) => {
  if (identity === undefined || identity === null) return null;
  if (typeof identity !== "object") return identity;
  return identity.employeeId ?? identity.EmployeeId ?? identity.id ?? null;
};

const dateRangeParams = (source) => Object.fromEntries(
  Object.entries({
    fromDate: source?.fromDate,
    toDate: source?.toDate,
    date: source?.date,
  }).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
);

// Swagger-confirmed contract for GET /api/EmployeeAttendance and /report:
// employeeId, fromDate, toDate (YYYY-MM-DD). Only forwarding employeeId here
// and dropping the rest meant callers could never actually send a date
// range, no matter what mentorWorkAttendance.js computed and passed in.
const employeeConfig = (identity) => {
  const employeeId = employeeIdOf(identity);
  const source = identity && typeof identity === "object" ? identity : {};
  const params = { employeeId, ...dateRangeParams(source) };
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );
  return Object.keys(cleaned).length ? { params: cleaned } : undefined;
};

// GET /api/EmployeeAttendance/my and /my/report resolve the employee from
// the bearer token, the same way check-in/check-out already do — no
// employeeId param, by design. Only an optional date range is forwarded.
const myConfig = (params) => {
  const cleaned = dateRangeParams(params && typeof params === "object" ? params : {});
  return Object.keys(cleaned).length ? { params: cleaned } : undefined;
};

export const employeeAttendanceService = {
  // Check-in/out are self-scoped by the bearer token. Sending an employeeId
  // body makes this API reject the request with a 500 for mentor sessions.
  // remarks matches the Swagger-confirmed check-out contract
  // ({ "remarks": "checkOut" }); check-in accepts the same shape.
  checkIn: () => apiClient.post(endpoints.checkIn, { remarks: "Checked in via Mentor Attendance" }).then(getPayload).catch((error) => {
      throw error;
    }),
  checkOut: () => apiClient.post(endpoints.checkOut, { remarks: "Checked out via Mentor Attendance" }).then(getPayload).catch((error) => {
      throw error;
    }),
  // Explicit-employeeId variants — for admin/HR screens looking up another
  // employee's attendance. A mentor viewing their own attendance should use
  // my()/myReport() below instead.
  list: (params = undefined) => apiClient.get(endpoints.base, employeeConfig(params) || (params ? { params } : undefined)).then(getListPayload),
  report: (params = undefined) => apiClient.get(endpoints.report, employeeConfig(params) || (params ? { params } : undefined)).then(getListPayload),
  // Self-scoped variants — "my own attendance", resolved from the token.
  my: (params = undefined) => apiClient.get(endpoints.my, myConfig(params)).then(getListPayload),
  myReport: (params = undefined) => apiClient.get(endpoints.myReport, myConfig(params)).then(getListPayload),
  // Correction requests are self-scoped by the bearer token, matching check-in/out.
  correctionRequest: (payload) => apiClient.post(endpoints.correctionRequest, payload).then(getPayload),
};

export default employeeAttendanceService;
