import apiClient from '@shared/services/apiClient'
import { getApiErrorMessage, getListPayload, getPayload } from '@shared/services/apiServices'
import { API_ENDPOINTS } from './endpoints'
import { studentStatusOf } from '@shared/utils/studentStatus'

const endpoint = API_ENDPOINTS.organization.students
const DEFAULT_LIST_PARAMS = { pageNumber: 1, pageSize: 1000 }

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}

const toId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

const toOptionalPercentage = (value) => {
  if (value === null || value === undefined || value === '') return null
  const percentage = Number(value)
  return Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : null
}

const toPayload = (student = {}) => {
  const names = splitName(student.name)
  const payload = {
    firstName: String(student.firstName ?? names.firstName).trim(),
    lastName: String(student.lastName ?? names.lastName).trim(),
    email: String(student.email ?? '').trim().toLowerCase(),
    phone: String(student.phone ?? student.mobile ?? '').trim(),
    courseId: toId(student.courseId ?? student.course),
    batchId: toId(student.batchId ?? student.batch),
  }
  if (student.status !== undefined) payload.status = student.status
  return payload
}

const validateCreatePayload = (payload) => {
  const missing = []
  if (!payload.firstName) missing.push('First name')
  if (!payload.lastName) missing.push('Last name')
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) missing.push('Valid email')
  if (!/^[6-9]\d{9}$/.test(payload.phone.replace(/\D/g, ''))) missing.push('Valid Indian mobile number')
  if (!Number.isInteger(payload.courseId) || payload.courseId <= 0) missing.push('Valid course ID')
  if (!Number.isInteger(payload.batchId) || payload.batchId <= 0) missing.push('Valid batch ID')
  if (missing.length) throw new Error(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required before enrollment.`)
  return { ...payload, phone: payload.phone.replace(/\D/g, '') }
}

const normalize = (student = {}) => ({
  ...student,
  id: student.studentId ?? student.id,
  studentId: student.studentId ?? student.id,
  name: student.name || [student.firstName, student.lastName].filter(Boolean).join(' '),
  mobile: student.mobile ?? student.phone ?? student.phoneNumber ?? student.mobileNumber ?? '',
  phone: student.phone ?? student.mobile ?? student.phoneNumber ?? student.mobileNumber ?? '',
  courseId: student.courseId ?? student.course?.courseId ?? student.course?.id,
  course: student.courseName ?? student.course?.courseName ?? student.course?.name
    ?? (student.courseId ? `Course #${student.courseId}` : '—'),
  batchId: student.batchId ?? student.batch?.batchId ?? student.batch?.id,
  batch: student.batchName ?? student.batch?.batchName ?? student.batch?.name
    ?? (student.batchId ? `Batch #${student.batchId}` : '—'),
  mentorId: student.mentorId ?? student.mentor?.mentorId ?? student.mentor?.employeeId ?? student.mentor?.id
    ?? student.batch?.mentorId ?? student.batch?.mentor?.mentorId ?? student.batch?.mentor?.employeeId ?? null,
  mentorName: student.mentorName
    ?? student.assignedMentorName
    ?? student.mentor?.mentorName
    ?? student.mentor?.name
    ?? student.batch?.mentorName
    ?? student.batch?.trainerName
    ?? student.batch?.mentor?.name
    ?? [student.mentor?.firstName, student.mentor?.lastName].filter(Boolean).join(' '),
  attendance: toOptionalPercentage(student.attendance),
  assessmentsCleared: Number(student.assessmentsCleared ?? 0),
  status: studentStatusOf(student, 'Active'),
  registrationDate: student.registrationDate ?? student.enrollmentDate ?? student.enrolledAt ?? student.enrolledOn ?? student.createdAt ?? student.createdDate ?? '',
  country: student.countryName ?? student.country?.countryName ?? student.country?.name
    ?? (typeof student.country === 'string' ? student.country : null)
    ?? student.address?.countryName ?? student.address?.country?.name ?? student.address?.country ?? '',
  address: typeof student.address === 'string' ? student.address : student.fullAddress ?? student.addressLine
    ?? [...new Set([
      student.address?.addressLine1 ?? student.address?.line1 ?? student.addressLine1 ?? student.streetAddress,
      student.address?.addressLine2 ?? student.address?.line2 ?? student.addressLine2,
      student.address?.city ?? student.city, student.address?.state ?? student.state,
      student.address?.postalCode ?? student.address?.pincode ?? student.postalCode ?? student.pinCode ?? student.pincode,
    ].filter(value => typeof value === 'string' && value.trim()))].join(', '),
  paymentStatus: student.paymentStatus ?? student.payment?.status ?? '',
})

const unwrapStudentResponse = (response) => {
  const raw = response?.data ?? response
  if (raw?.success === false || raw?.Success === false) {
    const error = new Error(raw.message || raw.Message || raw.error || raw.Error || 'Unable to add student.')
    error.response = { data: raw }
    throw error
  }
  return normalize(getPayload(response))
}

