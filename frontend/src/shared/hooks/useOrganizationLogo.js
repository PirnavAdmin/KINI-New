import { useEffect, useState } from "react";
import apiClient from "@shared/services/apiClient";
import { resolvePhotoUrl } from "@shared/services/profilePhotoService";

const LOGO_ENDPOINT = "/api/v1/organization/logo";
export const ORGANIZATION_LOGO_CHANGED = "kini:organization-logo-changed";

/** GET /api/v1/organization/logo → the saved logo path (e.g. /uploads/organization-logos/1_x.png) or "". */
export async function fetchOrganizationLogoUrl(signal) {
  const response = await apiClient.get(LOGO_ENDPOINT, { signal });
  const data = response?.data?.data ?? response?.data ?? {};
  return typeof data.logoUrl === "string" ? data.logoUrl : "";
}

/** Tell the header (and anything else listening) that the logo changed. Pass "" after removal. */
export function announceOrganizationLogo(logoUrl) {
  window.dispatchEvent(new CustomEvent(ORGANIZATION_LOGO_CHANGED, { detail: { logoUrl: logoUrl || "" } }));
}

/**
 * The signed-in organization's logo as an <img> src ("" when there is none).
 * Updates immediately when Settings uploads, replaces or removes the logo.
 */
export default function useOrganizationLogo({ enabled = true } = {}) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    fetchOrganizationLogoUrl(controller.signal)
      .then((url) => setLogoUrl(url))
      .catch(() => { /* No logo or endpoint unavailable: keep the initials. */ });
    const onChange = (event) => setLogoUrl(event.detail?.logoUrl || "");
    window.addEventListener(ORGANIZATION_LOGO_CHANGED, onChange);
    return () => {
      controller.abort();
      window.removeEventListener(ORGANIZATION_LOGO_CHANGED, onChange);
    };
  }, [enabled]);

  return enabled && logoUrl ? resolvePhotoUrl(logoUrl) : "";
}
