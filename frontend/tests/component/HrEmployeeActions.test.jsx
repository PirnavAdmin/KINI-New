import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))

const employee = { employeeId: 42, fullName: 'Test Mentor', firstName: 'Test', lastName: 'Mentor', email: 'mentor@example.test', role: 'Mentor' }
const response = data => ({ data: { success: true, data }, config: {}, status: 200 })
let detailRequest
let saveRequest

beforeEach(() => {
  vi.clearAllMocks()
  HTMLElement.prototype.scrollTo = vi.fn()
  detailRequest = vi.fn().mockResolvedValue(response(employee))
  saveRequest = vi.fn().mockResolvedValue(response(employee))
  apiClient.request.mockImplementation(request => {
    if (request.url === '/api/hr/employees/42') return request.method === 'PUT' ? saveRequest(request) : detailRequest(request)
    if (request.url === '/api/hr/employees') return Promise.resolve(response({ items: [employee], totalPages: 1 }))
    return Promise.resolve(response([]))
  })
})
afterEach(cleanup)

async function mount() {
  render(<MemoryRouter><HrApiModule module="employees" /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Test Mentor' })
}

it.each([{ ...employee, status: 'ACTIVE' }, { ...employee, employeeId: 'EMP-042', id: 42, userId: 999, status: 'ACTIVE' }])('opens Change Status and submits the numeric directory ID for $employeeId', async record => {
  apiClient.request.mockImplementation(request => request.url === '/api/hr/employees'
    ? Promise.resolve(response({ items: [record], totalPages: 1 }))
    : Promise.resolve(response([])))
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change Status' }))
  expect(screen.getByRole('dialog')).toHaveTextContent('Change Status')
  expect(apiClient.request.mock.calls.some(([request]) => request.method === 'PATCH')).toBe(false)
  const dropdown = within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Status' })
  expect(dropdown).toHaveValue('ACTIVE')
  expect([...dropdown.options].map(option => option.value)).toEqual(['', 'ACTIVE', 'ON_LEAVE', 'RESIGNED'])
  fireEvent.change(dropdown, { target: { value: 'ON_LEAVE' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/hr/employees/42/status', data: { status: 'ON_LEAVE' } })))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

it('shows the backend status error and keeps the selection available for retry', async () => {
  await mount()
  apiClient.request.mockImplementation(request => request.method === 'PATCH'
    ? Promise.reject({ response: { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Employee 42 was not found in this organization.' } } } })
    : Promise.resolve(response([])))
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change Status' }))
  const dropdown = within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Status' })
  fireEvent.change(dropdown, { target: { value: 'ON_LEAVE' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Employee 42 was not found in this organization.')
  expect(dropdown).toHaveValue('ON_LEAVE')
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
})

it('keeps results, layout and search focus stable while successive searches are pending', async () => {
  await mount()
  const pending = []
  apiClient.request.mockImplementation(request => {
    if (request.url === '/api/hr/employees' && request.params?.Search) {
      return new Promise(resolve => pending.push({ request, resolve }))
    }
    return Promise.resolve(response([]))
  })
  const search = screen.getByRole('searchbox', { name: 'Search' })
  const insights = screen.getByText('Department distribution')
  search.focus()
  fireEvent.change(search, { target: { value: 'T' } })
  await waitFor(() => expect(pending).toHaveLength(1))
  expect(screen.getByRole('button', { name: 'Test Mentor' })).toBeInTheDocument()
  expect(insights).toBeInTheDocument()
  expect(search).toHaveFocus()
  fireEvent.change(search, { target: { value: 'Te' } })
  await waitFor(() => expect(pending).toHaveLength(2))
  expect(pending[0].request.signal.aborted).toBe(true)
  expect(screen.getByRole('button', { name: 'Test Mentor' })).toBeInTheDocument()
  expect(search).toHaveFocus()
  await act(async () => pending[1].resolve(response({ items: [{ ...employee, fullName: 'Updated Mentor' }], totalPages: 1 })))
  expect(screen.getByRole('button', { name: 'Updated Mentor' })).toBeInTheDocument()
  await act(async () => pending[0].resolve(response({ items: [], totalPages: 1 })))
  expect(screen.getByRole('button', { name: 'Updated Mentor' })).toBeInTheDocument()
  expect(search).toHaveValue('Te')
  expect(search).toHaveFocus()
})

it.each(['Test Mentor', 'Details'])('opens employee details from %s before the request finishes', async name => {
  let resolveDetail
  detailRequest.mockImplementation(() => new Promise(resolve => { resolveDetail = resolve }))
  await mount()
  fireEvent.click(screen.getByRole('button', { name }))
  expect(screen.getByText('Employee details')).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Loading employee details')
  expect(detailRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/employees/42', method: 'GET' }))
  await act(async () => resolveDetail(response({ ...employee, phone: '1234567890' })))
  expect(screen.getByText('1234567890')).toBeInTheDocument()
})

it('shows a failed lookup in the dialog and retries successfully', async () => {
  detailRequest.mockRejectedValueOnce({ response: { status: 404 } })
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'Details' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Requested resource was not found')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  expect(detailRequest).toHaveBeenCalledTimes(2)
  expect(screen.getByText('Employee details')).toBeInTheDocument()
})

it('opens Edit with fetched values and saves to the same employee', async () => {
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }))
  const firstName = await screen.findByLabelText('First Name')
  expect(firstName).toHaveValue('Test')
  fireEvent.change(firstName, { target: { value: 'Updated' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(saveRequest).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/api/hr/employees/42', data: expect.objectContaining({ firstName: 'Updated', email: employee.email, role: 'Mentor' }) })))
  await waitFor(() => expect(screen.queryByText('Edit Employee')).not.toBeInTheDocument())
})

it('keeps Edit errors visible without allowing a partial record to be saved', async () => {
  detailRequest.mockRejectedValue({ response: { status: 403 } })
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('permission')
  expect(screen.queryByRole('button', { name: 'Save', exact: true })).not.toBeInTheDocument()
  expect(saveRequest).not.toHaveBeenCalled()
})

it('does not reopen a dialog after closing a pending lookup', async () => {
  let resolveDetail
  detailRequest.mockImplementation(() => new Promise(resolve => { resolveDetail = resolve }))
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'Details' }))
  const signal = detailRequest.mock.calls[0][0].signal
  fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
  expect(signal.aborted).toBe(true)
  await act(async () => resolveDetail(response(employee)))
  expect(screen.queryByText('Employee details')).not.toBeInTheDocument()
})
