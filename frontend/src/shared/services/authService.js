import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";

export const extractData = (response) => response?.data?.data ?? response?.data;

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const decodeJwtPayload = (token) => {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return {};
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

export const getJwtRole = (token) => {
  const payload = decodeJwtPayload(token);
  const role = payload[ROLE_CLAIM] || payload.role || payload.roles || payload.Role;
  return Array.isArray(role) ? role[0] : role;
};

const assertApiSuccess = (payload, fallbackMessage) => {
  const result = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const succeeded = result?.success ?? result?.Success;

  if (succeeded === false) {
    throw new Error(result?.message || result?.Message || fallbackMessage);
  }

  return result;
};

const buildLoginPayload = (payload = {}) => ({
  identifier: String(payload.identifier || payload.email || "").trim().toLowerCase(),
  password: payload.password,
  selectedRole: payload.selectedRole || "Student",
  rememberMe: Boolean(payload.rememberMe ?? payload.remember),
});

export const redactAuthResponse = (value, depth = 0) => {
  if (value == null || depth > 6) return value;
  if (Array.isArray(value)) return value.map((item) => redactAuthResponse(item, depth + 1));
  if (typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    /password|token|authorization|otp|secret/i.test(key)
      ? "[REDACTED]"
      : redactAuthResponse(item, depth + 1),
  ]));
};

const withIdentifierAndOtpType = (payload = {}, defaultOtpType) => ({
  identifier: String(payload.identifier || payload.email || payload.phone || "").trim().toLowerCase(),
  otpType: normalizeOtpType(payload.otpType || defaultOtpType),
  ...(payload.otp ? { otp: payload.otp } : {}),
});

const normalizeOtpType = (otpType = "Email") => {
  const normalized = String(otpType).trim().toLowerCase();
  return normalized === "phone" || normalized === "sms" ? "phone" : "email";
};

const OTP_FAILURE_PATTERN = /\b(invalid|expired|incorrect|wrong|failed|failure|error)\b|\bnot\s+(?:valid|verified)\b/i;
const OTP_SUCCESS_PATTERN = /\b(?:otp|code|email)\b.*\b(?:valid|verified|success(?:ful|fully)?)\b|\b(?:valid|verified|success(?:ful|fully)?)\b.*\b(?:otp|code|email)\b/i;

/**
 * The OTP endpoint currently returns HTTP 200 even when the code is invalid.
 * Fail closed unless the response explicitly confirms verification; otherwise
 * callers could advance to password creation after entering any six digits.
 */
export const assertOtpVerified = (payload) => {
  const result = payload?.data ?? payload;
  const message = typeof result === "string"
    ? result
    : String(result?.message || result?.title || "");
  const verificationFlags = [
    result?.success,
    result?.isSuccess,
    result?.valid,
    result?.isValid,
    result?.verified,
    result?.isVerified,
  ].filter((value) => typeof value === "boolean");
  const hasVerificationToken = Boolean(
    result?.verificationToken || result?.resetToken || result?.token
  );
  const explicitlyRejected = verificationFlags.includes(false) || OTP_FAILURE_PATTERN.test(message);
  const explicitlyVerified = verificationFlags.includes(true)
    || hasVerificationToken
    || OTP_SUCCESS_PATTERN.test(message);

  if (explicitlyRejected || !explicitlyVerified) {
    const error = new Error(message || "OTP verification could not be confirmed. Please request a new code.");
    error.code = "OTP_VERIFICATION_FAILED";
    throw error;
  }

  return result;
};

