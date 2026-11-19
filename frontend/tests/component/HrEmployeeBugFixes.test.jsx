import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { employeeIdOf, employeeStatusIdOf, loadHrEmployeeDetails } from '@features/hr/services/hrEmployeeDetails'
import { employeeService } from '@shared/services/employeeService'
import { resolveEmployeeRecordIds } from '@features/hr/services/hrEmployeeRoster'
import { loadEmployeeEditValues, mergeEmployeeEditValues } from '@features/hr/services/hrEmployeeEditData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/services/employeeService', () => ({ employeeService: { getEmployees: vi.fn(), getEmployee: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children }) => <main>{children}</main> }))
const employee = { employeeId: 'EMP-42', id: 42, firstName: 'Test', lastName: 'Mentor', fullName: 'Test Mentor', email: 'mentor@example.test', role: 'Mentor', employeeType: 'Full-Time', status: 'ACTIVE' }
const hr = { employeeId: 43, fullName: 'HR Person', role: 'HR', email: 'hr@example.test', status: 'ACTIVE' }
const reply = data => ({ data: { data }, config: {}, status: 200 })
beforeEach(() => {
  vi.clearAllMocks()
  employeeService.getEmployees.mockResolvedValue({ data: [{ ...employee, id: 42 }, hr], totalPages: 1 })
  employeeService.getEmployee.mockResolvedValue(employee)
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLElement.prototype.scrollTo = vi.fn()
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/employees') return reply({ items: [employee, hr], totalPages: 1 })
    if (request.url === '/api/hr/employees/summary') return reply({ totalEmployees: 2, mentors: 1, hr: 1, onLeaveToday: 0 })
    if (request.url === '/api/hr/employees/42' && request.method === 'GET') throw { response: { status: 404 } }
    if (request.method === 'PUT' || request.method === 'DELETE' || request.method === 'PATCH') return reply(employee)
    return reply([])
  })
})
afterEach(cleanup)
async function mount() {
  render(<MemoryRouter initialEntries={['/employee/hr-employees']}><Routes>
    <Route path="/employee/hr-employees" element={<HrApiModule module="employees" />} />
    <Route path="/employee/hr-leave" element={<h1>Leave Management destination</h1>} />
  </Routes></MemoryRouter>)
  await screen.findByRole('button', { name: 'Test Mentor' })
}
it('uses the numeric record key instead of an employee display code for every action', () => {
  expect(employeeIdOf(employee)).toBe(42)
  expect(employeeStatusIdOf(employee)).toBe(42)
  expect(employeeStatusIdOf({ employeeId: 'EMP-42', userId: 99 })).toBeUndefined()
})

it('resolves missing HR primary keys from an exact unique directory email', () => {
  const rows = [{ ...employee, id: undefined }, { ...hr, employeeId: 'HR-43' }]
  expect(resolveEmployeeRecordIds(rows, [{ ...employee, id: 42 }, hr]).map(employeeIdOf)).toEqual([42, 43])
  expect(employeeIdOf(resolveEmployeeRecordIds([rows[0]], [{ ...employee, id: 42 }, { ...employee, id: 99 }])[0])).toBeUndefined()
  expect(employeeIdOf(resolveEmployeeRecordIds([{ ...rows[0], userId: 99 }], [])[0])).toBeUndefined()
})

it('preserves saved first/last names when detail fields are blank or null and maps phone aliases', () => {
  expect(mergeEmployeeEditValues({ FirstName: null, lastName: '', phoneNumber: '9876543210' }, employee)).toMatchObject({ firstName: 'Test', lastName: 'Mentor', phone: '9876543210' })
  const summary = { employeeId: 'EMP-42', fullName: 'Test Mentor', email: employee.email }
  expect(resolveEmployeeRecordIds([summary], [employee])[0]).toMatchObject({ firstName: 'Test', lastName: 'Mentor', employeeRecordId: 42 })
})

it('prefills Edit from the saved directory record when HR only supplies a display name', async () => {
  const summary = { employeeId: 42, fullName: 'Test Mentor', email: employee.email, role: 'Mentor' }
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/employees'
    ? Promise.resolve(reply({ items: [summary], totalPages: 1 }))
    : request.url === '/api/hr/employees/42' && request.method === 'GET' ? Promise.resolve(reply(summary)) : original(request))
  employeeService.getEmployee.mockResolvedValue({ ...employee, firstName: 'Mahesh', lastName: 'MahiiLove', phoneNumber: '9876543210', joiningDate: '2026-11-05T10:00:00Z' })
  await mount()
  fireEvent.click(within(screen.getByRole('button', { name: 'Test Mentor' }).closest('tr')).getByRole('button', { name: 'Edit', exact: true }))
  expect(await screen.findByLabelText('First Name')).toHaveValue('Mahesh')
  expect(screen.getByLabelText('Last Name')).toHaveValue('MahiiLove')
  expect(screen.getByLabelText('Mobile Number')).toHaveValue('9876543210')
  expect(screen.getByLabelText('Employment Type')).toHaveValue('Full-Time')
  expect(employeeService.getEmployee).toHaveBeenCalledWith(42)
})

