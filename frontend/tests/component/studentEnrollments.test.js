import { describe, expect, it } from "vitest";
import { buildEnrollmentRows } from "../../src/features/organization/utils/studentEnrollments";

const student = { courseId: 12, courseName: "RPA", batchId: 11, batchName: "RPA 1", mentorName: "kadiveti Narendra", status: "Active" };

describe("buildEnrollmentRows", () => {
  it("lists every enrollment with its own batch, mentor and statuses", () => {
    const rows = buildEnrollmentRows({
      student,
      enrollments: [
        { enrollmentId: 1, courseId: 12, courseName: "RPA", batchId: 11, batchName: "RPA 1", mentorName: "kadiveti Narendra", status: "Approved" },
        { enrollmentId: 2, course: { courseId: 10, courseName: "Python" }, batch: { batchId: 9, batchName: "Python 1", trainerName: "Ravi" }, enrollmentStatus: "PendingApproval", paymentStatus: "Pending" },
      ],
      payments: [{ courseId: 12, status: "Success" }],
    });
    expect(rows.map(({ course, batch, mentor, enrollmentStatus, paymentStatus }) => [course, batch, mentor, enrollmentStatus, paymentStatus])).toEqual([
      ["RPA", "RPA 1", "kadiveti Narendra", "Approved", "Paid"],
      ["Python", "Python 1", "Ravi", "PendingApproval", "Pending"],
    ]);
  });

  it("shows the student's own course when the enrollments list is empty, without inventing values", () => {
    const rows = buildEnrollmentRows({ student, enrollments: [] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ course: "RPA", batch: "RPA 1", enrollmentStatus: "Active", paymentStatus: "Not reported" });
  });

  it("adds the primary course only when the list doesn't already include it", () => {
    const rows = buildEnrollmentRows({ student, enrollments: [{ courseId: 10, courseName: "Python", batchId: 9, batchName: "Python 1" }] });
    expect(rows.map((row) => row.course)).toEqual(["RPA", "Python"]);
    expect(rows[1]).toMatchObject({ mentor: "Not reported", enrollmentStatus: "Not reported" });
  });

  it("returns no rows for a student with no course at all", () => {
    expect(buildEnrollmentRows({ student: { status: "Pending" }, enrollments: [] })).toEqual([]);
  });
});

describe("per-batch mentor and dates", () => {
  const batches = [
    { batchId: 1, batchName: "python 1", courseId: 1, mentorName: "Lakshmilahari Gandikota", startDate: "2026-10-13T00:00:00", endDate: "2026-12-13T00:00:00" },
    { batchId: 2, batchName: "React 1", courseId: 2, mentorName: "Ravi Mentor", startDate: "2026-11-01T00:00:00", endDate: null },
  ];
  const python = { courseId: 1, courseName: "python", batchId: 1, batchName: "python 1", mentorName: "Lakshmilahari Gandikota", status: "Active" };

  it("gives each course its own batch's mentor and dates, never another course's", () => {
    const rows = buildEnrollmentRows({
      student: python,
      enrollments: [{ courseId: 2, courseName: "React", batchId: 2, batchName: "React 1", enrollmentStatus: "Active" }],
      batches,
    });
    expect(rows.map(({ course, mentor, batchStart, batchEnd }) => [course, mentor, batchStart, batchEnd])).toEqual([
      ["python", "Lakshmilahari Gandikota", "2026-10-13T00:00:00", "2026-12-13T00:00:00"],
      ["React", "Ravi Mentor", "2026-11-01T00:00:00", null],
    ]);
  });

  it("keeps \"Not reported\" when the batch is unknown instead of borrowing a mentor", () => {
    const rows = buildEnrollmentRows({ student: python, enrollments: [{ courseId: 5, courseName: "Go", batchId: 50, batchName: "Go 1" }], batches });
    expect(rows[1]).toMatchObject({ course: "Go", mentor: "Not reported", batchStart: null });
  });
});
