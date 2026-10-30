import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrainerProfile from '../../src/pages/trainers/TrainerProfile';
import MentorPasswordReset from '../../src/pages/trainers/MentorPasswordReset';
import { authService } from '../../src/shared/services/authService';

vi.mock('../../src/shared/services/authService', () => ({ authService: { forgotPassword: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const trainer = { id: 42, name: 'Test Mentor', email: 'mentor@example.com', courses: [], skills: [], schedule: [], assignedBatches: [], status: 'Active' };

it('closes the actions menu after an action, outside click, and Escape', () => {
  const onAction = vi.fn();
  render(<MemoryRouter><TrainerProfile trainer={trainer} onAction={onAction} /></MemoryRouter>);
  const menu = screen.getByRole('button', { name: 'More mentor actions' });
  fireEvent.click(menu);
  fireEvent.click(screen.getByRole('button', { name: 'Export profile' }));
  expect(onAction).toHaveBeenCalledWith('Export Profile', trainer);
  expect(screen.queryByRole('button', { name: 'Export profile' })).not.toBeInTheDocument();
  fireEvent.click(menu);
  fireEvent.pointerDown(document.body);
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(menu);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});

it('dispatches Manage Schedule separately from selecting the Schedule tab', () => {
  const onAction = vi.fn();
  render(<MemoryRouter><TrainerProfile trainer={trainer} initialTab="Schedule" onAction={onAction} /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Manage schedule' }));
  expect(onAction).toHaveBeenCalledWith('Manage Schedule', trainer);
});

it('waits for successful reset request before displaying completion', async () => {
  const onComplete = vi.fn();
  let resolve;
  authService.forgotPassword.mockImplementation(() => new Promise((done) => { resolve = done; }));
  render(<MentorPasswordReset trainer={trainer} onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
  expect(onComplete).not.toHaveBeenCalled();
  expect(authService.forgotPassword).toHaveBeenCalledWith(trainer.email, 'Email');
  resolve({});
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it('shows password-reset errors without closing the dialog', async () => {
  authService.forgotPassword.mockRejectedValue(new Error('Reset unavailable'));
  const onComplete = vi.fn();
  render(<MentorPasswordReset trainer={trainer} onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Reset unavailable');
  expect(onComplete).not.toHaveBeenCalled();
});
