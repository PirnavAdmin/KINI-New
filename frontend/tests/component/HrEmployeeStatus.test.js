import { beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { hrModuleApi } from '@features/hr/services/hrApi'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const response = data => ({ data: { success: true, data }, config: {}, status: 200 })
beforeEach(() => vi.resetAllMocks())

it.each(['ACTIVE', 'ON_LEAVE', 'RESIGNED'])('sends the backend status %s exactly', async status => {
  apiClient.request.mockResolvedValueOnce(response({ employeeId: 42, status }))
  await hrModuleApi('employees').status(42, status)
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/hr/employees/42/status', data: { status } }))
})

it('rejects unsupported Inactive before making a request', async () => {
  await expect(hrModuleApi('employees').status(42, 'Inactive')).rejects.toThrow('Select Active, On Leave or Resigned.')
  expect(apiClient.request).not.toHaveBeenCalled()
})

it('preserves HR status 404 without calling another employee API', async () => {
  const error = { response: { status: 404, data: { error: { message: 'Employee not found.' } } } }
  apiClient.request.mockRejectedValueOnce(error)
  await expect(hrModuleApi('employees').status(42, 'ON_LEAVE')).rejects.toBe(error)
  expect(apiClient.request).toHaveBeenCalledTimes(1)
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/hr/employees/42/status', data: { status: 'ON_LEAVE' } }))
})

it.each([undefined, '', 'EMP-42', 0, -1])('rejects invalid employee ID %s before requesting', async id => {
  await expect(hrModuleApi('employees').status(id, 'ACTIVE')).rejects.toThrow('valid numeric employee ID')
  expect(apiClient.request).not.toHaveBeenCalled()
})
it('preserves permission failures without retrying another API', async () => {
  const error = { response: { status: 403 } }
  apiClient.request.mockRejectedValueOnce(error)
  await expect(hrModuleApi('employees').status(42, 'RESIGNED')).rejects.toBe(error)
  expect(apiClient.request).toHaveBeenCalledTimes(1)
})
