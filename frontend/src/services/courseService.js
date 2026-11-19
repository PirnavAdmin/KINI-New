import apiClient from "@shared/services/apiClient";
import { getApiErrorMessage, getListPayload, getPayload } from "@shared/services/apiServices";
import { ENROLLED_COURSES } from "@shared/data/studentMockData";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getUserProfile, resolveUserId } from "@/services/profileService";
import { studentsApi } from "@/api/students";
import { batchService } from "@shared/services/batchService";

const COURSE_PROGRESS_KEY = "studentCourseProgress";

export const fallbackCourses = ENROLLED_COURSES.map((course) => ({
  ...course,
  duration: course.duration ?? course.totalDuration,
}));

export const getStoredProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
};

export const saveStoredProgress = (progress) => {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  return progress;
};

export const getCourseProgress = (courseId) => {
  const allProgress = getStoredProgress();
  return allProgress[courseId] || {
    watchedVideos: [],
    completedVideos: [],
    attemptedQuestionIds: [],
    score: 0,
    resultStatus: "not-started",
    unlockedClassId: "sec-1",
    passedClassIds: [],
    attempts: {},
  };
};

export const updateCourseProgress = (courseId, updater) => {
  const allProgress = getStoredProgress();
  const current = getCourseProgress(courseId);
  const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  allProgress[courseId] = next;
  saveStoredProgress(allProgress);
  return next;
};

export const normalizeCourse = (course) => {
  const id = course.id ?? course.courseId ?? course.slug;
  return {
    ...course,
    id,
    courseId: course.courseId ?? id,
    title: course.title ?? course.courseTitle ?? course.courseName ?? course.name ?? "Untitled Course",
    description: course.description ?? course.summary ?? "",
    category: course.category ?? course.courseCategory ?? (course.categoryId ? `Category ${course.categoryId}` : ""),
    instructor: course.instructor ?? course.instructorName ?? course.faculty ?? "",
    status: course.status ?? course.courseStatus ?? "",
    thumbnail: course.thumbnail ?? course.thumbnailUrl ?? course.imageUrl ?? course.image ?? "",
    level: course.level ?? course.difficulty ?? "",
    rating: course.rating ?? course.averageRating ?? "",
    duration: course.duration ?? course.totalDuration,
    classes: course.classes ?? course.modules ?? [],
  };
};

export const normalizeErrorMessage = (error) => {
  if (!error?.response && error?.message === "Network Error") {
    return "We could not reach the courses server right now. Showing demo course flow so you can continue.";
  }
  return getApiErrorMessage(error, "Unable to load courses. Please try again in a moment.");
};

// GET /api/v1/student/courses answers { success, studentId, courses: [...] }.
// A rejected or unrecognized body is an error, never an empty enrollment list,
// so callers can tell "no enrollments" apart from "couldn't load them".
const isEnrollmentRow = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value)
  && (value.courseId != null || value.batchId != null || value.courseName != null));

export const getStudentCourseRows = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (payload?.success === false || payload?.Success === false) {
    const error = new Error(payload.message ?? payload.Message ?? "Unable to load your course enrollments.");
    error.response = { status: response?.status, data: payload };
    throw error;
  }
  for (const list of [payload?.courses, payload?.data, payload?.data?.courses]) {
    if (Array.isArray(list)) return list;
    if (isEnrollmentRow(list)) return [list];
  }
  throw new Error("The course service returned an unrecognized response.");
};

