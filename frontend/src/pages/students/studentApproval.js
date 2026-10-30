import { paymentStatusLabel } from "@shared/services/studentPaymentData";
// Helpers for the live "approve student" call:
// PUT /api/v1/organization/students/{studentId}/approve (no body).
// Swagger declares no response schema, so every field is read defensively and
// anything the backend does not report is shown as "not reported".

import { isPendingApprovalStudent } from "@shared/utils/studentApprovalStatus";

const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

const pickFrom = (sources, keys) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return undefined;
};

const yesNo = (value, yes, no) => (typeof value === "boolean" ? (value ? yes : no) : String(value));

/** What the backend said about one approval, in display form. */
export function describeApprovalResult(raw, requestedStudentId) {
  const body = raw && typeof raw === "object" ? raw : {};
  const data = body.data && typeof body.data === "object" ? body.data : null;
  const sources = [data, data?.student, body];
  const emailStatus = pickFrom(sources, ["emailStatus", "emailSent", "isEmailSent", "credentialsSent", "credentialsEmailSent", "activationEmailSent", "notificationSent", "mailSent"]);
  const accountStatus = pickFrom(sources, ["accountStatus", "accountCreated", "isAccountCreated", "userCreated", "loginCreated"]);
  return {
    message: pickFrom(sources, ["message", "Message"]) ?? (typeof raw === "string" && raw.trim() ? raw.trim() : null),
    approvalStatus: pickFrom(sources, ["approvalStatus", "status", "Status", "enrollmentStatus"]) ?? null,
    studentId: pickFrom(sources, ["studentId", "StudentId", "id"]) ?? requestedStudentId,
    email: pickFrom(sources, ["email", "Email", "studentEmail"]) ?? null,
    accountStatus: accountStatus === undefined ? null : yesNo(accountStatus, "Created", "Not created"),
    emailStatus: emailStatus === undefined ? null : yesNo(emailStatus, "Sent", "Not sent"),
    emailFailed: emailStatus === false || /fail|error|not sent/i.test(String(emailStatus ?? "")),
  };
}

/** Plain-language reason an approval call failed, by HTTP status. */
export function describeApprovalError(error, studentId) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const backendMessage = typeof data === "string" ? data : data?.message ?? data?.Message ?? data?.title;
  if (!error?.response) {
    return { status: null, alreadyApproved: false, message: "Can't reach the backend. Check the server connection and try again." };
  }
  const byStatus = {
    400: `The backend rejected the request${backendMessage ? `: ${backendMessage}` : "."}`,
    401: "Your session has expired. Sign in to the Organization Portal again.",
    403: "Your account isn't allowed to approve students in this organization.",
    404: `Student #${studentId} wasn't found in the backend. Refresh the list; it may have been removed.`,
    409: `Student #${studentId} is already approved.`,
  };
  return {
    status,
    alreadyApproved: status === 409,
    message: byStatus[status]
      ?? (status >= 500 ? `The backend failed (${status})${backendMessage ? `: ${backendMessage}` : ""}. Nothing was confirmed; try again.` : backendMessage || `Approval failed (${status}).`),
  };
}

/**
 * Links Demo Payment Mode requests to live backend students. A request that
 * stored the backend student id created for it (liveStudentId) links by that
 * id; otherwise only an exact email match with exactly one live student counts.
 */
export function linkDemoRequests(demoRequests, liveStudents) {
  const byEmail = new Map();
  const byId = new Map();
  liveStudents.forEach((student) => {
    byId.set(String(student.id), student);
    const email = normalizeEmail(student.email);
    if (!email) return;
    byEmail.set(email, [...(byEmail.get(email) ?? []), student]);
  });
  return demoRequests.map((request) => {
    const stored = request.liveStudentId != null ? byId.get(String(request.liveStudentId)) : null;
    if (stored) return { request, liveStudent: stored, livePending: isPendingApprovalStudent(stored), ambiguous: false };
    const matches = byEmail.get(normalizeEmail(request.student?.email)) ?? [];
    if (matches.length === 1) {
      const [student] = matches;
      return { request, liveStudent: student, livePending: isPendingApprovalStudent(student), ambiguous: false };
    }
    return { request, liveStudent: null, livePending: false, ambiguous: matches.length > 1 };
  });
}

const formatSubmitted = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "recently"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Checkout enrollment requests (see enrollmentApprovalStore) reshaped into the
// student-card fields used below. They are reviewed on the Approvals page, so
// they carry `kind: "enrollment"` instead of a backend student id.
const toEnrollmentItem = (approval) => ({
  ...approval,
  id: approval.id,
  kind: "enrollment",
  name: approval.name,
  course: approval.course,
  time: approval.time ?? formatSubmitted(approval.createdAt),
  payment: paymentStatusLabel(approval.payment ?? {}),
  email: approval.student?.email ?? approval.email,
  mobile: approval.student?.phone,
  docs: Array.isArray(approval.docs) ? Object.fromEntries(approval.docs) : approval.docs ?? {},
  raw: approval,
});


/** The same review groups power the queue, its badges, and dashboard. */
export function buildApprovalQueue(students = [], enrollmentApprovals = []) {
  // Demo Payment Mode requests carry no backend student id. One whose email
  // matches exactly one pending backend student folds into that student's
  // card, so a single live approval covers every course they paid for.
  const demoLinks = linkDemoRequests(enrollmentApprovals.filter((approval) => approval.kind === "demo-enrollment"), students);
  const foldedDemo = new Map();
  demoLinks.filter((link) => link.livePending).forEach(({ liveStudent, request }) => {
    const key = String(liveStudent.id);
    foldedDemo.set(key, [...(foldedDemo.get(key) ?? []), request]);
  });
  const ungroupedItems = [
    ...students.filter(isPendingApprovalStudent).map((student) => ({ ...student, demoRequests: foldedDemo.get(String(student.id)) ?? [] })),
    ...demoLinks.filter((link) => !link.livePending).map((link) => ({ ...link.request, linkedStudent: link.liveStudent, ambiguousLink: link.ambiguous })),
    ...enrollmentApprovals.filter((approval) => approval.kind !== "demo-enrollment").map(toEnrollmentItem),
  ];

  const grouped = new Map();
  ungroupedItems.forEach(person => {
    const email = String(person.email ?? person.student?.email ?? '').trim().toLowerCase();
    const key = email && person.kind ? person.kind + ':' + email : 'id:' + person.id;
    const existing = grouped.get(key);
    if (!existing) grouped.set(key, { ...person, requests: [person] });
    else { existing.requests.push(person); existing.course = [...new Set(existing.requests.map(item => item.course ?? item.courseName).filter(Boolean))].join(', '); }
  });
  const items = [...grouped.values()];

  return { items, demoLinks };
}
