import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children }) => <main>{children}</main> }))
const row = { leaveId: 41, employeeId: 'EMP-9', employeeName: 'Test Employee', email: 'employee@example.com', leaveType: 'Sick', status: 'Approved', reason: 'Medical appointment', days: 1 }
const response = data => ({ data, status: 200 })
beforeEach(() => {
  vi.clearAllMocks()
  apiClient.request.mockImplementation(async ({ url }) => {
    if (url === '/api/hr/leave') return response({ items: [row], totalCount: 1 })
    if (url === '/api/hr/leave/41') return response(row)
    if (url === '/api/hr/employees') return response({ items: [{ employeeId: 'EMP-9', id: 9, fullName: 'Test Employee' }], totalCount: 1 })
    if (url === '/api/hr/leave/balance/EMP-9') throw { response: { status: 404 } }
    if (url === '/api/hr/leave/balance/9') return response({ employeeId: 9, remainingDays: 8 })
    return response([])
  })
})
afterEach(cleanup)
async function mount() {
  render(<MemoryRouter><HrApiModule module="leave" /></MemoryRouter>)
  await screen.findByText('Medical appointment')
}
it('shows searchable identity fields and waits for Search before requesting typed text', async () => {
  await mount()
  expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Employee ID' })).toBeInTheDocument()
  expect(screen.getAllByText('employee@example.com').length).toBeGreaterThan(0)
  const listRequests = () => apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave')
  const count = listRequests().length
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'employee@example.com' } })
  expect(listRequests()).toHaveLength(count)
  expect(screen.getByText('Medical appointment')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/leave', params: expect.objectContaining({ Search: 'employee@example.com' }) })))
})
it('opens one details popup and sends one request on repeated View clicks', async () => {
  await mount()
  const view = screen.getByRole('button', { name: 'View', exact: true })
  fireEvent.click(view)
  fireEvent.click(view)
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave/41')).toHaveLength(1))
  await waitFor(() => expect(screen.queryByText('Loading leave details...')).not.toBeInTheDocument())
  expect(screen.getAllByRole('heading', { name: 'Leave details' })).toHaveLength(1)
})

it('waits for a delayed detail response before opening the popup once', async () => {
  const original = apiClient.request.getMockImplementation()
  let finish
  apiClient.request.mockImplementation(request => request.url === '/api/hr/leave/41'
    ? new Promise(resolve => { finish = resolve }) : original(request))
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'View', exact: true }))
  expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()
  expect(screen.queryByRole('heading', { name: 'Leave details' })).not.toBeInTheDocument()
  finish(response({ ...row, reason: 'Full leave details' }))
  await screen.findByText('Full leave details')
  expect(screen.getAllByRole('heading', { name: 'Leave details' })).toHaveLength(1)
  expect(screen.queryByText('Information from the list')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Leave details' })).not.toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: 'View', exact: true }))
  expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()
  finish(response(row))
  await screen.findByRole('heading', { name: 'Leave details' })
  expect(apiClient.request.mock.calls.filter(([request]) => request.url === '/api/hr/leave/41')).toHaveLength(2)
})
it('loads History from the working leave collection', async () => {
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'History', exact: true }))
  await screen.findByRole('heading', { name: 'Leave history' })
  expect(apiClient.request.mock.calls.some(([request]) => request.url.includes('/leave/employee/'))).toBe(false)
  expect(screen.queryByText('Requested resource was not found.')).not.toBeInTheDocument()
})
it('resolves the directory ID for Balance when the public employee code returns 404', async () => {
  await mount()
  fireEvent.click(screen.getByRole('button', { name: 'Balance', exact: true }))
  await screen.findByRole('heading', { name: 'Leave balance' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/leave/balance/9' }))
  expect(screen.getByText('8')).toBeInTheDocument()
})

it('displays directory email when leave records omit it', async () => {
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => {
    if (request.url === '/api/hr/leave') return Promise.resolve(response({ items: [{ ...row, email: null }], totalCount: 1 }))
    if (request.url === '/api/hr/employees') return Promise.resolve(response({ items: [{ employeeId: 9, employeeCode: 'EMP-9', email: 'directory@example.com' }], totalCount: 1 }))
    return original(request)
  })
  await mount()
  expect(screen.getByRole('cell', { name: 'directory@example.com', exact: true })).toBeInTheDocument()
})
