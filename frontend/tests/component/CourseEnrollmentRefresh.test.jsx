import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useCourses from "../../src/hooks/useCourses";
import { courseService } from "../../src/shared/services/courseService";
import { batchService } from "../../src/shared/services/batchService";
import { studentsApi } from "../../src/api/students";
vi.mock("../../src/shared/services/courseService", () => ({ courseService: { getCourses: vi.fn() } }));
vi.mock("../../src/shared/services/batchService", () => ({ batchService: { getOrganizationBatches: vi.fn(), getStudents: vi.fn() } }));
vi.mock("../../src/api/students", () => ({ studentsApi: { list: vi.fn() } }));
let pythonMembers;
beforeEach(() => {
  localStorage.clear(); pythonMembers = [];
  courseService.getCourses.mockResolvedValue({ data: [{ courseId: 2, courseName: "React" }, { courseId: 3, courseName: "Python" }] });
  batchService.getOrganizationBatches.mockResolvedValue({ data: [{ batchId: 20, courseId: 2, courseName: "React" }, { batchId: 30, courseId: 3, courseName: "Python" }] });
  studentsApi.list.mockResolvedValue({ data: [{ studentId: 7, id: 7, courseId: 2, course: "React", batchId: 20, status: "Active" }] });
  batchService.getStudents.mockImplementation(async batchId => ({ students: batchId === 30 ? pythonMembers : [] }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("refreshes additional course counts after an enrollment update event", async () => {
  const { result } = renderHook(() => useCourses());
  await waitFor(() => expect(result.current.courses).toHaveLength(2));
  expect(result.current.courses.find(course => course.courseId === 3).students).toBe(0);
  pythonMembers = [{ studentId: 7 }];
  act(() => window.dispatchEvent(new CustomEvent('kini:student-updated', { detail: { studentId: 7 } })));
  await waitFor(() => expect(result.current.courses.find(course => course.courseId === 3).students).toBe(1));
  expect(result.current.courses.find(course => course.courseId === 2).students).toBe(1);
});
it("shows an unknown count rather than a partial count if a batch roster is unavailable", async () => {
  batchService.getStudents.mockRejectedValue(new Error('Offline'));
  const { result } = renderHook(() => useCourses());
  await waitFor(() => expect(result.current.courses).toHaveLength(2));
  expect(result.current.courses.every(course => course.students === null)).toBe(true);
});
