/**
 * UPI payment module: organization UPI settings, course enrollments, UTR +
 * screenshot submission, payment verification and enrollment approval.
 *
 * These routes are the UPI integration contract, not verified deployed APIs.
 * The configured backend's live Swagger currently omits this module; see
 * ORGANIZATION_UPI_ROUTE_DIAGNOSIS.md. Readers tolerate wrapped/PascalCase data.
 */
import apiClient from "./apiClient";
import { getListPayload } from "./apiServices";
import { API_ENDPOINTS } from "@/api/endpoints";
import { isDemoPaymentMode } from "./demoPaymentApi";

const E = API_ENDPOINTS.upi;

/**
 * Checkout mode. UPI (QR + UTR proof, verified by the organization) is the
 * default; VITE_PAYMENT_MODE=razorpay keeps the card gateway and
 * VITE_PAYMENT_MODE=demo the development-only demo gateway.
 */
export const isUpiPaymentMode = !isDemoPaymentMode
  && String(import.meta.env.VITE_PAYMENT_MODE ?? "upi").trim().toLowerCase() === "upi";

export const SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/jpg"];
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;

// ── defensive readers ────────────────────────────────────────────────────────

const unwrap = (response) => {
  const body = response?.data ?? response;
  if (body && typeof body === "object" && !Array.isArray(body) && body.data && typeof body.data === "object") return body.data;
  return body;
};

const lowerKeys = (object) => Object.fromEntries(Object.entries(object).map(([key, value]) => [key.toLowerCase(), value]));

