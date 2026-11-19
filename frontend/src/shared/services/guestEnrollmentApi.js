import apiClient from './apiClient';
import { normalizeEnrollment, normalizePayment, normalizePaymentInfo, deriveUpiStage, isUpiPaymentVerified } from './upiPaymentService';

// Proposed backend contract: see GUEST_ENROLLMENT_BACKEND_REQUIREMENTS.md.
// Capabilities are sent in headers, never query strings or organization auth.
const root = '/api/v1/guest/enrollments';
const anonymous = { skipAuth: true, skipAuthRedirect: true };
const bodyOf = (r) => r?.data?.data ?? r?.data ?? r;
const access = (token) => {
  if (!token) throw new Error('The private enrollment link is missing. Reopen your saved status link.');
  return { ...anonymous, headers: { 'X-Enrollment-Token': token } };
};
const path = (id) => `${root}/${encodeURIComponent(id)}`;

export const guestEnrollmentApi = {
  async create({ courseId, student, batchId, idempotencyKey }) {
    const r = await apiClient.post(root, { courseId, studentDetails: student, batchId: batchId || null, acceptedTerms: true }, {
      ...anonymous, headers: { 'Idempotency-Key': idempotencyKey },
    });
    const body = bodyOf(r);
    if (!body?.accessToken) throw new Error('The server did not return a private enrollment token. Please contact support before paying.');
    return { ...normalizeEnrollment(r), guestAccessToken: body.accessToken };
  },
  paymentInfo: (id, token) => apiClient.get(`${path(id)}/payment`, access(token)).then(normalizePaymentInfo),
  async submit(id, token, { utrNumber, screenshot }, idempotencyKey) {
    const form = new FormData();
    form.append('UTRNumber', utrNumber);
    form.append('PaymentScreenshot', screenshot);
    return normalizePayment(await apiClient.post(`${path(id)}/payments`, form, {
      ...access(token), headers: { ...access(token).headers, 'Idempotency-Key': idempotencyKey },
    }));
  },
  async status(id, token) {
    const body = bodyOf(await apiClient.get(path(id), access(token)));
    const enrollment = normalizeEnrollment(body.enrollment);
    const payment = body.payment ? normalizePayment(body.payment) : null;
    const stage = deriveUpiStage({ enrollmentStatus: enrollment.enrollmentStatus, paymentStatus: payment?.status || enrollment.paymentStatus });
    const verified = isUpiPaymentVerified(payment?.status || enrollment.paymentStatus);
    return { enrollment, payment,
      stage: stage === 'approved' && !verified ? 'submitted' : stage,
      accountReady: verified && stage === 'approved' && body.accountReady === true,
      requiresPasswordSetup: body.requiresPasswordSetup === true,
      rejectionReason: payment?.rejectionReason || enrollment.rejectionReason,
    };
  },
};

export const accountActivationApi = {
  inspectActivation: (token) => apiClient.post('/api/v1/guest/account-activation/inspect', { token }, anonymous).then(bodyOf),
  activateAccount: (token, password) => apiClient.post('/api/v1/guest/account-activation', { token, password }, anonymous).then(bodyOf),
};
