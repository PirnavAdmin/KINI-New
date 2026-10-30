import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudentMyBatch from '../../src/features/student/pages/StudentMyBatch';
import StudentCourses from '../../src/pages/student/courses/StudentCourses';
import { normalizeStudentEnrollments } from '../../src/features/student/utils/studentEnrollments';
import { buildStudentClassScope, partitionClassesByScope } from '../../src/features/student/utils/studentClassAccess';

// My Courses and My Batch both read GET /api/v1/student/courses (token-scoped).
// Its live body is { success, message, studentId, studentName, courses: [...] }.
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  auth: { user: { studentId: '1', email: 'student@example.test', role: 'Student' }, role: 'student', authLoading: false },
}));
vi.mock('@shared/services/apiClient', () => ({ default: { get: mocks.get } }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('@shared/services/batchService', () => ({
  batchService: {
    getById: vi.fn(() => Promise.reject({ response: { status: 403 } })),
    getStudents: vi.fn(() => Promise.reject({ response: { status: 403 } })),
  },
}));

const body = (courses) => ({ data: { success: true, message: 'ok', studentId: 1, studentName: 'Test Student', courses } });
const JAVA = { courseId: 2, courseName: 'Java Full Stack', batchId: 1, batchName: 'Java Full Stack 1', mentorId: 1, mentorName: 'Srinivas Poorna', enrollmentStatus: 'Active' };
const PYTHON = {
  courseId: 5,
  courseName: 'Python Data',
  batches: [
    { batchId: 7, batchName: 'Python Morning', mentorName: 'Asha Rao', status: 'Active' },
    { batchId: 8, batchName: 'Python Weekend', mentorName: 'Ravi Kumar', status: 'Upcoming' },
  ],
};

const renderPage = (Page) => render(<MemoryRouter><Page /></MemoryRouter>);

beforeEach(() => {
  mocks.get.mockReset();
  mocks.auth = { user: { studentId: '1', email: 'student@example.test', role: 'Student' }, role: 'student', authLoading: false };
});
afterEach(() => cleanup());

describe('Student enrollments on My Batch and My Courses', () => {
  it('requests the token-scoped endpoint without any student id', async () => {
    mocks.get.mockResolvedValue(body([JAVA]));
    renderPage(StudentMyBatch);
    await screen.findByLabelText('Java Full Stack 1');
    expect(mocks.get).toHaveBeenCalledWith('/api/v1/student/courses', expect.objectContaining({ skipAuthRedirect: true }));
    expect(mocks.get.mock.calls.every(([url]) => !/\/1\b|enrollments/.test(url))).toBe(true);
  });

  it('renders a single enrollment with its course, batch and mentor', async () => {
    mocks.get.mockResolvedValue(body([JAVA]));
    renderPage(StudentMyBatch);
    const batch = await screen.findByLabelText('Java Full Stack 1');
    expect(within(batch).getAllByText('Java Full Stack').length).toBeGreaterThan(0);
    expect(within(batch).getByText('Srinivas Poorna')).toBeInTheDocument();
    expect(screen.queryByText('No Batch Assigned')).not.toBeInTheDocument();
  });

  it('renders a single enrollment object (not wrapped in an array)', async () => {
    mocks.get.mockResolvedValue(body(JAVA));
    renderPage(StudentCourses);
    expect(await screen.findByText('Java Full Stack')).toBeInTheDocument();
    expect(screen.queryByText('No Course Assigned')).not.toBeInTheDocument();
  });

  it('renders every batch of every enrollment on My Batch', async () => {
    mocks.get.mockResolvedValue(body([JAVA, PYTHON]));
    renderPage(StudentMyBatch);
    expect(await screen.findByLabelText('Java Full Stack 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Python Morning')).toBeInTheDocument();
    expect(screen.getByLabelText('Python Weekend')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Python Weekend')).getByText('Ravi Kumar')).toBeInTheDocument();
  });

  it('renders every enrolled course on My Courses with all of its batches', async () => {
    mocks.get.mockResolvedValue(body([JAVA, PYTHON]));
    renderPage(StudentCourses);
    expect(await screen.findByText('Java Full Stack')).toBeInTheDocument();
    expect(screen.getByText('Python Data')).toBeInTheDocument();
    expect(screen.getByText(/Python Morning, Python Weekend/)).toBeInTheDocument();
  });

  it('shows the genuine empty state only when the backend reports no enrollments', async () => {
    mocks.get.mockResolvedValue(body([]));
    renderPage(StudentMyBatch);
    expect(await screen.findByText('No Batch Assigned')).toBeInTheDocument();
    cleanup();
    renderPage(StudentCourses);
    expect(await screen.findByText('No Course Assigned')).toBeInTheDocument();
  });

  it.each([
    ['a server error', () => mocks.get.mockRejectedValue({ response: { status: 500 } }), 'Unable to load your batch information.'],
    ['an expired session', () => mocks.get.mockRejectedValue({ response: { status: 401 } }), 'Your session has expired. Please log in again.'],
    ['a rejected body', () => mocks.get.mockResolvedValue({ status: 200, data: { success: false, message: 'Failed' } }), 'Unable to load your batch information.'],
    ['an unrecognized body', () => mocks.get.mockResolvedValue({ status: 200, data: { unexpected: true } }), 'Unable to load your batch information.'],
  ])('shows an error, not "No Batch Assigned", after %s', async (_label, arrange, message) => {
    arrange();
    renderPage(StudentMyBatch);
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByText('No Batch Assigned')).not.toBeInTheDocument();
  });

  it('shows an error on My Courses instead of the empty state when the request fails', async () => {
    mocks.get.mockRejectedValue({ response: { status: 500 } });
    renderPage(StudentCourses);
    expect(await screen.findByText('Unable to load your courses right now. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('No Course Assigned')).not.toBeInTheDocument();
  });

  it('never loads enrollments for a non-student account', async () => {
    mocks.auth = { ...mocks.auth, role: 'employee' };
    renderPage(StudentMyBatch);
    expect(await screen.findByRole('alert')).toHaveTextContent('This page is available only to a student account.');
    await waitFor(() => expect(mocks.get).not.toHaveBeenCalled());
  });
});

describe('Student classes are limited to real enrolled course and batch ids', () => {
  const scope = buildStudentClassScope({ enrollments: normalizeStudentEnrollments([JAVA, PYTHON]) });
  const live = (liveClassId, courseId, batchId) => ({ liveClassId, classTitle: `Class ${liveClassId}`, courseId, batchId });

  it('keeps classes of the enrolled courses and batches, whatever the id type', () => {
    const { allowed } = partitionClassesByScope([live(1, 2, 1), live(2, '5', '8'), live(3, 5, 7)], scope);
    expect(allowed.map((item) => item.liveClassId)).toEqual([1, 2, 3]);
  });

  it('never shows classes of another course or another batch of an enrolled course', () => {
    const { allowed, blocked } = partitionClassesByScope([live(10, 4, 3), live(11, 2, 99), live(12, null, 42), live(13, null, null)], scope);
    expect(allowed).toEqual([]);
    expect(blocked).toHaveLength(4);
  });

  it('shows no class at all when the student has no enrollments', () => {
    const empty = buildStudentClassScope({ enrollments: normalizeStudentEnrollments([]) });
    expect(partitionClassesByScope([live(1, 2, 1)], empty).allowed).toEqual([]);
  });
});
