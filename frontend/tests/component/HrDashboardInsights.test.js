import { expect, it } from 'vitest'
import {
  attendanceSeries, attendanceToday, departmentShares, filterLeaves, leaveDays, leaveStatusKey, upcomingItems,
} from '../../src/features/hr/services/hrDashboardInsights'

// Test-only rows in the HR API shapes.
const TODAY = new Date(2026, 9, 21, 10, 0)
const att = (date, status) => ({ date: `${date}T09:00:00`, status })

it('counts only today for the Present / On Leave KPIs', () => {
  const history = [att('2026-10-21', 'Present'), att('2026-10-21', 'WFH'), att('2026-10-21', 'OnLeave'), att('2026-10-21', 'Absent'), att('2026-10-20', 'Present')]
  expect(attendanceToday(history, TODAY)).toEqual({ recorded: 4, present: 2, onLeave: 1, absent: 1 })
  expect(attendanceToday([], TODAY)).toEqual({ recorded: 0, present: 0, onLeave: 0, absent: 0 })
})

it('builds one entry per day for the chosen range, leaving unrecorded days empty', () => {
  const series = attendanceSeries([att('2026-10-21', 'Present'), att('2026-10-21', 'Absent'), att('2026-10-19', 'OnLeave'), att('2026-10-01', 'Present')], 7, TODAY)
  expect(series).toHaveLength(7)
  expect(series[0].date).toBe('2026-10-15')
  expect(series.at(-1)).toMatchObject({ date: '2026-10-21', present: 1, absent: 1, onLeave: 0, recorded: 2 })
  expect(series.find((day) => day.date === '2026-10-19')).toMatchObject({ onLeave: 1, recorded: 1 })
  // No records that day: a gap, not a false zero.
  expect(series.find((day) => day.date === '2026-10-20')).toMatchObject({ present: null, recorded: 0 })
  expect(attendanceSeries([], 30, TODAY)).toHaveLength(30)
})

it('turns department counts into whole percentages of the real total', () => {
  expect(departmentShares([['Academic', 2], ['HR', 1], ['Unassigned', 1]], 4)).toEqual([
    { name: 'Academic', count: 2, share: 50 }, { name: 'HR', count: 1, share: 25 }, { name: 'Unassigned', count: 1, share: 25 },
  ])
  expect(departmentShares([], 0)).toEqual([])
})

const LEAVES = [
  { leaveId: 1, employeeName: 'Srinivas Poorna', leaveType: 'Casual', fromDate: '2026-10-19', toDate: '2026-10-19', status: 'Approved' },
  { leaveId: 2, employeeName: 'Lakshmilahari Gandikota', leaveType: 'Work From Home', fromDate: '2026-10-19', toDate: '2026-10-19', status: 'Approved' },
  { leaveId: 3, employeeName: 'Lakshmilahari Gandikota', leaveType: 'Casual', fromDate: '2026-10-16', toDate: '2026-10-17', status: 'Rejected' },
  { leaveId: 4, employeeName: 'Kiran Babu', leaveType: 'Sick', fromDate: '2026-10-21', toDate: '2026-10-23', status: 'Pending Approval' },
]

it('filters leave by name, type, status and overlapping dates, pending first', () => {
  expect(filterLeaves(LEAVES).map((row) => row.leaveId)).toEqual([4, 1, 2, 3])
  expect(filterLeaves(LEAVES, { query: 'lakshmi' }).map((row) => row.leaveId)).toEqual([2, 3])
  expect(filterLeaves(LEAVES, { type: 'Casual' }).map((row) => row.leaveId)).toEqual([1, 3])
  expect(filterLeaves(LEAVES, { status: 'pending' }).map((row) => row.leaveId)).toEqual([4])
  // A window from the 17th catches the leave that ends on the 17th.
  expect(filterLeaves(LEAVES, { from: '2026-10-17', to: '2026-10-18' }).map((row) => row.leaveId)).toEqual([3])
  expect(leaveStatusKey('')).toBe('pending')
})

it('uses the stated day count, else counts the dates inclusively', () => {
  expect(leaveDays({ numberOfDays: 2 })).toBe(2)
  expect(leaveDays({ fromDate: '2026-10-21', toDate: '2026-10-23' })).toBe(3)
  expect(leaveDays({})).toBeNull()
})

it('merges future events and live classes, soonest first', () => {
  const items = upcomingItems({
    calendar: [
      { eventId: 1, title: 'Team Meeting', eventType: 'Meeting', startDateTime: '2026-10-21T15:00:00', endDateTime: '2026-10-21T16:00:00' },
      { eventId: 2, title: 'Past event', startDateTime: '2026-10-01T10:00:00', endDateTime: '2026-10-01T11:00:00' },
    ],
    schedule: [{ id: 9, title: 'React Live Class', startAt: '2026-10-21T11:00:00', endAt: '2026-10-21T12:00:00', batchName: 'React 1' }],
  }, TODAY)
  expect(items.map((item) => [item.title, item.kind])).toEqual([['React Live Class', 'Live Class'], ['Team Meeting', 'Meeting']])
})
