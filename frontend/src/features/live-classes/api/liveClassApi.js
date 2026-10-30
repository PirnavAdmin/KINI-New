import apiClient from '@shared/services/apiClient';
import { cleanPayload, getListPayload, getPayload } from '@shared/services/apiServices';
import { extractApiData, logApiError, logApiRequest, logApiSuccess, withPagedResponse } from '@shared/services/apiModuleHelpers';
import { API_ENDPOINTS } from '@/api/endpoints';
import { toModuleId } from '../utils/liveClassOptions';

const BASE = API_ENDPOINTS.liveClasses.base;
const COURSE_DROPDOWN = API_ENDPOINTS.liveClassDropdowns.courses;
const BATCH_DROPDOWN = API_ENDPOINTS.liveClassDropdowns.batches;
const MENTOR_DROPDOWN = API_ENDPOINTS.liveClassDropdowns.mentors;
const PLATFORM_DROPDOWN = API_ENDPOINTS.liveClassDropdowns.meetingPlatforms;
const STATUS_DROPDOWN = API_ENDPOINTS.liveClassDropdowns.statuses;

const send = async (method, endpoint, executor, payload, { silent } = {}) => {
  if (!silent) logApiRequest(method, endpoint, payload);
  try {
    const response = await executor();
    if (!silent) logApiSuccess(response);
    return extractApiData(response);
  } catch (error) {
    if (!silent) logApiError(error);
    throw error;
  }
};

const getList = async (endpoint, params = {}) => {
  const response = await send('GET', endpoint, () => apiClient.get(endpoint, { params }), params);
  const paged = withPagedResponse(response);
  const single = getPayload(response);
  // Some responses wrap one class object instead of returning an array.
  if (single && !Array.isArray(single) && single.liveClassId != null && single.classTitle != null) return [single];
  // withPagedResponse always returns an array (empty for shapes it doesn't
  // know, e.g. { data: { liveClasses: [...] } }), so fall back to the deep
  // list search whenever it found nothing.
  return paged?.data?.length ? paged.data : getListPayload(response);
};

const postJson = (endpoint, payload, config) => send('POST', endpoint, () => apiClient.post(endpoint, cleanPayload(payload), config), payload);
const putJson = (endpoint, payload, config) => send('PUT', endpoint, () => apiClient.put(endpoint, cleanPayload(payload), config), payload);
const deleteJson = (endpoint, payload, config) => send('DELETE', endpoint, () => apiClient.delete(endpoint, { ...(config || {}), data: payload }), payload);

const normalizeMeetingPlatform = (value) => {
  const platform = String(value || '').trim();
  const key = platform.toLowerCase().replace(/[^a-z]/g, '');
  if (key === 'zoom') return 'Zoom';
  if (key === 'googlemeet' || key === 'meet') return 'Google Meet';
  if (key === 'microsoftteams' || key === 'teams') return 'Microsoft Teams';
  if (key === 'jitsi') return 'Jitsi';
  return platform;
};

// Swagger-confirmed: CreateLiveClassDto and UpdateLiveClassDto are identical
// and exactly { classTitle, description, courseId, batchId, scheduledDate,
// startTime, endTime, meetingPlatform, meetingLink, meetingPassword,
// recordingEnabled } with additionalProperties: false. Neither accepts
// mentorId (the mentor is derived server-side from the batch) or status
// (status changes go through the dedicated start/end/cancel endpoints below,
// never a raw field on the class record) — sending either is rejected.
// The create endpoint now also requires moduleId — the syllabus module id
// (GET .../courses/{courseId}/syllabus → modules[].moduleId); without it the
// backend answers 400 "The field ModuleId must be between 1 and 2147483647."
// Only a positive integer is sent (see toModuleId): anything else is left
// out (never 0/NaN), so the forms must validate the module before submitting.

