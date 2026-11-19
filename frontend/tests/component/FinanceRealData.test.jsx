import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getFinanceSummary: vi.fn(), getPaymentHistory: vi.fn(), getCourses: vi.fn() }));
vi.mock("@shared/services/financeService", () => ({
  FINANCE_CHANGED_EVENT: "kini:finance-changed",
  getFinanceSummary: mocks.getFinanceSummary,
  getPaymentHistory: mocks.getPaymentHistory,
}));
vi.mock("@shared/services/courseService", () => ({ courseService: { getCourses: mocks.getCourses } }));
vi.mock("@features/organization/components/upi/UpiPaymentVerification", () => ({ default: () => <p>UPI verification</p> }));

const { default: FinanceManagement } = await import("../../src/features/organization/pages/FinanceManagement");

const summary = (overrides = {}) => ({
  totalCollected: 60000, pendingAmount: 0, overdueAmount: 0, totalTransactions: 2,
  verifiedPayments: 2, pendingVerificationPayments: 0, rejectedPayments: 0,
  recentPayments: [
    { source: "UPI", id: 2, studentName: "kadiveti Naren", courseName: "Python", amount: 30000, paymentMethod: "UPI", transactionId: "668835633718", paidAt: "2026-11-18T05:49:06", status: "Verified", enrollmentNumber: "KEN-261118-2HVWKA" },
    { source: "UPI", id: 1, studentName: "kadiveti Narendra", courseName: "Python", amount: 30000, paymentMethod: "UPI", transactionId: "106107844866", paidAt: "2026-11-18T04:04:21", status: "Verified", enrollmentNumber: "KEN-261118-W2CLCB" },
  ],
  pendingInvoices: [], overdueInvoices: [], ...overrides,
});

const renderAt = (path = "/organization/finance") => render(<MemoryRouter initialEntries={[path]}><FinanceManagement /></MemoryRouter>);

beforeEach(() => Object.values(mocks).forEach((fn) => fn.mockReset()));
afterEach(cleanup);

it("shows real summary cards and the latest payments, with no demo students", async () => {
  mocks.getFinanceSummary.mockResolvedValue(summary());
  renderAt();

  expect(await screen.findByText("kadiveti Naren")).toBeInTheDocument();
  const cards = screen.getByRole("region", { name: "Finance summary" });
  expect(within(cards).getByText("₹60,000")).toBeInTheDocument();
  expect(within(cards).getAllByText("₹0")).toHaveLength(2);       // pending + overdue are genuinely zero
  expect(within(cards).getByText("2")).toBeInTheDocument();
  const rows = screen.getAllByRole("row").slice(1);
  expect(rows.map((r) => within(r).getAllByRole("cell")[0].textContent)).toEqual(["kadiveti Naren", "kadiveti Narendra"]);
  expect(screen.getByText("668835633718")).toBeInTheDocument();
  for (const name of ["Rahul Kumar", "Priya Sharma", "Aman Verma", "Sneha Iyer"]) expect(screen.queryByText(name)).not.toBeInTheDocument();
  expect(screen.queryByText("₹45,000")).not.toBeInTheDocument();  // the old hardcoded overdue figure
});

it("says so when there are no verified payments, without fallback records", async () => {
  mocks.getFinanceSummary.mockResolvedValue(summary({ totalCollected: 0, totalTransactions: 0, recentPayments: [] }));
  renderAt();
  expect(await screen.findByText("No recent payments found.")).toBeInTheDocument();
});

it("refreshes the overview when a payment is verified elsewhere on the page", async () => {
  mocks.getFinanceSummary.mockResolvedValueOnce(summary({ recentPayments: [], totalCollected: 0 })).mockResolvedValueOnce(summary());
  renderAt();
  await screen.findByText("No recent payments found.");
  act(() => window.dispatchEvent(new CustomEvent("kini:finance-changed")));
  expect(await screen.findByText("kadiveti Naren")).toBeInTheDocument();
  expect(mocks.getFinanceSummary).toHaveBeenCalledTimes(2);
});

it("payment history loads real records with status filter and paging", async () => {
  mocks.getFinanceSummary.mockResolvedValue(summary());
  mocks.getPaymentHistory.mockResolvedValue({
    rows: [{ id: 2, studentName: "kadiveti Naren", courseName: "Python", amount: 30000, method: "UPI", transactionId: "668835633718", status: "Verified", reviewedAt: "2026-11-18T05:49:06" }],
    total: 12,
  });
  renderAt("/organization/finance?tab=payment-history");

  expect(await screen.findByText("668835633718")).toBeInTheDocument();
  expect(mocks.getPaymentHistory).toHaveBeenLastCalledWith(expect.objectContaining({ status: "all", page: 1, pageSize: 10 }));
  expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "Rejected" }));
  await waitFor(() => expect(mocks.getPaymentHistory).toHaveBeenLastCalledWith(expect.objectContaining({ status: "Rejected", page: 1 })));

  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await waitFor(() => expect(mocks.getPaymentHistory).toHaveBeenLastCalledWith(expect.objectContaining({ status: "Rejected", page: 2 })));
});

it("opens real payment details", async () => {
  mocks.getFinanceSummary.mockResolvedValue(summary());
  renderAt();
  fireEvent.click((await screen.findAllByRole("button", { name: /View Details/ }))[0]);
  expect(await screen.findByText("Payment details")).toBeInTheDocument();
  expect(screen.getByText("KEN-261118-2HVWKA")).toBeInTheDocument();
});
