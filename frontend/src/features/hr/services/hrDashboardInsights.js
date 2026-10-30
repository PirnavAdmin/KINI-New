// Pure calculations behind the HR dashboard (HRDashboardView /
// HRDashboardOverview). Every figure is derived from the rows the HR APIs
// returned; nothing here invents data.
import { hrField } from './hrApi'
import { displayText } from './hrDashboardData'

/** Local calendar day "YYYY-MM-DD", or "" for a missing/invalid date. */
export const dayKey = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Same status rules the dashboard has always used for its Present / On Leave counts.
const PRESENT = ['present', 'working', 'late', 'wfh', 'workfromhome']
/** "present" | "onLeave" | "absent" | "" for one attendance row. */
export const attendanceKind = (row) => {
  const status = String(hrField(row, 'status') || '').toLowerCase().replace(/[ _-]/g, '')
  if (PRESENT.includes(status)) return 'present'
  if (status === 'onleave') return 'onLeave'
  if (status === 'absent') return 'absent'
  return ''
}
export const attendanceDay = (row) => dayKey(hrField(row, 'date', 'attendanceDate', 'checkInTime', 'checkIn'))

/** Today's attendance: { recorded, present, onLeave, absent }. */
export function attendanceToday(history, today = new Date()) {
  const key = dayKey(today)
  const rows = history.filter((row) => attendanceDay(row) === key)
  const count = (kind) => rows.filter((row) => attendanceKind(row) === kind).length
  return { recorded: rows.length, present: count('present'), onLeave: count('onLeave'), absent: count('absent') }
}

/**
 * One entry per calendar day in the last `days` days (oldest first). Days with
 * no attendance records keep `recorded: 0` and null counts, so the chart shows
 * a gap rather than a false zero.
 */
export function attendanceSeries(history, days = 7, today = new Date()) {
  const byDay = new Map()
  for (const row of history) {
    const key = attendanceDay(row)
    const kind = attendanceKind(row)
    if (!key) continue
    const entry = byDay.get(key) ?? { present: 0, onLeave: 0, absent: 0, recorded: 0 }
    entry.recorded += 1
    if (kind) entry[kind] += 1
    byDay.set(key, entry)
  }
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - index))
    const key = dayKey(date)
    const entry = byDay.get(key)
    return {
      date: key,
      label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      present: entry ? entry.present : null,
      onLeave: entry ? entry.onLeave : null,
      absent: entry ? entry.absent : null,
      recorded: entry?.recorded ?? 0,
    }
  })
}

/** [{ name, count, share }] sorted by size; share is a whole percentage of `total`. */
export function departmentShares(departments, total) {
  return departments.map(([name, count]) => ({ name, count, share: total ? Math.round((count / total) * 100) : 0 }))
}

export const leaveStatusKey = (value) => {
  const status = String(value || '').trim().toLowerCase()
  if (!status || ['pending', 'pending approval', 'submitted', 'awaiting approval'].includes(status)) return 'pending'
  if (status.includes('approv')) return 'approved'
  if (status.includes('reject')) return 'rejected'
  if (status.includes('cancel')) return 'cancelled'
  return status
}

/** Leave rows matching { query, type, status, from, to }; pending requests first, then newest. */
export function filterLeaves(rows, { query = '', type = 'all', status = 'all', from = '', to = '' } = {}) {
  const needle = query.trim().toLowerCase()
  const order = { pending: 0, approved: 1, rejected: 2, cancelled: 3 }
  return rows
    .filter((row) => {
      if (status !== 'all' && leaveStatusKey(hrField(row, 'status')) !== status) return false
      if (type !== 'all' && displayText(hrField(row, 'leaveType', 'type')) !== type) return false
      const start = String(hrField(row, 'fromDate', 'startDate') || '').slice(0, 10)
      const end = String(hrField(row, 'toDate', 'endDate') || '').slice(0, 10) || start
      // A request matches a date window when the two ranges overlap.
      if (from && end && end < from) return false
      if (to && start && start > to) return false
      if (needle && !String(hrField(row, 'employeeName', 'fullName') || '').toLowerCase().includes(needle)) return false
      return true
    })
    .sort((a, b) => (order[leaveStatusKey(hrField(a, 'status'))] ?? 9) - (order[leaveStatusKey(hrField(b, 'status'))] ?? 9)
      || String(hrField(b, 'fromDate', 'startDate') || '').localeCompare(String(hrField(a, 'fromDate', 'startDate') || '')))
}

/** Inclusive day count for a leave row: the API's own figure, else from its dates. */
export function leaveDays(row) {
  const stated = Number(hrField(row, 'numberOfDays', 'days', 'totalDays'))
  if (Number.isFinite(stated) && stated > 0) return stated
  const start = new Date(String(hrField(row, 'fromDate', 'startDate') || '').slice(0, 10))
  const end = new Date(String(hrField(row, 'toDate', 'endDate') || '').slice(0, 10))
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

/**
 * Upcoming calendar events and live classes in one list, soonest first.
 * Each item: { id, title, start (Date), kind: "Event" | "Live Class", detail }.
 */
export function upcomingItems({ calendar = [], schedule = [] }, now = new Date(), limit = 4) {
  const time = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? date : null }
  const events = calendar.map((row, index) => ({
    id: `event-${hrField(row, 'eventId', 'id') ?? index}`,
    title: displayText(hrField(row, 'title', 'eventName')),
    start: time(hrField(row, 'startDateTime', 'startDate')),
    end: time(hrField(row, 'endDateTime', 'endDate')),
    kind: displayText(hrField(row, 'eventType')) || 'Event',
    detail: displayText(hrField(row, 'location', 'audience')),
  }))
  const classes = schedule.map((row, index) => ({
    id: `class-${row.id ?? index}`,
    title: displayText(row.title),
    start: time(row.startAt),
    end: time(row.endAt),
    kind: 'Live Class',
    detail: [displayText(row.batchName), displayText(row.mentorName)].filter(Boolean).join(' · '),
  }))
  return [...events, ...classes]
    .filter((item) => item.title && item.start && (item.end ?? item.start) >= now)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit)
}
