import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HrApiForm from '@features/hr/components/HrApiForm'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { leaveDayCount, initialLeaveDraft, leaveRequestPayload } from '@features/hr/services/hrLeaveFormData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
const employee = { employeeId: 9, fullName: 'Test Employee', email: 'test@example.test' }
const options = { employees: [employee], types: ['Sick', 'Casual'] }
const response = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  for (const method of ['scrollIntoView', 'scrollTo', 'setPointerCapture', 'releasePointerCapture']) HTMLElement.prototype[method] = vi.fn()
  HTMLElement.prototype.hasPointerCapture = () => false
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const open = props => render(<HrApiForm operation="POST /api/hr/leave" options={options} onSave={vi.fn()} onClose={vi.fn()} {...props} />)
async function fill() {
  const user = userEvent.setup()
  for (const [label, value] of [['Employee', 'Test Employee'], ['Leave Type', 'Sick']]) {
    await user.click(screen.getByRole('combobox', { name: new RegExp(`^${label}`) }))
    await user.click(await screen.findByRole('option', { name: value, exact: true }))
  }
  fireEvent.change(screen.getByLabelText(/^From Date/), { target: { value: '2026-10-02' } })
  fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: '  Appointment  ' } })
}

it('counts inclusive calendar dates across months and DST without policy exclusions', () => {
  expect(leaveDayCount('', '')).toBe(0)
  expect(leaveDayCount('2026-02-30', '2026-03-02')).toBe(0)
  expect(leaveDayCount('2026-10-02', '2026-10-02')).toBe(1)
  expect(leaveDayCount('2026-10-02', '2026-10-04')).toBe(3)
  expect(leaveDayCount('2026-10-31', '2026-11-02')).toBe(3)
  expect(leaveDayCount('2026-03-07', '2026-03-09')).toBe(3)
  expect(leaveDayCount('2026-10-04', '2026-10-02')).toBe(0)
  expect(leaveRequestPayload({ ...initialLeaveDraft(), employeeId: 9, leaveType: 'Sick', fromDate: '2026-10-02', reason: ' Appointment ' })).toEqual({ employeeId: '9', leaveType: 'Sick', fromDate: '2026-10-02', toDate: '2026-10-02', reason: 'Appointment' })
})

it('validates required fields and focuses the first invalid control', () => {
  const save = vi.fn()
  open({ onSave: save })
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  expect(screen.getByText('Please select an employee.')).toBeInTheDocument()
  expect(screen.getByText('Please select a leave type.')).toBeInTheDocument()
  expect(screen.getByText('Please select a start date.')).toBeInTheDocument()
  expect(screen.getByText('Please select an end date.')).toBeInTheDocument()
  expect(screen.getByText('Please enter a reason.')).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /^Employee/ })).toHaveFocus()
  expect(save).not.toHaveBeenCalled()
})

it('syncs Single Day, supports Multiple Days and rejects reversed dates', async () => {
  const save = vi.fn()
  open({ onSave: save })
  expect(screen.getByLabelText('Total Days')).toHaveValue('0')
  await fill()
  const end = screen.getByLabelText(/^To Date/)
  expect(end).toHaveValue('2026-10-02')
  expect(end).toHaveAttribute('readonly')
  expect(screen.getByLabelText('Total Days')).toHaveValue('1')
  fireEvent.click(screen.getByRole('radio', { name: 'Multiple Days' }))
  expect(end).not.toHaveAttribute('readonly')
  fireEvent.change(end, { target: { value: '2026-10-04' } })
  expect(screen.getByLabelText('Total Days')).toHaveValue('3')
  fireEvent.change(end, { target: { value: '2026-10-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  expect(screen.getByText('To Date cannot be earlier than From Date.')).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('radio', { name: 'Single Day' }))
  expect(end).toHaveValue('2026-10-02')
  expect(screen.queryByText('To Date cannot be earlier than From Date.')).not.toBeInTheDocument()
})

it('submits only the exact DTO and does not truncate a reason using an invented limit', async () => {
  const save = vi.fn().mockResolvedValue({})
  const close = vi.fn()
  open({ onSave: save, onClose: close })
  await fill()
  const reason = 'a'.repeat(600)
  fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: reason } })
  expect(screen.getByLabelText(/^Reason/)).not.toHaveAttribute('maxlength')
  expect(screen.getByText('600 characters')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Document upload unavailable' })).toBeDisabled()
  expect(document.querySelector('input[type="file"]')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1))
  expect(save).toHaveBeenCalledWith({ employeeId: '9', leaveType: 'Sick', fromDate: '2026-10-02', toDate: '2026-10-02', reason })
})

