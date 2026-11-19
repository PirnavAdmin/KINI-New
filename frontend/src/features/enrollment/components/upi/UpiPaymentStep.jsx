import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheckCircle, FiCreditCard, FiImage,
  FiInfo, FiLoader, FiMaximize, FiRefreshCw, FiSmartphone, FiUploadCloud, FiX,
} from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { SCREENSHOT_MAX_BYTES, SCREENSHOT_TYPES } from "@shared/services/upiPaymentService";
import { BRAND } from "../../theme";
import { ApiImage, CopyButton, UpiCard } from "./upiUi";
import { DANGER, SUCCESS, inr, upiTheme } from "./upiTokens";

// Letter tiles, not brand logos: the app has no licensed logo assets.
const UPI_APPS = [
  { id: "gpay", name: "Google Pay", letter: "G", color: "#4285F4", scheme: "tez://upi/pay" },
  { id: "phonepe", name: "PhonePe", letter: "P", color: "#5F259F", scheme: "phonepe://pay" },
  { id: "paytm", name: "Paytm", letter: "T", color: "#00B9F1", scheme: "paytmmp://pay" },
  { id: "bhim", name: "BHIM", letter: "B", color: "#F37021", scheme: "upi://pay" },
];

const UTR_PATTERN = /^[A-Za-z0-9]{6,30}$/;

const upiLink = (scheme, { upiId, payeeName, amount, note }) => {
  const params = new URLSearchParams({ pa: upiId, pn: payeeName || "", cu: "INR" });
  if (amount) params.set("am", Number(amount).toFixed(2));
  if (note) params.set("tn", note.slice(0, 60));
  return `${scheme}?${params.toString()}`;
};

function SectionTitle({ icon: Icon, children, theme }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold sm:text-[15px]" style={{ color: theme.heading }}>
      <Icon aria-hidden="true" className="h-4 w-4" style={{ color: theme.link }} />
      {children}
    </h3>
  );
}

function DetailRow({ label, value, theme }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.input }}>
      <span className="w-[84px] shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.textMuted }}>{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: theme.text }} title={value}>{value || "—"}</span>
      <CopyButton value={value} label={label} theme={theme} />
    </div>
  );
}

function ScreenshotDrop({ file, onFile, error, theme, inputId }) {
  const [dragging, setDragging] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const inputRef = useRef(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const take = (list) => { const next = list?.[0]; if (next) onFile(next); };

  return (
    <div>
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); take(event.dataTransfer.files); }}
        className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors"
        style={{
          border: `1.5px dashed ${error ? DANGER : dragging ? BRAND.secondary : theme.border}`,
          backgroundColor: dragging ? theme.panelStrong : theme.panel,
        }}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ backgroundColor: theme.card, color: theme.link }}>
          <FiUploadCloud aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          {file ? (
            <>
              <p className="truncate font-semibold" style={{ color: theme.text }}>{file.name}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{(file.size / 1024 / 1024).toFixed(2)} MB · <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold underline-offset-2 hover:underline" style={{ color: theme.link }}>Replace</button></p>
            </>
          ) : (
            <>
              <p style={{ color: theme.textSecondary }}>
                <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold underline-offset-2 hover:underline" style={{ color: theme.link }}>Click to upload</button> or drag and drop
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>PNG, JPG or JPEG (Max 5 MB)</p>
            </>
          )}
        </div>
        <div className="relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-lg sm:h-16 sm:w-24" style={{ backgroundColor: theme.panelStrong }}>
          {preview ? (
            <>
              <img src={preview} alt="Payment screenshot preview" className="h-full w-full object-cover" />
              <button type="button" onClick={() => onFile(null)} aria-label="Remove screenshot" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white">
                <FiX className="h-3 w-3" />
              </button>
            </>
          ) : (
            <FiImage aria-hidden="true" className="h-6 w-6" style={{ color: theme.link, opacity: 0.6 }} />
          )}
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={SCREENSHOT_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => { take(event.target.files); event.target.value = ""; }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium" style={{ color: DANGER }}>{error}</p>}
    </div>
  );
}

/**
 * Step 2 of the UPI checkout: the organization's QR / UPI ID (GET
 * /enrollments/{id}/payment) and the proof form (POST /enrollments/{id}/payments).
 */
