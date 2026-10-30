import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, Download, IndianRupee, ReceiptText, RefreshCw } from "lucide-react";
import { studentsApi } from "@/api/students";
import { paymentApi } from "@shared/services/apiServices";
import invoiceService from "@shared/services/invoiceService";
import { useAuth } from "@shared/hooks/useAuth";
import PageHeader from "@shared/components/PageHeader";
import { triggerFileDownload } from "@shared/utils/download";

const rowsFrom = (value) => {
  const rows = value?.content ?? value?.items ?? value?.records ?? value?.results ?? value?.data ?? value;
  return Array.isArray(rows) ? rows : [];
};
const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "Not available";
};
const invoiceIdOf = (record) => record?.invoiceId ?? record?.invoice?.invoiceId ?? record?.invoice?.id ?? null;
const isPaid = (record) => ["paid", "paid in full", "completed", "success", "successful"]
  .includes(String(record?.status ?? record?.paymentStatus ?? "").toLowerCase());
const validInvoiceId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const safeFilename = (value) => String(value || "invoice.pdf").split(/[\\/]/).pop().replace(/[^a-z0-9._-]/gi, "_");

const downloadMessage = async (error) => {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to download this invoice.";
  if (status === 404) return "Invoice PDF is not available.";
  if (status >= 500) return "Unable to generate the invoice PDF. Please try again.";
  if (!error?.response) return "Unable to connect to the server. Please try again.";
  return "Unable to download this invoice. Please try again.";
};

