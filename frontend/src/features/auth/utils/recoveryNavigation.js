export const RECOVERY_STORAGE_KEYS = {
  identifier: "passwordResetEmail",
  otpType: "passwordResetOtpType",
  returnTo: "passwordResetReturnTo",
  // The email the backend confirmed the code for (POST /api/Auth/verify-otp).
  verifiedFor: "passwordResetVerifiedFor",
};

// Verification state from an earlier code or another email must never carry
// over to a new code.
export const clearRecoveryVerification = () => {
  ["passwordResetOtp", "passwordResetToken", "passwordResetVerified", RECOVERY_STORAGE_KEYS.verifiedFor]
    .forEach((key) => sessionStorage.removeItem(key));
};

const LOGIN_ROUTES = new Set([
  "/login",
  "/mentor/login",
  "/employee/login",
  "/organization/login",
  "/super-admin/login",
]);

export const getSafeLoginRoute = (candidate) => {
  const route = String(candidate || "").trim();
  return LOGIN_ROUTES.has(route) ? route : "/login";
};

export const getRecoveryReturnTo = (candidate) => getSafeLoginRoute(
  candidate || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.returnTo)
);

export const maskRecoveryIdentifier = (identifier) => {
  const value = String(identifier || "").trim();
  const [name, domain] = value.split("@");
  if (!domain) return value;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
};
