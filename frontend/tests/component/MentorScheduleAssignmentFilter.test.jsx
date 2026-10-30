import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MentorCalendar from "../../src/features/mentor/pages/MentorCalendar";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { toLiveClassRequest } from "../../src/features/live-classes/api/liveClassApi";
import { getMentorDashboardBatches, getMentorDashboardCourses } from "../../src/shared/services/mentorService";
import { batchesForCourse, normalizeMentorBatches, normalizeMentorCourses } from "../../src/features/mentor/utils/mentorScheduleOptions";

vi.mock("../../src/features/live-classes/services/liveClassService", () => ({
  liveClassService: { dropdowns: vi.fn(), list: vi.fn(), create: vi.fn() },
}));
vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getSyllabus: vi.fn().mockResolvedValue({ modules: [{ moduleId: 501, moduleNumber: 1, moduleName: "Intro" }] }) },
}));
vi.mock("../../src/shared/services/mentorService", () => ({
  getMentorDashboardBatches: vi.fn(),
  getMentorDashboardClasses: vi.fn().mockResolvedValue([]),
  getMentorDashboardCourses: vi.fn(),
}));
const session = vi.hoisted(() => ({ user: null }));
vi.mock("../../src/shared/hooks/useAuth", () => ({ useAuth: () => ({ user: session.user }) }));
vi.mock("../../src/pages/schedule/SchedulePage", () => ({
  default: ({ onScheduleClass }) => <button type="button" onClick={onScheduleClass}>Open scheduler</button>,
}));
vi.mock("../../src/features/mentor/pages/MentorLiveClasses", () => ({ default: () => null }));
vi.mock("../../src/features/mentor/pages/MentorRecordedSessions", () => ({ default: () => null }));

const MENTOR_A = { userId: 101, mentorId: 7, role: "Mentor", fullName: "Asha Rao" };
const MENTOR_B = { userId: 202, mentorId: 8, role: "Mentor", fullName: "Bala Iyer" };

// What the JWT-scoped mentor endpoints return for each mentor.
const assignments = {
  7: {
    courses: [{ courseId: 10, courseName: "React" }, { courseId: 11, courseName: "Node" }],
    batches: [
      { batchId: 20, batchName: "React Morning", courseId: 10, courseName: "React", mentorId: 7 },
      { batchId: 21, batchName: "React Evening", courseId: 10, courseName: "React", mentorId: 7 },
      { batchId: 22, batchName: "Node Weekend", courseId: 11, courseName: "Node", mentorId: 7 },
    ],
  },
  8: {
    courses: [{ courseId: 30, courseName: "Python" }],
    batches: [{ batchId: 40, batchName: "Python Morning", courseId: 30, courseName: "Python", mentorId: 8 }],
  },
};
// The organization dropdowns list everyone's courses and batches.
const organizationDropdowns = {
  courses: [{ id: 10, name: "React" }, { id: 11, name: "Node" }, { id: 30, name: "Python" }, { id: 31, name: "Go" }],
  batches: [{ id: 20, name: "React Morning" }, { id: 40, name: "Python Morning" }, { id: 41, name: "Go Night" }],
  mentors: [],
  platforms: [],
  statuses: [],
};

const signIn = (user) => {
  session.user = user;
  getMentorDashboardCourses.mockResolvedValue(assignments[user.mentorId].courses);
  getMentorDashboardBatches.mockResolvedValue(assignments[user.mentorId].batches);
};

beforeEach(() => {
  vi.clearAllMocks();
  signIn(MENTOR_A);
  liveClassService.dropdowns.mockResolvedValue(organizationDropdowns);
  liveClassService.list.mockResolvedValue([]);
  liveClassService.create.mockResolvedValue({ liveClassId: 900 });
});
afterEach(cleanup);

const openDialog = async () => {
  render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
  return screen.findByRole("dialog");
};
const field = (dialog, label) => within(dialog).getByLabelText(label);
const options = (select) => Array.from(select.options).filter((option) => option.value).map((option) => [option.value, option.textContent]);
const waitForCourses = (dialog) => waitFor(() => expect(field(dialog, /^Course/)).not.toBeDisabled());

