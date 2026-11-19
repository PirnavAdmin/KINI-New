import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CreditCard, Download, Eye, FileText, IndianRupee, ReceiptText, RefreshCw, Search, WalletCards } from "lucide-react";
import Modal from "@shared/components/Modal";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { courseService } from "@shared/services/courseService";
import { FINANCE_CHANGED_EVENT, getFinanceSummary, getPaymentHistory } from "@shared/services/financeService";
import UpiPaymentVerification from "@features/organization/components/upi/UpiPaymentVerification";

// Every figure on this page comes from the backend (organization taken from the
// signed-in user): GET /api/v1/organization/finance/summary and
// GET /api/v1/organization/payments. No demo or fallback records are shown.

const TAB_KEYS = { overview: "Overview", upi: "UPI Payments", "fee-structure": "Fee Structure", payments: "Student Payments", pending: "Pending Payments", overdue: "Overdue Payments", emi: "EMI Tracking", coupons: "Coupons / Discounts", invoices: "Invoices / Receipts", "payment-history": "Payment History" };
const keyFor = (label) => Object.entries(TAB_KEYS).find(([, value]) => value === label)?.[0] || "overview";
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const HISTORY_PAGE_SIZE = 10;
const STATUS_FILTERS = [["all", "All"], ["Verified", "Verified"], ["PendingVerification", "Pending verification"], ["Rejected", "Rejected"]];

// Server timestamps are UTC without a zone marker.
const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const text = String(value);
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(text) || /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : `${text}Z`);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("en-IN", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const STATUS_STYLE = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "partially paid": "bg-blue-50 text-blue-700 ring-blue-200",
  pendingverification: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  overdue: "bg-red-50 text-red-700 ring-red-200",
};
const statusLabel = (status) => (String(status) === "PendingVerification" ? "Pending verification" : String(status || "—"));
const StatusPill = ({ status }) => <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${STATUS_STYLE[String(status).toLowerCase()] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>{statusLabel(status)}</span>;

function useFinanceSummary() {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setReloadKey((key) => key + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getFinanceSummary(controller.signal)
      .then((data) => setState({ loading: false, error: "", data }))
      .catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: getApiErrorMessage(error, "Unable to load finance data."), data: null }); });
    return () => controller.abort();
  }, [reloadKey]);
  // Refresh as soon as a payment is verified or rejected (UPI tab), without a page reload.
  useEffect(() => {
    window.addEventListener(FINANCE_CHANGED_EVENT, reload);
    return () => window.removeEventListener(FINANCE_CHANGED_EVENT, reload);
  }, [reload]);
  return { ...state, reload };
}

function usePaymentHistory({ status, search, page, enabled, refreshKey }) {
  const [state, setState] = useState({ loading: true, error: "", rows: [], total: 0 });
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, loading: true, error: "" }));
      getPaymentHistory({ status, search, page, pageSize: HISTORY_PAGE_SIZE, signal: controller.signal })
        .then(({ rows, total }) => setState({ loading: false, error: "", rows, total }))
        .catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: getApiErrorMessage(error, "Unable to load payment history."), rows: [], total: 0 }); });
    }, search ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [status, search, page, enabled, refreshKey]);
  return state;
}

function useCourses(enabled) {
  const [state, setState] = useState({ loading: true, error: "", rows: [] });
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    courseService.getCourses({ pageSize: 100 })
      .then((page) => { if (active) setState({ loading: false, error: "", rows: Array.isArray(page?.data) ? page.data : [] }); })
      .catch((error) => { if (active) setState({ loading: false, error: getApiErrorMessage(error, "Unable to load courses."), rows: [] }); });
    return () => { active = false; };
  }, [enabled]);
  return state;
}

