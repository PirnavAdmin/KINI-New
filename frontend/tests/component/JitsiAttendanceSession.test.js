import { describe, expect, it, vi } from "vitest";
import { createJitsiAttendanceSession } from "../../src/shared/utils/jitsiAttendanceSession";
import { resolveJitsiMeeting } from "../../src/shared/utils/resolveJitsiRoom";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const makeSession = (overrides = {}) => {
  const statuses = [];
  const sendJoin = vi.fn().mockResolvedValue({});
  const sendLeave = vi.fn().mockResolvedValue({});
  let n = 0;
  const session = createJitsiAttendanceSession({
    sendJoin, sendLeave, createEventId: () => `evt-${++n}`, onStatus: (s) => statuses.push(s), ...overrides,
  });
  return { session, sendJoin: overrides.sendJoin || sendJoin, sendLeave: overrides.sendLeave || sendLeave, statuses };
};

describe("jitsi attendance session", () => {
  it("joins once even if videoConferenceJoined fires repeatedly", async () => {
    const { session, sendJoin } = makeSession();
    session.handleJoined(); session.handleJoined(); session.handleJoined();
    await flush();
    expect(sendJoin).toHaveBeenCalledTimes(1);
    expect(session.isJoined).toBe(true);
  });

  it("leaves once for videoConferenceLeft + readyToClose, with the join's eventId", async () => {
    const { session, sendLeave } = makeSession();
    session.handleJoined(); await flush();
    await Promise.all([session.handleLeft(), session.handleLeft()]);
    expect(sendLeave).toHaveBeenCalledTimes(1);
    expect(sendLeave).toHaveBeenCalledWith({ eventId: "evt-1" });
  });

  it("never sends /leave without a successful /join", async () => {
    const sendJoin = vi.fn().mockRejectedValue(new Error("500"));
    const { session, sendLeave, statuses } = makeSession({ sendJoin });
    session.handleJoined(); await flush();
    await session.handleLeft();
    expect(sendLeave).not.toHaveBeenCalled();
    expect(statuses).toContain("join-failed");
  });

  it("waits for an in-flight join before leaving", async () => {
    let resolveJoin;
    const sendJoin = vi.fn(() => new Promise((resolve) => { resolveJoin = resolve; }));
    const { session, sendLeave } = makeSession({ sendJoin });
    session.handleJoined();
    await flush();
    const leaving = session.handleLeft();
    expect(sendLeave).not.toHaveBeenCalled();
    resolveJoin({}); await leaving;
    expect(sendLeave).toHaveBeenCalledTimes(1);
  });

  it("hands the open session to a page-unload leave exactly once", async () => {
    const { session, sendLeave } = makeSession();
    session.handleJoined(); await flush();
    expect(session.takeUnloadLeave()).toEqual({ eventId: "evt-1" });
    expect(session.takeUnloadLeave()).toBeNull();
    await session.handleLeft();
    expect(sendLeave).not.toHaveBeenCalled();
  });
});

describe("resolveJitsiMeeting", () => {
  it("keeps the meeting link's own Jitsi domain and room", () => {
    expect(resolveJitsiMeeting({ id: 3, meetingUrl: "https://jitsi.example.org/Room-3" }, "meet.jit.si"))
      .toMatchObject({ domain: "jitsi.example.org", roomName: "Room-3", isJitsi: true });
  });
  it("falls back to the class-id room on the configured domain", () => {
    expect(resolveJitsiMeeting({ id: 9 }, "meet.jit.si")).toMatchObject({ domain: "meet.jit.si", roomName: "KiniEduHub-LiveClass-9", isJitsi: true });
  });
  it("flags non-Jitsi links instead of embedding them", () => {
    expect(resolveJitsiMeeting({ id: 1, meetingUrl: "https://zoom.us/j/123" }).isJitsi).toBe(false);
    expect(resolveJitsiMeeting({ id: 1, meetingUrl: "https://meet.google.com/abc-defg-hij" }).isJitsi).toBe(false);
  });
});
