import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import MentorCalendar from "../../src/features/mentor/pages/MentorCalendar";
import apiClient from "../../src/shared/services/apiClient";
import { liveClassApi, toLiveClassRequest } from "../../src/features/live-classes/api/liveClassApi";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { getMentorDashboardBatches, getMentorDashboardCourses } from "../../src/shared/services/mentorService";
import {
  LIVE_CLASS_CREATE_FAILED,
  LIVE_CLASS_NETWORK_FAILED,
  liveClassFieldErrors,
  liveClassSaveErrorMessage,
} from "../../src/features/live-classes/utils/liveClassSaveError";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../../src/shared/services/apiClient", () => ({ default: { post: vi.fn(), get: vi.fn(), put: vi.fn() } }));
vi.mock("../../src/features/live-classes/services/liveClassService", async (importOriginal) => {
  const actual = await importOriginal();
  return { liveClassService: { ...actual.liveClassService, dropdowns: vi.fn(), list: vi.fn(), create: vi.fn() } };
});
vi.mock("../../src/shared/services/courseService", () => ({
  courseService: { getSyllabus: vi.fn().mockResolvedValue({ modules: [{ moduleId: 6, moduleNumber: 1, moduleName: "Intro" }] }) },
}));
vi.mock("../../src/shared/services/mentorService", () => ({
  getMentorDashboardBatches: vi.fn(),
  getMentorDashboardClasses: vi.fn().mockResolvedValue([]),
  getMentorDashboardCourses: vi.fn(),
}));
vi.mock("../../src/shared/hooks/useAuth", () => ({
  useAuth: () => ({ user: { userId: 7, mentorId: 7, role: "Mentor", fullName: "Asha Rao" } }),
}));
vi.mock("../../src/pages/schedule/SchedulePage", () => ({
  default: ({ onScheduleClass }) => <button type="button" onClick={onScheduleClass}>Open scheduler</button>,
}));
vi.mock("../../src/features/mentor/pages/MentorLiveClasses", () => ({ default: () => null }));
vi.mock("../../src/features/mentor/pages/MentorRecordedSessions", () => ({ default: () => null }));

// The exact response the backend returned for a correct create request.
const NULL_REFERENCE_409 = {
  response: { status: 409, data: { success: false, message: "Object reference not set to an instance of an object." } },
};

// What the Mentor Calendar hands to liveClassService.create for the reported class.
const FORM_PAYLOAD = {
  classTitle: "react js",
  description: "",
  courseId: 1,
  batchId: 4,
  moduleId: 6,
  mentorId: 7,
  meetingPlatform: "Jitsi",
  meetingLink: "https://meet.jit.si/reactjs2",
  meetingId: "",
  meetingPassword: "",
  scheduledDate: "2026-10-26",
  startTime: "10:00:00",
  endTime: "10:05:00",
  status: "scheduled",
  recordingEnabled: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  getMentorDashboardCourses.mockResolvedValue([{ courseId: 1, courseName: "React" }]);
  getMentorDashboardBatches.mockResolvedValue([{ batchId: 4, batchName: "React Morning", courseId: 1, mentorId: 7 }]);
  liveClassService.dropdowns.mockResolvedValue({ courses: [], batches: [], mentors: [], platforms: [], statuses: [] });
  liveClassService.list.mockResolvedValue([]);
});
afterEach(cleanup);

describe("create request mapping", () => {
  it("keeps moduleId, the course/batch ids, recordingEnabled=false and the documented date/time format", () => {
    expect(toLiveClassRequest(FORM_PAYLOAD)).toEqual({
      classTitle: "react js",
      description: null,
      courseId: 1,
      batchId: 4,
      moduleId: 6,
      scheduledDate: "2026-10-26",
      startTime: "10:00:00",
      endTime: "10:05:00",
      meetingPlatform: "Jitsi",
      meetingLink: "https://meet.jit.si/reactjs2",
      meetingPassword: "",
      recordingEnabled: false,
    });
  });

  it("converts string ids and HH:mm times without producing NaN", () => {
    const request = toLiveClassRequest({ ...FORM_PAYLOAD, courseId: "1", batchId: "4", moduleId: "6", startTime: "10:00", endTime: "10:05" });
    expect(request).toMatchObject({ courseId: 1, batchId: 4, moduleId: 6, startTime: "10:00:00", endTime: "10:05:00" });
    expect(toLiveClassRequest({ ...FORM_PAYLOAD, moduleId: "abc" })).not.toHaveProperty("moduleId", NaN);
    expect(toLiveClassRequest({ ...FORM_PAYLOAD, moduleId: "abc" }).moduleId).toBeUndefined();
  });

  it("posts the DTO fields only, keeping moduleId and recordingEnabled=false on the wire", async () => {
    apiClient.post.mockResolvedValue({ data: { success: true, data: { liveClassId: 55 } } });
    await liveClassApi.create(FORM_PAYLOAD);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/live-classes");
    expect(body).toEqual({
      classTitle: "react js",
      description: null,
      courseId: 1,
      batchId: 4,
      moduleId: 6,
      scheduledDate: "2026-10-26",
      startTime: "10:00:00",
      endTime: "10:05:00",
      meetingPlatform: "Jitsi",
      meetingLink: "https://meet.jit.si/reactjs2",
      recordingEnabled: false,
    });
  });

  it("rejects (never resolves) and posts once when the server answers 409", async () => {
    apiClient.post.mockRejectedValue(NULL_REFERENCE_409);
    await expect(liveClassApi.create(FORM_PAYLOAD)).rejects.toBe(NULL_REFERENCE_409);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });
});

