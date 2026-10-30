import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MentorCalendar from "../../src/features/mentor/pages/MentorCalendar";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { getMentorDashboardBatches, getMentorDashboardCourses } from "../../src/shared/services/mentorService";
import { courseService } from "../../src/shared/services/courseService";
import { toLiveClassRequest } from "../../src/features/live-classes/api/liveClassApi";

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
  useAuth: () => ({ user: { userId: 7, mentorId: 7, role: "Mentor", fullName: "Asha Rao" } }),
}));
// Only the scheduler is under test; the heavy embedded pages are stubbed.
vi.mock("../../src/pages/schedule/SchedulePage", () => ({
  default: ({ onScheduleClass }) => <button type="button" onClick={onScheduleClass}>Open scheduler</button>,
}));
vi.mock("../../src/features/mentor/pages/MentorLiveClasses", () => ({ default: () => null }));
vi.mock("../../src/features/mentor/pages/MentorRecordedSessions", () => ({ default: () => null }));

const syllabusFor = (courseId) => ({
  modules: [1, 2].map((n) => ({ moduleId: Number(courseId) * 100 + n, moduleNumber: n, moduleName: `Unit ${n} of ${courseId}`, topics: [] })),
});

beforeEach(() => {
  vi.clearAllMocks();
  getMentorDashboardCourses.mockResolvedValue([{ courseId: 10, courseName: "React" }, { courseId: 11, courseName: "Node" }]);
  getMentorDashboardBatches.mockResolvedValue([{ batchId: 20, batchName: "React Morning", courseId: 10, mentorId: 7 }, { batchId: 21, batchName: "Node Evening", courseId: 11, mentorId: 7 }]);
  liveClassService.dropdowns.mockResolvedValue({
    courses: [],
    batches: [],
    mentors: [],
    platforms: [{ id: 1, platformName: "Zoom" }],
    statuses: [{ id: 1, statusName: "Scheduled" }],
  });
  liveClassService.list.mockResolvedValue([]);
  liveClassService.create.mockResolvedValue({ liveClassId: 900 });
  courseService.getSyllabus.mockImplementation(async (courseId) => syllabusFor(courseId));
});
afterEach(cleanup);

const openDialog = async () => {
  render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(within(dialog).getByRole("option", { name: "React" })).toBeTruthy());
  return dialog;
};
const field = (dialog, label) => within(dialog).getByLabelText(label);

it("keeps focus in Class Title while typing (regression: focus jumped to Course after one character)", async () => {
  const user = userEvent.setup();
  const dialog = await openDialog();
  fireEvent.change(field(dialog, /^Course/), { target: { value: "10" } });
  const title = field(dialog, /Class Title/);

  await user.click(title);
  await user.type(title, "React JS Module 1 - Introduction");

  expect(title).toHaveValue("React JS Module 1 - Introduction");
  expect(document.activeElement).toBe(title);
  expect(field(dialog, /^Course/)).toHaveValue("10");
});

it("starts with recording off and sends the backend's recordingEnabled field", async () => {
  const dialog = await openDialog();
  const recording = within(dialog).getByRole("switch");
  expect(recording).not.toBeChecked();

  const set = (label, value) => fireEvent.change(field(dialog, label), { target: { value } });
  set(/^Course/, "10");
  await waitFor(() => expect(within(field(dialog, /^Module/)).getByRole("option", { name: /Unit 1 of 10/ })).toBeTruthy());
  set(/^Batch/, "20");
  set(/^Module/, "1001");
  set(/Class Title/, "Hooks deep dive");
  set(/^Date/, "2026-10-07");
  set(/Start Time/, "15:00");
  set(/End Time/, "16:00");
  set(/Meeting Platform/, "Zoom");
  set(/Meeting URL/, "https://zoom.us/j/123");
  fireEvent.submit(dialog);

  await waitFor(() => expect(liveClassService.create).toHaveBeenCalledTimes(1));
  const request = toLiveClassRequest(liveClassService.create.mock.calls[0][0]);
  expect(request.recordingEnabled).toBe(false);
  // The backend requires the syllabus moduleId (≥ 1) as a number.
  expect(request.moduleId).toBe(1001);
  expect(liveClassService.create.mock.calls[0][0].moduleId).toBe(1001);
});

it("lists only the selected course's modules, requires one, and clears it when the course changes", async () => {
  const dialog = await openDialog();
  const moduleSelect = field(dialog, /^Module/);
  expect(moduleSelect).toBeDisabled();

  fireEvent.change(field(dialog, /^Course/), { target: { value: "10" } });
  await waitFor(() => expect(moduleSelect).not.toBeDisabled());
  const values = Array.from(moduleSelect.options).map((option) => option.value).filter(Boolean);
  expect(values).toEqual(["1001", "1002"]);

  // Submitting without a module shows the message beside it, keeping other values.
  fireEvent.change(field(dialog, /Class Title/), { target: { value: "Keep me" } });
  fireEvent.submit(dialog);
  expect(await within(dialog).findByText("Select a module.")).toBeTruthy();
  expect(field(dialog, /Class Title/)).toHaveValue("Keep me");
  expect(liveClassService.create).not.toHaveBeenCalled();

  fireEvent.change(moduleSelect, { target: { value: "1002" } });
  fireEvent.change(field(dialog, /^Course/), { target: { value: "11" } });
  await waitFor(() => expect(Array.from(field(dialog, /^Module/).options).map((option) => option.value).filter(Boolean)).toEqual(["1101", "1102"]));
  expect(field(dialog, /^Module/)).toHaveValue("");
  // Batches follow the course too.
  expect(Array.from(field(dialog, /^Batch/).options).map((option) => option.value).filter(Boolean)).toEqual(["21"]);
});

it("lets the mentor turn recording on, which is then sent", async () => {
  const dialog = await openDialog();
  const recording = within(dialog).getByRole("switch");
  fireEvent.click(recording);
  expect(recording).toBeChecked();

  const set = (label, value) => fireEvent.change(field(dialog, label), { target: { value } });
  set(/^Course/, "10");
  await waitFor(() => expect(field(dialog, /^Module/)).not.toBeDisabled());
  set(/^Batch/, "20");
  set(/^Module/, "1001");
  set(/Class Title/, "Recorded session");
  set(/^Date/, "2026-10-07");
  set(/Start Time/, "15:00");
  set(/End Time/, "16:00");
  set(/Meeting Platform/, "Zoom");
  set(/Meeting URL/, "https://zoom.us/j/123");
  fireEvent.submit(dialog);

  await waitFor(() => expect(liveClassService.create).toHaveBeenCalledTimes(1));
  expect(toLiveClassRequest(liveClassService.create.mock.calls[0][0]).recordingEnabled).toBe(true);
});
