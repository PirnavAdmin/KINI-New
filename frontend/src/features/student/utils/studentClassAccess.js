// Which live classes a signed-in student may see or join.
//
// The live-class endpoints the Student Portal calls (GET /api/v1/live-classes,
// /upcoming, /live, /completed, /today) take no course, batch or student
// filter (Swagger), so the frontend must not assume their rows are already
// scoped to this student. A class is in scope only when it belongs to one of
// the student's own approved enrollments, matched by backend id. Unknown
// scope means nothing is shown (fail closed). The backend must still enforce
// this; the check here only keeps unauthorized rows off the screen.

const NOT_APPROVED = new Set(["pending", "pending approval", "pendingapproval", "rejected", "cancelled", "canceled", "withdrawn", "refunded"]);

const idOf = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text && text !== "0" ? text : null;
};

const firstId = (...values) => values.map(idOf).find(Boolean) ?? null;

/** An enrollment row from GET /api/v1/student/courses that is not approved yet (or was refused). */
const isUnapproved = (row) => {
  const status = row?.enrollmentStatus ?? row?.approvalStatus ?? row?.studentStatus ?? row?.enrollment?.status;
  return status != null && NOT_APPROVED.has(String(status).trim().toLowerCase());
};

/**
 * Builds the student's class scope.
 * enrollments: rows from GET /api/v1/student/courses (token-scoped)
 * profile: the signed-in student's own profile / session (same student)
 * attendance: rows from GET /api/Attendance/student/{studentId}. The student
 *   live-class lists (e.g. /live) omit courseId and batchId; the student's own
 *   attendance record for the same liveClassId carries them.
 */
export function buildStudentClassScope({ enrollments = [], profile = null, attendance = [] } = {}) {
  const courseIds = new Set();
  const batchIds = new Set();
  // Batches are tracked per course: a student enrolled in several courses may
  // have batch details for only some of them (e.g. a course added later).
  const batchesByCourse = new Map();
  const add = (courseId, batchList) => {
    if (courseId) {
      courseIds.add(courseId);
      if (!batchesByCourse.has(courseId)) batchesByCourse.set(courseId, new Set());
    }
    batchList.filter(Boolean).forEach((batchId) => {
      batchIds.add(batchId);
      if (courseId) batchesByCourse.get(courseId).add(batchId);
    });
  };
  enrollments.filter((row) => !isUnapproved(row)).forEach((row) => {
    add(firstId(row.courseId, row.course?.courseId, row.course?.id), [
      firstId(row.batchId, row.batch?.batchId, row.batch?.id),
      ...(Array.isArray(row.batches) ? row.batches.map((batch) => firstId(batch?.batchId, batch?.id, batch)) : []),
    ]);
  });
  if (profile && !isUnapproved(profile)) {
    add(firstId(profile.courseId, profile.course?.courseId, profile.course?.id), [firstId(profile.batchId, profile.batch?.batchId, profile.batch?.id)]);
  }
  const classRefs = new Map();
  (Array.isArray(attendance) ? attendance : []).forEach((row) => {
    const liveClassId = firstId(row.liveClassId, row.liveClass?.liveClassId, row.liveClass?.id, row.classId);
    if (!liveClassId) return;
    classRefs.set(liveClassId, {
      courseId: firstId(row.courseId, row.liveClass?.courseId, row.course?.courseId),
      batchId: firstId(row.batchId, row.liveClass?.batchId, row.batch?.batchId),
    });
  });
  return { courseIds, batchIds, batchesByCourse, classRefs };
}

/**
 * True only for a class that belongs to one of the student's enrollments:
 * its course must be one of theirs and, when the student's batches for that
 * course are known, its batch must be one of them. A class with no course id
 * needs a batch the student is in.
 */
export function isClassInStudentScope(liveClass, scope) {
  if (!scope || !liveClass) return false;
  let batchId = firstId(liveClass.batchId, liveClass.batch?.batchId, liveClass.batch?.id);
  let courseId = firstId(liveClass.courseId, liveClass.course?.courseId, liveClass.course?.id);
  if (!batchId && !courseId) {
    // Ids missing from the list row: use the student's own attendance record
    // for this class, matched by liveClassId (never by course or batch name).
    const ref = scope.classRefs?.get(firstId(liveClass.liveClassId, liveClass.id));
    batchId = ref?.batchId ?? null;
    courseId = ref?.courseId ?? null;
  }
  if (courseId) {
    if (!scope.courseIds.has(courseId)) return false;
    const courseBatches = scope.batchesByCourse?.get(courseId);
    return !batchId || !courseBatches?.size || courseBatches.has(batchId);
  }
  return Boolean(batchId && scope.batchIds.has(batchId));
}

/** Keeps only in-scope classes; returns { allowed, blocked } so callers can log what was withheld. */
export function partitionClassesByScope(classes, scope) {
  const allowed = [];
  const blocked = [];
  (classes ?? []).forEach((item) => (isClassInStudentScope(item, scope) ? allowed : blocked).push(item));
  return { allowed, blocked };
}
