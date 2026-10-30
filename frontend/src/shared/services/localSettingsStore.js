/**
 * localSettingsStore — localStorage-backed fallback for settings that the
 * backend does not implement yet. Values are scoped per organization so two
 * organizations signing in on the same browser never see each other's data.
 */
import { readStoredOrganizationId } from "./apiServices";

const scopedKey = (key) => {
  const organizationId = readStoredOrganizationId();
  return `org_settings:${organizationId ?? "unknown"}:${key}`;
};

export const readLocalSettings = (key, defaults = null) => {
  try {
    const raw = localStorage.getItem(scopedKey(key));
    if (!raw) return defaults;
    return { ...(defaults || {}), ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
};

export const writeLocalSettings = (key, value) => {
  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const readLocalList = (key, defaults = []) => {
  try {
    const raw = localStorage.getItem(scopedKey(key));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaults;
  } catch {
    return defaults;
  }
};

export const writeLocalList = (key, value) => {
  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
