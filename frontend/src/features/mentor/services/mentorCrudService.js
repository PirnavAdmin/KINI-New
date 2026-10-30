/**
 * Mentor CRUD Service
 *
 * Provides real API integration for live classes and attendance.
 * Other services remain as mock placeholders.
 */

// Live Class HTTP calls all go through the canonical liveClassApi (the same
// module every other consumer in the app uses) — this file only adapts its
// responses into the field-normalized shape this Mentor UI expects. There is
// exactly one place issuing requests to /api/v1/live-classes/*.
import { liveClassApi } from '@features/live-classes/api/liveClassApi'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
const generateId = () => Date.now() + Math.floor(Math.random() * 1000)

// ── Course operations ─────────────────────────────────────────────

export const courseService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
}

// ── Student operations ────────────────────────────────────────────

export const studentService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
}

// ── Batch operations ──────────────────────────────────────────────

export const batchService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
}

// ── Helpers ────────────────────────────────────────────────────────

const extractId = (item) =>
  item?.liveClassId ?? item?.classId ?? item?.sessionId ?? item?.id ?? null

const extractField = (item, ...keys) => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key]
  }
  return null
}

const meetingPlatformName = (item) => {
  const value = extractField(item, 'meetingPlatform', 'platform', 'meeting.platform')
  if (value && typeof value === 'object') return value.name ?? value.label ?? value.title ?? 'Not Specified'
  const numericNames = { 1: 'Zoom', 2: 'Google Meet', 3: 'Microsoft Teams', 4: 'Jitsi' }
  return numericNames[String(value)] ?? value ?? 'Not Specified'
}

/**
 * Normalise a single API record into a predictable shape used by the UI.
 */
const normalizeClassRecord = (item = {}) => {
  const id = extractId(item)
  return {
    // First preserve all original fields
    ...item,
    // Then override with normalized canonical fields
    liveClassId: id,
    id,
    classTitle: extractField(item, 'classTitle', 'title', 'sessionTitle', 'name') || 'Untitled Class',
    description: extractField(item, 'description', 'summary', 'overview') || '',
    courseId: item.courseId ?? item.course?.id ?? item.course?.courseId ?? null,
    courseName: extractField(item, 'courseName', 'course.title', 'course.courseName', 'course.name') || item.course?.title || '-',
    batchId: item.batchId ?? item.batch?.id ?? item.batch?.batchId ?? null,
    batchName: extractField(item, 'batchName', 'batch.title', 'batch.batchName', 'batch.name') || '-',
    mentorId: item.mentorId ?? item.mentor?.id ?? item.mentor?.mentorId ?? null,
    mentorName: extractField(item, 'mentorName', 'mentor.fullName', 'mentor.name') || 'Not Assigned',
    mentorAvatar: extractField(item, 'mentorAvatar', 'mentor.avatarUrl', 'mentor.photoUrl') || '',
    meetingPlatform: meetingPlatformName(item),
    meetingLink: extractField(item, 'meetingLink', 'meetingUrl', 'joinUrl', 'meeting.url', 'url', 'link') || '',
    meetingId: extractField(item, 'meetingId', 'meeting.meetingId') || '',
    meetingPassword: extractField(item, 'password', 'meetingPassword', 'meeting.password') || '',
    scheduledDate: extractField(item, 'scheduledDate', 'date', 'classDate', 'sessionDate', 'startDate') || '',
    startTime: extractField(item, 'startTime', 'start', 'startHour') || '',
    endTime: extractField(item, 'endTime', 'end', 'endHour') || '',
    durationMinutes: Number(item.durationMinutes ?? item.duration ?? 0),
    recordingEnabled: Boolean(item.recordingEnabled ?? item.hasRecording ?? false),
    recordingUrl: extractField(item, 'recordingUrl', 'recordingLink', 'recordingFileUrl', 'videoUrl', 'fileUrl', 'recording.url') || item.recording?.url || '',
    status: extractField(item, 'status', 'state', 'classStatus') || 'Scheduled',
    attendanceCount: Number(item.attendanceCount ?? item.studentsCount ?? item.students ?? 0),
    studentsCount: Number(item.studentsCount ?? item.students ?? item.attendanceCount ?? 0),
    createdAt: extractField(item, 'createdAt', 'createdDate') || '',
    updatedAt: extractField(item, 'updatedAt', 'updatedDate') || '',
    resources: Array.isArray(item.resources) ? item.resources : [],
  }
}

