import { afterEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { employeeService } from '@shared/services/employeeService'
vi.mock('@shared/services/apiClient', () => ({ default: { post: vi.fn() } }))
afterEach(() => vi.clearAllMocks())
it.each(['Contract', 'contract', 'Contractor', ' Contractual '])('normalizes %s to the Contract employeeType field', async employmentType => {
  apiClient.post.mockResolvedValue({ data: { success: true } })
  await employeeService.createEmployee({ firstName: 'Test', lastName: 'Employee', email: 'test@example.com', phone: '9876543210', role: 'Employee', employmentType })
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/organization/employees', expect.objectContaining({ employeeType: 'Contract' }))
})
it('does not report success if the backend rejects Contract', async () => {
  apiClient.post.mockResolvedValue({ data: { success: false, message: 'Unsupported employment type' } })
  await expect(employeeService.createEmployee({ employmentType: 'Contract' })).rejects.toThrow('Unsupported employment type')
})
