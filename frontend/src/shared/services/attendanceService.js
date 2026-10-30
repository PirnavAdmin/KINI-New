import apiClient from './apiClient'
import { getListPayload, getPayload } from './apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'

const BASE = API_ENDPOINTS.attendance.base
const id = (value) => encodeURIComponent(value)

// Dev-only diagnostics for GET /api/Attendance/student/{studentId} — this
// endpoint has an active, unresolved backend 500 (a JSON serializer "object
// cycle" exception), so this logs everything needed to hand a backend
// developer a complete request/response trail without ever touching the
// Authorization header. Entirely stripped from production builds: the
// early return below makes every line after it unreachable when
// import.meta.env.DEV is statically false, so Vite's minifier removes it
// (verified for this exact pattern elsewhere in this codebase).
let studentAttendanceRequestCount = 0
const classifyAttendanceError = (status) => {
  if (status === 401) return 'AUTHENTICATION_ERROR'
  if (status === 403) return 'AUTHORIZATION_ERROR'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 422) return 'VALIDATION_ERROR'
  if (status >= 500) return 'BACKEND_SERVER_ERROR'
  return 'NETWORK_ERROR'
}
const attendanceResponseShape = (data) => {
  if (Array.isArray(data)) return { isArray: true, length: data.length }
  if (data && typeof data === 'object') return { isArray: false, keys: Object.keys(data) }
  return { isArray: false, keys: [] }
}

export const attendanceService = {
  list: () => apiClient.get(BASE).then(getListPayload),
  getById: (attendanceId) => apiClient.get(`${BASE}/${id(attendanceId)}`).then(getPayload),
  create: (payload) => apiClient.post(BASE, payload).then(getPayload),
  createBulk: (payload) => apiClient.post(`${BASE}/bulk`, payload).then(getPayload),
  update: (attendanceId, payload) => apiClient.put(`${BASE}/${id(attendanceId)}`, payload).then(getPayload),
  remove: (attendanceId) => apiClient.delete(`${BASE}/${id(attendanceId)}`).then(getPayload),
  byStudent: (studentId) => {
    const url = `${BASE}/student/${id(studentId)}`
    if (!import.meta.env.DEV) return apiClient.get(url).then(getListPayload)

    const requestNumber = ++studentAttendanceRequestCount
    const endpoint = `${BASE}/student/{studentId}`
    console.log(`[Student Attendance API] REQUEST #${requestNumber}`, {
      method: 'GET', endpoint, url, studentId: String(studentId),
    })
    const startedAt = performance.now()
    return apiClient.get(url)
      .then((response) => {
        const durationMs = Math.round(performance.now() - startedAt)
        const data = getListPayload(response)
        const shape = attendanceResponseShape(data)
        console.log(`[Student Attendance API] RESPONSE #${requestNumber}`, {
          method: 'GET', endpoint, studentId: String(studentId), status: response.status, ...shape,
        })
        console.log(`[Student Attendance API] REQUEST END #${requestNumber}`, {
          studentId: String(studentId), status: response.status, durationMs,
        })
        return data
      })
      .catch((error) => {
        const durationMs = Math.round(performance.now() - startedAt)
        const status = error?.response?.status ?? null
        const backendData = error?.response?.data
        console.error(`[Student Attendance API] ERROR #${requestNumber}`, {
          method: 'GET',
          endpoint,
          studentId: String(studentId),
          status,
          statusText: error?.response?.statusText ?? null,
          message: error?.message ?? null,
          responseData: backendData ?? null,
        })
        console.log(`[Student Attendance API] ERROR TYPE: ${status ? classifyAttendanceError(status) : 'NETWORK_ERROR'}`)
        if (backendData && typeof backendData === 'object') {
          const success = backendData.Success ?? backendData.success
          if (success === false) {
            const backendMessage = backendData.Message ?? backendData.message ?? null
            const backendErrorText = backendData.Error ?? backendData.error ?? null
            console.error('[Student Attendance API] BACKEND ERROR', {
              status, success: false, message: backendMessage, error: backendErrorText,
            })
            if (typeof backendErrorText === 'string' && /object cycle/i.test(backendErrorText)) {
              console.error('[Student Attendance API] BACKEND SERIALIZATION ERROR', {
                status, studentId: String(studentId), message: backendMessage, errorContainsCycle: true,
              })
            }
          }
        }
        console.log(`[Student Attendance API] REQUEST END #${requestNumber}`, {
          studentId: String(studentId), status: status ?? 'network error', durationMs,
        })
        throw error
      })
  },
  studentSummary: (studentId) => apiClient.get(`${BASE}/student/${id(studentId)}/summary`).then(getPayload),
  studentPercentage: (studentId) => apiClient.get(`${BASE}/student/${id(studentId)}/percentage`).then(getPayload),
  dashboard: () => apiClient.get(`${BASE}/dashboard`).then(getPayload),
  byBatch: (batchId) => apiClient.get(`${BASE}/batch/${id(batchId)}`).then(getListPayload),
  byCourse: (courseId) => apiClient.get(`${BASE}/course/${id(courseId)}`).then(getListPayload),
  byMentor: (mentorId) => apiClient.get(`${BASE}/mentor/${id(mentorId)}`).then(getListPayload),
  byDate: (date) => apiClient.get(`${BASE}/date`, { params: { date } }).then(getListPayload),
  byLiveClass: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.liveClass(liveClassId)).then(getListPayload),
  studentLiveClass: (studentId, liveClassId) => apiClient.get(API_ENDPOINTS.attendance.studentLiveClass(studentId, liveClassId)).then(getPayload),
  myLiveClassAttendance: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.myLiveClass(liveClassId)).then(getPayload),
  updateLiveClassAttendance: (payload) => apiClient.put(BASE, payload).then(getPayload),
  generateForLiveClass: (liveClassId, payload = {}) => apiClient.post(API_ENDPOINTS.attendance.generate(liveClassId), payload).then(getPayload),
  liveClassDashboard: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.dashboard(liveClassId)).then(getPayload),
  liveClassReport: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.report(liveClassId)).then(getPayload),
  // Full response (not just .data) so callers can read the filename off
  // Content-Disposition when the backend sends one, instead of always
  // falling back to a client-synthesized name.
  liveClassReportPdf: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.reportPdf(liveClassId), { responseType: 'blob' }),
  liveClassReportExcel: (liveClassId) => apiClient.get(API_ENDPOINTS.attendance.reportExcel(liveClassId), { responseType: 'blob' }),
}

export default attendanceService
