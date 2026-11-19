import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  studentPayments: vi.fn(),
  invoiceList: vi.fn(),
  paymentHistory: vi.fn(),
  getPayments: vi.fn(),
  downloadUpiPaymentPdf: vi.fn(),
  downloadPdf: vi.fn(),
  triggerFileDownload: vi.fn(),
}));

vi.mock("@shared/hooks/useAuth", () => ({ useAuth: () => ({ user: { studentId: 14 }, authLoading: false }) }));
vi.mock("@shared/services/upiPaymentService", () => ({ upiPaymentApi: { studentPayments: mocks.studentPayments } }));
vi.mock("@shared/services/invoiceService", () => ({
  default: { list: mocks.invoiceList, downloadPdf: mocks.downloadPdf, downloadUpiPaymentPdf: mocks.downloadUpiPaymentPdf },
}));
vi.mock("@shared/utils/download", () => ({ triggerFileDownload: mocks.triggerFileDownload }));
vi.mock("@shared/services/apiServices", () => ({ paymentApi: { paymentHistory: mocks.paymentHistory } }));
vi.mock("@/api/students", () => ({ studentsApi: { getPayments: mocks.getPayments } }));
vi.mock("@shared/components/PageHeader", () => ({ default: ({ title }) => <h1>{title}</h1> }));

const { default: StudentPayments } = await import("../../src/features/student/pages/StudentPayments");

const notFound = () => Promise.reject({ response: { status: 404 } });

beforeEach(() => {
  Object.values(mocks).forEach((fn) => fn.mockReset());
  mocks.invoiceList.mockResolvedValue([]);
  mocks.paymentHistory.mockResolvedValue([]);
  mocks.getPayments.mockImplementation(notFound);
});

describe("Student Payments — UPI course payments", () => {
  it("lists the student's verified UPI payment instead of 'service not available'", async () => {
    mocks.studentPayments.mockResolvedValue([{
      paymentId: 1, courseName: "Python", amount: 30000, paymentMethod: "UPI",
      transactionId: "106107844866", paymentDate: "2026-11-18", status: "Verified",
    }]);
    render(<StudentPayments />);

    expect(await screen.findByText("Python")).toBeInTheDocument();
    expect(screen.getByText("106107844866")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Paid in full")).toBeInTheDocument();
    expect(screen.queryByText(/service is not available/i)).not.toBeInTheDocument();
    expect(mocks.getPayments).not.toHaveBeenCalled(); // legacy route not needed
  });

  it("shows 'No payment records' (not an error) when the student has none", async () => {
    mocks.studentPayments.mockResolvedValue([]);
    render(<StudentPayments />);
    expect(await screen.findByText("No payment records")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("downloads the invoice PDF for a verified UPI payment", async () => {
    mocks.studentPayments.mockResolvedValue([{
      paymentId: 1, enrollmentNumber: "KEN-261118-W2CLCB", courseName: "Python", amount: 30000, paymentMethod: "UPI",
      transactionId: "106107844866", paymentDate: "2026-11-18", status: "Verified", invoiceAvailable: true,
    }]);
    const blob = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    mocks.downloadUpiPaymentPdf.mockResolvedValue({ blob, filename: "INV-KEN-261118-W2CLCB.pdf" });
    render(<StudentPayments />);

    fireEvent.click(await screen.findByRole("button", { name: /download/i }));
    await waitFor(() => expect(mocks.downloadUpiPaymentPdf).toHaveBeenCalledWith(1));
    expect(mocks.triggerFileDownload).toHaveBeenCalledWith(blob, "INV-KEN-261118-W2CLCB.pdf");
    expect(mocks.downloadPdf).not.toHaveBeenCalled();
    expect(screen.queryByText(/invoice pdf is not available/i)).not.toBeInTheDocument();
  });

  it("explains when the payment is not verified yet", async () => {
    mocks.studentPayments.mockResolvedValue([{
      paymentId: 2, courseName: "Python", amount: 30000, status: "PendingVerification", invoiceAvailable: false,
    }]);
    render(<StudentPayments />);
    fireEvent.click(await screen.findByRole("button", { name: /download/i }));
    expect(await screen.findByText(/not available for this payment/i)).toBeInTheDocument();
    expect(mocks.downloadUpiPaymentPdf).not.toHaveBeenCalled();
  });
});
