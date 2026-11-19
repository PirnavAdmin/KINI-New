import { beforeEach, expect, it, vi } from 'vitest';
import { courseService } from '@/services/courseService';
import apiClient from '@shared/services/apiClient';
import { getUserProfile } from '@/services/profileService';
import { batchService } from '@shared/services/batchService';

vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn() } }));
vi.mock('@/services/profileService', () => ({ getUserProfile: vi.fn(), resolveUserId: (user) => user.userId }));
vi.mock('@shared/services/batchService', () => ({ batchService: { getStudents: vi.fn(), getById: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ userId: 45, studentId: 12, email: 'narendra@example.test' }));
  getUserProfile.mockResolvedValue({ raw: { studentId: 12, email: 'narendra@example.test' } });
  batchService.getStudents.mockResolvedValue(null);
  batchService.getById.mockResolvedValue(null);
});

it('does not call the forbidden organization batch endpoint', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [{ courseId: 1, batchId: 3 }] } });
  batchService.getStudents.mockResolvedValue({ batchId: 3, mentorId: 1, mentorName: 'MAHESH MAHI' });
  expect((await courseService.getStudentCourses())[0]).toMatchObject({ mentorId: 1, mentorName: 'MAHESH MAHI' });
  expect(batchService.getById).not.toHaveBeenCalled();
});

it('resolves only the assigned mentor ID from the dropdown', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [{ courseId: 1, batchId: 3 }] } })
    .mockResolvedValueOnce({ data: [{ mentorId: 9, mentorName: 'Other mentor' }, { mentorId: 1, mentorName: 'MAHESH MAHI' }] });
  batchService.getStudents.mockResolvedValue({ batchId: 3, mentorId: 1 });
  expect((await courseService.getStudentCourses())[0].mentorName).toBe('MAHESH MAHI');
});

it('fills missing course mentor details from the enrolled batch', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [{ courseId: 1, courseName: 'React.js', batchId: 3, mentorName: '' }] } });
  batchService.getStudents.mockResolvedValue({ batchId: 3, mentorId: 1, mentorName: 'MAHESH MAHI' });
  const [course] = await courseService.getStudentCourses();
  expect(course).toMatchObject({ courseId: 1, batchId: 3, mentorId: 1, mentorName: 'MAHESH MAHI' });
  expect(batchService.getStudents).toHaveBeenCalledWith(3);
});

it('does not replace an enrollment mentor or use a different batch assignment', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [{ courseId: 1, batchId: 3, mentorId: 1, mentorName: 'Assigned mentor' }] } });
  const [course] = await courseService.getStudentCourses();
  expect(course.mentorName).toBe('Assigned mentor');
  expect(batchService.getStudents).not.toHaveBeenCalled();
});

it('loads all batch assignments using the student ID when the course list is empty', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [] } }).mockResolvedValueOnce({ data: { studentId: 12, courses: [{ courseId: 8, courseName: 'React.js', batchId: 3, batchName: 'React.js 1', mentorName: 'MAHESH MAHI' }] } });
  const courses = await courseService.getStudentCourses();
  expect(courses).toEqual([expect.objectContaining({ id: 8, courseId: 8, courseName: 'React.js', batchName: 'React.js 1', mentorName: 'MAHESH MAHI' })]);
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/StudentBatch/student/12/enrollments', { skipAuthRedirect: true });
});

it('keeps the complete course list when the student endpoint returns enrollments', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [{ courseId: 8, courseName: 'React.js' }] } });
  expect(await courseService.getStudentCourses()).toHaveLength(1);
  expect(apiClient.get).toHaveBeenCalledOnce();
});

it('never substitutes the Auth user ID for a missing student ID', async () => {
  localStorage.setItem('user', JSON.stringify({ userId: 45 }));
  getUserProfile.mockResolvedValue({ raw: {} });
  apiClient.get.mockResolvedValueOnce({ data: { courses: [] } });
  expect(await courseService.getStudentCourses()).toEqual([]);
  expect(apiClient.get).toHaveBeenCalledOnce();
});

it('rejects a record belonging to a different account', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [] } }).mockResolvedValueOnce({ data: { studentId: 99, courses: [{ courseId: 8 }] } });
  await expect(courseService.getStudentCourses()).rejects.toThrow('does not match');
});

it('reports a denied profile request instead of claiming there are no assignments', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { courses: [] } }).mockRejectedValueOnce({ response: { status: 403 } });
  await expect(courseService.getStudentCourses()).rejects.toMatchObject({ response: { status: 403 } });
});
