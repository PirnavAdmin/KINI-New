import { beforeEach, expect, it, vi } from 'vitest';
import apiClient from '../../src/shared/services/apiClient';
import { employeeService } from '../../src/shared/services/employeeService';
import { normalizeEmploymentType, normalizeEmployeeStatus } from '../../src/shared/utils/employeePresentation';

vi.mock('../../src/shared/services/apiClient', () => ({ default: { put: vi.fn(), delete: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it.each(['Employee', 'HR', 'Mentor'])('updates %s employee fields without mentor course requirements', async (role) => {
  apiClient.put.mockResolvedValue({ data: { success: true } });
  await employeeService.updateEmployee(42, { firstName: 'Test', role, employmentType: 'Contract', courseIds: [], mentorId: 99, userId: 100 });
  expect(apiClient.put).toHaveBeenCalledWith('/api/v1/organization/employees/42', {
    firstName: 'Test', role, employeeType: 'Contract',
  });
});

it('deletes using the employee endpoint and propagates failures', async () => {
  const error = new Error('Cannot delete assigned employee');
  apiClient.delete.mockRejectedValue(error);
  await expect(employeeService.deleteEmployee(42)).rejects.toBe(error);
  expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/organization/employees/42');
});

it.each([['FULL_TIME', 'Full-time'], ['Full Time', 'Full-time'], ['part_time', 'Part-time'], ['Contract', 'Contract'], ['Intern', 'Intern'], ['', ''], ['Consultant', 'Consultant']])('maps employment type %s without inventing a default', (input, expected) => {
  expect(normalizeEmploymentType(input)).toBe(expected);
});

it.each(['Inactive', 'INACTIVE', 'disabled', 'deactivated', false])('normalizes inactive status %s', (value) => {
  expect(normalizeEmployeeStatus(value)).toBe('inactive');
});
