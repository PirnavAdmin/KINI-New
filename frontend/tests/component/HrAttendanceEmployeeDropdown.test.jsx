import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { employeeService } from '@shared/services/employeeService'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/services/employeeService', () => ({ employeeService: { getEmployees: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
const response = data => ({ data: { success: true, data }, config: {}, status: 200 })

it('resolves HR display codes to directory IDs and submits the selected employee', async () => {
  HTMLElement.prototype.scrollTo = vi.fn()
  employeeService.getEmployees.mockResolvedValue({ data: [{ id: 42, email: 'mahesh@example.test', firstName: 'Mahesh', lastName: 'Mahi' }], totalPages: 1 })
  apiClient.request.mockImplementation(request => Promise.resolve(response(request.url === '/api/hr/employees'
    ? { items: [{ employeeId: 'EMP-009', fullName: 'Mahesh Mahi', email: 'mahesh@example.test' }], totalPages: 1 }
    : [])))
  render(<MemoryRouter><HrApiModule module="attendance" /></MemoryRouter>)
  const add = await screen.findByRole('button', { name: 'Mark Attendance' })
  await waitFor(() => expect(employeeService.getEmployees).toHaveBeenCalled())
  fireEvent.click(add)
  const select = await screen.findByRole('combobox', { name: 'Employee ID' })
  await screen.findByRole('option', { name: '42 - Mahesh Mahi' })
  expect(select).toBeEnabled()
  fireEvent.change(select, { target: { value: '42' } })
  fireEvent.change(screen.getByLabelText('Date *'), { target: { value: '2026-11-13' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'Pending' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/hr/attendance/mark', data: expect.objectContaining({ employeeId: '42' }) })))
})
