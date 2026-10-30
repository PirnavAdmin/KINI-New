import apiClient from './apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { extractApiData, logApiError, logApiRequest, logApiSuccess, withPagedResponse } from './apiModuleHelpers'
import { getPayload } from './apiServices'

const MENTOR_ENDPOINT = API_ENDPOINTS.organization.mentors
const MENTOR_CRUD_ENDPOINT = API_ENDPOINTS.organization.mentors

const buildParams = (params = {}) => ({
  OrganizationId: params.OrganizationId ?? params.organizationId ?? params.orgId ?? undefined,
  Search: params.Search ?? params.search ?? params.searchText ?? undefined,
  Status: params.Status ?? params.status ?? undefined,
  SortBy: params.SortBy ?? params.sortBy ?? 'MentorName',
  IsDescending: params.IsDescending ?? params.isDescending ?? false,
  PageNumber: params.PageNumber ?? params.pageNumber ?? 1,
  PageSize: params.PageSize ?? params.pageSize ?? 10,
})

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload)
  try {
    const response = await executor()
    if (response?.data?.success === false || response?.data?.data?.success === false) {
      throw Object.assign(new Error(response.data?.data?.message || response.data?.message || 'Mentor request failed.'), { response })
    }
    logApiSuccess(response)
    return extractApiData(response)
  } catch (error) {
    logApiError(error)
    throw error
  }
}

const toMentorPayload = (payload = {}) => ({
  firstName: String(payload.firstName || '').trim(),
  lastName: String(payload.lastName || '').trim(),
  email: String(payload.email || '').trim(),
  phone: String(payload.phone || '').trim(),
  courseIds: Array.isArray(payload.courseIds)
    ? payload.courseIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0)
    : String(payload.courseIds || '')
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
  status: typeof payload.status === 'boolean'
    ? payload.status
    : !['inactive', 'disabled', 'false'].includes(String(payload.status ?? 'Active').trim().toLowerCase()),
})

const toMentorCreatePayload = (payload = {}) => toMentorPayload(payload)

const mentorDashboardRequest = (path, mentorId) => {
  if (mentorId === undefined || mentorId === null || String(mentorId).trim() === '') {
    return Promise.reject(new Error('A mentor ID is required to load the dashboard.'))
  }
  return getMentorWidget(path(mentorId))
}

export const getMentorDashboard = (mentorId) => mentorDashboardRequest(API_ENDPOINTS.mentorDashboard.byMentorId, mentorId)
export const getMentorDashboardToday = (mentorId) => mentorDashboardRequest(API_ENDPOINTS.mentorDashboard.today, mentorId)
export const getMentorDashboardUpcoming = (mentorId) => mentorDashboardRequest(API_ENDPOINTS.mentorDashboard.upcoming, mentorId)
export const getMentorDashboardAttendance = (mentorId) => mentorDashboardRequest(API_ENDPOINTS.mentorDashboard.attendance, mentorId)
// These endpoints populate independent dashboard widgets. A permission/configuration
// error in one widget must not clear an otherwise valid mentor login session.
// The screen handles and displays these request errors locally.
// Concurrent callers (React StrictMode's double-invoked effects, or multiple
// widgets reading the same endpoint) share one in-flight request instead of
// firing duplicate network calls.
const widgetRequests = new Map()
const getMentorWidget = (endpoint) => {
  if (widgetRequests.has(endpoint)) return widgetRequests.get(endpoint)
  const request = apiClient.get(endpoint, { skipAuthRedirect: true }).then(getPayload)
  widgetRequests.set(endpoint, request)
  request.then(() => widgetRequests.delete(endpoint), () => widgetRequests.delete(endpoint))
  return request
}

export const getMentorDashboardCourses = () => getMentorWidget(API_ENDPOINTS.mentorDashboard.courses)
export const getMentorDashboardCourseSyllabus = (courseId) => getMentorWidget(API_ENDPOINTS.mentorDashboard.courseSyllabus(courseId))
export const getMentorDashboardBatches = () => getMentorWidget(API_ENDPOINTS.mentorDashboard.batches)
export const getMentorDashboardStudents = () => getMentorWidget(API_ENDPOINTS.mentorDashboard.students)
export const getMentorDashboardClasses = () => getMentorWidget(API_ENDPOINTS.mentorDashboard.classes)

export const mentorService = {
  getMentors: async (params = {}) => {
    const query = buildParams(params)
    const response = await sendRequest('GET', MENTOR_ENDPOINT, () => apiClient.get(MENTOR_ENDPOINT, { params: query }), query)
    return withPagedResponse(response)
  },
  getMentor: async (id) => sendRequest('GET', `${MENTOR_ENDPOINT}/${id}`, () => apiClient.get(`${MENTOR_ENDPOINT}/${id}`), { id }),
  // Mentor CRUD is exposed by the organization mentors resource.
  createMentor: async (payload) => sendRequest('POST', MENTOR_CRUD_ENDPOINT, () => apiClient.post(MENTOR_CRUD_ENDPOINT, toMentorCreatePayload(payload)), payload),
  updateMentor: async (id, payload) => sendRequest('PUT', `${MENTOR_ENDPOINT}/${id}`, () => apiClient.put(`${MENTOR_ENDPOINT}/${id}`, toMentorPayload(payload)), { id, ...payload }),
  updateMentorStatus: async (id, active) => {
    // Swagger's UpdateMentorDto requires all five profile/assignment fields.
    // Fetch current values so toggling status cannot erase profile or courses.
    const current = getPayload(await mentorService.getMentor(id));
    const names = String(current?.mentorName ?? current?.fullName ?? current?.name ?? '').trim().split(/\s+/);
    const courseRows = current?.courses ?? current?.assignedCourses;
    const courseIds = current?.courseIds ?? (Array.isArray(courseRows)
      ? courseRows.map((course) => typeof course === 'object' ? course.courseId ?? course.id : course)
      : undefined);
    const payload = toMentorPayload({
      firstName: current?.firstName ?? names[0],
      lastName: current?.lastName ?? names.slice(1).join(' '),
      email: current?.email ?? current?.emailAddress,
      phone: current?.phone ?? current?.mobile ?? current?.phoneNumber,
      courseIds,
      status: active,
    });
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone || !Array.isArray(courseIds)
      || payload.courseIds.length !== new Set(courseIds.map(Number)).size) {
      throw new Error('The mentor details needed to change status are incomplete. Open Edit Mentor to check the name, email, phone and course assignments, then retry.');
    }
    return mentorService.updateMentor(id, payload);
  },
  deleteMentor: async (id) => sendRequest('DELETE', `${MENTOR_ENDPOINT}/${id}`, () => apiClient.delete(`${MENTOR_ENDPOINT}/${id}`), { id }),
}

export default mentorService
