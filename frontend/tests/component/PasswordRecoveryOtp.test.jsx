import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const verifyOtp = vi.fn();
const forgotPassword = vi.fn();
const resetPassword = vi.fn();

vi.mock("../../src/shared/services/authApi", () => ({
  verifyOtp: (...args) => verifyOtp(...args),
  forgotPassword: (...args) => forgotPassword(...args),
  resetPassword: (...args) => resetPassword(...args),
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
  verifyOtp.mockResolvedValue({ success: true, message: "OTP verified successfully." });
  renderAt("/verify-otp", { identifier: EMAIL, otpType: "Email" });
  enterCode("482913");

  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/reset-password"), { timeout: 2500 });
  expect(sessionStorage.getItem("passwordResetVerifiedFor")).toBe(EMAIL);
});

it("sends a direct visit to /reset-password back to verification", async () => {
  sessionStorage.setItem("passwordResetEmail", EMAIL);
  sessionStorage.setItem("passwordResetOtp", "123456");
  // An older flag without backend confirmation for this email is not enough.
  sessionStorage.setItem("passwordResetVerified", "true");
  renderAt("/reset-password");

  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/verify-otp"));
  expect(resetPassword).not.toHaveBeenCalled();
});

it("returns to verification when reset-password rejects the code", async () => {
  sessionStorage.setItem("passwordResetEmail", EMAIL);
  sessionStorage.setItem("passwordResetOtp", "482913");
  sessionStorage.setItem("passwordResetVerified", "true");
  sessionStorage.setItem("passwordResetVerifiedFor", EMAIL);
  resetPassword.mockRejectedValue({ response: { status: 400, data: { success: false, message: "OTP expired." } } });
  renderAt("/reset-password");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Strong@2026" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Strong@2026" } });
  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/verify-otp"));
  expect(sessionStorage.getItem("passwordResetVerified")).toBeNull();
});
