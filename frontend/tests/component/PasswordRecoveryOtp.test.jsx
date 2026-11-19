import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { toast } from "sonner";

const verifyOtp = vi.fn();
const forgotPassword = vi.fn();
const resetPassword = vi.fn();

vi.mock("../../src/shared/services/authApi", () => ({
  verifyOtp: (...args) => verifyOtp(...args),
  forgotPassword: (...args) => forgotPassword(...args),
  resetVerifiedPassword: (...args) => resetPassword(...args),
}));
vi.mock("../../src/features/auth/components/RecoveryShell", () => ({
  default: ({ title, children }) => <div><h1>{title}</h1>{children}</div>,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { default: OtpVerification } = await import("../../src/features/auth/pages/login/OtpVerification");
const { default: ResetPassword } = await import("../../src/features/auth/pages/login/ResetPassword");

const EMAIL = "learner@example.com";

function Where() {
  const location = useLocation();
  return <p data-testid="path">{location.pathname}</p>;
}

const renderAt = (path, state) => render(
  <MemoryRouter initialEntries={[{ pathname: path, state }]}>
    <Routes>
      <Route path="/verify-otp" element={<><OtpVerification /><Where /></>} />
      <Route path="/reset-password" element={<><ResetPassword /><Where /></>} />
      <Route path="/forgot-password" element={<Where />} />
      <Route path="/Auth/login" element={<Where />} />
      <Route path="/organization/login" element={<Where />} />
    </Routes>
  </MemoryRouter>,
);

const enterCode = (code) => {
  fireEvent.change(screen.getByLabelText("Verification code digit 1"), { target: { value: code } });
  fireEvent.click(screen.getByRole("button", { name: /verify code/i }));
};

beforeEach(() => {
  sessionStorage.clear();
  verifyOtp.mockReset();
  forgotPassword.mockReset();
  resetPassword.mockReset();
});
afterEach(cleanup);

it('does not proceed when verification consumes the OTP without returning reset authorization', async () => {
  verifyOtp.mockResolvedValue({ success: true, message: 'OTP verified successfully.' });
  renderAt('/verify-otp', { identifier: EMAIL });
  enterCode('482913');
  expect(await screen.findByRole('alert')).toHaveTextContent('did not issue password reset authorization');
  expect(screen.getByTestId('path')).toHaveTextContent('/verify-otp');
  expect(sessionStorage.getItem('passwordResetOtp')).toBeNull();
  expect(sessionStorage.getItem('passwordResetToken')).toBeNull();
  expect(resetPassword).not.toHaveBeenCalled();
});
it('sends one verification request for repeated submits and stores only reset authorization', async () => {
  let finish;
  verifyOtp.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  renderAt('/verify-otp', { identifier: EMAIL });
  enterCode('482913');
  const form = screen.getByLabelText('Verification code digit 1').closest('form');
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(verifyOtp).toHaveBeenCalledTimes(1);
  finish({ success: true, resetToken: 'test-reset-only-token' });
  await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/reset-password'), { timeout: 2500 });
  expect(sessionStorage.getItem('passwordResetOtp')).toBeNull();
  expect(sessionStorage.getItem('passwordResetToken')).toBe('test-reset-only-token');
});

function authorize() {
  sessionStorage.setItem("passwordResetToken", "test-reset-only-token");
  sessionStorage.setItem("passwordResetEmail", EMAIL);
  sessionStorage.setItem("passwordResetOtp", "482913");
  sessionStorage.setItem("passwordResetVerified", "true");
  sessionStorage.setItem("passwordResetVerifiedFor", EMAIL);
}
function submitPassword() {
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Strong@2026" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Strong@2026" } });
  fireEvent.click(screen.getByRole("button", { name: /update password/i }));
}
it('rejects expired local reset authorization before sending a password update', async () => {
  authorize();
  sessionStorage.setItem('passwordResetTokenExpiresAt', '2000-01-01T00:00:00Z');
  renderAt('/reset-password');
  expect(await screen.findByRole('button', { name: 'Restart password reset' })).toBeInTheDocument();
  expect(resetPassword).not.toHaveBeenCalled();
});
it.each(["/Auth/login", "/organization/login"])("opens %s after successful reset without bouncing to OTP", async (returnTo) => {
  authorize();
  resetPassword.mockResolvedValue({ success: true });
  renderAt("/reset-password", { returnTo });
  submitPassword();
  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(returnTo));
  expect(sessionStorage.getItem("passwordResetVerified")).toBeNull();
  expect(toast.success).toHaveBeenCalledWith("Password updated successfully. Please sign in.");
});
it.each([new Error("Network Error"), { response: { status: 400, data: { message: "Password is not permitted." } } }])("keeps recoverable failures on the reset form", async (failure) => {
  authorize();
  resetPassword.mockRejectedValue(failure);
  renderAt("/reset-password");
  submitPassword();
  await screen.findByRole("alert");
  expect(screen.getByTestId("path")).toHaveTextContent("/reset-password");
  expect(screen.getByRole("button", { name: /update password/i })).toBeEnabled();
  expect(sessionStorage.getItem("passwordResetVerified")).toBe("true");
});
it("locks duplicate submits and keeps visibility toggles from submitting", async () => {
  authorize();
  let finish;
  resetPassword.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  renderAt("/reset-password");
  for (const button of screen.getAllByRole("button", { name: /^show /i })) {
    expect(button).toHaveAttribute("type", "button");
    fireEvent.click(button);
  }
  expect(resetPassword).not.toHaveBeenCalled();
  submitPassword();
  const form = screen.getByLabelText("New password").closest("form");
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(resetPassword).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: /updating password/i })).toBeDisabled();
  finish({ success: true });
  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/Auth/login"));
});

