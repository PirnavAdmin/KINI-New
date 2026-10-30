// Compatibility facade. New code should import authService directly.
import { authService } from "./authService";

const API_ROLES = {
  student: "Student",
  employee: "Employee",
  mentor: "Mentor",
  organization: "Organization",
  "org-admin": "Organization",
  admin: "Admin",
  "super-admin": "SuperAdmin",
  "super admin": "SuperAdmin",
  superadmin: "SuperAdmin",
};

export const toApiRole = (role) => API_ROLES[String(role || "").toLowerCase()] || String(role || "").trim();

export const registerUser = (data) => authService.register(data);
export const loginUser = (data) => authService.login(data);
export const sendOtp = (emailOrPayload) => authService.sendOtp(
  typeof emailOrPayload === "string"
    ? { identifier: emailOrPayload, otpType: "Email" }
    : emailOrPayload
);
export const verifyOtp = authService.verifyOtp;
export const forgotPassword = (identifier, otpType) => authService.forgotPassword(identifier, otpType);
export const resetPassword = authService.resetPassword;
export const changePassword = authService.changePassword;
export const logoutUser = authService.logout;
export const listUsers = authService.getUsers;
export const getUserProfile = authService.getProfile;
export const updateUserProfile = authService.updateProfile;
export const deleteUser = authService.deleteUser;

export default authService;
