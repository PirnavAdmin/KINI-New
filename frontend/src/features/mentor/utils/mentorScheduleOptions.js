// Course and batch options for the mentor's Schedule Live Class dialog.
//
// Sources are the JWT-scoped mentor endpoints (GET /api/mentor/dashboard/courses
// and /api/mentor/dashboard/batches), which resolve the mentor server-side.
// The organization dropdowns (/api/v1/courses|batches/dropdown) list every
// course and batch in the organization and must not feed this dialog.
//
// Rows are normalized to { id, name, ... } with string ids so string and
// number ids from different endpoints compare equal and dedupe cleanly.

const present = (value) => value !== undefined && value !== null && String(value).trim() !== "";
const key = (value) => String(value ?? "").trim().toLowerCase();

export const listRows = (value, name) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const candidate of [name, "items", "records", "results", "data"]) {
    if (!candidate) continue;
    const result = listRows(value[candidate], name);
    if (result.length) return result;
  }
  return [];
};

// A batch row also carries courseId/courseName, so the batch's own fields are
// read first — a generic `id ?? courseId ?? batchId` would read the course.
const courseIdOf = (row) => row?.courseId ?? row?.CourseId ?? row?.course?.courseId ?? row?.course?.id;
const courseNameOf = (row) => row?.courseName ?? row?.CourseName ?? row?.course?.courseName ?? row?.course?.name;
const batchIdOf = (row) => row?.batchId ?? row?.BatchId ?? row?.id;
const batchNameOf = (row) => row?.batchName ?? row?.BatchName ?? row?.name ?? row?.title;
const mentorIdOf = (row) => row?.mentorId ?? row?.MentorId ?? row?.mentor?.mentorId ?? row?.mentor?.id ?? row?.assignedMentorId ?? row?.trainerId;

// Defence in depth: a row that names a different mentor is dropped. Rows with
// no mentor field are kept, because the endpoint itself is already scoped.
const belongsToMentor = (row, mentorIds) => {
  const owner = mentorIdOf(row);
  return !present(owner) || !mentorIds.length || mentorIds.includes(String(owner));
};

const uniqueById = (items) => [...new Map(items.map((item) => [item.id, item])).values()];

export const normalizeMentorBatches = (payload, mentorIds = []) => uniqueById(listRows(payload, "batches")
  .filter((row) => present(batchIdOf(row)) && belongsToMentor(row, mentorIds))
  .map((row) => ({
    ...row,
    id: String(batchIdOf(row)),
    name: String(batchNameOf(row) ?? batchIdOf(row)),
    courseId: present(courseIdOf(row)) ? String(courseIdOf(row)) : "",
    courseName: courseNameOf(row) ?? "",
  })));

// Courses from the courses endpoint, plus any course a batch assigned to this
// mentor names (the batches endpoint is the assignment record either way).
export const normalizeMentorCourses = (payload, batches = [], mentorIds = []) => {
  const listed = listRows(payload, "courses")
    .filter((row) => present(row?.courseId ?? row?.id) && belongsToMentor(row, mentorIds))
    .map((row) => ({ ...row, id: String(row.courseId ?? row.id), name: String(row.courseName ?? row.name ?? row.title ?? row.courseId ?? row.id) }));
  const fromBatches = batches
    .filter((batch) => batch.courseId && batch.courseName)
    .map((batch) => ({ id: batch.courseId, name: String(batch.courseName) }));
  return uniqueById([...listed, ...fromBatches]);
};

// A batch matches a course by id, or by name when the batch row has no course
// id. A batch naming neither cannot be verified and is never offered.
export const batchesForCourse = (batches, course) => {
  if (!course) return [];
  return batches.filter((batch) => (batch.courseId
    ? batch.courseId === String(course.id)
    : Boolean(batch.courseName) && key(batch.courseName) === key(course.name)));
};

export const findById = (items, id) => (present(id) ? items.find((item) => item.id === String(id)) : undefined);

export const getBatchMentorId = mentorIdOf;

// Module options for one batch: a module completed in that batch stays listed
// but is marked completed (the dialog disables it). Completion in another
// batch does not count. Without a batch nothing is marked.
// `completionVerified` is true only when every module has an explicit record
// for the batch; otherwise completion is unknown, never assumed incomplete.
export const modulesForBatch = (modules, batchId) => {
  const batch = present(batchId) ? String(batchId) : "";
  const options = (modules?.options ?? []).map((option) => {
    const completed = Boolean(batch) && (option.completedBatchIds ?? []).includes(batch);
    return completed ? { ...option, completed, label: `${option.label} (Completed)` } : option;
  });
  const completionVerified = Boolean(batch) && options.length > 0
    && options.every((option) => (option.trackedBatchIds ?? []).includes(batch));
  return { ...modules, options, completionVerified, allCompleted: options.length > 0 && options.every((option) => option.completed) };
};

export const isModuleCompletedForBatch = (modules, moduleId, batchId) => Boolean(present(moduleId) && present(batchId)
  && modulesForBatch(modules, batchId).options.find((option) => option.value === String(moduleId))?.completed);
