import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { toast } from 'sonner'
import { exportCSV } from '@features/hr/components/hrExport'
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@features/hr/components/hrExport', () => ({ exportCSV: vi.fn() }))

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
const response = data => ({ data: { data }, config: {}, status: 200 })

it('loads employee names and server filter choices, saves a review and refreshes records', async () => {
  let saved = null
  apiClient.request.mockImplementation(request => {
    if (request.url === '/api/hr/employees') return Promise.resolve(response([{ employeeId: 'EMP-007', id: 7, firstName: 'Test', lastName: 'Employee', role: 'HR' }]))
    if (request.url.endsWith('/filters')) return Promise.resolve(response({ Roles: ['All', 'HR', 'Mentor'], PerformanceFilters: [{ Value: 'Top', Label: 'Top performers' }] }))
    if (request.url === '/api/hr/performance' && request.method === 'POST') { saved = request.data; return Promise.resolve(response(saved)) }
    if (request.url === '/api/hr/performance') return Promise.resolve(response(saved ? [{ performanceId: 1, employeeId: 7, employeeName: 'Test Employee', ...saved }] : []))
    return Promise.resolve(response({}))
  })
  render(<MemoryRouter><HrApiModule module="performance" /></MemoryRouter>)
  const employee = await screen.findByRole('combobox', { name: 'Employee history' })
  await waitFor(() => expect(within(employee).getByRole('option', { name: 'Test Employee' })).toBeInTheDocument())
  expect(within(screen.getByRole('combobox', { name: 'Role', exact: true })).getAllByRole('option').map(option => option.textContent)).toEqual(['All', 'HR', 'Mentor'])
  expect(within(screen.getByRole('combobox', { name: 'Performance Filter' })).getByRole('option', { name: 'Top performers' })).toHaveValue('Top')
  expect(screen.getByText('No performance reviews found')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Add Review', exact: true }))
  expect(within(screen.getByLabelText(/Employee ID/)).getByRole('option', { name: '7', exact: true })).toBeInTheDocument()
  expect(within(screen.getByLabelText(/Employee ID/)).queryByRole('option', { name: 'Test Employee' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(/Employee ID/), { target: { value: '7' } })
  fireEvent.change(screen.getByLabelText(/Period/), { target: { value: 'September 2026' } })
  fireEvent.change(screen.getByLabelText(/Performance Score/), { target: { value: '85' } })
  fireEvent.change(screen.getByLabelText(/Target Completion/), { target: { value: '90' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(saved).toMatchObject({ employeeId: '7', period: 'September 2026', performanceScore: 85, targetCompletion: 90 }))
  await waitFor(() => expect(screen.queryByText('No performance reviews found')).not.toBeInTheDocument())
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
  fireEvent.click(screen.getByRole('button', { name: 'Export selected' }))
  expect(exportCSV).toHaveBeenCalled()
  expect(toast.success).toHaveBeenCalledWith('Performance exported successfully.')
})

it('does not fabricate categories or employee options when lookups are unavailable', async () => {
  apiClient.request.mockImplementation(request => request.url === '/api/hr/employees' ? Promise.reject({ response: { status: 403 } }) : Promise.resolve(response([])))
  render(<MemoryRouter><HrApiModule module="performance" /></MemoryRouter>)
  await screen.findByText('Employee names could not be loaded. Refresh to retry.')
  expect(screen.getByRole('combobox', { name: 'Employee history' })).toBeDisabled()
  expect(screen.getByRole('combobox', { name: 'Performance Filter' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Add Review', exact: true }))
  expect(screen.getByText(/No employee options are available/)).toBeInTheDocument()
  expect(screen.getByLabelText(/Employee ID/)).toBeDisabled()
})
