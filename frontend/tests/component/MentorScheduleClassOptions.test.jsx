import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MentorCalendar from "../../src/features/mentor/pages/MentorCalendar";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { getMentorDashboardBatches, getMentorDashboardCourses } from "../../src/shared/services/mentorService";
import { toLiveClassRequest } from "../../src/features/live-classes/api/liveClassApi";
import { LIVE_CLASS_STATUS_OPTIONS, MEETING_PLATFORM_OPTIONS, getMeetingPlatformLabel } from "../../src/features/live-classes/utils/liveClassOptions";

vi.mock("../../src/features/live-classes/services/liveClassService", () => ({
  liveClassService: { dropdowns: vi.fn(), list: vi.fn(), create: vi.fn() },
}));
// The scheduler loads the selected course's syllabus modules; this course has one.
vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getSyllabus: vi.fn().mockResolvedValue({ modules: [{ moduleId: 501, moduleNumber: 1, moduleName: "Intro" }] }) },
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

beforeEach(() => {
  vi.clearAllMocks();
  // Courses and batches come from the mentor-scoped dashboard endpoints.
  getMentorDashboardCourses.mockResolvedValue([{ courseId: 10, courseName: "React" }]);
  getMentorDashboardBatches.mockResolvedValue([{ batchId: 20, batchName: "React Morning", courseId: 10, mentorId: 7 }]);
  // Exact shapes returned by the live backend's dropdown endpoints.
  liveClassService.dropdowns.mockResolvedValue({
    courses: [],
    batches: [],
    mentors: [],
    platforms: [{ id: 1, platformName: "Zoom" }, { id: 2, platformName: "Google Meet" }, { id: 3, platformName: "Microsoft Teams" }],
    statuses: [{ id: 1, statusName: "Scheduled" }, { id: 2, statusName: "Live" }, { id: 3, statusName: "Completed" }, { id: 4, statusName: "Cancelled" }],
  });
  liveClassService.list.mockResolvedValue([]);
  liveClassService.create.mockResolvedValue({ liveClassId: 900 });
});
afterEach(cleanup);

const openDialog = async () => {
  render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(liveClassService.dropdowns).toHaveBeenCalled());
  await waitFor(() => expect(within(dialog).getByRole("option", { name: "React" })).toBeTruthy());
  return dialog;
};

const optionLabels = (select) => Array.from(select.options).map((option) => option.textContent);

it("shows the same readable platform and status labels as the Organization form, never ids", async () => {
  const dialog = await openDialog();
  const platform = within(dialog).getByLabelText(/Meeting Platform/);
  const status = within(dialog).getByLabelText(/^Status/);

  expect(optionLabels(platform)).toEqual(["Select platform", ...MEETING_PLATFORM_OPTIONS.map((option) => option.name)]);
  expect(optionLabels(platform)).toEqual(["Select platform", "Zoom", "Google Meet", "Microsoft Teams", "YouTube Live", "Jitsi"]);
  expect(optionLabels(status)).toEqual(LIVE_CLASS_STATUS_OPTIONS.map((option) => option.name));
  expect(optionLabels(status)).toEqual(["Scheduled", "Live", "Completed", "Cancelled"]);
});

it("submits the platform label (as the Organization form does) and sends no status to the backend DTO", async () => {
  const dialog = await openDialog();
  const set = (label, value) => fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
  set(/^Course/, "10");
  // Wait for the course's module list, as a mentor would.
  await waitFor(() => expect(within(dialog).getByRole("option", { name: /Module 1 — Intro/ })).toBeTruthy());
  set(/^Batch/, "20");
  set(/^Module/, "501");
  set(/Class Title/, "Hooks deep dive");
  set(/^Date/, "2026-10-07");
  set(/Start Time/, "15:00");
  set(/End Time/, "16:00");
  set(/Meeting Platform/, "Google Meet");
  set(/Meeting URL/, "https://meet.google.com/abc-defg-hij");
  fireEvent.submit(dialog);

  await waitFor(() => expect(liveClassService.create).toHaveBeenCalledTimes(1));
  const payload = liveClassService.create.mock.calls[0][0];
  expect(payload.meetingPlatform).toBe("Google Meet");
  expect(payload.status).toBe("scheduled");

  // What actually goes over the wire — identical to the Organization path,
  // which submits getMeetingPlatformLabel(2) for the same choice.
  const request = toLiveClassRequest(payload);
  expect(request.meetingPlatform).toBe(getMeetingPlatformLabel(2));
  expect(request).not.toHaveProperty("status");
  expect(request).toMatchObject({ courseId: 10, batchId: 20, moduleId: 501, scheduledDate: "2026-10-07", startTime: "15:00:00", endTime: "16:00:00" });
});
