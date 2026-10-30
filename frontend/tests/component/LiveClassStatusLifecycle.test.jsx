import { act, cleanup, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLiveClassLifecycleStatus,
  getStudentJoinState,
  isLiveClassClosed,
  normalizeLiveClass,
  normalizeLiveClassList,
} from "../../src/features/live-classes/utils/liveClassMappers";
import { parseDateTime } from "../../src/features/live-classes/utils/dateUtils";
import { liveClassService } from "../../src/features/live-classes/services/liveClassService";
import { jitsiAttendanceService } from "../../src/shared/services/jitsiAttendanceService";
import { loadJitsiScript } from "../../src/shared/utils/loadJitsiScript";
import useLiveClasses from "../../src/features/live-classes/hooks/useLiveClasses";
import JitsiMeetingModal from "../../src/shared/components/JitsiMeetingModal";

vi.mock("../../src/features/live-classes/services/liveClassService", () => {
  const list = () => vi.fn().mockResolvedValue([]);
  return {
    liveClassService: {
      list: list(), today: list(), upcoming: list(), live: list(), completed: list(),
      dashboard: vi.fn().mockResolvedValue({}),
      dropdowns: vi.fn().mockResolvedValue({ courses: [], batches: [], mentors: [], platforms: [], statuses: [] }),
      getById: vi.fn().mockResolvedValue({}),
      getPdf: vi.fn().mockResolvedValue(null),
      getRecording: vi.fn().mockResolvedValue(null),
      start: vi.fn(), end: vi.fn(), cancel: vi.fn(), join: vi.fn(),
    },
    default: {},
  };
});
vi.mock("../../src/shared/services/batchService", () => ({ batchService: { getAll: vi.fn().mockResolvedValue([]), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../src/shared/services/courseService", () => ({ courseService: { getAll: vi.fn().mockResolvedValue([]), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../src/shared/services/mentorService", () => ({ mentorService: { getAll: vi.fn().mockResolvedValue([]), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../src/shared/hooks/useAuth", () => ({
  useAuth: () => ({ user: { userId: 7, fullName: "Asha Rao", email: "asha@example.com" } }),
}));
vi.mock("../../src/services/profileService", () => ({ resolveUserId: () => 7 }));
vi.mock("../../src/shared/services/jitsiAttendanceService", () => ({
  jitsiAttendanceService: { join: vi.fn(), leave: vi.fn() },
}));
vi.mock("../../src/shared/utils/loadJitsiScript", () => ({ loadJitsiScript: vi.fn() }));

// Exact backend shape (Swagger TalentSphereAPI.Models.LiveClass):
// scheduledDate is a midnight DateTime, start/end are TimeSpans with seconds.
const backendClass = (overrides = {}) => ({
  liveClassId: 501,
  classTitle: "Late Start Regression",
  scheduledDate: "2026-10-05T00:00:00",
  startTime: "15:21:00",
  endTime: "15:30:00",
  meetingPlatform: "Jitsi",
  meetingLink: "https://meet.jit.si/room-501",
  status: "Scheduled",
  ...overrides,
});

const at = (iso) => vi.setSystemTime(new Date(iso));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("backend lifecycle status is the source of truth", () => {
  it("TEST 1: backend Live before the scheduled end → Live", () => {
    at("2026-10-05T15:25:00");
    expect(normalizeLiveClass(backendClass({ status: "Live" })).status).toBe("live");
  });

  it("TEST 2: backend Live after the scheduled end → still Live", () => {
    at("2026-10-05T15:41:00");
    const item = normalizeLiveClass(backendClass({ status: "Live" }));
    expect(item.status).toBe("live");
    expect(item.statusLabel).toBe("Live");
    expect(isLiveClassClosed(backendClass({ status: "Live" }))).toBe(false);
  });

  it("TEST 3: backend Live with a midnight-looking end datetime does not become Completed", () => {
    at("2026-10-05T15:41:00");
    const variants = [
      backendClass({ status: "live" }),
      backendClass({ status: "LIVE", endDate: "2026-10-05T00:00:00", endTime: undefined }),
      backendClass({ status: "Live", endAt: "2026-10-04T00:00:00Z" }),
      backendClass({ status: "Live", endTime: "garbage" }),
    ];
    variants.forEach((row) => expect(normalizeLiveClass(row).status).toBe("live"));
  });

  it("TEST 4: backend Completed → Completed", () => {
    at("2026-10-05T15:22:00");
    expect(normalizeLiveClass(backendClass({ status: "Completed" })).status).toBe("completed");
  });

  it("TEST 5: backend Ended → Completed", () => {
    at("2026-10-05T15:22:00");
    expect(normalizeLiveClass(backendClass({ status: "Ended" })).status).toBe("completed");
    expect(normalizeLiveClass(backendClass({ status: "ended" })).status).toBe("completed");
  });

  it("TEST 6: backend Cancelled/Canceled → Cancelled", () => {
    at("2026-10-05T15:22:00");
    ["Cancelled", "cancelled", "Canceled", "canceled"].forEach((status) => {
      expect(normalizeLiveClass(backendClass({ status })).status).toBe("cancelled");
    });
  });

  it("does not fake Live: a backend Completed returned right after Start stays Completed", () => {
    at("2026-10-05T15:41:00");
    expect(normalizeLiveClass(backendClass({ status: "Completed" })).status).toBe("completed");
  });

  it("does not promote a never-started class to Live inside its window", () => {
    at("2026-10-05T15:25:00");
    expect(normalizeLiveClass(backendClass({ status: "Scheduled" })).status).not.toBe("live");
  });

  it("TEST 7: student Join stays available for backend Live after the scheduled end, and closes once Completed", () => {
    at("2026-10-05T15:41:00");
    expect(getStudentJoinState(backendClass({ status: "Live" }))).toMatchObject({ state: "live", canJoin: true });
    expect(getStudentJoinState(backendClass({ status: "Completed" }))).toMatchObject({ state: "completed", canJoin: false });
  });

  it("TEST 8: refreshing/re-mapping a backend Live row (and an already-normalized row) stays Live", () => {
    at("2026-10-05T15:41:00");
    const first = normalizeLiveClassList([backendClass({ status: "Live" })])[0];
    const remapped = normalizeLiveClass(first);
    const remappedAgain = normalizeLiveClass(remapped);
    expect([first.status, remapped.status, remappedAgain.status]).toEqual(["live", "live", "live"]);
  });

  it("uses the same rule every portal shares", () => {
    expect(getLiveClassLifecycleStatus("Live")).toBe("live");
    expect(getLiveClassLifecycleStatus("in-progress")).toBe("live");
    expect(getLiveClassLifecycleStatus("Ended")).toBe("completed");
    expect(getLiveClassLifecycleStatus("Canceled")).toBe("cancelled");
    expect(getLiveClassLifecycleStatus("Scheduled")).toBeNull();
    expect(getLiveClassLifecycleStatus("Upcoming")).toBeNull();
  });
});

describe("parseDateTime with the backend date/time contract", () => {
  it("combines a midnight-only scheduledDate with the separate time", () => {
    const date = parseDateTime("2026-10-05T00:00:00", "15:30");
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([2026, 9, 5, 15, 30]);
  });

  it("combines a plain date with the separate time", () => {
    expect(parseDateTime("2026-10-05", "15:30").getHours()).toBe(15);
  });

  it("keeps a complete datetime that already carries a real time", () => {
    const date = parseDateTime("2026-10-05T09:15:00", "15:30");
    expect([date.getHours(), date.getMinutes()]).toEqual([9, 15]);
  });

  it("maps backend TimeSpans with seconds to the real start/end, not midnight", () => {
    at("2026-10-05T12:00:00");
    const item = normalizeLiveClass(backendClass());
    expect(new Date(item.startAt).getHours()).toBe(15);
    expect(new Date(item.startAt).getMinutes()).toBe(21);
    expect(new Date(item.endAt).getMinutes()).toBe(30);
    expect(item.startDate).toBe("2026-10-05");
    expect(item.timeLabel).toBe("15:21 - 15:30");
  });
});

describe("Organization Start (useLiveClasses.submitStart)", () => {
  it("TEST 9: Start after the scheduled end calls start once, never end, and the refetched Live row stays Live", async () => {
    at("2026-10-05T15:41:00");
    liveClassService.start.mockResolvedValue(backendClass({ status: "Live" }));
    const { result } = renderHook(() => useLiveClasses());
    await waitFor(() => expect(liveClassService.list).toHaveBeenCalled());

    liveClassService.list.mockResolvedValue([backendClass({ status: "Live" })]);
    await act(async () => {
      await result.current.submitStart(normalizeLiveClass(backendClass({ status: "Scheduled" })));
    });

    expect(liveClassService.start).toHaveBeenCalledTimes(1);
    expect(liveClassService.start).toHaveBeenCalledWith(501);
    expect(liveClassService.end).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.filteredRecords.map((row) => row.status)).toEqual(["live"]));
  });

  it("End is only reached through the explicit submitEnd action", async () => {
    at("2026-10-05T15:45:00");
    liveClassService.end.mockResolvedValue(backendClass({ status: "Completed" }));
    const { result } = renderHook(() => useLiveClasses());
    await waitFor(() => expect(liveClassService.list).toHaveBeenCalled());
    expect(liveClassService.end).not.toHaveBeenCalled();

    liveClassService.list.mockResolvedValue([backendClass({ status: "Completed" })]);
    await act(async () => {
      await result.current.submitEnd(normalizeLiveClass(backendClass({ status: "Live" })));
    });

    expect(liveClassService.end).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.filteredRecords.map((row) => row.status)).toEqual(["completed"]));
  });
});

