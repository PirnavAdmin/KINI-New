import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmployeeDetails from '@features/organization/pages/EmployeeDetails';

vi.mock('@shared/hooks/useProfilePhoto', () => ({ useProfilePhoto: () => ({ photoUrl: null, loading: true }) }));
vi.mock('@/components/common/KPI', () => ({ default: ({ label, value }) => <p data-testid={label}>{value}</p> }));
vi.mock('@shared/services/employeeService', () => ({ employeeService: {
  getEmployee: async () => ({ employeeId: 7, firstName: 'Test', lastName: 'Mentor', role: 'Mentor', houseNumber: '10', streetArea: 'Main Road' }),
  getEmployeeBatches: async () => ({ batches: [
    { batchId: 11, batchName: 'Java One', courseId: 3, courseName: 'Java', studentCount: 50 },
    { batchId: 11, batchName: 'Java One', courseId: 3, courseName: 'Java', studentCount: 50 },
    { batchId: 12, batchName: 'Java Two', courseId: 3, courseName: 'Java', studentCount: 50 },
  ] }),
  getAttendance: async () => [],
} }));
vi.mock('@/api/students', () => ({ studentsApi: { list: async () => ({ data: [
  { studentId: 1, name: 'Student One', batchId: 11, status: 'Active' },
  { studentId: 2, name: 'Student Two', batchId: 12, status: 'Active' },
  { studentId: 3, name: 'Pending Student', batchId: 11, status: 'PendingApproval' },
] }) } }));
vi.mock('@shared/services/batchService', () => ({ batchService: { getStudents: async id => ({
  students: id === 11 ? [{ studentId: 1 }, { studentId: 3 }] : [{ studentId: 1 }, { studentId: 2 }],
}) } }));
vi.mock('@shared/services/courseService', () => ({ courseService: { getCourses: async () => ({ data: [] }) } }));
afterEach(cleanup);

it('counts unique mentor batches and students using their actual rosters and displays the saved address', async () => {
  render(<MemoryRouter initialEntries={['/organization/employees/7']}><Routes><Route path="/organization/employees/:employeeId" element={<EmployeeDetails />} /></Routes></MemoryRouter>);
  await waitFor(() => expect(screen.getByTestId('Assigned Batches')).toHaveTextContent('2'));
  await waitFor(() => expect(screen.getByTestId('Total Students')).toHaveTextContent('2'));
  expect(screen.getAllByText('10, Main Road').length).toBeGreaterThan(0);
});
