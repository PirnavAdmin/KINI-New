import { enrollmentErrorText } from "./enrollmentErrors";

export const enrollmentId = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? String(number) : "";
};
const pairOf = (row) => `${enrollmentId(row.courseId)}:${enrollmentId(row.batchId)}`;
const profileFields = (profile) => ({
  firstName: String(profile.firstName ?? "").trim(),
  lastName: String(profile.lastName ?? "").trim(),
  email: String(profile.email ?? "").trim().toLowerCase(),
  phone: String(profile.phone ?? profile.mobile ?? "").trim(),
});

/** The primary assignment is stored separately from additional StudentBatch rows. */
export function existingStudentEnrollments(profile, enrollments, batches = []) {
  const batchById = new Map(batches.map(batch => [enrollmentId(batch.batchId ?? batch.id), batch]));
  const rows = new Map();
  const add = (item) => {
    const batchId = enrollmentId(item.batchId ?? item.batch?.batchId ?? item.batch?.id);
    const batch = batchById.get(batchId);
    const courseId = enrollmentId(item.courseId ?? item.course?.courseId ?? item.course?.id ?? batch?.courseId);
    if (!courseId || !batchId) throw new Error("An existing assignment is missing its course or batch ID. No enrollment changes can be made until it can be verified.");
    const key = `${courseId}:${batchId}`;
    if (!rows.has(key)) rows.set(key, {
      courseId, batchId, existing: true,
      courseName: item.courseName ?? item.course?.courseName ?? batch?.courseName ?? `Course #${courseId}`,
      batchName: item.batchName ?? item.batch?.batchName ?? batch?.batchName ?? `Batch #${batchId}`,
    });
  };
  if (enrollmentId(profile.courseId) || enrollmentId(profile.batchId)) add(profile);
  enrollments.forEach(add);
  return [...rows.values()];
}

/** Recheck before every write and confirm ambiguous POST results before retrying.
 * No endpoint in the current contract removes or replaces additional enrollments. */
export async function saveStudentEdit({ studentId, initialEnrollments, values, api, onSave, onConfirmed, onRefresh }) {
  const initialPairs = new Set(initialEnrollments.map(pairOf));
  const initialCourses = new Set(initialEnrollments.map(row => enrollmentId(row.courseId)));
  const selectedPairs = new Set(values.enrollments.filter(row => row.existing).map(pairOf));
  if (initialPairs.size !== selectedPairs.size || [...initialPairs].some(pair => !selectedPairs.has(pair))) {
    throw new Error("Existing enrollments must remain unchanged. This form only adds new courses.");
  }
  const additions = values.enrollments.filter(row => !row.existing);
  const selectedCourses = new Set(initialCourses);
  for (const row of additions) {
    const courseId = enrollmentId(row.courseId);
    if (!courseId || !enrollmentId(row.batchId)) throw new Error("Select a valid course and batch.");
    if (selectedCourses.has(courseId)) throw new Error("This course is already enrolled or selected. Choose another course.");
    selectedCourses.add(courseId);
  }
  const readCurrent = async () => {
    const [profileResult, enrollmentResult] = await Promise.all([api.getById(studentId), api.getEnrollments(studentId)]);
    const profile = profileResult.data;
    if (enrollmentId(profile.studentId ?? profile.id) !== enrollmentId(studentId)) throw new Error("The student response does not match the student being edited.");
    return { profile, enrollments: existingStudentEnrollments(profile, enrollmentResult.data) };
  };
  let current;
  try { current = await readCurrent(); }
  catch (error) { throw new Error(`Unable to verify current enrollments. No changes were submitted. ${error.message}`, { cause: error }); }
  // Reject conflicting assignments before writing even the personal details.
  for (const row of additions) {
    if (current.enrollments.some(item => item.courseId === enrollmentId(row.courseId) && item.batchId !== enrollmentId(row.batchId))) {
      throw new Error("Already enrolled in this course in another batch. Existing assignments were preserved.");
    }
  }
  let changed = false;
  try {
    const details = profileFields(values);
    const original = profileFields(current.profile);
    if (Object.keys(details).some(key => details[key] !== original[key])) {
      const courseId = enrollmentId(current.profile.courseId);
      const batchId = enrollmentId(current.profile.batchId);
      if (!courseId || !batchId) throw new Error("The primary assignment could not be verified. Student details were not updated.");
      await onSave({ ...details, courseId: Number(courseId), batchId: Number(batchId) }, studentId);
      changed = true;
    }
    for (const row of additions) {
      // A failed verification never becomes permission to submit a duplicate.
      current = await readCurrent();
      const existing = current.enrollments.find(item => item.courseId === enrollmentId(row.courseId));
      if (existing) {
        if (existing.batchId !== enrollmentId(row.batchId)) throw new Error("Already enrolled in this course in another batch.");
        changed = true; // Refresh a previously committed attempt that is now confirmed.
        onConfirmed?.(row);
        continue;
      }
      changed = true; // Also refresh after an ambiguous network response.
      let postError;
      try { await api.enrollInBatch(studentId, row.batchId); }
      catch (error) { postError = error; }
      let after;
      try { after = await readCurrent(); }
      catch { throw new Error("Couldn't confirm the enrollment. Your entries are preserved; retry checks the backend before sending anything again."); }
      if (!after.enrollments.some(item => pairOf(item) === pairOf(row))) {
        throw new Error(postError ? enrollmentErrorText(postError) : "The backend accepted the request but did not save this enrollment.");
      }
      onConfirmed?.(row);
    }
  } finally {
    if (changed) {
      window.dispatchEvent(new CustomEvent("kini:student-updated", { detail: { studentId } }));
      await onRefresh?.();
    }
  }
}
