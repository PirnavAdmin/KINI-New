import { describe, expect, it } from "vitest";
import { buildRosterIndex, enrollmentsOf } from "../../src/pages/students/studentCourseEnrollments";

// Real shapes: organization batches carry their own mentor; a roster row is the
// student record, so its batchId is the student's ORIGINAL batch.
const batches = [
  { batchId: 1, batchName: "python 1", courseId: 1, courseName: "python", mentorName: "Lakshmilahari Gandikota" },
  { batchId: 2, batchName: "React 1", courseId: 2, courseName: "React", mentorName: "Ravi Mentor" },
  { batchId: 3, batchName: "Java 1", courseId: 3, courseName: "Java", mentorName: null },
];
const student12 = { id: 12, studentId: 12, courseId: 1, course: "python", batchId: 1, batch: "python 1", mentorName: "Lakshmilahari Gandikota", status: "Pending" };

describe("student course enrollments for the Students table", () => {
  it("lists the record's course first, then roster enrollments, using the roster's batch", () => {
    const index = buildRosterIndex(batches, [{ batchId: 2, students: [{ studentId: 12, batchId: 1 }] }]);
    expect(enrollmentsOf(student12, index, batches)).toEqual([
      { courseId: "1", course: "python", batchId: "1", batch: "python 1", mentor: "Lakshmilahari Gandikota" },
      { courseId: "2", course: "React", batchId: "2", batch: "React 1", mentor: "Ravi Mentor" },
    ]);
  });

  it("never borrows another course's mentor and never repeats a batch", () => {
    const index = buildRosterIndex(batches, [
      { batchId: 1, students: [{ studentId: 12 }] },
      { batchId: 3, students: [{ studentId: 12 }] },
    ]);
    const list = enrollmentsOf(student12, index, batches);
    expect(list.map((item) => item.batch)).toEqual(["python 1", "Java 1"]);
    expect(list[1].mentor).toBeNull();
  });

  it("ignores rosters of batches outside this organization's list", () => {
    const index = buildRosterIndex(batches, [{ batchId: 99, students: [{ studentId: 12 }] }]);
    expect(enrollmentsOf(student12, index, batches)).toHaveLength(1);
  });

  it("handles a student with no course at all", () => {
    expect(enrollmentsOf({ id: 5, course: "—", batch: "—" }, new Map(), batches)).toEqual([]);
  });
});
