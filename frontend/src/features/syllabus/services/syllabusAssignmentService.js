import apiClient from '@shared/services/apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { getPayload, getListPayload } from '@shared/services/apiServices'

const STORAGE_KEY = 'kini:syllabus-assignments:v1'

const isOrganizationPortal = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/organization/')
const organizationId = () => {
  for (const key of ['organization_id', 'organizationId', 'orgId']) {
    const value = localStorage.getItem(key)
    if (value && value !== 'undefined' && value !== 'null') return String(value)
  }
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const value = user?.organizationId ?? user?.OrganizationId ?? user?.orgId ?? user?.OrgId
      ?? user?.organization?.id ?? user?.organization?.organizationId
      ?? user?.organisation?.id ?? user?.organisation?.organizationId
    return value == null ? '' : String(value)
  } catch {
    return ''
  }
}
const scopedStorageKey = () => isOrganizationPortal()
  ? `${STORAGE_KEY}:organization:${organizationId() || 'unknown'}`
  : STORAGE_KEY

const seedAssignments = [
  {
    id: 'demo-assignment-1', courseId: 'demo-react', syllabusId: 'demo-react-syllabus',
    courseName: 'Advanced React Patterns', syllabusName: 'Advanced React Syllabus',
    recipientType: 'employee', recipientId: 'EMP-001', recipientName: 'Arun Kumar',
    assignedBy: 'demo-hr', assignedDate: '2026-09-05', dueDate: '2026-09-30',
    status: 'in-progress', progress: 50, completedModuleIds: ['react-1'], totalModules: 2,
  },
  {
    id: 'demo-assignment-2', courseId: 'demo-aws', syllabusId: 'demo-aws-syllabus',
    courseName: 'AWS Solutions Architect', syllabusName: 'AWS Foundation Syllabus',
    recipientType: 'mentor', recipientId: 'mentor-1', recipientName: 'Alex Morgan',
    assignedBy: 'demo-hr', assignedDate: '2026-09-05', dueDate: '2026-09-20',
    status: 'assigned', progress: 0, completedModuleIds: [], totalModules: 3,
  },
]

const readLocal = () => {
  try {
    if (isOrganizationPortal() && !organizationId()) return []
    const stored = JSON.parse(localStorage.getItem(scopedStorageKey()) || 'null')
    if (Array.isArray(stored)) return stored
    // The organization portal must never inherit the shared demo assignments.
    if (isOrganizationPortal()) return []
    return seedAssignments
  } catch {
    return isOrganizationPortal() ? [] : seedAssignments
  }
}

const writeLocal = (assignments) => {
  if (isOrganizationPortal() && !organizationId()) {
    throw new Error('Your session does not include an organization ID. Sign in again before saving syllabus assignments.')
  }
  localStorage.setItem(scopedStorageKey(), JSON.stringify(assignments))
  return assignments
}

const normalize = (assignment) => ({
  ...assignment,
  id: assignment.id ?? assignment.assignmentId,
  recipientType: String(assignment.recipientType ?? assignment.recipient_type ?? 'employee').toLowerCase(),
  progress: Number(assignment.progress ?? assignment.progressPercentage ?? 0),
  completedModuleIds: assignment.completedModuleIds ?? assignment.completedModules ?? [],
  status: String(assignment.status ?? 'assigned').toLowerCase().replace(/\s+/g, '-'),
})

const assignmentsEndpoint = API_ENDPOINTS.syllabusAssignments?.base || '/api/hr/syllabus-assignments'
const canUseLocalFallback = (error) => ![401, 403].includes(error?.response?.status)
const conflict = (message) => Object.assign(new Error(message), { response: { status: 409 } })

