import apiClient from "./apiClient";
import { getListPayload, getPayload } from "./apiServices";
import { courseService } from "./courseService";
import { batchService } from "./batchService";

const BASE = "/api/v1/organization/tutors";
const MENTOR_LIST_ENDPOINT = "/api/v1/organization/mentors";
const id = (value) => encodeURIComponent(value);
const syllabusCache = new Map();

const syllabusFor = async (courseId) => {
  const key = String(courseId);
  if (!syllabusCache.has(key)) syllabusCache.set(key, courseService.getSyllabus(courseId));
  try {
    return await syllabusCache.get(key);
  } catch (error) {
    syllabusCache.delete(key);
    throw error;
  }
};

const syllabusModules = (syllabus = {}) => (syllabus?.modules ?? syllabus?.data?.modules ?? []).map((module, index) => ({
  ...module,
  id: module.moduleId ?? module.id ?? module.moduleNumber ?? index + 1,
  moduleId: module.moduleId ?? module.id ?? module.moduleNumber ?? index + 1,
  moduleName: module.moduleName ?? module.name ?? `Module ${index + 1}`,
}));
const moduleListPayload = (response) => {
  const payload = response?.data ?? response;
  const modules = payload?.modules ?? payload?.data?.modules ?? payload?.result?.modules
    ?? payload?.syllabus?.modules ?? payload?.course?.modules;
  if (Array.isArray(modules)) return modules;
  return getListPayload(response);
};

const payload = (tutor = {}) => {
  const names = String(tutor.name ?? "").trim().split(/\s+/);
  return {
    firstName: tutor.firstName ?? names[0] ?? "",
    lastName: tutor.lastName ?? names.slice(1).join(" "),
    email: tutor.email,
    phone: tutor.mobile ?? tutor.phone,
    alternatePhone: tutor.alternatePhone,
    address: tutor.address,
    qualification: tutor.qualification,
    experience: tutor.experience ? Number(tutor.experience) : undefined,
    expertise: tutor.skills,
    specialization: tutor.specialization,
    joiningDate: tutor.joiningDate,
    employmentType: tutor.type,
    department: tutor.department,
    designation: tutor.designation,
    status: tutor.active ? "Active" : "Inactive",
    createLogin: tutor.active,
    permissions: tutor.permissions,
    profilePhoto: tutor.profilePhoto ?? tutor.photoUrl ?? tutor.avatarUrl,
  };
};

