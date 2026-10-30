// Every course/batch a student is enrolled in, for the Students table.
//
// Sources (one request per batch, not per student):
//   GET /api/v1/organization/batches          — course, batch and that batch's own mentor
//   GET /api/StudentBatch/{batchId}/students  — students added to the batch (StudentBatch)
// plus the course/batch saved on the student record itself, which the
// StudentBatch rosters don't include.
//
// A roster row is the student record, so its own batchId is the student's
// original batch: the enrollment's batch is the roster's batch, never the row's.

const idOf = (value) => (value === undefined || value === null || String(value).trim() === "" ? null : String(value));
const label = (value) => (value === undefined || value === null || String(value).trim() === "" || value === "—" ? null : String(value).trim());

/** Map of studentId → enrollments found in the batch rosters. */
export function buildRosterIndex(batches = [], rosters = []) {
  const batchById = new Map(batches.map((batch) => [idOf(batch.batchId ?? batch.id), batch]));
  const index = new Map();
  rosters.forEach(({ batchId, students = [] }) => {
    const id = idOf(batchId);
    const batch = batchById.get(id);
    if (!id || !batch) return;
    students.forEach((student) => {
      const studentId = idOf(student.studentId ?? student.id);
      if (!studentId) return;
      const entry = {
        courseId: idOf(batch.courseId ?? batch.course?.courseId),
        course: label(batch.courseName ?? batch.course?.courseName) ?? "Course not reported",
        batchId: id,
        batch: label(batch.batchName ?? batch.name) ?? `Batch #${id}`,
        mentor: label(batch.mentorName ?? batch.trainerName ?? batch.mentor?.name),
      };
      index.set(studentId, [...(index.get(studentId) ?? []), entry]);
    });
  });
  return index;
}

/**
 * The student's enrollments: the one saved on the student record first, then
 * each roster enrollment, without repeating a batch. The mentor is the
 * enrollment's own batch mentor; it is never borrowed from another course.
 */
export function enrollmentsOf(student, rosterIndex, batches = []) {
  const batchById = new Map(batches.map((batch) => [idOf(batch.batchId ?? batch.id), batch]));
  const list = [];
  const primaryBatchId = idOf(student.batchId);
  const primaryCourse = label(student.course);
  if (primaryBatchId || primaryCourse) {
    const batch = primaryBatchId ? batchById.get(primaryBatchId) : null;
    list.push({
      courseId: idOf(student.courseId),
      // The batch list names the course and batch; the student list can only
      // fall back to placeholders like "Course #12" when its record lacks them.
      course: label(batch?.courseName) ?? primaryCourse ?? "Course not reported",
      batchId: primaryBatchId,
      batch: label(batch?.batchName) ?? label(student.batch) ?? "Not assigned",
      mentor: label(batch?.mentorName) ?? label(student.mentorName),
    });
  }
  (rosterIndex.get(idOf(student.studentId ?? student.id)) ?? []).forEach((entry) => {
    if (!list.some((item) => item.batchId && item.batchId === entry.batchId)) list.push(entry);
  });
  return list;
}
