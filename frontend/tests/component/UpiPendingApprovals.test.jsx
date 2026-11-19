import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApprovalQueue } from "../../src/pages/students/studentApproval";

const orgPendingApprovals = vi.fn();

vi.mock("@shared/services/upiPaymentService", () => ({
  isUpiPaymentMode: true,
  upiPaymentApi: { orgPendingApprovals: (...args) => orgPendingApprovals(...args) },
}));
vi.mock("@shared/services/demoPaymentApi", () => ({
  isDemoPaymentMode: false,
  demoPaymentApi: { listEnrollmentRequests: vi.fn() },
}));

const { default: usePendingEnrollmentApprovals } = await import("../../src/hooks/usePendingEnrollmentApprovals");

beforeEach(() => {
  orgPendingApprovals.mockReset();
  localStorage.clear();
});

describe("UPI enrollments waiting for approval", () => {
  it("are listed with a link to the UPI approval page", async () => {
    orgPendingApprovals.mockResolvedValue([{
      id: 3, studentName: "kadiveti Narendra", courseName: "Python", courseId: 2,
      email: "student@example.com", mobile: "9876543210", paymentStatus: "Verified",
      enrollmentStatus: "PendingApproval", verifiedAt: "2026-11-18T04:04:21Z",
      raw: { organizationId: 1 },
    }]);

    const { result } = renderHook(() => usePendingEnrollmentApprovals());
    await waitFor(() => expect(result.current).toHaveLength(1));

    const item = result.current[0];
    expect(item).toMatchObject({
      id: "upi-3", kind: "enrollment", source: "upi", enrollmentId: 3,
      name: "kadiveti Narendra", course: "Python", organizationId: 1,
      path: "/organization/approvals",
    });

    // The Students page counts it as one pending approval.
    const queue = buildApprovalQueue([], result.current);
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0].payment).toBe("Verified");
  });

  it("shows nothing when the user can't see UPI approvals", async () => {
    orgPendingApprovals.mockRejectedValue({ response: { status: 403 } });
    const { result } = renderHook(() => usePendingEnrollmentApprovals());
    await waitFor(() => expect(orgPendingApprovals).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });
});