export const studentsApi = {
  // The API is paged and defaults to ten rows. These screens need the full
  // organization roster for totals, filtering and batch membership.
  list: async (params = {}) => ({
    data: getListPayload(await apiClient.get(endpoint, {
      params: { ...DEFAULT_LIST_PARAMS, ...params },
    })).map(normalize),
  }),
  getById: async (id, config) => ({ data: normalize(getPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}`, config))) }),
  create: async (student) => {
    const payload = validateCreatePayload(toPayload(student))
    const token = localStorage.getItem('organizationToken') || localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (import.meta.env.DEV) {
      console.group('CREATE STUDENT REQUEST')
      console.log('Endpoint:', endpoint)
      console.log('Payload:', payload)
      console.log('Payload JSON:', JSON.stringify(payload, null, 2))
      console.log('Token exists:', Boolean(token))
      console.log('Organization:', localStorage.getItem('organizationId') || localStorage.getItem('organization_id') || localStorage.getItem('orgId'))
      console.groupEnd()
    }
    try {
      return { data: unwrapStudentResponse(await apiClient.post(endpoint, payload)) }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.group('CREATE STUDENT FAILED')
        console.error('Status:', error.response?.status)
        console.error('Response:', error.response?.data)
        console.error('Headers:', error.response?.headers)
        console.error('Sent data:', error.config?.data)
        console.groupEnd()
      }
      throw error
    }
  },
  update: async (id, student) => {
    const payload = toPayload(student)
    if (!/^[6-9]\d{9}$/.test(payload.phone.replace(/\D/g, ''))) {
      throw new Error('Enter a valid Indian mobile number starting with 6, 7, 8, or 9.')
    }
    payload.phone = payload.phone.replace(/\D/g, '')
    const response = await apiClient.put(`${endpoint}/${encodeURIComponent(id)}`, payload)
    const saved = unwrapStudentResponse(response)
    return { data: normalize({ ...student, ...saved, id: saved.id ?? id, studentId: saved.studentId ?? id,
      firstName: saved.firstName ?? payload.firstName, lastName: saved.lastName ?? payload.lastName,
      email: saved.email ?? payload.email, phone: saved.phone || payload.phone,
      courseId: saved.courseId ?? payload.courseId, batchId: saved.batchId ?? payload.batchId }) }
  },
  remove: async (id) => ({ data: getPayload(await apiClient.delete(`${endpoint}/${encodeURIComponent(id)}`)) }),
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/students/${encodeURIComponent(id)}/status`, { status })
    const raw = response?.data
    if (raw?.success === false || raw?.Success === false || raw?.data?.success === false) {
      throw new Error(raw?.data?.message ?? raw?.message ?? raw?.Message ?? 'Unable to update student status.')
    }
    // Re-read the organization record so an ignored update cannot be reported
    // as saved or masked by a local status override.
    const saved = await studentsApi.getById(id, { skipAuthRedirect: true })
    if (studentStatusOf(saved.data).toLowerCase() !== String(status).trim().toLowerCase()) {
      throw new Error('The backend did not save the requested student status. Please retry.')
    }
    window.dispatchEvent(new CustomEvent('kini:student-updated', { detail: { studentId: id } }))
    return saved
  },
  // Verified against Swagger: UpdateStudentDto has no status field.
  deactivate: async (id) => ({
    data: unwrapStudentResponse(await apiClient.patch('/api/students/' + encodeURIComponent(id) + '/status', { status: 'Inactive' })),
  }),
  // Swagger: PUT with only the student id in the path (no body) and no declared
  // response schema, so the raw body is returned for the caller to report.
  approve: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.organization.approveStudent(id))
    const raw = response?.data
    if (raw?.success === false || raw?.Success === false) {
      const error = new Error(raw.message || raw.Message || 'The backend did not approve this student.')
      error.response = { status: response.status, data: raw }
      throw error
    }
    const payload = getPayload(response)
    return { data: payload && typeof payload === 'object' ? normalize(payload) : null, raw, status: response.status }
  },
  // Swagger: POST /api/StudentBatch {batchId, studentIds[]} enrolls existing
  // students in a batch (the batch carries the course). CreateStudentDto takes
  // a single courseId/batchId, so every course after the first is added here.
  enrollInBatch: async (studentId, batchId) => {
    const response = await apiClient.post(API_ENDPOINTS.studentBatch.base, { batchId: Number(batchId), studentIds: [Number(studentId)] })
    if (response.data?.success === false || response.data?.Success === false) {
      const error = new Error(response.data.message ?? response.data.Message ?? 'The backend rejected this enrollment.')
      error.response = { status: response.status, data: response.data }
      throw error
    }
    return { data: getPayload(response) }
  },
  // The endpoint has no Swagger response schema. Recognize known list shapes,
  // but never treat an unrecognized or rejected response as an empty roster.
  getEnrollments: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.studentBatch.studentEnrollments(id), { skipAuthRedirect: true })
    let body = response?.data
    for (let depth = 0; depth < 4 && body && !Array.isArray(body); depth += 1) {
      if (body.success === false || body.Success === false) {
        const error = new Error(body.message ?? body.Message ?? 'Unable to verify student enrollments.')
        error.response = { status: response.status, data: body }
        throw error
      }
      if (body.studentId != null && String(body.studentId) !== String(id)) throw new Error('Enrollment response does not match this student.')
      const list = body.courses ?? body.enrollments ?? body.items
      if (Array.isArray(list)) return { data: list }
      body = body.data
    }
    if (Array.isArray(body)) return { data: body }
    throw new Error('The enrollment service returned an unrecognized response. Existing assignments could not be verified.')
  },
  reject: async (id, payload = {}) => ({ data: normalize(getPayload(await apiClient.put(API_ENDPOINTS.organization.rejectStudent(id), payload))) }),
  getPayments: async (id, params) => ({ data: getListPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}/payments`, { params })) }),
  getAttendance: async (id, params) => ({ data: getListPayload(await apiClient.get(`/api/Attendance/student/${encodeURIComponent(id)}`, { params })) }),
  getProgress: async (id) => ({ data: getPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}/progress`)) }),
  getMaterials: async (id, params) => ({ data: getListPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}/materials`, { params })) }),
  getQuizResults: async (id, params) => ({ data: getListPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}/quiz-results`, { params })) }),
  getActivity: async (id, params) => ({ data: getListPayload(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}/activity`, { params })) }),
  getErrorMessage: (error) => getApiErrorMessage(error, 'Unable to complete the student request.'),
}
