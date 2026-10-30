import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BatchDetail from "../../src/pages/batches/BatchDetail";
import { batchService } from "../../src/shared/services/batchService";
import { studentsApi } from "../../src/api/students";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { attendanceService } from "../../src/shared/services/attendanceService";

vi.mock("../../src/shared/services/batchService", () => ({
  batchService: {
    getOrganizationBatches: vi.fn(),
    getStudents: vi.fn(),
    getAvailableStudents: vi.fn(),
    assignStudents: vi.fn(),
  },
}));
vi.mock("../../src/api/students", () => ({
  studentsApi: { list: vi.fn() },
}));
vi.mock("../../src/shared/services/mentorService", () => ({
  getMentorDashboardBatches: vi.fn(),
}));
vi.mock("../../src/features/live-classes/services/liveClassService", () => ({
  liveClassService: { list: vi.fn() },
}));
vi.mock("../../src/shared/services/attendanceService", () => ({
  attendanceService: { byLiveClass: vi.fn() },
}));
vi.mock("../../src/hooks/useBatches", () => ({
  default: () => ({ saveBatch: vi.fn(), addStudents: vi.fn() }),
}));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const TEST_BATCH = {
  batchId: 3,
  batchName: "Full Stack Evening",
  courseName: "Full Stack Web Development",
  mentorName: "Test Mentor",
  batchType: "Online",
  enrolledStudents: 1,
  capacity: 10,
  startDate: "2026-01-01",
  endDate: "2026-06-01",
  status: "Active",
};
const TEST_STUDENT = {
  studentId: 101,
  firstName: "Alice",
  lastName: "Doe",
  email: "alice@example.com",
  phone: "9999999999",
  status: "Active",
};

const renderBatchDetail = () =>
  render(
    <MemoryRouter initialEntries={["/organization/batches/3/details"]}>
      <Routes>
        <Route path="/organization/batches/:batchId/details" element={<BatchDetail />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  batchService.getOrganizationBatches.mockResolvedValue({ data: [TEST_BATCH] });
  batchService.getStudents.mockResolvedValue({ data: [TEST_STUDENT] });
  studentsApi.list.mockResolvedValue({ data: [] });
  liveClassService.list.mockResolvedValue([]);
  attendanceService.byLiveClass.mockResolvedValue([]);
});

it("loads and displays enrolled students exactly once, without an infinite fetch loop", async () => {
  renderBatchDetail();

  fireEvent.click(await screen.findByRole("button", { name: "Students" }));

  // The real regression: loadBatchStudents called setBatch(...) inside itself
  // while depending on `batch` in its own useCallback deps, which recreated
  // the callback every time it succeeded and re-triggered the effect that
  // calls it — an infinite loop that kept the tab stuck on the loading text.
  await screen.findByText("Alice Doe");
  expect(screen.queryByText(/Loading enrolled students/)).not.toBeInTheDocument();

  // Give any runaway effect loop a real chance to fire additional requests.
  await new Promise((resolve) => setTimeout(resolve, 500));

  expect(batchService.getStudents).toHaveBeenCalledTimes(1);
  expect(batchService.getStudents).toHaveBeenCalledWith("3");
});

it("shows an error state instead of an infinite spinner when the students request fails", async () => {
  batchService.getStudents.mockRejectedValue(new Error("Network unavailable"));
  studentsApi.list.mockRejectedValue(new Error("Network unavailable"));
  renderBatchDetail();

  fireEvent.click(await screen.findByRole("button", { name: "Students" }));

  await screen.findByText("Network unavailable");
  expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  expect(screen.queryByText(/Loading enrolled students/)).not.toBeInTheDocument();
});

it("has no Add Students action but keeps search, status filter and View", async () => {
  renderBatchDetail();
  fireEvent.click(await screen.findByRole("button", { name: "Students", exact: true }));
  await screen.findByText("Alice Doe");
  expect(screen.queryByRole("button", { name: /Add students/i })).not.toBeInTheDocument();
  expect(screen.getByPlaceholderText("Search students...")).toBeInTheDocument();
  expect(screen.getByDisplayValue("All Status")).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText("Search students..."), { target: { value: "zzz" } });
  await waitFor(() => expect(screen.queryByText("Alice Doe")).not.toBeInTheDocument());
});

it("keeps all three batch enrollments when students have another primary batch", async () => {
  const students = [
    { ...TEST_STUDENT, studentId: 101, name: "Alice Doe" },
    { ...TEST_STUDENT, studentId: 102, name: "Bob Smith" },
    { ...TEST_STUDENT, studentId: 103, name: "Carol Jones" },
  ];
  batchService.getStudents.mockResolvedValue({ students, capacity: 10 });
  studentsApi.list.mockResolvedValue({ data: students.map(student => ({ ...student, batchId: 99 })) });
  renderBatchDetail();
  fireEvent.click(await screen.findByRole("button", { name: "Students", exact: true }));
  for (const student of students) expect(await screen.findByText(student.name)).toBeInTheDocument();
  expect(screen.getByText("3 Students")).toBeInTheDocument();
  expect(screen.getByText(/3 of 3 enrolled shown/)).toBeInTheDocument();
  expect(batchService.getStudents).toHaveBeenCalledTimes(1);
});

it("waits for batch metadata before resolving roster membership by batch name", async () => {
  let resolveMetadata;
  batchService.getOrganizationBatches.mockReturnValue(new Promise(resolve => { resolveMetadata = resolve; }));
  batchService.getStudents.mockResolvedValue({ students: [], capacity: 0 });
  studentsApi.list.mockResolvedValue({ data: [{ ...TEST_STUDENT, batchName: TEST_BATCH.batchName }] });
  renderBatchDetail();
  expect(batchService.getStudents).not.toHaveBeenCalled();
  resolveMetadata({ data: [TEST_BATCH] });
  fireEvent.click(await screen.findByRole("button", { name: "Students", exact: true }));
  expect(await screen.findByText("Alice Doe")).toBeInTheDocument();
  expect(screen.getByText("1 Students")).toBeInTheDocument();
  expect(screen.getByText(/9 available/)).toBeInTheDocument();
});
