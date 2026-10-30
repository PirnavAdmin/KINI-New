/**
 * Organization Settings service
 *
 * Scoped to the currently authenticated organization. The backend derives the
 * organization from the auth token — no organizationId is sent from the client
 * for settings that the token already identifies. Methods that are not yet
 * implemented by the backend reject normally; consumers surface the API error
 * and fall back to defaults without breaking the rest of Settings.
 */
import apiClient from "./apiClient";
import { getListPayload, getPayload } from "./apiServices";
import { permissionApi } from "./platformModulesApi";

const BASE = "/api/v1/organization";
const id = (value) => encodeURIComponent(value);

/* ── Organization settings (profile + branding + address + contact) ── */
export const fetchOrganizationSettings = () =>
  apiClient.get(`${BASE}/settings`).then(getPayload);

export const saveOrganizationSettings = (data) =>
  apiClient.put(`${BASE}/settings`, data).then(getPayload);

/* ── Logo upload (multipart; backend may return { logoUrl }) ── */
export const uploadOrganizationLogo = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(`${BASE}/logo`, formData).then(getPayload);
};

export const removeOrganizationLogo = () =>
  apiClient.delete(`${BASE}/logo`).then(getPayload);

/* ── Invoice settings ── */
export const fetchInvoiceSettings = () =>
  apiClient.get(`${BASE}/settings/invoice`).then(getPayload);

export const saveInvoiceSettings = (data) =>
  apiClient.put(`${BASE}/settings/invoice`, data).then(getPayload);

/* ── Email templates ── */
export const fetchEmailTemplates = () =>
  apiClient.get(`${BASE}/email-templates`).then(getListPayload);

export const saveEmailTemplate = (templateId, data) =>
  apiClient.put(`${BASE}/email-templates/${id(templateId)}`, data).then(getPayload);

export const sendTestEmail = (templateId, data) =>
  apiClient.post(`${BASE}/email-templates/${id(templateId)}/test`, data).then(getPayload);

/* ── General settings (date/time/currency/timezone) ── */
export const fetchGeneralSettings = () =>
  apiClient.get(`${BASE}/settings/general`).then(getPayload);

export const saveGeneralSettings = (data) =>
  apiClient.put(`${BASE}/settings/general`, data).then(getPayload);

/* ── Roles & permissions (organization-scoped custom roles) ── */
export const fetchRoles = () => apiClient.get(`${BASE}/roles`).then(getListPayload);

export const createRole = (data) => apiClient.post(`${BASE}/roles`, data).then(getPayload);

export const updateRole = (roleId, data) =>
  apiClient.put(`${BASE}/roles/${id(roleId)}`, data).then(getPayload);

export const deleteRole = (roleId) =>
  apiClient.delete(`${BASE}/roles/${id(roleId)}`).then(getPayload);

export const fetchRolePermissions = (roleId) =>
  permissionApi.byRole(roleId);

export const saveRolePermissions = (roleId, permissions) =>
  permissionApi.updateRole(roleId, permissions);

/* ── Notification preferences ── */
export const fetchNotificationPreferences = () =>
  apiClient.get(`${BASE}/settings/notifications`).then(getPayload);

export const saveNotificationPreferences = (data) =>
  apiClient.put(`${BASE}/settings/notifications`, data).then(getPayload);

/* ── Organization notifications (bell + notification center) ── */
export const fetchOrganizationNotifications = () =>
  apiClient.get(`${BASE}/notifications`).then(getListPayload);

export const fetchOrganizationUnreadCount = () =>
  apiClient.get(`${BASE}/notifications/unread-count`).then(getPayload);

export const markOrganizationNotificationRead = (notificationId) =>
  apiClient.put(`${BASE}/notifications/${id(notificationId)}/read`).then(getPayload);

export const markAllOrganizationNotificationsRead = () =>
  apiClient.put(`${BASE}/notifications/read-all`).then(getPayload);

export const organizationSettingsService = {
  fetchOrganizationSettings,
  saveOrganizationSettings,
  uploadOrganizationLogo,
  removeOrganizationLogo,
  fetchInvoiceSettings,
  saveInvoiceSettings,
  fetchEmailTemplates,
  saveEmailTemplate,
  sendTestEmail,
  fetchGeneralSettings,
  saveGeneralSettings,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRolePermissions,
  saveRolePermissions,
  fetchNotificationPreferences,
  saveNotificationPreferences,
  fetchOrganizationNotifications,
  fetchOrganizationUnreadCount,
  markOrganizationNotificationRead,
  markAllOrganizationNotificationsRead,
};

export default organizationSettingsService;
