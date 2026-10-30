import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Download, FileText, IndianRupee, ReceiptText, WalletCards } from "lucide-react";
import { demoOrganizationStore } from "@features/organization/data/demoOrganizationStore";
import { getEnrollmentApprovalRequests } from "@shared/services/enrollmentApprovalStore";

const TAB_KEYS = { overview: "Overview", "fee-structure": "Fee Structure", payments: "Student Payments", pending: "Pending Payments", overdue: "Overdue Payments", emi: "EMI Tracking", coupons: "Coupons / Discounts", invoices: "Invoices / Receipts", "payment-history": "Payment History" };
const keyFor = (label) => Object.entries(TAB_KEYS).find(([, value]) => value === label)?.[0] || "overview";
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function FinanceManagement() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tabKey = Object.hasOwn(TAB_KEYS, params.get("tab")) ? params.get("tab") : "overview";
  const tab = TAB_KEYS[tabKey];
  const selectedStudent = params.get("student");
  const [finance] = useState(() => demoOrganizationStore.getFinance());
  const enrollmentPayments = getEnrollmentApprovalRequests({ includeResolved: true })
    .filter((request) => request.payment?.status === "Successful")
    .map((request) => ({
      id: request.payment.transactionId,
      studentName: [request.student?.firstName, request.student?.lastName].filter(Boolean).join(" "),
      amount: Number(request.payment.amount || 0),
      method: request.payment.method || "Online",
      date: String(request.payment.paidAt || request.createdAt || "").slice(0, 10),
    }));
  const students = useMemo(() => finance.students.filter((s) => !selectedStudent || s.id === selectedStudent || s.name === selectedStudent), [finance.students, selectedStudent]);
  const totalPaid = finance.students.reduce((sum, s) => sum + s.paid, 0) + enrollmentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = finance.students.reduce((sum, s) => sum + s.pending, 0);
  const payments = [...enrollmentPayments, ...finance.payments.map((p) => ({ ...p, student: finance.students.find((s) => s.id === p.studentId) }))];
  const paymentStudentName = (payment) => payment.student?.name || payment.studentName || "Student";

  const selectTab = (label) => { const next = new URLSearchParams(params); next.set("tab", keyFor(label)); next.delete("student"); setParams(next); };
  const downloadCsv = () => {
    const rows = finance.students.map((s) => [s.name, s.course?.name || "", s.batch?.name || "", s.paid, s.pending]);
    const csv = [["Student", "Course", "Batch", "Paid", "Pending"], ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `finance-${tabKey}.csv`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const studentRow = (s, primary, secondary, tone = "text-slate-500") => <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"><div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</p><p className="truncate text-xs text-slate-500">{s.course?.name} · {s.batch?.name}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900 dark:text-white">{primary}</p><p className={`text-xs font-semibold ${tone}`}>{secondary}</p></div></div>;

  const content = () => {
    if (tabKey === "fee-structure") return students.map((s) => studentRow(s, money(s.fee), `${money(s.fee * .05)} eligible discount`, "text-blue-600"));
    if (tabKey === "payments" || tabKey === "payment-history") return payments.map((p) => <div key={p.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{p.student?.name || "Student"}</p><p className="text-xs text-slate-500">{p.id} · {p.method} · {p.date}</p></div><p className="text-sm font-extrabold text-emerald-600">+{money(p.amount)}</p></div>);
    if (tabKey === "pending" || tabKey === "overdue") return students.filter((s) => s.pending).map((s, i) => studentRow(s, money(s.pending), tabKey === "overdue" ? `${7 + i * 5} days overdue` : "Payment pending", tabKey === "overdue" ? "text-red-600" : "text-amber-600"));
    if (tabKey === "emi") return students.filter((s) => s.pending).map((s) => studentRow(s, `${money(Math.ceil(s.pending / 3))}/month`, `3 installments · ${money(s.pending)} balance`, "text-violet-600"));
    if (tabKey === "coupons") return <div className="grid gap-3 p-5 sm:grid-cols-2"><Coupon code="WELCOME10" text="10% off for new enrollments" color="blue"/><Coupon code="EARLYBIRD5" text="5% early-payment discount" color="emerald"/></div>;
    if (tabKey === "invoices") return <div className="flex flex-col items-center px-5 py-12 text-center"><FileText className="h-10 w-10 text-blue-500"/><h3 className="mt-3 font-bold text-slate-900 dark:text-white">Invoices and receipts</h3><p className="mt-1 max-w-md text-sm text-slate-500">View, create, and download professionally branded PDF invoices.</p><button onClick={() => navigate("/organization/invoices?tab=invoice-list")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Open invoices</button></div>;
    return students.map((s) => studentRow(s, `${money(s.paid)} paid`, s.pending ? `${money(s.pending)} pending` : "Paid in full", s.pending ? "text-amber-600" : "text-emerald-600"));
  };

  return <main className="mx-auto w-full max-w-[1680px] space-y-5 overflow-x-hidden px-3 pb-6 sm:px-4 lg:px-5">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Institute finance</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Fees & Payments</h1><p className="mt-1 text-sm text-slate-500">Track collections, dues, installments and receipts for this organization.</p></div><button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="h-4 w-4"/>Export CSV</button></header>
    <nav className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-700 dark:bg-slate-900">{Object.values(TAB_KEYS).map((item) => <button key={item} onClick={() => selectTab(item)} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${tab === item ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{item}</button>)}</nav>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[IndianRupee,"Collected",money(totalPaid)],[WalletCards,"Pending",money(totalPending)],[ReceiptText,"Overdue",money(45000)],[CreditCard,"Transactions",finance.payments.length]].map(([Icon,label,value]) => <article key={label} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><Icon className="h-5 w-5"/></span><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{value}</p></div></article>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700"><div><h2 className="font-extrabold text-slate-900 dark:text-white">{tab}</h2><p className="mt-0.5 text-xs text-slate-500">Live finance records · {students.length} students</p></div><FileText className="h-5 w-5 text-blue-600"/></header><div className="divide-y divide-slate-100 dark:divide-slate-700">{content()}</div></section>
  </main>;
}

function Coupon({ code, text, color }) {
  const styles = color === "emerald" ? "border-emerald-300 bg-emerald-50/60 text-emerald-700" : "border-blue-300 bg-blue-50/60 text-blue-700";
  return <div className={`rounded-xl border border-dashed p-4 ${styles}`}><p className="font-bold">{code}</p><p className="mt-1 text-xs text-slate-600">{text} · Active</p></div>;
}