it.each([[400, { errors: { Reason: ['Reason is invalid.'] } }, /Reason is invalid/], [401, {}, /session has expired/], [403, {}, /permission/], [409, { error: { message: 'This employee already has leave on this date.' } }, /already has leave/], [500, {}, /server could not complete/]])('preserves values and shows HTTP %s errors', async (status, data, message) => {
  const close = vi.fn()
  open({ onSave: vi.fn().mockRejectedValue({ response: { status, data } }), onClose: close })
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('  Appointment  ')
  expect(screen.getByRole('button', { name: 'Add Leave', exact: true })).toBeEnabled()
  expect(close).not.toHaveBeenCalled()
})

it('prevents duplicate submissions and dismissal while adding', async () => {
  let resolve
  const save = vi.fn(() => new Promise(done => { resolve = done }))
  const close = vi.fn()
  open({ onSave: save, onClose: close })
  await fill()
  fireEvent.submit(document.querySelector('.hal-form'))
  fireEvent.submit(document.querySelector('.hal-form'))
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(save).toHaveBeenCalledTimes(1)
  expect(close).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  await act(async () => resolve({}))
  expect(close).toHaveBeenCalledTimes(1)
})

it.each(['Cancel', 'Close modal'])('supports %s, Escape, and body scroll restoration', name => {
  const close = vi.fn()
  open({ onClose: close })
  expect(document.body).toHaveAttribute('data-scroll-locked')
  fireEvent.click(screen.getByRole('button', { name }))
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(close).toHaveBeenCalledTimes(2)
  cleanup()
  expect(document.body).not.toHaveAttribute('data-scroll-locked')
})

it('loads actual employee IDs with the existing service, retries failure and cancels on close', async () => {
  apiClient.request.mockRejectedValueOnce({ response: { status: 500 } }).mockResolvedValue(response({ items: [employee], totalPages: 1 }))
  const view = open({ options: { types: ['Sick'] } })
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await waitFor(() => expect(screen.getByRole('combobox', { name: /^Employee/ })).toBeEnabled())
  expect(apiClient.request).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/api/hr/employees', method: 'GET', params: { Page: 1, Limit: 100 } }))
  const signal = apiClient.request.mock.calls.at(-1)[0].signal
  view.unmount()
  expect(signal.aborted).toBe(true)
})

it('creates through the existing authenticated service and refreshes leave records and summary only', async () => {
  let rows = [{ leaveId: 2, employeeName: 'Existing Employee', leaveType: 'Casual', fromDate: '2026-10-01', toDate: '2026-10-01', reason: 'Existing leave' }]
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/employees') return response({ items: [employee], totalPages: 1 })
    if (request.url === '/api/hr/leave/types') return response(options.types)
    if (request.url === '/api/hr/leave/summary') return response({ pendingLeave: rows.length })
    if (request.url === '/api/hr/leave') {
      if (request.method === 'POST') { rows = [{ leaveId: 3, employeeName: employee.fullName, ...request.data }, ...rows]; return response(rows[0]) }
      return response({ items: rows, totalPages: 1 })
    }
    return response([])
  })
  render(<MemoryRouter><HrApiModule module="leave" /></MemoryRouter>)
  await screen.findByText('Existing Employee')
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  await waitFor(() => expect(screen.getByRole('combobox', { name: /^Employee/ })).toBeEnabled())
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Add Leave', exact: true }))
  await screen.findAllByText('Test Employee')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/hr/leave', data: { employeeId: '9', leaveType: 'Sick', fromDate: '2026-10-02', toDate: '2026-10-02', reason: 'Appointment' } }))
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave/summary')).toHaveLength(2), { timeout: 5000 })
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/employees')).toHaveLength(1)
})
