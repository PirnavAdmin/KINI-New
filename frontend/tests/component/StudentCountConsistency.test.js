import { describe, expect, it } from "vitest";
import { getBatchSeats } from "../../src/pages/students/studentBatchSeats";
import { buildApprovalQueue } from "../../src/pages/students/studentApproval";

describe("student count consistency", () => {
  it("counts unique members from both APIs using the requested roster batch", () => {
    const seats = getBatchSeats({ batchId: 7, capacity: 12 }, { students: [{ studentId: 1, batchId: 99 }, { studentId: "1" }, { studentId: 2 }] }, [{ studentId: 2, batchId: 7 }, { studentId: 3, batchId: "7" }, { studentId: 4, batchId: 99 }]);
    expect(seats).toMatchObject({ enrolled: 3, capacity: 12, available: 9, isFull: false });
  });
  it.each([undefined, null, 0, -1, "invalid"])("never invents seats for capacity %s", capacity => {
    expect(getBatchSeats({ capacity }, { students: [] })).toMatchObject({ available: 0, isFull: true });
  });
  it("clamps availability at zero without hiding over-enrollment", () => {
    expect(getBatchSeats({ batchId: 7, capacity: 1 }, { students: [{ studentId: 1 }, { studentId: 2 }] })).toMatchObject({ enrolled: 2, capacity: 1, available: 0, isFull: true });
  });
  it("excludes unapproved or ended assignments but retains inactive enrolled members", () => {
    const students = ["Active", "Inactive", "PendingApproval", "Rejected", "Cancelled"].map((status, id) => ({ studentId: id, batchId: 7, status }));
    expect(getBatchSeats({ batchId: 7, capacity: 10 }, { students }, students).enrolled).toBe(2);
  });
  it("counts review groups and all pending aliases, folding linked demo requests", () => {
    const students = [{ id: 1, status: "Active", approvalStatus: "PendingApproval", email: "applicant@example.test" }];
    const approvals = [1, 2].map(id => ({ id, kind: "demo-enrollment", student: { email: "applicant@example.test" } }));
    expect(buildApprovalQueue(students, approvals).items).toHaveLength(1);
    expect(buildApprovalQueue(students, approvals).items[0].demoRequests).toHaveLength(2);
  });
  it("counts several courses reviewed on one applicant card once", () => {
    const approvals = [1, 2].map(id => ({ id, name: "Applicant", student: { email: "applicant@example.test" }, course: `Course ${id}` }));
    const { items } = buildApprovalQueue([], approvals);
    expect(items).toHaveLength(1);
    expect(items[0].requests).toHaveLength(2);
  });
});
