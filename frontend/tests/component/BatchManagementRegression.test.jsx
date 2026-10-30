import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { batchService } from "@shared/services/batchService";
import { studentsApi } from "@/api/students";
import { courseService } from "@shared/services/courseService";
import { useAuth } from "@shared/hooks/useAuth";
import BatchManagement from "@features/organization/pages/BatchManagement";
vi.mock("@shared/services/batchService", () => ({ batchService: { getOrganizationBatches: vi.fn(), getById: vi.fn(), getBatch: vi.fn(), update: vi.fn(), getStudents: vi.fn().mockResolvedValue({ students: [] }) } }));
vi.mock("@shared/services/courseService", () => ({ courseService: { getCourses: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@shared/services/mentorService", () => ({ mentorService: { getMentors: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@/api/students", () => ({ studentsApi: { list: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@shared/services/apiServices", async (original) => ({ ...await original(), employeeApi: { list: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@shared/hooks/useAuth", () => ({ useAuth: vi.fn(() => ({ role: "org-admin", user: { role: "org-admin" } })) }));
vi.mock("@features/hr/hooks/useHrPermissions", () => ({ default: () => ({ can: () => false, isHrUser: false }) }));
vi.mock("@shared/hooks/useProfilePhoto", () => ({ useProfilePhotos: () => ({ photos: {} }) }));
beforeEach(() => { useAuth.mockReturnValue({ role: "org-admin", user: { role: "org-admin" } }); localStorage.clear(); localStorage.setItem("isDemo", "true"); });
afterEach(cleanup);
it("keeps refresh and add actions in the shared heading row", async () => {
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  await screen.findByText("Full Stack Morning");
  const actions = screen.getByLabelText("Batch header actions");
  expect(within(actions.parentElement).getByRole("heading", { level: 1, name: "Batch Management" })).toBeInTheDocument();
  fireEvent.click(within(actions).getByRole("button", { name: "Refresh" }));
  expect(await screen.findByText("Full Stack Morning")).toBeInTheDocument();
  fireEvent.click(within(actions).getByRole("button", { name: "Add Batch" }));
  expect(await screen.findByRole("heading", { name: /Add.*Batch/ })).toBeInTheDocument();
});



it("displays actual API batch codes, searches them and keeps missing codes empty", async () => {
  localStorage.removeItem("isDemo");
  const batches = [
    { batchId: 1, batchName: "React Morning", batchCode: "WEB-101", status: "Active" },
    { batchId: 2, batchName: "Python Evening", batch_code: "PY-202", status: "Upcoming" },
    { batchId: 3, batchName: "No Code", status: "Active" },
  ];
  batchService.getOrganizationBatches.mockResolvedValue({ data: batches });
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  await screen.findByText("WEB-101");
  expect(screen.getByRole("columnheader", { name: "Batch Code" })).toBeInTheDocument();
  expect(within(screen.getByRole("link", { name: "No Code" }).closest("tr")).getAllByRole("cell")[2]).toHaveTextContent("—");
  const input = screen.getByPlaceholderText("Search batches, course name or mentor...");
  fireEvent.change(input, { target: { value: "web-" } });
  expect(screen.getByText("WEB-101")).toBeInTheDocument();
  expect(screen.queryByText("PY-202")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Refresh", exact: true }));
  await screen.findByText("WEB-101");
  const table = screen.getByRole("table");
  expect(table.querySelectorAll("col").length).toBe(within(table).getAllByRole("columnheader").length);
});

it("restores organization-admin row actions and opens the selected batch for editing", async () => {
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  const edit = await screen.findByRole("button", { name: "Edit Full Stack Morning" });
  expect(screen.getByRole("link", { name: "View Full Stack Morning" })).toHaveAttribute("href", "/organization/batches/301/details");
  fireEvent.click(edit);
  expect(await screen.findByDisplayValue("Full Stack Morning")).toBeInTheDocument();
});
it("does not grant edit or delete actions to an employee without batch permission", async () => {
  useAuth.mockReturnValue({ role: "employee", user: { role: "employee" } });
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  await screen.findByText("Full Stack Morning");
  expect(screen.queryByRole("button", { name: "Edit Full Stack Morning" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Delete Full Stack Morning" })).not.toBeInTheDocument();
});

it("scopes batch course choices to the authenticated organization and rejects an unavailable course", async () => {
  localStorage.removeItem("isDemo");
  useAuth.mockReturnValue({ role: "employee", user: { role: "employee", organizationId: 12 } });
  courseService.getCourses.mockResolvedValue({ data: [
    { courseId: 4, courseName: "Foreign course", organizationId: 99 },
    { courseId: 8, courseName: "Organization course", organizationId: 12 },
  ] });
  const batch = { batchId: 5, batchName: "Cyber Security 1", courseId: 4, mentorId: 2, mentorName: "Mentor", startDate: "2026-10-01", endDate: "2026-12-01", capacity: 25, status: "Active" };
  batchService.getOrganizationBatches.mockResolvedValue({ data: [batch] });
  batchService.getById.mockResolvedValue({ ...batch, courseId: 4 });
  render(<MemoryRouter><BatchManagement createOnly initialBatch={batch} /></MemoryRouter>);
  await screen.findByDisplayValue("Cyber Security 1");
  const courseInput = screen.getByText('1. Select Course').parentElement.querySelector('button');
  await waitFor(() => expect(courseInput).not.toBeDisabled());
  fireEvent.click(courseInput);
  await screen.findByRole("option", { name: "Organization course (#8)" });
  expect(courseService.getCourses).toHaveBeenLastCalledWith(expect.objectContaining({ organizationId: 12 }));
  expect(screen.queryByRole("option", { name: "Foreign course (#4)" })).not.toBeInTheDocument();
  fireEvent.submit(document.getElementById("batch-management-form"));
  expect(await screen.findByText(/Select a course from your organization's available courses/)).toBeInTheDocument();
  expect(batchService.update).not.toHaveBeenCalled();
  await screen.findByRole('button', { name: /Mentor \(#2\)/ });
  fireEvent.click(screen.getByRole("option", { name: "Organization course (#8)" }));
  fireEvent.submit(document.getElementById("batch-management-form"));
  await waitFor(() => expect(batchService.update).toHaveBeenCalledWith(5, expect.objectContaining({ courseId: 8, mentorId: 2 })));
});

it("counts students from each batch roster, marks failed rosters and refreshes after enrolment changes", async () => {
  localStorage.removeItem("isDemo");
  batchService.getOrganizationBatches.mockResolvedValue({ data: [
    { batchId: 1, batchName: "Roster Batch", status: "Active", enrolledStudents: 0 },
    { batchId: 2, batchName: "Forbidden Batch", status: "Active", enrolledStudents: 7 },
    { batchId: 3, batchName: "Empty Batch", status: "Active" },
  ] });
  const rosters = {
    1: { students: [{ studentId: 11 }, { studentId: 12 }, { studentId: 12 }] },
    3: { students: [] },
  };
  batchService.getStudents.mockClear();
  batchService.getStudents.mockImplementation(async (batchId) => {
    if (String(batchId) === "2") throw Object.assign(new Error("Forbidden"), { response: { status: 403 } });
    return rosters[batchId];
  });
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  const studentsCell = (name) => {
    const index = screen.getAllByRole("columnheader").findIndex((header) => header.textContent.trim() === "Students");
    return within(screen.getByRole("link", { name }).closest("tr")).getAllByRole("cell")[index];
  };
  await screen.findByRole("link", { name: "Roster Batch" });
  await waitFor(() => expect(studentsCell("Roster Batch")).toHaveTextContent("2"));
  expect(within(studentsCell("Forbidden Batch")).getByLabelText("Student count unavailable")).toHaveTextContent("—");
  expect(studentsCell("Empty Batch")).toHaveTextContent("0");
  expect(batchService.getStudents.mock.calls.map(([id]) => String(id)).sort()).toEqual(["1", "2", "3"]);

  rosters[3] = { students: [{ studentId: 31 }] };
  window.dispatchEvent(new CustomEvent("kini:student-updated", { detail: { studentId: 31 } }));
  await waitFor(() => expect(studentsCell("Empty Batch")).toHaveTextContent("1"));
});

it("shows ten students when seven enrollments and three primary assignments belong to the same batch", async () => {
  localStorage.removeItem("isDemo");
  batchService.getOrganizationBatches.mockResolvedValue({ data: [{ batchId: 4, batchName: "Java Full Stack 11", status: "Active" }] });
  batchService.getStudents.mockResolvedValue({ students: Array.from({ length: 7 }, (_, index) => ({ studentId: index + 1 })) });
  studentsApi.list.mockResolvedValue({ data: [
    { studentId: 1, batchId: 4 },
    ...[8, 9, 10].map(studentId => ({ studentId, batchId: 4 })),
    { studentId: 11, batchId: 7 },
  ] });
  render(<MemoryRouter><BatchManagement /></MemoryRouter>);
  const row = (await screen.findByRole("link", { name: "Java Full Stack 11" })).closest("tr");
  const index = screen.getAllByRole("columnheader").findIndex(header => header.textContent.trim() === "Students");
  await waitFor(() => expect(within(row).getAllByRole("cell")[index]).toHaveTextContent("10"));
});
