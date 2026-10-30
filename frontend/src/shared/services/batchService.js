import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../../api/endpoints";
import {
  extractApiData,
  logApiError,
  logApiRequest,
  logApiSuccess,
  withPagedResponse,
} from "./apiModuleHelpers";

// The organization Batch controller exposes all CRUD operations under this
// route. `/api/Batch` belongs to an older API and returns 404 on create.
const BATCH_ENDPOINT = API_ENDPOINTS.organization.batches;
const batchEndpoint = (id) => API_ENDPOINTS.organization.batch(id);
const ORGANIZATION_BATCH_ENDPOINT = BATCH_ENDPOINT;
const DEFAULT_BATCH_CAPACITY = 25;
const mentorBatchRequests = new Map();

const normalizeCapacity = (batch = {}) => ({
  ...batch,
  configuredCapacity: batch.capacity ?? batch.maxStudents ?? null,
  capacity: Math.max(0, Number(batch.capacity ?? DEFAULT_BATCH_CAPACITY)),
});

const normalizeBatchPage = (response) => {
  const page = withPagedResponse(response);
  return { ...page, data: page.data.map(normalizeCapacity) };
};

const normalizeBatchStudentsResponse = (response, requestedBatchId) => {
  const source = response?.data?.data ?? response?.data ?? response ?? {};
  const students = Array.isArray(source)
    ? source
    : Array.isArray(source.students)
      ? source.students
      : [];
  const normalizedStudents = students.map((student) => ({
    ...student,
    id: student.studentId ?? student.id,
    studentId: student.studentId ?? student.id,
    name: student.name || [student.firstName, student.lastName].filter(Boolean).join(" "),
    batchId: student.batchId ?? source.batchId ?? requestedBatchId,
    status: student.status ?? "Active",
    attendance: Number(student.attendance ?? 0),
    assessmentsCleared: Number(student.assessmentsCleared ?? 0),
  }));
  const capacity = Number(source.capacity ?? 0);
  // This endpoint returns the complete roster. Keep every screen's count tied
  // to the actual rows instead of a stale aggregate stored on the batch.
  const enrolledStudents = normalizedStudents.length;
  return {
    batchId: source.batchId ?? requestedBatchId,
    batchName: source.batchName ?? "",
    courseName: source.courseName ?? "",
    capacity,
    enrolledStudents,
    availableSeats: Math.max(0, capacity - enrolledStudents),
    students: normalizedStudents,
  };
};

const normalizeAvailableStudentsResponse = (response) => {
  const source = response?.data?.data ?? response?.data ?? response ?? [];
  const students = Array.isArray(source)
    ? source
    : source.students ?? source.items ?? source.records ?? [];
  return (Array.isArray(students) ? students : []).map((student) => ({
    ...student,
    id: student.studentId ?? student.id,
    studentId: student.studentId ?? student.id,
    name: student.name || student.studentName || [student.firstName, student.lastName].filter(Boolean).join(" "),
    email: student.email ?? student.emailAddress ?? "",
  }));
};

const buildParams = (params = {}) => ({
  organizationId: params.organizationId ?? params.orgId ?? undefined,
  search: params.search ?? params.searchText ?? undefined,
  status: params.status ?? undefined,
  pageNumber: params.pageNumber ?? params.page ?? 1,
  pageSize: params.pageSize ?? 10,
});

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload);
  try {
    const response = await executor();
    logApiSuccess(response);
    const body = extractApiData(response);
    if (body?.success === false) {
      const error = new Error(body.message || "The batch request was rejected.");
      error.response = { status: response.status, data: body };
      throw error;
    }
    return body;
  } catch (error) {
    logApiError(error);
    throw error;
  }
};

const toApiDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

// Swagger: CreateBatchDto / UpdateBatchDto are exactly { batchName, courseId,
// mentorId, batchType, startDate, endDate, capacity, description, status }
// with additionalProperties: false — any other field (shift, scheduleDays,
// startTime, endTime) makes POST/PUT /api/v1/organization/batches return 400.
// Schedule days/times stay UI metadata until the backend exposes fields for
// them. batchType and status must be BatchType / BatchStatus enum names.
const BATCH_TYPES = { online: "Online", offline: "Offline", classroom: "Offline", hybrid: "Hybrid" };
const BATCH_STATUSES = { upcoming: "Upcoming", planned: "Upcoming", active: "Active", completed: "Completed", cancelled: "Cancelled", canceled: "Cancelled" };
const enumName = (map, value, fallback) => {
  const text = String(value ?? "").trim();
  return map[text.toLowerCase()] ?? (text || fallback);
};