export default function StudentPayments() {
  const { user, authLoading } = useAuth();
  const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? user?.student?.id;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [downloadError, setDownloadError] = useState(null);
  const [downloadingInvoiceIds, setDownloadingInvoiceIds] = useState(new Set());
  const downloadingRef = useRef(new Set());

  const loadPayments = useCallback(async () => {
    if (authLoading) return;
    if (!studentId) {
      setPayments([]);
      setLoading(false);
      setHistoryError("Unable to identify your student account. Please log in again.");
      return;
    }
    setLoading(true);
    setHistoryError("");
    try {
      let invoices = [];
      try {
        invoices = rowsFrom(await invoiceService.list({ studentId }));
      } catch {
        // The payment endpoints may still be available when invoice-list access is denied.
      }
      const ownInvoices = invoices.filter((invoice) => {
        const owner = invoice.studentId ?? invoice.StudentId ?? invoice.student?.studentId ?? invoice.student?.id;
        return owner != null && String(owner) === String(studentId);
      });
      if (ownInvoices.length) {
        setPayments(ownInvoices);
        return;
      }
      let historyError;
      let records = [];
      try {
        records = rowsFrom(await paymentApi.paymentHistory({ studentId }));
      } catch (error) {
        historyError = error;
      }
      if (!records.length) {
        try {
          records = rowsFrom((await studentsApi.getPayments(studentId)).data);
        } catch (error) {
          if (historyError) throw historyError;
          throw error;
        }
      }
      setPayments(records);
    } catch (error) {
      setPayments([]);
      const status = error?.response?.status;
      setHistoryError(status === 401
        ? "Your session has expired. Please log in again."
        : status === 403
          ? "Your account is not authorized to view payment history."
          : status === 404
            ? "The payment history service is not available."
            : "Unable to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, studentId]);

  useEffect(() => {
    queueMicrotask(loadPayments);
  }, [loadPayments]);

  const downloadInvoice = async (payment, rowKey) => {
    const invoiceId = invoiceIdOf(payment);
    if (downloadingRef.current.has(rowKey)) return;
    if (!validInvoiceId(invoiceId)) {
      setDownloadError({ rowKey, message: "Invoice PDF is not available for this payment." });
      return;
    }
    downloadingRef.current.add(rowKey);
    setDownloadingInvoiceIds((current) => new Set(current).add(rowKey));
    setDownloadError(null);
    try {
      const { blob, filename } = await invoiceService.downloadPdf(invoiceId);
      const fallback = `Invoice_${payment.invoiceNumber ?? payment.invoiceNo ?? invoiceId}.pdf`;
      triggerFileDownload(blob, safeFilename(filename || fallback));
    } catch (error) {
      setDownloadError({ rowKey, message: await downloadMessage(error) });
    } finally {
      downloadingRef.current.delete(rowKey);
      setDownloadingInvoiceIds((current) => {
        const next = new Set(current);
        next.delete(rowKey);
        return next;
      });
    }
  };

  const paidTotal = payments.reduce((sum, payment) => sum + (isPaid(payment)
    ? Number(payment.paidAmount ?? payment.amount ?? payment.totalAmount ?? payment.grandTotal ?? 0) || 0
    : 0), 0);
  const paymentStatus = payments.length && payments.every(isPaid)
    ? "Paid in full" : payments.length ? "Payment records available" : "No payment records";

  return (
    <main className="w-full min-w-0 px-2.5 py-2 sm:px-3">
      <PageHeader compact title="Payments" subtitle="Your course payment history" />
      {historyError && (
        <section role="alert" className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">{historyError}</p>
          <button type="button" onClick={loadPayments} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Retry payment history
          </button>
        </section>
      )}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-200" />)}</div>
      ) : payments.length ? (
        <div className="space-y-2">
          <section className="grid gap-2 sm:grid-cols-3">
            <div className="flex min-h-[70px] items-center gap-3 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50"><IndianRupee className="h-4 w-4 text-blue-600" /></span><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Total paid</p><p className="text-base font-black leading-6 text-slate-900">{money(paidTotal)}</p></div></div>
            <div className="flex min-h-[70px] items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></span><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Payment status</p><p className="text-base font-black leading-6 text-emerald-700">{paymentStatus}</p></div></div>
            <div className="flex min-h-[70px] items-center gap-3 rounded-xl border border-violet-100 bg-white px-3 py-2 shadow-sm"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50"><ReceiptText className="h-4 w-4 text-violet-600" /></span><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Records</p><p className="text-base font-black leading-6 text-slate-900">{payments.length}</p></div></div>
          </section>
          <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2.5">Course</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Transaction ID</th><th className="px-3 py-2.5">Amount</th><th className="px-3 py-2.5">Method</th><th className="px-3 py-2.5">Status</th><th className="w-[120px] px-3 py-2.5 text-right">Invoice</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{payments.map((payment, index) => {
                const rowKey = String(invoiceIdOf(payment) ?? payment.paymentId ?? payment.transactionId ?? index);
                const busy = downloadingInvoiceIds.has(rowKey);
                return <tr key={rowKey}>
                  <td className="px-3 py-2.5 font-bold">{payment.courseName ?? payment.courseTitle ?? payment.serviceName ?? payment.course?.courseName ?? "Course fee"}</td>
                  <td className="px-3 py-2.5">{payment.paymentDate ?? payment.invoiceDate ?? payment.paidAt ?? payment.createdAt ?? "Not available"}</td>
                  <td className="px-3 py-2.5 font-medium">{payment.transactionId ?? payment.referenceId ?? payment.invoiceNumber ?? payment.invoiceNo ?? "Not available"}</td>
                  <td className="px-3 py-2.5 font-bold">{money(payment.amount ?? payment.totalAmount ?? payment.grandTotal ?? payment.paidAmount)}</td>
                  <td className="px-3 py-2.5">{payment.paymentMethod ?? payment.method ?? "Not available"}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${isPaid(payment) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{payment.status ?? payment.paymentStatus ?? "Not available"}</span></td>
                  <td className="w-[120px] px-3 py-2.5 text-right"><button type="button" disabled={busy} onClick={() => downloadInvoice(payment, rowKey)} className="inline-flex min-w-[96px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-600 shadow-sm transition hover:border-[#f39924] hover:text-[#133b5d] disabled:cursor-wait disabled:opacity-65"><Download className="h-3.5 w-3.5" />{busy ? "Downloading..." : "Download"}</button>
                    {downloadError?.rowKey === rowKey && <div role="alert" className="mt-1 text-left text-xs text-rose-700"><p>{downloadError.message}</p>{validInvoiceId(invoiceIdOf(payment)) && <button type="button" onClick={() => downloadInvoice(payment, rowKey)} className="mt-1 font-semibold underline">Retry this invoice</button>}</div>}
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </section>
        </div>
      ) : !historyError ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CreditCard className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-3 font-bold text-slate-800">No payment records</h2><p className="mt-1 text-sm text-slate-500">Your payment history will appear here when it is available.</p></section>
      ) : null}
    </main>
  );
}