it('rejects a different directory employee instead of prefilling another person’s details', async () => {
  employeeService.getEmployee.mockResolvedValue({ employeeId: 99, firstName: 'Wrong', lastName: 'Person' })
  await expect(loadEmployeeEditValues({ employeeId: 42, fullName: 'Test Mentor' }, {})).rejects.toThrow('different employee')
})

it('verifies a detail response that omits the primary key against the same directory employee', async () => {
  apiClient.request.mockResolvedValueOnce(reply({ ...employee, id: undefined }))
  const result = await loadHrEmployeeDetails(42)
  expect(employeeIdOf(result.employee)).toBe(42)
  expect(result.employee.email).toBe(employee.email)
})

it('restores Edit/Delete and isolates checkbox selection when HR returns only display codes', async () => {
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/employees'
    ? Promise.resolve(reply({ items: [{ ...employee, id: undefined }, { ...hr, employeeId: 'HR-43' }], totalPages: 1 }))
    : original(request))
  await mount()
  const first = screen.getByRole('button', { name: 'Test Mentor' }).closest('tr')
  const second = screen.getByRole('button', { name: 'HR Person' }).closest('tr')
  fireEvent.click(within(first).getByRole('checkbox'))
  expect(within(first).getByRole('checkbox')).toBeChecked()
  expect(within(second).getByRole('checkbox')).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Select all rows' })).not.toBeChecked()
  expect(screen.getByText('1 selected')).toBeInTheDocument()
  expect(within(first).getByRole('button', { name: 'Edit', exact: true })).toBeInTheDocument()
  fireEvent.click(within(second).getByRole('button', { name: 'Delete', exact: true }))
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', url: '/api/hr/employees/43' })))
})

it('keeps individual selection working even when no directory identity can be resolved', async () => {
  employeeService.getEmployees.mockResolvedValue({ data: [], totalPages: 1 })
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/hr/employees'
    ? Promise.resolve(reply({ items: [{ ...employee, id: undefined }, { ...hr, employeeId: 'HR-43' }], totalPages: 1 }))
    : original(request))
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByText('Test Mentor')
  const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })
  fireEvent.click(boxes[0])
  expect(boxes[0]).toBeChecked()
  expect(boxes[1]).not.toBeChecked()
  expect(screen.getByText('1 selected')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Delete', exact: true })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
  expect(boxes.every(box => box.checked)).toBe(true)
  expect(screen.getByText('2 selected')).toBeInTheDocument()
})
it.each(['HR Person', 'HR'])('searches names and roles even if the backend ignores search: %s', async value => {
  await mount()
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value } })
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Test Mentor' })).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'HR Person' })).toBeInTheDocument()
})
it('HR summary includes plain HR records and clears stale search filters', async () => {
  await mount()
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'Mentor' } })
  fireEvent.click(screen.getByRole('button', { name: /^HR:/ }))
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Test Mentor' })).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'HR Person' })).toBeInTheDocument()
})
it('On Leave Today links to Leave Management', async () => {
  await mount()
  fireEvent.click(screen.getByRole('button', { name: /On Leave Today/ }))
  expect(await screen.findByRole('heading', { name: 'Leave Management destination' })).toBeInTheDocument()
})
it('opens edit from the directory on a missing detail GET and preserves employment type', async () => {
  await mount()
  const row = screen.getByRole('button', { name: 'Test Mentor' }).closest('tr')
  fireEvent.click(within(row).getByRole('button', { name: 'Edit', exact: true }))
  const dialog = await screen.findByRole('dialog')
  await waitFor(() => expect(within(dialog).getByLabelText('First Name')).toHaveValue('Test'))
  expect(within(dialog).getByLabelText('Employment Type')).toHaveValue('Full-Time')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/api/hr/employees/42' }))
})
it('deletes using the numeric record id', async () => {
  await mount()
  const row = screen.getByRole('button', { name: 'Test Mentor' }).closest('tr')
  fireEvent.click(within(row).getByRole('button', { name: 'Delete', exact: true }))
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', url: '/api/hr/employees/42' })))
})
it('changes status using the numeric record id and the documented status value', async () => {
  await mount()
  const row = screen.getByRole('button', { name: 'Test Mentor' }).closest('tr')
  fireEvent.click(within(row).getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change Status' }))
  const dialog = await screen.findByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('Status'), { target: { value: 'ON_LEAVE' } })
  fireEvent.click(within(dialog).getByRole('button', { name: /^Save(?: Changes)?$/, exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/hr/employees/42/status', data: { status: 'ON_LEAVE' } })))
})
it('searches across every server page before applying client pagination', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/employees') return reply({ items: request.params.Page === 1 ? Array.from({ length: 100 }, (_, index) => ({ ...employee, employeeId: index + 100, id: index + 100, fullName: `Mentor ${index}` })) : [hr], totalCount: 101, totalPages: 2 })
    return reply([])
  })
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Mentor 0' })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'HR Person' } })
  expect(await screen.findByRole('button', { name: 'HR Person' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Mentor 0' })).not.toBeInTheDocument()
})
