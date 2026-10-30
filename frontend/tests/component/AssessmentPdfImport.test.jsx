import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateAssessment from "../../src/pages/assessments/CreateAssessment";
import { mapImportedAssessment } from "../../src/pages/assessments/assessmentPdfImportMapper";
import { toQuestionPayload } from "../../src/services/assessmentService";

const apiPost = vi.hoisted(() => vi.fn());
vi.mock("../../src/shared/services/apiClient", () => ({ default: { post: apiPost, get: vi.fn() } }));
vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

const { default: assessmentService } = await import("../../src/services/assessmentService");

// The backend's current reply for 5_MCQs_with_Options.pdf.
const CURRENT_EMPTY = { fileName: "5_MCQs_with_Options.pdf", summary: { questionCount: 0, totalMarks: 0 }, questions: [] };
const mcq = (n, correct = 0) => ({
  questionText: `Question ${n} text?`,
  questionType: "MCQ",
  difficulty: n % 2 ? "Easy" : "Medium",
  marks: 5,
  options: ["A", "B", "C", "D"].map((letter, index) => ({ text: `Option ${letter}${n}`, isCorrect: index === correct })),
});
// The structure the backend is expected to return once its parser is fixed.
const FIVE_QUESTIONS = { fileName: "nodejs-assessment.pdf", summary: { questionCount: 5, totalMarks: 25 }, questions: [mcq(1, 0), mcq(2, 1), mcq(3, 2), mcq(4, 3), mcq(5, 0)] };

const SETUP = { name: "Node.js quiz", batchId: "7", courseId: "3", start: "2026-10-10T10:00", end: "2026-10-10T11:00", duration: 60, total: 25, pass: 10, questions: [] };
const pdf = () => new File(["%PDF-1.4"], "5_MCQs_with_Options.pdf", { type: "application/pdf" });

