import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/shared/services/apiClient";
import {
  TOKEN_HEADER,
  enrollmentAccess,
  enrollmentReviewApi,
  publicEnrollmentApi,
  toEnrollmentError,
} from "../../src/shared/services/publicEnrollmentApi";

vi.mock("../../src/shared/services/apiClient", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("public enrollment API", () => {
  it("creates enrollments anonymously and never sends an amount or organization", async () => {
    apiClient.post.mockResolvedValue({ data: { enrollmentId: 5, accessToken: "tok" } });
    const payload = { courseId: 10, batchId: 100, firstName: "Asha", lastName: "Rao", email: "a@x.com", phone: "9876543210", highestQualification: "B.Tech" };

    await publicEnrollmentApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/public/enrollments", payload, { skipAuth: true });
    const body = apiClient.post.mock.calls[0][1];
    expect(body).not.toHaveProperty("amount");
    expect(body).not.toHaveProperty("organizationId");
  });

  it("sends the enrollment token as a header, not a JWT", async () => {
    apiClient.get.mockResolvedValue({ data: { stage: "PaymentSubmitted" } });
    await publicEnrollmentApi.getStatus(7, "secret-token");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/public/enrollments/7/status", {
      skipAuth: true,
      headers: { [TOKEN_HEADER]: "secret-token" },
    });
  });

  it("uploads payment proof as multipart with UTR, date and screenshot", async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    const file = new File(["png"], "proof.png", { type: "image/png" });
    await publicEnrollmentApi.submitPayment(7, "tok", { utrNumber: "412345678901", paymentDate: "2026-11-17", screenshot: file });

    const [url, form, config] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/public/enrollments/7/payments");
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("utrNumber")).toBe("412345678901");
    expect(form.get("paymentDate")).toBe("2026-11-17");
    expect(form.get("screenshot")).toBe(file);
    expect(form.has("amountPaid")).toBe(false);
    expect(config.headers[TOKEN_HEADER]).toBe("tok");
    expect(config.skipAuth).toBe(true);
  });

  it("sends the password setup token in the body", async () => {
    apiClient.post.mockResolvedValue({ data: { success: true } });
    await publicEnrollmentApi.completePasswordSetup("setup-tok", "Strong@123", "Strong@123");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/public/password-setup/complete",
      { token: "setup-tok", password: "Strong@123", confirmPassword: "Strong@123" },
      { skipAuth: true },
    );
  });

  it("organization verify always confirms the bank check", async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    await enrollmentReviewApi.verifyPayment(3, "matched");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/organization/payments/3/verify", {
      confirmBankTransactionChecked: true,
      note: "matched",
    });
  });
});

describe("standard response envelope", () => {
  it("unwraps { success, message, data } responses", async () => {
    apiClient.get.mockResolvedValue({ data: { success: true, message: "ok", data: { stage: "PaymentSubmitted", nextAction: "WaitForVerification" } } });
    const status = await publicEnrollmentApi.getStatus(7, "tok");
    expect(status).toEqual({ stage: "PaymentSubmitted", nextAction: "WaitForVerification" });
  });

  it("maps paged envelopes to data + totalRecords", async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, message: "ok", data: [{ paymentId: 1 }], pagination: { page: 2, limit: 10, totalRecords: 11, totalPages: 2 } },
    });
    const page = await enrollmentReviewApi.getPayments({ status: "PendingVerification" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/organization/payments", { params: { status: "PendingVerification" } });
    expect(page).toEqual({ data: [{ paymentId: 1 }], totalRecords: 11, page: 2, limit: 10, totalPages: 2 });
  });

  it("keeps the envelope message for actions the UI reports", async () => {
    apiClient.post.mockResolvedValue({ data: { success: true, message: "Student enrollment approved successfully", data: { enrollmentId: 4, setupEmailSent: true } } });
    const result = await enrollmentReviewApi.approve(4, 100, "ok");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/organization/enrollments/4/approve", { batchId: 100, remarks: "ok" });
    expect(result).toMatchObject({ enrollmentId: 4, setupEmailSent: true, message: "Student enrollment approved successfully" });
  });
});

describe("enrollment access tokens", () => {
  it("captures the #token fragment once and removes it from the URL", () => {
    window.history.replaceState(null, "", "/enrollment/9/status#token=abc_DEF-123");
    expect(enrollmentAccess.captureFromLocation(9)).toBe("abc_DEF-123");
    expect(window.location.hash).toBe("");
    expect(enrollmentAccess.get(9).token).toBe("abc_DEF-123");
    expect(enrollmentAccess.captureFromLocation(9)).toBeNull();
  });

  it("keeps separate tokens per enrollment", () => {
    enrollmentAccess.save(1, { token: "t1", courseName: "React" });
    enrollmentAccess.save(2, { token: "t2", courseName: "Python" });
    expect(enrollmentAccess.list().map((e) => e.enrollmentId).sort()).toEqual(["1", "2"]);
    enrollmentAccess.remove(1);
    expect(enrollmentAccess.get(1)).toBeNull();
    expect(enrollmentAccess.get(2).token).toBe("t2");
  });
});

describe("toEnrollmentError", () => {
  it("maps backend codes and field errors", () => {
    const error = toEnrollmentError({
      response: { status: 409, data: { code: "DUPLICATE_UTR", message: "This UTR number has already been submitted." } },
    });
    expect(error).toMatchObject({ status: 409, code: "DUPLICATE_UTR", network: false });

    const validation = toEnrollmentError({
      response: { status: 400, data: { errors: { FirstName: ["First name is required."], utrNumber: ["Bad UTR"] } } },
    });
    expect(validation.fieldErrors).toEqual({ firstName: "First name is required.", utrNumber: "Bad UTR" });
    expect(validation.code).toBe("VALIDATION_ERROR");
  });

  it("reads the standard error envelope (errorCode + errors array)", () => {
    const error = toEnrollmentError({
      response: {
        status: 400,
        data: {
          success: false,
          message: "Invalid request data",
          errorCode: "VALIDATION_ERROR",
          errors: [{ field: "utrNumber", message: "UTR number is required" }, { field: "studentDetails.fullName", message: "Name required" }],
        },
      },
    });
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.fieldErrors).toEqual({ utrNumber: "UTR number is required", fullName: "Name required" });
    expect(error.message).toBe("UTR number is required");

    const conflict = toEnrollmentError({ response: { status: 409, data: { success: false, message: "Payment must be verified", errorCode: "PAYMENT_NOT_VERIFIED" } } });
    expect(conflict).toMatchObject({ code: "PAYMENT_NOT_VERIFIED", message: "Payment must be verified" });
  });

  it("flags expired tokens and network failures", () => {
    expect(toEnrollmentError({ response: { status: 401, data: { code: "ENROLLMENT_TOKEN_EXPIRED", message: "expired" } } }).code)
      .toBe("ENROLLMENT_TOKEN_EXPIRED");
    const network = toEnrollmentError({ code: "ERR_NETWORK" });
    expect(network.network).toBe(true);
    expect(network.status).toBe(0);
  });
});