export default function UpiPaymentStep({
  courseLabel,
  progressLabel = "",
  info,
  loading,
  loadError,
  onRetry,
  submitting,
  submitError,
  rejectionNotice = "",
  onSubmit,
  onBack,
}) {
  const { isDark } = useThemeContext();
  const theme = upiTheme(isDark);
  const uid = useId();
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [qrZoom, setQrZoom] = useState(false);

  const amount = info?.amount;
  const linkData = { upiId: info?.upiId, payeeName: info?.payeeName, amount, note: courseLabel };

  const pickScreenshot = (file) => {
    if (!file) { setScreenshot(null); return; }
    if (!SCREENSHOT_TYPES.includes(file.type)) { setErrors((e) => ({ ...e, screenshot: "Upload a PNG, JPG or JPEG image." })); return; }
    if (file.size > SCREENSHOT_MAX_BYTES) { setErrors((e) => ({ ...e, screenshot: "The screenshot must be 5 MB or smaller." })); return; }
    setErrors((e) => ({ ...e, screenshot: undefined }));
    setScreenshot(file);
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    const cleanUtr = utr.replace(/\s/g, "");
    if (!cleanUtr) next.utr = "Enter the UTR / transaction ID from your UPI app.";
    else if (!UTR_PATTERN.test(cleanUtr)) next.utr = "Use letters and numbers only (usually a 12-digit number).";
    if (!screenshot) next.screenshot = "Upload a screenshot of the successful payment.";
    setErrors(next);
    if (Object.keys(next).length || submitting || loading || loadError || !Number.isFinite(amount) || amount <= 0) return;
    onSubmit({ utrNumber: cleanUtr, screenshot, amount });
  };

  const instructions = [
    "Scan the QR code or use the UPI ID to make the payment.",
    amount ? `Pay the exact amount ${inr.format(amount)}.` : "Pay the exact course fee shown in the order summary.",
    "After successful payment, enter the UTR and upload the payment screenshot.",
  ];

  return (
    <UpiCard theme={theme} className="p-4 sm:p-6" aria-labelledby={`${uid}-title`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: theme.panel, color: theme.link }}>
          <FiCreditCard aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${uid}-title`} className="text-lg font-bold sm:text-xl" style={{ color: theme.heading }}>Complete Your Payment</h2>
          <p className="mt-0.5 text-sm" style={{ color: theme.textMuted }}>
            Pay the course fee using UPI. After payment, submit the UTR and screenshot for verification.
          </p>
        </div>
        {progressLabel && (
          <span className="hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline" style={{ backgroundColor: theme.panelStrong, color: theme.link }}>{progressLabel}</span>
        )}
      </div>

      {rejectionNotice && (
        <div role="alert" className="mt-4 flex gap-3 rounded-xl p-3 text-sm" style={{ border: `1px solid ${DANGER}40`, backgroundColor: `${DANGER}10` }}>
          <FiAlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: DANGER }} />
          <p style={{ color: theme.textSecondary }}><span className="font-semibold" style={{ color: DANGER }}>Previous payment was rejected.</span> {rejectionNotice}</p>
        </div>
      )}

      {/* QR + apps */}
      {loading ? (
        <div className="mt-5 grid min-h-[260px] place-items-center rounded-xl" style={{ backgroundColor: theme.panel }}>
          <p className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}><FiLoader className="h-4 w-4 animate-spin" /> Loading payment details…</p>
        </div>
      ) : loadError ? (
        <div role="alert" className="mt-5 flex flex-col items-center gap-3 rounded-xl px-4 py-10 text-center" style={{ backgroundColor: theme.panel }}>
          <FiAlertTriangle className="h-6 w-6" style={{ color: DANGER }} />
          <p className="max-w-md text-sm" style={{ color: theme.textSecondary }}>{loadError}</p>
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${theme.border}`, color: theme.link }}>
            <FiRefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      ) : (
        <div className="mt-5 grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* Scan & pay */}
          <div className="rounded-xl p-4" style={{ backgroundColor: theme.panel }}>
            <SectionTitle icon={FiMaximize} theme={theme}>Scan &amp; Pay with UPI</SectionTitle>
            <button
              type="button"
              onClick={() => info?.qrCode && setQrZoom(true)}
              disabled={!info?.qrCode}
              aria-label="Enlarge QR code"
              className="mx-auto mt-3 grid aspect-square w-full max-w-[200px] place-items-center overflow-hidden rounded-xl bg-white p-3 shadow-sm"
              style={{ border: `1px solid ${theme.border}` }}
            >
              <ApiImage
                value={info?.qrCode}
                alt={`UPI QR code for ${info?.payeeName || "the institute"}`}
                className="h-full w-full object-contain"
                fallback={(
                  <span className="px-2 text-center text-xs leading-relaxed text-slate-500">
                    QR code isn't available. Pay to the UPI ID below.
                  </span>
                )}
              />
            </button>
            <div className="mt-3 space-y-2">
              {info?.organizationName && <DetailRow label="Institute" value={info.organizationName} theme={theme} />}
              <DetailRow label="UPI ID" value={info?.upiId} theme={theme} />
              <DetailRow label="Payee Name" value={info?.payeeName} theme={theme} />
            </div>
          </div>

          <div className="flex items-center justify-center md:flex-col" aria-hidden="true">
            <span className="h-px flex-1 md:h-auto md:w-px" style={{ backgroundColor: theme.divider }} />
            <span className="px-3 py-2 text-xs font-bold" style={{ color: theme.textMuted }}>OR</span>
            <span className="h-px flex-1 md:h-auto md:w-px" style={{ backgroundColor: theme.divider }} />
          </div>

          {/* Apps + instructions */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-4" style={{ backgroundColor: theme.panel }}>
              <SectionTitle icon={FiSmartphone} theme={theme}>Open in UPI App</SectionTitle>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {UPI_APPS.map((app) => (
                  <a
                    key={app.id}
                    href={info?.upiId ? upiLink(app.scheme, linkData) : undefined}
                    aria-disabled={!info?.upiId}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center transition-transform hover:-translate-y-0.5 ${info?.upiId ? "" : "pointer-events-none opacity-50"}`}
                    style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.card }}
                  >
                    <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg text-sm font-black text-white" style={{ backgroundColor: app.color }}>{app.letter}</span>
                    <span className="text-[11px] font-semibold leading-tight" style={{ color: theme.textSecondary }}>{app.name}</span>
                  </a>
                ))}
              </div>
              <p className="mt-2 text-[11px]" style={{ color: theme.textMuted }}>App buttons open on a phone with that app installed.</p>
            </div>

            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: theme.panelStrong }}>
              <SectionTitle icon={FiInfo} theme={theme}>Payment Instructions</SectionTitle>
              <ul className="mt-2.5 space-y-2">
                {instructions.map((line) => (
                  <li key={line} className="flex gap-2 text-[13px] leading-snug" style={{ color: theme.textSecondary }}>
                    <FiCheckCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: SUCCESS }} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Proof form */}
      <form onSubmit={submit} noValidate className="mt-5 rounded-xl p-4 sm:p-5" style={{ border: `1px solid ${theme.border}` }}>
        <SectionTitle icon={FiCreditCard} theme={theme}>Payment Details</SectionTitle>

        <label htmlFor={`${uid}-utr`} className="mt-4 block text-xs font-semibold" style={{ color: theme.text }}>
          UTR / Transaction ID <span style={{ color: DANGER }}>*</span>
        </label>
        <input
          id={`${uid}-utr`}
          value={utr}
          onChange={(event) => { setUtr(event.target.value); if (errors.utr) setErrors((e) => ({ ...e, utr: undefined })); }}
          placeholder="Enter UTR / Transaction ID (e.g. 432198765432)"
          inputMode="text"
          autoComplete="off"
          maxLength={100}
          aria-invalid={Boolean(errors.utr)}
          aria-describedby={errors.utr ? `${uid}-utr-error` : undefined}
          className="mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-300"
          style={{ border: `1px solid ${errors.utr ? DANGER : theme.border}`, backgroundColor: theme.input, color: theme.text }}
        />
        {errors.utr && <p id={`${uid}-utr-error`} className="mt-1.5 text-xs font-medium" style={{ color: DANGER }}>{errors.utr}</p>}

        <label htmlFor={`${uid}-shot`} className="mt-4 block text-xs font-semibold" style={{ color: theme.text }}>
          Payment Screenshot <span style={{ color: DANGER }}>*</span>
        </label>
        <div className="mt-1.5">
          <ScreenshotDrop file={screenshot} onFile={pickScreenshot} error={errors.screenshot} theme={theme} inputId={`${uid}-shot`} />
        </div>

        <div className="mt-4 flex gap-3 rounded-xl p-3.5" style={{ backgroundColor: theme.panelStrong }}>
          <FiInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.link }} />
          <div className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
            <p className="text-[13px] font-bold" style={{ color: theme.heading }}>What happens next?</p>
            Our team will verify your payment (usually within 4–8 working hours). Once verified, your enrollment will move to
            &ldquo;Pending Approval&rdquo; and the organization will approve your access to the course.
          </div>
        </div>

        {submitError && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm" style={{ backgroundColor: `${DANGER}10`, color: DANGER }}>
            <FiAlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${theme.border}`, color: theme.heading, backgroundColor: theme.card }}
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Details
          </button>
          <button
            type="submit"
            disabled={submitting || loading || Boolean(loadError) || !Number.isFinite(amount) || amount <= 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-[background-color,transform] hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: BRAND.accent, boxShadow: "0 10px 22px -10px rgba(243,153,36,0.8)" }}
            onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = BRAND.accentHover; }}
            onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = BRAND.accent; }}
          >
            {submitting ? <><FiLoader aria-hidden="true" className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit Payment Proof <FiArrowRight aria-hidden="true" className="h-4 w-4" /></>}
          </button>
        </div>
      </form>

      {qrZoom && (
        <div role="dialog" aria-modal="true" aria-label="UPI QR code" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setQrZoom(false)}>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setQrZoom(false)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600">
              <FiX className="h-4 w-4" />
            </button>
            <ApiImage value={info?.qrCode} alt="UPI QR code" className="aspect-square w-full object-contain" />
            <p className="mt-3 text-center text-sm font-semibold text-slate-800">{info?.payeeName}</p>
            <p className="text-center text-xs text-slate-500">{info?.upiId}{amount ? ` · ${inr.format(amount)}` : ""}</p>
          </div>
        </div>
      )}
    </UpiCard>
  );
}