export const toLiveClassRequest = (input = {}) => {
  const date = input.scheduledDate ?? input.classDate ?? input.date;
  const startTime = input.startTime ?? input.start;
  const endTime = input.endTime ?? input.end;
  const meetingLink = input.meetingLink ?? input.meetingUrl ?? input.joinUrl;
  return {
    classTitle: String(input.classTitle ?? input.title ?? input.topic ?? '').trim(),
    description: input.description == null ? null : String(input.description).trim() || null,
    courseId: input.courseId == null || input.courseId === '' ? undefined : Number(input.courseId),
    batchId: input.batchId == null || input.batchId === '' ? undefined : Number(input.batchId),
    moduleId: toModuleId(input.moduleId),
    scheduledDate: date ? String(date).slice(0, 10) : undefined,
    startTime: startTime ? `${String(startTime).slice(0, 5)}:00` : undefined,
    endTime: endTime ? `${String(endTime).slice(0, 5)}:00` : undefined,
    meetingPlatform: normalizeMeetingPlatform(input.meetingPlatform ?? input.platform),
    meetingLink: meetingLink == null ? undefined : String(meetingLink).trim(),
    meetingPassword: input.meetingPassword ?? input.password ?? null,
    recordingEnabled: Boolean(input.recordingEnabled),
  };
};

// Dedicated DEV-only diagnostics for the three status-changing actions that
// previously had real bugs (start/end sent POST instead of PUT; cancel was
// missing entirely from the Mentor duplicate service). These bypass the
// generic send()/logApiRequest pipeline so the real HTTP status code is
// available (send() discards the raw response before logging), and use the
// exact [Live Class API] REQUEST/RESPONSE/ERROR format for fast diagnosis
// from the browser console. Never logs Authorization/JWT — only method,
// endpoint template, liveClassId, status, and the backend's own error body.
const liveClassActionRequest = async (method, endpoint, liveClassId, request) => {
  if (import.meta.env.DEV) {
    console.log('[Live Class API] REQUEST', { method, endpoint, liveClassId: String(liveClassId) });
  }
  try {
    const response = await request();
    if (import.meta.env.DEV) {
      console.log('[Live Class API] RESPONSE', { status: response.status, endpoint, liveClassId: String(liveClassId) });
    }
    return getPayload(response);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Live Class API] ERROR', {
        status: error?.response?.status ?? null,
        endpoint,
        liveClassId: String(liveClassId),
        message: error?.message ?? null,
        responseData: error?.response?.data ?? null,
      });
    }
    throw error;
  }
};

