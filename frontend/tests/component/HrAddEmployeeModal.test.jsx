import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HrApiForm from '@features/hr/components/HrApiForm'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
const options = { roles: [{ value: 'Mentor', label: 'Mentor' }, { value: 'HR Executive', label: 'HR Executive' }] }
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  for (const method of ['scrollIntoView', 'scrollTo', 'setPointerCapture', 'releasePointerCapture']) HTMLElement.prototype[method] = vi.fn()
  HTMLElement.prototype.hasPointerCapture = () => false
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const open = props => render(<HrApiForm operation="POST /api/hr/employees" options={options} onSave={vi.fn()} onClose={vi.fn()} {...props} />)
async function fill() {
  for (const [label, value] of [['First Name', '  Ada  '], ['Last Name', '  Lovelace  '], ['Email', 'ada@example.test'], ['Phone', '+91 98765 43210']]) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value: label === 'Phone' ? value.replace(/\D/g, '').replace(/^91/, '') : value } })
  }
  const user = userEvent.setup()
  for (const [label, choice] of [['Role', 'Mentor'], ['Employment Type', 'Full Time']]) {
    await user.click(screen.getByRole('combobox', { name: new RegExp(`^${label}`) }))
    await user.click(await screen.findByRole('option', { name: choice, exact: true }))
  }
}

it('validates all six fields, focuses the first error and clears corrected field errors', () => {
  const save = vi.fn()
  open({ onSave: save })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(document.querySelectorAll('.hae-field-error')).toHaveLength(6)
  const first = screen.getByLabelText(/^First Name/)
  expect(first).toHaveFocus()
  expect(first).toHaveAttribute('aria-invalid', 'true')
  fireEvent.change(first, { target: { value: 'Ada' } })
  expect(first).toHaveAttribute('aria-invalid', 'false')
  expect(save).not.toHaveBeenCalled()
})

it('uses real role choices and preserves API-provided employment values', async () => {
  const save = vi.fn().mockResolvedValue({})
  const close = vi.fn()
  open({ onSave: save, onClose: close, options: { ...options, employmentTypes: [{ value: 'FULL_TIME', label: 'Full Time' }] } })
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1))
  expect(save).toHaveBeenCalledWith({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', phone: '9876543210', role: 'Mentor', employmentType: 'FULL_TIME' })
})

it('rejects invalid email and phone before saving', async () => {
  const save = vi.fn()
  open({ onSave: save })
  await fill()
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'wrong' } })
  fireEvent.change(screen.getByLabelText(/^Phone/), { target: { value: '1234567890' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  expect(screen.getByText(/valid 10-digit Indian mobile number/)).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
})

it('allows international alphabetic names and strips numeric or symbol input', async () => {
  const save = vi.fn()
  open({ onSave: save })
  await fill()
  const firstName = screen.getByLabelText(/^First Name/)
  const lastName = screen.getByLabelText(/^Last Name/)
  fireEvent.change(firstName, { target: { value: 'Māri-Jo' } })
  fireEvent.change(lastName, { target: { value: "O’Neil" } })
  expect(firstName).toHaveValue('Māri-Jo')
  expect(lastName).toHaveValue('O’Neil')
  fireEvent.change(firstName, { target: { value: '12@@' } })
  expect(firstName).toHaveValue('')
  expect(save).not.toHaveBeenCalled()
})

it('loads all employee pages for the employee directory analytics collection', async () => {
  const rows = Array.from({ length: 205 }, (_, index) => ({ employeeId: index + 1, fullName: `Employee ${index + 1}`, employmentType: 'Contract' }))
  const response = data => ({ data: { data }, config: {}, status: 200 })
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/roles') return response(options.roles)
    if (request.url === '/api/hr/employees/summary') return response({ totalEmployees: rows.length })
    if (request.url === '/api/hr/employees') {
      const page = request.params?.Page ?? 1
      if (request.params?.Search) return response({ items: [], totalCount: 0, totalPages: 0 })
      if (request.params?.Limit === 10) return response({ items: rows.slice((page - 1) * 10, page * 10), totalCount: rows.length, totalPages: 21 })
      return response({ items: rows.slice((page - 1) * 100, page * 100), totalCount: rows.length, totalPages: 3 })
    }
    return response([])
  })
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Employee 1' })
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/employees' && request.params?.Limit === 100)).toHaveLength(3))
})

