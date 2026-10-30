import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import OrganizationProfilePage from '@features/organization/pages/OrganizationProfilePage';
import { branchApi, departmentApi, teamsApi } from '@shared/services/apiServices';
import { employeeService } from '@shared/services/employeeService';

vi.mock('@shared/services/apiServices', async original => ({
  ...await original(),
  readStoredOrganizationId: () => 2,
  organizationApi: { getById: vi.fn().mockResolvedValue({ organizationId: 2, name: 'Test Organization', email: 'org@example.com' }) },
  branchApi: { list: vi.fn() }, departmentApi: { list: vi.fn() }, teamsApi: { list: vi.fn() },
}));
vi.mock('@shared/services/employeeService', () => ({ employeeService: { getEmployees: vi.fn() } }));
vi.mock('@/components/common/KPI', () => ({ default: ({ label, value }) => <div aria-label={label}>{value}</div> }));
afterEach(cleanup);
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  employeeService.getEmployees.mockResolvedValue({ data: [{ id: 1 }], totalRecords: 13 });
  branchApi.list.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  departmentApi.list.mockResolvedValue([{ id: 1 }]);
  teamsApi.list.mockResolvedValue([{ status: 'Active' }, { isActive: true }, { status: 'Inactive' }, { isActive: false }]);
});
it('loads actual organization counts and uses total records rather than the current employee page', async () => {
  render(<OrganizationProfilePage />);
  expect(await screen.findByLabelText('Total Employees')).toHaveTextContent('13');
  expect(screen.getByLabelText('Branches')).toHaveTextContent('2');
  expect(screen.queryByLabelText('Departments')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Active Teams')).not.toBeInTheDocument();
  expect(branchApi.list).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 2, pageSize: 1000 }));
});
it('keeps other counts visible and marks a failed count unavailable', async () => {
  branchApi.list.mockRejectedValue(new Error('Unavailable'));
  render(<OrganizationProfilePage />);
  expect(await screen.findByLabelText('Branches')).toHaveTextContent('—');
  expect(screen.getByLabelText('Total Employees')).toHaveTextContent('13');
  expect(screen.getByRole('status')).toHaveTextContent('Some organization counts could not be loaded');
});
