import { getApiErrorMessage } from "@shared/services/apiServices";

// Why one course enrollment failed, by HTTP status. A 409 is a duplicate or
// conflicting enrollment, never a success.
export const enrollmentErrorText = (error) => {
  const status = error?.response?.status;
  const backend = getApiErrorMessage(error, "");
  if (!error?.response) return "Can't reach the backend.";
  const byStatus = {
    400: "Invalid enrollment data",
    401: "Your session has expired. Sign in again",
    403: "This course or batch isn't available to your organization",
    404: "Student, course or batch not found",
    409: "Duplicate or conflicting enrollment",
    422: "The backend rejected these values",
  };
  const base = byStatus[status] ?? (status >= 500 ? "Backend error" : `Enrollment failed (${status})`);
  return backend && backend !== base ? `${base}: ${backend}` : `${base}.`;
};
