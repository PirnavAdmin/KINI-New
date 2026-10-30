import { expect, it } from 'vitest'
import { attendanceRowsOf, normalizeAttendanceRow, summarizeAttendance } from '@/pages/students/studentAttendance'

const rows = (statuses) => statuses.map((status, index) => normalizeAttendanceRow({ attendanceId: index, status }, index))

it('counts Present and Late as attended, like Student Details', () => {
  expect(summarizeAttendance(rows(['Present', 'Late', 'Absent', 'absent']))).toEqual({ percentage: 50, attended: 2, total: 4 })
})

it('reports no records as null, never as 0%', () => {
  expect(summarizeAttendance([])).toBeNull()
})

it('keeps a real 0% when classes were recorded but missed', () => {
  expect(summarizeAttendance(rows(['Absent', 'Absent']))).toEqual({ percentage: 0, attended: 0, total: 2 })
})

it('reads isPresent rows and both list payload shapes', () => {
  expect(normalizeAttendanceRow({ isPresent: true }, 0).status).toBe('Present')
  expect(attendanceRowsOf([{ id: 1 }])).toHaveLength(1)
  expect(attendanceRowsOf({ items: [{ id: 1 }, { id: 2 }] })).toHaveLength(2)
  expect(attendanceRowsOf(null)).toEqual([])
})
