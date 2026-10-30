const STORAGE_KEY = "kini:enrollment:approval-requests";
const ENROLLMENT_DRAFT_KEY = "kini:enrollment:draft";
export const ENROLLMENT_APPROVAL_EVENT = "kini:enrollment-approvals-changed";

const readOrganizationId = () => {
  for (const key of ["organization_id", "organizationId", "orgId"]) {
    const value = localStorage.getItem(key);
    if (value && value !== "undefined" && value !== "null") return String(value);
  }
  for (const key of ["user", "organization"]) {
    try {
      const user = JSON.parse(localStorage.getItem(key) || "null");
      const id = user?.organizationId ?? user?.OrganizationId ?? user?.orgId ?? user?.OrgId
        ?? user?.organization?.id ?? user?.organization?.organizationId
        ?? user?.organisation?.id ?? user?.organisation?.organizationId;
      if (id != null && String(id).trim()) return String(id);
    } catch {
      // Ignore malformed session records.
    }
  }
  return null;
};

const readEnrollmentDraft = () => {
  try {
    const draft = JSON.parse(localStorage.getItem(ENROLLMENT_DRAFT_KEY) || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
};

const restorePreferredShift = (request) => {
  if (request.student?.preferredShift || request.preferredShift) return request;

  const draft = readEnrollmentDraft();
  const sameStudent = String(draft?.student?.email ?? "").trim().toLowerCase()
    === String(request.student?.email ?? "").trim().toLowerCase();
  const sameCourse = String(draft?.course?.id ?? "")
    === String(request.student?.courseId ?? request.course?.id ?? "");
  const preferredShift = String(draft?.student?.preferredShift ?? "").trim();

  if (!sameStudent || !sameCourse || !preferredShift) return request;
  return {
    ...request,
    student: { ...request.student, preferredShift },
    batch: request.batch ? { ...request.batch, shift: preferredShift } : request.batch,
  };
};

const read = ({ includeUnscoped = false } = {}) => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];

    // Remove the stale approval that was accidentally left in browser storage.
    // Filtering at the shared storage boundary keeps it out of every approval view.
    const cleaned = value.filter((request) => {
      const name = [request?.student?.firstName, request?.student?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
        .toLowerCase();
      return name !== "vinay vv";
    });
    if (cleaned.length !== value.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    if (includeUnscoped) return cleaned;
    const organizationId = readOrganizationId();
    if (!organizationId) return [];
    return cleaned.filter((request) => {
      const owner = request?.organizationId ?? request?.orgId;
      return owner != null && String(owner) === organizationId;
    });
  } catch {
    return [];
  }
};

const write = (requests) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent(ENROLLMENT_APPROVAL_EVENT));
  return requests;
};

export const isPendingEnrollmentApproval = (request) => request?.status === "Pending";

export const getEnrollmentApprovalRequests = ({ includeResolved = false } = {}) =>
  read()
    .map(restorePreferredShift)
    .filter((request) => includeResolved || isPendingEnrollmentApproval(request));

