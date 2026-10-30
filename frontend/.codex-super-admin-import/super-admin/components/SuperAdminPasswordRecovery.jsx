import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import OtpInputGroup from "@features/auth/components/OtpInputGroup";
import useSuperAdminPasswordReset, {
  OTP_LENGTH,
  PASSWORD_RULES,
} from "../hooks/useSuperAdminPasswordReset";

const formatCountdown = (seconds) => `00:${String(seconds).padStart(2, "0")}`;

const inputClasses = (hasError = false) =>
  `h-[52px] w-full rounded-xl border bg-white pl-12 pr-4 text-sm font-medium text-slate-950 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500/40 dark:focus:ring-red-500/20"
      : "border-slate-300"
  }`;

const primaryButtonClasses =
  "flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,85,247,.25)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50";

const textButtonClasses =
  "rounded text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300";

const FieldError = ({ message }) =>
  message ? (
    <p id="recovery-field-error" role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

const viewVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

export default function SuperAdminPasswordRecovery({ onBackToSignIn }) {
  const recovery = useSuperAdminPasswordReset({ onBackToSignIn });
  const otpInputRef = useRef(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { step, email, sent, resetDone, isSending, isVerifying, isResetting } = recovery;
  const passedRules = PASSWORD_RULES.map((rule) => rule.test(newPassword));
  const allRulesPassed = passedRules.every(Boolean);
  const passwordsMatch = Boolean(confirmPassword) && newPassword === confirmPassword;
  const code = otp.join("");

  useEffect(() => {
    if (step === "verify") {
      const timer = window.setTimeout(() => otpInputRef.current?.focusFirst(), 80);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step]);

  const handleSend = (event) => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements?.email;
    recovery.sendResetCode(emailInput?.value);
  };

  const handleVerify = (event) => {
    event.preventDefault();
    recovery.verifyCode(code);
  };

  const handleReset = (event) => {
    event.preventDefault();
    recovery.resetPassword({ newPassword, confirmPassword });
  };

  const header = {
    forgot: {
      icon: ShieldCheck,
      eyebrow: "Secure Account Recovery",
      title: "Forgot Password?",
      description: "Enter your registered email address and we\u2019ll send you instructions to reset your password.",
    },
    verify: {
      icon: KeyRound,
      eyebrow: "Identity Verification",
      title: "Enter verification code",
      description: (
        <>
          Enter the latest six-digit code sent to{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{email}</strong>.
        </>
      ),
    },
    reset: {
      icon: LockKeyhole,
      eyebrow: "Secure Your Account",
      title: resetDone ? "Password reset successfully" : "Create a new password",
      description: resetDone
        ? "Your password has been changed. You can now sign in with your new password."
        : "Choose a strong password that you have not used for this account before.",
    },
  }[step];

  const Icon = header.icon;

  return (
    <div className="flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} variants={viewVariants} initial="initial" animate="animate" exit="exit">
          <header className="mb-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20">
              <Icon size={22} />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-blue-600 dark:text-cyan-400">
              {header.eyebrow}
            </p>
            <h2 className="mt-1.5 text-3xl font-extrabold tracking-[-.04em] text-slate-950 dark:text-white">
              {header.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              {header.description}
            </p>
          </header>

          {step === "forgot" && (
            <>
              {sent ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold leading-5 text-emerald-800 dark:text-emerald-200">
                        If an account exists for this email, password reset instructions have been sent.
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-emerald-700/80 dark:text-emerald-300/80">
                        Check your inbox for the verification code, then continue to reset your password.
                      </p>
                    </div>
                  </div>

                  <button type="button" onClick={recovery.goToVerify} className={primaryButtonClasses}>
                    I have a code — Continue
                    <ArrowRight size={16} />
                  </button>

                  <div className="flex items-center justify-center gap-4 text-sm">
                    <button type="button" onClick={recovery.useDifferentEmail} className={textButtonClasses}>
                      Use a different email
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="super-admin-recovery-email" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="super-admin-recovery-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="admin@kiniedxhub.com"
                        aria-invalid={Boolean(recovery.errorMessage)}
                        aria-describedby={recovery.errorMessage ? "recovery-field-error" : undefined}
                        className={inputClasses(Boolean(recovery.errorMessage))}
                      />
                    </div>
                    <FieldError message={recovery.errorMessage} />
                  </div>

                  <button type="submit" disabled={isSending} className={primaryButtonClasses}>
                    {isSending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4" noValidate>
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                Use the newest email code. For your security, previous codes may stop working after a resend.
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                  Six-digit code
                </label>
                <OtpInputGroup
                  ref={otpInputRef}
                  value={otp}
                  onChange={(next) => {
                    setOtp(next);
                    recovery.clearError();
                  }}
                  hasError={Boolean(recovery.errorMessage)}
                  disabled={isVerifying}
                />
                <FieldError message={recovery.errorMessage} />
              </div>

              <button type="submit" disabled={isVerifying || code.length !== OTP_LENGTH} className={primaryButtonClasses}>
                {isVerifying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                {recovery.resendRemaining > 0 ? (
                  <span>
                    Resend available in{" "}
                    <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
                      {formatCountdown(recovery.resendRemaining)}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={recovery.resendCode}
                    disabled={isSending}
                    className={textButtonClasses}
                  >
                    {isSending ? "Sending a new code..." : "Resend code"}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button type="button" onClick={recovery.useDifferentEmail} className={textButtonClasses}>
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <>
              {resetDone ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                    <p className="mt-3 text-sm font-bold leading-5 text-emerald-800 dark:text-emerald-200">
                      Password reset successfully.
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-700/80 dark:text-emerald-300/80">
                      Sign in with your new password to continue.
                    </p>
                  </div>
                  <button type="button" onClick={recovery.exitFlow} className={primaryButtonClasses}>
                    Back to Sign In
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="super-admin-new-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                      New Password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="super-admin-new-password"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        autoFocus
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(event.target.value);
                          recovery.clearError();
                        }}
                        placeholder="Enter a strong password"
                        className={inputClasses(false) + " pr-12"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((value) => !value)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
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
                    <label htmlFor="super-admin-confirm-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="super-admin-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          recovery.clearError();
                        }}
                        placeholder="Re-enter your new password"
                        aria-invalid={Boolean(confirmPassword) && !passwordsMatch}
                        className={inputClasses(Boolean(confirmPassword) && !passwordsMatch) + " pr-12"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                      >
                        {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                    {Boolean(confirmPassword) && !passwordsMatch && (
                      <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        The passwords do not match.
                      </p>
                    )}
                    {recovery.errorMessage && !(Boolean(confirmPassword) && !passwordsMatch) && (
                      <FieldError message={recovery.errorMessage} />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting || !allRulesPassed || !passwordsMatch}
                    className={primaryButtonClasses}
                  >
                    {isResetting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center">
                    <button type="button" onClick={recovery.goToVerify} className={textButtonClasses}>
                      Wrong code? Enter it again
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {!(resetDone && step === "reset") && (
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={recovery.exitFlow}
            className="flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-cyan-400"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
}