describe("Jitsi attendance stays separate from the class lifecycle", () => {
  class FakeJitsiApi {
    constructor() {
      this.listeners = {};
      FakeJitsiApi.instances.push(this);
    }
    addListener(event, handler) { (this.listeners[event] ||= []).push(handler); }
    removeListener(event, handler) { this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== handler); }
    emit(event) { (this.listeners[event] || []).forEach((handler) => handler()); }
    executeCommand() {}
    dispose() {}
  }

  it("TEST 10: videoConferenceLeft / readyToClose / pagehide send attendance leave only — never the class End", async () => {
    FakeJitsiApi.instances = [];
    jitsiAttendanceService.join.mockResolvedValue({});
    jitsiAttendanceService.leave.mockResolvedValue({});
    loadJitsiScript.mockResolvedValue(FakeJitsiApi);

    const { unmount } = render(<JitsiMeetingModal liveClass={{ id: 501, title: "Late Start Regression", meetingUrl: "https://meet.jit.si/room-501" }} onClose={vi.fn()} />);
    await waitFor(() => expect(FakeJitsiApi.instances).toHaveLength(1));
    const api = FakeJitsiApi.instances[0];

    act(() => api.emit("videoConferenceJoined"));
    await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));

    act(() => {
      api.emit("videoConferenceLeft");
      api.emit("readyToClose");
      window.dispatchEvent(new Event("pagehide"));
    });
    await waitFor(() => expect(jitsiAttendanceService.leave).toHaveBeenCalledTimes(1));
    unmount();

    expect(liveClassService.end).not.toHaveBeenCalled();
    expect(liveClassService.cancel).not.toHaveBeenCalled();
  });
});

it("expires a cached scheduled class while the Live Classes page remains open", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  at("2026-10-05T15:29:59");
  liveClassService.list.mockResolvedValue([backendClass()]);
  const { result } = renderHook(() => useLiveClasses());
  await act(async () => result.current.refreshTab("all"));
  await waitFor(() => expect(result.current.filteredRecords).toHaveLength(1));
  expect(result.current.filteredRecords[0].status).toBe("scheduled");
  await act(async () => vi.advanceTimersByTime(30000));
  expect(result.current.filteredRecords[0].status).toBe("completed");
});

