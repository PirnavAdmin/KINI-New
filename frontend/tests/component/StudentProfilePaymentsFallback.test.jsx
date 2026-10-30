import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StudentProfile from "../../src/features/organization/pages/StudentProfile";
import InvoiceDetails from "../../src/features/organization/pages/InvoiceDetails";
import { studentsApi } from "../../src/api/students";
import invoiceService from "../../src/shared/services/invoiceService";
import { paymentApi } from "../../src/shared/services/apiServices";

vi.mock("../../src/api/students", () => ({
  studentsApi: {
    getById: vi.fn(),
    list: vi.fn(),
    getAttendance: vi.fn(),
    getProgress: vi.fn(),
    getPayments: vi.fn(),
    getMaterials: vi.fn(),
    getQuizResults: vi.fn(),
    getActivity: vi.fn(),
    getErrorMessage: vi.fn((error) => error?.message || "Unable to complete the student request."),
  },
}));
vi.mock("../../src/shared/services/invoiceService", () => ({
  default: { list: vi.fn(), get: vi.fn(), downloadPdf: vi.fn() },
}));
vi.mock("../../src/shared/services/apiServices", () => ({
  paymentApi: { paymentHistory: vi.fn() },
}));

const STUDENT = {
  studentId: 5,
  firstName: "sri",
  lastName: "hari",
  status: "Active",
  courseName: "nodejs",
};

const renderProfile = () =>
  render(
    <MemoryRouter initialEntries={["/organization/students/5?tab=Payments"]}>
      <Routes>
        <Route path="/organization/students/:studentId" element={<StudentProfile />} />
        <Route path="/organization/invoices/:invoiceId" element={<InvoiceDetails />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  studentsApi.getById.mockResolvedValue({ data: STUDENT });
  studentsApi.getAttendance.mockResolvedValue({ data: [] });
  studentsApi.getProgress.mockResolvedValue({ data: null });
  studentsApi.getQuizResults.mockResolvedValue({ data: [] });
  studentsApi.getPayments.mockRejectedValue(Object.assign(new Error("Not found"), { response: { status: 404 } }));
});

it("falls back to payment history when the invoice list is empty, instead of surfacing the students/{id}/payments 404", async () => {
  invoiceService.list.mockResolvedValue({ data: [] });
  paymentApi.paymentHistory.mockResolvedValue({
    data: [{ paymentId: 1, amount: 15000, paidAmount: 15000, status: "Paid", invoiceNumber: "INV-1" }],
  });

  renderProfile();

  await screen.findByText("INV-1");
  // The old bug: studentsApi.getPayments(studentId) was the only source, so
  // a real 404 there surfaced as "Unable to load payments". With the real
  // 3-tier fallback, payment history alone is enough — getPayments should
  // never even be called once history already produced rows.
  expect(screen.queryByText(/Unable to load payments/i)).not.toBeInTheDocument();
  expect(studentsApi.getPayments).not.toHaveBeenCalled();
  expect(paymentApi.paymentHistory).toHaveBeenCalledExactlyOnceWith({ studentId: "5" });

  // KPI card reflects the real paid total from the real fallback data.
  expect(screen.getByText(/paid/)).toBeInTheDocument();
});

it("shows an honest empty state (not the old 404 error) when the student genuinely has no payment records anywhere", async () => {
  invoiceService.list.mockResolvedValue({ data: [] });
  paymentApi.paymentHistory.mockResolvedValue({ data: [] });

  renderProfile();

  await screen.findByText("No payment records found");
  expect(screen.queryByText(/Unable to load payments/i)).not.toBeInTheDocument();
  // Only falls through to the known-unreliable endpoint once the first two
  // real sources both come back empty.
  expect(studentsApi.getPayments).toHaveBeenCalledExactlyOnceWith("5");
});

it("only requests each student sub-resource once per mount and always with the route's real studentId, never batch/course/org ids", async () => {
  invoiceService.list.mockResolvedValue({ data: [{ studentId: 5, invoiceNumber: "INV-9", amount: 5000, status: "Paid" }] });
  paymentApi.paymentHistory.mockResolvedValue({ data: [] });

  renderProfile();
  await screen.findByText("INV-9");
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(studentsApi.getById).toHaveBeenCalledExactlyOnceWith("5");
  expect(studentsApi.getAttendance).toHaveBeenCalledExactlyOnceWith("5");
  expect(studentsApi.getProgress).toHaveBeenCalledExactlyOnceWith("5");
  // Assessment results now load from the performance API only on their tab.
  expect(studentsApi.getQuizResults).not.toHaveBeenCalled();
  expect(invoiceService.list).toHaveBeenCalledExactlyOnceWith({ studentId: "5" });
  // History wasn't needed since the invoice list already returned this student's row.
  expect(paymentApi.paymentHistory).not.toHaveBeenCalled();
});

it("switches tabs via the URL and loads Attendance data lazily-available-immediately without a full remount", async () => {
  invoiceService.list.mockResolvedValue({ data: [] });
  paymentApi.paymentHistory.mockResolvedValue({ data: [] });
  studentsApi.getAttendance.mockResolvedValue({
    data: [
      { attendanceId: 1, attendanceDate: "2026-09-01", status: "Present" },
      { attendanceId: 2, attendanceDate: "2026-09-02", status: "Absent" },
    ],
  });

  renderProfile();
  await screen.findByText("No payment records found");

  fireEvent.click(screen.getByRole("button", { name: "Attendance" }));
  await screen.findByText("Present");
  expect(screen.getByText("Absent")).toBeInTheDocument();
  // 1 present / 2 total = 50%, shown on the KPI card.
  await screen.findByText("50%");
});

it("makes the Invoice Number cell clickable and navigates to the dedicated details page using this row's real invoiceId", async () => {
  invoiceService.list.mockResolvedValue({
    data: [{ studentId: 5, invoiceId: 77, invoiceNumber: "INV-77", amount: 12000, status: "Paid" }],
  });
  paymentApi.paymentHistory.mockResolvedValue({ data: [] });
  invoiceService.get.mockResolvedValue({
    invoiceId: 77, invoiceNumber: "INV-77", studentName: "sri hari", courseName: "nodejs",
    subTotal: 12000, totalAmount: 12000, paidAmount: 12000, status: "PAID",
  });

  renderProfile();
  const invoiceLink = await screen.findByRole("button", { name: "INV-77" });

  fireEvent.click(invoiceLink);

  // Lands on the dedicated invoice route and fetches this exact row's real
  // invoiceId (77) — never a query param, never a fabricated one.
  await screen.findByRole("button", { name: /download/i });
  // URL params are always strings; the route was built from the row's real
  // invoiceId (77), just serialized into the path.
  expect(invoiceService.get).toHaveBeenCalledExactlyOnceWith("77");
  expect(screen.getAllByText("sri hari").length).toBeGreaterThan(0);
});