const openQuestionsStep = (props = {}) => {
  render(<CreateAssessment open onClose={vi.fn()} batches={[{ id: 7, name: "Node Morning", courseId: 3 }]} courses={[{ id: 3, name: "nodejs" }]} onSave={vi.fn()} initialData={SETUP} allowPdfImport {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
};
const processPdf = () => {
  fireEvent.click(screen.getByRole("button", { name: /Upload Questions PDF/ }));
  fireEvent.change(screen.getByTestId("assessment-pdf-input"), { target: { files: [pdf()] } });
  expect(screen.getByText("5_MCQs_with_Options.pdf")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Process PDF" }));
};
const summaryText = () => screen.getByText(/^Questions: \d+$/).parentElement.textContent;

// jsdom has no Element.scrollTo; the wizard scrolls each step to its top.
beforeEach(() => { vi.clearAllMocks(); Element.prototype.scrollTo ??= () => {}; });
afterEach(cleanup);

describe("importQuestionsPdf service", () => {
  it("POSTs multipart form data with the PDF in \"file\" to the mentor import endpoint and returns data", async () => {
    apiPost.mockResolvedValue({ data: { success: true, message: "Assessment PDF processed successfully", data: CURRENT_EMPTY } });
    const file = pdf();
    await expect(assessmentService.importQuestionsPdf(file)).resolves.toEqual(CURRENT_EMPTY);

    expect(apiPost).toHaveBeenCalledTimes(1);
    const [url, body, config] = apiPost.mock.calls[0];
    expect(url).toBe("/api/v1/mentor/assessments/import-pdf");
    expect(body).toBeInstanceOf(FormData);
    expect([...body.keys()]).toEqual(["file"]);
    expect(body.get("file")).toBe(file);
    expect(config?.headers?.["Content-Type"]).toBeUndefined();
    expect(config?.headers?.Authorization).toBeUndefined();
  });
});

describe("Questions step — Upload Questions PDF", () => {
  it("handles today's empty backend response: warning, real counts, Apply disabled, no rows added", async () => {
    const spy = vi.spyOn(assessmentService, "importQuestionsPdf").mockResolvedValue(CURRENT_EMPTY);
    openQuestionsStep();
    processPdf();

    expect(await screen.findByText("PDF uploaded successfully, but no questions were extracted.")).toBeTruthy();
    expect(screen.getByText("The PDF parser could not identify any questions.")).toBeTruthy();
    expect(screen.queryByText("PDF processed successfully")).toBeNull();
    const warning = screen.getByText(/no questions were extracted/).closest("[role=alert]");
    expect(warning.textContent).toContain("Questions detected: 0");
    expect(warning.textContent).toContain("Total marks: 0");
    expect(screen.getByRole("button", { name: "Try Another PDF" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply Questions" }).disabled).toBe(true);
    expect(summaryText()).toContain("Questions: 0");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("shows a processing state and allows only one request at a time", async () => {
    let finish;
    const spy = vi.spyOn(assessmentService, "importQuestionsPdf").mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    openQuestionsStep();
    processPdf();
    expect(screen.getByText("Processing assessment PDF...")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Process PDF" })).toBeNull();
    finish(CURRENT_EMPTY);
    await screen.findByText(/no questions were extracted/);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("previews five extracted questions, then Apply adds all five and recalculates marks from question state", async () => {
    vi.spyOn(assessmentService, "importQuestionsPdf").mockResolvedValue(FIVE_QUESTIONS);
    openQuestionsStep();
    processPdf();

    expect(await screen.findByText("PDF processed successfully")).toBeTruthy();
    expect(screen.getByText("5 Questions detected")).toBeTruthy();
    expect(screen.getByText("25 Total Marks")).toBeTruthy();
    const preview = screen.getByRole("list", { name: "Imported questions preview" });
    expect(within(preview).getByText("Question 1 text?")).toBeTruthy();
    expect(within(preview).getByText("○ Option A1 ✓")).toBeTruthy();
    expect(within(preview).getByText("○ Option B2 ✓")).toBeTruthy();
    expect(within(preview).getAllByText(/^Type: MCQ · Difficulty: (Easy|Medium) · Marks: 5$/)).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Apply Questions" }));
    expect(screen.queryByRole("list", { name: "Imported questions preview" })).toBeNull();
    for (let n = 1; n <= 5; n += 1) expect(screen.getByText(`Question ${n} text?`)).toBeTruthy();
    expect(summaryText()).toContain("Questions: 5");
    expect(summaryText()).toContain("Total Question Marks: 25");
    expect(summaryText()).toContain("Assessment Total Marks: 25");
    expect(summaryText()).toContain("✓ Match");

    // Editing a question's marks changes the totals — computed from question state, not summary.totalMarks.
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[2]);
    expect(screen.getByPlaceholderText("Question text").value).toBe("Question 3 text?");
    expect(screen.getByPlaceholderText("Option 3").value).toBe("Option C3");
    const radios = screen.getAllByRole("radio");
    expect(radios[2].checked).toBe(true);
    fireEvent.change(screen.getByLabelText("Question marks"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: /Update question/ }));
    expect(summaryText()).toContain("Total Question Marks: 30");
    expect(summaryText()).toContain("✗ Mismatch");
  });

  it("keeps manual Add Question working alongside imported questions", async () => {
    vi.spyOn(assessmentService, "importQuestionsPdf").mockResolvedValue({ ...FIVE_QUESTIONS, questions: FIVE_QUESTIONS.questions.slice(0, 2) });
    openQuestionsStep();

    fireEvent.change(screen.getByPlaceholderText("Question text"), { target: { value: "Manual question?" } });
    ["W", "X", "Y", "Z"].forEach((letter, index) => fireEvent.change(screen.getByPlaceholderText(`Option ${index + 1}`), { target: { value: letter } }));
    fireEvent.click(screen.getByRole("button", { name: /^Add question$/ }));
    expect(summaryText()).toContain("Questions: 1");

    processPdf();
    fireEvent.click(await screen.findByRole("button", { name: "Apply Questions" }));
    expect(summaryText()).toContain("Questions: 3");
    const rows = screen.getAllByText(/^(Manual question\?|Question \d text\?)$/).map((node) => node.textContent);
    expect(rows).toEqual(["Manual question?", "Question 1 text?", "Question 2 text?"]);
  });

  it("refuses to apply incomplete extractions and says why", async () => {
    const noCorrect = { ...mcq(1), options: mcq(1).options.map((option) => ({ ...option, isCorrect: false })) };
    vi.spyOn(assessmentService, "importQuestionsPdf").mockResolvedValue({ fileName: "x.pdf", summary: { questionCount: 2, totalMarks: 5 }, questions: [noCorrect, { ...mcq(2), marks: null }] });
    openQuestionsStep();
    processPdf();

    expect(await screen.findByText("2 of 2 questions are incomplete. Fix the PDF and try again, or add those questions manually.")).toBeTruthy();
    expect(screen.getByText("No correct option was detected.")).toBeTruthy();
    expect(screen.getByText("Marks were not detected.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply Questions" }).disabled).toBe(true);
  });

  it("maps error statuses to readable messages and validates the file type locally", async () => {
    const spy = vi.spyOn(assessmentService, "importQuestionsPdf");
    openQuestionsStep();
    fireEvent.click(screen.getByRole("button", { name: /Upload Questions PDF/ }));
    fireEvent.change(screen.getByTestId("assessment-pdf-input"), { target: { files: [new File(["x"], "paper.docx", { type: "application/msword" })] } });
    expect(screen.getByRole("alert").textContent).toBe("Please upload a valid PDF.");
    expect(spy).not.toHaveBeenCalled();

    for (const [response, message] of [
      [{ status: 401 }, "Your session is not authorized to import assessment PDFs."],
      [{ status: 403 }, "Your session is not authorized to import assessment PDFs."],
      [{ status: 413 }, "PDF exceeds the allowed file size."],
      [{ status: 415 }, "Please upload a valid PDF."],
      [{ status: 400, data: { message: "File is not a PDF." } }, "File is not a PDF."],
      [{ status: 400, data: { message: { detail: "x" } } }, "Please upload a valid PDF."],
      [{ status: 500, data: { message: "System.NullReferenceException at Parser" } }, "Unable to process the assessment PDF. Please try again."],
    ]) {
      spy.mockRejectedValueOnce({ response });
      fireEvent.change(screen.getByTestId("assessment-pdf-input"), { target: { files: [pdf()] } });
      fireEvent.click(screen.getByRole("button", { name: "Process PDF" }));
      await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(message));
    }
  });

  it("is only offered on the mentor builder", () => {
    openQuestionsStep({ allowPdfImport: false });
    expect(screen.queryByRole("button", { name: /Upload Questions PDF/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Add Question/ })).toBeTruthy();
  });
});

describe("mapImportedAssessment", () => {
  it("maps every field into the builder shape the existing publish payload uses", () => {
    const { questions, canApply } = mapImportedAssessment(FIVE_QUESTIONS);
    expect(canApply).toBe(true);
    expect(questions[1].question).toEqual({ text: "Question 2 text?", difficulty: "Medium", type: "MCQ", marks: 5, options: ["Option A2", "Option B2", "Option C2", "Option D2"], correct: 1, answer: "Option B2" });
    const payload = toQuestionPayload(42, questions[1].question, 1);
    expect(payload.correctAnswer).toBe("Option B2");
    expect(payload.options.map((option) => option.isCorrect)).toEqual([false, true, false, false]);
  });

  it("handles True/False and Descriptive answers and flags what it cannot map", () => {
    const { questions, canApply } = mapImportedAssessment({ questions: [
      { questionText: "Node is single-threaded?", questionType: "True/False", marks: 2, correctAnswer: "true" },
      { questionText: "Explain the event loop.", questionType: "Descriptive", marks: 5, correctAnswer: "Model answer" },
      { questionText: "Pick two", questionType: "MCQ", marks: 2, options: [{ text: "a", isCorrect: true }, { text: "b", isCorrect: true }] },
      { questionText: "Match the columns", questionType: "Matching", marks: 2 },
    ] });
    expect(questions[0].question).toMatchObject({ type: "TrueFalse", answer: "True" });
    expect(questions[1].question).toMatchObject({ type: "Descriptive", answer: "Model answer" });
    expect(questions[2].issues).toContain("More than one option is marked correct.");
    expect(questions[3].issues).toContain("Unsupported question type \"Matching\".");
    expect(canApply).toBe(false);
  });
});
