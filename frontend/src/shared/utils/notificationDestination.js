import { ROUTES } from '@shared/constants/routeConstants';

export function notificationDestination(item, role) {
  const prefix = role === 'org-admin' ? '/organization' : role === 'student' ? '/student' : role === 'mentor' ? '/mentor' : '/employee';
  // Only follow application paths belonging to this portal. Route guards still
  // enforce access; notification metadata never grants permissions.
  for (const value of [item.actionUrl, item.targetUrl, item.link, item.url, item.path]) {
    if (typeof value !== 'string' || /[\\\s]/.test(value)) continue;
    if (value.startsWith(prefix + '/') || (role === 'org-admin' && /^\/employee\/hr-settings(?:[?#]|$)/.test(value))) return value;
  }
  if (role !== 'org-admin') return prefix + '/notifications';
  const kind = [item.notificationType, item.type, item.relatedModule, item.module, item.category, item.title, item.subject]
    .filter(Boolean).join(' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').toLowerCase();
  const employeeId = item.employeeId ?? item.employee?.employeeId
    ?? String(item.description ?? item.message ?? item.desc ?? '').match(/employee\s+id\s*[:#]?\s*(\d+)/i)?.[1];
  const encode = value => encodeURIComponent(String(value));
  if (/\bemployee\b/.test(kind) && /\bpermissions?\b/.test(kind)) {
    return employeeId != null ? ROUTES.ORG_ADMIN.EMPLOYEES + '?access=' + encode(employeeId) : ROUTES.ORG_ADMIN.EMPLOYEES;
  }
  if (/\bhr\b/.test(kind) && /\b(user|users|created|permissions?)\b/.test(kind)) return ROUTES.EMPLOYEE.HR_SETTINGS + '?tab=users';
  if (/\b(employee|employees)\b/.test(kind)) return employeeId != null ? ROUTES.ORG_ADMIN.EMPLOYEE_DETAILS.replace(':employeeId', encode(employeeId)) : ROUTES.ORG_ADMIN.EMPLOYEES;
  if (/\b(student|students|enrollment|registration)\b/.test(kind)) {
    if (/\b(approval|pending)\b/.test(kind)) return ROUTES.ORG_ADMIN.STUDENTS + '?tab=approvals';
    return item.studentId != null ? ROUTES.ORG_ADMIN.STUDENT_DETAILS.replace(':studentId', encode(item.studentId)) : ROUTES.ORG_ADMIN.STUDENTS;
  }
  if (/\b(class|classes)\b/.test(kind)) return ROUTES.ORG_ADMIN.LIVE_CLASSES;
  if (/\b(batch|batches)\b/.test(kind)) return item.batchId != null ? ROUTES.ORG_ADMIN.BATCH_DETAILS.replace(':batchId', encode(item.batchId)) : ROUTES.ORG_ADMIN.BATCHES;
  if (/\b(course|courses)\b/.test(kind)) return item.courseId != null ? ROUTES.ORG_ADMIN.COURSE_DETAILS.replace(':courseId', encode(item.courseId)) : ROUTES.ORG_ADMIN.COURSES;
  if (/\b(mentor|mentors|tutor|tutors)\b/.test(kind)) return ROUTES.ORG_ADMIN.TUTORS;
  if (/\battendance\b/.test(kind)) return ROUTES.ORG_ADMIN.ATTENDANCE;
  if (/\bpayroll\b/.test(kind)) return ROUTES.ORG_ADMIN.PAYROLL;
  if (/\b(invoice|invoices)\b/.test(kind)) return ROUTES.ORG_ADMIN.INVOICES;
  return prefix + '/notifications';
}
