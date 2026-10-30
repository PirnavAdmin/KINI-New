import { authService } from "@shared/services/authService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const readJsonStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export const resolveUserId = (authUser) => {
  const storedUser = readJsonStorage("user");
  const directId =
    authUser?.userId ??
    authUser?.id ??
    authUser?.studentId ??
    storedUser?.userId ??
    storedUser?.id ??
    storedUser?.studentId ??
    localStorage.getItem("userId") ??
    localStorage.getItem("studentId");

  if (directId) return directId;

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token?.split(".")?.[1] ? decodeBase64Url(token.split(".")[1]) : null;

  return (
    payload?.userId ??
    payload?.id ??
    payload?.sub ??
    payload?.nameid ??
    payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    null
  );
};

export const normalizeProfile = (profile = {}) => {
  const firstName = profile.firstName ?? "";
  const lastName = profile.lastName ?? "";
  const fullName =
    profile.fullName ??
    profile.name ??
    [firstName, lastName].filter(Boolean).join(" ");

  return {
    raw: profile,
    fullName,
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? profile.phone ?? profile.mobile ?? "",
    profileImage: profile.profileImage ?? profile.profileImageUrl ?? profile.avatar ?? profile.avatarUrl ?? "",
    address: profile.address ?? profile.location ?? "",
    dateOfBirth: profile.dateOfBirth ?? profile.dob ?? profile.birthDate ?? "",
    gender: profile.gender ?? "",
  };
};

export const buildProfilePayload = (form, original = {}) => {
  const originalFirstName = original.firstName || "";
  const originalLastName = original.lastName || "";
  const parts = String(form.fullName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || originalFirstName;
  const lastName = parts.slice(1).join(" ") || originalLastName;
  const phone = String(form.phoneNumber || original.phone || "").trim();

  if (!firstName || !lastName || !phone) {
    throw new Error("First name, last name, and phone are required.");
  }

  return { firstName, lastName, phone };
};

export const getUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  return normalizeProfile(await authService.getProfile(userId));
};

export const updateUserProfile = async (userId, payload) => {
  if (!userId) throw new Error("User ID is required");
  return normalizeProfile(await authService.updateProfile(userId, payload));
};

export const getProfileErrorMessage = (error) =>
  getApiErrorMessage(error, "Unable to load profile. Please try again.");

export default {
  buildProfilePayload,
  getProfileErrorMessage,
  getUserProfile,
  normalizeProfile,
  resolveUserId,
  updateUserProfile,
};
