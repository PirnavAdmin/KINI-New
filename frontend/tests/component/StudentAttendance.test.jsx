import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import StudentAttendance from '../../src/features/student/pages/StudentAttendance';
import { useAuth } from '../../src/shared/hooks/useAuth';
import { attendanceService } from '../../src/shared/services/attendanceService';
import { liveClassService } from '../../src/features/live-classes/services/liveClassService';
import { studentClassService } from '../../src/shared/services/studentClassService';
import { triggerFileDownload } from '../../src/shared/utils/download';

vi.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../src/shared/services/attendanceService', () => ({ attendanceService: {
  byStudent: vi.fn(), studentSummary: vi.fn(), studentPercentage: vi.fn(),
} }));
vi.mock('../../src/shared/services/studentClassService', () => ({
  getStudentClassJoinAttendance: () => [],
  studentClassService: { markAttendanceJoined: vi.fn(), markAttendanceLeft: vi.fn() },
}));
vi.mock('../../src/features/live-classes/services/liveClassService', () => ({
  liveClassService: { today: vi.fn(), live: vi.fn() },
}));
vi.mock('../../src/shared/utils/download', () => ({ triggerFileDownload: vi.fn() }));
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: 99 }, role: 'student' });
  attendanceService.studentSummary.mockResolvedValue(null);
  attendanceService.studentPercentage.mockResolvedValue(null);
  liveClassService.today.mockResolvedValue([]);
  liveClassService.live.mockResolvedValue([]);
  studentClassService.markAttendanceJoined.mockResolvedValue({ attendanceId: 1 });
  studentClassService.markAttendanceLeft.mockResolvedValue({ attendanceId: 1 });
});

it('checks in to the authenticated student live class and refreshes authoritative attendance', async () => {
  useAuth.mockReturnValue({ user: { studentId: 7 }, role: 'student' });
  liveClassService.live.mockResolvedValue([{ liveClassId: 31, classTitle: 'Live React', scheduledDate: new Date().toISOString().slice(0, 10), startTime: '10:00:00', status: 'live' }]);
  attendanceService.byStudent
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ attendanceId: 8, liveClassId: 31, attendanceDate: new Date().toISOString(), status: 'Present' }]);
  render(<StudentAttendance />);
  fireEvent.click(await screen.findByRole('button', { name: 'Check In' }));
  await waitFor(() => expect(studentClassService.markAttendanceJoined).toHaveBeenCalledWith(expect.objectContaining({ studentId: 7, liveClassId: 31 }), { skipAuthRedirect: true }));
  await waitFor(() => expect(attendanceService.byStudent).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('button', { name: 'Check Out' })).toBeEnabled();
});

it('checks out of an active class and refreshes the server state', async () => {
  useAuth.mockReturnValue({ user: { studentId: 7 }, role: 'student' });
  liveClassService.live.mockResolvedValue([{ liveClassId: 31, classTitle: 'Live React', scheduledDate: new Date().toISOString().slice(0, 10), startTime: '10:00:00', status: 'live' }]);
  attendanceService.byStudent
    .mockResolvedValueOnce([{ attendanceId: 8, liveClassId: 31, attendanceDate: new Date().toISOString(), status: 'Present' }])
    .mockResolvedValueOnce([{ attendanceId: 8, liveClassId: 31, attendanceDate: new Date().toISOString(), status: 'Present', checkedOutAt: new Date().toISOString() }]);
  render(<StudentAttendance />);
  fireEvent.click(await screen.findByRole('button', { name: 'Check Out' }));
  await waitFor(() => expect(studentClassService.markAttendanceLeft).toHaveBeenCalledWith(expect.objectContaining({ studentId: 7, liveClassId: 31, checkedOutAt: expect.any(String) }), { skipAuthRedirect: true }));
  expect(await screen.findByText('Attendance completed')).toBeInTheDocument();
});

it('downloads a valid empty week report and keeps period tabs dimensionally consistent', async () => {
  useAuth.mockReturnValue({ user: { studentId: 7 }, role: 'student' });
  attendanceService.byStudent.mockResolvedValue([]);
  render(<StudentAttendance />);
  const download = await screen.findByRole('button', { name: /Download week report/ });
  expect(download).toBeEnabled();
  fireEvent.click(download);
  expect(triggerFileDownload).toHaveBeenCalledWith(expect.any(Blob), expect.stringMatching(/^attendance-week-\d{4}-\d{2}-\d{2}\.csv$/));
  screen.getAllByRole('tab').forEach((tab) => expect(tab.className).toContain('h-10'));
});

it('uses the stored student ID instead of the login user ID', async () => {
  localStorage.setItem('studentId', '7');
  attendanceService.byStudent.mockResolvedValue([]);
  render(<StudentAttendance />);
  await waitFor(() => expect(attendanceService.byStudent).toHaveBeenCalledWith('7'));
});

it('does not invent attendance for an account missing a student ID', async () => {
  render(<StudentAttendance />);
  await screen.findByText(/Your student profile is unavailable/);
  expect(attendanceService.byStudent).not.toHaveBeenCalled();
  expect(screen.queryByText('React Hooks')).not.toBeInTheDocument();
});

it('shows unavailable values on server failure and loads real data on Retry', async () => {
  useAuth.mockReturnValue({ user: { studentId: 7 }, role: 'student' });
  attendanceService.byStudent.mockRejectedValue({ response: { status: 500 } });
  render(<StudentAttendance />);
  await screen.findByText(/server error 500/);
  expect(screen.queryByText('No Class')).not.toBeInTheDocument();
  expect(screen.queryByText('0%')).not.toBeInTheDocument();
  attendanceService.byStudent.mockResolvedValue([{ attendanceId: 1, attendanceDate: new Date().toISOString(), className: 'Live lesson', status: 'Present' }]);
  fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
  await screen.findByText('Live lesson');
  expect(screen.queryByText(/server error 500/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Download week report/ })).toBeEnabled();
});

it('shows nested live-class attendance in the correct week and counts each class once', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 15, 14));
  try {
    useAuth.mockReturnValue({ user: { studentId: 5 }, role: 'student' });
    attendanceService.byStudent.mockResolvedValue([
      { attendanceId: 45, liveClassId: 21, status: 'Absent', liveClass: { liveClassId: 21, classTitle: 'node js', scheduledDate: '2026-09-15T00:00:00' } },
      { attendanceId: 44, liveClassId: 21, status: 'Present', liveClass: { liveClassId: 21, classTitle: 'old duplicate', scheduledDate: '2026-09-15T00:00:00' } },
      { attendanceId: 43, liveClassId: 22, status: 'Present', isDeleted: true, liveClass: { liveClassId: 22, classTitle: 'deleted class', scheduledDate: '2026-09-15T00:00:00' } },
      { attendanceId: 39, liveClassId: 20, status: 'Present', liveClass: { liveClassId: 20, classTitle: 'last month', scheduledDate: '2026-08-20T00:00:00' } },
    ]);
    render(<StudentAttendance />);
    await screen.findByText('node js');
    expect(screen.getByText(/15 Sep(?:t)? 2026/)).toBeInTheDocument();
    expect(screen.getByText('This week · 1 classes')).toBeInTheDocument();
    expect(screen.getAllByText('Absent')).toHaveLength(2);
    expect(screen.queryByText('old duplicate')).not.toBeInTheDocument();
    expect(screen.queryByText('deleted class')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'This month' }));
    expect(screen.getByText('This month · 1 classes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'All time' }));
    expect(screen.getByText('last month')).toBeInTheDocument();
    expect(screen.getByText('All time · 2 classes')).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