const toBatchPayload = (payload = {}) => ({
  batchName: String(payload.batchName || payload.name || "").trim(),
  courseId: Number(
    payload.courseId ?? payload.course?.courseId ?? payload.course?.id,
  ),
  mentorId: Number(
    payload.mentorId ??
      payload.trainerId ??
      payload.mentor?.mentorId ??
      payload.mentor?.id,
  ),
  batchType: enumName(BATCH_TYPES, payload.batchType || payload.mode, "Online"),
  startDate: toApiDateTime(payload.startDate),
  endDate: toApiDateTime(payload.endDate),
  capacity: Math.max(1, Number(payload.capacity || DEFAULT_BATCH_CAPACITY)),
  description: String(payload.description || "").trim(),
  status: enumName(BATCH_STATUSES, payload.status, "Upcoming"),
});

export const batchService = {
  getAll: async (params = {}) => {
    const query = buildParams(params);
    const response = await sendRequest(
      "GET",
      BATCH_ENDPOINT,
      () => apiClient.get(BATCH_ENDPOINT, { params: query }),
      query,
    );
    return normalizeBatchPage(response);
  },
  getById: async (id, { raw = false, signal } = {}) => {
    const response = await sendRequest(
      "GET",
      batchEndpoint(id),
      () => apiClient.get(batchEndpoint(id), signal ? { signal } : undefined),
      { id },
    );
    const batch = response?.data ?? response;
    return raw ? batch : normalizeCapacity(batch);
  },
  // Log the mapped body, i.e. exactly what the API receives.
  create: async (payload) => {
    const body = toBatchPayload(payload);
    return sendRequest("POST", BATCH_ENDPOINT, () => apiClient.post(BATCH_ENDPOINT, body), body);
  },
  update: async (id, payload) => {
    const body = toBatchPayload(payload);
    return sendRequest("PUT", batchEndpoint(id), () => apiClient.put(batchEndpoint(id), body), { id, ...body });
  },
  remove: async (id) =>
    sendRequest(
      "DELETE",
      batchEndpoint(id),
      () => apiClient.delete(batchEndpoint(id)),
      { id },
    ),
  // The API currently exposes batch DELETE only. Surface relational constraint
  // responses in plain language so an enrolled roster is not mistaken for an
  // unknown database failure and users know what to resolve.
  deleteWithDetails: async (id) => {
    try {
      return await batchService.remove(id);
    } catch (error) {
      const status = Number(error?.response?.status);
      const details = [error?.response?.data?.message, error?.response?.data?.title, error?.response?.data?.detail, error?.message]
        .filter(Boolean).join(" ");
      if ([409, 500].includes(status) && /foreign key|constraint|student.?batch|enroll|reference/i.test(details)) {
        const conflict = new Error("This batch still has enrolled students or related records. Reassign or remove those records before deleting the batch.");
        conflict.cause = error;
        throw conflict;
      }
      throw error;
    }
  },
  getStudents: async (batchId, { raw = false, signal } = {}) => {
    if (batchId === undefined || batchId === null || String(batchId).trim() === "") {
      throw new Error("Batch ID is required to load students.");
    }
    const endpoint = API_ENDPOINTS.studentBatch.students(batchId);
    const response = await sendRequest(
      "GET",
      endpoint,
      () => apiClient.get(endpoint, signal ? { signal } : undefined),
      { batchId },
    );
    return raw ? response : normalizeBatchStudentsResponse(response, batchId);
  },
  getOrganizationBatches: async (params = {}) => {
    const query = buildParams(params);
    const response = await sendRequest(
      "GET",
      ORGANIZATION_BATCH_ENDPOINT,
      () => apiClient.get(ORGANIZATION_BATCH_ENDPOINT, { params: query }),
      query,
    );
    return normalizeBatchPage(response);
  },
  getSummary: async (params = {}) => sendRequest(
    "GET",
    API_ENDPOINTS.organization.batchSummary,
    () => apiClient.get(API_ENDPOINTS.organization.batchSummary, { params }),
    params,
  ).then(response => response?.data ?? response),
  export: async (params = {}) => apiClient.get(API_ENDPOINTS.organization.batchExport, {
    params,
    responseType: "blob",
  }).then((response) => response.data),
  assignStudents: async (payload) => {
    const assignment = {
      batchId: Number(payload?.batchId),
      studentId: Number(payload?.studentId),
    };
    if (!Number.isInteger(assignment.batchId) || assignment.batchId <= 0 || !Number.isInteger(assignment.studentId) || assignment.studentId <= 0) {
      throw new Error("A valid batch ID and student ID are required.");
    }
    const endpoint = API_ENDPOINTS.studentBatch.base;
    return sendRequest('POST', endpoint, () => apiClient.post(endpoint, { batchId: assignment.batchId, studentIds: [assignment.studentId] }), assignment);
  },
  getAvailableStudents: async (batchId) => {
    if (batchId === undefined || batchId === null || String(batchId).trim() === "") {
      throw new Error("Batch ID is required to load available students.");
    }
    const endpoint = API_ENDPOINTS.studentBatch.availableStudents(batchId);
    const response = await sendRequest(
      "GET",
      endpoint,
      () => apiClient.get(endpoint),
      { batchId },
    );
    return normalizeAvailableStudentsResponse(response);
  },
  getMentorBatches: async (employeeOrMentorId) => {
    if (employeeOrMentorId === undefined || employeeOrMentorId === null || String(employeeOrMentorId).trim() === "") {
      throw new Error("Employee or mentor ID is required to load assigned batches.");
    }
    const requestId = String(employeeOrMentorId).trim();
    if (mentorBatchRequests.has(requestId)) return mentorBatchRequests.get(requestId);

    const request = (async () => {
      const endpoint = API_ENDPOINTS.organization.mentorBatches(requestId);
      const response = await sendRequest(
        "GET",
        endpoint,
        () => apiClient.get(endpoint),
        { employeeOrMentorId: requestId },
      );
      const payload = response?.data?.data ?? response?.data ?? response;
      let batches = Array.isArray(payload)
        ? payload
        : payload?.batches ?? payload?.items ?? payload?.records ?? [];
      batches = batches.map((batch) => ({
        ...batch,
        batchId: batch.batchId ?? batch.id,
        batchName: batch.batchName ?? batch.name,
        courseName: batch.courseName ?? batch.course?.courseName ?? batch.course?.name,
        studentCount: Number(batch.studentCount ?? batch.studentsCount ?? batch.enrolledStudents ?? 0),
        capacity: Number(batch.capacity ?? 25),
      }));
      // StudentBatch is the authoritative roster. Enrich every assigned batch so
      // mentor cards, totals and the workspace all display the same student count.
      const rosterResults = await Promise.allSettled(
        batches.map((batch) => batchService.getStudents(batch.batchId)),
      );
      batches = batches.map((batch, index) => {
        const rosterResult = rosterResults[index];
        if (rosterResult?.status !== "fulfilled") return batch;
        const roster = rosterResult.value;
        return {
          ...batch,
          studentCount: roster.students.length,
          enrolledStudents: roster.students.length,
          capacity: Number(roster.capacity || batch.capacity || DEFAULT_BATCH_CAPACITY),
          availableSeats: Number(
            roster.availableSeats ?? Math.max(0, Number(batch.capacity || DEFAULT_BATCH_CAPACITY) - roster.students.length),
          ),
        };
      });
      return {
        ...(Array.isArray(payload) ? {} : payload),
        batches: Array.isArray(batches) ? batches : [],
        totalRecords: payload?.totalRecords ?? payload?.totalCount ?? batches.length,
      };
    })();

    mentorBatchRequests.set(requestId, request);
    try {
      return await request;
    } finally {
      mentorBatchRequests.delete(requestId);
    }
  },

  getBatches: async (params = {}) => batchService.getAll(params),
  getBatch: async (id) => batchService.getById(id),
  createBatch: async (payload) => batchService.create(payload),
  updateBatch: async (id, payload) => batchService.update(id, payload),
  deleteBatch: async (id) => batchService.remove(id),
};

export default batchService;
