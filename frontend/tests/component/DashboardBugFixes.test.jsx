import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrganizationAttendance from '@features/organization/pages/OrganizationAttendance';
import { readStudentDeletionActivity, recordStudentDeletion } from '@features/organization/utils/recentActivity';
import { studentsApi } from '@/api/students';

vi.mock('@/api/students', () => ({ studentsApi: {
  list: vi.fn(), getAttendance: vi.fn(), getErrorMessage: () => 'Unable to load',
} }));
vi.mock('@features/organization/pages/AttendanceApiReady', () => ({ default: () => <p>Employee records</p> }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

it('opens student attendance with real student records and filters the last seven days', async () => {
  studentsApi.list.mockResolvedValue({ data: [{ id: 4, name: 'Test learner' }] });
  studentsApi.getAttendance.mockResolvedValue({ data: [
    { id: 1, date: new Date().toISOString(), className: 'Recent class', status: 'Present' },
    { id: 2, date: '2000-01-01', className: 'Past class', status: 'Absent' },
  ] });
  render(<MemoryRouter initialEntries={['/organization/attendance?scope=students&period=7-days']}><OrganizationAttendance /></MemoryRouter>);
  expect(await screen.findByText('Recent class')).toBeTruthy();
  expect(screen.queryByText('Past class')).toBeNull();
  expect(screen.queryByText('Employee records')).toBeNull();
  expect(studentsApi.getAttendance).toHaveBeenCalledWith(4);
});

it('opens employee attendance inside the organization workspace', () => {
  render(<MemoryRouter initialEntries={['/organization/attendance?scope=employees']}><OrganizationAttendance /></MemoryRouter>);
  expect(screen.getByText('Employee records')).toBeTruthy();
});

it('retains deletion activity only for the organization that deleted the student', () => {
  recordStudentDeletion('7', { id: 4, name: 'Test learner' });
  expect(readStudentDeletionActivity('7')[0]).toMatchObject({ text: 'Test learner deleted', path: '/organization/students' });
  expect(readStudentDeletionActivity('8')).toEqual([]);
});
