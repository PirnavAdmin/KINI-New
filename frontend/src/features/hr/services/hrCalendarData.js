import { hrField, unwrapHrData } from './hrApi'

// Manual calendar events and organization class schedules have separate DTOs.
export function calendarDate(value) {
  if (value instanceof Date) return new Date(value)
  if (typeof value !== 'string' || !value) return new Date(NaN)
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!dateOnly) return new Date(value)
  const [, year, month, day] = dateOnly.map(Number)
  const result = new Date(year, month - 1, day)
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day ? result : new Date(NaN)
}

export function calendarMonthRange(month) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1)
  return { start, next, end: new Date(next.getTime() - 1) }
}

// A failed source makes its category unavailable, never a legitimate zero.
export function calendarMonthMetrics(events, month, unavailableTypes = []) {
  const records = events.filter(event => inCalendarMonth(event, month))
  const unavailable = new Set(unavailableTypes)
  return {
    total: unavailable.size ? null : records.length,
    ...Object.fromEntries(['classes', 'meetings', 'holidays', 'leaves', 'performance'].map(type => [type,
      unavailable.has(type) ? null : records.filter(event => event.type === type).length,
    ])),
  }
}

export function upcomingCalendarEvents(events, now = Date.now()) {
  return events.filter(event => event.end.getTime() >= Number(now) || event.allDay && calendarOnDay(event, new Date(now))).sort((a, b) => a.start - b.start)
}

export function calendarMappingError(error, section) {
  if (import.meta.env.DEV) console.debug('[HR Calendar mapping]', { section, reason: error.message })
  return `${section} could not be displayed because the server response could not be read. Refresh to retry.`
}

export const calendarType = value => ({ CLASS: 'classes', MEETING: 'meetings', HOLIDAY: 'holidays', LEAVE: 'leaves', PERFORMANCE: 'performance' }[String(value ?? '').toUpperCase()] ?? 'unknown')

export function calendarList(response) {
  const value = unwrapHrData(response)
  if (Array.isArray(value?.items)) return value.items
  const error = new Error('Calendar response shape is invalid. Expected response.items.')
  error.name = 'CalendarMappingError'
  throw error
}

export function calendarStats(response) {
  const value = unwrapHrData(response)
  const keys = ['eventsThisMonth', 'classesScheduled', 'meetings', 'holidays', 'leaveEvents']
  if (!keys.every(key => typeof value?.[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0)) {
    throw new Error('Calendar stats response is missing valid verified metric fields.')
  }
  return Object.fromEntries(keys.map(key => [key, value[key]]))
}

export function mapCalendarLeave(raw) {
  // Leave dates are local calendar days; the board uses an inclusive end day.
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.0+)?)?$/.test(value) ? calendarDate(value.slice(0, 10)) : new Date(NaN)
  const start = date(raw?.startDate)
  const end = date(raw?.endDate)
  if (raw?.leaveRequestId == null || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new Error('leaves: verified leaveRequestId, startDate and endDate are required.')
  }
  return {
    id: raw.leaveRequestId, employeeId: raw.employeeId, employeeName: raw.employeeName,
    leaveType: raw.leaveType, title: `${raw.employeeName} · ${raw.leaveType} leave`,
    start, end, allDay: true, status: raw.status, description: raw.reason,
    profilePhoto: raw.employeeProfilePhotoUrl, type: 'leaves', source: 'leaves', raw,
  }
}