export const tutorService = {
  // Mentor Management uses the organization-scoped mentor catalogue. Keep
  // the legacy tutor endpoints below for existing create/edit/assignment
  // actions until matching mentor CRUD endpoints are exposed.
  list: (params = {}) => apiClient.get(MENTOR_LIST_ENDPOINT, {
    params: {
      Search: params.Search ?? params.search ?? params.searchText,
      Status: params.Status ?? params.status,
      SortBy: params.SortBy ?? params.sortBy ?? "MentorName",
      IsDescending: params.IsDescending ?? params.isDescending ?? false,
      PageNumber: params.PageNumber ?? params.pageNumber ?? params.page ?? 1,
      PageSize: params.PageSize ?? params.pageSize ?? 1000,
    },
  }).then(getListPayload),
  get: (tutorId) => apiClient.get(`${BASE}/${id(tutorId)}`).then(getPayload),
  create: (tutor) => apiClient.post(BASE, payload(tutor)).then(getPayload),
  update: (tutorId, tutor) => apiClient.put(`${BASE}/${id(tutorId)}`, payload(tutor)).then(getPayload),
  deactivate: (tutorId) => apiClient.put(`${BASE}/${id(tutorId)}`, { status: "Inactive" }).then(getPayload),
  setStatus: (tutorId, status) => apiClient.put(`${BASE}/${id(tutorId)}`, { status }).then(getPayload),
  assignments: (tutorId) => apiClient.get(`${BASE}/${id(tutorId)}/assignments`).then(getListPayload),
  availability: async (tutorId, params = {}) => {
    try {
      const result = await apiClient
        .get(`${BASE}/${id(tutorId)}/availability`, { params })
        .then(getPayload);
      // A successful availability request may return 204/empty content.
      // Treat that as "no conflict" so the workflow can continue.
      return result && typeof result === "object"
        ? result
        : {
            available: true,
            hasConflict: false,
            message: "No schedule conflict was reported for this mentor.",
          };
    } catch (error) {
      // Some backend versions expose mentors as employees but do not expose
      // the legacy tutor availability route. In that case, verify that the
      // selected batch belongs to this mentor through the supported endpoint.
      if (![404, 405].includes(error?.response?.status)) throw error;
      const batches = await apiClient
        .get(`/api/v1/organization/employees/${id(tutorId)}/batches`)
        .then(getListPayload);
      let selectedBatch = batches.find((batch) => String(
        batch.batchId ?? batch.BatchId ?? batch.id ?? batch.Id
      ) === String(params.batchId));

      // The mentor-batches response differs between backend versions. Verify
      // the authoritative batch record before reporting a false conflict.
      if (!selectedBatch && params.batchId != null) {
        const batch = await apiClient
          .get(`/api/v1/organization/batches/${id(params.batchId)}`)
          .then(getPayload);
        const assignedMentorId = batch?.mentorId ?? batch?.MentorId
          ?? batch?.tutorId ?? batch?.TutorId ?? batch?.trainerId
          ?? batch?.mentor?.mentorId ?? batch?.mentor?.employeeId
          ?? batch?.mentor?.id;
        if (String(assignedMentorId) === String(tutorId)) selectedBatch = batch;
      }

      if (!selectedBatch) {
        return {
          available: true,
          hasConflict: false,
          message: "Availability verification is not supported by this server. You can continue with the assignment.",
        };
      }

      return {
        available: true,
        hasConflict: false,
        message: "Mentor is assigned to this batch and is available for this assignment.",
      };
    }
  },
  createCredentials: (tutorId) => apiClient.post(`${BASE}/${id(tutorId)}/credentials`).then(getPayload),
  sendCredentials: (tutorId) => apiClient.post(`${BASE}/${id(tutorId)}/send-credentials`).then(getPayload),
  assign: async (assignment) => {
    const response = await apiClient.post("/api/v1/organization/tutor-assignments", assignment);
    if (response.data?.success === false) {
      throw Object.assign(new Error(response.data.message || 'Unable to assign this mentor.'), { response });
    }
    return getPayload(response);
  },
  courses: () => courseService.getCourses({ page: 1, pageSize: 1000 }).then((page) => page.data).then((courses) => courses.filter((course) =>
    course?.status === undefined
    || course.status === true
    || String(course.status).trim().toLowerCase() === "active"
  )),
  // Modules straight from GET .../courses/{courseId}/syllabus (data.modules).
  // The backend has no .../courses/{courseId}/modules route, so modules()
  // below always 404s first on this backend before falling back to this.
  courseSyllabusModules: async (courseId) => syllabusModules(await syllabusFor(courseId)),
  modules: async (courseId) => {
    try {
      return await apiClient.get(`/api/v1/organization/courses/${id(courseId)}/modules`).then(moduleListPayload);
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      return syllabusModules(await syllabusFor(courseId));
    }
  },
  createModule: (courseId, payload) => apiClient.post(`/api/v1/organization/courses/${id(courseId)}/modules`, payload).then(getPayload),
  subjects: async (courseId, moduleId) => {
    try {
      return await apiClient.get(`/api/v1/organization/courses/${id(courseId)}/modules/${id(moduleId)}/subjects`).then(getListPayload);
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      const modules = syllabusModules(await syllabusFor(courseId));
      const module = modules.find((item) => String(item.moduleId ?? item.id) === String(moduleId));
      return (module?.subjects ?? module?.topics ?? []).map((subject, index) => ({
        ...subject,
        id: subject.subjectId ?? subject.topicId ?? subject.id ?? subject.topicNumber ?? index + 1,
        subjectId: subject.subjectId ?? subject.topicId ?? subject.id ?? subject.topicNumber ?? index + 1,
        subjectName: subject.subjectName ?? subject.topicName ?? subject.name ?? `Subject ${index + 1}`,
      }));
    }
  },
  createSubject: (courseId, moduleId, payload) => apiClient.post(`/api/v1/organization/courses/${id(courseId)}/modules/${id(moduleId)}/subjects`, payload).then(getPayload),
  createSession: (courseId, moduleId, subjectId, payload) => apiClient.post(`/api/v1/organization/courses/${id(courseId)}/modules/${id(moduleId)}/subjects/${id(subjectId)}/sessions`, payload).then(getPayload),
  batches: async (courseId, courseName = "") => {
    const normalizeName = (value) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const selectedCourseName = normalizeName(courseName);
    const matchesCourse = (batch) => String(
      batch.courseId ?? batch.CourseId ?? batch.courseID
      ?? batch.course?.courseId ?? batch.course?.CourseId ?? batch.course?.id
      ?? batch.Course?.courseId ?? batch.Course?.id ?? "",
    ) === String(courseId) || (
      selectedCourseName
      && normalizeName(batch.courseName ?? batch.CourseName ?? batch.course?.courseName ?? batch.course?.name ?? batch.Course?.name) === selectedCourseName
    ) || (
      // Some batch responses expose only the generated batch name (for
      // example, "AL&ML 1") and omit courseId/courseName.
      selectedCourseName
      && normalizeName(batch.batchName ?? batch.BatchName ?? batch.name ?? batch.Name).startsWith(selectedCourseName)
    );
    const normalizeBatch = (batch) => {
      const batchId = batch.batchId ?? batch.BatchId ?? batch.id ?? batch.Id;
      const batchName = batch.batchName ?? batch.BatchName ?? batch.name ?? batch.Name;
      return { ...batch, id: batchId, batchId, name: batchName, batchName };
    };

    let batches = [];
    try {
      batches = await apiClient
        .get("/api/v1/organization/batches", { params: { courseId, pageNumber: 1, pageSize: 1000 } })
        .then(getListPayload);
    } catch (error) {
      if (![400, 404, 405].includes(error?.response?.status)) throw error;
    }

    // Some API versions ignore courseId query parameters. Use the complete
    // organization list when the filtered response is empty or ambiguous.
    let matching = batches.filter(matchesCourse);
    if (!matching.length) {
      const page = await batchService.getOrganizationBatches({ pageSize: 1000 });
      const allBatches = page?.data ?? page?.items ?? page ?? [];
      matching = (Array.isArray(allBatches) ? allBatches : []).filter(matchesCourse);
    }
    return matching.map(normalizeBatch);
  },
};

export default tutorService;
