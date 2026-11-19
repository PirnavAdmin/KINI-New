import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";

/**
 * Public enrollment + UPI payment workflow.
 *
 * Guests never sign in. Each enrollment has its own access token, issued by
 * the backend when the enrollment is created (and in the emailed link). It is
 * sent as X-Enrollment-Token; no JWT is attached (skipAuth).
 */

const E = API_ENDPOINTS.publicEnrollment;
const R = API_ENDPOINTS.enrollmentReview;
const ACCESS_KEY = "kini:enrollment:access";
export const TOKEN_HEADER = "X-Enrollment-Token";

// ---------------------------------------------------------------------------
// Access-token storage (per enrollment, this browser only)
// ---------------------------------------------------------------------------

const readAccessMap = () => {
  try {
    const value = JSON.parse(localStorage.getItem(ACCESS_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
};

const writeAccessMap = (map) => {
  try {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(map));
  } catch {
    // Storage blocked (private mode): the emailed link still works.
  }
};

export const enrollmentAccess = {
  get(enrollmentId) {
    const entry = readAccessMap()[String(enrollmentId)];
    return entry?.token ? entry : null;
  },
  save(enrollmentId, entry) {
    const map = readAccessMap();
    map[String(enrollmentId)] = { ...map[String(enrollmentId)], ...entry, savedAt: new Date().toISOString() };
    writeAccessMap(map);
  },
  remove(enrollmentId) {
    const map = readAccessMap();
    delete map[String(enrollmentId)];
    writeAccessMap(map);
  },
  /** Other enrollments started in this browser (multi-course checkout). */
  list() {
    return Object.entries(readAccessMap())
      .filter(([, entry]) => entry?.token)
      .map(([enrollmentId, entry]) => ({ enrollmentId, ...entry }));
  },
  /**
   * Emailed links carry the token in the URL fragment (#token=...), which is
   * never sent to a server. Store it, then strip it from the address bar.
   */
  captureFromLocation(enrollmentId) {
    const hash = window.location.hash || "";
    const match = hash.match(/(?:^#|&)token=([A-Za-z0-9_-]+)/);
    if (!match) return null;
    enrollmentAccess.save(enrollmentId, { token: match[1] });
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    return match[1];
  },
};

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------

const camel = (key) => (key ? key.charAt(0).toLowerCase() + key.slice(1) : key);

/**
 * Turns an Axios error into { status, code, message, fieldErrors, network }.
 * fieldErrors keys are camelCase field names.
 */
export const toEnrollmentError = (error) => {
  const response = error?.response;
  if (!response) {
    return {
      status: 0,
      code: error?.code === "ERR_UNEXPECTED_HTML" ? "BAD_RESPONSE" : "NETWORK_ERROR",
      message: error?.code === "ERR_UNEXPECTED_HTML"
        ? "The server returned an unexpected page. Please try again in a moment."
        : "We couldn't reach the server. Check your internet connection and try again.",
      fieldErrors: {},
      network: true,
    };
  }

  const data = response.data || {};
  const fieldErrors = {};
  if (Array.isArray(data.errors)) {
    // Standard envelope: errors: [{ field, message }]
    data.errors.forEach((item) => {
      const key = camel(String(item?.field ?? "").split(".").pop());
      if (key && !fieldErrors[key]) fieldErrors[key] = String(item?.message ?? "");
    });
  } else if (data.errors && typeof data.errors === "object") {
    Object.entries(data.errors).forEach(([key, messages]) => {
      fieldErrors[camel(key)] = Array.isArray(messages) ? messages[0] : String(messages);
    });
  }

  const fallback = {
    400: "Please check the highlighted fields.",
    401: "Your enrollment link is missing or has expired.",
    403: "You don't have permission to do this.",
    404: "We couldn't find this enrollment.",
    409: "This request conflicts with the current status. Refresh and try again.",
    413: "The uploaded file is too large.",
    429: "Too many requests. Please wait a few minutes and try again.",
  }[response.status] || "Something went wrong. Please try again.";

  return {
    status: response.status,
    code: data.errorCode || data.code || (response.status === 400 ? "VALIDATION_ERROR" : `HTTP_${response.status}`),
    message: (response.status === 400 && Object.keys(fieldErrors).length ? Object.values(fieldErrors)[0] : null)
      || data.message
      || fallback,
    fieldErrors,
    network: false,
  };
};

/** Standard envelope { success, message, data } → data (other shapes pass through). */
const unwrap = (response) => {
  const body = response?.data;
  return body && typeof body === "object" && "success" in body && "data" in body ? body.data : body;
};

/** Paged envelope → { data, totalRecords, page, limit, totalPages }. */
const unwrapPaged = (response) => {
  const body = response?.data ?? {};
  const pagination = body.pagination ?? {};
  return {
    data: Array.isArray(body.data) ? body.data : [],
    totalRecords: pagination.totalRecords ?? body.totalRecords ?? 0,
    page: pagination.page ?? body.pageNumber ?? 1,
    limit: pagination.limit ?? body.pageSize ?? 0,
    totalPages: pagination.totalPages ?? body.totalPages ?? 0,
  };
};

/** For actions whose message the UI shows (e.g. approve, resend link). */
const unwrapWithMessage = (response) => {
  const body = response?.data ?? {};
  const data = unwrap(response);
  return data && typeof data === "object" ? { ...data, message: data.message || body.message } : data;
};
const tokenHeaders = (token) => ({ [TOKEN_HEADER]: token || "" });

// ---------------------------------------------------------------------------
// Public (student) API
// ---------------------------------------------------------------------------

export const publicEnrollmentApi = {
  getCourse: (courseId) => apiClient.get(E.course(courseId), { skipAuth: true }).then(unwrap),

  /** Body has no amount or organization: the backend derives both from the course. */
  create: (payload) => apiClient.post(E.create, payload, { skipAuth: true }).then(unwrap),

  requestAccessLink: (payload) => apiClient.post(E.accessLink, payload, { skipAuth: true }).then(unwrap),

  getPaymentDetails: (id, token) =>
    apiClient.get(E.payment(id), { skipAuth: true, headers: tokenHeaders(token) }).then(unwrap),

  /** QR image as an object URL (the endpoint needs the token header, so <img src> can't load it directly). */
  getPaymentQrUrl: async (id, token) => {
    const response = await apiClient.get(E.paymentQr(id), {
      skipAuth: true,
      responseType: "blob",
      headers: tokenHeaders(token),
    });
    return URL.createObjectURL(response.data);
  },

  submitPayment: (id, token, { utrNumber, paymentDate, amountPaid, screenshot }, onUploadProgress) => {
    const form = new FormData();
    form.append("utrNumber", utrNumber);
    form.append("paymentDate", paymentDate);
    if (amountPaid !== undefined && amountPaid !== null && amountPaid !== "") form.append("amountPaid", String(amountPaid));
    form.append("screenshot", screenshot);
    return apiClient.post(E.submitPayment(id), form, {
      skipAuth: true,
      headers: tokenHeaders(token),
      timeout: 120000,
      onUploadProgress,
    }).then(unwrap);
  },

  getStatus: (id, token) =>
    apiClient.get(E.status(id), { skipAuth: true, headers: tokenHeaders(token) }).then(unwrap),

  getDetails: (id, token) =>
    apiClient.get(E.details(id), { skipAuth: true, headers: tokenHeaders(token) }).then(unwrap),

  getPaymentHistory: (id, token) =>
    apiClient.get(E.paymentHistory(id), { skipAuth: true, headers: tokenHeaders(token) }).then(unwrap),

  inspectPasswordSetup: (token) =>
    apiClient.post(E.passwordSetupInspect, { token }, { skipAuth: true }).then(unwrap),

  completePasswordSetup: (token, password, confirmPassword) =>
    apiClient.post(E.passwordSetupComplete, { token, password, confirmPassword }, { skipAuth: true }).then(unwrapWithMessage),
};

// ---------------------------------------------------------------------------
// Organization review API (uses the signed-in organization JWT)
// ---------------------------------------------------------------------------

export const enrollmentReviewApi = {
  getPayments: (params) => apiClient.get(R.payments, { params }).then(unwrapPaged),
  getPayment: (paymentId) => apiClient.get(R.payment(paymentId)).then(unwrap),

  getPaymentScreenshotUrl: async (paymentId) => {
    const response = await apiClient.get(R.paymentScreenshot(paymentId), { responseType: "blob" });
    return URL.createObjectURL(response.data);
  },

  verifyPayment: (paymentId, note) =>
    apiClient.post(R.verifyPayment(paymentId), { confirmBankTransactionChecked: true, note: note || undefined }).then(unwrap),

  rejectPayment: (paymentId, reason) => apiClient.post(R.rejectPayment(paymentId), { reason }).then(unwrap),

  getApprovals: (params) => apiClient.get(R.approvals, { params }).then(unwrapPaged),
  getHistory: (id) => apiClient.get(R.history(id)).then(unwrap),
  approve: (id, batchId, remarks) =>
    apiClient.post(R.approve(id), {
      ...(batchId ? { batchId: Number(batchId) } : {}),
      ...(remarks ? { remarks } : {}),
    }).then(unwrapWithMessage),
  reject: (id, reason) => apiClient.post(R.reject(id), { reason }).then(unwrap),
  resendSetupLink: (id) => apiClient.post(R.resendSetupLink(id), {}).then(unwrapWithMessage),

  getPaymentSettings: () => apiClient.get(R.paymentSettings).then(unwrap),
  updatePaymentSettings: (payload) => apiClient.put(R.paymentSettings, payload).then(unwrap),
  uploadPaymentQr: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post(R.paymentSettingsQr, form).then(unwrap);
  },
  getPaymentQrUrl: async () => {
    const response = await apiClient.get(R.paymentSettingsQr, { responseType: "blob" });
    return URL.createObjectURL(response.data);
  },
};

/** Public route helpers. */
export const enrollmentRoutes = {
  payment: (id) => `/enrollment/${encodeURIComponent(id)}/payment`,
  status: (id) => `/enrollment/${encodeURIComponent(id)}/status`,
  access: "/enrollment/access",
};