describe("mentor-scoped course and batch options", () => {
  it("shows Mentor A only A's assigned courses and the selected course's batches", async () => {
    const dialog = await openDialog();
    await waitForCourses(dialog);

    expect(options(field(dialog, /^Course/))).toEqual([["10", "React"], ["11", "Node"]]);
    fireEvent.change(field(dialog, /^Course/), { target: { value: "10" } });
    // Batch rows carry courseId too; the option is the batch, never the course.
    expect(options(field(dialog, /^Batch/))).toEqual([["20", "React Morning"], ["21", "React Evening"]]);
    expect(within(dialog).queryByRole("option", { name: "Python" })).toBeNull();
    expect(within(dialog).queryByRole("option", { name: "Go" })).toBeNull();
    expect(within(dialog).queryByRole("option", { name: "Go Night" })).toBeNull();
  });

  it("never shows Mentor B's courses or batches to Mentor A, even when a row leaks through", async () => {
    getMentorDashboardBatches.mockResolvedValue([
      ...assignments[7].batches,
      { batchId: 40, batchName: "Python Morning", courseId: 30, courseName: "Python", mentorId: 8 },
    ]);
    getMentorDashboardCourses.mockResolvedValue([...assignments[7].courses, { courseId: 30, courseName: "Python", mentorId: 8 }]);
    const dialog = await openDialog();
    await waitForCourses(dialog);

    expect(options(field(dialog, /^Course/)).map(([id]) => id)).toEqual(["10", "11"]);
    expect(within(dialog).queryByRole("option", { name: "Python Morning" })).toBeNull();
  });

  it("shows Mentor B only B's courses and batches", async () => {
    signIn(MENTOR_B);
    const dialog = await openDialog();
    await waitForCourses(dialog);

    expect(options(field(dialog, /^Course/))).toEqual([["30", "Python"]]);
    fireEvent.change(field(dialog, /^Course/), { target: { value: "30" } });
    expect(options(field(dialog, /^Batch/))).toEqual([["40", "Python Morning"]]);
    expect(within(dialog).queryByRole("option", { name: "React" })).toBeNull();
    expect(within(dialog).queryByRole("option", { name: "React Morning" })).toBeNull();
  });

  it("clears a batch that does not belong to the newly selected course", async () => {
    const dialog = await openDialog();
    await waitForCourses(dialog);
    fireEvent.change(field(dialog, /^Course/), { target: { value: "10" } });
    fireEvent.change(field(dialog, /^Batch/), { target: { value: "21" } });
    expect(field(dialog, /^Batch/)).toHaveValue("21");

    fireEvent.change(field(dialog, /^Course/), { target: { value: "11" } });
    expect(field(dialog, /^Batch/)).toHaveValue("");
    expect(options(field(dialog, /^Batch/))).toEqual([["22", "Node Weekend"]]);
  });

  it("gives one option per course and batch when records repeat with string and number ids", async () => {
    getMentorDashboardCourses.mockResolvedValue({ data: { courses: [
      { courseId: 10, courseName: "React" }, { courseId: "10", courseName: "React" }, { id: 11, name: "Node" },
    ] } });
    getMentorDashboardBatches.mockResolvedValue({ items: [
      ...assignments[7].batches,
      { batchId: "20", batchName: "React Morning", courseId: "10", courseName: "React", mentorId: "7" },
      { batchId: 20, batchName: "React Morning", courseId: 10, courseName: "React", mentorId: 7 },
    ] });
    const dialog = await openDialog();
    await waitForCourses(dialog);

    expect(options(field(dialog, /^Course/))).toEqual([["10", "React"], ["11", "Node"]]);
    fireEvent.change(field(dialog, /^Course/), { target: { value: "10" } });
    expect(options(field(dialog, /^Batch/))).toEqual([["20", "React Morning"], ["21", "React Evening"]]);
  });

  it("sends the selected courseId, batchId and the session mentorId", async () => {
    const dialog = await openDialog();
    await waitForCourses(dialog);
    // The Mentor field is the signed-in mentor and cannot be edited.
    expect(within(dialog).getByDisplayValue("Asha Rao")).toHaveAttribute("readonly");
    const set = (label, value) => fireEvent.change(field(dialog, label), { target: { value } });
    set(/^Course/, "10");
    await waitFor(() => expect(within(dialog).getByRole("option", { name: /Module 1 — Intro/ })).toBeTruthy());
    set(/^Batch/, "21");
    set(/^Module/, "501");
    set(/Class Title/, "State machines");
    set(/^Date/, "2026-11-02");
    set(/Start Time/, "10:00");
    set(/End Time/, "11:00");
    set(/Meeting Platform/, "Zoom");
    set(/Meeting URL/, "https://zoom.us/j/555");
    fireEvent.submit(dialog);

    await waitFor(() => expect(liveClassService.create).toHaveBeenCalledTimes(1));
    const payload = liveClassService.create.mock.calls[0][0];
    expect(payload).toMatchObject({ courseId: 10, batchId: 21, mentorId: 7 });
    // CreateLiveClassDto has no mentorId (additionalProperties: false): the
    // backend takes the mentor from the JWT, so the wire body omits it.
    const request = toLiveClassRequest(payload);
    expect(request).toMatchObject({ courseId: 10, batchId: 21, moduleId: 501 });
    expect(request).not.toHaveProperty("mentorId");
  });
});