const downloadCsv = (fileName, header, rows) => {
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function FinanceManagement() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tabKey = Object.hasOwn(TAB_KEYS, params.get("tab")) ? params.get("tab") : "overview";
  const tab = TAB_KEYS[tabKey];
  const summary = useFinanceSummary();

  const isHistory = tabKey === "payments" || tabKey === "payment-history";
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState(() => params.get("student") || "");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const bump = () => setRefreshKey((key) => key + 1);
    window.addEventListener(FINANCE_CHANGED_EVENT, bump);
    return () => window.removeEventListener(FINANCE_CHANGED_EVENT, bump);
  }, []);
  const history = usePaymentHistory({ status: isHistory ? statusFilter : "PendingVerification", search: isHistory ? search : "", page: isHistory ? page : 1, enabled: isHistory || tabKey === "pending", refreshKey });
  const courses = useCourses(tabKey === "fee-structure");
  const [details, setDetails] = useState(null);

  const selectTab = (label) => { const next = new URLSearchParams(params); next.set("tab", keyFor(label)); next.delete("student"); setParams(next); setPage(1); };
  const data = summary.data;

  const exportCsv = () => {
    if (isHistory) return downloadCsv(`payment-history-page-${page}.csv`, ["Student", "Course", "Amount", "Method", "UTR / Transaction ID", "Payment date", "Status"], history.rows.map((p) => [p.studentName, p.courseName, p.amount, p.method, p.transactionId, formatDate(p.reviewedAt || p.submittedAt), statusLabel(p.status)]));
    if (tabKey === "overdue") return downloadCsv("overdue-payments.csv", ["Invoice", "Student", "Course", "Balance", "Due date", "Days overdue"], (data?.overdueInvoices ?? []).map((i) => [i.invoiceNumber, i.studentName, i.courseName, i.balanceAmount, formatDate(i.dueDate), i.daysOverdue]));
    return downloadCsv("recent-payments.csv", ["Student", "Course", "Amount", "Method", "UTR / Transaction ID", "Payment date", "Status"], (data?.recentPayments ?? []).map((p) => [p.studentName, p.courseName, p.amount, p.paymentMethod, p.transactionId, formatDate(p.paidAt), p.status]));
  };

  const cards = [
    [IndianRupee, "Total Collected", data ? money(data.totalCollected) : "—"],
    [WalletCards, "Pending Amount", data ? money(data.pendingAmount) : "—"],
    [ReceiptText, "Overdue Amount", data ? money(data.overdueAmount) : "—"],
    [CreditCard, "Total Transactions", data ? data.totalTransactions.toLocaleString("en-IN") : "—"],
  ];

  const content = () => {
    if (isHistory) return <PaymentHistory history={history} statusFilter={statusFilter} onStatus={(value) => { setStatusFilter(value); setPage(1); }} search={search} onSearch={(value) => { setSearch(value); setPage(1); }} page={page} onPage={setPage} onView={setDetails} />;
    if (tabKey === "fee-structure") return <FeeStructure courses={courses} />;
    if (tabKey === "pending") return <PendingPayments history={history} invoices={data?.pendingInvoices ?? []} summary={summary} onView={setDetails} onOpenUpi={() => selectTab(TAB_KEYS.upi)} />;
    if (tabKey === "overdue") return <OverdueInvoices summary={summary} />;
    if (tabKey === "emi") return <Notice title="No EMI plans" text="Installment plans are not recorded in the system yet, so there is nothing to track." />;
    if (tabKey === "coupons") return <Notice title="No coupons" text="No coupon or discount records exist in the system yet." />;
    if (tabKey === "invoices") return <div className="flex flex-col items-center px-5 py-12 text-center"><FileText className="h-10 w-10 text-blue-500"/><h3 className="mt-3 font-bold text-slate-900 dark:text-white">Invoices and receipts</h3><p className="mt-1 max-w-md text-sm text-slate-500">View, create, and download professionally branded PDF invoices.</p><button onClick={() => navigate("/organization/invoices?tab=invoice-list")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Open invoices</button></div>;
    return <RecentPayments summary={summary} onView={setDetails} onViewAll={() => selectTab(TAB_KEYS["payment-history"])} />;
  };

  const sectionTitle = tabKey === "overview" ? "Recent Payments" : tab;
  const sectionHint = tabKey === "overview" ? "Latest 5 verified or completed payments, newest first" : isHistory ? "All UPI payment records, newest first" : "From your organization's payment records";

  return <main className="mx-auto w-full max-w-[1680px] space-y-5 overflow-x-hidden px-3 pb-6 sm:px-4 lg:px-5">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Institute finance</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Fees & Payments</h1><p className="mt-1 text-sm text-slate-500">Track collections, dues, installments and receipts for this organization.</p></div><button onClick={exportCsv} disabled={tabKey === "upi"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="h-4 w-4"/>Export CSV</button></header>
    <nav className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-700 dark:bg-slate-900">{Object.values(TAB_KEYS).map((item) => <button key={item} onClick={() => selectTab(item)} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${tab === item ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{item}</button>)}</nav>
    {tabKey === "upi" ? <UpiPaymentVerification /> : <>
    <section aria-label="Finance summary" aria-busy={summary.loading} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([Icon,label,value]) => <article key={label} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><Icon className="h-5 w-5"/></span><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{summary.loading && !data ? "…" : value}</p></div></article>)}</section>
    {summary.error && <ErrorBanner message={summary.error} onRetry={summary.reload} />}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700"><div><h2 className="font-extrabold text-slate-900 dark:text-white">{sectionTitle}</h2><p className="mt-0.5 text-xs text-slate-500">{sectionHint}</p></div><FileText className="h-5 w-5 text-blue-600"/></header>{content()}</section>
    </>}
    {details && <PaymentDetails payment={details} onClose={() => setDetails(null)} />}
  </main>;
}

