import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StudentForm from "../../src/pages/students/StudentForm";
import { batchService } from "../../src/shared/services/batchService";
import { studentsApi } from "../../src/api/students";
import { courseService } from "../../src/shared/services/courseService";

vi.mock("../../src/api/students", () => ({ studentsApi: { list: vi.fn(), getById: vi.fn(), getEnrollments: vi.fn() } }));
vi.mock("../../src/shared/services/batchService", () => ({
  batchService: { getOrganizationBatches: vi.fn(), getStudents: vi.fn() },
}));
vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getCourses: vi.fn() },
}));

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  studentsApi.list.mockResolvedValue({ data: [] });
  studentsApi.getById.mockResolvedValue({ data: { studentId: 9, courseId: 1, batchId: 7 } });
  studentsApi.getEnrollments.mockResolvedValue({ data: [] });
  courseService.getCourses.mockResolvedValue([{ courseId: 1, courseName: ".Net" }]);
  batchService.getOrganizationBatches.mockResolvedValue([
    { batchId: 7, batchName: ".Net 1", courseId: 1, capacity: 25, enrolledStudents: 0 },
  ]);
});

async function openBatchOptions() {
  render(<StudentForm open onClose={vi.fn()} onSave={vi.fn()} />);
  await screen.findByRole("option", { name: ".Net" });
  fireEvent.change(screen.getByLabelText(/Course/), { target: { value: "1" } });
}

it("uses the roster count instead of a stale zero in the batch aggregate", async () => {
  batchService.getStudents.mockResolvedValue({ capacity: 25, students: [{ studentId: 9 }] });
  await openBatchOptions();
  const option = screen.getByRole("option", { name: ".Net 1 — 1/25 students — 24 seats available" });
  expect(option.disabled).toBe(false);
  expect(batchService.getStudents).toHaveBeenCalledWith(7);
});

it("disables a full batch using the actual roster", async () => {
  batchService.getStudents.mockResolvedValue({ capacity: 25, students: Array.from({ length: 25 }, (_, studentId) => ({ studentId })) });
  await openBatchOptions();
  expect(screen.getByRole("option", { name: ".Net 1 — 25/25 students — Full" }).disabled).toBe(true);
});

it("does not advertise empty seats when the roster request fails", async () => {
  batchService.getStudents.mockRejectedValue(new Error("Unavailable"));
  await openBatchOptions();
  expect(screen.getByRole("option", { name: ".Net 1 — Seats unavailable" }).disabled).toBe(true);
});

it("combines primary assignments and additional memberships without counting a student twice", async () => {
  studentsApi.list.mockResolvedValue({ data: [{ studentId: 9, batchId: 7, status: "Active" }, { studentId: 10, batchId: 7, status: "Active" }] });
  batchService.getStudents.mockResolvedValue({ capacity: 25, students: [{ studentId: 9 }, { studentId: 11, batchId: 99 }] });
  await openBatchOptions();
  expect(screen.getByRole("option", { name: /3\/25 students/ })).toBeEnabled();
});

it("respects configured capacities above 25 rather than capping them", async () => {
  batchService.getOrganizationBatches.mockResolvedValue([{ batchId: 7, batchName: ".Net 1", courseId: 1, capacity: 40 }]);
  batchService.getStudents.mockResolvedValue({ capacity: 25, students: Array.from({ length: 30 }, (_, studentId) => ({ studentId })) });
  await openBatchOptions();
  expect(screen.getByRole("option", { name: /30\/40 students.*10 seats available/ })).toBeEnabled();
});

it("does not advertise seats when primary assignments could not be loaded", async () => {
  studentsApi.list.mockRejectedValue(new Error("Unavailable"));
  batchService.getStudents.mockResolvedValue({ capacity: 25, students: [] });
  await openBatchOptions();
  expect(screen.getByRole("option", { name: /Seats unavailable/ })).toBeDisabled();
});

it("permits editing an existing member of a full batch", async () => {
  batchService.getOrganizationBatches.mockResolvedValue([{ batchId: 7, batchName: ".Net 1", courseId: 1, capacity: 1 }]);
  studentsApi.list.mockResolvedValue({ data: [{ studentId: 9, batchId: 7, status: "Active" }] });
  batchService.getStudents.mockResolvedValue({ capacity: 1, students: [{ studentId: 9 }] });
  render(<StudentForm open student={{ id: 9, courseId: 1, batchId: 7 }} onClose={vi.fn()} onSave={vi.fn()} />);
  expect(await screen.findByRole("option", { name: /\.Net 1.*Existing enrollment/ })).toHaveValue("7");
  expect(screen.getByLabelText(/^Batch/)).toBeDisabled();
});
