import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  orgPendingApprovals: vi.fn(),
  orgApprovedEnrollments: vi.fn(),
  approvalBatches: vi.fn(),
  approveEnrollment: vi.fn(),
  rejectEnrollment: vi.fn(),
}));

vi.mock("@shared/services/upiPaymentService", () => ({
  upiPaymentApi: api,
  isUpiPaymentVerified: (status) => /verified/i.test(String(status)),
}));
vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

const { default: UpiEnrollmentApprovals } = await import("../../src/features/organization/components/upi/UpiEnrollmentApprovals");

const row = {
  id: 3, studentName: "kadiveti Narendra", courseName: "Python", courseId: 2, amount: 30000,
  paymentStatus: "Verified", enrollmentStatus: "PendingApproval", email: "s@example.com", mobile: "9876543210",
};

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  api.orgPendingApprovals.mockResolvedValue([row]);
  api.orgApprovedEnrollments.mockResolvedValue([]);
});

const openApprove = async () => {
  render(<UpiEnrollmentApprovals />);
  fireEvent.click(await screen.findByRole("button", { name: /approve student/i }));
  // The shared Modal renders into document.body (no dialog role without focus trap).
  await screen.findByText("Approve this enrollment?");
  return document.body;
};

describe("Approve this enrollment? — batch selection", () => {
  it("shows the course and only the batches the server returns for it", async () => {
    api.approvalBatches.mockResolvedValue({
      courseName: "Python",
      studentChosenBatchId: null,
      batches: [
        { id: 11, name: "Python Batch 1", status: "Active", startDate: "", seatsAvailable: 4 },
        { id: 12, name: "Python Batch 2", status: "Upcoming", startDate: "", seatsAvailable: 10 },
      ],
    });
    const dialog = await openApprove();

    expect(api.approvalBatches).toHaveBeenCalledWith(3);
    expect(within(dialog).getByText(/gets access to Python after approval/i)).toBeInTheDocument();
    const select = await within(dialog).findByRole("combobox");
    const options = within(select).getAllByRole("option").map((o) => o.textContent);
    expect(options[0]).toMatch(/choose python batch/i);
    expect(options.slice(1)).toEqual([
      expect.stringContaining("Python Batch 1"),
      expect.stringContaining("Python Batch 2"),
    ]);

    // No batch chosen yet: the button is disabled.
    const approve = within(dialog).getByRole("button", { name: /approve enrollment/i });
    expect(approve).toBeDisabled();
    fireEvent.click(approve);
    expect(api.approveEnrollment).not.toHaveBeenCalled();

    // With a batch: the batch id goes with the approval.
    api.approveEnrollment.mockResolvedValue({ enrollmentStatus: "Approved" });
    fireEvent.change(select, { target: { value: "12" } });
    expect(approve).toBeEnabled();
    const refreshed = vi.fn();
    window.addEventListener("kini:enrollment-approvals-changed", refreshed);
    fireEvent.click(approve);
    await waitFor(() => expect(api.approveEnrollment).toHaveBeenCalledWith(3, "12"));
    await waitFor(() => expect(refreshed).toHaveBeenCalled());          // pending counts reload
    await waitFor(() => expect(api.orgPendingApprovals).toHaveBeenCalledTimes(2)); // list refreshed
    window.removeEventListener("kini:enrollment-approvals-changed", refreshed);
  });

  it("explains when the course has no active batch", async () => {
    api.approvalBatches.mockResolvedValue({ courseName: "Python", studentChosenBatchId: null, batches: [] });
    const dialog = await openApprove();

    expect(await within(dialog).findByText(/no active batches are available for this course/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /approve enrollment/i })).toBeDisabled();
    expect(api.approveEnrollment).not.toHaveBeenCalled();
  });

  it("pre-selects the batch the student chose when it is still open", async () => {
    api.approvalBatches.mockResolvedValue({
      courseName: "Python",
      studentChosenBatchId: 12,
      batches: [
        { id: 11, name: "Python Batch 1", status: "Active", startDate: "", seatsAvailable: 4 },
        { id: 12, name: "Python Batch 2", status: "Active", startDate: "", seatsAvailable: 4 },
      ],
    });
    const dialog = await openApprove();
    expect(await within(dialog).findByRole("combobox")).toHaveValue("12");
  });

  it("treats a failed request (e.g. 404) as an error, not as 'no batches', and can retry", async () => {
    api.approvalBatches
      .mockRejectedValueOnce({ response: { status: 404, data: { message: "The requested record was not found." } } })
      .mockResolvedValueOnce({ courseName: "Python", studentChosenBatchId: null, batches: [{ id: 11, name: "Python Batch 1", status: "Active", startDate: "", seatsAvailable: 4 }] });
    const dialog = await openApprove();

    expect(await within(dialog).findByText(/unable to load batches\. please try again\./i)).toBeInTheDocument();
    expect(within(dialog).queryByText(/no active batches/i)).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /approve enrollment/i })).toBeDisabled();

    fireEvent.click(within(dialog).getByRole("button", { name: /retry/i }));
    expect(await within(dialog).findByRole("combobox")).toBeInTheDocument();
    expect(api.approvalBatches).toHaveBeenCalledTimes(2);
  });
});
