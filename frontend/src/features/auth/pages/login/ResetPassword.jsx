import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RecoveryShell from "../../components/RecoveryShell";
import { resetVerifiedPassword } from "@shared/services/authApi";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { toast } from "sonner";
import { clearRecoveryVerification, getRecoveryReturnTo, RECOVERY_STORAGE_KEYS } from "../../utils/recoveryNavigation";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /\d/.test(value) },
  { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const RESET_AUTH_PATTERN = /\b(otp|token|verification|authorization)\b.*\b(not found|invalid|expired|used|missing)\b|\b(not found|invalid|expired|used|missing)\b.*\b(otp|token|verification|authorization)\b/i;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = String(
    location.state?.identifier || location.state?.email || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.identifier) || ""
  ).trim().toLowerCase();
  const otpType = String(location.state?.otpType || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.otpType) || "Email").toLowerCase() === "phone"
    ? "phone"
    : "email";
  const [returnTo] = useState(() => getRecoveryReturnTo(location.state?.returnTo));
  const resetToken = sessionStorage.getItem("passwordResetToken") || "";
  const authorizationExpired = () => {
    const expiry = sessionStorage.getItem(RECOVERY_STORAGE_KEYS.tokenExpiresAt);
    return Boolean(expiry) && (!Number.isFinite(Date.parse(expiry)) || Date.parse(expiry) <= Date.now());
  };
  // Set only after POST /api/Auth/verify-otp confirmed the code for this exact
  // email. A UX guard against opening /reset-password directly: the backend
  // validates the purpose-bound reset authorization on reset-password itself.
  const verified = sessionStorage.getItem("passwordResetVerified") === "true"
    && sessionStorage.getItem(RECOVERY_STORAGE_KEYS.verifiedFor) === email;

  const submitLock = useRef(false);
  const [authorizationInvalid, setAuthorizationInvalid] = useState(!email || !verified || !resetToken || authorizationExpired());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passedRules = useMemo(
    () => PASSWORD_RULES.map((rule) => rule.test(newPassword)),
    [newPassword]
  );
  const allRulesPassed = passedRules.every(Boolean);
  const passwordsMatch = Boolean(confirmPassword) && newPassword === confirmPassword;

  const clearRecoverySession = () => {
    sessionStorage.removeItem("passwordResetEmail");
    clearRecoveryVerification();
    sessionStorage.removeItem(RECOVERY_STORAGE_KEYS.otpType);
    sessionStorage.removeItem(RECOVERY_STORAGE_KEYS.returnTo);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLock.current || success) return;
    if (authorizationInvalid || !email || !verified || !resetToken || authorizationExpired()) {
      setAuthorizationInvalid(true);
      return;
    }
    setError("");

    if (!allRulesPassed) {
      setError("Your password does not meet all security requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    submitLock.current = true;
    setLoading(true);

    try {
      const payload = {
        identifier: email,
        resetToken,
        newPassword,
        confirmPassword,
      };
      // authService rejects HTTP failures and application-level failures.
      await resetVerifiedPassword(payload);
      setSuccess(true);
      clearRecoverySession();
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully. Please sign in.");
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        requestError?.message || "We could not reset your password. Please try again."
      );

      if (RESET_AUTH_PATTERN.test(message) || [401, 403, 410].includes(requestError?.response?.status)) {
        clearRecoveryVerification();
        setAuthorizationInvalid(true);
      }

      setError(message);
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  // After success the recovery session is cleared on purpose; still render the
  // confirmation instead of a blank page.
  if (!success && authorizationInvalid) return (
    <RecoveryShell step={3} icon={AlertCircle} title="Restart password reset" description="Your reset authorization is missing, invalid, or expired. Request a new code to continue." backTo="/forgot-password" backState={{ returnTo }}>
      <p role="alert">{error || "Please restart password reset to verify your identity."}</p>
      <button type="button" className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white" onClick={() => { clearRecoverySession(); navigate("/forgot-password", { replace: true, state: { returnTo } }); }}>Restart password reset</button>
    </RecoveryShell>
  );

  return (
    <RecoveryShell
      step={3}
      eyebrow="Secure your account"
      title={success ? "Password updated" : "Create a new password"}
      description={success
        ? "Your password was changed successfully. Redirecting you to sign in..."
        : "Choose a strong password that you have not used for this account before."
      }
      icon={success ? CheckCircle2 : LockKeyhole}
      backTo="/verify-otp"
      backState={{ identifier: email, otpType, returnTo }}
      backLabel="Back to verification"
      footer={!success ? (
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
      ) : null}
    >
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            You can now sign in with your new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
              New password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter a strong password"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
            {PASSWORD_RULES.map((rule, index) => (
              <div
                key={rule.label}
                className={`flex items-center gap-1.5 text-[11px] font-medium ${
                  passedRules[index]
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  passedRules[index]
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 dark:border-slate-600"
                }`}>
                  {passedRules[index] && <Check size={10} strokeWidth={3} />}
                </span>
                {rule.label}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
              Confirm new password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Re-enter your new password"
                aria-invalid={Boolean(confirmPassword) && !passwordsMatch}
                className={`h-12 w-full rounded-xl border bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-500/20"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="min-h-5">
            {error && (
              <p role="alert" className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPassed || !passwordsMatch}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Updating password...
              </>
            ) : (
              <>
                Update password
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}
    </RecoveryShell>
  );
}
