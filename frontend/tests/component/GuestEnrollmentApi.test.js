import { beforeEach, expect, it, vi } from 'vitest';
import apiClient from '@shared/services/apiClient';
import { guestEnrollmentApi, accountActivationApi } from '@shared/services/guestEnrollmentApi';
import { deriveUpiStage, isUpiPaymentVerified } from '@shared/services/upiPaymentService';
vi.mock('@shared/services/apiClient', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
it('creates anonymous guest applications with a retry key and a server-issued capability', async () => {
  apiClient.post.mockResolvedValue({ data: { enrollmentId: 42, accessToken: 'private-token', amount: 4500 } });
  const result = await guestEnrollmentApi.create({ courseId: 5, student: { email: 'asha@example.com' }, idempotencyKey: 'retry-key' });
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/guest/enrollments', expect.objectContaining({ courseId: 5, batchId: null }), expect.objectContaining({ skipAuth: true, skipAuthRedirect: true, headers: { 'Idempotency-Key': 'retry-key' } }));
  expect(result).toMatchObject({ id: 42, amount: 4500, guestAccessToken: 'private-token' });
});
it('submits only proof data, not a client-controlled payable amount or verification status', async () => {
  apiClient.post.mockResolvedValue({ data: { paymentId: 9, status: 'Pending' } });
  await guestEnrollmentApi.submit(42, 'private-token', { utrNumber: '123456789012', screenshot: new File(['image'], 'proof.png'), amount: 1 }, 'proof-key');
  const [path, form, config] = apiClient.post.mock.calls[0];
  expect(path).toBe('/api/v1/guest/enrollments/42/payments');
  expect(form.has('Amount')).toBe(false);
  expect(form.has('Status')).toBe(false);
  expect(config).toMatchObject({ skipAuth: true, headers: { 'X-Enrollment-Token': 'private-token', 'Idempotency-Key': 'proof-key' } });
});
it('does not report account readiness on unverified payment or without explicit server readiness', async () => {
  apiClient.get.mockResolvedValue({ data: { enrollment: { id: 42, status: 'Approved' }, payment: { status: 'Pending' }, accountReady: true } });
  expect(await guestEnrollmentApi.status(42, 'private-token')).toMatchObject({ accountReady: false, stage: 'submitted' });
  apiClient.get.mockResolvedValue({ data: { enrollment: { id: 42, status: 'Approved' }, payment: { status: 'Verified' }, requiresPasswordSetup: true } });
  expect(await guestEnrollmentApi.status(42, 'private-token')).toMatchObject({ accountReady: false, stage: 'approved', requiresPasswordSetup: true });
  apiClient.get.mockResolvedValue({ data: { enrollment: { id: 42, status: 'Approved' }, payment: { status: 'Verified' }, accountReady: true } });
  expect(await guestEnrollmentApi.status(42, 'private-token')).toMatchObject({ accountReady: true, stage: 'approved' });
});
it('uses anonymous activation and rejects ambiguous verification statuses', async () => {
  apiClient.post.mockResolvedValue({ data: { status: 'valid' } });
  await accountActivationApi.activateAccount('activation-token', 'StrongPassword123!');
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/guest/account-activation', { token: 'activation-token', password: 'StrongPassword123!' }, expect.objectContaining({ skipAuth: true, skipAuthRedirect: true }));
  for (const status of ['', 'Pending', 'Submitted', 'Unverified', 'PendingVerification', 'Paid']) expect(isUpiPaymentVerified(status)).toBe(false);
  expect(isUpiPaymentVerified('Verified')).toBe(true);
  expect(deriveUpiStage({ enrollmentStatus: 'PendingApproval', paymentStatus: 'Rejected' })).toBe('payment-rejected');
});
