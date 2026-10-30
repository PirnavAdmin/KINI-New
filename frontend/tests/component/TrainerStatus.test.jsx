import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useTrainers from "@/hooks/useTrainers";
import { employeeService } from "@shared/services/employeeService";
import { mentorService } from "@shared/services/mentorService";
import { tutorService } from "@shared/services/tutorService";
vi.mock("@shared/services/employeeService", () => ({ employeeService: { getEmployees: vi.fn(), getEmployeeBatches: vi.fn().mockResolvedValue([]), getEmployee: vi.fn(), updateEmployee: vi.fn() } }));
vi.mock("@shared/services/mentorService", () => ({ mentorService: { updateMentorStatus: vi.fn(), getMentor: vi.fn() } }));
vi.mock("@shared/services/tutorService", () => ({ tutorService: { list: vi.fn().mockResolvedValue([]), courses: vi.fn().mockResolvedValue([]) } }));
vi.mock("@shared/services/batchService", () => ({ batchService: { getOrganizationBatches: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@/api/students", () => ({ studentsApi: { list: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@features/live-classes/services/liveClassService", () => ({ liveClassService: { today: vi.fn().mockResolvedValue([]) } }));
const employee = { employeeId: 9, mentorId: 27, firstName: "Test", lastName: "Mentor", email: "mentor@example.com", phone: "9876543210", role: "Mentor", status: "Active", employeeType: "Full-time" };
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear();
  employeeService.getEmployees.mockResolvedValue({ data: [employee] });
  employeeService.getEmployee.mockResolvedValue({ data: employee });
  employeeService.updateEmployee.mockResolvedValue({ success: true });
});
afterEach(cleanup);
it('retains employee status when an older catalogue entry still says active', async () => {
  employeeService.getEmployees.mockResolvedValue({ data: [{ ...employee, status: 'Inactive' }] });
  tutorService.list.mockResolvedValueOnce([{ ...employee, status: true }]);
  const { result } = renderHook(() => useTrainers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.trainers[0].status).toBe('Inactive');
  await act(async () => expect(await result.current.changeTrainerStatus(result.current.trainers[0], 'Active')).toEqual({ ok: true, status: 'Active' }));
  expect(employeeService.updateEmployee).toHaveBeenCalledWith(9, { ...employee, status: 'Active' });
});
it("updates employee-backed mentors using the employee ID and preserves the profile", async () => {
  const { result } = renderHook(() => useTrainers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => expect(await result.current.changeTrainerStatus(result.current.trainers[0])).toEqual({ ok: true, status: "Inactive" }));
  expect(employeeService.getEmployee).toHaveBeenCalledWith(9);
  expect(employeeService.updateEmployee).toHaveBeenCalledWith(9, { ...employee, status: "Inactive" });
  expect(mentorService.updateMentorStatus).not.toHaveBeenCalled();
  expect(result.current.trainers[0].status).toBe("Inactive");
  expect(result.current.stats.active).toBe(0);
});
it("keeps status unchanged on failure and exposes backend validation details", async () => {
  employeeService.updateEmployee.mockRejectedValueOnce({ response: { status: 400, data: { errors: { Phone: ["Phone is required."] } } } });
  const { result } = renderHook(() => useTrainers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => expect(await result.current.changeTrainerStatus(result.current.trainers[0])).toEqual({ ok: false, reason: "Phone: Phone is required." }));
  expect(result.current.trainers[0].status).toBe("Active");
});
it("uses the mentor resource for catalogue-only records", async () => {
  employeeService.getEmployees.mockRejectedValueOnce(new Error("Employee list unavailable"));
  tutorService.list.mockResolvedValueOnce([{ mentorId: 27, firstName: "Test", lastName: "Mentor", status: true }]);
  mentorService.updateMentorStatus.mockResolvedValueOnce({ success: true });
  const { result } = renderHook(() => useTrainers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.changeTrainerStatus(result.current.trainers[0]));
  expect(mentorService.updateMentorStatus).toHaveBeenCalledWith(27, false);
  expect(employeeService.updateEmployee).not.toHaveBeenCalled();
});
it("keeps employee and mentor IDs apart: a batch's mentorId never renames another employee", async () => {
  // Employee 3 is Mahesh (mentor profile 2); employee 4 is Suresh (mentor profile 3).
  const mahesh = { employeeId: 3, firstName: "Mahesh", lastName: "S", email: "mahesh@example.com", phone: "9876543211", role: "Mentor", status: "Active" };
  const suresh = { employeeId: 4, firstName: "Suresh", lastName: "Gandikota", email: "suresh@example.com", phone: "9876543212", role: "Mentor", status: "Active" };
  employeeService.getEmployees.mockResolvedValue({ data: [mahesh, suresh] });
  tutorService.list.mockResolvedValueOnce([{ mentorId: 2, mentorName: "Mahesh S" }, { mentorId: 3, mentorName: "Suresh Gandikota" }]);
  mentorService.getMentor.mockImplementation(async (id) => ({ data: id === 2 ? { email: mahesh.email } : { email: suresh.email } }));
  const { batchService } = await import("@shared/services/batchService");
  batchService.getOrganizationBatches.mockResolvedValueOnce({ data: [{ batchId: 3, batchName: "RPA 1", mentorId: 3, mentorName: "Suresh Gandikota" }] });
  const { result } = renderHook(() => useTrainers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  const rows = result.current.trainers.map((trainer) => [trainer.employeeRecordId, trainer.name, trainer.mentorProfileId]);
  expect(rows).toEqual([[3, "Mahesh S", 2], [4, "Suresh Gandikota", 3]]);
});
