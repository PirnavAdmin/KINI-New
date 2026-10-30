import { beforeEach, expect, it, vi } from "vitest";
import { studentsApi } from "../../src/api/students";
import apiClient from "../../src/shared/services/apiClient";
vi.mock("../../src/shared/services/apiClient", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
it.each([
  { studentId: 7, courses: [{ courseId: 2, batchId: 20 }] },
  { success: true, data: { studentId: 7, courses: [{ courseId: 2, batchId: 20 }] } },
  { data: [{ courseId: 2, batchId: 20 }] },
  [{ courseId: 2, batchId: 20 }],
  { enrollments: [{ courseId: 2, batchId: 20 }] },
])("reads enrollment list shapes without dropping real assignments: %j", async body => {
  apiClient.get.mockResolvedValue({ data: body });
  expect((await studentsApi.getEnrollments(7)).data).toEqual([{ courseId: 2, batchId: 20 }]);
  expect(apiClient.get).toHaveBeenCalledWith('/api/StudentBatch/student/7/enrollments', { skipAuthRedirect: true });
});
it.each([{ success: false, message: 'Denied' }, {}, { studentId: 8, courses: [] }])("rejects unverifiable responses instead of inventing an empty roster: %j", async body => {
  apiClient.get.mockResolvedValue({ data: body });
  await expect(studentsApi.getEnrollments(7)).rejects.toThrow();
});
it("uses the live enrollment request DTO without replacing any other assignment", async () => {
  apiClient.post.mockResolvedValue({ data: { success: true } });
  await studentsApi.enrollInBatch('7', '30');
  expect(apiClient.post).toHaveBeenCalledWith('/api/StudentBatch', { batchId: 30, studentIds: [7] });
});
it("propagates a logical backend rejection returned with HTTP 200", async () => {
  apiClient.post.mockResolvedValue({ status: 200, data: { success: false, message: 'Course already enrolled' } });
  await expect(studentsApi.enrollInBatch(7, 30)).rejects.toThrow('Course already enrolled');
});
