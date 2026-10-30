import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StudentsPage from "../../src/pages/students/StudentsPage";
import StudentProfile from "../../src/features/organization/pages/StudentProfile";
import { studentsApi } from "../../src/api/students";
import { assessmentService } from "../../src/services/assessmentService";

vi.mock("../../src/api/students", () => ({
  studentsApi: {
    list: vi.fn(),
    getById: vi.fn(),
    getAttendance: vi.fn(),
    getProgress: vi.fn(),
    getPayments: vi.fn(),
    getActivity: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    getErrorMessage: (error) => error?.message || "error",
  },
}));
vi.mock("../../src/services/assessmentService", () => ({ assessmentService: { getStudentPerformance: vi.fn() } }));
vi.mock("../../src/shared/services/invoiceService", () => ({ invoiceService: { list: vi.fn().mockResolvedValue([]) }, default: { list: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("../../src/shared/services/apiServices", async (importOriginal) => ({
  ...(await importOriginal()),
  paymentApi: { paymentHistory: vi.fn().mockResolvedValue({ data: [] }) },
}));
// The list table and form are covered elsewhere; here they only expose the
// callbacks StudentsPage wires to them.
vi.mock("../../src/pages/students/StudentList", () => ({
  default: ({ students, onView }) => <div>{students.map((student) => <button key={student.id} type="button" onClick={() => onView(student)}>{student.name}</button>)}</div>,
}));
vi.mock("../../src/pages/students/StudentForm", () => ({
  default: ({ open, student }) => (open ? <div data-testid="student-form">Editing {student?.name}</div> : null),
}));

// Ids deliberately differ from list positions.
const STUDENTS = {
  4: { id: 4, studentId: 4, firstName: "hari", lastName: "krishna", name: "hari krishna", email: "harikrishna@example.com", status: "Active", courseName: "nodejs", batchName: "nodejs 1", trainerName: "nani narendra" },
  9: { id: 9, studentId: 9, firstName: "sri", lastName: "hari", name: "sri hari", email: "srihari@example.com", status: "Active", courseName: "react", batchName: "react 2", trainerName: "anil" },
};

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}
const navigation = {};
function NavigationHandle() {
  navigation.navigate = useNavigate();
  return null;
}

const renderApp = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <NavigationHandle />
    <LocationProbe />
    <Routes>
      <Route path="/organization/students" element={<StudentsPage />} />
      <Route path="/organization/students/:studentId" element={<StudentProfile />} />
      <Route path="/organization/students/:studentId/edit" element={<StudentsPage />} />
      <Route path="/organization/students/:studentId/assign" element={<StudentsPage />} />
    </Routes>
  </MemoryRouter>,
);
const location = () => screen.getByTestId("location").textContent;
const currentTab = () => screen.getAllByRole("button").find((button) => button.getAttribute("aria-current") === "page")?.textContent;

beforeEach(() => {
  localStorage.clear();
  studentsApi.list.mockResolvedValue({ data: [STUDENTS[9], STUDENTS[4]] });
  studentsApi.getById.mockImplementation(async (id) => ({ data: STUDENTS[id] }));
  studentsApi.getAttendance.mockImplementation(async (id) => ({ data: [{ attendanceId: Number(id) * 100, attendanceDate: "2026-10-05", className: `class of ${id}`, status: "Absent" }] }));
  studentsApi.getProgress.mockResolvedValue({ data: null });
  studentsApi.getPayments.mockResolvedValue({ data: [] });
  assessmentService.getStudentPerformance.mockImplementation(async (id) => ({ studentId: id, averageScore: null, assessments: [] }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Students list → canonical Student Details page", () => {
  it("clicking a student opens /organization/students/{real id}, not the old in-page profile", async () => {
    renderApp("/organization/students");
    fireEvent.click(await screen.findByRole("button", { name: "hari krishna" }));

    expect(location()).toBe("/organization/students/4");
    expect(await screen.findByRole("button", { name: /Back to students/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "hari krishna" })).toBeTruthy();
    await waitFor(() => expect(studentsApi.getById).toHaveBeenCalledWith("4"));
    expect(currentTab()).toMatch(/Overview/);
    expect(screen.getAllByText(/^(Overview|Academic|Payments|Attendance|Progress|Materials|Assessment Results)$/).length).toBeGreaterThanOrEqual(7);
  });

  it("every tab and KPI uses the route's student id, and switching students leaves nothing stale", async () => {
    renderApp("/organization/students/4");
    expect(await screen.findByRole("heading", { name: "hari krishna" })).toBeTruthy();
    expect(screen.getAllByText("nodejs").length).toBeGreaterThan(0);
    expect(screen.getByText("harikrishna@example.com")).toBeTruthy();
    await waitFor(() => expect(studentsApi.getAttendance).toHaveBeenCalledWith("4"));

    fireEvent.click(screen.getByRole("button", { name: /^Attendance$/ }));
    expect(location()).toBe("/organization/students/4?tab=Attendance");
    expect(await screen.findByText("class of 4")).toBeTruthy();

    // A different student, straight onto the Attendance tab.
    act(() => navigation.navigate("/organization/students/9?tab=Attendance"));
    expect(await screen.findByRole("heading", { name: "sri hari" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "hari krishna" })).toBeNull();
    expect(screen.queryByText("class of 4")).toBeNull();
    expect(await screen.findByText("class of 9")).toBeTruthy();
    expect(studentsApi.getById).toHaveBeenLastCalledWith("9");
    expect(studentsApi.getAttendance).toHaveBeenLastCalledWith("9");
    expect(currentTab()).toMatch(/Attendance/);

    fireEvent.click(screen.getByRole("button", { name: /^Overview$/ }));
    expect(screen.getByText("srihari@example.com")).toBeTruthy();
    expect(screen.getAllByText("react").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^Assessment Results$/ }));
    expect(location()).toBe("/organization/students/9?tab=AssessmentResults");
    await waitFor(() => expect(assessmentService.getStudentPerformance).toHaveBeenCalled());
    expect(assessmentService.getStudentPerformance.mock.calls.every(([id]) => String(id) === "9")).toBe(true);
  });

  it("a refreshed deep link keeps the student and tab, including ?tab=AssessmentResults and the older spaced form", async () => {
    renderApp("/organization/students/9?tab=AssessmentResults");
    expect(await screen.findByRole("heading", { name: "sri hari" })).toBeTruthy();
    expect(currentTab()).toMatch(/Assessment Results/);
    cleanup();

    renderApp("/organization/students/4?tab=Assessment%20Results");
    expect(await screen.findByRole("heading", { name: "hari krishna" })).toBeTruthy();
    expect(currentTab()).toMatch(/Assessment Results/);
  });

  it("never renders undefined%, NaN% or null% when progress/score/attendance are missing", async () => {
    studentsApi.getAttendance.mockResolvedValue({ data: [] });
    studentsApi.getProgress.mockResolvedValue({ data: { percentage: undefined } });
    renderApp("/organization/students/4?tab=Progress");
    expect(await screen.findByRole("heading", { name: "hari krishna" })).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("…")).toBeNull());
    expect(document.body.textContent).not.toMatch(/(undefined|NaN|null)%/);
    expect(screen.getByText("Course Progress").closest("button, div").textContent).toContain("—");
  });

  it("Back to students returns to the list", async () => {
    renderApp("/organization/students/4");
    fireEvent.click(await screen.findByRole("button", { name: /Back to students/ }));
    expect(location()).toBe("/organization/students");
  });
});

describe("Edit and legacy student routes", () => {
  it("the profile's Edit deep link (?edit=<id>) opens the edit form for that student", async () => {
    renderApp("/organization/students?edit=4");
    expect((await screen.findByTestId("student-form")).textContent).toBe("Editing hari krishna");
  });

  it("/students/{id}/edit opens the edit form and /students/{id}/assign goes to the canonical profile", async () => {
    renderApp("/organization/students/9/edit");
    expect((await screen.findByTestId("student-form")).textContent).toBe("Editing sri hari");
    cleanup();

    renderApp("/organization/students/4/assign");
    await waitFor(() => expect(location()).toBe("/organization/students/4"));
    expect(await screen.findByRole("heading", { name: "hari krishna" })).toBeTruthy();
  });
});
