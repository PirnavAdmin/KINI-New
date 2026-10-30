/**
 * The enrollment draft (localStorage `kini:enrollment:draft`) carries the course
 * being purchased, the student's entered details and, once the backend has
 * verified payment, the receipt — so a refresh on /enrollment keeps its state.
 * The same key is already written by the course cards and curriculum page.
 */
export const ENROLLMENT_DRAFT_KEY = "kini:enrollment:draft";

export const readEnrollmentDraft = () => {
  try {
    const draft = JSON.parse(localStorage.getItem(ENROLLMENT_DRAFT_KEY) || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
};

export const writeEnrollmentDraft = (draft) => {
  try {
    localStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Unable to save the enrollment draft", error);
  }
  return draft;
};

export const updateEnrollmentDraft = (patch) =>
  writeEnrollmentDraft({ ...(readEnrollmentDraft() || {}), ...patch });

export const clearEnrollmentDraft = () => {
  try {
    localStorage.removeItem(ENROLLMENT_DRAFT_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
};

/** A course can be paid for only with a real backend id and a positive price. */
export const isPurchasableCourse = (course) => {
  const price = Number(course?.price);
  return course?.id !== undefined && course?.id !== null && String(course.id).trim() !== ""
    && Number.isFinite(price) && price > 0;
};

/** Form field holding the chosen batch for one course (one per purchased course). */
export const batchFieldName = (courseId) => `batch_${String(courseId).replace(/[^A-Za-z0-9_]/g, "_")}`;
