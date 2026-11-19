import { afterEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { employeeService, matchesEmployeeSearch } from '@shared/services/employeeService'
vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn() } }))
afterEach(() => vi.clearAllMocks())
const employee = { employeeId: 3, firstName: 'Sai', lastName: 'Purna', email: 'sai@example.com', phone: '9944103404', role: 'HR' }
it('sorts the complete roster alphabetically before selecting a page even when the server ignores sorting', async () => {
  const rows = ['narendra', 'nani', 'MANI', 'MAHESH'].map((firstName, index) => ({ employeeId: index + 1, firstName }));
  apiClient.get.mockResolvedValue({ data: { data: rows, totalRecords: 4, totalPages: 1, pageSize: 1000 } });
  const result = await employeeService.getEmployees({ sortBy: 'FirstName', pageSize: 2, pageNumber: 1 });
  expect(result.data.map(row => row.firstName)).toEqual(['MAHESH', 'MANI']);
  const reverse = await employeeService.getEmployees({ sortBy: 'FirstName', isDescending: true, pageSize: 2, pageNumber: 2 });
  expect(reverse.data.map(row => row.firstName)).toEqual(['MANI', 'MAHESH']);
});
it.each(['sai purna', ' SAI   PURNA ', 'example.com', '99441', '99441 03404', 'hr'])('matches displayed employee fields for %s', term => {
  expect(matchesEmployeeSearch(employee, term)).toBe(true)
  expect(matchesEmployeeSearch(employee, 'unrelated')).toBe(false)
})
it('searches all roster pages before applying result pagination', async () => {
  apiClient.get.mockImplementation(async (url, { params }) => ({ data: { data: params.PageNumber === 1 ? [{ ...employee, employeeId: 1, firstName: 'Other', lastName: 'Person', email: 'other@example.com', role: 'Mentor' }] : [employee], totalRecords: 2, pageNumber: params.PageNumber, pageSize: 1, totalPages: 2 } }))
  const result = await employeeService.getEmployees({ searchText: 'Sai Purna', pageNumber: 3, pageSize: 10, status: 'Active' })
  expect(result).toMatchObject({ data: [employee], totalRecords: 1, totalPages: 1, pageNumber: 1 })
  expect(apiClient.get).toHaveBeenCalledTimes(2)
  expect(apiClient.get.mock.calls.every(([, config]) => config.params.Search === undefined && config.params.Status === 'Active')).toBe(true)
})
it('preserves normal server pagination when search is cleared', async () => {
  apiClient.get.mockResolvedValue({ data: { data: [employee], totalRecords: 21, pageNumber: 2, pageSize: 10, totalPages: 3 } })
  const result = await employeeService.getEmployees({ searchText: '', pageNumber: 2, pageSize: 10 })
  expect(result).toMatchObject({ pageNumber: 2, totalRecords: 21 })
  expect(apiClient.get).toHaveBeenCalledTimes(1)
})
