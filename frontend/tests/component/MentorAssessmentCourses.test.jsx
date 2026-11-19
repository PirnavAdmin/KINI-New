import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { useAssessments } from '@/hooks/useAssessments';

const mocks = vi.hoisted(() => ({
  assessments: vi.fn(), batches: vi.fn(), assignedCourses: vi.fn(), allCourses: vi.fn(), orgBatches: vi.fn(),
}));
vi.mock('@/services/assessmentService', () => ({ default: { getAssessments: mocks.assessments }, normalizeAssessment: (row) => row }));
vi.mock('@shared/services/mentorService', () => ({ getMentorDashboardBatches: mocks.batches, getMentorDashboardCourses: mocks.assignedCourses }));
vi.mock('@shared/services/courseService', () => ({ courseService: { getCourses: mocks.allCourses } }));
vi.mock('@shared/services/batchService', () => ({ batchService: { getOrganizationBatches: mocks.orgBatches } }));

beforeEach(() => {
  vi.resetAllMocks();
  window.history.replaceState({}, '', '/mentor/assessments');
  mocks.assessments.mockResolvedValue([]);
  mocks.batches.mockResolvedValue([]);
  mocks.orgBatches.mockResolvedValue([]);
  mocks.assignedCourses.mockResolvedValue({ data: { courses: [{ courseId: 17, courseName: 'Java' }] } });
  mocks.allCourses.mockResolvedValue([{ courseId: 99, courseName: 'Other course' }]);
});
afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

it('loads only the signed-in mentor courses for assessment creation', async () => {
  const { result } = renderHook(() => useAssessments());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.courses).toEqual([{ courseId: 17, courseName: 'Java' }]);
  expect(mocks.assignedCourses).toHaveBeenCalledOnce();
  expect(mocks.allCourses).not.toHaveBeenCalled();
});

it('keeps the mentor list empty when no courses are assigned', async () => {
  mocks.assignedCourses.mockResolvedValue({ courses: [] });
  const { result } = renderHook(() => useAssessments());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.courses).toEqual([]);
  expect(mocks.allCourses).not.toHaveBeenCalled();
});

it('does not load the global catalog when the assigned courses request fails', async () => {
  mocks.assignedCourses.mockRejectedValue(new Error('Unable to load assigned courses'));
  const { result } = renderHook(() => useAssessments());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.courses).toEqual([]);
  expect(result.current.error).toBeTruthy();
  expect(mocks.allCourses).not.toHaveBeenCalled();
});

it('preserves the organization course source', async () => {
  window.history.replaceState({}, '', '/organization/assessments');
  const { result } = renderHook(() => useAssessments());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.courses).toEqual([{ courseId: 99, courseName: 'Other course' }]);
  expect(mocks.assignedCourses).not.toHaveBeenCalled();
});