/**
 * Normalise an array of API records.
 */
const normalizeClassList = (list = []) =>
  Array.isArray(list) ? list.map(normalizeClassRecord) : []

// ── Live Class operations (real API integration) ──────────────────

export const liveClassService = {
  /**
   * Fetch live classes list.
   * Propagates errors to the caller so the UI can display meaningful messages.
   */
  async list(params = {}) {
    const records = await liveClassApi.list(params)
    return {
      data: normalizeClassList(records),
      totalRecords: records.length,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? records.length,
      raw: records,
    }
  },

  /**
   * Fetch a single live class by id.
   */
  async get(id) {
    const record = await liveClassApi.getById(id)
    return normalizeClassRecord(record)
  },

  /**
   * Create a new live class.
   * Propagates errors so the UI can display validation messages.
   */
  async create(data) {
    const record = await liveClassApi.create(data)
    return normalizeClassRecord(record)
  },

  /**
   * Update an existing live class.
   */
  async update(id, data) {
    const record = await liveClassApi.update(id, data)
    return normalizeClassRecord(record)
  },

  /**
   * Delete a live class.
   */
  async remove(id) {
    await liveClassApi.remove(id)
    return { success: true }
  },

  /**
   * Start a live class. PUT /api/v1/live-classes/{id}/start — Swagger-confirmed.
   */
  async start(id) {
    const record = await liveClassApi.start(id)
    return record ?? { success: true }
  },

  /**
   * End a live class. PUT /api/v1/live-classes/{id}/end — Swagger-confirmed.
   */
  async end(id) {
    const record = await liveClassApi.end(id)
    return record ?? { success: true }
  },

  /**
   * Cancel a live class. PUT /api/v1/live-classes/{id}/cancel — Swagger-confirmed.
   */
  async cancel(id, payload = {}) {
    const record = await liveClassApi.cancel(id, payload)
    return record ?? { success: true }
  },
}

// Attendance previously had a second, independent service implementation
// here (batch/course/mentor/date-scoped endpoints, no per-live-class GET/PUT
// at all). It has been removed — @shared/services/attendanceService.js is
// the single Attendance API integration for this app now, covering every
// live-class endpoint (GET/PUT/generate/dashboard/report/pdf/excel/my).
// Import it directly rather than re-adding a service here.

// ── Recorded Session operations ───────────────────────────────────

export const recordedSessionService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), uploadDate: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
}

// ── Assignment operations ─────────────────────────────────────────

export const assignmentService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
  async reviewSubmission(id, data) {
    await delay()
    return { ...data, id, reviewedAt: new Date().toISOString() }
  },
  async publish() {
    await delay()
    return { success: true }
  },
}

// ── Assessment operations ─────────────────────────────────────────

export const assessmentService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
  async publish() {
    await delay()
    return { success: true }
  },
  async getResults() {
    await delay()
    return []
  },
}

// ── Calendar Event operations ─────────────────────────────────────

export const calendarService = {
  async list() {
    await delay()
    return []
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), createdAt: new Date().toISOString() }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
}

// ── Resource operations ───────────────────────────────────────────

export const resourceService = {
  async list() {
    await delay()
    return []
  },
  async get() {
    await delay()
    return null
  },
  async create(data) {
    await delay()
    return { ...data, id: generateId(), uploadDate: new Date().toISOString(), downloads: 0 }
  },
  async update(id, data) {
    await delay()
    return { ...data, id }
  },
  async remove() {
    await delay()
    return { success: true }
  },
  async download() {
    await delay()
    return { success: true, url: '#' }
  },
}