export const createEnrollmentApprovalRequest = ({ student, course, batch, payment, organizationId: requestedOrganizationId }) => {
  const resolvedOrganizationId = requestedOrganizationId
    ?? batch?.organizationId ?? batch?.OrganizationId ?? batch?.orgId ?? batch?.OrgId
    ?? batch?.organization?.id ?? batch?.organization?.organizationId
    ?? course?.organizationId ?? course?.OrganizationId ?? course?.orgId ?? course?.OrgId
    ?? course?.organization?.id ?? course?.organization?.organizationId
    ?? readOrganizationId();
  const organizationId = resolvedOrganizationId == null ? null : String(resolvedOrganizationId);
  const allRequests = read({ includeUnscoped: true });
  const requests = organizationId
    ? allRequests.filter((request) => String(request.organizationId ?? request.orgId ?? "") === organizationId)
    : [];
  const identity = `${String(student.email).trim().toLowerCase()}:${course.id}:${payment.transactionId}`;
  const existing = requests.find((request) => request.identity === identity);
  if (existing) {
    if (!existing.student?.preferredShift && student.preferredShift) {
      const updated = {
        ...existing,
        student: { ...existing.student, preferredShift: student.preferredShift },
        batch: existing.batch
          ? { ...existing.batch, shift: existing.batch.shift ?? batch?.shift ?? student.preferredShift }
          : existing.batch,
      };
      write(allRequests.map((request) => request.id === existing.id ? updated : request));
      return updated;
    }
    return existing;
  }

  const createdAt = new Date().toISOString();
  const request = {
    id: `enrollment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    identity,
    approvalType: "Student enrollment",
    type: "Enrollment approval",
    status: "Pending",
    priority: "High",
    createdAt,
    ...(organizationId ? { organizationId } : {}),
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: String(student.email).trim().toLowerCase(),
      phone: student.phone,
      courseId: course.id,
      batchId: batch?.id ?? student.batchId,
      preferredShift: student.preferredShift,
    },
    course: { id: course.id, title: course.title },
    batch: batch ? { id: batch.id, name: batch.name, shift: batch.shift ?? student.preferredShift } : null,
    payment: {
      status: payment.status,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      paidAt: payment.paidAt,
      // Set when one payment covered several courses: amount is this course's
      // share, orderAmount the whole payment.
      ...(payment.orderId != null ? { orderId: payment.orderId } : {}),
      ...(payment.orderCourseCount > 1 ? { orderAmount: payment.orderAmount, orderCourseCount: payment.orderCourseCount } : {}),
    },
  };
  write([request, ...allRequests]);
  return request;
};

export const updateEnrollmentApprovalRequest = (id, changes) => {
  let updated;
  const requests = read({ includeUnscoped: true }).map((request) => {
    if (String(request.id) !== String(id)) return request;
    updated = { ...request, ...changes, updatedAt: new Date().toISOString() };
    return updated;
  });
  write(requests);
  return updated;
};

export const toDashboardApproval = (request = {}) => {
  const studentName = [request.student?.firstName, request.student?.lastName]
    .filter(Boolean)
    .join(" ") || "Student";
  const courseName = String(
    request.course?.title ?? request.course?.name ?? request.courseName
      ?? `Course #${request.student?.courseId ?? "—"}`,
  );
  const batchName = String(
    request.batch?.name ?? request.batchName
      ?? `Batch #${request.student?.batchId ?? "—"}`,
  );

  return {
    ...request,
    name: studentName,
    studentName,
    course: courseName,
    courseName,
    courseId: request.student?.courseId ?? request.course?.id ?? request.courseId,
    batchId: request.student?.batchId ?? request.batch?.id ?? request.batchId,
    batchName,
    preferredShift: String(
      request.student?.preferredShift
        ?? request.preferredShift
        ?? shiftFromBatchName(batchName),
    ),
    time: String(request.time ?? request.createdAt ?? "Recently"),
    sla: "New",
    docs: [
      ["Student information", true],
      ["Payment successful", request.payment?.status === "Successful"],
      ["Course and batch assigned", Boolean(request.student?.courseId && request.student?.batchId)],
    ],
    path: `/organization/approvals?student=${encodeURIComponent(request.id ?? "")}`,
  };
};

// Single definition of "pending enrollment approvals" shared by the dashboard
// widget and the Students → Pending approval tab so both always agree.
export const getPendingEnrollmentApprovals = () =>
  getEnrollmentApprovalRequests().map(toDashboardApproval);

function shiftFromBatchName(batchName = "") {
  const value = String(batchName).toLowerCase();
  if (value.includes("evening")) return "Evening";
  if (value.includes("afternoon")) return "Afternoon";
  if (value.includes("morning")) return "Morning";
  return "Not specified";
}
