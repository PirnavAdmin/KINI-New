import apiClient from "@shared/services/apiClient";
import { authService } from "@shared/services/authService";
import { API_ENDPOINTS } from "@/api/endpoints";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeOtp = (otp) => String(otp || "").replace(/\D/g, "");

const readApiBody = (response) =>
  response?.data && typeof response.data === "object" ? response.data : {};

const assertSuperAdminLoginAccepted = (body) => {
  if (body?.success === false || body?.Success === false) {
    const message = body?.Error || body?.error || body?.Message || body?.message
      || "Unable to sign in to the Super Admin portal.";
    throw new Error(String(message).split(/\r?\n/)[0].trim());
  }
  return body;
};

export const superAdminAuth = {
  // POST {VITE_API_BASE_URL}/api/v1/SuperAdmin/login with { email, password }.
  // The base URL comes from import.meta.env.VITE_API_BASE_URL via apiClient; it
  // is never hardcoded here. rememberMe is intentionally NOT sent because the
  // backend DTO does not require it. The request is registered as a public auth
  // path so a stale local token is never attached to the login call.
  login: async ({ email, password }) => {
    const response = await apiClient.post(API_ENDPOINTS.superAdmin.login, {
      email: normalizeEmail(email),
      password,
    });
    return assertSuperAdminLoginAccepted(readApiBody(response));
  },

  // Password recovery reuses the same verified auth endpoints as the rest of
  // the platform: forgot-password sends a six-digit reset code, verify-otp
  // validates it, and reset-password applies the new password. The verified
  // OTP (and any verification token returned by the backend) is short-lived
  // and single-use, so a reset link cannot be replayed after success.
  forgotPassword: async ({ email }) => {
    return authService.forgotPassword({
      identifier: normalizeEmail(email),
      otpType: "Email",
    });
  },

  verifyOtp: async ({ email, otp }) => {
    return authService.verifyOtp({
      identifier: normalizeEmail(email),
      otpType: "Email",
      otp: normalizeOtp(otp),
    });
  },

  resetPassword: async ({ email, otp, newPassword, confirmPassword, verificationToken }) => {
    return authService.resetPassword({
      identifier: normalizeEmail(email),
      otpType: "Email",
      otp: normalizeOtp(otp),
      newPassword,
      confirmPassword,
      ...(verificationToken ? { verificationToken } : {}),
    });
  },
};

export default superAdminAuth;