/** First non-empty value for any of `keys`, searched breadth-first up to `depth` objects down. */
export const pick = (source, keys, depth = 2) => {
  const wanted = keys.map((key) => key.toLowerCase());
  let level = [source];
  for (let d = 0; d <= depth && level.length; d += 1) {
    const next = [];
    for (const node of level) {
      if (!node || typeof node !== "object" || Array.isArray(node)) continue;
      const map = lowerKeys(node);
      for (const key of wanted) {
        const value = map[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") return value;
      }
      Object.values(node).forEach((child) => { if (child && typeof child === "object" && !Array.isArray(child)) next.push(child); });
    }
    level = next;
  }
  return undefined;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const lc = (value) => String(value ?? "").trim().toLowerCase();

export const isUpiPaymentVerified = (status) => ["verified", "paymentverified"].includes(lc(status).replace(/[\s_-]/g, ""));

/** The UPI QR details shown to the student (GET /enrollments/{id}/payment). */
export const normalizePaymentInfo = (raw) => {
  const body = unwrap(raw) ?? {};
  return {
    enrollmentId: pick(body, ["enrollmentId", "courseEnrollmentId"]),
    upiId: pick(body, ["upiId", "vpa", "payeeVpa", "upi"]) ?? "",
    payeeName: pick(body, ["payeeName", "accountName", "organizationName", "orgName"]) ?? "",
    organizationName: pick(body, ["organizationName", "orgName"]) ?? "",
    qrCode: pick(body, ["qrCodeUrl", "qrCodeImageUrl", "qrImageUrl", "qrCodeImage", "qrCodePath", "qrCode", "qrImage"]) ?? "",
    amount: toNumber(pick(body, ["amount", "payableAmount", "finalAmount", "totalAmount", "courseFee", "fee", "price"])),
    currency: pick(body, ["currency"]) ?? "INR",
    paymentStatus: pick(body, ["paymentStatus", "verificationStatus"]) ?? "",
    raw: body,
  };
};

/** One enrollment (POST /enrollments, GET /enrollments/{id}, list rows). */
export const normalizeEnrollment = (raw) => {
  const body = unwrap(raw) ?? {};
  return {
    id: pick(body, ["enrollmentId", "courseEnrollmentId", "id"], 0) ?? pick(body, ["enrollmentId", "courseEnrollmentId", "id"]),
    courseId: pick(body, ["courseId"]),
    courseName: pick(body, ["courseName", "courseTitle", "title"]) ?? "",
    enrollmentStatus: pick(body, ["enrollmentStatus", "approvalStatus", "status"], 0) ?? pick(body, ["enrollmentStatus", "approvalStatus"]) ?? "",
    paymentStatus: pick(body, ["paymentStatus", "verificationStatus"]) ?? "",
    paymentId: pick(body, ["paymentId", "coursePaymentId", "latestPaymentId"]),
    amount: toNumber(pick(body, ["amount", "payableAmount", "finalAmount", "courseFee", "fee", "price"])),
    utrNumber: pick(body, ["utrNumber", "utr", "transactionId"]) ?? "",
    createdAt: pick(body, ["createdAt", "enrolledAt", "enrollmentDate", "createdOn"]) ?? "",
    submittedAt: pick(body, ["submittedAt", "paymentSubmittedAt", "paymentDate"]) ?? "",
    verifiedAt: pick(body, ["verifiedAt", "paymentVerifiedAt", "reviewedAt"]) ?? "",
    approvedAt: pick(body, ["approvedAt", "approvalDate", "approvedOn"]) ?? "",
    rejectionReason: pick(body, ["rejectionReason", "remarks", "reason"]) ?? "",
    raw: body,
  };
};

/** One payment (POST …/payments, GET /student/payments/{id}). */
export const normalizePayment = (raw) => {
  const body = unwrap(raw) ?? {};
  return {
    id: pick(body, ["paymentId", "coursePaymentId", "id"], 0) ?? pick(body, ["paymentId", "coursePaymentId"]),
    enrollmentId: pick(body, ["enrollmentId", "courseEnrollmentId"]),
    status: pick(body, ["paymentStatus", "verificationStatus", "status"], 0) ?? pick(body, ["paymentStatus", "verificationStatus"]) ?? "",
    utrNumber: pick(body, ["utrNumber", "utr", "transactionId"]) ?? "",
    amount: toNumber(pick(body, ["amount", "paidAmount"])),
    method: pick(body, ["paymentMethod", "method"]) ?? "UPI",
    submittedAt: pick(body, ["submittedAt", "createdAt", "paymentDate"]) ?? "",
    verifiedAt: pick(body, ["verifiedAt", "reviewedAt"]) ?? "",
    rejectionReason: pick(body, ["rejectionReason", "remarks", "reason"]) ?? "",
    raw: body,
  };
};

const studentNameOf = (row) => pick(row, ["studentName", "fullName", "name"])
  ?? ([pick(row, ["firstName"]), pick(row, ["lastName"])].filter(Boolean).join(" ") || "Student");

/** A payment row on the organization side (APIs 11–13). */
export const normalizeOrgPayment = (raw) => {
  const row = unwrap(raw) ?? {};
  const payment = normalizePayment(row);
  return {
    ...payment,
    expectedAmount: toNumber(pick(row, ["expectedAmount", "payableAmount", "finalAmount", "courseFee"])),
    enrollmentId: payment.enrollmentId ?? pick(row, ["enrollmentId"]),
    studentName: studentNameOf(row),
    email: pick(row, ["email", "studentEmail"]) ?? "",
    mobile: pick(row, ["mobile", "phone", "phoneNumber"]) ?? "",
    courseName: pick(row, ["courseName", "courseTitle"]) ?? "",
    hasScreenshot: Boolean(pick(row, ["paymentScreenshot", "screenshotUrl", "screenshotPath", "screenshot", "paymentScreenshotUrl"])),
  };
};

/** An enrollment row on the organization side (APIs 16–17). */
export const normalizeOrgEnrollment = (raw) => {
  const row = unwrap(raw) ?? {};
  const enrollment = normalizeEnrollment(row);
  return {
    ...enrollment,
    studentName: studentNameOf(row),
    email: pick(row, ["email", "studentEmail"]) ?? "",
    mobile: pick(row, ["mobile", "phone", "phoneNumber"]) ?? "",
  };
};

/**
 * Where an enrollment stands, from its enrollment and payment statuses:
 * awaiting-payment → submitted → verified → approved, or a rejection.
 */
export const deriveUpiStage = ({ enrollmentStatus, paymentStatus } = {}) => {
  const enrollment = lc(enrollmentStatus).replace(/[\s_-]/g, "");
  const payment = lc(paymentStatus).replace(/[\s_-]/g, "");
  if (/reject|declin|cancel/.test(enrollment)) return "enrollment-rejected";
  if (/reject|fail|declin/.test(payment)) return "payment-rejected";
  if (/pendingapproval|awaitingapproval/.test(enrollment)) return "verified";
  if (/approv|active|enrolled|completed/.test(enrollment) && !/pending|await/.test(enrollment)) return "approved";
  if (/unpaid|notpaid|notsubmitted|awaitingpayment|pendingpayment|^none$/.test(payment)
    || (!payment && /pendingpayment|awaitingpayment|paymentpending/.test(enrollment))) return "awaiting-payment";
  if (/verif|success|paid|confirm|approv/.test(payment) && !/pending|unverif|under|await/.test(payment)) return "verified";
  if (payment || /submit|verification|review/.test(enrollment)) return "submitted";
  return "awaiting-payment";
};

// ── API ─────────────────────────────────────────────────────────────────────

const settingsForm = ({ upiId, payeeName, qrCodeImage }) => {
  const form = new FormData();
  form.append("UpiId", String(upiId ?? "").trim());
  form.append("PayeeName", String(payeeName ?? "").trim());
  if (qrCodeImage) form.append("QrCodeImage", qrCodeImage);
  return form;
};

const isSettingsEmpty = (error) => error?.response?.status === 404
  && ["PAYMENT_SETTINGS_NOT_CONFIGURED", "PAYMENT_SETTINGS_NOT_FOUND"].includes(error.response.data?.code);

const settingsError = (error) => {
  const status = error?.response?.status;
  const idErrors = error?.response?.data?.errors?.id;
  const routeCollision = status === 400 && JSON.stringify(idErrors ?? "").includes("payment-settings");
  if (routeCollision || status === 404 || status === 405) {
    const unavailable = new Error("UPI payment settings are unavailable on the server. Please contact your administrator.", { cause: error });
    unavailable.code = "UPI_SETTINGS_API_UNAVAILABLE";
    throw unavailable;
  }
  throw error;
};

export const upiPaymentApi = {
  // Organization UPI settings (APIs 1–3)
  getSettings: () => apiClient.get(E.paymentSettings).then(normalizePaymentInfo).catch((error) => {
    // A missing route is not a first-time setup. Only the backend's explicit
    // not-configured response (or an empty successful response) means empty.
    if (isSettingsEmpty(error)) return normalizePaymentInfo({});
    return settingsError(error);
  }),
  createSettings: (values) => apiClient.post(E.paymentSettings, settingsForm(values)).then(normalizePaymentInfo).catch(settingsError),
  updateSettings: (values) => apiClient.put(E.paymentSettings, settingsForm(values)).then(normalizePaymentInfo).catch(settingsError),

  // Student enrollment (APIs 4–7)
  createEnrollment: ({ courseId, student }) => apiClient.post(E.enrollments, {
    courseId: Number(courseId),
    studentDetails: {
      fullName: student.fullName,
      email: student.email,
      mobile: student.phone,
      qualification: student.qualification || undefined,
      collegeName: student.collegeName || undefined,
      address: [student.state, student.pincode].filter(Boolean).join(" - ") || undefined,
    },
  }).then(normalizeEnrollment),
  studentEnrollments: (params = {}) => apiClient.get(E.studentEnrollments, { params }).then((r) => getListPayload(r).map(normalizeEnrollment)),
  getEnrollment: (enrollmentId) => apiClient.get(E.enrollment(enrollmentId)).then(normalizeEnrollment),
  getPaymentInfo: (enrollmentId) => apiClient.get(E.enrollmentPayment(enrollmentId)).then(normalizePaymentInfo),

  // Payment submission (APIs 8–10)
  submitPayment: (enrollmentId, { utrNumber, amount, paymentDate, paymentMethod, screenshot }) => {
    const form = new FormData();
    form.append("EnrollmentId", String(enrollmentId));
    form.append("UTRNumber", String(utrNumber).trim());
    if (amount != null && Number(amount) > 0) form.append("Amount", String(amount));
    form.append("PaymentDate", paymentDate ?? new Date().toISOString());
    form.append("PaymentMethod", (paymentMethod || "UPI").slice(0, 30));
    form.append("PaymentScreenshot", screenshot);
    return apiClient.post(E.submitPayment(enrollmentId), form).then(normalizePayment);
  },
  /** The signed-in student's own UPI payments (all enrollments). */
  studentPayments: () => apiClient.get(E.studentPayments).then((r) => getListPayload(r)),
  getStudentPayment: (paymentId) => apiClient.get(E.studentPayment(paymentId)).then(normalizePayment),
  paymentHistory: (enrollmentId) => apiClient.get(E.studentPaymentHistory(enrollmentId)).then((r) => getListPayload(r).map(normalizePayment)),

  // Student course access (API 20)
  approvedEnrollments: () => apiClient.get(E.studentApprovedEnrollments).then((r) => getListPayload(r).map(normalizeEnrollment)),

  // Organization payment verification (APIs 11–15)
  orgPayments: (params = {}) => apiClient.get(E.orgPayments, { params }).then((r) => ({
    rows: getListPayload(r).map(normalizeOrgPayment),
    total: toNumber(pick(r?.data, ["totalRecords", "totalCount", "total", "count"])),
    totalPages: toNumber(pick(r?.data, ["totalPages", "pageCount"])),
  })),
  orgPendingPayments: () => apiClient.get(E.orgPendingPayments).then((r) => getListPayload(r).map(normalizeOrgPayment)),
  orgPayment: (paymentId) => apiClient.get(E.orgPayment(paymentId)).then(normalizeOrgPayment),
  orgPaymentScreenshot: (paymentId) => apiClient.get(E.orgPaymentScreenshot(paymentId), { responseType: "blob" }).then((r) => r.data),
  verifyPayment: (paymentId, remarks) => apiClient.put(E.orgVerifyPayment(paymentId), { remarks: remarks || undefined }).then(unwrap),
  rejectPayment: (paymentId, remarks) => apiClient.put(E.orgRejectPayment(paymentId), { remarks }).then(unwrap),

  // Organization student approval (APIs 16–19)
  orgPendingApprovals: () => apiClient.get(E.orgPendingApprovals).then((r) => getListPayload(r).map(normalizeOrgEnrollment)),
  orgApprovedEnrollments: () => apiClient.get(E.orgApprovedEnrollments).then((r) => getListPayload(r).map(normalizeOrgEnrollment)),
  /** Open batches of this enrollment's course (course + organization come from the server). */
  approvalBatches: (enrollmentId) => apiClient.get(E.orgApprovalBatches(enrollmentId)).then((r) => {
    const body = unwrap(r) ?? {};
    return {
      courseName: body.courseName ?? "",
      studentChosenBatchId: body.studentChosenBatchId ?? null,
      batches: (Array.isArray(body.batches) ? body.batches : []).map((batch) => ({
        id: batch.batchId,
        name: batch.batchName || `Batch #${batch.batchId}`,
        status: batch.status ?? "",
        startDate: batch.startDate ?? "",
        seatsAvailable: toNumber(batch.seatsAvailable),
      })),
    };
  }),
  approveEnrollment: (enrollmentId, batchId) => apiClient.put(E.orgApproveEnrollment(enrollmentId), { isApproved: true, batchId: Number(batchId) }).then(unwrap),
  rejectEnrollment: (enrollmentId, rejectionReason) => apiClient.put(E.orgRejectEnrollment(enrollmentId), { isApproved: false, rejectionReason }).then(unwrap),
};

/**
 * The latest state of one enrollment: its record, plus its payment when a
 * payment id is known (the payment carries the verification status).
 */
export const loadEnrollmentState = async ({ enrollmentId, paymentId }) => {
  const [enrollment, payment] = await Promise.all([
    upiPaymentApi.getEnrollment(enrollmentId),
    paymentId ? upiPaymentApi.getStudentPayment(paymentId).catch(() => null) : Promise.resolve(null),
  ]);
  const paymentStatus = payment?.status || enrollment.paymentStatus;
  return {
    enrollment,
    payment,
    stage: deriveUpiStage({ enrollmentStatus: enrollment.enrollmentStatus, paymentStatus }),
    rejectionReason: payment?.rejectionReason || enrollment.rejectionReason,
  };
};

export default upiPaymentApi;