describe("save error messages", () => {
  it("shows a server exception on 409 as a create failure with no field errors", () => {
    expect(liveClassSaveErrorMessage(NULL_REFERENCE_409)).toBe(LIVE_CLASS_CREATE_FAILED);
    expect(liveClassFieldErrors(NULL_REFERENCE_409)).toEqual({});
  });

  it("never shows a 5xx body, and gives network failures their own message", () => {
    expect(liveClassSaveErrorMessage({ response: { status: 500, data: { message: "at Kini.Api.LiveClassService.Create()" } } })).toBe(LIVE_CLASS_CREATE_FAILED);
    expect(liveClassSaveErrorMessage({ code: "ERR_NETWORK", message: "Network Error" })).toBe(LIVE_CLASS_NETWORK_FAILED);
  });

  it("keeps a readable 409 conflict message", () => {
    const conflict = { response: { status: 409, data: { message: "This batch already has a class at that time." } } };
    expect(liveClassSaveErrorMessage(conflict)).toBe("This batch already has a class at that time.");
  });

  it("maps 400 validation errors onto their camelCase fields", () => {
    const invalid = { response: { status: 400, data: { errors: { ModuleId: ["The field ModuleId must be between 1 and 2147483647."], "$.startTime": ["Invalid time."] } } } };
    expect(liveClassFieldErrors(invalid)).toEqual({ moduleId: "The field ModuleId must be between 1 and 2147483647.", startTime: "Invalid time." });
  });
});

describe("Mentor Calendar submit", () => {
  const fillAndSubmit = async () => {
    render(<MemoryRouter><MentorCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Open scheduler" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("option", { name: "React" })).toBeTruthy());
    const set = (label, value) => fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
    set(/^Course/, "1");
    await waitFor(() => expect(within(dialog).getByRole("option", { name: /Module 1 — Intro/ })).toBeTruthy());
    set(/^Batch/, "4");
    set(/^Module/, "6");
    set(/Class Title/, "react js");
    set(/^Date/, "2026-10-26");
    set(/Start Time/, "10:00");
    set(/End Time/, "10:05");
    set(/Meeting Platform/, "Jitsi");
    set(/Meeting URL/, "https://meet.jit.si/reactjs2");
    fireEvent.submit(dialog);
    return dialog;
  };

  it("sends the selected ids, moduleId and recordingEnabled=false, and reports success", async () => {
    liveClassService.create.mockResolvedValue({ liveClassId: 900 });
    await fillAndSubmit();
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Class scheduled successfully"));
    expect(liveClassService.create).toHaveBeenCalledTimes(1);
    expect(toLiveClassRequest(liveClassService.create.mock.calls[0][0])).toEqual({
      classTitle: "react js",
      description: null,
      courseId: 1,
      batchId: 4,
      moduleId: 6,
      scheduledDate: "2026-10-26",
      startTime: "10:00:00",
      endTime: "10:05:00",
      meetingPlatform: "Jitsi",
      meetingLink: "https://meet.jit.si/reactjs2",
      meetingPassword: "",
      recordingEnabled: false,
    });
  });

  it("shows the 409 null-reference failure as a create failure, keeps the dialog open and marks no field", async () => {
    liveClassService.create.mockRejectedValue(NULL_REFERENCE_409);
    const dialog = await fillAndSubmit();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(LIVE_CLASS_CREATE_FAILED));
    expect(toast.error).not.toHaveBeenCalledWith("Check the highlighted fields.");
    expect(toast.success).not.toHaveBeenCalled();
    expect(liveClassService.create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(dialog.querySelectorAll('[aria-invalid="true"]').length).toBe(0);
    expect(within(dialog).queryByText(/Object reference/)).toBeNull();
  });
});
