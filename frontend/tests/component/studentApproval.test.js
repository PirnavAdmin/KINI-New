import { describe, expect, it } from "vitest";
import { describeApprovalError, describeApprovalResult, linkDemoRequests } from "../../src/pages/students/studentApproval";
import { createDemoPaymentStore } from "../../server/demo-payments/demoPaymentStore.js";

const demo = (id, email) => ({ id, kind: "demo-enrollment", student: { email }, course: { title: id } });

describe("linkDemoRequests", () => {
  const live = [
    { id: 31, email: "Uday@Example.test", status: "Pending" },
    { id: 40, email: "active@example.test", status: "Active" },
    { id: 50, email: "twin@example.test", status: "Pending" },
    { id: 51, email: "twin@example.test", status: "Pending" },
  ];

  it("links only on exactly one email match and never invents an id", () => {
    const [pending, active, twin, none] = linkDemoRequests(
      [demo("RPA", "uday@example.test"), demo("Py", "active@example.test"), demo("Sql", "twin@example.test"), demo("Go", "nobody@example.test")],
      live,
    );
    expect(pending).toMatchObject({ liveStudent: { id: 31 }, livePending: true, ambiguous: false });
    expect(active).toMatchObject({ liveStudent: { id: 40 }, livePending: false });
    expect(twin).toMatchObject({ liveStudent: null, ambiguous: true });
    expect(none).toMatchObject({ liveStudent: null, ambiguous: false });
  });
});

describe("describeApprovalResult", () => {
  it("reads the backend's own fields", () => {
    const result = describeApprovalResult({ success: true, message: "Approved", data: { studentId: 31, status: "Active", email: "u@x.test", emailSent: true, accountCreated: true } }, 31);
    expect(result).toMatchObject({ message: "Approved", approvalStatus: "Active", studentId: 31, email: "u@x.test", emailStatus: "Sent", accountStatus: "Created", emailFailed: false });
  });

  it("reports missing fields as unknown instead of assuming success", () => {
    const result = describeApprovalResult("Student approved", 31);
    expect(result).toMatchObject({ message: "Student approved", studentId: 31, emailStatus: null, accountStatus: null, emailFailed: false });
  });

  it("flags an email failure separately", () => {
    expect(describeApprovalResult({ data: { emailSent: false } }, 31)).toMatchObject({ emailStatus: "Not sent", emailFailed: true });
    expect(describeApprovalResult({ emailStatus: "Failed: SMTP timeout" }, 31).emailFailed).toBe(true);
  });
});

describe("describeApprovalError", () => {
  const fail = (status, data) => ({ response: { status, data } });
  it.each([
    [400, { message: "Bad id" }, /rejected the request: Bad id/],
    [401, {}, /session has expired/],
    [403, {}, /isn't allowed/],
    [404, {}, /#31 wasn't found/],
    [409, {}, /already approved/],
    [500, { message: "boom" }, /backend failed \(500\): boom/],
  ])("maps HTTP %i", (status, data, pattern) => {
    expect(describeApprovalError(fail(status, data), 31).message).toMatch(pattern);
  });

  it("treats a missing response as a network failure and 409 as already approved", () => {
    expect(describeApprovalError(new Error("Network Error"), 31).message).toMatch(/Can't reach the backend/);
    expect(describeApprovalError(fail(409, {}), 31).alreadyApproved).toBe(true);
  });
});

describe("demo store recordLiveApproval", () => {
  it("marks the request approved via the backend without a demo account or email", () => {
    const store = createDemoPaymentStore();
    const order = store.createOrder({ idempotencyKey: "k", student: { firstName: "U", lastName: "K", email: "u@x.test", phone: "9876543210" }, items: [{ courseId: "12", courseTitle: "RPA", listPrice: 25000 }] });
    const [request] = store.completeOrder(order.orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a" }).requests;
    const { request: recorded } = store.recordLiveApproval(request.id, { actor: "admin", liveStudentId: 31 });
    expect(recorded).toMatchObject({ enrollmentStatus: "Approved", approvedVia: "live-backend", liveStudentId: "31", accountStatus: "ManagedByBackend" });
    expect(store.recordLiveApproval(request.id, { actor: "admin", liveStudentId: 31 }).request.approvedAt).toBe(recorded.approvedAt);
    expect(store.accountSummary("u@x.test")).toBeNull();
    expect(store.listOutbox()).toHaveLength(0);
  });
});

describe("backend student id mapping", () => {
  it("prefers the stored backend id over email and refuses to relink", () => {
    const [link] = linkDemoRequests([{ ...demo("RPA", "changed@example.test"), liveStudentId: "41" }], [{ id: 41, email: "asha@example.test", status: "Pending" }]);
    expect(link).toMatchObject({ liveStudent: { id: 41 }, livePending: true });

    const store = createDemoPaymentStore();
    const order = store.createOrder({ idempotencyKey: "k", student: { firstName: "A", lastName: "R", email: "a@x.test", phone: "9876543210" }, items: [{ courseId: "12", courseTitle: "RPA", listPrice: 25000 }] });
    const [request] = store.completeOrder(order.orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a" }).requests;
    expect(store.linkBackendStudent(request.id, { actor: "admin", liveStudentId: 41 }).request).toMatchObject({ liveStudentId: "41", enrollmentStatus: "PendingApproval" });
    expect(store.linkBackendStudent(request.id, { actor: "admin", liveStudentId: 41 }).request.liveStudentId).toBe("41");
    expect(() => store.linkBackendStudent(request.id, { actor: "admin", liveStudentId: 99 })).toThrow(/already linked to backend student #41/);
  });
});
