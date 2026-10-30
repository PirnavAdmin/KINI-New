import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MentorCalendar from "../../src/features/mentor/pages/MentorCalendar";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { courseService } from "../../src/shared/services/courseService";
import { getMentorDashboardBatches, getMentorDashboardCourses } from "../../src/shared/services/mentorService";
import { toSyllabusModuleOptions } from "../../src/features/live-classes/hooks/useCourseSyllabusModules";
import { modulesForBatch } from "../../src/features/mentor/utils/mentorScheduleOptions";

vi.mock("../../src/features/live-classes/services/liveClassService", () => ({
  liveClassService: { dropdowns: vi.fn(), list: vi.fn(), create: vi.fn() },
}));
vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getSyllabus: vi.fn() },
}));
vi.mock("../../src/shared/services/mentorService", () => ({
  getMentorDashboardBatches: vi.fn(),
  getMentorDashboardClasses: vi.fn().mockResolvedValue([]),
  getMentorDashboardCourses: vi.fn(),
}));
vi.mock("../../src/shared/hooks/useAuth", () => ({
  useAuth: () => ({ user: { userId: 101, mentorId: 7, role: "Mentor", fullName: "Asha Rao" } }),
}));
vi.mock("../../src/pages/schedule/SchedulePage", () => ({
  default: ({ onScheduleClass }) => <button type="button" onClick={onScheduleClass}>Open scheduler</button>,
}));
vi.mock("../../src/features/mentor/pages/MentorLiveClasses", () => ({ default: () => null }));
vi.mock("../../src/features/mentor/pages/MentorRecordedSessions", () => ({ default: () => null }));

// Batch-tagged completion records (the contract the backend needs to add).
// Module 1 is completed in batch 20 only; batch 21 has completed nothing.
const SYLLABI = {
  10: { modules: [
    { moduleId: 1001, moduleNumber: 1, moduleName: "React.js Fundamentals", batchProgress: [{ batchId: 20, isCompleted: true }, { batchId: 21, isCompleted: false }] },
    { moduleId: 1002, moduleNumber: 2, moduleName: "Components, Props and State", batchProgress: [{ batchId: 20, isCompleted: false }] },
    { moduleId: 1003, moduleNumber: 3, moduleName: "Hooks and Routing" },
  ] },
  11: { modules: [
    { moduleId: 1101, moduleNumber: 1, moduleName: "Node Basics", batchProgress: [{ batchId: "22", status: "Completed" }] },
  ] },
};

beforeEach(() => {
  vi.clearAllMocks();
  getMentorDashboardCourses.mockResolvedValue([{ courseId: 10, courseName: "React" }, { courseId: 11, courseName: "Node" }]);
  getMentorDashboardBatches.mockResolvedValue([
    { batchId: 20, batchName: "React Morning", courseId: 10, mentorId: 7 },
    { batchId: 21, batchName: "React Evening", courseId: 10, mentorId: 7 },
    { batchId: 22, batchName: "Node Weekend", courseId: 11, mentorId: 7 },
  ]);
  liveClassService.dropdowns.mockResolvedValue({ courses: [], batches: [], mentors: [], platforms: [], statuses: [] });
  liveClassService.list.mockResolvedValue([]);
  liveClassService.create.mockResolvedValue({ liveClassId: 900 });
  courseService.getSyllabus.mockImplementation(async (courseId) => SYLLABI[courseId]);
});
afterEach(cleanup);

const field = (dialog, label) => within(dialog).getByLabelText(label);
const set = (dialog, label, value) => fireEvent.change(field(dialog, label), { target: { value } });
const moduleOptions = (dialog) => Array.from(field(dialog, /^Module/).options).filter((option) => option.value)
  .map((option) => ({ value: option.value, label: option.textContent, disabled: option.disabled }));

const openWith = async (course, batch) => {
  render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(field(dialog, /^Course/)).not.toBeDisabled());
  set(dialog, /^Course/, course);
  await waitFor(() => expect(field(dialog, /^Module/)).not.toHaveAttribute("aria-busy"));
  if (batch) set(dialog, /^Batch/, batch);
  return dialog;
};
const fillRest = (dialog) => {
  set(dialog, /Class Title/, "Next session");
  set(dialog, /^Date/, "2026-11-02");
  set(dialog, /Start Time/, "10:00");
  set(dialog, /End Time/, "11:00");
  set(dialog, /Meeting Platform/, "Zoom");
  set(dialog, /Meeting URL/, "https://zoom.us/j/555");
};

