import { describe, expect, it } from "vitest";
import { countStudentsByCourse } from "@/hooks/useCourses";

// Roster shape as returned by GET /api/v1/organization/students (normalized).
const s = (id, courseId, status = "Active", extra = {}) => ({ id, studentId: id, courseId, status, ...extra });

describe("countStudentsByCourse", () => {
  it("counts unique enrolled students per course", () => {
    const countFor = countStudentsByCourse([s(1, 3), s(2, 3), s(3, 7)]);
    expect(countFor({ courseId: 3, name: "nodejs" })).toBe(2);
    expect(countFor({ courseId: 7, name: "Python" })).toBe(1);
  });

  it("returns 0 for a course with no enrolled students", () => {
    expect(countStudentsByCourse([s(1, 3)])({ courseId: 9, name: "aws" })).toBe(0);
  });

  it("counts a student once even if listed in several batches of the same course", () => {
    const roster = [s(1, 3, "Active", { batchId: 5 }), s(1, 3, "Active", { batchId: 6 }), s(2, 3, "Active", { batchId: 6 })];
    expect(countStudentsByCourse(roster)({ courseId: 3, name: "nodejs" })).toBe(2);
  });

  it("excludes rejected, pending and cancelled enrolments", () => {
    const roster = [s(1, 3), s(2, 3, "Rejected"), s(3, 3, "Pending"), s(4, 3, "Cancelled"), s(5, 3, "Inactive")];
    expect(countStudentsByCourse(roster)({ courseId: 3, name: "nodejs" })).toBe(2);
  });

  it("matches by course name when a student record has no courseId", () => {
    const roster = [{ id: 1, studentId: 1, status: "Active", courseName: "Python" }, s(2, 7)];
    expect(countStudentsByCourse(roster)({ courseId: 7, name: "python" })).toBe(2);
  });

  it("matches string and number course ids", () => {
    expect(countStudentsByCourse([s(1, "3")])({ courseId: 3, name: "x" })).toBe(1);
  });
});

it("counts additional course memberships once, independent of course name formatting", () => {
  const count = countStudentsByCourse([{ studentId: 7, courseId: 2, status: "Active", enrollments: [{ courseId: "2", courseName: " REACT " }, { courseId: "3", courseName: " python " }, { courseId: 3, courseName: "PYTHON" }] }]);
  expect(count({ courseId: 2, name: "React" })).toBe(1);
  expect(count({ courseId: 3, name: "Python" })).toBe(1);
});
