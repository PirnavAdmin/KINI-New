import apiClient from "./apiClient";

// Real payment data for Organization → Fees & Payments. The backend derives the
// organization from the signed-in user; nothing here sends an organization id.

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

/** Fired after the backend confirms a payment was verified or rejected. */
export const FINANCE_CHANGED_EVENT = "kini:finance-changed";
export const announceFinanceChange = () => window.dispatchEvent(new CustomEvent(FINANCE_CHANGED_EVENT));

/** GET /api/v1/organization/finance/summary — summary cards, latest 5 completed payments, outstanding invoices. */
export async function getFinanceSummary(signal) {
  const data = unwrap(await apiClient.get("/api/v1/organization/finance/summary", { signal }));
  return {
    totalCollected: Number(data.totalCollected) || 0,
    pendingAmount: Number(data.pendingAmount) || 0,
    overdueAmount: Number(data.overdueAmount) || 0,
    totalTransactions: Number(data.totalTransactions) || 0,
    verifiedPayments: Number(data.verifiedPayments) || 0,
    pendingVerificationPayments: Number(data.pendingVerificationPayments) || 0,
    rejectedPayments: Number(data.rejectedPayments) || 0,
    recentPayments: Array.isArray(data.recentPayments) ? data.recentPayments : [],
    pendingInvoices: Array.isArray(data.pendingInvoices) ? data.pendingInvoices : [],
    overdueInvoices: Array.isArray(data.overdueInvoices) ? data.overdueInvoices : [],
  };
}

const toHistoryRow = (row) => ({
  id: row.paymentId,
  studentName: row.studentName || "",
  courseName: row.courseName || "",
  amount: Number(row.amount) || 0,
  method: row.paymentMethod || "UPI",
  transactionId: row.utrNumber || "",
  status: row.status || row.paymentStatus || "",
  paymentDate: row.paymentDate || row.submittedAt || null,
  submittedAt: row.submittedAt || null,
  reviewedAt: row.reviewedAt || null,
  enrollmentNumber: row.enrollmentNumber || "",
  email: row.email || "",
  phone: row.phone || "",
  rejectionReason: row.rejectionReason || "",
});

/**
 * GET /api/v1/organization/payments?status=…&sort=newest — the organization's UPI
 * payment records, newest first. status: "all" | "Verified" | "PendingVerification" | "Rejected".
 */
export async function getPaymentHistory({ status = "all", search = "", page = 1, pageSize = 10, signal } = {}) {
  const response = await apiClient.get("/api/v1/organization/payments", {
    params: { status, search: search.trim() || undefined, page, limit: pageSize, sort: "newest" },
    signal,
  });
  const body = response?.data ?? {};
  const rows = Array.isArray(body.data) ? body.data : [];
  const total = Number(body.totalRecords ?? body.total ?? body.pagination?.totalRecords ?? rows.length) || 0;
  return { rows: rows.map(toHistoryRow), total, page, pageSize };
}
