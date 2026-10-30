import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { superAdminAuth } from "../services/superAdminAuth";

export const OTP_LENGTH = 6;
export const RESEND_DELAY = 60;

// Same recovery session keys the shared auth flow uses, so a recovery started
// here and one started on /forgot-password behave identically and are cleared
// as soon as the password is reset or the flow is exited.
const RECOVERY_STORAGE_KEYS = [
  "passwordResetEmail",
  "passwordResetOtp",
  "passwordResetToken",
  "passwordResetVerified",
];

export const clearPasswordRecoverySession = () => {
  RECOVERY_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
};

export const PASSWORD_RULES = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /\d/.test(value) },
  { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useSuperAdminPasswordReset = ({ onBackToSignIn } = {}) => {
  const [step, setStep] = useState("forgot"); // "forgot" | "verify" | "reset"
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendRemaining, setResendRemaining] = useState(0);

  const clearError = useCallback(() => setErrorMessage(""), []);

  useEffect(() => {
    if (resendRemaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendRemaining]);

  // Send the reset code. Always returns the same generic outcome to avoid
  // revealing whether an account exists for the submitted email.
  const sendResetCode = useCallback(async (rawEmail) => {
    const normalized = String(rawEmail || "").trim().toLowerCase();
    if (!normalized) {
      setErrorMessage("Email is required.");
      return false;
    }
    if (!EMAIL_PATTERN.test(normalized)) {
      setErrorMessage("Enter a valid email address.");
      return false;
    }

    setIsSending(true);
    setErrorMessage("");
    try {
      await superAdminAuth.forgotPassword({ email: normalized });
      setEmail(normalized);
      sessionStorage.setItem("passwordResetEmail", normalized);
      setSent(true);
      setResendRemaining(RESEND_DELAY);
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(
        error,
        "We could not send the reset instructions. Check your connection and try again."
      ));
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const resendCode = useCallback(async () => {
    if (resendRemaining > 0 || isSending) return;

    setIsSending(true);
    setErrorMessage("");
    try {
      await superAdminAuth.forgotPassword({ email });
      setResendRemaining(RESEND_DELAY);
      toast.success("A new reset code has been sent to your email.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(
        error,
        "We could not resend the code. Check your connection and try again."
      ));
    } finally {
      setIsSending(false);
    }
  }, [email, isSending, resendRemaining]);

  const verifyCode = useCallback(async (code) => {
    const digits = String(code || "").replace(/\D/g, "");
    if (digits.length !== OTP_LENGTH) {
      setErrorMessage("Enter all six digits from the email.");
      return false;
    }

    setIsVerifying(true);
    setErrorMessage("");
    try {
      const response = await superAdminAuth.verifyOtp({ email, otp: digits });
      const verificationToken = response?.verificationToken
        || response?.resetToken
        || response?.token
        || response?.data?.verificationToken
        || response?.data?.resetToken
        || "";

      // Keep recovery proof only for this browser tab and remove it
      // immediately after a successful password reset.
      sessionStorage.setItem("passwordResetOtp", digits);
      sessionStorage.setItem("passwordResetVerified", "true");
      if (verificationToken) {
        sessionStorage.setItem("passwordResetToken", verificationToken);
      }
      setStep("reset");
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(
        error,
        error?.message || "The code is invalid or has expired. Please request a new code."
      ));
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [email]);

  const resetPassword = useCallback(async ({ newPassword, confirmPassword }) => {
    setErrorMessage("");

    if (!PASSWORD_RULES.every((rule) => rule.test(newPassword || ""))) {
      setErrorMessage("Your password does not meet all security requirements.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return false;
    }

    setIsResetting(true);
    try {
      const verificationToken = sessionStorage.getItem("passwordResetToken") || "";
      await superAdminAuth.resetPassword({
        email,
        otp: sessionStorage.getItem("passwordResetOtp") || "",
        newPassword,
        confirmPassword,
        verificationToken,
      });
      clearPasswordRecoverySession();
      setResetDone(true);
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(
        error,
        "We could not reset your password. Please try again."
      ));
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [email]);

  const goToVerify = useCallback(() => {
    setErrorMessage("");
    setStep("verify");
  }, []);

  const goToForgot = useCallback(() => {
    setErrorMessage("");
    setStep("forgot");
  }, []);

  const useDifferentEmail = useCallback(() => {
    setErrorMessage("");
    setSent(false);
    setStep("forgot");
  }, []);

  const exitFlow = useCallback(() => {
    clearPasswordRecoverySession();
    setEmail("");
    setSent(false);
    setResetDone(false);
    setErrorMessage("");
    setStep("forgot");
    onBackToSignIn?.();
  }, [onBackToSignIn]);

  return {
    step,
    email,
    sent,
    resetDone,
    isSending,
    isVerifying,
    isResetting,
    errorMessage,
    resendRemaining,
    clearError,
    sendResetCode,
    resendCode,
    verifyCode,
    resetPassword,
    goToVerify,
    goToForgot,
    useDifferentEmail,
    exitFlow,
  };
};

export default useSuperAdminPasswordReset;
