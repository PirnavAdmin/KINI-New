/**
 * Client for Demo Payment Mode (development only, no real money).
 *
 * The demo backend runs on the Vite dev server (server/demo-payments) and is
 * switched on separately with DEMO_PAYMENTS_ENABLED. VITE_PAYMENT_MODE=demo
 * only selects this client; a production bundle always uses the real gateway.
 */
import { getStoredAuthToken } from "./apiClient";

export const DEMO_LABEL = "DEMO PAYMENT — NO REAL MONEY CHARGED";

export const isDemoPaymentMode = import.meta.env.DEV && import.meta.env.VITE_PAYMENT_MODE === "demo";

const BASE = `${import.meta.env.VITE_DEMO_PAYMENT_API_BASE ?? ""}/demo-api/v1`;

export class DemoPaymentApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "DemoPaymentApiError";
    this.status = status;
    this.code = code;
  }
}

const request = async (path, { method = "GET", body, reviewer = false } = {}) => {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (reviewer) {
    const token = getStoredAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new DemoPaymentApiError("Can't reach the demo payment server. Is the dev server running?", 0, "network");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new DemoPaymentApiError(data.message || `Demo payment request failed (${response.status})`, response.status, data.code);
  return data;
};

export const demoPaymentApi = {
  status: () => request("/status"),
  createOrder: (payload) => request("/orders", { method: "POST", body: payload }),
  getOrder: (orderId) => request(`/orders/${encodeURIComponent(orderId)}`),
  completeOrder: (orderId, payload) => request(`/orders/${encodeURIComponent(orderId)}/complete`, { method: "POST", body: payload }),
  listEnrollmentRequests: (status) => request(`/enrollment-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`, { reviewer: true }),
  approveEnrollmentRequest: (id) => request(`/enrollment-requests/${encodeURIComponent(id)}/approve`, { method: "POST", body: {}, reviewer: true }),
  // Stores the real backend student id for this demo payment (no status change).
  linkBackendStudent: (id, liveStudentId) => request(`/enrollment-requests/${encodeURIComponent(id)}/backend-link`, { method: "POST", body: { liveStudentId: String(liveStudentId) }, reviewer: true }),
  // Records that the live backend approved this request's student (no demo account or email).
  recordLiveApproval: (id, liveStudentId) => request(`/enrollment-requests/${encodeURIComponent(id)}/live-approval`, { method: "POST", body: { liveStudentId: String(liveStudentId) }, reviewer: true }),
  rejectEnrollmentRequest: (id, reason) => request(`/enrollment-requests/${encodeURIComponent(id)}/reject`, { method: "POST", body: { reason }, reviewer: true }),
  inspectActivation: (token) => request(`/activation/${encodeURIComponent(token)}`),
  activateAccount: (token, password) => request("/activation", { method: "POST", body: { token, password } }),
};

export default demoPaymentApi;
