import { expect, it } from 'vitest'
import {
  agendaDays, atMinutes, calendarWindow, isAllDayLane, layoutDay, onDay, rangeLabel, shiftAnchor, snapMinutes, viewDays,
} from '../../src/features/hr/services/hrCalendarView'

// Test-only events in the shape normalizeCalendar() returns.
const ev = (id, start, end, allDay = false) => ({ id, title: `Event ${id}`, start, end, allDay, source: 'events', type: 'meetings' })
const at = (day, h, m = 0) => new Date(2026, 9, day, h, m)

it('builds Sunday-first weeks and whole-week month grids with correct boundaries', () => {
  const week = viewDays('week', new Date(2026, 9, 21))
  expect(week).toHaveLength(7)
  expect(week[0]).toEqual(new Date(2026, 9, 18))
  expect(week[0].getDay()).toBe(0)
  const month = viewDays('month', new Date(2026, 9, 21))
  expect(month[0]).toEqual(new Date(2026, 8, 27))
  expect(month).toHaveLength(35)
  expect(month.at(-1)).toEqual(new Date(2026, 9, 31))
  // February 2026 starts on a Sunday and fills exactly four weeks.
  expect(viewDays('month', new Date(2026, 1, 10))).toHaveLength(28)
  expect(viewDays('day', at(21, 15))).toEqual([new Date(2026, 9, 21)])
})

it('loads the whole month grid as the data window', () => {
  const { start, end } = calendarWindow(new Date(2026, 9, 1))
  expect(start).toEqual(new Date(2026, 8, 27))
  expect(end).toEqual(new Date(2026, 9, 31, 23, 59, 59, 999))
})

it('steps each view and keeps the day of month valid', () => {
  expect(shiftAnchor('day', new Date(2026, 9, 31), 1)).toEqual(new Date(2026, 10, 1))
  expect(shiftAnchor('week', new Date(2026, 9, 28), 1)).toEqual(new Date(2026, 10, 4))
  expect(shiftAnchor('month', new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28))
  expect(shiftAnchor('agenda', new Date(2026, 9, 21), -1)).toEqual(new Date(2026, 8, 21))
})

it('labels ranges across months and years', () => {
  expect(rangeLabel('week', new Date(2026, 9, 21))).toBe('18 – 24 Oct 2026')
  expect(rangeLabel('week', new Date(2026, 9, 28))).toBe('25 – 31 Oct 2026')
  expect(rangeLabel('week', new Date(2026, 6, 1))).toBe('28 Jun – 4 Jul 2026')
  expect(rangeLabel('week', new Date(2026, 11, 30))).toBe('27 Dec 2026 – 2 Jan 2027')
  expect(rangeLabel('month', new Date(2026, 9, 21))).toBe('October 2026')
})

it('places overlapping events side by side without hiding any', () => {
  const day = new Date(2026, 9, 21)
  const placed = layoutDay([
    ev(1, at(21, 9), at(21, 10)),
    ev(2, at(21, 9, 30), at(21, 11)),
    ev(3, at(21, 10, 30), at(21, 11, 30)),
    ev(4, at(21, 13), at(21, 14)),
  ], day)
  const byId = Object.fromEntries(placed.map((item) => [item.event.id, item]))
  expect(byId[1]).toMatchObject({ top: 540, height: 60, column: 0, columns: 2 })
  expect(byId[2]).toMatchObject({ column: 1, columns: 2 })
  // Event 3 starts after event 1 ends, so it reuses column 0 beside event 2.
  expect(byId[3]).toMatchObject({ column: 0, columns: 2 })
  expect(byId[4]).toMatchObject({ column: 0, columns: 1 })
})

it('sends all-day and overnight events to the all-day lane and clips correctly', () => {
  expect(isAllDayLane(ev(1, new Date(2026, 9, 21), new Date(2026, 9, 21), true))).toBe(true)
  expect(isAllDayLane(ev(2, at(21, 22), at(22, 2)))).toBe(true)
  expect(isAllDayLane(ev(3, at(21, 22), at(22, 0)))).toBe(false)
  // An all-day leave ending on the 22nd covers the 21st and the 22nd, not the 23rd.
  const leave = ev(4, new Date(2026, 9, 21), new Date(2026, 9, 22), true)
  expect([20, 21, 22, 23].map((day) => onDay(leave, new Date(2026, 9, day)))).toEqual([false, true, true, false])
  // A timed event ending exactly at midnight does not spill into the next day.
  expect(onDay(ev(5, at(21, 22), at(22, 0)), new Date(2026, 9, 22))).toBe(false)
})

it('snaps a selection to 15 minutes within the day and lists agenda days in order', () => {
  expect(snapMinutes(68)).toBe(75)
  expect(snapMinutes(-20)).toBe(0)
  expect(snapMinutes(1500)).toBe(1440)
  expect(atMinutes(new Date(2026, 9, 21), 570)).toEqual(at(21, 9, 30))
  const days = viewDays('week', new Date(2026, 9, 21))
  const groups = agendaDays([ev(1, at(23, 10), at(23, 11)), ev(2, new Date(2026, 9, 23), new Date(2026, 9, 23), true), ev(3, at(19, 9), at(19, 10))], days)
  expect(groups.map((group) => group.day.getDate())).toEqual([19, 23])
  expect(groups[1].events.map((event) => event.id)).toEqual([2, 1])
})
