import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getListPayload, getPayload } from "./apiServices";

const getCourseId = (course = {}) => course.courseId ?? course.id;
const getMaterialId = (course = {}) => course.materialId ?? course.documentId ?? course.courseMaterialId ?? course.id ?? course.courseId;
const getPdfUrl = (course = {}) => course.pdfUrl
  ?? course.coursePdfUrl
  ?? course.pdfFileUrl
  ?? course.documentUrl
  ?? course.fileUrl
  ?? course.materialUrl
  ?? null;

const toMaterial = (course = {}) => ({
  ...course,
  id: getMaterialId(course),
  materialId: getMaterialId(course),
  courseId: getCourseId(course),
  title: course.pdfFileName ?? course.fileName ?? `${course.courseName ?? course.name ?? "Course"} material`,
  courseName: course.courseName ?? course.name ?? course.title ?? "Untitled course",
  materialType: "PDF",
  resourceUrl: getPdfUrl(course),
  uploadedBy: course.uploadedBy ?? course.updatedBy ?? "—",
});

const loadCourses = (params = {}) => apiClient.get(API_ENDPOINTS.courses.base, {
  params: { page: 1, pageSize: 1000, ...params },
}).then(getListPayload);

const readPdf = async (response) => {
  const blob = response.data;
  if (!(blob instanceof Blob) || await blob.slice(0, 5).text() !== "%PDF-") {
    throw new Error("The server did not return a valid course PDF.");
  }
  return blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
};

export const courseMaterialService = {
  // Course PDFs belong to the Courses API. The old /organization/course-materials
  // URL was interpreted by the backend as /organization/{id}.
  list: async (params = {}) => {
    const courses = await loadCourses({ search: params.search });
    return courses.filter((course) => getPdfUrl(course)).map(toMaterial);
  },
  create: async (body, onUploadProgress) => {
    const courseId = body.get("courseId");
    const file = body.get("file");
    const upload = new FormData();
    upload.append("file", file);
    return apiClient.post(API_ENDPOINTS.courses.uploadPdf(courseId), upload, {
      // Let the browser add the multipart boundary automatically.
      headers: { Accept: "application/json" },
      timeout: 120000,
      onUploadProgress,
    }).then(getPayload);
  },
  file: async (material = {}) => {
    if (typeof material === "string") material = { resourceUrl: material };
    const courseId = material.courseId ?? material.courseID;
    const resourceUrl = material.resourceUrl ?? material.pdfUrl ?? material.fileUrl;
    if (!courseId && !resourceUrl) throw new Error("This material does not have an uploaded file.");

    // The selected record's document takes precedence over a course-level PDF.
    // Never substitute another document after a failed request.
    if (resourceUrl) {
      return apiClient.get(resourceUrl, { responseType: "blob" }).then(readPdf);
    }
    return apiClient.get(API_ENDPOINTS.courses.pdf(courseId), {
      headers: { Accept: "application/pdf" },
      responseType: "blob",
    }).then(readPdf);
  },
  courses: () => loadCourses({ status: true }),
};
