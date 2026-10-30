import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";
import BatchDetail from "../../src/pages/batches/BatchDetail";
import { batchService } from "../../src/shared/services/batchService";
import { studentsApi } from "../../src/api/students";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { attendanceService } from "../../src/shared/services/attendanceService";
import assessmentService from "../../src/services/assessmentService";

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
vi.mock("../../src/services/assessmentService", () => ({
  default: { getAssessments: vi.fn() },
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
  enrolledStudents: 32,
  capacity: 40,
  startDate: "2026-01-01",
  endDate: "2026-06-01",
  status: "Active",
};

const AssessmentsStub = () => {
  const [params] = useSearchParams();
  return <div data-testid="assessments-stub">batch={params.get("batch")};view={params.get("view")}</div>;
};

const renderBatchDetail = () =>
  render(
    <MemoryRouter initialEntries={["/organization/batches/3/details"]}>
      <Routes>
        <Route path="/organization/batches/:batchId/details" element={<BatchDetail />} />
        <Route path="/organization/assessments" element={<AssessmentsStub />} />
      </Routes>
    </MemoryRouter>,
  );

const openAssessmentsTab = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "Assessments" }));
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  batchService.getOrganizationBatches.mockResolvedValue({ data: [TEST_BATCH] });
  batchService.getStudents.mockResolvedValue({ data: [] });
  studentsApi.list.mockResolvedValue({ data: [] });
  liveClassService.list.mockResolvedValue([]);
  attendanceService.byLiveClass.mockResolvedValue([]);
});

it("shows only this batch's real assessments (Title/Type/Date/Total Marks/Status), filtering out a decoy from another batch, with honest '—' for fields the backend didn't send", async () => {
  assessmentService.getAssessments.mockResolvedValue([
    {
      assessmentId: 501, id: 501, title: "React Fundamentals Quiz", batchId: 3,
      assessmentType: "MCQ", totalMarks: 50, status: "Published",
      startDate: "2026-08-12T10:00:00Z", endDate: "2026-08-12T11:00:00Z",
    },
    {
      // No type/marks/date at all — must render "—", never fabricated.
      assessmentId: 502, id: 502, title: "Mid-course Assessment", batchId: 3, status: "Draft",
    },
    { assessmentId: 999, id: 999, title: "Other Batch's Quiz", batchId: 99, status: "Published" },
  ]);

  renderBatchDetail();
  await openAssessmentsTab();

  await screen.findByText("React Fundamentals Quiz");
  expect(screen.getByText("Mid-course Assessment")).toBeInTheDocument();
  expect(screen.queryByText("Other Batch's Quiz")).not.toBeInTheDocument();

  expect(screen.getAllByText("MCQ").length).toBeGreaterThan(0);
  expect(screen.getByText("50")).toBeInTheDocument();
  expect(screen.getByText("Aug 12, 2026")).toBeInTheDocument();

  // The row with no real type/marks/date shows honest dashes, never fabricated values.
  const draftRow = screen.getByText("Mid-course Assessment").closest("tr");
  expect(draftRow).toHaveTextContent("—");
});

it("navigates to the real, existing Assessments page (never a fake route) for New Assessment and View, carrying this batch's real id", async () => {
  assessmentService.getAssessments.mockResolvedValue([
    { assessmentId: 501, id: 501, title: "React Fundamentals Quiz", batchId: 3, status: "Published" },
  ]);

  renderBatchDetail();
  await openAssessmentsTab();
  await screen.findByText("React Fundamentals Quiz");

  fireEvent.click(screen.getByRole("button", { name: "View" }));
  const stub = await screen.findByTestId("assessments-stub");
  expect(stub).toHaveTextContent("batch=3;view=501");
});

it("New Assessment deep-links to the real Assessments page with this batch's real id", async () => {
  assessmentService.getAssessments.mockResolvedValue([]);

  renderBatchDetail();
  await openAssessmentsTab();
  await screen.findByText("No assessments yet");

  fireEvent.click(screen.getAllByRole("button", { name: /new assessment/i })[0]);
  const stub = await screen.findByTestId("assessments-stub");
  expect(stub).toHaveTextContent("batch=3;view=");
});

it("filters the real assessment list by search text, status, and type", async () => {
  assessmentService.getAssessments.mockResolvedValue([
    { assessmentId: 501, id: 501, title: "React Fundamentals Quiz", batchId: 3, status: "Published", assessmentType: "MCQ" },
    { assessmentId: 502, id: 502, title: "Mid-course Assessment", batchId: 3, status: "Draft", assessmentType: "Coding" },
  ]);

  renderBatchDetail();
  await openAssessmentsTab();
  await screen.findByText("React Fundamentals Quiz");

  fireEvent.change(screen.getByPlaceholderText("Search assessments..."), { target: { value: "mid-course" } });
  expect(screen.queryByText("React Fundamentals Quiz")).not.toBeInTheDocument();
  expect(screen.getByText("Mid-course Assessment")).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText("Search assessments..."), { target: { value: "" } });

  fireEvent.change(screen.getByDisplayValue("All Status"), { target: { value: "Published" } });
  expect(screen.getByText("React Fundamentals Quiz")).toBeInTheDocument();
  expect(screen.queryByText("Mid-course Assessment")).not.toBeInTheDocument();
  fireEvent.change(screen.getByDisplayValue("Published"), { target: { value: "All" } });

  fireEvent.change(screen.getByDisplayValue("All Types"), { target: { value: "Coding" } });
  expect(screen.queryByText("React Fundamentals Quiz")).not.toBeInTheDocument();
  expect(screen.getByText("Mid-course Assessment")).toBeInTheDocument();
});

it("shows a real error state with retry, never a stuck spinner or fake empty data, when the assessment API fails", async () => {
  assessmentService.getAssessments.mockRejectedValue(new Error("Network unavailable"));

  renderBatchDetail();
  await openAssessmentsTab();

  await screen.findByText("Unable to load assessments");
  expect(screen.getByText("Network unavailable")).toBeInTheDocument();

  assessmentService.getAssessments.mockResolvedValue([
    { assessmentId: 501, id: 501, title: "React Fundamentals Quiz", batchId: 3, status: "Published" },
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findByText("React Fundamentals Quiz");
});

it("shows the real Attendance Rate KPI (not a fabricated Cancelled count)", async () => {
  liveClassService.list.mockResolvedValue([
    { id: 1, batchId: 3, status: "completed", startAt: "2026-08-01", attendancePercentage: 80 },
    { id: 2, batchId: 3, status: "completed", startAt: "2026-08-02", attendancePercentage: 100 },
  ]);

  renderBatchDetail();
  await screen.findByText("Full Stack Evening");

  expect(screen.getByText("Attendance Rate")).toBeInTheDocument();
  await screen.findByText("90%");
});

it("paginates real results at 10 per page and shows the honest total count", async () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({
    assessmentId: index + 1, id: index + 1, title: `Assessment ${index + 1}`, batchId: 3, status: "Draft",
  }));
  assessmentService.getAssessments.mockResolvedValue(rows);

  renderBatchDetail();
  await openAssessmentsTab();

  await screen.findByText("Assessment 1");
  expect(screen.getByText("12 assessments found")).toBeInTheDocument();
  expect(screen.queryByText("Assessment 11")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "2" }));
  await screen.findByText("Assessment 11");
  expect(screen.queryByText("Assessment 1")).not.toBeInTheDocument();
});
