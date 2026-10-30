import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";

const payload = (response) => response?.data?.data ?? response?.data ?? response;

export const enrollmentNotificationService = {
  sendPaymentConfirmation: async ({ student, course, batch, payment, requestId }) =>
    payload(await apiClient.post(API_ENDPOINTS.enrollment.paymentConfirmationEmail, {
      requestId,
      email: String(student?.email ?? "").trim().toLowerCase(),
      studentName: student?.fullName ?? student?.name
        ?? [student?.firstName, student?.lastName].filter(Boolean).join(" "),
      courseName: course?.title ?? course?.name ?? course?.courseName,
      batchName: batch?.name ?? batch?.batchName,
      preferredShift: student?.preferredShift,
      amount: Number(payment?.amount ?? 0),
      transactionId: payment?.transactionId,
      paidAt: payment?.paidAt,
      message: "Payment received successfully. Your enrollment is under review and will usually be processed within a few hours. Login credentials will be emailed after approval.",
    })),
  sendOrganizationApprovalNotification: async ({ student, course, batch, payment, requestId, organizationId, organizationEmail }) =>
    payload(await apiClient.post(API_ENDPOINTS.enrollment.paymentConfirmationEmail, {
      requestId,
      email: String(organizationEmail ?? batch?.organizationEmail ?? batch?.organization?.email ?? course?.organizationEmail ?? course?.organization?.email ?? "").trim().toLowerCase() || undefined,
      organizationId: organizationId ?? batch?.organizationId ?? batch?.organization?.id ?? course?.organizationId ?? course?.organization?.id,
      organizationName: batch?.organizationName ?? batch?.organization?.name ?? course?.organizationName ?? course?.organization?.name,
      recipientType: "organization",
      notificationType: "enrollment-approval",
      studentEmail: String(student?.email ?? "").trim().toLowerCase(),
      studentName: student?.fullName ?? student?.name
        ?? [student?.firstName, student?.lastName].filter(Boolean).join(" "),
      phone: student?.phone,
      courseName: course?.title ?? course?.name ?? course?.courseName,
      courseId: course?.id ?? course?.courseId,
      batchName: batch?.name ?? batch?.batchName,
      batchId: batch?.id ?? batch?.batchId,
      amount: Number(payment?.amount ?? 0),
      transactionId: payment?.transactionId,
      paidAt: payment?.paidAt,
      message: "A student payment was received. Please review and approve this enrollment.",
    })),
};

export default enrollmentNotificationService;
