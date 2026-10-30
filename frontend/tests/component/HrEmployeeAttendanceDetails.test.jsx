import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import apiClient from '@shared/services/apiClient'
import HrApiModule from '@features/hr/components/HrApiModule'
import EmployeeAttendanceDetails from '@features/hr/pages/EmployeeAttendanceDetails'
import { attendanceSummary, attendanceStatus, employeeAttendancePath } from '@features/hr/services/hrEmployeeAttendanceData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const access = vi.hoisted(() => ({ edit: true, attendance: true, employees: true }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: module => module === 'attendance' ? access.attendance : access.employees, can: () => access.edit, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, hero }) => <main>{hero}{children}</main> }))
// Illustrative fixtures only: no application fallback records.
const employee = { employeeId: 17, employeeCode: 'EMP-X', fullName: 'Selected Person', email: 'person@example.test', role: 'Employee', employmentType: 'Full Time' }
const attendance = (id, status = 'PRESENT', overrides = {}) => ({ attendanceId: id, employeeId: 'EMP-X', employeeName: employee.fullName, date: `2026-10-${String(id).padStart(2, '0')}`, checkIn: '08:31 AM', checkOut: null, workingHours: '0h 0m', status, ...overrides })
let records
const response = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => {
  vi.clearAllMocks(); access.edit = true; access.attendance = true; access.employees = true
  HTMLElement.prototype.scrollTo = vi.fn()
  records = [attendance(1), attendance(2, 'Late_Checkout'), attendance(3, 'Absent'), attendance(4, 'Late'), attendance(5, 'ON_LEAVE'), attendance(6, 'Pending'), attendance(7, 'PRESENT', { employeeId: 99, checkIn: 'Other Person Time' })]
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/attendance') return response({ attendance: records, totalPages: 1, totalCount: records.length })
    if (request.url === '/api/hr/employees') return response([employee])
    if (request.url === '/api/hr/attendance/1' && request.method === 'PUT') { records = records.map(row => row.attendanceId === 1 ? { ...row, ...request.data } : row); return response({}) }
    if (request.url === '/api/hr/attendance/1') return response(records[0])
    return response([])
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const mount = () => render(<MemoryRouter initialEntries={['/employee/hr-attendance/employee/EMP-X']}><Routes><Route path="/employee/hr-attendance/employee/:employeeId" element={<EmployeeAttendanceDetails />} /><Route path="/employee/hr-attendance" element={<p>Attendance main page</p>} /></Routes></MemoryRouter>)
const loaded = () => screen.findByText('Email: person@example.test', {}, { timeout: 5000 })

it('normalizes supported statuses and preserves the existing presence-rate formula', () => {
  expect(attendanceStatus(attendance(1, 'LATE_CHECKOUT'))).toBe('latecheckout')
  expect(attendanceSummary(records.slice(0, 6))).toEqual({ total: 6, present: 1, absent: 1, late: 1, onLeave: 1, rate: 33 })
  expect(attendanceSummary([]).rate).toBe(0)
  expect(employeeAttendancePath('employee/9')).toBe('/employee/hr-attendance/employee/employee%2F9')
})
it('loads real directory identity and only the selected employee records using existing collections', async () => {
  mount(); await loaded()
  expect(screen.getByText('Employee ID: 17')).toBeInTheDocument()
  expect(screen.getByText('Employee Code: EMP-X')).toBeInTheDocument()
  expect(screen.getByText('Employment Type: Full Time')).toBeInTheDocument()
  expect(screen.getByText('33%')).toBeInTheDocument()
  expect(screen.queryByText('Other Person Time')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/attendance', params: { Page: 1, Limit: 100 } }))
  expect(apiClient.request.mock.calls.some(([request]) => request.url.includes('/employee/'))).toBe(false)
  expect(screen.queryByRole('columnheader', { name: 'Employee Name' })).not.toBeInTheDocument()
})
it('makes the avatar/name button navigate while checkboxes remain independent', async () => {
  render(<MemoryRouter initialEntries={['/employee/hr-attendance']}><Routes><Route path="/employee/hr-attendance" element={<HrApiModule module="attendance" />} /><Route path="/employee/hr-attendance/employee/:employeeId" element={<EmployeeAttendanceDetails />} /></Routes></MemoryRouter>)
  const names = await screen.findAllByRole('button', { name: 'Selected Person' }, { timeout: 5000 })
  expect(names[0].querySelector('.hrl-avatar')).not.toBeNull()
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0])
  expect(screen.queryByText('Employee ID: 17')).not.toBeInTheDocument()
  fireEvent.click(names[0]); await loaded()
})
it('filters dates/status only after scoping and resets/history/back work', async () => {
  mount(); await loaded()
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'latecheckout' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  expect(screen.getByText('2026-10-02')).toBeInTheDocument()
  expect(screen.queryByText('2026-10-01')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'History' }))
  fireEvent.change(screen.getByLabelText('From Date'), { target: { value: '2026-10-03' } })
  fireEvent.change(screen.getByLabelText('To Date'), { target: { value: '2026-10-04' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  expect(screen.queryByText('2026-10-02')).not.toBeInTheDocument()
  expect(screen.getByText('2026-10-03')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(screen.getByText('2026-10-01')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('link', { name: 'Back to Attendance' }))
  expect(screen.getByText('Attendance main page')).toBeInTheDocument()
})
it('paginates the scoped table and follows backend pagination', async () => {
  records = Array.from({ length: 12 }, (_, index) => attendance(index + 1))
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(async request => request.url === '/api/hr/attendance' ? response({ items: request.params.Page === 1 ? records.slice(0, 10) : records.slice(10), totalPages: 2, totalCount: 12 }) : implementation(request))
  mount(); await loaded()
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(screen.getByText('2026-10-11')).toBeInTheDocument()
  expect(screen.queryByText('2026-10-01')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/attendance', params: { Page: 2, Limit: 100 } }))
})
it('edits using the existing exact attendance DTO and refreshes history', async () => {
  mount(); await loaded()
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit', exact: true })[0])
  await screen.findByRole('heading', { name: 'Edit Attendance' })
  fireEvent.change(screen.getByRole('textbox', { name: 'Status' }), { target: { value: 'Absent' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/attendance/1', method: 'PUT', data: { status: 'Absent', checkIn: '08:31 AM', checkOut: null } })))
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/attendance')).toHaveLength(2))
})
it('handles empty attendance and missing profile data without invented rows', async () => {
  records = []; mount(); await loaded()
  expect(screen.getByText('No attendance records found for this employee.')).toBeInTheDocument()
  expect(screen.getByText('0%')).toBeInTheDocument()
})
it('reports attendance errors and supports retry', async () => {
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/attendance' ? Promise.reject({ response: { status: 500 } }) : implementation(request))
  mount(); expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load attendance records.')
  apiClient.request.mockImplementation(implementation)
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await screen.findByText('2026-10-01')
})
it('respects attendance and employee directory permissions', async () => {
  access.edit = false; access.employees = false; mount()
  await screen.findByText('2026-10-01')
  expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  expect(apiClient.request.mock.calls.some(([request]) => request.url === '/api/hr/employees')).toBe(false)
  cleanup(); vi.clearAllMocks(); access.attendance = false; mount()
  expect(screen.getByRole('alert')).toHaveTextContent('permission')
  expect(apiClient.request).not.toHaveBeenCalled()
})
it('ignores a late response after leaving the employee page', async () => {
  let resolve
  apiClient.request.mockReturnValueOnce(new Promise(done => { resolve = done }))
  const view = mount(); view.unmount()
  await act(async () => resolve(response(records)))
  expect(screen.queryByText('2026-10-01')).not.toBeInTheDocument()
})
