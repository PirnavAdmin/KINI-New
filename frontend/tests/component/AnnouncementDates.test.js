import { expect, it } from "vitest";
import { activeAnnouncements, announcementOptions, formatAnnouncementDate, parseAnnouncementDate } from "../../src/features/hr/services/hrAnnouncementData";

// "Work from home" as stored: 19 Nov 2026 09:56–10:03 UTC (15:26–15:33 IST).
const workFromHome = { announcementId: 4, title: "Work from home", audience: "Mentor", status: "PUBLISHED", publishDate: "2026-11-19T09:56:00", expiryDate: "2026-11-19T10:03:00" };

it("reads server times without a zone as UTC, and with Z unchanged", () => {
  expect(new Date(parseAnnouncementDate("2026-11-19T09:56:00")).toISOString()).toBe("2026-11-19T09:56:00.000Z");
  expect(new Date(parseAnnouncementDate("2026-11-19T09:56:00Z")).toISOString()).toBe("2026-11-19T09:56:00.000Z");
  expect(new Date(parseAnnouncementDate("2026-11-19T15:26:00+05:30")).toISOString()).toBe("2026-11-19T09:56:00.000Z");
  expect(Number.isNaN(parseAnnouncementDate(null))).toBe(true);
});

it("shows an announcement to mentors only inside its UTC visibility window", () => {
  const at = (iso) => Date.parse(iso);
  expect(activeAnnouncements([workFromHome], at("2026-11-19T09:55:59Z"))).toHaveLength(0);   // scheduled, not yet live
  expect(activeAnnouncements([workFromHome], at("2026-11-19T09:56:00Z"))).toHaveLength(1);   // live from 15:26 IST
  expect(activeAnnouncements([workFromHome], at("2026-11-19T10:02:59Z"))).toHaveLength(1);
  expect(activeAnnouncements([workFromHome], at("2026-11-19T10:03:00Z"))).toHaveLength(0);   // expired
  // The old local-time reading would have shown it at 09:56 IST (04:26 UTC): no longer.
  expect(activeAnnouncements([workFromHome], at("2026-11-19T04:30:00Z"))).toHaveLength(0);
  expect(activeAnnouncements([{ ...workFromHome, status: "SCHEDULED" }], at("2026-11-19T09:58:00Z"))).toHaveLength(0);
});

it("formats dates in the viewer's zone and offers derived statuses only for filtering", () => {
  expect(formatAnnouncementDate("2026-11-19T09:56:00Z")).toMatch(/2026/);
  const options = { statuses: ["DRAFT", "PUBLISHED"], filterStatuses: ["PUBLISHED", "SCHEDULED", "DRAFT", "EXPIRED"] };
  expect(announcementOptions("filterStatus", options).map((o) => o.label)).toEqual(["Published", "Scheduled", "Draft", "Expired"]);
  expect(announcementOptions("status", options).map((o) => o.value)).toEqual(["DRAFT", "PUBLISHED"]);
  expect(announcementOptions("filterStatus", { statuses: ["DRAFT", "PUBLISHED"] }).map((o) => o.value)).toEqual(["DRAFT", "PUBLISHED"]);
});
