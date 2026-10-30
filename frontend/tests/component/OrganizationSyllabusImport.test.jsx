import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SyllabusBuilder from "../../src/pages/courses/SyllabusBuilder";
import { mapImportedSyllabus } from "../../src/pages/courses/syllabusImport";
import PARSED_NODEJS_PDF from "../fixtures/syllabusImport.nodejs5.parsed.json";

const apiPost = vi.hoisted(() => vi.fn());
const apiGet = vi.hoisted(() => vi.fn());
vi.mock("../../src/shared/services/apiClient", () => ({ default: { post: apiPost, get: apiGet } }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

// courseService is imported after the apiClient mock so its real
// importSyllabusPdf runs against the mocked transport.
const { courseService } = await import("../../src/shared/services/courseService");
const { tutorService } = await import("../../src/shared/services/tutorService");

const COURSE_ID = "3";
const pdf = () => new File(["%PDF-1.4"], "nodejs_5_modules_syllabus.pdf", { type: "application/pdf" });

// Shape of the CURRENT backend response for the 5-module test PDF: modules
// detected, but topic/lesson text concatenated into each module name.
const MALFORMED_IMPORT = {
  courseId: 3,
  fileName: "nodejs_5_modules_syllabus.pdf",
  fileSize: 32446,
  description: "",
  summary: { moduleCount: 5, topicCount: 0, lessonCount: 0 },
  modules: [1, 2, 3, 4, 5].map((n) => ({
    name: `Module ${n} name Topic 1: Introduction Lesson 1: What is Node.js? Lesson 2: Node.js Features`,
    description: "",
    topics: [],
  })),
};

// Structure the backend should return once its parser is fixed.
const STRUCTURED_IMPORT = {
  courseId: 3,
  fileName: "nodejs_5_modules_syllabus.pdf",
  description: "Node.js course syllabus",
  summary: { moduleCount: 1, topicCount: 1, lessonCount: 2 },
  modules: [{
    name: "Node.js Fundamentals",
    description: "Introduction to Node.js",
    topics: [{
      name: "Introduction to Node.js",
      description: "",
      lessons: [
        { name: "What is Node.js?", description: "Understand Node.js and where it is used." },
        { name: "Node.js Features", description: "" },
      ],
    }],
  }],
};

let getSyllabus;
let createSyllabus;
let importSyllabusPdf;

beforeEach(() => {
  vi.clearAllMocks();
  getSyllabus = vi.spyOn(courseService, "getSyllabus").mockResolvedValue({ courseId: 3, courseName: "Java Full Stack", description: "", modules: [] });
  createSyllabus = vi.spyOn(courseService, "createSyllabus").mockResolvedValue({});
  importSyllabusPdf = vi.spyOn(courseService, "importSyllabusPdf");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const processPdf = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /Upload PDF/ }));
  fireEvent.change(screen.getByTestId("syllabus-pdf-input"), { target: { files: [pdf()] } });
  fireEvent.click(screen.getByRole("button", { name: "Process PDF" }));
};

describe("importSyllabusPdf service", () => {
  it("POSTs multipart form data with the PDF in the \"file\" field to the route course", async () => {
    importSyllabusPdf.mockRestore();
    apiPost.mockResolvedValue({ data: { success: true, data: MALFORMED_IMPORT } });
    const file = pdf();

    const data = await courseService.importSyllabusPdf(COURSE_ID, file);

    expect(apiPost).toHaveBeenCalledTimes(1);
    const [url, body, config] = apiPost.mock.calls[0];
    expect(url).toBe("/api/v1/organization/courses/3/syllabus/import-pdf");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBe(file);
    expect(config?.headers?.["Content-Type"]).toBeUndefined();
    expect(data).toEqual(MALFORMED_IMPORT);
  });
});

describe("Course Details module list", () => {
  it("reads modules from GET syllabus and never requests the non-existent /courses/{id}/modules route", async () => {
    getSyllabus.mockResolvedValue({ courseId: 8, modules: [{ moduleId: 11, moduleNumber: 1, moduleName: "Core", topics: [] }] });

    const modules = await tutorService.courseSyllabusModules("8");

    expect(getSyllabus).toHaveBeenCalledWith("8");
    expect(modules).toEqual([expect.objectContaining({ id: 11, moduleId: 11, moduleName: "Core" })]);
    expect(apiGet.mock.calls.some(([url]) => String(url).endsWith("/modules"))).toBe(false);
  });
});

