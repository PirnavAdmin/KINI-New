import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import InvoiceDetails from "../../src/features/organization/pages/InvoiceDetails";
import invoiceService from "../../src/shared/services/invoiceService";
import { triggerFileDownload } from "../../src/shared/utils/download";

vi.mock("../../src/shared/services/invoiceService", () => ({
  default: { get: vi.fn(), downloadPdf: vi.fn() },
}));
vi.mock("../../src/shared/utils/download", () => ({
  triggerFileDownload: vi.fn(),
  filenameFromDisposition: vi.fn(() => ""),
}));

const renderPage = (invoiceId) =>
  render(
    <MemoryRouter initialEntries={[`/organization/invoices/${invoiceId}`]}>
      <Routes>
        <Route path="/organization/invoices/:invoiceId" element={<InvoiceDetails />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

it("loads the real invoice for the route's own invoiceId and renders its real amounts, not fabricated ones", async () => {
  invoiceService.get.mockResolvedValue({
    invoiceId: 42, invoiceNumber: "INV-20260908-000042", studentName: "Asha Rao",
    courseName: "Full Stack Java", subTotal: 18000, totalAmount: 18000, paidAmount: 18000,
    taxPercentage: 0, taxAmount: 0, status: "PAID", dueDate: "2026-08-01", invoiceDate: "2026-07-01",
  });

  renderPage("42");

  await screen.findByRole("heading", { level: 1, name: "INV-20260908-000042" });
  expect(invoiceService.get).toHaveBeenCalledExactlyOnceWith("42");
  expect(screen.getAllByText("Asha Rao").length).toBeGreaterThan(0);
  expect(screen.getAllByText(/18,000/)[0]).toBeInTheDocument();
});

it("loads a different invoice's own real data when the route param changes, proving the page isn't hardcoded to one invoice", async () => {
  invoiceService.get.mockResolvedValue({
    invoiceId: 7, invoiceNumber: "INV-20260101-000007", studentName: "Rahul Dev",
    courseName: "Data Science", subTotal: 9000, totalAmount: 9000, paidAmount: 0,
    taxPercentage: 0, taxAmount: 0, status: "PENDING", dueDate: "2026-12-01", invoiceDate: "2026-11-01",
  });

  renderPage("7");

  await screen.findByRole("heading", { level: 1, name: "INV-20260101-000007" });
  expect(invoiceService.get).toHaveBeenCalledExactlyOnceWith("7");
  expect(screen.getAllByText("Rahul Dev").length).toBeGreaterThan(0);
  expect(screen.queryByText("Asha Rao")).not.toBeInTheDocument();
});

it("shows a real 404 as an honest 'invoice not found' state, never fake invoice data", async () => {
  invoiceService.get.mockRejectedValue(Object.assign(new Error("Not found"), { response: { status: 404 } }));

  renderPage("999999");

  await screen.findByText("Invoice not found");
  expect(screen.getByText(/999999/)).toBeInTheDocument();
});

it("shows an error state with retry for a genuine failure, and retry re-requests the same real invoiceId", async () => {
  invoiceService.get.mockRejectedValueOnce(Object.assign(new Error("Request failed with status code 401"), { response: { status: 401 } }));
  invoiceService.get.mockResolvedValueOnce({
    invoiceId: 5, invoiceNumber: "INV-5", studentName: "Meera Iyer", courseName: "Python",
    subTotal: 5000, totalAmount: 5000, paidAmount: 5000, status: "PAID",
  });

  renderPage("5");

  await screen.findByText("Unable to load invoice");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));

  await screen.findByRole("heading", { level: 1, name: "INV-5" });
  expect(invoiceService.get).toHaveBeenCalledTimes(2);
  expect(invoiceService.get).toHaveBeenNthCalledWith(2, "5");
});

it("downloads the real PDF for this exact invoiceId, not a placeholder", async () => {
  invoiceService.get.mockResolvedValue({
    invoiceId: 42, invoiceNumber: "INV-42", studentName: "Asha Rao", courseName: "Java",
    subTotal: 18000, totalAmount: 18000, paidAmount: 18000, status: "PAID",
  });
  invoiceService.downloadPdf.mockResolvedValue({ blob: new Blob(["pdf"]), filename: "INV-42.pdf" });

  renderPage("42");
  await screen.findByRole("heading", { level: 1, name: "INV-42" });

  fireEvent.click(screen.getByRole("button", { name: /download/i }));

  await waitFor(() => expect(invoiceService.downloadPdf).toHaveBeenCalledExactlyOnceWith("42"));
  expect(triggerFileDownload).toHaveBeenCalledWith(expect.any(Blob), "INV-42.pdf");
});
