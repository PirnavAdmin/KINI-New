import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, BadgeCheck, Eye, Loader2, ReceiptIndianRupee, Search, ShieldCheck, XCircle } from "lucide-react";
import {
  OrgEmpty,
  OrgHero,
  OrgPage,
  OrgSearch,
  OrgSelect,
  OrgStatus,
  OrgTableFooter,
} from "../components/org-ui/OrgPageKit";
import ReviewDialog, { DetailList } from "../components/enrollment-review/ReviewDialog";
import {
  formatAmount,
  formatDate,
  formatDateTime,
  useDebounced,
  usePagedList,
} from "../components/enrollment-review/reviewFormat";
import { enrollmentReviewApi, toEnrollmentError } from "@shared/services/publicEnrollmentApi";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  ["PendingVerification", "Pending verification"],
  ["Verified", "Verified"],
  ["Rejected", "Rejected"],
  ["all", "All payments"],
];
const STATUS_TONE = { PendingVerification: "warn", Verified: "success", Rejected: "danger" };
const STATUS_LABEL = { PendingVerification: "Pending", Verified: "Verified", Rejected: "Rejected" };

/**
 * Organization → Payment Verification. Lists UPI payment proofs submitted by
 * public enrollments. Verify only after matching the UTR and amount in the
 * organization's actual bank / UPI statement.
 */
