// Thin wrapper around Google Identity Services (loaded from the CDN, no npm
// dependency) so every role's login page can trigger the same credential flow
// from its existing "Continue with Google" button.
//
// google.accounts.id is a page-level singleton — Google's own docs say
// initialize() should be called exactly once per page load. This used to
// call initialize() again on every single login attempt (every button click,
// every retry after a cancel), which is exactly what produced GSI's own
// "initialize() is called multiple times" console warning, and left One
// Tap's internal moment/cookie state inconsistent between attempts. That
// inconsistency — layered on top of an unauthorized-origin client (see
// requestGoogleCredential's unregistered_origin handling below) — is what
// let a later attempt's chooser interaction end up resolving with a stale
// account instead of the one just selected. initialize() now runs exactly
// once (module-level guard) with a single, stable callback that always
// forwards to whichever request is currently pending; nothing here decides
// identity by itself, it just relays whatever credential Google returns for
// the in-flight prompt.

let scriptPromise = null;
let initialized = false;
// The { resolve, reject } pair for the one requestGoogleCredential() call
// currently in flight, or null. A credential/error that arrives with no
// pending request (e.g. a late-firing moment from an earlier, already-
// timed-out attempt) is simply dropped — it must never silently resolve a
// different, later attempt.
let pending = null;

const loadGoogleIdentityScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-google-identity]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

export const isGoogleLoginConfigured = () => Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

/**
 * Tells GIS to stop auto-selecting an account on this browser. Call this on
 * app logout so a returning visit doesn't silently re-authenticate the
 * account that was just signed out of. Safe to call even if Google sign-in
 * was never used this session — it never loads the GIS script itself, it
 * only acts if that script is already present, so logout for a
 * password-only user stays free of any Google network call.
 */
export const disableGoogleAutoSelect = () => {
  try {
    window.google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // Best-effort only; logout must never fail because of this.
  }
};

const ensureInitialized = (google, clientId) => {
  if (initialized) return;
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      const current = pending;
      pending = null;
      if (!current) return;
      if (response?.credential) current.resolve(response.credential);
      else current.reject(new Error("Google sign-in did not return a credential."));
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  initialized = true;
};

// Reasons GIS can give for the prompt not rendering at all. unregistered_origin
// is exactly "The given origin is not allowed for the given client ID" — when
// GIS reports this we stop immediately with a clear, actionable message
// instead of falling through to the hidden-button-click fallback, since that
// fallback's behavior for an unauthorized origin is unreliable (this is the
// other half of how a mismatched account could get through previously).
const NOT_DISPLAYED_MESSAGES = {
  unregistered_origin:
    "Google sign-in isn't allowed for this website's address yet. Add this exact origin to the OAuth client's Authorized JavaScript origins in Google Cloud Console, then reload the page.",
  invalid_client: "Google sign-in is misconfigured (invalid client ID). Check VITE_GOOGLE_CLIENT_ID.",
  missing_client_id: "Google sign-in is not configured for this app yet.",
  secure_http_required: "Google sign-in requires HTTPS (or localhost). This page isn't served securely.",
};

/**
 * Resolves with a Google ID token credential for whichever account the user
 * just picked. Google's One Tap prompt is silently skipped in some browser/
 * session states (e.g. an already-dismissed prompt or a blocked third-party
 * context), so this falls back to programmatically clicking an off-screen
 * rendered Google button — the standard workaround for that GIS limitation.
 */
export const requestGoogleCredential = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google sign-in is not configured for this app yet.");
  }
  await loadGoogleIdentityScript();
  const google = window.google;
  if (!google?.accounts?.id) {
    throw new Error("Google sign-in failed to load. Please try again.");
  }

  // Second, code-level guard behind the UI's own disabled-button state: never
  // let two attempts run at once. Two live prompts/hidden buttons could
  // otherwise cross-resolve each other's promise with the wrong account.
  if (pending) {
    throw new Error("A Google sign-in attempt is already in progress.");
  }

  ensureInitialized(google, clientId);

  // Force a fresh account chooser every time. Without this, GIS's auto
  // sign-in state (the g_state cookie) can silently re-confirm whichever
  // Google account was used or dismissed last time instead of showing the
  // picker for the account being selected right now — this is the concrete
  // mechanism behind "I picked account B but got logged in as account A".
  google.accounts.id.disableAutoSelect();

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      pending = null;
      fn(value);
    };
    pending = {
      resolve: (value) => finish(resolve, value),
      reject: (err) => finish(reject, err),
    };

    google.accounts.id.prompt((notification) => {
      if (settled) return;
      const skipped = notification.isNotDisplayed?.() || notification.isSkippedMoment?.();
      if (!skipped) return;

      const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.();
      const knownMessage = reason && NOT_DISPLAYED_MESSAGES[reason];
      if (knownMessage) {
        finish(reject, new Error(knownMessage));
        return;
      }

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-1000px";
      container.style.left = "-1000px";
      document.body.appendChild(container);
      try {
        google.accounts.id.renderButton(container, { type: "standard" });
        const clickable = container.querySelector('div[role="button"]');
        if (clickable) clickable.click();
        else finish(reject, new Error("Google sign-in could not be started. Please allow pop-ups and try again."));
      } catch {
        finish(reject, new Error("Google sign-in could not be started. Please allow pop-ups and try again."));
      } finally {
        window.setTimeout(() => container.remove(), 4000);
      }
    });

    window.setTimeout(() => finish(reject, new Error("Google sign-in timed out. Please try again.")), 60000);
  });
};

/**
 * Decodes a Google ID token credential WITHOUT verifying its signature — for
 * client-side debugging/verification only (e.g. confirming the selected
 * account's email matches what the backend just authenticated). The backend
 * independently verifies the credential's signature; the frontend never
 * treats this decoded payload as a trust boundary by itself.
 */
export const decodeGoogleCredential = (credential) => {
  try {
    const payload = String(credential || "").split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const claims = JSON.parse(atob(padded));
    return {
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
      picture: claims.picture,
    };
  } catch {
    return null;
  }
};

export default {
  requestGoogleCredential,
  isGoogleLoginConfigured,
  decodeGoogleCredential,
  disableGoogleAutoSelect,
};
