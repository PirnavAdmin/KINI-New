import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useCourseSyllabusModules, { toSyllabusModuleOptions } from "../../src/features/live-classes/hooks/useCourseSyllabusModules";
import useLiveClasses from "../../src/features/live-classes/hooks/useLiveClasses";
import LiveClassFormModal from "../../src/features/live-classes/components/LiveClassFormModal";
import { toLiveClassRequest } from "../../src/features/live-classes/api/liveClassApi";
import { courseService } from "../../src/shared/services/courseService";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";

vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getSyllabus: vi.fn(), getCourses: vi.fn().mockResolvedValue({ data: [] }) },
}));
vi.mock("../../src/features/live-classes/services/liveClassService", () => {
  const list = () => vi.fn().mockResolvedValue([]);
  return {
    liveClassService: {
      list: list(), today: list(), upcoming: list(), live: list(), completed: list(),
      dashboard: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}),
    },
  };
});
vi.mock("../../src/shared/services/batchService", () => ({ batchService: { getAll: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../src/shared/services/mentorService", () => ({ mentorService: { getMentors: vi.fn().mockResolvedValue([]) } }));

const syllabus = (courseId, names) => ({
  courseId,
  description: "",
  modules: names.map((moduleName, index) => ({ moduleId: courseId * 100 + index + 1, moduleNumber: index + 1, moduleName, description: "", topics: [] })),
});
const COURSE_A = syllabus(8, ["Node.js Fundamentals", "Node.js Modules and npm", "File System, Events and Asynchronous Programming"]);
const COURSE_B = syllabus(9, ["AWS Basics", "EC2 and S3"]);

beforeEach(() => {
  vi.clearAllMocks();
  courseService.getSyllabus.mockImplementation(async (id) => ({ 8: COURSE_A, 9: COURSE_B, 10: { courseId: 10, modules: [] } })[id]);
});
afterEach(cleanup);

describe("toSyllabusModuleOptions", () => {
  it("uses the real moduleId as the value and numbers the label from moduleNumber", () => {
    expect(toSyllabusModuleOptions(COURSE_A)).toEqual([
      { value: "801", label: "Module 1 — Node.js Fundamentals" },
      { value: "802", label: "Module 2 — Node.js Modules and npm" },
      { value: "803", label: "Module 3 — File System, Events and Asynchronous Programming" },
    ]);
  });

  it("never substitutes moduleNumber for a missing moduleId and invents nothing for an empty syllabus", () => {
    expect(toSyllabusModuleOptions({ modules: [{ moduleNumber: 1, moduleName: "No id" }] })).toEqual([]);
    expect(toSyllabusModuleOptions({ modules: [] })).toEqual([]);
    expect(toSyllabusModuleOptions(undefined)).toEqual([]);
  });
});

describe("useCourseSyllabusModules", () => {
  it("loads the selected course's syllabus and never shows the previous course's modules after a switch", async () => {
    const { result, rerender } = renderHook(({ courseId }) => useCourseSyllabusModules(courseId), { initialProps: { courseId: "" } });
    expect(result.current).toMatchObject({ status: "idle", options: [] });
    expect(courseService.getSyllabus).not.toHaveBeenCalled();

    rerender({ courseId: "8" });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(courseService.getSyllabus).toHaveBeenLastCalledWith("8");
    expect(result.current.options.map((option) => option.value)).toEqual(["801", "802", "803"]);

    rerender({ courseId: "9" });
    expect(result.current).toMatchObject({ status: "loading", options: [] });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(courseService.getSyllabus).toHaveBeenLastCalledWith("9");
    expect(result.current.options.map((option) => option.label)).toEqual(["Module 1 — AWS Basics", "Module 2 — EC2 and S3"]);
  });

  it("reports an empty syllabus — and a 404 'no syllabus yet' — as zero modules", async () => {
    const { result, rerender } = renderHook(({ courseId }) => useCourseSyllabusModules(courseId), { initialProps: { courseId: "10" } });
    await waitFor(() => expect(result.current).toMatchObject({ status: "ready", options: [] }));

    courseService.getSyllabus.mockRejectedValueOnce(Object.assign(new Error("Not found"), { response: { status: 404 } }));
    rerender({ courseId: "11" });
    await waitFor(() => expect(result.current).toMatchObject({ courseId: "11", status: "ready", options: [] }));
  });

  it("never requests the non-existent /courses/{id}/modules route", async () => {
    renderHook(() => useCourseSyllabusModules("8"));
    await waitFor(() => expect(courseService.getSyllabus).toHaveBeenCalledWith("8"));
    expect(Object.keys(courseService)).not.toContain("getModules");
  });
});

describe("Schedule Live Class form — Module field", () => {
  const renderForm = (props = {}) => render(
    <LiveClassFormModal
      open
      onClose={vi.fn()}
      mode="create"
      values={{ title: "", description: "", courseId: "", moduleId: "", batchId: "", mentorId: "", meetingPlatformId: "", meetingUrl: "", date: "", startTime: "", endTime: "", status: "scheduled" }}
      onChange={vi.fn()}
      saving={false}
      error=""
      getFieldError={() => ""}
      courseOptions={[{ value: "8", label: "Node.js" }]}
      batchOptions={[]}
      mentorOptions={[]}
      platformOptions={[]}
      statusOptions={[]}
      selectedCourseId=""
      selectedBatchId=""
      mentorHelperText=""
      dropdownLoading={false}
      onCourseChange={vi.fn()}
      onModuleChange={vi.fn()}
      onBatchChange={vi.fn()}
      onMentorChange={vi.fn()}
      onSubmit={vi.fn()}
      {...props}
    />,
  );
  const moduleSelect = () => screen.getByText("Module *").closest("label").querySelector("select");

  it("sits between Course and Batch and is disabled until a course is selected", () => {
    renderForm();
    const labels = Array.from(document.querySelectorAll("label > span")).map((span) => span.textContent);
    expect(labels.indexOf("Module *")).toBe(labels.indexOf("Course *") + 1);
    expect(labels.indexOf("Batch *")).toBe(labels.indexOf("Module *") + 1);
    expect(moduleSelect().disabled).toBe(true);
    expect(moduleSelect().options[0].textContent).toBe("Select a course first");
  });

  it("lists the course's syllabus modules and reports the chosen moduleId", () => {
    const onModuleChange = vi.fn();
    renderForm({ selectedCourseId: "8", moduleStatus: "ready", moduleOptions: toSyllabusModuleOptions(COURSE_A), onModuleChange });
    expect(moduleSelect().disabled).toBe(false);
    expect(Array.from(moduleSelect().options).map((option) => option.textContent)).toEqual([
      "Select module",
      "Module 1 — Node.js Fundamentals",
      "Module 2 — Node.js Modules and npm",
      "Module 3 — File System, Events and Asynchronous Programming",
    ]);
    fireEvent.change(moduleSelect(), { target: { value: "802" } });
    expect(onModuleChange).toHaveBeenCalledWith("802");
  });

  it("shows the no-syllabus state without any options", () => {
    renderForm({ selectedCourseId: "10", moduleStatus: "ready", moduleOptions: [] });
    expect(moduleSelect().disabled).toBe(true);
    expect(Array.from(moduleSelect().options).map((option) => option.textContent)).toEqual(["No syllabus modules available"]);
    expect(screen.getByText("No syllabus modules are available for this course.")).toBeTruthy();
  });
});

describe("Saving", () => {
  it("sends the chosen syllabus moduleId as a number", () => {
    const request = toLiveClassRequest({ title: "Hooks", courseId: "8", moduleId: "802", batchId: "10", scheduledDate: "2026-10-07", startTime: "15:00", endTime: "16:00", meetingPlatform: "Zoom", meetingLink: "https://zoom.us/j/1" });
    expect(request.moduleId).toBe(802);
    expect(request.courseId).toBe(8);
    expect(request.batchId).toBe(10);
  });

  it.each(["", "0", "-3", "1.5", "abc", null, undefined])("never sends an invalid moduleId (%s)", (moduleId) => {
    const request = toLiveClassRequest({ title: "Hooks", courseId: "8", moduleId, batchId: "10" });
    expect(request.moduleId).toBeUndefined();
  });

  it("a new class without a module is blocked in the hook and sends no request", async () => {
    const { result } = renderHook(() => useLiveClasses());
    await waitFor(() => expect(liveClassService.list).toHaveBeenCalled());
    act(() => result.current.openForm());
    await act(async () => { await result.current.submitForm(); });

    expect(result.current.formFieldErrors.moduleId).toEqual(["Module is required."]);
    expect(liveClassService.create).not.toHaveBeenCalled();
  });

  it("a missing module blocks Save with a field error and no request", async () => {
    const { result } = renderHook(() => useLiveClasses());
    await waitFor(() => expect(liveClassService.list).toHaveBeenCalled());
    act(() => result.current.openForm());
    await act(async () => { await result.current.submitForm({ moduleId: ["Module is required."] }); });

    expect(result.current.formFieldErrors.moduleId).toEqual(["Module is required."]);
    expect(liveClassService.create).not.toHaveBeenCalled();
  });
});

describe("module titles in the dropdown", () => {
  it("cuts a description glued onto the module name by the PDF import", () => {
    const options = toSyllabusModuleOptions({ modules: [
      { moduleId: 1, moduleNumber: 1, moduleName: "Node.js FundamentalsIntroduction to Node.js, its runtime architecture, setup, and core JavaScript concepts used inserver-side development.", description: "Introduction to Node.js, its runtime architecture, setup, and core JavaScript concepts used in server-side development." },
      { moduleId: 3, moduleNumber: 3, moduleName: "File System, Events and AsynchronousProgrammingWork with files, events, callbacks, promises, and asynchronous operations in Node.js.", description: "Work with files, events, callbacks, promises, and asynchronous operations in Node.js." },
    ] });
    expect(options.map((option) => option.label)).toEqual([
      "Module 1 — Node.js Fundamentals",
      "Module 3 — File System, Events and AsynchronousProgramming",
    ]);
    expect(options[0].description).toMatch(/^Introduction to Node.js/);
  });

  it("shortens a long title without a matching description and leaves normal titles alone", () => {
    const [long, plain] = toSyllabusModuleOptions({ modules: [
      { moduleId: 5, moduleNumber: 5, moduleName: "Database Integration, Authentication and Deployment of production Node.js applications to the cloud", description: "" },
      { moduleId: 6, moduleNumber: 6, moduleName: "Express.js", description: "Build REST APIs." },
    ] });
    expect(long.label.length).toBeLessThanOrEqual("Module 5 — ".length + 61);
    expect(long.label.endsWith("…")).toBe(true);
    expect(plain).toEqual({ value: "6", label: "Module 6 — Express.js", description: "Build REST APIs." });
  });
});

describe("Schedule Live Class dialog module field", () => {
  it("lists concise module titles and shows the selected module's description below the field", async () => {
    const { default: ScheduleLiveClassDialog } = await import("../../src/features/mentor/components/ScheduleLiveClassDialog");
    const options = toSyllabusModuleOptions({ modules: [
      { moduleId: 801, moduleNumber: 1, moduleName: "Node.js FundamentalsIntroduction to Node.js, its runtime architecture.", description: "Introduction to Node.js, its runtime architecture." },
      { moduleId: 802, moduleNumber: 2, moduleName: "Node.js Modules and npm", description: "" },
    ] });
    const form = { course: "8", batch: "", moduleId: "801", classTitle: "", description: "", meetingPlatform: "", meetingLink: "", meetingId: "", meetingPassword: "", scheduledDate: "", startTime: "", endTime: "", status: "scheduled", isRecordingEnabled: false };
    render(
      <ScheduleLiveClassDialog
        form={form}
        update={vi.fn()}
        catalog={{ courses: [{ id: 8, name: "nodejs" }], batches: [], mentors: [], platforms: [], statuses: [] }}
        batches={[]}
        modules={{ status: "ready", options, error: "" }}
        mentorLabel="Mentor"
        saving={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        idOf={(item) => item.id}
        nameOf={(item) => item.name}
      />,
    );
    expect(screen.getByRole("option", { name: "Module 1 — Node.js Fundamentals" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Module 2 — Node.js Modules and npm" })).toBeTruthy();
    expect(screen.getByText("Introduction to Node.js, its runtime architecture.")).toBeTruthy();
  });
});
