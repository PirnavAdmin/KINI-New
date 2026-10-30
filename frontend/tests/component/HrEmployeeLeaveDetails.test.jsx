import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import apiClient from '@shared/services/apiClient'
import EmployeeLeaveDetails from '@features/hr/pages/EmployeeLeaveDetails'
import HrApiModule from '@features/hr/components/HrApiModule'
import { employeeLeaveRows, employeeLeaveSummary, employeeLeavePath, loadEmployeeLeaveProfile, resolveLeaveEmployee } from '@features/hr/services/hrEmployeeLeaveData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const access = vi.hoisted(() => ({ review: true, leave: true, employees: true }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ isLoading: false, hasPermission: module => module === 'leave' ? access.leave : access.employees, can: () => access.review }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, hero }) => <main>{hero}{children}</main> }))
// Illustrative API contract inputs, used only in tests.
const employee = { employeeId: 'employee-9', fullName: 'Selected Employee', role: 'Employee', email: 'selected@example.test' }
const leave = (id, status, extra = {}) => ({ leaveId: id, employeeId: employee.employeeId, employeeName: employee.fullName, leaveType: 'Sick', fromDate: '2026-10-01', toDate: '2026-10-02', days: 2, reason: `Reason ${id}`, status, createdAt: '2026-09-29', ...extra })
let records
const response = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => {
  vi.clearAllMocks(); access.review = true; access.leave = true; access.employees = true
  HTMLElement.prototype.scrollTo = vi.fn()
  records = [leave(41, 'Pending'), leave(42, 'Approved'), leave(43, 'Rejected'), leave(90, 'Pending', { employeeId: 'other', reason: 'Other employee secret' })]
  apiClient.request.mockImplementation(async request => {
    if (request.url.endsWith('/approve')) { records = records.map(row => row.leaveId === 41 ? { ...row, status: 'Approved' } : row); return response({}) }
    if (request.url.endsWith('/reject')) { records = records.map(row => row.leaveId === 41 ? { ...row, status: 'Rejected' } : row); return response({}) }
    if (request.url === '/api/hr/employees') return response({ items: [employee], totalPages: 1, totalCount: 1 })
    if (request.url.includes('/balance/')) return response({ employeeId: employee.employeeId, sick: { used: 2, available: 8 } })
    if (request.url === '/api/hr/leave/41') return response(records[0])
    if (request.url === '/api/hr/leave') return response({ items: records, totalPages: 1, totalCount: records.length })
    return response([])
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const mount = () => render(<MemoryRouter initialEntries={['/employee/hr-leave/employee/employee-9']}><Routes><Route path="/employee/hr-leave/employee/:employeeId" element={<EmployeeLeaveDetails />} /><Route path="/employee/hr-leave" element={<p>Back at Leave Management</p>} /></Routes></MemoryRouter>)
const loaded = async () => screen.findByText('Reason 41', {}, { timeout: 5000 })

it('keeps opaque employee IDs, rejects incomplete/malformed history and excludes another employee', () => {
  expect(employeeLeavePath('employee/9')).toBe('/employee/hr-leave/employee/employee%2F9')
  expect(employeeLeaveRows(records, employee.employeeId)).toHaveLength(3)
  expect(employeeLeaveSummary(employeeLeaveRows(records, employee.employeeId))).toEqual({ total: 3, approved: 1, pending: 1, rejected: 1, days: 6 })
  expect(() => employeeLeaveRows({ items: records, totalCount: 20 }, employee.employeeId)).toThrow(/incomplete/)
  expect(() => employeeLeaveRows({}, employee.employeeId)).toThrow()
  expect(employeeLeaveSummary([leave(1, 'Approved', { days: null })]).days).toBeNull()
})

it('loads selected profile, complete scoped history, counts and real balance', async () => {
  mount(); await loaded()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/leave', method: 'GET', params: { Page: 1, Limit: 100 }, signal: expect.any(AbortSignal) }))
  expect(screen.getByText('Email: selected@example.test')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'All (3)' })).toBeInTheDocument()
  expect(screen.queryByText('Other employee secret')).not.toBeInTheDocument()
  expect(screen.getByText('8')).toBeInTheDocument()
  expect(screen.getAllByText('29 Sep 2026')).toHaveLength(3)
})

it('navigates only through the employee name, using employeeId instead of leaveId', async () => {
  render(<MemoryRouter initialEntries={['/employee/hr-leave']}><Routes><Route path="/employee/hr-leave" element={<HrApiModule module="leave" />} /><Route path="/employee/hr-leave/employee/:employeeId" element={<EmployeeLeaveDetails />} /></Routes></MemoryRouter>)
  const names = await screen.findAllByRole('button', { name: 'Selected Employee' }, { timeout: 5000 })
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0])
  expect(screen.queryByText('Employee ID: employee-9')).not.toBeInTheDocument()
  fireEvent.click(names[0]); await loaded()
  expect(screen.getByText('Employee ID: employee-9')).toBeInTheDocument()
})