export const authService = {
  register: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.auth.register, payload);
    return assertApiSuccess(extractData(response), "Registration failed.");
  },
  login: async (payload) => {
    const response = await apiClient.post(
      API_ENDPOINTS.auth.login,
      buildLoginPayload(payload)
    );
    return assertApiSuccess(extractData(response), "Login failed.");
  },
  loginStudent: async (payload = {}) => {
    const request = buildLoginPayload({ ...payload, selectedRole: "Student" });
    if (import.meta.env.DEV) {
      console.group("STUDENT LOGIN REQUEST");
      console.log("Role:", "student");
      console.log("Endpoint:", API_ENDPOINTS.auth.login);
      console.log("Identifier:", request.identifier);
      console.log("Has Password:", Boolean(request.password));
      console.log("Password Length:", String(request.password || "").length);
      console.groupEnd();
    }
    const response = await apiClient.post(API_ENDPOINTS.auth.login, request, { skipAuthRedirect: true });
    if (import.meta.env.DEV) {
      // Temporary diagnostic for verifying the backend's real student identity
      // shape. Credentials and every token-like field are always redacted.
      console.log("STUDENT LOGIN RESPONSE:", redactAuthResponse(response?.data));
    }
    return assertApiSuccess(extractData(response), "Student login failed.");
  },
  loginOrganization: async ({ email, password } = {}) => {
    const payload = {
      email: String(email || "").trim().toLowerCase(),
      password,
    };
    if (import.meta.env.DEV) {
      console.group("ORGANIZATION LOGIN REQUEST");
      console.log("Endpoint:", API_ENDPOINTS.organization.login);
      console.log("Payload:", { email: payload.email, hasPassword: Boolean(payload.password), passwordLength: String(payload.password || "").length });
      console.log("Payload JSON:", JSON.stringify({ email: payload.email, password: "[REDACTED]" }, null, 2));
      console.groupEnd();
    }
    try {
      const response = await apiClient.post(API_ENDPOINTS.organization.login, payload, {
      // Login is public.  Never let a stale session alter its request/response flow.
      skipAuthRedirect: true,
      headers: {
        "Content-Type": "application/json",
      },
      });
      const result = assertApiSuccess(extractData(response), "Login failed.");
      const token = result?.token ?? result?.Token ?? result?.accessToken ?? result?.AccessToken
      ?? result?.jwtToken ?? result?.JwtToken;
      return {
        message: result?.message ?? result?.Message,
        token,
        organizationId: result?.organizationId ?? result?.OrganizationId,
        organizationName: result?.organizationName ?? result?.OrganizationName ?? result?.name ?? result?.Name,
        email: result?.email ?? result?.Email,
        expiration: result?.expiration ?? result?.Expiration ?? result?.expiresAt ?? result?.ExpiresAt,
        role: getJwtRole(token) || result?.role || result?.Role || "OrganizationAdmin",
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.group("ORGANIZATION LOGIN FAILED");
        console.error("Status:", error.response?.status);
        console.error("Message:", error.response?.data?.message ?? error.response?.data?.Message);
        console.error("Title:", error.response?.data?.title ?? error.response?.data?.Title);
        console.error("Errors:", error.response?.data?.errors ?? error.response?.data?.Errors);
        console.error("Full backend response:", error.response?.data);
        console.groupEnd();
      }
      throw error;
    }
  },
  googleLoginStudent: async ({ credential } = {}) => {
    if (!credential) throw new Error("Google sign-in did not return a credential.");
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN REQUEST", { role: "student", endpoint: API_ENDPOINTS.auth.studentGoogleLogin });
    const response = await apiClient.post(
      API_ENDPOINTS.auth.studentGoogleLogin,
      { credential },
      { skipAuthRedirect: true }
    );
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN RESPONSE", redactAuthResponse(response?.data));
    return assertApiSuccess(extractData(response), "Google sign-in failed.");
  },
  googleLoginEmployee: async ({ credential } = {}) => {
    if (!credential) throw new Error("Google sign-in did not return a credential.");
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN REQUEST", { role: "employee", endpoint: API_ENDPOINTS.auth.employeeGoogleLogin });
    const response = await apiClient.post(
      API_ENDPOINTS.auth.employeeGoogleLogin,
      { credential },
      { skipAuthRedirect: true }
    );
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN RESPONSE", redactAuthResponse(response?.data));
    return assertApiSuccess(extractData(response), "Google sign-in failed.");
  },
  googleLoginOrganization: async ({ credential } = {}) => {
    if (!credential) throw new Error("Google sign-in did not return a credential.");
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN REQUEST", { role: "organization", endpoint: API_ENDPOINTS.organization.googleLogin });
    const response = await apiClient.post(
      API_ENDPOINTS.organization.googleLogin,
      { credential },
      { skipAuthRedirect: true }
    );
    if (import.meta.env.DEV) console.debug("GOOGLE LOGIN RESPONSE", redactAuthResponse(response?.data));
    return assertApiSuccess(extractData(response), "Google sign-in failed.");
  },
  loginSuperAdmin: async (payload = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.superAdmin.login, {
      email: String(payload.email || payload.identifier || "").trim().toLowerCase(),
      password: payload.password,
    });
    return assertApiSuccess(extractData(response), "Super Admin login failed.");
  },
  sendOtp: async (payload) => {
    const response = await apiClient.post(
      API_ENDPOINTS.auth.sendOtp,
      withIdentifierAndOtpType(payload, "Email")
    );
    return assertApiSuccess(extractData(response), "Unable to send OTP.");
  },
  verifyOtp: async (payload) => {
    const response = await apiClient.post(
      API_ENDPOINTS.auth.verifyOtp,
      withIdentifierAndOtpType(payload, "Email")
    );
    return assertOtpVerified(assertApiSuccess(extractData(response), "OTP verification failed."));
  },
  forgotPassword: async (identifier, otpType) => {
    const response = await apiClient.post(
      API_ENDPOINTS.auth.forgotPassword,
      {
        identifier: String(identifier || "").trim().toLowerCase(),
        otpType: normalizeOtpType(otpType),
      }
    );
    return assertApiSuccess(extractData(response), "Unable to send password reset OTP.");
  },
  resetPassword: async (payload) => {
    const request = {
      identifier: String(payload?.identifier || payload?.email || "").trim().toLowerCase(),
      otpType: normalizeOtpType(payload?.otpType),
      otp: payload?.otp,
      newPassword: payload?.newPassword,
      confirmPassword: payload?.confirmPassword,
    };
    if (payload?.verificationToken) request.verificationToken = payload.verificationToken;
    const response = await apiClient.post(API_ENDPOINTS.auth.resetPassword, request);
    return assertApiSuccess(extractData(response), "Unable to reset password.");
  },
  changePassword: async (payload) => {
    const { userId, ...request } = payload || {};
    if (!userId) throw new Error("User ID is required.");
    const response = await apiClient.post(API_ENDPOINTS.auth.changePassword(userId), request);
    return assertApiSuccess(extractData(response), "Unable to change password.");
  },
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.auth.logout);
    return extractData(response);
  },
  getUsers: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.auth.users, { params });
    return extractData(response);
  },
  getProfile: async (userId, authToken) => {
    if (!userId) throw new Error("User ID is required.");
    const response = await apiClient.get(API_ENDPOINTS.auth.profile(userId), authToken ? {
      headers: { Authorization: `Bearer ${authToken}` },
    } : undefined);
    return extractData(response);
  },
  updateProfile: async (userId, payload) => {
    if (!userId) throw new Error("User ID is required.");
    const response = await apiClient.put(API_ENDPOINTS.auth.profile(userId), payload);
    return extractData(response);
  },
  deleteUser: async (userId) => {
    if (!userId) throw new Error("User ID is required.");
    const response = await apiClient.delete(API_ENDPOINTS.auth.deleteUser(userId));
    return extractData(response);
  },
};

export const login = authService.login;
export const loginStudent = authService.loginStudent;
export const loginOrganization = authService.loginOrganization;
export const googleLoginStudent = authService.googleLoginStudent;
export const googleLoginEmployee = authService.googleLoginEmployee;
export const googleLoginOrganization = authService.googleLoginOrganization;
export const register = authService.register;
export const sendOtp = authService.sendOtp;
export const verifyOtp = authService.verifyOtp;
export const forgotPassword = authService.forgotPassword;
export const loginSuperAdmin = authService.loginSuperAdmin;
export const resetPassword = authService.resetPassword;
export const changePassword = authService.changePassword;
export const logout = authService.logout;
export const getUsers = authService.getUsers;
export const getProfile = authService.getProfile;
export const updateProfile = authService.updateProfile;
export const deleteUser = authService.deleteUser;

export default authService;