export const syllabusAssignmentService = {
  async list(filters = {}, audience = 'hr') {
    const endpoint = audience === 'employee'
      ? API_ENDPOINTS.syllabusAssignments.employee
      : audience === 'mentor'
        ? API_ENDPOINTS.syllabusAssignments.mentor
        : assignmentsEndpoint
    try {
      const response = await apiClient.get(endpoint, { params: filters, skipAuthRedirect: true })
      return getListPayload(response).map(normalize)
    } catch (error) {
      if (!canUseLocalFallback(error)) throw error
      return readLocal()
        .filter((assignment) => !filters.recipientType || assignment.recipientType === filters.recipientType)
        .filter((assignment) => !filters.recipientId || String(assignment.recipientId) === String(filters.recipientId))
        .map(normalize)
    }
  },

  async createMany(payload) {
    const recipients = Array.isArray(payload.recipients) ? payload.recipients : []
    const records = recipients.map((recipient) => normalize({
      id: `local-${crypto.randomUUID()}`,
      ...(organizationId() ? { organizationId: organizationId() } : {}),
      courseId: payload.courseId,
      syllabusId: payload.syllabusId,
      courseName: payload.courseName,
      syllabusName: payload.syllabusName,
      recipientType: payload.recipientType,
      recipientId: recipient.id,
      recipientName: recipient.name,
      assignedBy: payload.assignedBy,
      assignedDate: payload.assignedDate || new Date().toISOString().slice(0, 10),
      dueDate: payload.dueDate,
      status: 'assigned',
      progress: 0,
      completedModuleIds: [],
      totalModules: payload.totalModules || 0,
    }))

    try {
      const response = await apiClient.post(assignmentsEndpoint, {
        ...payload,
        recipientIds: recipients.map((recipient) => recipient.id),
        recipients: recipients.map((recipient) => ({ id: recipient.id, name: recipient.name })),
      })
      return getListPayload(response).map(normalize)
    } catch (error) {
      if (!canUseLocalFallback(error)) throw error
      const existing = readLocal()
      const duplicate = records.find((record) => existing.some((assignment) => (
        assignment.courseId === record.courseId
        && assignment.syllabusId === record.syllabusId
        && assignment.recipientType === record.recipientType
        && String(assignment.recipientId) === String(record.recipientId)
        && !['completed', 'cancelled'].includes(assignment.status)
      )))
      if (duplicate) throw conflict(`${duplicate.recipientName} already has this syllabus assigned.`)
      writeLocal([...records, ...existing])
      return records
    }
  },

  async getById(id, audience = 'hr') {
    const endpoint = audience === 'employee'
      ? API_ENDPOINTS.syllabusAssignments.employeeById(id)
      : audience === 'mentor'
        ? API_ENDPOINTS.syllabusAssignments.mentorById(id)
        : API_ENDPOINTS.syllabusAssignments.byId(id)
    try {
      return normalize(getPayload(await apiClient.get(endpoint, { skipAuthRedirect: true })))
    } catch (error) {
      if (!canUseLocalFallback(error)) throw error
      const assignment = readLocal().find((item) => String(item.id) === String(id))
      if (!assignment) throw Object.assign(new Error('Assignment not found.'), { response: { status: 404 } })
      return normalize(assignment)
    }
  },

  async updateStatus(id, status) {
    try {
      return normalize(getPayload(await apiClient.patch(API_ENDPOINTS.syllabusAssignments.status(id), { status })))
    } catch (error) {
      if (!canUseLocalFallback(error)) throw error
      const updated = readLocal().map((assignment) => assignment.id === id ? { ...assignment, status } : assignment)
      writeLocal(updated)
      return normalize(updated.find((assignment) => assignment.id === id))
    }
  },

  async completeModule(assignmentId, moduleId, audience = 'employee') {
    try {
      const endpoint = audience === 'mentor'
        ? API_ENDPOINTS.syllabusAssignments.mentorCompleteModule(assignmentId, moduleId)
        : API_ENDPOINTS.syllabusAssignments.completeModule(assignmentId, moduleId)
      const response = await apiClient.post(endpoint, {})
      return normalize(getPayload(response))
    } catch (error) {
      if (!canUseLocalFallback(error)) throw error
      const assignments = readLocal()
      const current = assignments.find((assignment) => String(assignment.id) === String(assignmentId))
      if (!current) return null
      const completed = Array.from(new Set([...(current.completedModuleIds || []), moduleId]))
      const totalModules = Math.max(Number(current.totalModules) || completed.length, completed.length)
      const progress = Math.round((completed.length / totalModules) * 100)
      const updated = { ...current, completedModuleIds: completed, totalModules, progress, status: progress >= 100 ? 'completed' : 'in-progress', completedAt: progress >= 100 ? new Date().toISOString() : null }
      writeLocal(assignments.map((assignment) => assignment.id === current.id ? updated : assignment))
      return normalize(updated)
    }
  },
}

export default syllabusAssignmentService
