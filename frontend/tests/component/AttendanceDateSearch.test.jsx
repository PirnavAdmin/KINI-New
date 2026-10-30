import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AttendanceApiReady from "@features/organization/pages/AttendanceApiReady";
import { employeeService } from "@shared/services/employeeService";

vi.mock("@shared/services/employeeService", () => ({ employeeService: {
  getEmployees: vi.fn(),
  getAttendance: vi.fn(),
} }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("organization_id", "7");
  employeeService.getEmployees.mockResolvedValue({ data: [
    { employeeId: 17, employeeCode: "EMP-17", name: "Asha Rao", email: "asha@example.test" },
  ] });
  employeeService.getAttendance.mockResolvedValue({ data: [
    { attendanceId: 1, AttendanceDate: "2026-10-16T00:00:00Z", checkIn: "09:00", status: "Present" },
  ] });
});
afterEach(() => { cleanup(); localStorage.clear(); });

it("finds attendance by ISO date and the displayed month-name date", async () => {
  render(<AttendanceApiReady />);
  await screen.findByText("Asha Rao");
  const search = screen.getByPlaceholderText("Search employee, ID, date or status...");

  fireEvent.change(search, { target: { value: "2026-10-16" } });
  await waitFor(() => expect(screen.getByText("Asha Rao")).toBeInTheDocument());
  fireEvent.change(search, { target: { value: "16 Oct 2026" } });
  await waitFor(() => expect(screen.getByText("Asha Rao")).toBeInTheDocument());
});