it('supports search, status/type/date filters, tabs, reset and back navigation', async () => {
  mount(); await loaded()
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'Reason 42' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
  expect(screen.queryByText('Reason 41')).not.toBeInTheDocument()
  expect(screen.getByText('Reason 42')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  fireEvent.click(screen.getByRole('tab', { name: 'Pending (1)' }))
  expect(screen.queryByText('Reason 42')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  fireEvent.change(screen.getByLabelText('From Date'), { target: { value: '2026-10-03' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
  expect(screen.getByText('No requests match these filters.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('link', { name: 'Back to Leave Management' }))
  expect(screen.getByText('Back at Leave Management')).toBeInTheDocument()
})

it('approves through existing PUT and refreshes employee KPIs/history/balance', async () => {
  mount(); await loaded()
  fireEvent.click(screen.getByRole('button', { name: 'Approve', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
  await screen.findByRole('tab', { name: 'Approved (2)' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/api/hr/leave/41/approve', data: undefined }))
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave')).toHaveLength(2)
  expect(apiClient.request.mock.calls.filter(([request]) => request.url.includes('/balance/'))).toHaveLength(2)
})

it('rejects using the documented rejectionReason DTO and refreshes counts', async () => {
  mount(); await loaded()
  fireEvent.click(screen.getByRole('button', { name: 'Reject', exact: true }))
  fireEvent.change(screen.getByLabelText('Rejection Reason'), { target: { value: 'Scheduling conflict' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findByRole('tab', { name: 'Rejected (2)' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/api/hr/leave/41/reject', data: { rejectionReason: 'Scheduling conflict' } }))
})

it('keeps failed approvals open without changing counts', async () => {
  mount(); await loaded()
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.method === 'PUT' ? Promise.reject({ response: { status: 500 } }) : implementation(request))
  fireEvent.click(screen.getByRole('button', { name: 'Approve', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled())
  expect(screen.getByRole('tab', { name: 'Pending (1)' })).toBeInTheDocument()
})

it('retains read-only history when review permission is absent', async () => {
  access.review = false; access.employees = false
  mount(); await loaded()
  expect(screen.queryByRole('button', { name: 'Approve', exact: true })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reject', exact: true })).not.toBeInTheDocument()
  expect(apiClient.request.mock.calls.some(([request]) => request.url === '/api/hr/employees')).toBe(false)
})

it('does not fetch without leave permission', () => {
  access.leave = false; mount()
  expect(screen.getByRole('alert')).toHaveTextContent('permission')
  expect(apiClient.request).not.toHaveBeenCalled()
})

it('reports history failure and retries without creating fake rows', async () => {
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/leave' ? Promise.reject({ response: { status: 403 } }) : implementation(request))
  mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('permission')
  expect(screen.queryByText('Reason 41')).not.toBeInTheDocument()
  apiClient.request.mockImplementation(implementation)
  fireEvent.click(screen.getByRole('button', { name: 'Retry' })); await loaded()
})

it('shows actual empty history and unavailable balance independently', async () => {
  records = []
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url.includes('/balance/') ? Promise.resolve(response(null)) : implementation(request))
  mount()
  expect(await screen.findByText('No leave requests are available for this employee.')).toBeInTheDocument()
  expect(screen.getByText('No leave balance information is available.')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'All (0)' })).toBeInTheDocument()
})

it('ignores stale employee data after leaving the page', async () => {
  let resolve
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/leave' ? new Promise(done => { resolve = done }) : implementation(request))
  const view = mount()
  view.unmount()
  await act(async () => resolve(response(records)))
  expect(screen.queryByText('Reason 41')).not.toBeInTheDocument()
})

it('resolves a display code from directory data and never derives an ID by parsing it', () => {
  const directory = [{ employeeId: 17, employeeCode: 'EMP-009', fullName: 'Real Directory Name', role: 'HR', email: 'real@example.test' }]
  const data = resolveLeaveEmployee('EMP-009', directory, [leave(1, 'APPROVED', { employeeId: 17 }), leave(2, 'PENDING', { employeeId: 'EMP-009' }), leave(3, 'REJECTED', { employeeId: 9 })])
  expect(data.backendEmployeeId).toBe(17)
  expect(data.displayCode).toBe('EMP-009')
  expect(data.rows.map(row => row.leaveId)).toEqual([1, 2])
  expect(resolveLeaveEmployee('EMP-009', [], records).backendEmployeeId).toBe('EMP-009')
  expect(resolveLeaveEmployee('unknown', [], [{ id: 'unknown', userId: 'unknown', employeeName: 'unknown' }]).rows).toEqual([])
})

it('loads a code route through working collections and uses the resolved ID for balance', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/employees') return response([{ employeeId: 17, employeeCode: 'EMP-009', fullName: 'Real Directory Name', role: 'HR', email: 'real@example.test' }])
    if (request.url === '/api/hr/leave') return response([leave(41, 'APPROVED', { employeeId: 17 }), leave(42, 'PENDING', { employeeId: 'EMP-009' }), leave(43, 'REJECTED', { employeeId: 17 })])
    if (request.url === '/api/hr/leave/balance/17') return response({ employeeId: 17, available: 0 })
    throw new Error('Unexpected detail endpoint')
  })
  render(<MemoryRouter initialEntries={['/employee/hr-leave/employee/EMP-009']}><Routes><Route path="/employee/hr-leave/employee/:employeeId" element={<EmployeeLeaveDetails />} /></Routes></MemoryRouter>)
  await screen.findByText('Email: real@example.test')
  expect(screen.getByText('Employee ID: 17')).toBeInTheDocument()
  expect(screen.getByText('Employee Code: EMP-009')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'All (3)' })).toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/leave/balance/17' }))
  expect(apiClient.request.mock.calls.some(([request]) => request.url.includes('/EMP-009'))).toBe(false)
})

it('follows collection pagination before computing complete employee totals', async () => {
  apiClient.request.mockImplementation(async request => request.url === '/api/hr/leave'
    ? response({ items: [leave(request.params.Page, request.params.Page === 1 ? 'APPROVED' : 'PENDING')], totalCount: 2, totalPages: 2 })
    : request.url === '/api/hr/employees' ? response([employee]) : response(null))
  const data = await loadEmployeeLeaveProfile(employee.employeeId, { readEmployee: true, signal: new AbortController().signal, unavailableBalances: new Set() })
  expect(data.rows).toHaveLength(2)
  expect(employeeLeaveSummary(data.rows)).toMatchObject({ total: 2, approved: 1, pending: 1, days: 4 })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/leave', params: { Page: 2, Limit: 100 } }))
})

it('treats missing balance as optional and does not retry its unavailable endpoint on Refresh', async () => {
  const implementation = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url.includes('/balance/') ? Promise.reject({ response: { status: 404 } }) : implementation(request))
  mount(); await loaded()
  expect(screen.getByText('Leave balance information is not available from the current API.')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'All (3)' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
  await loaded()
  expect(apiClient.request.mock.calls.filter(([request]) => request.url.includes('/balance/'))).toHaveLength(1)
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave')).toHaveLength(2)
})

it('fails visibly if collection pagination repeats a page rather than reporting capped totals', async () => {
  apiClient.request.mockImplementation(async request => request.url === '/api/hr/leave' ? response({ items: [leave(1, 'Pending')], totalCount: 4, totalPages: 4 }) : response([]))
  const data = await loadEmployeeLeaveProfile(employee.employeeId, { readEmployee: false, signal: new AbortController().signal, unavailableBalances: new Set() })
  expect(data.historyError).toMatch(/repeated a page/)
  expect(data.rows).toEqual([])
})

it('verifies an explicit directory id when employeeId is a code, then reuses the accepted identifier', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/employees') return response([{ employeeId: 'EMP-009', id: 25, fullName: 'Directory Employee' }])
    if (request.url === '/api/hr/leave') return response([leave(1, 'Approved', { employeeId: 'EMP-009' })])
    if (request.url === '/api/hr/leave/balance/25') return response({ employeeId: 25, available: 8 })
    throw { response: { status: 404 } }
  })
  const options = { readEmployee: true, signal: new AbortController().signal, unavailableBalances: new Set(), resolvedBalanceIds: new Map() }
  expect((await loadEmployeeLeaveProfile('EMP-009', options)).backendEmployeeId).toBe('25')
  await loadEmployeeLeaveProfile('EMP-009', options)
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave/balance/EMP-009')).toHaveLength(1)
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave/balance/25')).toHaveLength(2)
  expect(apiClient.request.mock.calls.some(([request]) => request.url === '/api/hr/leave/balance/9')).toBe(false)
})