export const liveClassApi = {
  list: (params = {}) => getList(BASE, { organizationId: params.organizationId ?? params.orgId ?? undefined, page: params.page ?? 1, pageSize: params.pageSize ?? 1000, search: params.search ?? undefined, status: params.status ?? undefined, courseId: params.courseId ?? undefined, batchId: params.batchId ?? undefined, mentorId: params.mentorId ?? undefined, studentId: params.studentId ?? undefined }),
  dashboard: (params = {}) => send('GET', API_ENDPOINTS.liveClasses.dashboard, () => apiClient.get(API_ENDPOINTS.liveClasses.dashboard, { params }), params).then(getPayload),
  today: (params = {}) => getList(API_ENDPOINTS.liveClasses.today, params),
  upcoming: (params = {}) => getList(API_ENDPOINTS.liveClasses.upcoming, params),
  live: (params = {}) => getList(API_ENDPOINTS.liveClasses.live, params),
  completed: (params = {}) => getList(API_ENDPOINTS.liveClasses.completed, params),
  // The join flow (StudentCalendar/SchedulePage) calls this speculatively
  // before falling back to the dedicated join endpoint (see join() below) —
  // a 403/404 here is an expected, already-handled outcome for that caller,
  // not a genuine error, so it can opt out of the noisy default logging via
  // { silent: true } without weakening or hiding anything: the real action
  // (join) always logs normally, and the promise still rejects either way.
  getById: (id, options = {}) => send('GET', API_ENDPOINTS.liveClasses.byId(id), () => apiClient.get(API_ENDPOINTS.liveClasses.byId(id)), undefined, options).then(getPayload),
  create: (payload) => postJson(BASE, toLiveClassRequest(payload)).then(getPayload),
  update: (id, payload) => putJson(API_ENDPOINTS.liveClasses.byId(id), toLiveClassRequest(payload)).then(getPayload),
  remove: (id) => deleteJson(API_ENDPOINTS.liveClasses.byId(id), undefined).then(getPayload),
  // Swagger-confirmed: PUT, not POST. Use liveClassActionRequest (not
  // putJson) so the real HTTP status is available for [Live Class API] logs.
  start: (id) => liveClassActionRequest('PUT', '/api/v1/live-classes/{id}/start', id, () => apiClient.put(API_ENDPOINTS.liveClasses.start(id), {})),
  end: (id) => liveClassActionRequest('PUT', '/api/v1/live-classes/{id}/end', id, () => apiClient.put(API_ENDPOINTS.liveClasses.end(id), {})),
  cancel: (id, payload = {}) => liveClassActionRequest('PUT', '/api/v1/live-classes/{id}/cancel', id, () => apiClient.put(API_ENDPOINTS.liveClasses.cancel(id), cleanPayload(payload))),
  // Swagger-confirmed: POST, not GET — joining is an action (creates an
  // attendance/session record), not a read.
  join: (id) => liveClassActionRequest('POST', '/api/v1/live-classes/{liveClassId}/join', id, () => apiClient.post(API_ENDPOINTS.liveClasses.join(id), {}, { skipAuthRedirect: 'unless-expired' })),
  attendanceList: (id) => send('GET', `${BASE}/${id}/attendance`, () => apiClient.get(`${BASE}/${id}/attendance`)).then(getPayload),
  attendanceUpdate: (liveClassId, studentId, payload) => putJson(`${BASE}/${liveClassId}/attendance/${studentId}`, payload).then(getPayload),
  attendanceCreate: (liveClassId, payload) => postJson(`${BASE}/${liveClassId}/attendance`, payload).then(getPayload),
  uploadPdf: (payload) => {
    const formData = payload instanceof FormData ? payload : (() => {
      const fd = new FormData();
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, value);
      });
      return fd;
    })();
    return send('POST', API_ENDPOINTS.liveClasses.uploadPdf, () => apiClient.post(API_ENDPOINTS.liveClasses.uploadPdf, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }), payload).then(getPayload);
  },
  getPdf: (liveClassId) => send('GET', `${BASE}/${liveClassId}/pdf`, () => apiClient.get(`${BASE}/${liveClassId}/pdf`)).then(getPayload),
  deletePdf: (liveClassId) => deleteJson(`${BASE}/${liveClassId}/pdf`, {}).then(getPayload),
  getRecording: (liveClassId) => send('GET', API_ENDPOINTS.liveClasses.recording(liveClassId), () => apiClient.get(API_ENDPOINTS.liveClasses.recording(liveClassId))).then(getPayload),
  updateRecording: (liveClassId, payload) => putJson(API_ENDPOINTS.liveClasses.recording(liveClassId), payload).then(getPayload),
  deleteRecording: (liveClassId) => deleteJson(API_ENDPOINTS.liveClasses.recording(liveClassId), {}).then(getPayload),
  dropdowns: async () => {
    const [courses, batches, mentors, platforms, statuses] = await Promise.all([
      send('GET', COURSE_DROPDOWN, () => apiClient.get(COURSE_DROPDOWN)).then(getListPayload),
      send('GET', BATCH_DROPDOWN, () => apiClient.get(BATCH_DROPDOWN)).then(getListPayload),
      send('GET', MENTOR_DROPDOWN, () => apiClient.get(MENTOR_DROPDOWN)).then(getListPayload),
      send('GET', PLATFORM_DROPDOWN, () => apiClient.get(PLATFORM_DROPDOWN)).then(getListPayload),
      send('GET', STATUS_DROPDOWN, () => apiClient.get(STATUS_DROPDOWN)).then(getListPayload),
    ]);

    return { courses, batches, mentors, platforms, statuses };
  },
};

export default liveClassApi;
