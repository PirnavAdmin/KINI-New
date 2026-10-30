import { useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import RecoveryShell from "../../components/RecoveryShell";
import { forgotPassword } from "@shared/services/authApi";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { clearRecoveryVerification, getRecoveryReturnTo, maskRecoveryIdentifier, RECOVERY_STORAGE_KEYS } from "../../utils/recoveryNavigation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = getRecoveryReturnTo(location.state?.returnTo);
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  const handleSend = async (event) => {
    event.preventDefault();
    if (loading || submitLockRef.current) return;
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    submitLockRef.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await forgotPassword(normalizedEmail, "Email");
      const message = response?.message || response?.Message || "OTP sent successfully.";
      sessionStorage.setItem("passwordResetEmail", normalizedEmail);
      sessionStorage.setItem(RECOVERY_STORAGE_KEYS.otpType, "Email");
      sessionStorage.setItem(RECOVERY_STORAGE_KEYS.returnTo, returnTo);
      clearRecoveryVerification();
      setSubmittedEmail(normalizedEmail);
      setSuccessMessage(message);
      setSent(true);
      toast.success(message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || getApiErrorMessage(
        requestError,
        "We could not send a reset code. Check your connection and try again."
      ));
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  const goToVerification = () => {
    navigate("/verify-otp", { state: { identifier: submittedEmail, otpType: "Email", returnTo } });
  };

  return (
    <RecoveryShell
      step={1}
      eyebrow="Account recovery"
      title={sent ? "Check your email" : "Forgot your password?"}
      description={sent
        ? <>We sent a six-digit reset code to <strong className="font-semibold text-slate-800 dark:text-slate-200">{maskRecoveryIdentifier(submittedEmail)}</strong>.</>
        : "Enter your account email and we will send you a secure verification code."
      }
      icon={sent ? CheckCircle2 : ShieldCheck}
      backTo={returnTo}
      backLabel="Back to sign in"
      footer={(
        <>
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate(returnTo)}
            className="font-bold text-blue-600 hover:underline dark:text-cyan-400"
          >
            Sign in
          </button>
        </>
      )}
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-6">
              {successMessage || "OTP sent successfully."} Open the latest email from KiniEdxHub. The code expires shortly, so older codes may no longer work.
            </p>
          </div>
          <button
            type="button"
            onClick={goToVerification}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Enter verification code
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setSuccessMessage("");
              setError("");
            }}
            className="h-10 w-full rounded-xl text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend} noValidate className="space-y-4">
          <div>
            <label htmlFor="recovery-email" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="name@company.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "recovery-email-error" : undefined}
                className={`h-11 w-full rounded-xl border bg-white pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-500/20"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500/30"
                }`}
              />
            </div>
            {error && (
              <p id="recovery-email-error" role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending code...
              </>
            ) : (
              <>
                Send reset code
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}
    </RecoveryShell>
  );
}
