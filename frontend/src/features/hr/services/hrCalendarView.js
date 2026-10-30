// Date maths for the HR calendar workspace (HrCalendarWorkspace). All dates
// are local wall-clock dates; events come from normalizeCalendar() with Date
// start/end values and an allDay flag. Weeks start on Sunday, as the HR
// calendar always has.

export const DAY_MS = 86400000
export const VIEWS = ['day', 'week', 'month', 'agenda']

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
export const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes())
export const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
export const startOfWeek = (date) => addDays(startOfDay(date), -date.getDay())
export const monthOf = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
export const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * The days a view shows for an anchor date: one day, the anchor's week, or
 * the anchor's month padded to whole weeks (35 or 42 cells).
 */
export function viewDays(view, anchor) {
  if (view === 'day') return [startOfDay(anchor)]
  if (view === 'week') return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchor), index))
  const first = monthOf(anchor)
  const start = startOfWeek(first)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
  const count = Math.ceil((first.getDay() + last.getDate()) / 7) * 7
  return Array.from({ length: count }, (_, index) => addDays(start, index))
}

/**
 * The data window loaded for a month: the whole month grid, so any week of
 * the month (including days that spill into the neighbouring months) is
 * complete. Returns { start, end } with end at 23:59:59.999.
 */
export function calendarWindow(month) {
  const days = viewDays('month', month)
  const end = addDays(days[days.length - 1], 1)
  return { start: days[0], end: new Date(end.getTime() - 1) }
}

/** The next anchor date when stepping a view forwards (+1) or backwards (-1). */
export function shiftAnchor(view, anchor, step) {
  if (view === 'day') return addDays(anchor, step)
  if (view === 'week') return addDays(anchor, step * 7)
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + step, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(anchor.getDate(), lastDay))
}

/** "21 October 2026", "19 – 25 Oct 2026", "29 Dec 2026 – 4 Jan 2027" or "October 2026". */
export function rangeLabel(view, anchor) {
  if (view === 'day') return anchor.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (view === 'month' || view === 'agenda') return anchor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const days = viewDays('week', anchor)
  const [first, last] = [days[0], days[6]]
  if (first.getFullYear() !== last.getFullYear()) {
    return `${first.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${first.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  return `${first.getDate()} – ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/**
 * True when an event belongs in the all-day lane: flagged all-day, or a timed
 * event that runs past midnight into another day.
 */
export const isAllDayLane = (event) => event.allDay || !sameDay(event.start, new Date(event.end.getTime() - 1))

/** Whether an event touches a day. All-day ends are inclusive (as the API sends them). */
export function onDay(event, day) {
  const first = startOfDay(day)
  const next = addDays(first, 1)
  if (event.allDay) return event.start < next && startOfDay(event.end) >= first
  // A timed event ending exactly at midnight does not touch the next day.
  return event.start < next && event.end > first || event.start.getTime() === event.end.getTime() && sameDay(event.start, day)
}

/**
 * Positions the timed events of one day: each gets top/height in minutes
 * from midnight (clipped to the day) and column/columns so overlapping
 * events sit side by side instead of hiding each other.
 */
export function layoutDay(events, day) {
  const first = startOfDay(day).getTime()
  const items = events
    .filter((event) => !isAllDayLane(event) && onDay(event, day))
    .map((event) => {
      const top = Math.max(0, (event.start.getTime() - first) / 60000)
      const bottom = Math.min(1440, Math.max(top + 15, (event.end.getTime() - first) / 60000))
      return { event, top, bottom }
    })
    .sort((a, b) => a.top - b.top || b.bottom - a.bottom)
  const placed = []
  let cluster = []
  let clusterEnd = -1
  const close = () => {
    const columns = Math.max(1, ...cluster.map((item) => item.column + 1))
    cluster.forEach((item) => { item.columns = columns })
    cluster = []
  }
  for (const item of items) {
    if (cluster.length && item.top >= clusterEnd) close()
    const used = new Set(cluster.filter((other) => other.bottom > item.top).map((other) => other.column))
    let column = 0
    while (used.has(column)) column += 1
    item.column = column
    cluster.push(item)
    placed.push(item)
    clusterEnd = Math.max(clusterEnd, item.bottom)
  }
  if (cluster.length) close()
  return placed.map(({ event, top, bottom, column, columns }) => ({ event, top, height: bottom - top, column, columns }))
}

/** Snaps minutes-from-midnight to a step (default 15 minutes) within the day. */
export const snapMinutes = (minutes, step = 15) => Math.min(1440, Math.max(0, Math.round(minutes / step) * step))

/** A Date for a day plus minutes from midnight. */
export const atMinutes = (day, minutes) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes)

/** Events grouped by day for the agenda: [{ day, events }] for days that have any. */
export function agendaDays(events, days) {
  return days
    .map((day) => ({ day, events: events.filter((event) => onDay(event, day)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start) }))
    .filter((entry) => entry.events.length)
}
