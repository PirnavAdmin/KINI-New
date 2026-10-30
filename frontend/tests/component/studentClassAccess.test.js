import { describe, expect, it } from "vitest";
import { buildStudentClassScope, isClassInStudentScope, partitionClassesByScope } from "../../src/features/student/utils/studentClassAccess";

// Org A owns course 12 / batch 11; org B owns course 4 / batch 3.
const orgAClass = { id: 101, title: "RPA live", courseId: 12, batchId: 11 };
const orgAOtherBatch = { id: 102, title: "RPA, other batch", courseId: 12, batchId: 99 };
const orgBClass = { id: 201, title: "node js fundamental", courseId: 4, batchId: 3 };
const orgBNoBatch = { id: 202, title: "nodejs", courseId: 4, batchId: null };
const noIds = { id: 300, title: "Unlabelled" };

describe("buildStudentClassScope", () => {
  it("collects course and batch ids from approved enrollments and the student's own profile", () => {
    const scope = buildStudentClassScope({
      enrollments: [{ courseId: 12, batchId: 11 }, { courseId: 10, enrollmentStatus: "PendingApproval", batchId: 9 }],
      profile: { courseId: 12, batch: { batchId: 11 } },
    });
    expect([...scope.courseIds]).toEqual(["12"]);
    expect([...scope.batchIds]).toEqual(["11"]);
  });

  it("is empty when the student has no enrollments", () => {
    const scope = buildStudentClassScope({ enrollments: [], profile: {} });
    expect(scope.courseIds.size + scope.batchIds.size).toBe(0);
  });
});

describe("isClassInStudentScope", () => {
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 12, batchId: 11 }] });

  it("allows only the student's own batch", () => {
    expect(isClassInStudentScope(orgAClass, scope)).toBe(true);
    expect(isClassInStudentScope(orgAOtherBatch, scope)).toBe(false);
    expect(isClassInStudentScope(orgBClass, scope)).toBe(false);
  });

  it("matches a batch-less class by course id, never by name", () => {
    expect(isClassInStudentScope(orgBNoBatch, scope)).toBe(false);
    expect(isClassInStudentScope({ ...orgBNoBatch, courseId: 12, title: "nodejs" }, scope)).toBe(true);
    expect(isClassInStudentScope({ id: 5, title: "RPA", courseName: "RPA" }, scope)).toBe(false);
  });

  it("fails closed with no ids or no scope", () => {
    expect(isClassInStudentScope(noIds, scope)).toBe(false);
    expect(isClassInStudentScope(orgAClass, null)).toBe(false);
    expect(isClassInStudentScope(orgAClass, buildStudentClassScope())).toBe(false);
  });

  it("falls back to course when the student's batch isn't known", () => {
    const courseOnly = buildStudentClassScope({ enrollments: [{ courseId: 12 }] });
    expect(isClassInStudentScope(orgAOtherBatch, courseOnly)).toBe(true);
    expect(isClassInStudentScope(orgBClass, courseOnly)).toBe(false);
  });
});

it("partitions an API list into allowed and withheld classes", () => {
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 12, batchId: 11 }] });
  const { allowed, blocked } = partitionClassesByScope([orgAClass, orgBClass, orgBNoBatch, noIds], scope);
  expect(allowed.map((item) => item.id)).toEqual([101]);
  expect(blocked.map((item) => item.id)).toEqual([201, 202, 300]);
});

describe("students with several courses", () => {
  // Enrolled in RPA (batch 11) and Python, whose batch the enrollment list doesn't report.
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 12, batchId: 11 }, { courseId: 10 }] });

  it("shows a class of the second course even though its batch isn't reported", () => {
    expect(isClassInStudentScope({ id: 1, title: "Python", courseId: 10, batchId: 9 }, scope)).toBe(true);
  });

  it("still checks batches for a course whose batches are known", () => {
    expect(isClassInStudentScope({ id: 2, courseId: 12, batchId: 11 }, scope)).toBe(true);
    expect(isClassInStudentScope({ id: 3, courseId: 12, batchId: 99 }, scope)).toBe(false);
  });

  it("still blocks other courses and batch-only rows from other batches", () => {
    expect(isClassInStudentScope({ id: 4, courseId: 4, batchId: 3 }, scope)).toBe(false);
    expect(isClassInStudentScope({ id: 5, batchId: 3 }, scope)).toBe(false);
    expect(isClassInStudentScope({ id: 6, batchId: 11 }, scope)).toBe(true);
  });
});

describe("list rows without course or batch ids (student /live response)", () => {
  // GET /api/v1/live-classes/live returns { liveClassId, classTitle, courseName, batchName, … } with no ids.
  const liveRow = { id: 1, liveClassId: 1, title: "python", courseName: "python", batchName: "python 1" };

  it("uses the student's own attendance record for that class to supply the ids", () => {
    const scope = buildStudentClassScope({ enrollments: [{ courseId: 1, batchId: 1 }], attendance: [{ liveClassId: 1, courseId: 1, batchId: 1 }] });
    expect(isClassInStudentScope(liveRow, scope)).toBe(true);
  });

  it("stays hidden without such a record, and never matches by name", () => {
    const scope = buildStudentClassScope({ enrollments: [{ courseId: 1, batchId: 1, courseName: "python", batchName: "python 1" }] });
    expect(isClassInStudentScope(liveRow, scope)).toBe(false);
  });

  it("still blocks a class whose attendance ids belong to another course", () => {
    const scope = buildStudentClassScope({ enrollments: [{ courseId: 1, batchId: 1 }], attendance: [{ liveClassId: 1, courseId: 4, batchId: 3 }] });
    expect(isClassInStudentScope(liveRow, scope)).toBe(false);
  });
});
