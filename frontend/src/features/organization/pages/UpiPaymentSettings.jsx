import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, ImageUp, Loader2, QrCode, Save, Wallet } from "lucide-react";
import { OrgHero, OrgPage, OrgPanel } from "../components/org-ui/OrgPageKit";
import { enrollmentReviewApi, toEnrollmentError } from "@shared/services/publicEnrollmentApi";

const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
const QR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Organization → UPI payment settings. The UPI ID and QR code shown to
 * students on the public payment page. Only the Organization / Organization
 * Admin roles can change these (enforced by the backend).
 */
export default function UpiPaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [hasQr, setHasQr] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  useEffect(() => {
    let active = true;
    enrollmentReviewApi.getPaymentSettings()
      .then((settings) => {
        if (!active) return;
        setUpiId(settings.upiId ?? "");
        setPayeeName(settings.upiPayeeName ?? "");
        setIsActive(settings.isActive !== false);
        setHasQr(Boolean(settings.hasQrImage));
      })
      .catch((err) => active && setError(toEnrollmentError(err)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hasQr) return undefined;
    let url = null;
    let active = true;
    enrollmentReviewApi.getPaymentQrUrl()
      .then((objectUrl) => {
        url = objectUrl;
        if (active) setQrUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [hasQr, uploading]);

  const save = async (event) => {
    event.preventDefault();
    if (!UPI_PATTERN.test(upiId.trim())) {
      setFieldError("Enter a valid UPI ID, e.g. yourname@okbank.");
      return;
    }
    setFieldError(null);
    setSaving(true);
    try {
      const settings = await enrollmentReviewApi.updatePaymentSettings({ upiId: upiId.trim(), upiPayeeName: payeeName.trim() || null, isActive });
      setUpiId(settings.upiId ?? "");
      setPayeeName(settings.upiPayeeName ?? "");
      setIsActive(settings.isActive !== false);
      toast.success("UPI details saved");
    } catch (err) {
      const normalized = toEnrollmentError(err);
      setFieldError(normalized.fieldErrors.upiId || normalized.message);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!QR_TYPES.includes(file.type)) return toast.error("Upload a JPG, PNG or WebP image.");
    if (file.size > 2 * 1024 * 1024) return toast.error("The QR image must be 2 MB or smaller.");
    setUploading(true);
    try {
      await enrollmentReviewApi.uploadPaymentQr(file);
      setHasQr(true);
      toast.success("QR code updated");
    } catch (err) {
      toast.error(toEnrollmentError(err).fieldErrors.file || toEnrollmentError(err).message);
    } finally {
      setUploading(false);
    }
  };

  if (error) {
    return (
      <OrgPage>
        <OrgHero icon={Wallet} title="UPI Payment Settings" plain />
        <div className="kx-note kx-note--error" role="alert">
          <AlertTriangle aria-hidden="true" />
          <span>{error.status === 403 ? "Only the organization account or an organization admin can manage UPI payment settings." : error.message}</span>
        </div>
      </OrgPage>
    );
  }

  return (
    <OrgPage>
      <OrgHero
        icon={Wallet}
        title="UPI Payment Settings"
        subtitle="Students see this UPI ID and QR code when they pay for a course from the public enrollment page."
        plain
      />

      <div className="kx-grid kx-grid--2">
        <OrgPanel icon={Wallet} title="UPI details" subtitle="Payments go directly to this UPI ID.">
          {loading ? (
            <p className="flex items-center gap-2 p-4 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…</p>
          ) : (
            <form onSubmit={save} className="space-y-4 p-1" noValidate>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold">UPI ID <span className="text-rose-500">*</span></span>
                <input className="kx-input" style={{ width: "100%" }} value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okbank" aria-invalid={Boolean(fieldError)} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold">Payee name</span>
                <input className="kx-input" style={{ width: "100%" }} value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="Name shown in the student's UPI app" maxLength={150} />
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span>
                  <span className="block font-semibold">Accept UPI payments</span>
                  <span className="block text-xs text-slate-500">When off, students can still enroll but cannot see the QR or submit payment proof.</span>
                </span>
              </label>
              {fieldError && <p role="alert" className="text-sm font-medium text-rose-600">{fieldError}</p>}
              <button type="submit" className="kx-btn kx-btn--primary" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />} Save UPI details
              </button>
            </form>
          )}
        </OrgPanel>

        <OrgPanel icon={QrCode} title="UPI QR code" subtitle="Upload the QR from your bank or UPI business app.">
          <div className="flex flex-col items-center gap-4 p-2">
            <div className="grid h-56 w-56 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-slate-950/40">
              {qrUrl ? (
                <img src={qrUrl} alt="Current UPI QR code" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-center text-sm text-slate-500"><QrCode className="mx-auto h-8 w-8" aria-hidden="true" />No QR uploaded</span>
              )}
            </div>
            <label className={`kx-btn kx-btn--soft ${uploading ? "opacity-60" : ""}`} style={{ cursor: uploading ? "wait" : "pointer" }}>
              {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
              {hasQr ? "Replace QR code" : "Upload QR code"}
              <input type="file" accept={QR_TYPES.join(",")} className="sr-only" onChange={upload} disabled={uploading} />
            </label>
            <p className="text-center text-xs text-slate-500">JPG, PNG or WebP, up to 2 MB. Stored privately; shown only to students with a valid enrollment link.</p>
          </div>
        </OrgPanel>
      </div>
    </OrgPage>
  );
}
