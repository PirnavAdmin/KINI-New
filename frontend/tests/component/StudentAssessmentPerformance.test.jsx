import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import apiClient from "@shared/services/apiClient";
import { assessmentService } from "@/services/assessmentService";
import { normalizeStudentAssessmentPerformance as normalize } from "@/services/studentAssessmentPerformance";
import StudentProfile from "@features/organization/pages/StudentProfile";
import { studentsApi } from "@/api/students";

vi.mock("@shared/services/apiClient", () => ({ default: { get: vi.fn() } }));
vi.mock("@shared/services/studentPaymentData", () => ({ loadStudentPayments: vi.fn().mockResolvedValue([]) }));
vi.mock("@/api/students", () => ({ studentsApi: {
  getById: vi.fn(), list: vi.fn(), getAttendance: vi.fn(), getQuizResults: vi.fn(),
  getErrorMessage: (error) => error.message,
} }));

// Illustrative fixtures, not captured live data: the authenticated performance
// response is not available in this environment. Entity fields match Swagger.
const result = (studentId = 4, overrides = {}) => ({
  studentId, studentAssessmentId: 91, assessmentId: 21,
  assessment: { title: "Node fundamentals", totalMarks: 50, courseName: "NodeJS" },
  score: 40, percentage: 80, result: "Passed", status: "Completed",
  startedAt: "2026-09-28T10:00:00Z", submittedAt: "2026-09-28T10:32:00Z", ...overrides,
});
const response = (studentId = 4, rows = [result(studentId)]) => ({ data: {
  studentId, totalTests: 6, assessments: rows,
} });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/organization/students/7?tab=Assessment+Results")}>Open Rahul</button>;
}
function mount(tab = "Assessment Results") {
  return render(<MemoryRouter initialEntries={[`/organization/students/4?tab=${encodeURIComponent(tab)}`]}><Navigation /><Routes><Route path="/organization/students/:studentId" element={<StudentProfile />} /></Routes></MemoryRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  studentsApi.getById.mockImplementation(async (id) => ({ data: {
    studentId: Number(id), studentCode: `VISIBLE-${id}`, userId: 9000 + Number(id),
    name: id === "4" ? "Hari Krishna" : "Rahul", courseName: "NodeJS", batchName: "NodeJS 1", mentorName: "Nani Narendra",
  } }));
  studentsApi.getAttendance.mockResolvedValue({ data: [] });
  apiClient.get.mockResolvedValue(response());
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("performance normalization", () => {
  it("preserves raw marks, derives percentages only with a denominator, and uses real duration", () => {
    const data = normalize(response().data, 4);
    expect(data).toMatchObject({ totalTests: 6, attemptedTests: 1, completedTests: 1, averageScore: 80, passedTests: 1 });
    expect(data.assessments[0]).toMatchObject({ score: 40, totalMarks: 50, percentage: 80, duration: 32, attempt: null });
    expect(normalize([result(4, { percentage: undefined, assessment: {} })], 4).assessments[0].percentage).toBeNull();
    expect(normalize([result(4, { score: 0, percentage: 0 })], 4).averageScore).toBe(0);
  });
  it.each([null, {}, "", { message: "OK" }, { assessments: null }, { success: false, data: [] }, { assessments: [null] }])("rejects malformed or failed responses (%j)", (body) => {
    expect(() => normalize(body, 4)).toThrow();
  });
  it("accepts a successful explicit empty list and leaves absent totals unavailable", () => {
    expect(normalize({ success: true, data: { assessments: [] } }, 4)).toMatchObject({ totalTests: null, attemptedTests: 0, averageScore: null, assessments: [] });
  });
  it("rejects another student's envelope or nested attempt", () => {
    expect(() => normalize({ studentId: 7, assessments: [] }, 4)).toThrow(/selected student/);
    expect(() => normalize([result(7)], 4)).toThrow(/selected student/);
    expect(() => normalize([{ assessmentId: 21, attempts: [result(7)] }], 4)).toThrow(/selected student/);
  });
  it("expands only supplied attempts and counts unique completed tests", () => {
    const data = normalize({ assessments: [{ assessmentId: 21, attempts: [result(4, { studentAssessmentId: 90, attemptNumber: 1, percentage: 40, result: "Failed" }), result(4, { attemptNumber: 2 })] }] }, 4);
    expect(data.assessments).toHaveLength(2);
    expect(data.assessments.map((row) => row.attempt)).toEqual([1, 2]);
    expect(data.completedTests).toBe(1);
  });
});

describe("selected student assessment tab", () => {
  it("loads only on the assessment tab using the backend studentId, not userId or visible code", async () => {
    mount("Overview");
    await screen.findByRole("heading", { name: "Hari Krishna" });
    expect(apiClient.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Assessment Results" }));
    await screen.findByText("Assessment History");
    expect(apiClient.get).toHaveBeenCalledExactlyOnceWith("/api/Assessment/students/4/performance", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(studentsApi.getQuizResults).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Performance chart")).toHaveTextContent("80%");
    expect(within(screen.getByRole("table")).getByText("32 min")).toBeInTheDocument();
  });
  it("shows skeletons until a successful empty response and links to assessments", async () => {
    const pending = deferred(); apiClient.get.mockReturnValue(pending.promise);
    mount();
    await screen.findByRole("status", { name: "Loading assessment results" });
    expect(screen.queryByText("No assessment results available")).not.toBeInTheDocument();
    await act(async () => pending.resolve(response(4, [])));
    await screen.findByText("No assessment results available");
    expect(screen.getByRole("link", { name: "View Assessments" })).toHaveAttribute("href", "/organization/assessments");
  });
  it.each([401, 403, 404, 500])("shows HTTP %s as an error, and retry requests the same student", async (status) => {
    apiClient.get.mockRejectedValueOnce({ response: { status, data: { message: "Failure" } } }).mockResolvedValue(response());
    mount();
    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(`HTTP ${status}`);
    expect(screen.queryByText("No assessment results available")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByText("Assessment History");
    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(apiClient.get.mock.calls[1][0]).toBe("/api/Assessment/students/4/performance");
  });
  it("does not silently normalize an unknown successful response to empty", async () => {
    apiClient.get.mockResolvedValue({ data: { unexpected: [] } }); mount();
    await screen.findByRole("alert");
    expect(screen.queryByText("No assessment results available")).not.toBeInTheDocument();
  });
  it("ignores late responses from the previous student and aborts their request", async () => {
    const pending = deferred();
    apiClient.get.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response(7, [result(7, { assessment: { title: "Rahul's test" } })]));
    mount();
    await screen.findByRole("status", { name: "Loading assessment results" });
    const signal = apiClient.get.mock.calls[0][1].signal;
    fireEvent.click(screen.getByRole("button", { name: "Open Rahul" }));
    await screen.findByText("Assessment History");
    expect(apiClient.get.mock.calls[1][0]).toBe("/api/Assessment/students/7/performance");
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve(response()));
    expect(screen.queryByText("Node fundamentals")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("Rahul's test");
  });
  it("removes a previously displayed result and its modal when switching students", async () => {
    apiClient.get.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(7, []));
    mount(); await screen.findByText("Assessment History");
    fireEvent.click(screen.getByRole("button", { name: "View Result" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Hari Krishna");
    fireEvent.click(screen.getByRole("button", { name: "Open Rahul" }));
    await screen.findByText("No assessment results available");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Node fundamentals")).not.toBeInTheDocument();
  });
  it("shows real attempt details and loads questions only on demand", async () => {
    apiClient.get.mockResolvedValueOnce(response(4, [result(4, { attemptNumber: 1 }), result(4, { studentAssessmentId: 92, attemptNumber: 2 })]))
      .mockResolvedValueOnce({ data: [{ questionId: 8, questionText: "What is Node.js?", correctAnswer: "A JavaScript runtime" }] });
    mount(); await screen.findByText("Assessment History");
    fireEvent.click(screen.getAllByRole("button", { name: "View Result" })[0]);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Attempt History");
    expect(dialog).toHaveTextContent("Total Marks50");
    expect(apiClient.get).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole("button", { name: "View Questions" }));
    await screen.findByText("1. What is Node.js?");
    expect(apiClient.get.mock.calls[1][0]).toBe("/api/AssessmentQuestion/assessment/21");
    expect(dialog).toHaveTextContent("does not include the student's answers");
    fireEvent.click(screen.getByRole("button", { name: "Close result" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("aborts an in-flight performance request when leaving the tab", async () => {
    apiClient.get.mockReturnValue(new Promise(() => {})); mount();
    await screen.findByRole("status", { name: "Loading assessment results" });
    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    await waitFor(() => expect(apiClient.get.mock.calls[0][1].signal.aborted).toBe(true));
  });
  it.each([undefined, null, "", 0, -1, "invalid"])("does not request performance for invalid ID %s", async (id) => {
    await expect(assessmentService.getStudentPerformance(id)).rejects.toThrow(/valid selected student/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
