import { describe, expect, it } from "vitest";
import { getAttendancePeriodRange } from "../../src/features/mentor/utils/attendanceDateRange";

describe("getAttendancePeriodRange", () => {
  it("uses the complete prior Monday-Sunday interval on a Wednesday", () => {
    expect(getAttendancePeriodRange("Last Week", new Date(2026, 8, 23))).toMatchObject({
      fromDate: "2026-09-14",
      toDate: "2026-09-20",
    });
  });

  it("keeps the complete prior week when today is Monday or Sunday", () => {
    expect(getAttendancePeriodRange("Last Week", new Date(2026, 8, 21))).toMatchObject({ fromDate: "2026-09-14", toDate: "2026-09-20" });
    expect(getAttendancePeriodRange("Last Week", new Date(2026, 8, 27))).toMatchObject({ fromDate: "2026-09-14", toDate: "2026-09-20" });
  });
});
