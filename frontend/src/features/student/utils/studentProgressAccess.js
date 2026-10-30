export const STUDENT_ACCESS_THRESHOLDS = Object.freeze({
  certificates: 70,
  jobPortal: 80,
});
export const STUDENT_ACCESS_THRESHOLD = STUDENT_ACCESS_THRESHOLDS.jobPortal;
export const STUDENT_PROGRESS_EVENT = "student-course-progress-updated";

const clampProgress = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const getStudentIdentity = () => {
  const directId = localStorage.getItem("userId");
  if (directId) return `id-${directId}`;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.userId || user?.id
      ? `id-${user.userId || user.id}`
      : `email-${String(user?.email || "student").trim().toLowerCase()}`;
  } catch {
    return "student";
  }
};

const getStorageKey = () => `studentCoursePercentages:${getStudentIdentity()}`;

export const getStoredCoursePercentages = () => {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey()) || "{}");
  } catch {
    return {};
  }
};

export const getCoursePercentage = (course = {}) => clampProgress(
  course.progress
    ?? course.progressPercentage
    ?? course.completionPercentage
    ?? course.completionPercent
    ?? course.percentComplete
    ?? (course.totalLessons
      ? (Number(course.completedLessons || 0) / Number(course.totalLessons)) * 100
      : 0)
);

export const saveStudentCoursePercentage = (courseId, percentage) => {
  if (!courseId) return getStudentAccessProgress();

  const percentages = getStoredCoursePercentages();
  percentages[String(courseId)] = clampProgress(percentage);
  localStorage.setItem(getStorageKey(), JSON.stringify(percentages));
  const progress = getStudentAccessProgress();
  window.dispatchEvent(new CustomEvent(STUDENT_PROGRESS_EVENT, { detail: { progress } }));
  return progress;
};

export const saveStudentCoursePercentages = (courses = []) => {
  if (!Array.isArray(courses) || courses.length === 0) return getStudentAccessProgress();

  const percentages = getStoredCoursePercentages();
  courses.forEach((course) => {
    const id = course?.courseId ?? course?.id ?? course?.slug;
    if (id) percentages[String(id)] = getCoursePercentage(course);
  });
  localStorage.setItem(getStorageKey(), JSON.stringify(percentages));
  const progress = getStudentAccessProgress();
  window.dispatchEvent(new CustomEvent(STUDENT_PROGRESS_EVENT, { detail: { progress } }));
  return progress;
};

export const getStudentAccessProgress = () => {
  const values = Object.values(getStoredCoursePercentages()).map(clampProgress);
  return values.length ? Math.max(...values) : 0;
};

export const hasStudentCareerAccess = (
  progress = getStudentAccessProgress(),
  requiredProgress = STUDENT_ACCESS_THRESHOLD,
) => clampProgress(progress) >= clampProgress(requiredProgress);
