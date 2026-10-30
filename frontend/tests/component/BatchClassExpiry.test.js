import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeLiveClass } from "@features/live-classes/utils/liveClassMappers";
const row = (extra = {}) => ({ liveClassId: 1, scheduledDate: "2026-10-12T00:00:00", startTime: "10:00:00", endTime: "11:00:00", status: "Scheduled", ...extra });
beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());
describe("Batch scheduled class expiry", () => {
  it.each([
    ["2026-10-12T09:59:59", "scheduled"],
    ["2026-10-12T10:00:00", "scheduled"],
    ["2026-10-12T10:30:00", "scheduled"],
    ["2026-10-12T11:00:00", "completed"],
    ["2026-10-12T17:00:00", "completed"],
    ["2026-10-13T09:00:00", "completed"],
  ])("classifies ordinary scheduled sessions at %s as %s", (now, status) => {
    vi.setSystemTime(new Date(now));
    expect(normalizeLiveClass(row()).status).toBe(status);
  });
  it("handles sessions crossing midnight", () => {
    vi.setSystemTime(new Date("2026-10-13T00:30:00"));
    expect(normalizeLiveClass(row({ startTime: "23:00:00", endTime: "01:00:00" })).status).toBe("scheduled");
    vi.setSystemTime(new Date("2026-10-13T01:00:00"));
    expect(normalizeLiveClass(row({ startTime: "23:00:00", endTime: "01:00:00" })).status).toBe("completed");
  });
  it("handles timezone offsets and remapping cached records", () => {
    vi.setSystemTime(new Date("2026-10-12T06:00:00Z"));
    const item = { startAt: "2026-10-12T10:00:00+05:30", endAt: "2026-10-12T11:00:00+05:30", status: "Scheduled" };
    const normalized = normalizeLiveClass(item);
    expect(normalized.status).toBe("completed");
    expect(normalizeLiveClass(normalized).startAt).toBe("2026-10-12T04:30:00.000Z");
    const offsetSchedule = normalizeLiveClass(row({ scheduledDate: "2026-10-12T00:00:00+05:30" }));
    expect(offsetSchedule.startAt).toBe("2026-10-12T04:30:00.000Z");
    expect(offsetSchedule.endAt).toBe("2026-10-12T05:30:00.000Z");
  });
  it("does not invent an end time for missing or invalid timestamps", () => {
    vi.setSystemTime(new Date("2026-10-13T10:00:00"));
    expect(normalizeLiveClass(row({ endTime: undefined })).status).toBe("scheduled");
    expect(normalizeLiveClass(row({ endTime: "invalid" })).status).toBe("scheduled");
  });
  it("compares actual seconds rather than the formatted HH:mm display", () => {
    vi.setSystemTime(new Date("2026-10-12T11:00:29"));
    expect(normalizeLiveClass(row({ endTime: "11:00:30" })).status).toBe("scheduled");
    vi.setSystemTime(new Date("2026-10-12T11:00:30"));
    expect(normalizeLiveClass(row({ endTime: "11:00:30" })).status).toBe("completed");
  });
  it("reclassifies cached scheduled data after the end boundary", () => {
    vi.setSystemTime(new Date("2026-10-12T10:50:00"));
    const cached = normalizeLiveClass(row());
    vi.setSystemTime(new Date("2026-10-12T11:00:00"));
    expect(normalizeLiveClass(cached).status).toBe("completed");
  });
  it("preserves explicitly started live, cancelled, completed and postponed lifecycle states", () => {
    vi.setSystemTime(new Date("2026-10-13T10:00:00"));
    for (const status of ["Live", "Cancelled", "Completed", "Postponed"]) expect(normalizeLiveClass(row({ status })).status).toBe(status.toLowerCase());
    expect(normalizeLiveClass(row({ status: "Rescheduled", scheduledDate: "2026-10-15" })).status).toBe("rescheduled");
  });
});
