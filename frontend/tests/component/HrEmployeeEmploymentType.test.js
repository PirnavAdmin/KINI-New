import { beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { loadHrEmployeeDetails } from '@features/hr/services/hrEmployeeDetails'
vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const reply = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => vi.clearAllMocks())
it('fills an omitted detail employment type from the matching saved directory record', async () => {
  apiClient.request.mockImplementation(async request => request.url.endsWith('/42') ? reply({ employeeId: 42, fullName: 'Test Employee' }) : reply({ items: [{ employeeId: 99, employeeType: 'Part-Time' }, { employeeId: 42, employeeType: 'Full-Time' }], totalPages: 1 }))
  expect((await loadHrEmployeeDetails(42)).employee.employmentType).toBe('Full-Time')
})
it('preserves the detailed profile if optional directory enrichment is forbidden', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url.endsWith('/42')) return reply({ employeeId: 42, fullName: 'Test Employee' })
    throw { response: { status: 403 } }
  })
  expect((await loadHrEmployeeDetails(42)).employee).toEqual({ employeeId: 42, fullName: 'Test Employee' })
})
it('does not replace a supplied employment type with another source', async () => {
  apiClient.request.mockResolvedValue(reply({ employeeId: 42, employmentType: 'Full-Time' }))
  expect((await loadHrEmployeeDetails(42)).employee.employmentType).toBe('Full-Time')
  expect(apiClient.request).toHaveBeenCalledTimes(1)
})
