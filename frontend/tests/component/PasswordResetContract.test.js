import { beforeEach, expect, it, vi } from 'vitest';
import apiClient from '@shared/services/apiClient';
import { authService, assertPasswordResetAccepted } from '@shared/services/authService';
vi.mock('@shared/services/apiClient', () => ({ default: { post: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
it('preserves the confirmed tokenless verification response used by registration', async () => {
  const body = { success: true, message: 'OTP verified successfully.' };
  apiClient.post.mockResolvedValue({ data: body });
  const result = await authService.verifyOtp({ identifier: 'learner@example.com', otpType: 'email', otp: '482913' });
  expect(result).toEqual(body);
  expect(result).not.toHaveProperty('resetToken');
});
it('rejects an explicit verification failure even when HTTP status is 200', async () => {
  apiClient.post.mockResolvedValue({ status: 200, data: { success: false, message: 'Invalid OTP.' } });
  await expect(authService.verifyOtp({ identifier: 'learner@example.com', otpType: 'email', otp: '482913' })).rejects.toThrow('Invalid OTP.');
});
it.each([{ success: true }, { data: { success: true } }, { message: 'Password reset successfully.' }])('accepts explicit reset confirmation', (body) => {
  expect(() => assertPasswordResetAccepted(body)).not.toThrow();
});
it.each([{ success: false, data: { success: true } }, { success: true, data: { success: false, message: 'OTP expired.' } }, { message: 'OTP not found.' }, {}, { errors: { otp: ['Invalid OTP'] } }])('rejects failed or unconfirmed HTTP 200 bodies', (body) => {
  expect(() => assertPasswordResetAccepted(body)).toThrow();
});
it('sends existing OTP authorization and preserves application-level rejection for the form', async () => {
  apiClient.post.mockResolvedValue({ data: { success: false, message: 'OTP expired.' } });
  await expect(authService.resetPassword({ identifier: ' LEARNER@EXAMPLE.COM ', otpType: 'Email', otp: '482913', verificationToken: 'issued-token', newPassword: 'Strong@2026', confirmPassword: 'Strong@2026' })).rejects.toThrow('OTP expired.');
  expect(apiClient.post).toHaveBeenCalledWith('/api/Auth/reset-password', expect.objectContaining({ identifier: 'learner@example.com', otpType: 'email', otp: '482913', verificationToken: 'issued-token' }), { skipAuthRedirect: true });
});
it('uses reset authorization without replaying an OTP for two-screen recovery', async () => {
  apiClient.post.mockResolvedValue({ data: { success: true } });
  await authService.resetVerifiedPassword({ identifier: ' LEARNER@EXAMPLE.COM ', resetToken: 'test-reset-only-token', newPassword: 'Strong@2026', confirmPassword: 'Strong@2026', otp: '482913' });
  const [path, body, config] = apiClient.post.mock.calls[0];
  expect(path).toBe('/api/Auth/reset-password');
  expect(body).toEqual({ identifier: 'learner@example.com', resetToken: 'test-reset-only-token', newPassword: 'Strong@2026', confirmPassword: 'Strong@2026' });
  expect(config).toEqual({ skipAuth: true, skipAuthRedirect: true });
});
it('sends no reset request when authorization is missing', async () => {
  await expect(authService.resetVerifiedPassword({ identifier: 'learner@example.com', otp: '482913' })).rejects.toThrow('authorization is missing');
  expect(apiClient.post).not.toHaveBeenCalled();
});
