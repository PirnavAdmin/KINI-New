import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MentorSettings from '@features/mentor/pages/MentorSettings';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@features/mentor/components/MentorPageHeader', () => ({ default: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('rejects numeric names and invalid Indian mobile numbers', () => {
  render(<MentorSettings />);
  const name = screen.getByRole('textbox', { name: 'First Name' });
  fireEvent.change(name, { target: { value: 'Mentor123' } });
  expect(name).toHaveValue('Mentor');
  const phone = screen.getByRole('textbox', { name: 'Phone' });
  fireEvent.change(phone, { target: { value: '98765432101' } });
  expect(phone).toHaveValue('');
  fireEvent.change(phone, { target: { value: '1234567890' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(toast.error).toHaveBeenCalledWith('Phone number must be 10 digits and start with 6, 7, 8, or 9');
});

it('toggles each password independently and identifies a confirmation mismatch', () => {
  render(<MentorSettings />);
  fireEvent.click(screen.getByRole('button', { name: 'Security' }));
  fireEvent.click(screen.getByRole('button', { name: 'Show current password' }));
  expect(screen.getByLabelText('Current Password')).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'password');
  for (const [label, value] of [['Current Password', 'old-secret'], ['New Password', 'new-secret'], ['Confirm New Password', 'different']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(toast.error).toHaveBeenCalledWith('Confirm new password does not match the new password');
});