// Enrollment responses can omit mentor fields. The student's own batch roster
// supplies the assignment; never look up a mentor from another course.
const withBatchMentors = async (rows) => {
  const requests = new Map();
  let mentorOptions;
  return Promise.all(rows.map(async (row) => {
    const batchId = row.batchId ?? row.batch?.batchId ?? row.batch?.id;
    const existingName = row.mentorName || row.assignedMentorName || row.tutorName || row.mentor?.name || row.batch?.mentorName;
    if (!batchId || existingName) return normalizeCourse(row);
    if (!requests.has(String(batchId))) requests.set(String(batchId), (async () => {
      const [roster] = await Promise.allSettled([batchService.getStudents(batchId)]);
      const sources = [roster].filter((result) => result.status === 'fulfilled').map((result) => result.value?.data ?? result.value ?? {});
      return Object.assign({}, ...sources.map((source) => Object.fromEntries(Object.entries(source).filter(([, value]) => value != null && value !== ''))));
    })());
    const batch = await requests.get(String(batchId));
    if (!batch) return normalizeCourse(row);
    const merged = {
      ...row,
      mentorId: row.mentorId || batch.mentorId || batch.tutorId || batch.mentor?.mentorId || batch.mentor?.id,
      mentorName: row.mentorName || batch.mentorName || batch.assignedMentorName || batch.trainerName || batch.tutorName || batch.mentor?.mentorName || batch.mentor?.name || batch.mentor?.fullName,
      mentorEmail: row.mentorEmail || batch.mentorEmail || batch.mentor?.email,
    };
    if (!merged.mentorName && merged.mentorId) {
      // A batch may supply only MentorId. Resolve that exact ID, never the
      // first mentor or a mentor selected by a matching course name.
      mentorOptions ??= apiClient.get(API_ENDPOINTS.liveClassDropdowns.mentors, { skipAuthRedirect: true }).then(getListPayload).catch(() => []);
      const mentor = (await mentorOptions).find((item) => String(item.mentorId ?? item.id ?? item.value) === String(merged.mentorId));
      if (mentor) merged.mentorName = mentor.mentorName || mentor.fullName || mentor.name || mentor.label || [mentor.firstName, mentor.lastName].filter(Boolean).join(' ');
    }
    return normalizeCourse(merged);
  }));
};

export const courseService = {
  async getCourses() {
    const response = await apiClient.get("/api/v1/courses");
    return getListPayload(response).map(normalizeCourse);
  },

  async getStudentCourses() {
    const response = await apiClient.get(API_ENDPOINTS.student.courses, {
      skipAuthRedirect: true,
    });
    const rows = getStudentCourseRows(response);
    if (rows.length) return withBatchMentors(rows);

    // Some accounts are assigned through the organization student record,
    // before the token-scoped course list has been populated. Resolve only
    // this session's student ID; an Auth user ID is a different identifier.
    let session = {};
    try { session = JSON.parse(localStorage.getItem("user") || "{}"); } catch { /* no session */ }
    const userId = resolveUserId(session);
    let profile = {};
    if (userId) {
      try { profile = (await getUserProfile(userId)).raw ?? {}; } catch { /* use explicit session student ID */ }
    }
    const studentId = profile.studentId ?? profile.student?.studentId ?? session.studentId ?? session.StudentId ?? session.student?.studentId;
    if (!studentId) return [];
    // Read batch enrollments rather than the organization administration
    // endpoint, which is not the student portal's assignment resource.
    const result = await studentsApi.getEnrollments(studentId);
    return withBatchMentors(result.data);
  },

  async getStudentSyllabus() {
    const response = await apiClient.get(API_ENDPOINTS.student.courseSyllabus, {
      skipAuthRedirect: true,
    });
    return getPayload(response);
  },

  async getOrganizationSyllabus(courseId) {
    const response = await apiClient.get(API_ENDPOINTS.organization.courseSyllabus(courseId), {
      skipAuthRedirect: true,
    });
    return getPayload(response);
  },

  async getStudentCourse(courseId) {
    const response = await apiClient.get(`/api/v1/courses/${courseId}`);
    return normalizeCourse(getPayload(response));
  },

  async completeVideo(courseId, classId, videoId) {
    updateCourseProgress(courseId, (progress) => ({
      ...progress,
      watchedVideos: Array.from(new Set([...(progress.watchedVideos || []), videoId])),
      completedVideos: Array.from(new Set([...(progress.completedVideos || []), videoId])),
    }));

    return getCourseProgress(courseId);
  },
};

export const getFallbackCourse = () => null;

export default courseService;
