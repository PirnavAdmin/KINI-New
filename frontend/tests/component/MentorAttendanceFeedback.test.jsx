import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MentorAttendance from '@features/mentor/pages/MentorAttendance';
import { mentorWorkAttendance } from '@features/mentor/services/mentorWorkAttendance';
import { triggerFileDownload } from '@shared/utils/download';
import toast from 'react-hot-toast';
const { user } = vi.hoisted(() => ({ user: { employeeId: 7, mentorId: 9, fullName: 'Test Mentor', email: 'mentor@example.test' } }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user, employeeIdResolving: false }) }));
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, isLoading: false }) }));
vi.mock('@shared/hooks/useProfilePhoto', () => ({ useCurrentUserPhoto: () => null }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@shared/utils/download', () => ({ triggerFileDownload: vi.fn() }));
vi.mock('@features/mentor/services/mentorWorkAttendance', async importOriginal => ({
  ...await importOriginal(), mentorWorkAttendance: {
    getHistory: vi.fn(() => []), getIdentity: () => ({ id: 7, email: 'mentor@example.test' }),
    load: vi.fn().mockResolvedValue([]), checkIn: vi.fn(), checkOut: vi.fn(),
  },
}));
const open = () => render(<MemoryRouter><MentorAttendance /></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); mentorWorkAttendance.getHistory.mockReturnValue([]); });
afterEach(cleanup);

it('announces check-in only after the request succeeds', async () => {
  let finish;
  mentorWorkAttendance.checkIn.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  open();
  fireEvent.click(screen.getAllByRole('button', { name: 'Check In', exact: true })[0]);
  expect(toast.success).not.toHaveBeenCalled();
  await act(async () => finish({}));
  expect(toast.success).toHaveBeenCalledWith('Checked in successfully.');
});
it('does not announce success for a rejected check-in', async () => {
  mentorWorkAttendance.checkIn.mockRejectedValueOnce(new Error('Check-in failed'));
  open();
  fireEvent.click(screen.getAllByRole('button', { name: 'Check In', exact: true })[0]);
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Check In', exact: true })[0]).not.toBeDisabled());
  expect(toast.success).not.toHaveBeenCalled();
});
it('closes the status menu on outside click and Escape', () => {
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Filter', exact: true }));
  expect(screen.getByRole('menu')).toBeInTheDocument();
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('menu')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Filter', exact: true }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('menu')).toBeNull();
});
it('starts the export and displays a success notification', () => {
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Export', exact: true }));
  expect(triggerFileDownload).toHaveBeenCalledWith(expect.any(Blob), expect.stringMatching(/^attendance-.*\.csv$/));
  expect(toast.success).toHaveBeenCalledWith('Attendance export download started.');
});
it('reports export failure without a success notification', () => {
  triggerFileDownload.mockImplementationOnce(() => { throw new Error('Download failed'); });
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Export', exact: true }));
  expect(toast.error).toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
});
