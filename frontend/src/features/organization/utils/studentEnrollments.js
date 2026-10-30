// One row per course enrollment for the Student Details → Academic table.
//
// Source: GET /api/students/{studentId}/enrollments (no declared response
// schema, so fields are read defensively). When it returns nothing, the
// student's own course/batch (the enrollment saved with the student) is the
// only row. Nothing is invented: a value the backend doesn't send is shown as
// "Not reported".

const NOT_REPORTED = "Not reported";
const PAID = new Set(["paid", "paid in full", "completed", "success", "successful"]);
const text = (value) => (value === undefined || value === null || String(value).trim() === "" ? null : String(value).trim());
const idText = (value) => text(value);

const paymentStatusFor = (courseId, row, payments) => {
  const own = text(row?.paymentStatus ?? row?.payment?.status);
  if (own) return own;
  if (!courseId) return NOT_REPORTED;
  const payment = (payments ?? []).find((item) => idText(item.courseId ?? item.course?.courseId ?? item.course?.id) === courseId);
  if (!payment) return NOT_REPORTED;
  const status = text(payment.status ?? payment.paymentStatus);
  if (!status) return NOT_REPORTED;
  return PAID.has(status.toLowerCase()) ? "Paid" : status;
};

/**
 * batches: GET /api/v1/organization/batches rows. Each enrollment is matched
 * to its own batch by batchId for that batch's mentor and dates, so one
 * course never shows another course's mentor.
 */
export function buildEnrollmentRows({ enrollments = [], student = {}, payments = [], batches = [] } = {}) {
  const rows = (Array.isArray(enrollments) ? enrollments : []).map((row, index) => {
    const courseId = idText(row.courseId ?? row.course?.courseId ?? row.course?.id ?? row.batch?.courseId);
    const batchId = idText(row.batchId ?? row.batch?.batchId ?? row.batch?.id);
    return {
      key: idText(row.enrollmentId ?? row.id) ?? `${courseId ?? "course"}-${batchId ?? index}`,
      courseId,
      duration: row.duration ?? row.courseDuration ?? row.course?.duration,
      batchId,
      course: text(row.courseName ?? row.course?.courseName ?? row.course?.name ?? row.batch?.courseName) ?? (courseId ? `Course #${courseId}` : NOT_REPORTED),
      batch: text(row.batchName ?? row.batch?.batchName ?? row.batch?.name) ?? (batchId ? `Batch #${batchId}` : NOT_REPORTED),
      mentor: text(row.mentorName ?? row.trainerName ?? row.batch?.mentorName ?? row.batch?.trainerName ?? row.mentor?.name) ?? NOT_REPORTED,
      enrollmentStatus: text(row.enrollmentStatus ?? row.approvalStatus ?? row.status) ?? NOT_REPORTED,
      paymentStatus: paymentStatusFor(courseId, row, payments),
    };
  });

  // The enrollment saved with the student record itself, unless already listed.
  const primaryCourseId = idText(student.courseId ?? student.course?.courseId ?? student.course?.id);
  const primaryBatchId = idText(student.batchId ?? student.batch?.batchId ?? student.batch?.id);
  const listed = rows.some((row) => (primaryBatchId && row.batchId === primaryBatchId) || (!row.batchId && primaryCourseId && row.courseId === primaryCourseId));
  if ((primaryCourseId || primaryBatchId) && !listed) {
    rows.unshift({
      key: `primary-${primaryCourseId ?? ""}-${primaryBatchId ?? ""}`,
      courseId: primaryCourseId,
      duration: student.course?.duration ?? student.courseDuration,
      batchId: primaryBatchId,
      course: text(student.course?.courseName ?? student.courseName) ?? (primaryCourseId ? `Course #${primaryCourseId}` : NOT_REPORTED),
      batch: text(student.batch?.batchName ?? student.batchName) ?? (primaryBatchId ? `Batch #${primaryBatchId}` : "No batch assigned"),
      mentor: text(student.batch?.trainerName ?? student.trainerName ?? student.mentorName) ?? NOT_REPORTED,
      enrollmentStatus: text(student.status) ?? NOT_REPORTED,
      paymentStatus: paymentStatusFor(primaryCourseId, null, payments),
    });
  }
  const batchById = new Map((Array.isArray(batches) ? batches : []).map((batch) => [idText(batch.batchId ?? batch.id), batch]));
  return rows.map((row) => {
    const batch = row.batchId ? batchById.get(row.batchId) : null;
    if (!batch) return { ...row, batchStart: null, batchEnd: null };
    return {
      ...row,
      duration: row.duration ?? batch.courseDuration ?? batch.course?.duration,
      // The batch's own mentor wins over a mentor copied from the student record.
      mentor: text(batch.mentorName ?? batch.trainerName ?? batch.mentor?.name) ?? row.mentor,
      batchStart: text(batch.startDate),
      batchEnd: text(batch.endDate),
    };
  });
}
