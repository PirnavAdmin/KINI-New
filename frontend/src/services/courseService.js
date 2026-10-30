import apiClient from "@shared/services/apiClient";
import { getApiErrorMessage, getListPayload, getPayload } from "@shared/services/apiServices";
import { ENROLLED_COURSES } from "@shared/data/studentMockData";
import { API_ENDPOINTS } from "@/api/endpoints";

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

export const courseService = {
  async getCourses() {
    const response = await apiClient.get("/api/v1/courses");
    return getListPayload(response).map(normalizeCourse);
  },

  async getStudentCourses() {
    const response = await apiClient.get(API_ENDPOINTS.student.courses, {
      skipAuthRedirect: true,
    });
    return getStudentCourseRows(response).map(normalizeCourse);
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
