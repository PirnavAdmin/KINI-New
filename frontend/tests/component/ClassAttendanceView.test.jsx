import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import LiveClassDrawer from '@features/live-classes/components/LiveClassDrawer';
afterEach(cleanup);
const record = { id: 11, title: 'Java Full Stack', status: 'completed', statusLabel: 'Completed', studentsCount: 1 };
it('shows student attendance records when viewing a completed class', () => {
  render(<LiveClassDrawer open record={record} attendanceRows={[{ studentId: 5, name: 'Test Learner', email: 'learner@example.test', status: 'present' }]} />);
  expect(screen.getByRole('cell', { name: 'Test Learner' })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: 'present' })).toBeInTheDocument();
});
it('distinguishes failed attendance loading from an empty completed class', () => {
  render(<LiveClassDrawer open record={record} attendanceError="Unable to load attendance" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load attendance');
  expect(screen.queryByText('No student attendance recorded for this class.')).toBeNull();
});