describe("loading, error and empty states", () => {
  it("shows loading while the mentor's assignments are fetched", async () => {
    getMentorDashboardCourses.mockReturnValue(new Promise(() => {}));
    getMentorDashboardBatches.mockReturnValue(new Promise(() => {}));
    const dialog = await openDialog();

    expect(field(dialog, /^Course/)).toBeDisabled();
    expect(within(dialog).getByRole("option", { name: "Loading your courses…" })).toBeTruthy();
    expect(within(dialog).queryByText(/no course or batch assignments/i)).toBeNull();
  });

  it("shows an error, not an empty list, when assignments cannot be loaded", async () => {
    getMentorDashboardCourses.mockRejectedValue(new Error("boom"));
    getMentorDashboardBatches.mockRejectedValue(new Error("boom"));
    const dialog = await openDialog();

    expect(await within(dialog).findByRole("option", { name: "Couldn't load your courses" })).toBeTruthy();
    expect(within(dialog).getByText(/could not be loaded/i)).toBeTruthy();
    expect(within(dialog).queryByText(/no course or batch assignments/i)).toBeNull();
    expect(field(dialog, /^Course/)).toBeDisabled();
  });

  it("shows the empty state when the mentor has no assignments, and never falls back to organization data", async () => {
    getMentorDashboardCourses.mockResolvedValue([]);
    getMentorDashboardBatches.mockResolvedValue([]);
    const dialog = await openDialog();

    expect(await within(dialog).findByRole("option", { name: "No courses assigned to you" })).toBeTruthy();
    expect(within(dialog).getByText(/no course or batch assignments/i)).toBeTruthy();
    expect(within(dialog).queryByRole("option", { name: "React" })).toBeNull();
    expect(field(dialog, /^Course/)).toBeDisabled();

    fireEvent.submit(dialog);
    expect(await within(dialog).findByText("Select a course.")).toBeTruthy();
    expect(liveClassService.create).not.toHaveBeenCalled();
  });
});

describe("mentorScheduleOptions helpers", () => {
  it("never offers a batch that names no course", () => {
    const batches = normalizeMentorBatches([{ batchId: 5, batchName: "Orphan" }, { batchId: 6, batchName: "By name", courseName: "React" }], ["7"]);
    const courses = normalizeMentorCourses([{ courseId: 10, courseName: "React" }], batches, ["7"]);
    expect(batchesForCourse(batches, courses[0]).map((batch) => batch.id)).toEqual(["6"]);
    expect(batchesForCourse(batches, undefined)).toEqual([]);
  });

  it("derives a course from an assigned batch when the courses endpoint omits it", () => {
    const batches = normalizeMentorBatches([{ batchId: 9, batchName: "Go Night", courseId: 31, courseName: "Go" }]);
    expect(normalizeMentorCourses([], batches)).toEqual([{ id: "31", name: "Go" }]);
  });
});