describe("module completion per course + batch", () => {
  it("shows a module completed in the batch as disabled with a Completed label", async () => {
    const dialog = await openWith("10", "20");
    expect(moduleOptions(dialog)).toEqual([
      { value: "1001", label: "Module 1 — React.js Fundamentals (Completed)", disabled: true },
      { value: "1002", label: "Module 2 — Components, Props and State", disabled: false },
      { value: "1003", label: "Module 3 — Hooks and Routing", disabled: false },
    ]);
  });

  it("schedules the next eligible module", async () => {
    const dialog = await openWith("10", "20");
    set(dialog, /^Module/, "1002");
    fillRest(dialog);
    fireEvent.submit(dialog);
    await waitFor(() => expect(liveClassService.create).toHaveBeenCalledTimes(1));
    expect(liveClassService.create.mock.calls[0][0]).toMatchObject({ courseId: 10, batchId: 20 });
  });

  it("rejects a completed module on submit instead of sending the request", async () => {
    const dialog = await openWith("10", "21");
    set(dialog, /^Module/, "1001");
    expect(field(dialog, /^Module/)).toHaveValue("1001");
    fillRest(dialog);
    // The mentor switches to the batch where Module 1 is done: it is cleared.
    set(dialog, /^Batch/, "20");
    expect(field(dialog, /^Module/)).toHaveValue("");
    fireEvent.submit(dialog);
    expect(await within(dialog).findByText("Select a module.")).toBeTruthy();
    expect(liveClassService.create).not.toHaveBeenCalled();
  });

  it("keeps the same module available in a batch where it is not completed", async () => {
    const dialog = await openWith("10", "21");
    expect(moduleOptions(dialog).every((option) => !option.disabled)).toBe(true);
    expect(moduleOptions(dialog)[0].label).toBe("Module 1 — React.js Fundamentals");
  });

  it("refreshes completion when the batch or course changes", async () => {
    const dialog = await openWith("10", "21");
    expect(moduleOptions(dialog)[0].disabled).toBe(false);
    set(dialog, /^Batch/, "20");
    expect(moduleOptions(dialog)[0].disabled).toBe(true);

    set(dialog, /^Course/, "11");
    await waitFor(() => expect(moduleOptions(dialog).map((option) => option.value)).toEqual(["1101"]));
    expect(field(dialog, /^Batch/)).toHaveValue("");
    expect(moduleOptions(dialog)[0].disabled).toBe(false);
    set(dialog, /^Batch/, "22");
    expect(courseService.getSyllabus).toHaveBeenLastCalledWith("11");
  });

  it("disables the dropdown and explains when every module is completed", async () => {
    const dialog = await openWith("11", "22");
    expect(field(dialog, /^Module/)).toBeDisabled();
    expect(within(dialog).getByRole("option", { name: "All modules completed for this batch" })).toBeTruthy();
    fillRest(dialog);
    fireEvent.submit(dialog);
    expect(await within(dialog).findByText("All modules completed for this batch.")).toBeTruthy();
    expect(liveClassService.create).not.toHaveBeenCalled();
  });

  it("marks nothing completed when the syllabus has no batch completion records (today's API)", async () => {
    courseService.getSyllabus.mockResolvedValue({ modules: [{ moduleId: 1001, moduleNumber: 1, moduleName: "React.js Fundamentals", progress: 100, topics: [{ topicId: 1, isCompleted: true }] }] });
    const dialog = await openWith("10", "20");
    expect(moduleOptions(dialog)).toEqual([{ value: "1001", label: "Module 1 — React.js Fundamentals", disabled: false }]);
    // Unknown completion is reported, not silently treated as "not completed".
    expect(within(dialog).getByText(/completion can.t be verified for this batch/i)).toBeTruthy();
  });

  it("reports unverified completion when only some modules have a record for the batch", async () => {
    const dialog = await openWith("10", "20");
    expect(within(dialog).getByText(/completion can.t be verified for this batch/i)).toBeTruthy();
  });

  it("shows no verification error when every module has a record for the batch", async () => {
    courseService.getSyllabus.mockResolvedValue({ modules: [
      { moduleId: 1001, moduleNumber: 1, moduleName: "React.js Fundamentals", batchProgress: [{ batchId: 21, isCompleted: true }] },
      { moduleId: 1002, moduleNumber: 2, moduleName: "Components, Props and State", batchProgress: [{ batchId: 21, isCompleted: false }] },
    ] });
    const dialog = await openWith("10", "21");
    expect(moduleOptions(dialog).map((option) => option.disabled)).toEqual([true, false]);
    expect(within(dialog).queryByText(/completion can.t be verified/i)).toBeNull();
  });
});

describe("module loading states do not crash the form", () => {
  it("shows loading while the syllabus is fetched", async () => {
    courseService.getSyllabus.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(field(dialog, /^Course/)).not.toBeDisabled());
    set(dialog, /^Course/, "10");
    expect(await within(dialog).findByRole("option", { name: "Loading modules…" })).toBeTruthy();
    set(dialog, /^Batch/, "20");
    expect(field(dialog, /^Module/)).toBeDisabled();
  });

  it("shows an error when the syllabus request fails", async () => {
    courseService.getSyllabus.mockRejectedValue(Object.assign(new Error("boom"), { response: { status: 500 } }));
    const dialog = await openWith("10", "20");
    expect(within(dialog).getByRole("option", { name: "Couldn't load modules" })).toBeTruthy();
    expect(field(dialog, /^Module/)).toBeDisabled();
  });

  it("shows the empty state for a course without modules", async () => {
    courseService.getSyllabus.mockResolvedValue({ modules: [] });
    const dialog = await openWith("10", "20");
    expect(within(dialog).getByRole("option", { name: "No modules in this course" })).toBeTruthy();
    // The backend requires a moduleId, so the class cannot be scheduled.
    fireEvent.submit(dialog);
    expect(await within(dialog).findByText("This course has no syllabus modules. Add one before scheduling.")).toBeTruthy();
    expect(liveClassService.create).not.toHaveBeenCalled();
  });
});

describe("helpers", () => {
  it("reads only explicit batch-tagged completion", () => {
    const options = toSyllabusModuleOptions({ modules: [
      { moduleId: 1, moduleName: "A", batchProgress: [{ batchId: 5, isCompleted: true }, { batchId: 6, isCompleted: "yes" }, { isCompleted: true }] },
      { moduleId: 2, moduleName: "B", isCompleted: true, progress: 100 },
    ] });
    expect(options[0].completedBatchIds).toEqual(["5"]);
    expect(options[1]).not.toHaveProperty("completedBatchIds");
    expect(modulesForBatch({ status: "ready", options }, "6").options.some((option) => option.completed)).toBe(false);
    expect(modulesForBatch({ status: "ready", options }, "").options.some((option) => option.completed)).toBe(false);
    expect(modulesForBatch({ status: "ready", options }, 5).options[0].completed).toBe(true);
  });
});
