import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Info, Smartphone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RecoveryShell from "../../components/RecoveryShell";
import OtpInputGroup from "../../components/OtpInputGroup";
import { forgotPassword, verifyOtp } from "@shared/services/authApi";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { toast } from "sonner";
import { clearRecoveryVerification, getRecoveryReturnTo, maskRecoveryIdentifier, RECOVERY_STORAGE_KEYS } from "../../utils/recoveryNavigation";

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

const formatCountdown = (seconds) => `00:${String(seconds).padStart(2, "0")}`;

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputRef = useRef(null);
  const email = String(
    location.state?.identifier || location.state?.email || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.identifier) || ""
  ).trim().toLowerCase();
  const otpType = String(location.state?.otpType || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.otpType) || "Email").toLowerCase() === "phone"
    ? "phone"
    : "email";
  const returnTo = getRecoveryReturnTo(location.state?.returnTo);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [remaining, setRemaining] = useState(RESEND_DELAY);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const canResend = remaining === 0 && !resending;
  const code = otp.join("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    sessionStorage.setItem("passwordResetEmail", email);
    sessionStorage.setItem(RECOVERY_STORAGE_KEYS.otpType, otpType);
    sessionStorage.setItem(RECOVERY_STORAGE_KEYS.returnTo, returnTo);
    const focusTimer = window.setTimeout(() => otpInputRef.current?.focusFirst(), 100);
    return () => window.clearTimeout(focusTimer);
  }, [email, navigate, otpType, returnTo]);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (!verified) return undefined;
    const timer = window.setTimeout(() => {
      navigate("/reset-password", { replace: true, state: { identifier: email, otpType, returnTo } });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [email, navigate, otpType, returnTo, verified]);

  const handleOtpChange = (nextOtp) => {
    setOtp(nextOtp);
    setError("");
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    setResending(true);
    setError("");

    try {
      // Password recovery must use the forgot-password endpoint. The generic
      // send-otp endpoint is reserved for other verification flows.
      await forgotPassword(email, otpType);
      // A new code supersedes any earlier verification.
      clearRecoveryVerification();
      setOtp(Array(OTP_LENGTH).fill(""));
      setRemaining(RESEND_DELAY);
      otpInputRef.current?.focusFirst();
      toast.success("A new verification code was sent.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || getApiErrorMessage(requestError, "We could not resend the code. Check your connection and try again."));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (code.length !== OTP_LENGTH) {
      setError("Enter all six digits from the email.");
      otpInputRef.current?.focusFirst();
      return;
    }

    if (loading) return;
    setLoading(true);
    setError("");
    clearRecoveryVerification();

    // Six digits only means the input is complete. The backend decides whether
    // this is the latest unexpired code for this email: verifyOtp throws unless
    // POST /api/Auth/verify-otp explicitly confirms it (assertOtpVerified).
    // reset-password re-checks the same code server-side.
    try {
      const result = await verifyOtp({ identifier: email, otpType, otp: code });
      const token = result?.verificationToken || result?.resetToken || result?.token || "";
      sessionStorage.setItem("passwordResetOtp", code);
      if (token) sessionStorage.setItem("passwordResetToken", token);
      sessionStorage.setItem("passwordResetVerified", "true");
      sessionStorage.setItem(RECOVERY_STORAGE_KEYS.verifiedFor, email);
      setVerified(true);
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        requestError?.message || "That code is incorrect or has expired. Check the latest email or request a new code."
      ));
      setOtp(Array(OTP_LENGTH).fill(""));
      otpInputRef.current?.focusFirst();
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <RecoveryShell
      step={2}
      eyebrow="Identity verification"
      title={verified ? "Code verified" : "Enter verification code"}
      description={verified
        ? "Your email is verified. Taking you to the final step..."
        : <>Enter the latest six-digit code sent to <strong className="font-semibold text-slate-800 dark:text-slate-200">{maskRecoveryIdentifier(email)}</strong>.</>
      }
      icon={verified ? CheckCircle2 : Smartphone}
      backTo="/forgot-password"
      backState={{ returnTo }}
      backLabel="Change email"
      footer={!verified ? (
        <>
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => navigate("/forgot-password", { state: { returnTo } })}
            className="font-bold text-blue-600 hover:underline dark:text-cyan-400"
          >
            Start again
          </button>
        </>
      ) : null}
    >
      {verified ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Verification successful
          </p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Use the newest email code. For your security, previous codes may stop working after a resend.
          </div>

          <div>
            <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
              Six-digit code
            </label>
            <OtpInputGroup
              ref={otpInputRef}
              value={otp}
              onChange={handleOtpChange}
              hasError={Boolean(error)}
              disabled={loading}
            />
            <div className="mt-2 min-h-5">
              {error && (
                <p role="alert" className="flex items-start justify-center gap-1.5 text-center text-xs font-medium leading-5 text-red-600 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== OTP_LENGTH}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verifying...
              </>
            ) : (
              <>
                Verify code
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            {remaining > 0 ? (
              <span>
                Resend available in{" "}
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
                  {formatCountdown(remaining)}
                </span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="font-bold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-400"
              >
                {resending ? "Sending a new code..." : "Resend code"}
              </button>
            )}
          </div>
        </form>
      )}
    </RecoveryShell>
  );
}
