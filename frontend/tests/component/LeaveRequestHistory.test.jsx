import { beforeAll, afterAll, beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeLeaveRequests from '../../src/features/employee/pages/EmployeeLeaveRequests';
import leaveRequestService from '../../src/shared/services/leaveRequestService';

vi.mock('../../src/shared/services/leaveRequestService', () => ({ default: { mine: vi.fn(), create: vi.fn() } }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn() } }));

const originalScrollTo = HTMLElement.prototype.scrollTo;
beforeAll(() => { HTMLElement.prototype.scrollTo = vi.fn(); });
afterAll(() => { HTMLElement.prototype.scrollTo = originalScrollTo; });

const show = (openAdd = false) => render(<MemoryRouter initialEntries={[{ pathname: '/mentor/leave', state: { openAdd } }]}><EmployeeLeaveRequests audience="mentor" /></MemoryRouter>);
const fill = () => {
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-10-01' } });
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-10-02' } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Family commitment' } });
};
beforeEach(() => { cleanup(); vi.clearAllMocks(); leaveRequestService.mine.mockResolvedValue([]); });

it('opens history by default and refetches saved requests after submission and remount', async () => {
  let stored = [];
  leaveRequestService.mine.mockImplementation(async () => stored);
  leaveRequestService.create.mockImplementation(async payload => {
    stored = [{ ...payload, leaveRequestId: 41, status: 'Pending', totalDays: 2 }];
    return stored[0];
  });
  const view = show();
  await screen.findByText(/No submitted leave requests yet/);
  expect(screen.queryByLabelText('Reason')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'New Leave Request' }));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Send to HR review' }));
  await screen.findByText('Request #41');
  expect(leaveRequestService.create).toHaveBeenCalledExactlyOnceWith({ leaveType: 'Casual', startDate: '2026-10-01', endDate: '2026-10-02', reason: 'Family commitment' });
  expect(screen.getByText('Family commitment', { selector: 'span' })).toBeInTheDocument();
  view.unmount();
  stored[0].status = 'Rejected';
  stored[0].rejectionReason = 'Please choose another date';
  show();
  await screen.findByText('Request #41');
  expect(screen.getByText('rejected', { exact: true })).toBeInTheDocument();
  expect(screen.getByText(/Please choose another date/)).toBeInTheDocument();
});

it('retains the form on server failure and blocks duplicate submissions', async () => {
  let reject;
  leaveRequestService.create.mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
  show(true);
  await screen.findByLabelText('Reason');
  fill();
  fireEvent.submit(document.getElementById('employee-leave-request-form'));
  fireEvent.submit(document.getElementById('employee-leave-request-form'));
  expect(leaveRequestService.create).toHaveBeenCalledTimes(1);
  reject(new Error('Network unavailable'));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Reason')).toHaveValue('Family commitment');
  expect(screen.queryByText(/submitted successfully/)).not.toBeInTheDocument();
});

it('shows load failures instead of an empty history and supports retry', async () => {
  leaveRequestService.mine.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([]);
  show();
  await screen.findByRole('alert');
  expect(screen.queryByText(/No submitted leave requests yet/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByText(/No submitted leave requests yet/);
});

it('does not retry a forbidden history and rejects reversed dates before POST', async () => {
  leaveRequestService.mine.mockRejectedValue({ response: { status: 403 } });
  show(true);
  await screen.findByText(/You do not have access/);
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  fill();
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-01' } });
  fireEvent.submit(document.getElementById('employee-leave-request-form'));
  await waitFor(() => expect(screen.getByText('End date cannot be before the start date.')).toBeInTheDocument());
  expect(leaveRequestService.create).not.toHaveBeenCalled();
});
