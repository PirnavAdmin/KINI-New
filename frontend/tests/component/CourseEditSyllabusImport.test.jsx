import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseForm from "../../src/pages/courses/CourseForm";
import { courseService } from "../../src/shared/services/courseService";
import PARSED_NODEJS_PDF from "../fixtures/syllabusImport.nodejs5.parsed.json";

vi.mock("../../src/shared/services/courseService", () => ({
  courseService: {
    getCourse: vi.fn(),
    // The Courses list renders behind the course dialog.
    getCourses: vi.fn().mockResolvedValue({ data: [] }),
    updateCourse: vi.fn(),
    createCourse: vi.fn(),
    deleteCourse: vi.fn(),
    uploadPdf: vi.fn(),
    getSyllabus: vi.fn(),
    createSyllabus: vi.fn(),
    importSyllabusPdf: vi.fn(),
  },
}));
vi.mock("../../src/pages/courses/CoursesPage", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const MALFORMED = {
  courseId: 8,
  fileName: "nodejs_5_modules_clean_structure.pdf",
  description: "",
  summary: { moduleCount: 4, topicCount: 0, lessonCount: 0 },
  modules: [{ name: "Node.js Modules and npmModule Description: Learn how... Topic 1: Node.js Module System Lesson 1: Core Modules", description: "", topics: [] }],
};
const pdf = () => new File(["%PDF-1.4"], "nodejs_5_modules_syllabus.pdf", { type: "application/pdf" });

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

const renderEdit = (courseId = "5", path = `/organization/courses/${courseId}/edit`) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/organization/courses/:courseId/edit" element={<CourseForm />} />
      <Route path="/organization/courses/new" element={<CourseForm />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>,
);

const choosePdf = async () => {
  await screen.findByText("Course Syllabus PDF");
  fireEvent.change(screen.getByTestId("syllabus-pdf-input"), { target: { files: [pdf()] } });
};

beforeEach(() => {
  vi.clearAllMocks();
  courseService.getCourse.mockResolvedValue({ courseName: "Node.js", duration: "3 Months", level: "Beginner", price: 25000, status: true });
  courseService.updateCourse.mockResolvedValue({});
  courseService.createSyllabus.mockResolvedValue({});
  courseService.getSyllabus.mockResolvedValue({ courseId: 5, description: "", modules: [] });
});
afterEach(cleanup);

describe("Edit Course → Course Syllabus PDF", () => {
  it("processes the PDF for the route's course, previews, saves through the syllabus API and links to the Syllabus tab", async () => {
    let finishImport;
    courseService.importSyllabusPdf.mockReturnValue(new Promise((resolve) => { finishImport = resolve; }));
    renderEdit("5");

    expect(await screen.findByText("Upload a syllabus PDF to automatically create modules, topics and lessons.")).toBeTruthy();
    await choosePdf();

    expect(screen.getByText("Processing syllabus...")).toBeTruthy();
    expect(screen.queryByTestId("syllabus-pdf-input")).toBeTruthy();
    expect(courseService.importSyllabusPdf).toHaveBeenCalledTimes(1);
    expect(courseService.importSyllabusPdf.mock.calls[0][0]).toBe("5");
    expect(courseService.importSyllabusPdf.mock.calls[0][1].name).toBe("nodejs_5_modules_syllabus.pdf");

    await act(async () => finishImport(PARSED_NODEJS_PDF));
    expect(screen.getByText("Syllabus PDF processed successfully")).toBeTruthy();
    expect(screen.getByText("5 Modules")).toBeTruthy();
    expect(screen.getByText("11 Topics")).toBeTruthy();
    expect(screen.getByText("36 Lessons")).toBeTruthy();

    // Preview is collapsed until requested, then shows the real hierarchy.
    expect(screen.queryByRole("list", { name: "Imported syllabus preview" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Preview Syllabus" }));
    expect(screen.getByRole("list", { name: "Imported syllabus preview" })).toBeTruthy();
    expect(screen.getByText("Using the Node.js REPL")).toBeTruthy();

    // After saving, the success counts come from the GET that follows the save.
    courseService.getSyllabus
      .mockResolvedValueOnce({ courseId: 5, modules: [] })
      .mockResolvedValueOnce({ courseId: 5, modules: PARSED_NODEJS_PDF.modules.map((module) => ({ moduleName: module.name, topics: module.topics })) });
    fireEvent.click(screen.getByRole("button", { name: "Apply to Syllabus" }));

    expect(await screen.findByText("Syllabus imported successfully")).toBeTruthy();
    expect(courseService.createSyllabus).toHaveBeenCalledTimes(1);
    const [savedCourseId, payload] = courseService.createSyllabus.mock.calls[0];
    expect(savedCourseId).toBe("5");
    expect(payload.description).toBe(PARSED_NODEJS_PDF.description);
    expect(payload.modules).toHaveLength(5);
    expect(payload.modules.flatMap((module) => module.topics)).toHaveLength(11);
    expect(payload.modules.flatMap((module) => module.topics.flatMap((topic) => topic.lessons))).toHaveLength(36);
    expect(payload.modules[1]).toMatchObject({ moduleNumber: 2, moduleName: "Node.js Modules and npm" });
    expect(payload.modules[0].topics[1]).toMatchObject({ topicNumber: 2, topicName: "Environment Setup" });
    expect(payload.modules[0].topics[0].lessons[2]).toEqual({ lessonNumber: 3, lessonName: "Node.js Architecture", description: "Understand the event-driven and non-blocking architecture." });
    expect(courseService.getSyllabus).toHaveBeenLastCalledWith("5");

    // Course fields were never touched by the syllabus import.
    expect(courseService.updateCourse).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "View Syllabus" }));
    expect(screen.getByTestId("location").textContent).toBe("/organization/courses/5/details?tab=syllabus");
  });

  it("takes the course id from the route, never a fixed one", async () => {
    courseService.importSyllabusPdf.mockResolvedValue(PARSED_NODEJS_PDF);
    renderEdit("8");
    await choosePdf();
    await waitFor(() => expect(courseService.importSyllabusPdf).toHaveBeenCalledTimes(1));
    expect(courseService.importSyllabusPdf.mock.calls[0][0]).toBe("8");
    expect(courseService.getCourse).toHaveBeenCalledWith("8");
  });

  it("asks before replacing an existing syllabus and saves only after Replace Syllabus", async () => {
    courseService.importSyllabusPdf.mockResolvedValue(PARSED_NODEJS_PDF);
    courseService.getSyllabus.mockResolvedValue({ courseId: 5, description: "Old description", modules: [{ moduleId: 1, moduleName: "Old module", topics: [{ topicName: "Old topic", lessons: [{ lessonName: "Old lesson" }] }] }] });
    renderEdit("5");
    await choosePdf();

    fireEvent.click(await screen.findByRole("button", { name: "Apply to Syllabus" }));
    expect(await screen.findByText("Existing syllabus found")).toBeTruthy();
    expect(screen.getByText("This course already contains a syllabus. Applying this PDF will replace the existing syllabus.")).toBeTruthy();
    expect(courseService.createSyllabus).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Existing syllabus found")).toBeNull();
    expect(courseService.createSyllabus).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply to Syllabus" }));
    fireEvent.click(await screen.findByRole("button", { name: "Replace Syllabus" }));
    await waitFor(() => expect(courseService.createSyllabus).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Syllabus imported successfully")).toBeTruthy();
  });

  it("keeps Apply disabled for a malformed parser result and offers Try Again", async () => {
    courseService.importSyllabusPdf.mockResolvedValue(MALFORMED);
    renderEdit("8");
    await choosePdf();

    expect(await screen.findByText("Syllabus could not be structured correctly.")).toBeTruthy();
    expect(screen.getByText("4 Modules")).toBeTruthy();
    expect(screen.getByText("0 Topics")).toBeTruthy();
    expect(screen.getByText("Syllabus structure could not be extracted correctly.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply to Syllabus" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Try Again" })).toBeTruthy();
    expect(screen.queryByText(/Module Description:/)).toBeNull();
    expect(courseService.createSyllabus).not.toHaveBeenCalled();
  });

  it("shows readable errors: invalid file, server failure, and never an object message", async () => {
    renderEdit("5");
    await screen.findByText("Course Syllabus PDF");
    fireEvent.change(screen.getByTestId("syllabus-pdf-input"), { target: { files: [new File(["x"], "notes.docx", { type: "application/msword" })] } });
    expect(screen.getByRole("alert").textContent).toBe("Please select a PDF file.");
    expect(courseService.importSyllabusPdf).not.toHaveBeenCalled();

    courseService.importSyllabusPdf.mockRejectedValueOnce({ response: { status: 500, data: { message: { detail: "stack" } } } });
    await choosePdf();
    expect((await screen.findByRole("alert")).textContent).toBe("Unable to process syllabus PDF.");

    courseService.importSyllabusPdf.mockRejectedValueOnce({ response: { status: 400, data: { message: { field: "file" } } } });
    fireEvent.change(screen.getByTestId("syllabus-pdf-input"), { target: { files: [pdf()] } });
    expect((await screen.findByRole("alert")).textContent).not.toContain("[object Object]");
  });

  it("Update Course saves only course fields and never imports or overwrites the syllabus", async () => {
    renderEdit("5");
    const price = await screen.findByDisplayValue("25000");
    fireEvent.change(price, { target: { value: "30000" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Course" }));

    await waitFor(() => expect(courseService.updateCourse).toHaveBeenCalledWith("5", { courseName: "Node.js", duration: "3 Months", level: "Beginner", price: 30000, status: true }));
    expect(courseService.importSyllabusPdf).not.toHaveBeenCalled();
    expect(courseService.createSyllabus).not.toHaveBeenCalled();
    expect(courseService.uploadPdf).not.toHaveBeenCalled();
  });
});

describe("Add Course PDF", () => {
  const fill = async () => {
    await screen.findByRole("button", { name: "Upload PDF" });
    fireEvent.change(screen.getByLabelText(/Course Name/), { target: { value: "React" } });
    fireEvent.change(screen.getByLabelText(/Duration/), { target: { value: "3 Months" } });
    fireEvent.change(screen.getByLabelText(/^Level/), { target: { value: "Beginner" } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: "1000" } });
  };
  const select = async (file = pdf()) => {
    fireEvent.change(screen.getByLabelText("Course syllabus PDF"), { target: { files: [file] } });
    await screen.findByText(file.name);
    return file;
  };
  it("uploads the PDF to the created course storage endpoint", async () => {
    courseService.createCourse.mockResolvedValue({ courseId: 42 });
    courseService.uploadPdf.mockResolvedValue({});
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    const file = await select();
    fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
    await waitFor(() => expect(courseService.uploadPdf).toHaveBeenCalledWith(42, file));
    expect(courseService.importSyllabusPdf).not.toHaveBeenCalled();
  });
  it("retains the created id after upload failure and prevents duplicate creation on retry", async () => {
    courseService.createCourse.mockResolvedValue({ courseId: 52 });
    courseService.uploadPdf.mockRejectedValueOnce({ response: { status: 413 } }).mockResolvedValueOnce({});
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    const file = await select();
    fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
    await screen.findByText(/Course created.*server upload limit/);
    fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
    await waitFor(() => expect(courseService.uploadPdf).toHaveBeenCalledTimes(2));
    expect(courseService.createCourse).toHaveBeenCalledTimes(1);
    expect(courseService.uploadPdf).toHaveBeenLastCalledWith(52, file);
  });
  it("supports replacement and removal and optional creation without a file", async () => {
    courseService.createCourse.mockResolvedValue({ courseId: 62 });
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    await select();
    expect(screen.getByRole("button", { name: "Replace PDF" })).toBeInTheDocument();
    await select(new File(["%PDF-1.4"], "replacement.pdf", { type: "application/pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove replacement.pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
    await waitFor(() => expect(courseService.createCourse).toHaveBeenCalled());
    expect(courseService.uploadPdf).not.toHaveBeenCalled();
  });
  it.each([
    [new File(["text"], "notes.txt", { type: "text/plain" }), /Choose a PDF/],
    [new File([], "empty.pdf", { type: "application/pdf" }), /PDF file is empty/],
    [new File(["not a PDF"], "fake.pdf", { type: "application/pdf" }), /valid PDF header/],
  ])("rejects invalid files before upload", async (file, message) => {
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    fireEvent.change(screen.getByLabelText("Course syllabus PDF"), { target: { files: [file] } });
    await screen.findByText(message);
    expect(courseService.uploadPdf).not.toHaveBeenCalled();
  });
  it("does not upload when course creation fails", async () => {
    courseService.createCourse.mockRejectedValueOnce(new Error("offline"));
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    await select();
    fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
    await screen.findByText(/Unable to save course/);
    expect(courseService.uploadPdf).not.toHaveBeenCalled();
  });
  it("prevents duplicate submissions while creation is pending", async () => {
    let finish;
    courseService.createCourse.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    renderEdit(undefined, "/organization/courses/new");
    await fill();
    const file = await select();
    const form = screen.getByRole("button", { name: "Create Course", exact: true }).getAttribute("form");
    fireEvent.submit(document.getElementById(form));
    fireEvent.submit(document.getElementById(form));
    expect(courseService.createCourse).toHaveBeenCalledTimes(1);
    await act(async () => finish({ courseId: 72 }));
    expect(courseService.uploadPdf).toHaveBeenCalledWith(72, file);
  });
});