function ErrorBanner({ message, onRetry }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{message}</span><button onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold"><RefreshCw className="h-3.5 w-3.5"/>Retry</button></div>;
}

function Empty({ children }) {
  return <p className="px-5 py-10 text-center text-sm font-semibold text-slate-500">{children}</p>;
}

function Notice({ title, text }) {
  return <div className="flex flex-col items-center px-5 py-12 text-center"><FileText className="h-10 w-10 text-slate-300"/><h3 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-500">{text}</p></div>;
}

const TH = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500";
const TD = "px-4 py-3 text-sm text-slate-700 dark:text-slate-200";

function PaymentTable({ rows, onView }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[860px]"><thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className={TH}>Student</th><th className={TH}>Course</th><th className={`${TH} text-right`}>Amount</th><th className={TH}>Method</th><th className={TH}>UTR / Transaction ID</th><th className={TH}>Payment date</th><th className={TH}>Status</th><th className={TH}><span className="sr-only">Actions</span></th></tr></thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{rows.map((p) => <tr key={`${p.source ?? "UPI"}-${p.id}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
      <td className={`${TD} font-bold text-slate-900 dark:text-white`}>{p.studentName || "—"}</td>
      <td className={TD}>{p.courseName || "—"}</td>
      <td className={`${TD} text-right font-extrabold text-emerald-600`}>{money(p.amount)}</td>
      <td className={TD}>{p.method ?? p.paymentMethod}</td>
      <td className={`${TD} font-mono text-xs`}>{p.transactionId || "—"}</td>
      <td className={TD}>{formatDate(p.paidAt ?? (p.reviewedAt || p.submittedAt))}</td>
      <td className={TD}><StatusPill status={p.status}/></td>
      <td className={`${TD} text-right`}><button onClick={() => onView(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:border-slate-700"><Eye className="h-3.5 w-3.5"/>View Details<span className="sr-only">: {p.studentName}</span></button></td>
    </tr>)}</tbody></table></div>;
}

function RecentPayments({ summary, onView, onViewAll }) {
  if (summary.loading && !summary.data) return <Empty>Loading recent payments…</Empty>;
  if (summary.error && !summary.data) return <Empty>Recent payments could not be loaded.</Empty>;
  const rows = summary.data?.recentPayments ?? [];
  if (!rows.length) return <Empty>No recent payments found.</Empty>;
  return <><PaymentTable rows={rows} onView={onView}/><div className="flex justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-700"><button onClick={onViewAll} className="text-sm font-bold text-blue-700 hover:underline">View payment history →</button></div></>;
}

