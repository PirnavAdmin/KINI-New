import { describe, expect, it } from "vitest";
import { createDemoPaymentStore, DEMO_LABEL } from "../../server/demo-payments/demoPaymentStore.js";

const student = { firstName: "Asha", lastName: "Rao", email: "Asha.Rao@Example.test", phone: "98765 43210" };
const rpa = { courseId: "12", courseTitle: "RPA", batchId: "11", batchName: "RPA 1", organizationId: "2", listPrice: 25000 };
const python = { courseId: "10", courseTitle: "Python", batchId: null, organizationId: "2", listPrice: 10000 };

const setup = () => createDemoPaymentStore({ appOrigin: "http://app.test" });
const order = (store, overrides = {}) => store.createOrder({ idempotencyKey: "k1", student, items: [rpa], ...overrides });
const tokenFrom = (store) => new URL(store.listOutbox()[0].meta.activationUrl).searchParams.get("token");

describe("demo payment store", () => {
  it("creates one pending demo order per idempotency key", () => {
    const store = setup();
    const first = order(store);
    const again = order(store);
    expect(first.orderId).toMatch(/^DEMO-ORD-\d{6}$/);
    expect(again.orderId).toBe(first.orderId);
    expect(first).toMatchObject({ status: "Pending", paymentMode: "demo", amount: 25000, label: DEMO_LABEL });
    expect(first.student.email).toBe("asha.rao@example.test");
  });

  it("rejects invalid student details and duplicate courses", () => {
    const store = setup();
    expect(() => order(store, { student: { ...student, email: "nope" } })).toThrow(/Email is invalid/);
    expect(() => order(store, { items: [rpa, rpa] })).toThrow(/appears twice/);
    expect(() => order(store, { items: [{ ...rpa, listPrice: 0 }] })).toThrow(/valid price/);
  });

  it("records a successful payment once and creates one PendingApproval request per course", () => {
    const store = setup();
    const { orderId } = order(store, { items: [rpa, python] });
    const result = store.completeOrder(orderId, { outcome: "success", paymentMethod: "UPI (Google Pay)", attemptId: "a1" });
    expect(result).toMatchObject({ success: true, paymentMode: "demo", paymentStatus: "DemoSuccess", amount: 35000, currency: "INR", enrollmentStatus: "PendingApproval" });
    expect(result.transactionId).toMatch(/^DEMO-TXN-\d{6}$/);
    expect(result.requests.map((request) => [request.course.title, request.amount, request.transactionId])).toEqual([
      ["RPA", 25000, result.transactionId],
      ["Python", 10000, result.transactionId],
    ]);

    // Duplicate callbacks (same or new attempt, even "failed") return the recorded success.
    const duplicate = store.completeOrder(orderId, { outcome: "failed", paymentMethod: "UPI", attemptId: "a2" });
    expect(duplicate.transactionId).toBe(result.transactionId);
    expect(store.listRequests()).toHaveLength(2);
    expect(store.getOrder(orderId).transactions).toHaveLength(1);
  });

  it("records failed attempts separately and keeps the order payable", () => {
    const store = setup();
    const { orderId } = order(store);
    const failed = store.completeOrder(orderId, { outcome: "failed", paymentMethod: "Wallet", attemptId: "a1" });
    expect(failed).toMatchObject({ success: false, paymentStatus: "DemoFailed" });
    expect(store.listRequests()).toHaveLength(0);
    expect(store.completeOrder(orderId, { outcome: "failed", paymentMethod: "Wallet", attemptId: "a1" }).transactionId).toBe(failed.transactionId);

    const retried = store.completeOrder(orderId, { outcome: "success", paymentMethod: "Wallet", attemptId: "a2" });
    expect(retried.success).toBe(true);
    expect(store.getOrder(orderId).transactions.map((txn) => txn.paymentStatus)).toEqual(["DemoFailed", "DemoSuccess"]);
    expect(store.getOrder(orderId).transactions.every((txn) => txn.gatewayVerified === false && txn.countsAsRevenue === false)).toBe(true);
  });

  it("approves idempotently: one account, one activation email, courses linked", () => {
    const store = setup();
    const { orderId } = order(store, { items: [rpa, python] });
    const [first, second] = store.completeOrder(orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a1" }).requests;

    const approved = store.approveRequest(first.id, { actor: "admin@org.test" });
    expect(approved.request).toMatchObject({ enrollmentStatus: "Approved", approvedBy: "admin@org.test", accountStatus: "PendingActivation" });
    expect(approved.account).not.toHaveProperty("passwordHash");
    store.approveRequest(first.id, { actor: "admin@org.test" });
    store.approveRequest(second.id, { actor: "admin@org.test" });

    const outbox = store.listOutbox();
    expect(outbox.filter((email) => email.subject === "Your Kini EduHub Account Is Approved")).toHaveLength(1);
    expect(outbox.filter((email) => email.subject === "Enrollment approved: Python")).toHaveLength(1);
    expect(outbox.some((email) => /password\s*:/i.test(email.text))).toBe(false);
    expect(store.accountSummary(student.email).courses.map((course) => course.courseTitle)).toEqual(["RPA", "Python"]);
  });

  it("activates once with a single-use token and hashes the password", () => {
    const store = setup();
    const { orderId } = order(store);
    const [request] = store.completeOrder(orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a1" }).requests;
    store.approveRequest(request.id, { actor: "admin" });
    const token = tokenFrom(store);

    expect(store.inspectActivation(token)).toMatchObject({ status: "valid", email: "asha.rao@example.test" });
    expect(() => store.activateAccount(token, "short")).toThrow(/at least 8/);
    expect(store.activateAccount(token, "Str0ng!pass")).toMatchObject({ status: "Active" });
    expect(() => store.activateAccount(token, "Str0ng!pass")).toThrow(/already been used/);
    expect(() => store.inspectActivation("not-a-token")).toThrow(/invalid/);
    expect(store.listRequests({ status: "Approved" })[0].accountStatus).toBe("Active");
  });

  it("links a returning student to the existing account without new credentials", () => {
    const store = setup();
    const first = order(store);
    store.approveRequest(store.completeOrder(first.orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a1" }).requests[0].id, { actor: "admin" });
    store.activateAccount(tokenFrom(store), "Str0ng!pass");

    const second = order(store, { idempotencyKey: "k2", items: [python] });
    const [request] = store.completeOrder(second.orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "b1" }).requests;
    const approved = store.approveRequest(request.id, { actor: "admin" });
    expect(approved.account).toMatchObject({ status: "Active" });
    expect(store.listOutbox().filter((email) => email.subject.includes("Account Is Approved"))).toHaveLength(1);
    expect(store.listOutbox()[0].subject).toBe("Enrollment approved: Python");
  });

  it("rejects pending requests, and never approves a rejected one", () => {
    const store = setup();
    const { orderId } = order(store);
    const [request] = store.completeOrder(orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a1" }).requests;
    const rejected = store.rejectRequest(request.id, { actor: "admin", reason: "Batch full" });
    expect(rejected.request).toMatchObject({ enrollmentStatus: "Rejected", rejectionReason: "Batch full", refundStatus: "NotApplicable" });
    expect(() => store.approveRequest(request.id, { actor: "admin" })).toThrow(/rejected/);
    expect(store.listOutbox()).toHaveLength(0);
  });

  it("scopes requests to the reviewer's organization", () => {
    const store = setup();
    const { orderId } = order(store, { items: [rpa, { ...python, organizationId: "9" }] });
    store.completeOrder(orderId, { outcome: "success", paymentMethod: "UPI", attemptId: "a1" });
    expect(store.listRequests({ organizationId: "2" }).map((request) => request.course.title)).toEqual(["RPA"]);
    expect(store.listRequests({ status: "PendingApproval" })).toHaveLength(2);
  });
});