describe("mapImportedSyllabus", () => {
  it("reports the backend counts and refuses to apply a module-only result without re-parsing names", () => {
    const result = mapImportedSyllabus(MALFORMED_IMPORT);
    expect(result.summary).toEqual({ moduleCount: 5, topicCount: 0, lessonCount: 0 });
    expect(result.canApply).toBe(false);
    expect(result.modules.every((module) => module.topics.length === 0)).toBe(true);
    expect(result.modules[0].moduleName).toBe(MALFORMED_IMPORT.modules[0].name);
  });

  it("maps name/description at every level for a structured result", () => {
    const result = mapImportedSyllabus(STRUCTURED_IMPORT);
    expect(result.canApply).toBe(true);
    expect(result.modules[0]).toEqual({
      moduleName: "Node.js Fundamentals",
      description: "Introduction to Node.js",
      topics: [{
        topicName: "Introduction to Node.js",
        description: "",
        lessons: [
          { lessonName: "What is Node.js?", description: "Understand Node.js and where it is used." },
          { lessonName: "Node.js Features", description: "" },
        ],
      }],
    });
  });
});

describe("Course Details → Syllabus", () => {
  it("loads and renders the real GET syllabus for the route course", async () => {
    getSyllabus.mockResolvedValue({
      courseId: 3,
      description: "Full stack syllabus",
      modules: [{ moduleId: 11, moduleNumber: 1, moduleName: "Core Java", description: "", topics: [{ topicId: 21, topicNumber: 1, topicName: "OOP", description: "", lessons: [{ lessonId: 31, lessonNumber: 1, lessonName: "Classes", description: "" }] }] }],
    });
    render(<SyllabusBuilder courseId={COURSE_ID} />);
    expect(await screen.findByText("Module 1: Core Java")).toBeTruthy();
    expect(screen.getByText("Topic 1: OOP")).toBeTruthy();
    expect(screen.getByText("1. Classes")).toBeTruthy();
    expect(getSyllabus).toHaveBeenCalledWith(COURSE_ID);
  });

  it("shows the current malformed import honestly: real counts, warning, Apply disabled, nothing saved", async () => {
    importSyllabusPdf.mockResolvedValue(MALFORMED_IMPORT);
    render(<SyllabusBuilder courseId={COURSE_ID} />);
    await processPdf();

    expect(await screen.findByText("5 Modules")).toBeTruthy();
    expect(screen.getByText("0 Topics")).toBeTruthy();
    expect(screen.getByText("0 Lessons")).toBeTruthy();
    expect(screen.getByText("Syllabus could not be structured correctly.")).toBeTruthy();
    expect(screen.getByText("Syllabus structure could not be extracted correctly.")).toBeTruthy();
    expect(screen.getByText(/topics and lessons were not detected/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeTruthy();
    // The concatenated module names are not rendered as a preview.
    expect(screen.queryByRole("list", { name: "Imported syllabus preview" })).toBeNull();
    expect(screen.getByRole("button", { name: "Apply to Syllabus" }).disabled).toBe(true);
    expect(importSyllabusPdf).toHaveBeenCalledTimes(1);
    expect(importSyllabusPdf.mock.calls[0][0]).toBe(COURSE_ID);
    expect(importSyllabusPdf.mock.calls[0][1].name).toBe("nodejs_5_modules_syllabus.pdf");
    expect(createSyllabus).not.toHaveBeenCalled();
  });

  it("applies a structured import into the edit form, saves only on Save Syllabus, then refetches", async () => {
    importSyllabusPdf.mockResolvedValue(STRUCTURED_IMPORT);
    render(<SyllabusBuilder courseId={COURSE_ID} />);
    await processPdf();

    const preview = await screen.findByRole("list", { name: "Imported syllabus preview" });
    expect(within(preview).getByText("Module 1")).toBeTruthy();
    expect(within(preview).getByText("Node.js Fundamentals")).toBeTruthy();
    expect(within(preview).getByText("Topic 1")).toBeTruthy();
    // Shown twice: as the module description and as the topic name.
    expect(within(preview).getAllByText("Introduction to Node.js")).toHaveLength(2);
    expect(within(preview).getByText("Lesson 2")).toBeTruthy();
    expect(within(preview).getByText("Node.js Features")).toBeTruthy();
    expect(within(preview).getByText("Understand Node.js and where it is used.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Apply to Syllabus" }));
    expect(screen.getByDisplayValue("Node.js Fundamentals")).toBeTruthy();
    // Module description and topic name are both this text in the fixture.
    expect(screen.getAllByDisplayValue("Introduction to Node.js")).toHaveLength(2);
    expect(screen.getByDisplayValue("What is Node.js?")).toBeTruthy();
    expect(screen.getByDisplayValue("Node.js course syllabus")).toBeTruthy();
    expect(createSyllabus).not.toHaveBeenCalled();

    // The organization can still edit the imported rows before saving.
    fireEvent.change(screen.getByDisplayValue("Node.js Features"), { target: { value: "Node.js Features & Use Cases" } });
    const getCallsBeforeSave = getSyllabus.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /Save Syllabus/ }));

    await waitFor(() => expect(createSyllabus).toHaveBeenCalledTimes(1));
    expect(createSyllabus).toHaveBeenCalledWith(COURSE_ID, {
      description: "Node.js course syllabus",
      modules: [{
        moduleNumber: 1,
        moduleName: "Node.js Fundamentals",
        description: "Introduction to Node.js",
        topics: [{
          topicNumber: 1,
          topicName: "Introduction to Node.js",
          description: "",
          lessons: [
            { lessonNumber: 1, lessonName: "What is Node.js?", description: "Understand Node.js and where it is used." },
            { lessonNumber: 2, lessonName: "Node.js Features & Use Cases", description: "" },
          ],
        }],
      }],
    });
    await waitFor(() => expect(getSyllabus.mock.calls.length).toBe(getCallsBeforeSave + 1));
  });

  // Fixture = output of the reference .NET parser (syllabus-pdf-parser) run on
  // the real nodejs_5_modules_syllabus.pdf — not hand-written data.
  it("previews, applies and saves the full parsed Node.js PDF (5 modules · 11 topics · 36 lessons)", async () => {
    importSyllabusPdf.mockResolvedValue(PARSED_NODEJS_PDF);
    render(<SyllabusBuilder courseId={COURSE_ID} />);
    await processPdf();

    expect(await screen.findByText("5 Modules")).toBeTruthy();
    expect(screen.getByText("11 Topics")).toBeTruthy();
    expect(screen.getByText("36 Lessons")).toBeTruthy();
    expect(screen.queryByText(/could not be structured correctly/)).toBeNull();
    const preview = screen.getByRole("list", { name: "Imported syllabus preview" });
    expect(within(preview).getByText("File System, Events and Asynchronous Programming")).toBeTruthy();
    expect(within(preview).getByText("Using the Node.js REPL")).toBeTruthy();
    expect(within(preview).getByText("Work with the interactive Node.js REPL environment.")).toBeTruthy();
    expect(within(preview).getByText(/^Introduction to Node.js, its runtime architecture/)).toBeTruthy();

    const apply = screen.getByRole("button", { name: "Apply to Syllabus" });
    expect(apply.disabled).toBe(false);
    fireEvent.click(apply);
    expect(screen.getAllByText(/^Module \d+$/)).toHaveLength(5);
    expect(screen.getAllByText(/^Topic \d+$/)).toHaveLength(11);
    expect(screen.getByDisplayValue("Database Integration, Authentication and Deployment")).toBeTruthy();
    expect(createSyllabus).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Save Syllabus/ }));
    await waitFor(() => expect(createSyllabus).toHaveBeenCalledTimes(1));
    const payload = createSyllabus.mock.calls[0][1];
    expect(payload.description).toBe(PARSED_NODEJS_PDF.description);
    expect(payload.modules).toHaveLength(5);
    expect(payload.modules.flatMap((module) => module.topics)).toHaveLength(11);
    expect(payload.modules.flatMap((module) => module.topics.flatMap((topic) => topic.lessons))).toHaveLength(36);
    expect(payload.modules[0].topics[0].lessons[0]).toEqual({ lessonNumber: 1, lessonName: "What is Node.js?", description: "Understand Node.js and where it is used." });
  });

  it("rejects a non-PDF file before any request", async () => {
    render(<SyllabusBuilder courseId={COURSE_ID} />);
    fireEvent.click(await screen.findByRole("button", { name: /Upload PDF/ }));
    fireEvent.change(screen.getByTestId("syllabus-pdf-input"), { target: { files: [new File(["x"], "notes.docx", { type: "application/msword" })] } });
    expect(screen.getByRole("alert").textContent).toBe("Please select a PDF file.");
    expect(screen.getByRole("button", { name: "Process PDF" }).disabled).toBe(true);
    expect(importSyllabusPdf).not.toHaveBeenCalled();
  });
});
