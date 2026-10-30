import { beforeEach, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const enrollmentsState = { current: null };
const getBatch = vi.fn();

vi.mock("../../src/features/student/hooks/useStudentEnrollments", () => ({
  useStudentEnrollments: () => enrollmentsState.current,
}));
vi.mock("../../src/shared/services/batchService", () => ({
  batchService: { getById: (...args) => getBatch(...args) },
}));

const { useAssignedMentor } = await import("../../src/features/student/hooks/useAssignedMentor");

const ready = (enrollments) => ({ status: "ready", enrollments, error: null, loading: false, reload: vi.fn() });

beforeEach(() => {
  getBatch.mockReset();
});

it("lists each mentor of the student's batches once, with every course and batch they cover", async () => {
  enrollmentsState.current = ready([
    { courseId: "2", courseName: "Java Full Stack", batchId: "7", batchName: "Java Full Stack 2", mentorId: "4", mentorName: "ravi teja" },
    { courseId: "7", courseName: "Python", batchId: "8", batchName: "Python 1", mentorId: "4", mentorName: "ravi teja" },
    { courseId: "1", courseName: "React.JS", batchId: "9", batchName: "React 1", mentorId: "6", mentorName: "Anu" },
  ]);
  const { result } = renderHook(() => useAssignedMentor());
  expect(result.current.status).toBe("ready");
  expect(result.current.mentors.map((mentor) => mentor.mentorId)).toEqual(["4", "6"]);
  expect(result.current.mentors[0].name).toBe("Ravi Teja");
  expect(result.current.mentors[0].assignments).toEqual(["Java Full Stack · Java Full Stack 2", "Python · Python 1"]);
  expect(result.current.mentor.mentorId).toBe("4");
  expect(getBatch).not.toHaveBeenCalled();
});

it("reads the batch record when the enrollment row has no mentor", async () => {
  enrollmentsState.current = ready([{ courseId: "1", courseName: "React.JS", batchId: "9", batchName: "React 1" }]);
  getBatch.mockResolvedValue({ data: { batchId: 9, mentorId: 12, mentorName: "Sita Rao" } });
  const { result } = renderHook(() => useAssignedMentor());
  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(getBatch).toHaveBeenCalledWith("9");
  expect(result.current.mentors).toMatchObject([{ mentorId: "12", name: "Sita Rao", course: "React.JS", batch: "React 1" }]);
});

it("reports no mentor, not an error, when the batch has none and the batch route is refused", async () => {
  enrollmentsState.current = ready([{ courseId: "1", courseName: "React.JS", batchId: "9", batchName: "React 1" }]);
  getBatch.mockRejectedValue({ response: { status: 403 } });
  const { result } = renderHook(() => useAssignedMentor());
  await waitFor(() => expect(result.current.status).toBe("no-mentor"));
  expect(result.current.mentors).toEqual([]);
  expect(result.current.mentor).toBeNull();
});

it("tells an unenrolled student apart from a failed request", () => {
  enrollmentsState.current = { status: "empty", enrollments: [], error: null, loading: false, reload: vi.fn() };
  expect(renderHook(() => useAssignedMentor()).result.current.status).toBe("no-enrollment");

  const failure = { response: { status: 500 } };
  enrollmentsState.current = { status: "error", enrollments: [], error: failure, loading: false, reload: vi.fn() };
  const { result } = renderHook(() => useAssignedMentor());
  expect(result.current.status).toBe("error");
  expect(result.current.error).toBe(failure);
});
