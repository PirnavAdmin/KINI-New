import { expect, it } from 'vitest';
import { isHrModuleUser } from '../../src/features/hr/constants/hrPermissions';
import { normalizeRole } from '../../src/shared/constants/roles';

it.each(['HR_MANAGER', 'hr_manager', 'HR Manager', 'HR_EXECUTIVE', 'HR_COORDINATOR', 'HRExecutive', 'HRRecruiter'])(
  'keeps the HR specialization on the employee route group: %s', role => {
    expect(normalizeRole(role)).toBe('employee');
    expect(isHrModuleUser({ role: 'employee', roleName: role })).toBe(true);
  },
);

it.each([
  { role: 'HR' },
  { role: 'employee', userRole: 'HR' },
  { role: 'employee', workspaceProfile: { professionalDetails: { Department: { Name: 'Human Resources' } } } },
  { Employee: { DepartmentName: 'HR' } },
  { profile: { hrRole: 'HR_MANAGER' } },
])('recognizes HR identity from supported login/profile shapes: %j', user => {
  expect(isHrModuleUser(user)).toBe(true);
});

it.each([
  { role: 'employee', department: 'Engineering', jobTitle: 'Team Manager' },
  { role: 'employee', permissions: ['leave', 'dashboard'] },
  { role: 'employee', email: 'hr@example.com' },
  { role: 'employee' },
  null,
])('does not promote unrelated employees to HR: %j', user => {
  expect(isHrModuleUser(user)).toBe(false);
});
