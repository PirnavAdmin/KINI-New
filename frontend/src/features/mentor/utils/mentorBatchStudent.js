// Mentor-facing view of a batch roster row. The StudentBatch roster endpoint
// is shared with organization/admin screens and returns the full student
// record (email, phone, …). Mentor screens map every row through this as soon
// as it arrives, so personal contact details never reach mentor state, the
// DOM, search or exports — only what a mentor needs to teach the batch.
// The backend should ideally return this shape from a mentor-scoped endpoint;
// until then this keeps the exposure out of the mentor UI.

const numberOrNull = (value) => {
  const number = Number(value);
  return value == null || value === "" || !Number.isFinite(number) ? null : number;
};

export const toMentorBatchStudent = (student = {}) => ({
  studentId: student.studentId ?? student.id,
  name: student.name || student.fullName || student.studentName
    || [student.firstName, student.lastName].filter(Boolean).join(" ") || "Unnamed student",
  // An existing school-facing code only — never invented, never the email.
  studentCode: student.studentCode ?? student.rollNumber ?? student.admissionNumber ?? null,
  attendance: numberOrNull(student.attendance) ?? 0,
  assessmentsCleared: numberOrNull(student.assessmentsCleared) ?? 0,
  // Only shown when the API actually provides it.
  progress: numberOrNull(student.progress ?? student.progressPercentage ?? student.courseProgress),
  status: student.status || "Active",
});

export const initialsOf = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "S";
