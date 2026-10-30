const PENDING_APPROVAL_STATUSES = ['pending', 'pendingapproval', 'awaitingapproval', 'pendingenrollment', 'pendingenrollmentapproval'];

export const isPendingApprovalStudent = (student) =>
  PENDING_APPROVAL_STATUSES.includes(String(student?.approvalStatus ?? student?.enrollmentStatus ?? student?.status ?? '').toLowerCase().replace(/[\s_-]/g, ''));