function PaymentHistory({ history, statusFilter, onStatus, search, onSearch, page, onPage, onView }) {
  const pages = Math.max(1, Math.ceil(history.total / HISTORY_PAGE_SIZE));
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-700">
      <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1.5">{STATUS_FILTERS.map(([value, label]) => <button key={value} role="tab" aria-selected={statusFilter === value} onClick={() => onStatus(value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${statusFilter === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>{label}</button>)}</div>
      <label className="flex min-w-[240px] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"><Search className="h-4 w-4 text-slate-400"/><span className="sr-only">Search payments</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search name, UTR, enrollment no…" className="w-full border-0! bg-transparent text-sm outline-none! shadow-none! ring-0!"/></label>
    </div>
    {history.error ? <Empty>{history.error}</Empty> : history.loading && !history.rows.length ? <Empty>Loading payments…</Empty> : !history.rows.length ? <Empty>No payments found.</Empty> : <PaymentTable rows={history.rows} onView={onView}/>}
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-700"><span>{history.total} payment{history.total === 1 ? "" : "s"}</span><div className="flex items-center gap-2"><button disabled={page <= 1 || history.loading} onClick={() => onPage(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-700">Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages || history.loading} onClick={() => onPage(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-700">Next</button></div></footer>
  </>;
}

function InvoiceRows({ rows, overdue }) {
  return <div className="divide-y divide-slate-100 dark:divide-slate-700">{rows.map((i) => <div key={i.invoiceId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-4"><div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white">{i.studentName}</p><p className="truncate text-xs text-slate-500">{i.courseName} · {i.invoiceNumber} · due {formatDate(i.dueDate)}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900 dark:text-white">{money(i.balanceAmount)}</p><p className={`text-xs font-semibold ${overdue ? "text-red-600" : "text-amber-600"}`}>{overdue ? `${i.daysOverdue} day${i.daysOverdue === 1 ? "" : "s"} overdue` : "Balance due"}</p></div></div>)}</div>;
}

function PendingPayments({ history, invoices, summary, onView, onOpenUpi }) {
  const loading = history.loading || (summary.loading && !summary.data);
  if (loading && !history.rows.length && !invoices.length) return <Empty>Loading pending payments…</Empty>;
  if (!history.rows.length && !invoices.length) return <Empty>No pending payments.</Empty>;
  return <>
    {history.rows.length > 0 && <><p className="flex items-center justify-between bg-amber-50/60 px-5 py-2 text-xs font-bold text-amber-800">UPI payments awaiting verification ({history.total})<button onClick={onOpenUpi} className="text-blue-700 hover:underline">Verify in UPI Payments →</button></p><PaymentTable rows={history.rows} onView={onView}/></>}
    {invoices.length > 0 && <><p className="bg-amber-50/60 px-5 py-2 text-xs font-bold text-amber-800">Invoice balances not yet due</p><InvoiceRows rows={invoices}/></>}
  </>;
}

function OverdueInvoices({ summary }) {
  if (summary.loading && !summary.data) return <Empty>Loading overdue payments…</Empty>;
  const rows = summary.data?.overdueInvoices ?? [];
  if (!rows.length) return <Empty>No overdue payments.</Empty>;
  return <InvoiceRows rows={rows} overdue/>;
}

function FeeStructure({ courses }) {
  if (courses.loading) return <Empty>Loading courses…</Empty>;
  if (courses.error) return <Empty>{courses.error}</Empty>;
  if (!courses.rows.length) return <Empty>No courses found.</Empty>;
  return <div className="divide-y divide-slate-100 dark:divide-slate-700">{courses.rows.map((c) => <div key={c.courseId ?? c.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-4"><div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white">{c.courseName ?? c.name ?? c.title}</p><p className="truncate text-xs text-slate-500">{[c.level, c.duration].filter(Boolean).join(" · ")}</p></div><p className="text-sm font-bold text-slate-900 dark:text-white">{money(c.price ?? c.fee ?? c.courseFee)}</p></div>)}</div>;
}

function PaymentDetails({ payment, onClose }) {
  const rows = [
    ["Student", payment.studentName],
    ["Course", payment.courseName],
    ["Amount", money(payment.amount)],
    ["Payment method", payment.method ?? payment.paymentMethod],
    [payment.source === "Invoice" ? "Invoice number" : "UTR / Transaction ID", payment.transactionId],
    ["Enrollment number", payment.enrollmentNumber],
    ["Status", statusLabel(payment.status)],
    ["Submitted", payment.submittedAt ? formatDate(payment.submittedAt, true) : null],
    [String(payment.status) === "Rejected" ? "Rejected on" : "Verified / paid on", formatDate(payment.paidAt ?? payment.reviewedAt, true)],
    ["Email", payment.email],
    ["Phone", payment.phone],
    ["Rejection reason", payment.rejectionReason],
  ].filter(([, value]) => value && value !== "—");
  return <Modal open trapFocus size="md" title="Payment details" onClose={onClose}>
    <dl className="divide-y divide-slate-100 dark:divide-slate-700">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 py-2.5 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-semibold text-slate-900 dark:text-white">{value}</dd></div>)}</dl>
  </Modal>;
}