it("rejects a six-digit code the backend does not confirm and stays on verification", async () => {
  verifyOtp.mockRejectedValue({ response: { status: 400, data: { success: false, message: "Invalid OTP." } } });
  renderAt("/verify-otp", { identifier: EMAIL, otpType: "Email" });
  enterCode("123456");

  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid OTP.");
  expect(verifyOtp).toHaveBeenCalledWith({ identifier: EMAIL, otpType: "email", otp: "123456" });
  expect(screen.getByTestId("path")).toHaveTextContent("/verify-otp");
  expect(sessionStorage.getItem("passwordResetVerified")).toBeNull();
  expect(sessionStorage.getItem("passwordResetOtp")).toBeNull();
});

it("continues to reset only after the backend confirms the code", async () => {
  verifyOtp.mockResolvedValue({ success: true, message: "OTP verified successfully.", resetToken: "test-reset-only-token" });
  renderAt("/verify-otp", { identifier: EMAIL, otpType: "Email" });
  enterCode("482913");

  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/reset-password"), { timeout: 2500 });
  expect(sessionStorage.getItem("passwordResetVerifiedFor")).toBe(EMAIL);
});

it("shows a restart action for a direct visit without matching verification", async () => {
  sessionStorage.setItem("passwordResetEmail", EMAIL);
  sessionStorage.setItem("passwordResetOtp", "123456");
  // An older flag without backend confirmation for this email is not enough.
  sessionStorage.setItem("passwordResetVerified", "true");
  renderAt("/reset-password");

  await screen.findByRole("button", { name: "Restart password reset" });
  expect(screen.getByTestId("path")).toHaveTextContent("/reset-password");
  expect(resetPassword).not.toHaveBeenCalled();
});

it("stays on reset with a restart action when the backend rejects reset authorization", async () => {
  sessionStorage.setItem("passwordResetToken", "test-reset-only-token");
  sessionStorage.setItem("passwordResetEmail", EMAIL);
  sessionStorage.setItem("passwordResetOtp", "482913");
  sessionStorage.setItem("passwordResetVerified", "true");
  sessionStorage.setItem("passwordResetVerifiedFor", EMAIL);
  resetPassword.mockRejectedValue({ response: { status: 400, data: { success: false, message: "OTP expired." } } });
  renderAt("/reset-password");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Strong@2026" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Strong@2026" } });
  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  await screen.findByRole("button", { name: "Restart password reset" });
  expect(screen.getByTestId("path")).toHaveTextContent("/reset-password");
  expect(sessionStorage.getItem("passwordResetVerified")).toBeNull();
});