export default function PaymentVerification() {
  const [status, setStatus] = useState("PendingVerification");
  const [query, setQuery] = useState("");
  const search = useDebounced(query);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  // Back to page 1 whenever the filter or search changes.
  const [filterKey, setFilterKey] = useState(`${status}|${search}`);
  if (filterKey !== `${status}|${search}`) {
    setFilterKey(`${status}|${search}`);
    setPage(1);
  }
  const list = usePagedList(enrollmentReviewApi.getPayments, { status, search: search || undefined, page, pageSize: PAGE_SIZE });
  const result = list;
  const loading = list.loading;
  const error = list.error ? toEnrollmentError(list.error) : null;
  const load = list.reload;

  const onReviewed = () => {
    setSelected(null);
    load();
  };

  return (
    <OrgPage>
      <OrgHero
        icon={ShieldCheck}
        title="Payment Verification"
        subtitle="Check each UPI payment against your bank or UPI statement before verifying it."
        plain
      />

      <div className="kx-toolbar" role="search">
        <OrgSearch icon={Search} value={query} onChange={setQuery} placeholder="Search name, email, phone, UTR or enrollment no." label="Search payments" />
        <OrgSelect label="Filter by status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      <section className="kx-panel kx-panel--flush" aria-label="Payments">
        {error ? (
          <div className="kx-note kx-note--error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <span>{error.status === 403 ? "You don't have permission to view payment verification. Ask your organization admin for the “Payment Verification” permission." : error.message}</span>
            {error.status !== 403 && <button type="button" className="kx-note__action" onClick={load}>Retry</button>}
          </div>
        ) : (
          <>
            <div className="kx-table-wrap">
              <table className="kx-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th className="kx-num">Amount</th>
                    <th>UTR</th>
                    <th>Paid on</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, row) => (
                      <tr key={row}>
                        {Array.from({ length: 8 }).map((__, cell) => (
                          <td key={cell}><span className="kx-skel" style={{ display: "block", height: 16, width: "70%" }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : result.data.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <OrgEmpty
                          icon={ReceiptIndianRupee}
                          title={status === "PendingVerification" ? "No payments waiting for verification" : "No payments found"}
                          text={search ? "Try a different search." : "New UPI payment proofs from public enrollments appear here."}
                        />
                      </td>
                    </tr>
                  ) : (
                    result.data.map((payment) => (
                      <tr key={payment.paymentId}>
                        <td>
                          <span className="kx-strong">{payment.studentName}</span>
                          <span className="kx-cell-sub">{payment.email} · {payment.phone}</span>
                        </td>
                        <td>
                          {payment.courseName}
                          <span className="kx-cell-sub">{payment.enrollmentNumber}</span>
                        </td>
                        <td className="kx-num">{formatAmount(payment.amount)}</td>
                        <td><span className="font-mono text-sm">{payment.utrNumber}</span>
                          {payment.previousRejections > 0 && <span className="kx-cell-sub">Attempt {payment.attemptNumber}</span>}
                        </td>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td>{formatDateTime(payment.submittedAt)}</td>
                        <td><OrgStatus tone={STATUS_TONE[payment.status] ?? "muted"} dot>{STATUS_LABEL[payment.status] ?? payment.status}</OrgStatus></td>
                        <td>
                          <div className="kx-cell-actions">
                            <button type="button" className="kx-btn kx-btn--soft kx-btn--sm" onClick={() => setSelected(payment)}>
                              <Eye aria-hidden="true" /> {payment.status === "PendingVerification" ? "Review" : "View"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && result.totalRecords > 0 && (
              <OrgTableFooter page={page} pageSize={PAGE_SIZE} total={result.totalRecords} noun={result.totalRecords === 1 ? "payment" : "payments"} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      {selected && (
        <PaymentReviewDialog key={selected.paymentId} payment={selected} onClose={() => setSelected(null)} onReviewed={onReviewed} />
      )}
    </OrgPage>
  );
}

function PaymentReviewDialog({ payment, onClose, onReviewed }) {
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [screenshotError, setScreenshotError] = useState(null);
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  // Keyed by paymentId, so every dialog starts with fresh state.
  useEffect(() => {
    let url = null;
    let active = true;
    enrollmentReviewApi.getPaymentScreenshotUrl(payment.paymentId)
      .then((objectUrl) => {
        url = objectUrl;
        if (active) setScreenshotUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch((err) => active && setScreenshotError(toEnrollmentError(err).message));
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [payment]);

  const pending = payment.status === "PendingVerification";

  const act = async (kind) => {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "verify") await enrollmentReviewApi.verifyPayment(payment.paymentId, note.trim());
      else await enrollmentReviewApi.rejectPayment(payment.paymentId, reason.trim());
      toast.success(kind === "verify" ? "Payment verified — moved to enrollment approval" : "Payment rejected — the student can resubmit");
      onReviewed();
    } catch (err) {
      const normalized = toEnrollmentError(err);
      setError(normalized.status === 403
        ? "You don't have permission to verify or reject payments."
        : normalized.fieldErrors.reason || normalized.message);
      if (normalized.code === "PAYMENT_ALREADY_REVIEWED") onReviewed();
    } finally {
      setBusy(null);
    }
  };

  const footer = pending ? (
    rejecting ? (
      <>
        <button type="button" className="kx-btn kx-btn--ghost" onClick={() => setRejecting(false)} disabled={Boolean(busy)}>Back</button>
        <button type="button" className="kx-btn kx-btn--primary" style={{ background: "#e5484d", borderColor: "#e5484d" }} onClick={() => act("reject")} disabled={Boolean(busy) || reason.trim().length < 5}>
          {busy === "reject" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <XCircle aria-hidden="true" />} Reject payment
        </button>
      </>
    ) : (
      <>
        <button type="button" className="kx-btn kx-btn--ghost" onClick={() => setRejecting(true)} disabled={Boolean(busy)}>
          <XCircle aria-hidden="true" /> Reject
        </button>
        <button type="button" className="kx-btn kx-btn--primary" onClick={() => act("verify")} disabled={Boolean(busy) || !checked}>
          {busy === "verify" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <BadgeCheck aria-hidden="true" />} Verify payment
        </button>
      </>
    )
  ) : (
    <button type="button" className="kx-btn kx-btn--ghost" onClick={onClose}>Close</button>
  );

  return (
    <ReviewDialog
      open
      wide
      busy={Boolean(busy)}
      onClose={onClose}
      title={`${payment.studentName} · ${formatAmount(payment.amount)}`}
      subtitle={`${payment.enrollmentNumber} · ${payment.courseName}`}
      footer={footer}
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <DetailList items={[
            ["Student", payment.studentName],
            ["Email", payment.email],
            ["Phone", payment.phone],
            ["Qualification", payment.highestQualification],
            ["Course", payment.courseName],
            ["Batch", payment.batchName],
            ["Expected amount", formatAmount(payment.amount)],
            ["UTR / reference", <span key="utr" className="font-mono">{payment.utrNumber}</span>],
            ["Payment date", formatDate(payment.paymentDate)],
            ["Submitted", formatDateTime(payment.submittedAt)],
            payment.previousRejections > 0 && ["Previous rejections", String(payment.previousRejections)],
            payment.reviewedBy && ["Reviewed", `${formatDateTime(payment.reviewedAt)}`],
            payment.rejectionReason && ["Rejection reason", payment.rejectionReason],
          ]} />

          {pending && !rejecting && (
            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                <input type="checkbox" className="mt-0.5 h-4 w-4" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <span>I checked our bank / UPI statement: a payment with UTR <strong className="font-mono">{payment.utrNumber}</strong> for <strong>{formatAmount(payment.amount)}</strong> was received.</span>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold">Internal note (optional)</span>
                <input className="kx-input" style={{ width: "100%" }} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Matched in HDFC statement 17 Nov" />
              </label>
            </div>
          )}

          {pending && rejecting && (
            <label className="mt-5 block text-sm">
              <span className="mb-1 block font-semibold">Reason for rejection <span className="text-rose-500">*</span></span>
              <textarea
                className="kx-input"
                style={{ width: "100%", minHeight: 96, paddingTop: 8 }}
                value={reason}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell the student what to fix, e.g. “No payment with this UTR was received” or “Amount paid was ₹4,000 instead of ₹4,999.”"
                autoFocus
              />
              <span className="mt-1 block text-xs text-slate-500">The student sees this reason and can resubmit. The attempt is kept for your records.</span>
            </label>
          )}

          {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        </div>

        <figure className="min-w-0">
          <figcaption className="mb-2 text-xs font-semibold text-slate-500">Payment screenshot</figcaption>
          <div className="grid min-h-64 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/40">
            {screenshotUrl ? (
              <a href={screenshotUrl} target="_blank" rel="noreferrer" title="Open full size">
                <img src={screenshotUrl} alt={`Payment screenshot for UTR ${payment.utrNumber}`} className="max-h-[60vh] w-full object-contain" />
              </a>
            ) : screenshotError ? (
              <p className="p-4 text-sm text-rose-600">{screenshotError}</p>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading screenshot" />
            )}
          </div>
        </figure>
      </div>
    </ReviewDialog>
  );
}
