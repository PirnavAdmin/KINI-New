/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileWarning, Loader2, Printer, ReceiptText } from "lucide-react";
import invoiceService from "@shared/services/invoiceService";
import { normalizeInvoice } from "../utils/invoicePresentation";
import InvoiceDetailsContent from "../components/InvoiceDetailsContent";
import { ROUTES } from "@shared/constants/routeConstants";
import EmptyState from "@shared/components/EmptyState";
import Skeleton from "@shared/ui/Skeleton";
import { triggerFileDownload } from "@shared/utils/download";
import "../components/invoice-details.css";

const statusStyles = {
  Paid: "bg-[#e6f7ef] text-[#08734d]",
  Pending: "bg-[#fff1dc] text-[#945300]",
  Overdue: "bg-[#fff0f2] text-[#b52d4a]",
  Cancelled: "bg-slate-100 text-slate-500",
};

// Same filename-sanitizing/download pattern already proven for invoice PDFs
// in the student's own "My Payments" page (StudentPayments.jsx).
const safeFilename = (value) => String(value || "invoice.pdf").split(/[\\/]/).pop().replace(/[^a-z0-9._-]/gi, "_");
const downloadMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to download this invoice.";
  if (status === 404) return "Invoice PDF is not available.";
  if (status >= 500) return "Unable to generate the invoice PDF. Please try again.";
  if (!error?.response) return "Unable to connect to the server. Please try again.";
  return "Unable to download this invoice. Please try again.";
};

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);
    try {
      const raw = await invoiceService.get(invoiceId);
      if (!raw || typeof raw !== "object") {
        setNotFound(true);
        return;
      }
      setInvoice(normalizeInvoice(raw));
    } catch (requestError) {
      if (requestError?.response?.status === 404) setNotFound(true);
      else setError(requestError?.response?.data?.message || requestError?.message || "Unable to load this invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      const { blob, filename } = await invoiceService.downloadPdf(invoiceId);
      triggerFileDownload(blob, safeFilename(filename || `${invoice?.id || invoiceId}.pdf`));
    } catch (requestError) {
      setDownloadError(downloadMessage(requestError));
    } finally {
      setDownloading(false);
    }
  };

  const backToInvoices = () => navigate(ROUTES.ORG_ADMIN.INVOICES);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6" style={{ background: "#F8FAFC" }}>
        <Skeleton variant="text" className="!w-32" />
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" className="!h-10 !w-10 !rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="title" className="!h-5 !w-48" />
              <Skeleton variant="text" className="!w-32" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton variant="text" count={6} />
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <EmptyState
          icon={FileWarning}
          title="Invoice not found"
          description={`No invoice exists for ID "${invoiceId}", or it may have been removed.`}
          action={<button type="button" onClick={backToInvoices} className="rounded-xl bg-[#133B5D] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">Back to Invoices</button>}
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <EmptyState
          icon={FileWarning}
          title="Unable to load invoice"
          description={error}
          action={<button type="button" onClick={load} className="rounded-xl bg-[#133B5D] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">Retry</button>}
        />
      </main>
    );
  }

  const statusClass = statusStyles[invoice.status] || "bg-slate-100 text-slate-500";

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6" style={{ color: "#0F172A" }}>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs font-medium" style={{ color: "#64748B" }}>
        <button type="button" onClick={backToInvoices} className="hover:text-[#133B5D]">Invoices</button>
        <span aria-hidden="true">/</span>
        <span className="truncate font-semibold" style={{ color: "#0F172A" }}>{invoice.id}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <button type="button" onClick={backToInvoices} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" style={{ color: "#133B5D" }}>
          <ArrowLeft className="h-4 w-4" />Invoices
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#133B5D]/10 text-[#133B5D]"><ReceiptText className="h-5 w-5" /></div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold" style={{ color: "#0F172A" }}>{invoice.id}</h1>
          <p className="truncate text-xs" style={{ color: "#64748B" }}>{invoice.customerName}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass}`}>{invoice.status}</span>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" style={{ color: "#133B5D" }}>
            <Printer className="h-4 w-4" />Print
          </button>
          <button type="button" onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-1.5 rounded-xl bg-[#F39924] px-3 py-1.5 text-xs font-bold text-[#133B5D] hover:brightness-95 disabled:cursor-wait disabled:opacity-60">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Downloading…" : "Download"}
          </button>
        </div>
      </header>
      {downloadError && <p className="text-sm font-medium text-[#b52d4a]">{downloadError}</p>}

      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <InvoiceDetailsContent invoice={invoice} />
      </div>
    </main>
  );
}
