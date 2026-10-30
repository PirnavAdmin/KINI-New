import apiClient from "./apiClient";
import { getPayload } from "./apiServices";

const request = (method, url, data, config) => {
  const options = config ? { ...config } : {};
  if (data !== undefined) {
    options.data = data;
  }
  return apiClient.request({ method, url, ...options }).then(getPayload);
};

const attendanceStorageKey = (studentId) => `student-class-attendance:${studentId}`;

const readLocalAttendance = (studentId) => {
  try {
    const rows = JSON.parse(localStorage.getItem(attendanceStorageKey(studentId)) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
};

// Keep a local confirmation so a completed join is visible even when an older
// attendance endpoint has not yet synchronized the server-side record.
export const recordStudentClassJoin = ({ studentId, classId, className, courseName, joinedAt } = {}) => {
  if (!studentId || !classId) return [];
  const rows = readLocalAttendance(studentId);
  const record = {
    attendanceId: `join-${classId}`,
    classId,
    attendanceDate: joinedAt || new Date().toISOString(),
    className: className || courseName || "Live class",
    courseName: courseName || "",
    status: "Present",
    source: "class-join",
  };
  const nextRows = [record, ...rows.filter((row) => String(row.classId ?? row.id) !== String(classId))];
  localStorage.setItem(attendanceStorageKey(studentId), JSON.stringify(nextRows.slice(0, 100)));
  return nextRows;
};

export const getStudentClassJoinAttendance = (studentId) => (
  studentId ? readLocalAttendance(studentId) : []
);

export const studentClassService = {
  getStats: (config) =>
    apiClient.get("/api/v1/student/classes/stats", config).then(getPayload),

  list: (params = {}, config) =>
    apiClient.get("/api/v1/student/classes", { params, ...config }).then(getPayload),

  getById: (id, config) =>
    apiClient.get(`/api/v1/student/classes/${id}`, config).then(getPayload),

  join: (id, config) =>
    request("post", `/api/v1/student/classes/${id}/join`, undefined, config),

  getPdf: (id, config) =>
    apiClient.get(`/api/v1/student/classes/${id}/pdf`, config).then(getPayload),

  getRecording: (id, config) =>
    apiClient.get(`/api/v1/student/classes/${id}/recording`, config).then(getPayload),

  getNotes: (id, config) =>
    apiClient.get(`/api/v1/student/classes/${id}/notes`, config).then(getPayload),

  markAttendanceJoined: (payload, config) =>
    request("post", "/api/student/attendance", payload, config),

  markAttendanceLeft: (payload, config) =>
    request("post", "/api/student/attendance", payload, config),
};

export default studentClassService;
