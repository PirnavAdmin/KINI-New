import { hrError, hrField } from './hrApi'
import { completeCollection, resolveHrEmployee } from './hrEmployeeRecords'

export const employeeAttendancePath = id => `/employee/hr-attendance/employee/${encodeURIComponent(id)}`
export const attendanceId = row => hrField(row, 'attendanceId', 'id')
export const attendanceStatus = row => String(hrField(row, 'status') ?? '').trim().toLowerCase().replace(/[\s_-]/g, '')
export const attendanceStatusLabel = value => ({ present: 'Present', absent: 'Absent', pending: 'Pending', latecheckout: 'Late Checkout', late: 'Late', onleave: 'On Leave', wfh: 'Work From Home', workfromhome: 'Work From Home' })[value] ?? value
export function attendanceSummary(rows) {
  const count = status => rows.filter(row => attendanceStatus(row) === status).length
  const present = count('present'), late = count('late'), wfh = count('wfh') + count('workfromhome')
  // Same Presence Rate formula as AttendanceManagement's liveStats KPI.
  return { total: rows.length, present, absent: count('absent'), late, onLeave: count('onleave'), rate: Math.round((present + late + wfh) / Math.max(rows.length, 1) * 100) }
}
export function filterAttendance(rows, filters) {
  return rows.filter(row => {
    const date = String(hrField(row, 'date', 'attendanceDate') ?? '').slice(0, 10)
    return (!filters.status || attendanceStatus(row) === filters.status)
      && (!filters.from || (date && date >= filters.from)) && (!filters.to || (date && date <= filters.to))
  })
}
export async function loadEmployeeAttendance(identifier, { readEmployee, signal }) {
  const [attendance, directory] = await Promise.allSettled([
    completeCollection('attendance', signal), readEmployee ? completeCollection('employees', signal) : Promise.resolve([]),
  ])
  if (signal.aborted) return null
  const state = { loading: false, rows: [], employee: null }
  if (attendance.status === 'rejected') state.historyError = attendance.reason.response ? hrError(attendance.reason, 'attendance') : attendance.reason.message
  if (directory.status === 'rejected') state.employeeError = hrError(directory.reason, 'employees')
  try { Object.assign(state, resolveHrEmployee(identifier, directory.status === 'fulfilled' ? directory.value : [], attendance.status === 'fulfilled' ? attendance.value : [])) }
  catch (error) { state.historyError = error.message; state.employeeError = error.message }
  return state
}
