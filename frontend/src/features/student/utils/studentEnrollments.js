// The signed-in student's enrollments, one entry per course × batch.
//
// Source: rows from GET /api/v1/student/courses (token-scoped, extracted by
// courseService.getStudentCourses). A row carries its batch inline
// (batchId/batchName), as a `batch` object, or as a `batches` list when one
// course has several batches. My Courses, My Batch and the class screens all
// read this one shape. Nothing is invented: a value the backend doesn't send
// stays empty.

const text = (value) => (value === undefined || value === null ? "" : String(value).trim());

const idOf = (value) => {
  if (value === null || value === undefined || typeof value === "object") return null;
  const id = String(value).trim();
  return id && id !== "0" ? id : null;
};

const first = (...values) => values.find((value) => text(value) !== "") ?? null;

const fullName = (person) => (person && typeof person === "object"
  ? text(first(person.mentorName, person.name, person.fullName, [person.firstName, person.lastName].filter(Boolean).join(" ")))
  : "");

const mentorOf = (row = {}, batch = {}) => {
  const mentor = [row.mentor, batch.mentor].find((item) => item && typeof item === "object") ?? {};
  return {
    mentorId: idOf(first(batch.mentorId, batch.tutorId, row.mentorId, row.tutorId, mentor.mentorId, mentor.tutorId, mentor.id)),
    mentorName: text(first(batch.mentorName, batch.trainerName, row.mentorName, row.tutorName, row.trainerName, fullName(mentor))),
    mentorEmail: text(first(batch.mentorEmail, row.mentorEmail, row.tutorEmail, mentor.email)),
    mentorPhone: text(first(batch.mentorPhone, row.mentorPhone, row.tutorPhone, mentor.phone, mentor.mobile)),
    mentorDesignation: text(first(row.mentorDesignation, mentor.designation)),
  };
};

const batchesOf = (row) => {
  const listed = Array.isArray(row.batches) ? row.batches.filter((batch) => batch && typeof batch === "object") : [];
  if (listed.length) return listed;
  return [row.batch && typeof row.batch === "object" ? row.batch : {}];
};

const toEntry = (row, batch) => {
  const courseId = idOf(first(row.courseId, row.course?.courseId, row.course?.id, batch.courseId, row.id));
  const batchId = idOf(first(batch.batchId, batch.id, row.batchId));
  return {
    key: `${courseId ?? "course"}:${batchId ?? "no-batch"}`,
    courseId,
    courseName: text(first(row.courseName, row.course?.courseName, row.course?.name, row.title, row.name, batch.courseName)),
    courseDescription: text(first(row.courseDescription, row.description, row.shortDescription, row.course?.description)),
    batchId,
    batchName: text(first(batch.batchName, batch.name, row.batchName)),
    batchType: text(first(batch.batchType, batch.mode, row.batchType)),
    batchStatus: text(first(batch.status, row.batchStatus)),
    enrollmentStatus: text(first(row.enrollmentStatus, row.approvalStatus, row.studentStatus, row.enrollment?.status)),
    startDate: first(batch.startDate, row.batchStartDate, row.startDate),
    endDate: first(batch.endDate, row.batchEndDate, row.endDate),
    capacity: first(batch.capacity, batch.maxStudents, row.capacity),
    enrolledStudents: first(batch.enrolledStudents, batch.studentCount, row.enrolledStudents),
    liveClasses: first(batch.liveClasses, row.liveClasses),
    recordedClasses: first(batch.recordedClasses, row.recordedClasses),
    batchDescription: text(batch.description),
    ...mentorOf(row, batch),
    course: row,
  };
};

/** Rows → one entry per course × batch, duplicates (same course and batch) merged. */
export function normalizeStudentEnrollments(rows = []) {
  const entries = new Map();
  (Array.isArray(rows) ? rows : []).filter((row) => row && typeof row === "object").forEach((row) => {
    batchesOf(row).forEach((batch) => {
      const entry = toEntry(row, batch);
      if (!entry.courseId && !entry.batchId && !entry.courseName && !entry.batchName) return;
      const previous = entries.get(entry.key);
      entries.set(entry.key, previous
        ? Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, text(previous[key]) !== "" ? previous[key] : value]))
        : entry);
    });
  });
  // A course listed without a batch is dropped when the same course also has a batch.
  const batchedCourses = new Set([...entries.values()].filter((entry) => entry.batchId || entry.batchName).map((entry) => entry.courseId));
  return [...entries.values()].filter((entry) => entry.batchId || entry.batchName || !batchedCourses.has(entry.courseId));
}

/** Entries that name a batch — what My Batch renders. */
export const batchEnrollments = (entries = []) => entries.filter((entry) => entry.batchId || entry.batchName);

/** One item per course with all of its batches — what My Courses renders. */
export function groupEnrollmentsByCourse(entries = []) {
  const courses = new Map();
  entries.forEach((entry) => {
    const key = entry.courseId ?? `name:${entry.courseName.toLowerCase()}`;
    if (!courses.has(key)) courses.set(key, { ...entry, batches: [] });
    if (entry.batchId || entry.batchName) courses.get(key).batches.push(entry);
  });
  return [...courses.values()];
}
