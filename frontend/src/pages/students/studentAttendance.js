// Student attendance from GET /api/Attendance/student/{studentId} — the same
// records the Student Details → Attendance tab lists. Shared so the Students
// table and the profile always compute the same percentage.
//
// The backend attendance row shape isn't fully proven, so every field is read
// defensively (matching the student's own "My Attendance" page). "Present" and
// "Late" both count toward the attendance percentage.

export const isPresentStatus = (status) => ["present", "late"].includes(String(status ?? "").trim().toLowerCase());

export const normalizeAttendanceRow = (row, index) => ({
  id: row.attendanceId ?? row.id ?? index,
  date: row.attendanceDate ?? row.date ?? row.classDate ?? row.liveClass?.scheduledDate ?? row.createdAt,
  class: row.liveClass?.classTitle ?? row.className ?? row.lessonName ?? row.liveClassName ?? row.courseName ?? row.subject ?? "Class session",
  status: String(row.status ?? row.attendanceStatus ?? (row.isPresent ? "Present" : "Absent")),
  checkIn: row.checkIn ?? row.checkInTime ?? "Not provided",
  checkOut: row.checkOut ?? row.checkOutTime ?? "Not provided",
});

/** Rows from studentsApi.getAttendance's response (array or { items }). */
export const attendanceRowsOf = (data) => (Array.isArray(data) ? data : data?.items ?? []);

/**
 * { percentage, attended, total } from attendance records, or null when no
 * attendance has been recorded — "no records" is never reported as 0%.
 */
export const summarizeAttendance = (rows) => {
  if (!rows.length) return null;
  const attended = rows.filter((row) => isPresentStatus(row.status)).length;
  return { percentage: Math.round((attended / rows.length) * 100), attended, total: rows.length };
};
