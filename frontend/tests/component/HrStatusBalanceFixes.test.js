import { beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { studentsApi } from '@/api/students'
import { loadHrStudentRoster } from '@features/hr/services/hrStudentRoster'
import { loadEmployeeLeaveBalance } from '@features/hr/services/hrEmployeeLeaveData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn(), get: vi.fn() } }))
const reply = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => vi.clearAllMocks())
it('shows the same canonical status for Organization and HR student records', async () => {
  const rows = [false, 0, 'false', '0', true, 1, 'Active', 'Pending approval', 'disabled', 'Rejected'].map((status, index) => ({ studentId: index + 1, status }))
  apiClient.get.mockResolvedValue(reply(rows))
  const organization = await studentsApi.list()
  const hr = await loadHrStudentRoster({ list: vi.fn().mockResolvedValue({ items: rows, totalPages: 1 }) })
  expect(hr.map(row => row.status)).toEqual(organization.data.map(row => row.status))
  expect(hr.map(row => row.status)).toEqual(['Inactive', 'Inactive', 'Inactive', 'Inactive', 'Active', 'Active', 'Active', 'Pending', 'Inactive', 'Rejected'])
})
it('fetches balance directly without depending on history or employee directory availability', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url === '/api/hr/leave/balance/42') return reply({ employeeId: 42, remainingDays: 8 })
    throw new Error('Other APIs unavailable')
  })
  expect(await loadEmployeeLeaveBalance(42)).toEqual({ employeeId: 42, remainingDays: 8 })
  expect(apiClient.request).toHaveBeenCalledTimes(1)
})
it('resolves a display code to a numeric employee record ID before requesting balance', async () => {
  apiClient.request.mockImplementation(async request => request.url === '/api/hr/employees'
    ? reply({ items: [{ employeeId: 'EMP-42', id: 42 }], totalPages: 1 })
    : reply({ employeeId: 42, remainingDays: 8 }))
  expect(await loadEmployeeLeaveBalance('EMP-42')).toMatchObject({ remainingDays: 8 })
  expect(apiClient.request).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/api/hr/leave/balance/42' }))
})
it('allows retry after a missing balance instead of caching the failure permanently', async () => {
  apiClient.request.mockRejectedValueOnce({ response: { status: 404 } }).mockResolvedValueOnce(reply({ employeeId: 42, remainingDays: 8 }))
  await expect(loadEmployeeLeaveBalance(42)).rejects.toMatchObject({ response: { status: 404 } })
  expect(await loadEmployeeLeaveBalance(42)).toMatchObject({ remainingDays: 8 })
})
it('rejects another employee’s balance', async () => {
  apiClient.request.mockResolvedValue(reply({ employeeId: 99, remainingDays: 8 }))
  await expect(loadEmployeeLeaveBalance(42)).rejects.toThrow('different employee')
})