it('updates employee status through the authorized status endpoint and refreshes directory data', async () => {
  let status = 'Active'
  const response = data => ({ data: { data }, config: {}, status: 200 })
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/roles') return response(options.roles)
    if (request.url === '/api/hr/employees/summary') return response({ totalEmployees: 1, activeEmployees: status === 'Active' ? 1 : 0, inactiveEmployees: status === 'Inactive' ? 1 : 0 })
    if (request.url === '/api/hr/employees/42/status' && request.method === 'PATCH') { status = request.data.status; return response({ status }) }
    if (request.url === '/api/hr/employees') return response({ items: [{ employeeId: 42, fullName: 'Test Mentor', role: 'Mentor', status, employmentType: 'Internship' }], totalCount: 1, totalPages: 1 })
    return response([])
  })
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Test Mentor' })
  const menuButton = screen.getByRole('button', { name: 'More actions' })
  fireEvent.click(menuButton)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Set Inactive' }))
  await waitFor(() => expect(status).toBe('Inactive'))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/hr/employees/42/status', data: { status: 'Inactive' } })))
})

it('limits phone typing and pasting to a 10-digit Indian mobile with optional +91', async () => {
  open()
  const phone = screen.getByLabelText(/^Phone/)
  fireEvent.change(phone, { target: { value: '987654321012345' } })
  expect(phone).toHaveValue('9876543210')
  fireEvent.change(phone, { target: { value: '+91 9876543210' } })
  expect(phone).toHaveValue('+91 9876543210')
  fireEvent.change(phone, { target: { value: '98765-43210' } })
  expect(phone).toHaveValue('9876543210')
})

it('keeps duplicate backend errors and entered values visible for retry', async () => {
  const save = vi.fn().mockRejectedValue({ response: { status: 409, data: { errors: { Email: ['This email is already registered.'] } } } })
  const close = vi.fn()
  open({ onSave: save, onClose: close })
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('already registered')
  expect(screen.getByLabelText(/^Email/)).toHaveValue('ada@example.test')
  expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
  expect(close).not.toHaveBeenCalled()
})

it('locks submissions and dismissal until the API resolves', async () => {
  let resolve
  const save = vi.fn(() => new Promise(done => { resolve = done }))
  const close = vi.fn()
  open({ onSave: save, onClose: close })
  await fill()
  const form = document.querySelector('.hae-form')
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(close).not.toHaveBeenCalled()
  expect(save).toHaveBeenCalledTimes(1)
  await act(async () => resolve({}))
  expect(close).toHaveBeenCalledTimes(1)
})

it('does not manufacture roles when API options are missing', () => {
  open({ options: {} })
  expect(screen.getByRole('status')).toHaveTextContent('Role options are unavailable')
  expect(screen.getByRole('combobox', { name: /^Role/ })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
})

it.each([[401, /session has expired/], [403, /permission/], [500, /server could not complete/]])('shows HTTP %s errors without closing or losing values', async (status, message) => {
  const close = vi.fn()
  open({ onSave: vi.fn().mockRejectedValue({ response: { status, data: {} } }), onClose: close })
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(screen.getByLabelText(/^First Name/)).toHaveValue('  Ada  ')
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
  expect(close).not.toHaveBeenCalled()
})

it.each(['Cancel', 'Close modal'])('closes using %s and supports Escape dismissal', async name => {
  const close = vi.fn()
  open({ onClose: close })
  expect(document.body).toHaveAttribute('data-scroll-locked')
  fireEvent.click(screen.getByRole('button', { name }))
  expect(close).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(close).toHaveBeenCalledTimes(2)
  cleanup()
  expect(document.body).not.toHaveAttribute('data-scroll-locked')
})

it('navigates dropdowns by keyboard and keeps Tab focus inside the dialog', async () => {
  open()
  const user = userEvent.setup()
  const role = screen.getByRole('combobox', { name: /^Role/ })
  role.focus()
  await user.keyboard('{ArrowDown}')
  await screen.findByRole('listbox')
  await user.keyboard('{Home}{Enter}')
  expect(role).toHaveTextContent('Mentor')
  const save = screen.getByRole('button', { name: 'Save', exact: true })
  save.focus()
  await user.tab()
  expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close modal' })).toHaveFocus()
})

it('POSTs through the existing module service and refreshes the table and summary on success', async () => {
  let rows = [{ employeeId: 42, fullName: 'Existing Mentor', email: 'existing@example.test', role: 'Mentor', employmentType: 'Full-Time' }]
  const response = data => ({ data: { data }, config: {}, status: 200 })
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/roles') return response(options.roles)
    if (request.url === '/api/hr/employees') {
      if (request.method === 'POST') {
        rows = [...rows, { employeeId: 43, ...request.data, fullName: 'Ada Lovelace' }]
        return response(rows.at(-1))
      }
      return response({ items: rows, totalPages: 1 })
    }
    if (request.url.endsWith('/summary')) return response({ totalEmployees: rows.length })
    return response([])
  })
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Existing Mentor' })
  expect(screen.getByText('Full-Time')).toBeInTheDocument()
  fireEvent.click(screen.getAllByRole('button', { name: 'Add Employee' }).at(-1))
  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findByRole('button', { name: 'Ada Lovelace' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/hr/employees', data: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', phone: '9876543210', role: 'Mentor', employmentType: 'Full-Time' } }))
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/employees/summary')).toHaveLength(2)
})
