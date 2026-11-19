import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from '@features/student/pages/StudentDashboard';

const mock = vi.hoisted(() => ({ enrollment: { loading: false, status: 'ready', enrollments: [] } }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@features/student/hooks/useStudentEnrollments', () => ({ useStudentEnrollments: () => mock.enrollment }));
vi.mock('@features/student/hooks/useStudentClassScope', () => ({ useStudentClassScope: () => ({ allows: () => false }) }));
vi.mock('@features/student/hooks/useClassRefresh', () => ({ default: () => 0 }));
vi.mock('@/components/common/KPI', () => ({ default: ({ label, value, description }) => <div aria-label={label}>{value}<span>{description}</span></div> }));
vi.mock('recharts', () => ({ Area: () => null, AreaChart: () => null, CartesianGrid: () => null, ResponsiveContainer: () => null, Tooltip: () => null, XAxis: () => null, YAxis: () => null }));
afterEach(cleanup);

it.each([
  [[], '0'],
  [[{ courseId: '2', courseName: 'React', batchId: '1' }], '1'],
  [[{ courseId: '2', courseName: 'React', batchId: '1' }, { courseId: '2', courseName: 'React', batchId: '3' }], '1'],
  [[{ courseId: '2', courseName: 'React' }, { courseId: '4', courseName: 'Java' }], '2'],
])('uses the same unique enrolled courses as My Courses (%j)', (enrollments, count) => {
  mock.enrollment = { loading: false, status: 'ready', enrollments };
  render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
  expect(screen.getByLabelText('Enrolled Courses').textContent).toMatch(new RegExp(`^${count}`));
});

it('shows unavailable instead of an invented count when enrollment loading fails', () => {
  mock.enrollment = { loading: false, status: 'error', enrollments: [] };
  render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
  expect(screen.getByLabelText('Enrolled Courses')).toHaveTextContent('Unavailable');
});
