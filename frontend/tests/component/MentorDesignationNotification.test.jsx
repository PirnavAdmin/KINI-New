import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import TrainerForm from '@/pages/trainers/TrainerForm';
import toast from 'react-hot-toast';
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }));
vi.mock('@shared/hooks/useProfilePhoto', () => ({ useProfilePhoto: () => ({ photoUrl: null }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('notifies a failed designation update and retains the entered designation', async () => {
  const onClose = vi.fn();
  render(<TrainerForm open initialSection="Employment" trainer={{ id: 7, employeeRecordId: 7, name: 'Test Mentor', designation: 'Mentor', email: 'test@example.com', mobile: '9876543210' }}
    onClose={onClose} onSave={vi.fn().mockRejectedValue(new Error('Designation update rejected'))} />);
  fireEvent.change(screen.getByLabelText('Designation'), { target: { value: 'Senior Mentor' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save mentor' }));
  expect(await screen.findByText('Designation update rejected')).toBeInTheDocument();
  expect(toast.error).toHaveBeenCalledWith('Designation update rejected');
  expect(screen.getByLabelText('Designation')).toHaveValue('Senior Mentor');
  expect(onClose).not.toHaveBeenCalled();
});
