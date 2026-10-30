import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import StudentForm from "../../src/pages/students/StudentForm";
import { studentsApi } from "../../src/api/students";
import { batchService } from "../../src/shared/services/batchService";
import { courseService } from "../../src/shared/services/courseService";
vi.mock("../../src/api/students", () => ({ studentsApi: { list: vi.fn(), getById: vi.fn(), getEnrollments: vi.fn(), enrollInBatch: vi.fn() } }));
vi.mock("../../src/shared/services/batchService", () => ({ batchService: { getOrganizationBatches: vi.fn(), getStudents: vi.fn() } }));
vi.mock("../../src/shared/services/courseService", () => ({ courseService: { getCourses: vi.fn() } }));
const profile = { id: 7, studentId: 7, firstName: "Lahari", lastName: "Gandikota", email: "lahari@example.test", phone: "9951886175", courseId: 2, batchId: 20 };
const courses = [{ courseId: 2, courseName: " reACT " }, { courseId: 3, courseName: "Python" }];
let enrollments, onSave, onClose, onEnrolled;
beforeEach(() => {
  vi.clearAllMocks(); enrollments = [{ courseId: 2, batchId: 20, courseName: "React", batchName: "React Morning" }];
  studentsApi.list.mockResolvedValue({ data: [profile] });
  studentsApi.getById.mockResolvedValue({ data: profile });
  studentsApi.getEnrollments.mockImplementation(async () => ({ data: [...enrollments] }));
  studentsApi.enrollInBatch.mockImplementation(async () => { enrollments.push({ courseId: 3, batchId: 30 }); return { data: {} }; });
  courseService.getCourses.mockResolvedValue({ data: courses });
  batchService.getOrganizationBatches.mockResolvedValue({ data: [{ batchId: 20, batchName: "React Morning", courseId: 2, courseName: "React", capacity: 25 }, { batchId: 30, batchName: "Python Evening", courseId: 3, courseName: "Python", capacity: 25 }] });
  batchService.getStudents.mockResolvedValue({ students: [], capacity: 25 });
  onSave = vi.fn(async () => profile); onClose = vi.fn(); onEnrolled = vi.fn();
});
afterEach(cleanup);
const open = () => render(<StudentForm open student={profile} onSave={onSave} onClose={onClose} onEnrolled={onEnrolled} />);
const loaded = () => screen.findByText('Existing enrollment', { selector: 'span' });

it("loads and locks actual existing assignments, then disables React in a new row by ID", async () => {
  open(); await loaded();
  expect(screen.getByLabelText(/^Course/)).toBeDisabled();
  expect(screen.getByLabelText(/^Batch/)).toHaveValue("20");
  expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Add another course" }));
  const selects = screen.getAllByLabelText(/^Course/);
  expect(within(selects[1]).getByRole("option", { name: /reACT.*Already Enrolled/ })).toBeDisabled();
  fireEvent.change(selects[1], { target: { value: "3" } });
  const batches = screen.getAllByLabelText(/^Batch/);
  expect(within(batches[1]).getByRole("option", { name: /Python Evening/ })).toBeInTheDocument();
  expect(within(batches[1]).queryByRole("option", { name: /React Morning/ })).not.toBeInTheDocument();
  fireEvent.change(batches[1], { target: { value: "30" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(onSave).not.toHaveBeenCalled();
  expect(studentsApi.enrollInBatch).toHaveBeenCalledExactlyOnceWith(7, "30");
  expect(onEnrolled).toHaveBeenCalledOnce();
});

it("prepopulates all enrolled courses instead of only the primary course", async () => {
  enrollments.push({ courseId: 3, batchId: 30 });
  open(); await screen.findByText("All available courses are already assigned.");
  expect(screen.getAllByLabelText(/^Course/).map(select => select.value)).toEqual(["2", "3"]);
  expect(screen.getByRole("button", { name: "Add another course" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: /Remove course/ })).not.toBeInTheDocument();
});

it("preserves primary and additional enrollments when editing only personal details", async () => {
  enrollments.push({ courseId: 3, batchId: 30 });
  open(); await screen.findByText("All available courses are already assigned.");
  fireEvent.change(screen.getByLabelText(/^First Name/), { target: { value: "Changed" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(onSave.mock.calls[0]).toEqual([{ firstName: "Changed", lastName: profile.lastName, email: profile.email, phone: profile.phone, courseId: 2, batchId: 20 }, 7]);
  expect(studentsApi.enrollInBatch).not.toHaveBeenCalled();
  expect(enrollments).toHaveLength(2);
});

it("fails closed when existing enrollments cannot be loaded", async () => {
  studentsApi.getEnrollments.mockRejectedValue(new Error("Offline"));
  open(); await screen.findByText(/Existing enrollments could not be verified/);
  expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  expect(onSave).not.toHaveBeenCalled(); expect(studentsApi.enrollInBatch).not.toHaveBeenCalled();
});

it("retains assignments and entered details after an update API error", async () => {
  onSave.mockRejectedValue(new Error("Update service unavailable"));
  open(); await loaded();
  fireEvent.change(screen.getByLabelText(/^Last Name/), { target: { value: "Changed" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await screen.findByText("Update service unavailable");
  expect(screen.getByLabelText(/^Last Name/)).toHaveValue("Changed");
  expect(screen.getByLabelText(/^Course/)).toHaveValue("2");
  expect(onClose).not.toHaveBeenCalled();
});

it("preserves an existing assignment and permits detail edits when its course is no longer offered", async () => {
  courseService.getCourses.mockResolvedValue({ data: [] });
  batchService.getOrganizationBatches.mockResolvedValue({ data: [] });
  open(); await loaded();
  expect(screen.getByLabelText(/^Course/)).toHaveValue("2");
  expect(screen.getByRole("button", { name: "Add another course" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/^Last Name/), { target: { value: "Changed" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(onSave.mock.calls[0][0]).toMatchObject({ courseId: 2, batchId: 20 });
});

it("disables saving when required personal details are missing", async () => {
  open(); await loaded();
  fireEvent.change(screen.getByLabelText(/^First Name/), { target: { value: "" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled());
  expect(onSave).not.toHaveBeenCalled();
});

it("includes additional memberships reported by batch rosters when the student enrollment response omits them", async () => {
  batchService.getStudents.mockImplementation(async batchId => ({ students: batchId === 30 ? [{ studentId: 7, batchId: 20 }] : [], capacity: 25 }));
  open(); await screen.findByText("All available courses are already assigned.");
  expect(screen.getAllByLabelText(/^Course/).map(select => select.value)).toEqual(["2", "3"]);
  expect(screen.getAllByLabelText(/^Batch/).map(select => select.value)).toEqual(["20", "30"]);
});