export function mapCalendarClass(raw) {
  const fail = () => { throw new Error('classes: class identity and valid schedule fields are required. A verified response DTO is required.') }
  const id = hrField(raw, 'liveClassId', 'classId', 'sessionId', 'eventId', 'id')
  const title = hrField(raw, 'classTitle', 'title', 'sessionTitle', 'name')
  if (!['string', 'number'].includes(typeof id) || !String(id).trim() || typeof title !== 'string' || !title.trim()) return fail()
  const eventType = hrField(raw, 'eventType')
  if (eventType != null && calendarType(eventType) !== 'classes') return fail()
  // Organization live classes store a calendar date plus .NET TimeSpan times.
  const scheduledDate = hrField(raw, 'scheduledDate', 'classDate', 'date')
  const atTime = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(String(scheduledDate ?? ''))) return new Date(NaN)
    const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/)
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59 || Number(match[3] ?? 0) > 59) return new Date(NaN)
    const date = calendarDate(scheduledDate.slice(0, 10))
    date.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0)
    return date
  }
  const startValue = hrField(raw, 'startDateTime', 'startAt')
  const endValue = hrField(raw, 'endDateTime', 'endAt')
  const start = startValue != null ? calendarDate(startValue) : atTime(hrField(raw, 'startTime'))
  const endTime = hrField(raw, 'endTime')
  const end = endValue != null ? calendarDate(endValue) : endTime != null ? atTime(endTime) : new Date(start)
  if (endValue == null && endTime != null && end < start) end.setDate(end.getDate() + 1)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return fail()
  return {
    id, title, description: hrField(raw, 'description'), start, end,
    type: 'classes', source: 'classes', allDay: false, status: hrField(raw, 'status'),
    location: hrField(raw, 'location', 'meetingPlatform'), raw,
  }
}

export function normalizeCalendar(response, source = 'events') {
  const value = source === 'classes' ? unwrapHrData(response) : null
  const items = source === 'classes' && Array.isArray(value) ? value
    : source === 'classes' && Array.isArray(value?.classes) ? value.classes
      : source === 'classes' && Array.isArray(value?.liveClasses) ? value.liveClasses
        : calendarList(response)
  if (!items.length) return []
  if (source === 'leaves') return items.map(mapCalendarLeave)
  if (source === 'classes') return items.map(mapCalendarClass)
  if (source === 'holidays') {
    throw new Error(`${source}: a verified response DTO is required for non-empty records.`)
  }
  return items.map(raw => {
    const start = calendarDate(hrField(raw, 'startDateTime'))
    const endValue = hrField(raw, 'endDateTime')
    const end = endValue == null ? start : calendarDate(endValue)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      throw new Error(`${source}: calendar dates could not be mapped. A verified response DTO is required.`)
    }
    return {
      id: hrField(raw, 'eventId', 'id'), title: hrField(raw, 'title'), description: hrField(raw, 'description'),
      type: calendarType(hrField(raw, 'eventType')), start, end,
      allDay: hrField(raw, 'allDay') === true, status: hrField(raw, 'status'), location: hrField(raw, 'location'), source, raw,
    }
  })
}

export function mergeCalendar(sources) {
  const records = new Map()
  for (const event of sources.flat()) {
    // Only a shared eventId proves cross-endpoint identity; generic IDs are scoped.
    const eventId = hrField(event.raw, 'eventId')
    const key = eventId != null ? `event:${eventId}` : event.id != null ? `${event.source}:${event.id}` : event
    if (!records.has(key)) records.set(key, event)
  }
  return [...records.values()].sort((a, b) => a.start - b.start)
}

export function inCalendarMonth(event, month) {
  const { start, next } = calendarMonthRange(month)
  return event.start < next && event.end >= start
}

export function calendarOnDay(event, date) {
  const first = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return event.start < next && event.end >= first
}

// Calendar pagination uses the existing API service and preserves the requested range.
export async function loadCalendarEvents(api, params, signal) {
  const events = []
  const seen = new Set()
  for (let page = 1; page <= 1000; page++) {
    const payload = await api.list({ ...params, PageNumber: page }, signal)
    const rows = calendarList(payload)
    const pages = hrField(payload, 'totalPages')
    const total = payload.totalCount
    // Stop a backend that ignores PageNumber instead of sending repeated requests.
    const signature = JSON.stringify(rows)
    if (seen.has(signature)) throw new Error('Calendar pagination repeated a page; the backend must honor PageNumber.')
    seen.add(signature)
    if (signal?.aborted) throw new Error('Calendar request cancelled.')
    events.push(...rows)
    if (!rows.length && (total != null && events.length < Number(total) || pages != null && page < Number(pages))) throw new Error('Calendar pagination ended before all records were returned.')
    if (!rows.length || (pages != null && page >= Number(pages)) || (total != null && events.length >= Number(total)) || (pages == null && total == null && rows.length < params.PageSize)) return events
  }
  throw new Error('Calendar pagination limit exceeded.')
}
