import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import JitsiMeetingModal from "../../src/shared/components/JitsiMeetingModal";
import { jitsiAttendanceService } from "../../src/shared/services/jitsiAttendanceService";
import { loadJitsiScript } from "../../src/shared/utils/loadJitsiScript";

vi.mock("../../src/shared/hooks/useAuth", () => ({
  useAuth: () => ({ user: { userId: 7, fullName: "Asha Rao", email: "asha@example.com" } }),
}));
vi.mock("../../src/services/profileService", () => ({
  resolveUserId: () => 7,
}));
vi.mock("../../src/shared/services/jitsiAttendanceService", () => ({
  jitsiAttendanceService: { join: vi.fn(), leave: vi.fn() },
}));
vi.mock("../../src/shared/utils/loadJitsiScript", () => ({
  loadJitsiScript: vi.fn(),
}));

// A minimal stand-in for window.JitsiMeetExternalAPI: real Jitsi lets callers
// addListener/removeListener/dispose/executeCommand and fires named events —
// this fake supports exactly that so the test can drive the real event flow
// the component listens for, without a real Jitsi deployment.
class FakeJitsiApi {
  constructor() {
    this.listeners = {};
    this.disposed = false;
    FakeJitsiApi.instances.push(this);
  }
  addListener(event, handler) {
    (this.listeners[event] ||= []).push(handler);
  }
  removeListener(event, handler) {
    this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== handler);
  }
  emit(event) {
    (this.listeners[event] || []).forEach((handler) => handler());
  }
  executeCommand(command) {
    if (command === "hangup") this.emit("videoConferenceLeft");
  }
  dispose() {
    this.disposed = true;
  }
}
FakeJitsiApi.instances = [];

const LIVE_CLASS = { id: 42, title: "React Basics", meetingUrl: "https://meet.jit.si/room-42" };

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  FakeJitsiApi.instances = [];
  jitsiAttendanceService.join.mockResolvedValue({});
  jitsiAttendanceService.leave.mockResolvedValue({});
  loadJitsiScript.mockResolvedValue(FakeJitsiApi);
});
afterEach(cleanup);

const renderModal = (onClose = vi.fn()) => {
  const utils = render(<JitsiMeetingModal liveClass={LIVE_CLASS} onClose={onClose} />);
  return { ...utils, onClose };
};

const waitForApi = async () => {
  await waitFor(() => expect(FakeJitsiApi.instances).toHaveLength(1));
  return FakeJitsiApi.instances[0];
};

it("does not call /join when the Jitsi API is merely created — only after videoConferenceJoined", async () => {
  renderModal();
  const api = await waitForApi();

  expect(jitsiAttendanceService.join).not.toHaveBeenCalled();

  act(() => api.emit("videoConferenceJoined"));

  await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));
  expect(jitsiAttendanceService.join).toHaveBeenCalledWith(
    expect.objectContaining({ liveClassId: 42, participantId: 7, participantName: "Asha Rao", participantEmail: "asha@example.com" }),
  );
});

it("calls /leave exactly once after a confirmed join, when the conference ends, and disposes the api", async () => {
  const onClose = vi.fn();
  renderModal(onClose);
  const api = await waitForApi();

  act(() => api.emit("videoConferenceJoined"));
  await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));

  act(() => api.emit("videoConferenceLeft"));

  await waitFor(() => expect(jitsiAttendanceService.leave).toHaveBeenCalledTimes(1));
  expect(jitsiAttendanceService.leave).toHaveBeenCalledWith(expect.objectContaining({ liveClassId: 42, participantId: 7 }));
  expect(api.disposed).toBe(true);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("never calls /leave when the student never actually joined (e.g. unmounted while still connecting)", async () => {
  const { unmount } = renderModal();
  const api = await waitForApi();

  unmount();

  await waitFor(() => expect(api.disposed).toBe(true));
  expect(jitsiAttendanceService.join).not.toHaveBeenCalled();
  expect(jitsiAttendanceService.leave).not.toHaveBeenCalled();
});

it("ignores duplicate videoConferenceJoined and duplicate leave-style events — each API fires only once", async () => {
  renderModal();
  const api = await waitForApi();

  act(() => { api.emit("videoConferenceJoined"); api.emit("videoConferenceJoined"); });
  await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));
  expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1);

  // Real Jitsi can fire both videoConferenceLeft and readyToClose for one hangup.
  act(() => { api.emit("videoConferenceLeft"); api.emit("readyToClose"); });
  await waitFor(() => expect(jitsiAttendanceService.leave).toHaveBeenCalledTimes(1));
  expect(jitsiAttendanceService.leave).toHaveBeenCalledTimes(1);
});

it("the manual 'Leave meeting' button still triggers hangup, which drives the same /leave flow", async () => {
  renderModal();
  const api = await waitForApi();
  act(() => api.emit("videoConferenceJoined"));
  await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));

  const leaveButton = await screen.findByRole("button", { name: /leave meeting/i });
  act(() => { leaveButton.click(); });

  await waitFor(() => expect(jitsiAttendanceService.leave).toHaveBeenCalledTimes(1));
  expect(api.disposed).toBe(true);
});

it("removes all registered Jitsi listeners and disposes the api on unmount", async () => {
  const { unmount } = renderModal();
  const api = await waitForApi();
  const removeSpy = vi.spyOn(api, "removeListener");

  act(() => api.emit("videoConferenceJoined"));
  await waitFor(() => expect(jitsiAttendanceService.join).toHaveBeenCalledTimes(1));

  unmount();

  await waitFor(() => expect(api.disposed).toBe(true));
  expect(removeSpy).toHaveBeenCalledWith("videoConferenceJoined", expect.any(Function));
  expect(removeSpy).toHaveBeenCalledWith("videoConferenceLeft", expect.any(Function));
  expect(removeSpy).toHaveBeenCalledWith("readyToClose", expect.any(Function));
});
