import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ImageUp,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import EnrollmentShell, { EnrollmentCard, EnrollmentNotice } from "../components/EnrollmentShell";
import { formatRupees, inputClass, primaryButtonClass, primaryButtonStyle, secondaryButtonClass } from "../utils/enrollmentUi";
import useEnrollmentToken from "../hooks/useEnrollmentToken";
import { BRAND } from "../theme";
import { enrollmentRoutes, publicEnrollmentApi, toEnrollmentError } from "@shared/services/publicEnrollmentApi";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** Shown when the enrollment can't be opened (no token, expired, not found). */
export function EnrollmentAccessProblem({ error }) {
  const expired = error?.code === "ENROLLMENT_TOKEN_EXPIRED";
  const missing = !error || error.code === "ENROLLMENT_TOKEN_REQUIRED";
  return (
    <EnrollmentShell width="max-w-xl">
      <EnrollmentCard className="text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold">
          {expired ? "This enrollment link has expired" : missing ? "Open your enrollment link" : "We couldn't open this enrollment"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {expired
            ? "For your security, enrollment links expire. Request a new link and we'll email it to you."
            : missing
              ? "Use the private link from your enrollment email, or request a new one."
              : error.message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={enrollmentRoutes.access} className={primaryButtonClass} style={primaryButtonStyle}>
            Email me a new link
          </Link>
          <Link to="/courses" className={secondaryButtonClass}>Browse courses</Link>
        </div>
      </EnrollmentCard>
    </EnrollmentShell>
  );
}

export default function UpiPaymentPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const token = useEnrollmentToken(enrollmentId);

  const [details, setDetails] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrFailed, setQrFailed] = useState(false);

  const [utr, setUtr] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIso);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const submittingRef = useRef(false);

  // ---- Load payment details (fee, organization, UPI) from the backend ----
  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    publicEnrollmentApi.getPaymentDetails(enrollmentId, token)
      .then((data) => {
        if (!active) return;
        // Already submitted / verified / approved: the status screen explains what's next.
        if (!data.canSubmitPayment && data.enrollmentStatus !== "PendingPayment") {
          navigate(enrollmentRoutes.status(enrollmentId), { replace: true });
          return;
        }
        setDetails(data);
      })
      .catch((error) => active && setLoadError(toEnrollmentError(error)));
    return () => { active = false; };
  }, [enrollmentId, token, navigate]);

  // ---- Organization QR image (needs the token header, so fetched as a blob) ----
  useEffect(() => {
    if (!details?.hasQrImage) return undefined;
    let url = null;
    let active = true;
    publicEnrollmentApi.getPaymentQrUrl(enrollmentId, token)
      .then((objectUrl) => {
        url = objectUrl;
        if (active) setQrUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => active && setQrFailed(true));
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [details?.hasQrImage, enrollmentId, token]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const maxBytes = details?.maxScreenshotBytes || 5 * 1024 * 1024;
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  const clientErrors = useMemo(() => {
    const errors = {};
    const normalized = utr.replace(/\s+/g, "").toUpperCase();
    if (!normalized) errors.utrNumber = "Enter the UTR / UPI reference number.";
    else if (!/^[A-Z0-9]{12,22}$/.test(normalized)) errors.utrNumber = "The UTR is 12–22 letters or digits (UPI UTRs are usually 12 digits).";
    if (!paymentDate) errors.paymentDate = "Select the payment date.";
    else if (paymentDate > todayIso()) errors.paymentDate = "Payment date cannot be in the future.";
    if (!file) errors.screenshot = "Upload a screenshot of the successful payment.";
    return errors;
  }, [utr, paymentDate, file]);

  const onFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";
    setFieldErrors((current) => ({ ...current, screenshot: undefined }));
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFieldErrors((current) => ({ ...current, screenshot: "Only JPG, PNG or WebP images are allowed." }));
      return;
    }
    if (selected.size > maxBytes) {
      setFieldErrors((current) => ({ ...current, screenshot: `The image must be ${maxMb} MB or smaller.` }));
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(details.upiId);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Couldn't copy — please select the UPI ID manually.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setFieldErrors(clientErrors);
    setSubmitError(null);
    if (Object.keys(clientErrors).length || !confirmed) return;

    submittingRef.current = true;
    setSubmitting(true);
    setProgress(0);
    try {
      await publicEnrollmentApi.submitPayment(
        enrollmentId,
        token,
        { utrNumber: utr.replace(/\s+/g, "").toUpperCase(), paymentDate, screenshot: file },
        (evt) => evt.total && setProgress(Math.round((evt.loaded / evt.total) * 100)),
      );
      toast.success("Payment proof submitted");
      navigate(enrollmentRoutes.status(enrollmentId), { replace: true });
    } catch (error) {
      const normalized = toEnrollmentError(error);
      if (["PAYMENT_ALREADY_SUBMITTED", "DUPLICATE_SUBMISSION"].includes(normalized.code)) {
        toast(normalized.message);
        navigate(enrollmentRoutes.status(enrollmentId), { replace: true });
        return;
      }
      const errors = { ...normalized.fieldErrors };
      if (normalized.code === "DUPLICATE_UTR") errors.utrNumber = normalized.message;
      if (normalized.code === "DUPLICATE_SCREENSHOT") errors.screenshot = normalized.message;
      setFieldErrors(errors);
      setSubmitError(normalized);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!token || loadError) return <EnrollmentAccessProblem error={loadError} />;

  if (!details) {
    return (
      <EnrollmentShell>
        <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading payment details…
        </div>
      </EnrollmentShell>
    );
  }

  const fee = formatRupees(details.feeAmount);
  const showError = (name) => fieldErrors[name];

  return (
    <EnrollmentShell>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 2 of 3 · Enrollment {details.enrollmentNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: BRAND.primary }}>
          <span className="dark:text-white">Pay with UPI</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Pay {details.organizationName} directly, then upload your payment proof. Your enrollment is confirmed after the organization verifies the payment.
        </p>
      </header>

      {details.lastRejectionReason && (
        <div className="mb-5">
          <EnrollmentNotice tone="warning" icon={AlertTriangle} title="Your previous payment proof was rejected">
            {details.lastRejectionReason} Please check the details and submit again. A UTR can only be used once, so
            if you paid again, enter the new payment&apos;s UTR; if your earlier payment was genuine, contact the organization.
            {details.remainingAttempts > 0 && ` (${details.remainingAttempts} attempt${details.remainingAttempts === 1 ? "" : "s"} left)`}
          </EnrollmentNotice>
        </div>
      )}

      {!details.upiConfigured && (
        <div className="mb-5">
          <EnrollmentNotice tone="error" icon={AlertTriangle} title="UPI payments aren't set up yet">
            {details.organizationName} hasn't added its UPI details. Your enrollment is saved — please contact the organization, then reopen this page.
          </EnrollmentNotice>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------- Payment details ---------------- */}
        <EnrollmentCard aria-labelledby="pay-heading">
          <h2 id="pay-heading" className="sr-only">Payment details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-slate-500 dark:text-slate-400">Course</dt>
              <dd className="font-semibold">{details.courseName}{details.batchName ? <span className="font-normal text-slate-500"> · {details.batchName}</span> : null}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Pay to</dt>
              <dd className="font-semibold">{details.upiPayeeName || details.organizationName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Course fee</dt>
              <dd className="text-2xl font-bold tabular-nums" style={{ color: BRAND.accent }}>{fee}</dd>
            </div>
          </dl>

          {details.upiConfigured && (
            <>
              <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-white/15 dark:bg-slate-950/40">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`UPI QR code for ${details.upiPayeeName || details.organizationName}`}
                    className="h-56 w-56 rounded-lg bg-white object-contain p-2 shadow-sm"
                    width="224"
                    height="224"
                  />
                ) : details.hasQrImage && !qrFailed ? (
                  <div className="grid h-56 w-56 place-items-center" role="status"><Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading QR code" /></div>
                ) : (
                  <div className="grid h-40 w-full place-items-center text-center text-sm text-slate-500">
                    <div>
                      <QrCode className="mx-auto h-8 w-8" aria-hidden="true" />
                      <p className="mt-2">QR code not available — pay to the UPI ID below.</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900">
                  <span className="text-xs text-slate-500">UPI ID</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-sm font-semibold" title={details.upiId}>{details.upiId}</span>
                  <button type="button" onClick={copyUpiId} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/10" aria-label="Copy UPI ID">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {details.upiPaymentUri && (
                  <a href={details.upiPaymentUri} className={`${secondaryButtonClass} mt-3 w-full max-w-sm sm:hidden`}>
                    <Smartphone className="h-4 w-4" aria-hidden="true" /> Open UPI app to pay {fee}
                  </a>
                )}
              </div>

              <ol className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {details.instructions.map((line, index) => (
                  <li key={line} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: BRAND.primary }}>{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </EnrollmentCard>

        {/* ---------------- Payment proof ---------------- */}
        <EnrollmentCard aria-labelledby="proof-heading">
          <h2 id="proof-heading" className="text-lg font-bold">Submit payment proof</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            After paying {fee}, enter the transaction details exactly as shown in your UPI app.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="utr" className="mb-1.5 block text-sm font-semibold">UTR / UPI reference number <span className="text-rose-500">*</span></label>
              <input
                id="utr"
                inputMode="text"
                autoComplete="off"
                value={utr}
                onChange={(e) => { setUtr(e.target.value.toUpperCase()); setFieldErrors((c) => ({ ...c, utrNumber: undefined })); }}
                placeholder="e.g. 412345678901"
                maxLength={30}
                className={`${inputClass} font-mono tracking-wide`}
                aria-invalid={Boolean(showError("utrNumber"))}
                aria-describedby="utr-help utr-error"
                disabled={!details.canSubmitPayment || submitting}
              />
              <p id="utr-help" className="mt-1 text-xs text-slate-500">Find it under “UPI transaction ID”, “UTR” or “Ref. No.” in the payment receipt.</p>
              {showError("utrNumber") && <p id="utr-error" className="mt-1 text-xs font-medium text-rose-600">{showError("utrNumber")}</p>}
            </div>

            <div>
              <label htmlFor="payment-date" className="mb-1.5 block text-sm font-semibold">Payment date <span className="text-rose-500">*</span></label>
              <input
                id="payment-date"
                type="date"
                value={paymentDate}
                max={todayIso()}
                onChange={(e) => { setPaymentDate(e.target.value); setFieldErrors((c) => ({ ...c, paymentDate: undefined })); }}
                className={inputClass}
                aria-invalid={Boolean(showError("paymentDate"))}
                disabled={!details.canSubmitPayment || submitting}
              />
              {showError("paymentDate") && <p className="mt-1 text-xs font-medium text-rose-600">{showError("paymentDate")}</p>}
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-semibold">Payment screenshot <span className="text-rose-500">*</span></span>
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <img src={previewUrl} alt="Selected payment screenshot" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button" onClick={clearFile} disabled={submitting} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Remove screenshot">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="screenshot"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5"
                >
                  <ImageUp className="h-6 w-6" aria-hidden="true" />
                  <span className="mt-2 font-medium text-slate-700 dark:text-slate-200">Choose screenshot</span>
                  <span className="mt-0.5 text-xs">JPG, PNG or WebP · up to {maxMb} MB</span>
                </label>
              )}
              <input
                id="screenshot"
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="sr-only"
                onChange={onFileChange}
                disabled={!details.canSubmitPayment || submitting}
              />
              {showError("screenshot") && <p className="mt-1 text-xs font-medium text-rose-600">{showError("screenshot")}</p>}
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                disabled={!details.canSubmitPayment || submitting}
              />
              <span>I paid exactly <strong>{fee}</strong> to <strong>{details.upiId || details.organizationName}</strong> and the details above match my payment receipt.</span>
            </label>

            {submitError && !Object.keys(fieldErrors).some((k) => fieldErrors[k]) && (
              <EnrollmentNotice tone="error" icon={AlertTriangle} title="Payment proof not submitted">
                {submitError.message}
              </EnrollmentNotice>
            )}

            <button
              type="submit"
              className={`${primaryButtonClass} w-full`}
              style={primaryButtonStyle}
              disabled={!details.canSubmitPayment || submitting || !confirmed}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Uploading… {progress ? `${progress}%` : ""}</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Submit Payment</>
              )}
            </button>

            <p className="flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Your screenshot is stored privately and is only visible to {details.organizationName}'s payment team.
              Submitting proof does not confirm the payment — the organization checks it against its bank statement.
            </p>
            <p className="text-center text-xs">
              <Link to={enrollmentRoutes.status(enrollmentId)} className="font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300">
                View enrollment status
              </Link>
            </p>
          </form>
        </EnrollmentCard>
      </div>
    </EnrollmentShell>
  );
}
