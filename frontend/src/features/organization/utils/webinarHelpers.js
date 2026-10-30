// ================================================================
// Webinar Helper Utilities — API Ready
// All functions use local mock state so components never need to
// change when backend APIs are integrated.
// ================================================================

import { WEBINARS } from '../data/webinarMockData'

// In-memory state so newly created webinars appear without refresh
let webinarStore = [...WEBINARS]
let nextId = 26

const generateId = () => `w${String(nextId++).padStart(3, '0')}`

/**
 * Return all webinars.
 * TODO: Replace with GET /api/webinars
 */
export function getAllWebinars() {
  return [...webinarStore]
}

/**
 * Return upcoming webinars.
 * TODO: Replace with GET /api/webinars?status=Upcoming
 */
export function getUpcomingWebinars() {
  return webinarStore.filter((w) => w.status === 'Upcoming')
}

/**
 * Return completed webinars.
 * TODO: Replace with GET /api/webinars?status=Completed
 */
export function getCompletedWebinars() {
  return webinarStore.filter((w) => w.status === 'Completed')
}

/**
 * Return cancelled webinars.
 * TODO: Replace with GET /api/webinars?status=Cancelled
 */
export function getCancelledWebinars() {
  return webinarStore.filter((w) => w.status === 'Cancelled')
}

/**
 * Return live webinars.
 * TODO: Replace with GET /api/webinars?status=Live%20Now
 */
export function getLiveWebinars() {
  return webinarStore.filter((w) => w.status === 'Live Now')
}

/**
 * Get a single webinar by ID.
 * TODO: Replace with GET /api/webinars/:id
 */
export function getWebinarById(id) {
  return webinarStore.find((w) => w.id === id) || null
}

/**
 * Create a new webinar and add it to local state.
 * TODO: Replace with POST /api/webinars
 */
export function createWebinar(data) {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')

  const webinar = {
    id: generateId(),
    title: data.title || '',
    description: data.description || '',
    type: data.meetingType || 'Webinar',
    hostName: data.host || 'Admin',
    hostDesignation: 'Organizer',
    hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.host || 'Admin')}`,
    hostEmail: '',
    hostPhone: '',
    hostExperience: '',
    hostBio: '',
    hostDepartment: data.department || 'Engineering',
    date: data.date || `${yyyy}-${mm}-${dd}`,
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '10:00',
    duration: calcDuration(data.startTime || '09:00', data.endTime || '10:00'),
    status: data.status === 'Publish' ? 'Upcoming' : 'Draft',
    department: data.department || 'Engineering',
    meetingLink: data.meetingLink || '',
    meetingPlatform: data.meetingPlatform || 'Google Meet',
    attendees: 0,
    capacity: Number(data.maxAttendees) || 50,
    location: 'Virtual',
    category: 'Technology',
    createdBy: 'Admin',
    createdDate: `${yyyy}-${mm}-${dd}`,
    agenda: [],
    materials: [],
    objectives: '',
    learningOutcomes: [],
    requirements: '',
    recordingAvailable: false,
    language: 'English',
    timezone: data.timezone || 'IST (UTC+5:30)',
    thumbnail: data.thumbnail || '',
  }

  webinarStore = [...webinarStore, webinar]
  return webinar
}

/**
 * Update an existing webinar.
 * TODO: Replace with PUT /api/webinars/:id
 */
export function updateWebinar(id, updates) {
  webinarStore = webinarStore.map((w) =>
    w.id === id ? { ...w, ...updates } : w
  )
  return getWebinarById(id)
}

/**
 * Delete a webinar.
 * TODO: Replace with DELETE /api/webinars/:id
 */
export function deleteWebinar(id) {
  webinarStore = webinarStore.filter((w) => w.id !== id)
}

/**
 * Get webinars for a specific month/year (for calendar).
 * TODO: Replace with GET /api/webinars?month=&year=
 */
export function getWebinarsByMonth(year, month) {
  return webinarStore.filter((w) => {
    if (!w.date) return false
    const [y, m] = w.date.split('-').map(Number)
    return y === year && m === month
  })
}

/**
 * Get webinars for a specific date.
 * TODO: Replace with GET /api/webinars?date=
 */
export function getWebinarsByDate(dateStr) {
  return webinarStore.filter((w) => w.date === dateStr)
}

export function sortWebinarsBySchedule(webinars) {
  const statusOrder = {
    'Live Now': 0,
    Upcoming: 1,
    Draft: 2,
    Completed: 3,
    Cancelled: 4,
  }

  return [...webinars].sort((a, b) => {
    const timeDiff = toDateTime(a) - toDateTime(b)
    if (timeDiff !== 0) return timeDiff

    return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  })
}
// ─── Internal helpers ────────────────────────────────────────

function calcDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) return '1h'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function toDateTime(webinar) {
  const date = String(webinar?.date || '').trim()
  const time = String(webinar?.startTime || '00:00').trim()
  const parsed = new Date(`${date}T${time}:00`)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}
