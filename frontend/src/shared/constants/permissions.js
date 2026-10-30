/**
 * KINI EDUHUB — Permission Map
 *
 * Maps each real app role (see roles.js) to the permission keys it holds.
 * Mirrors the access each role already has today (Sidebar menu items,
 * plus a few action-level keys like "course.create") so wiring this in
 * changes zero visible behavior — it only gives existing role checks a
 * single, extensible place to live instead of scattered `role === 'x'`.
 */
import { ROLES } from "./roles";

// RBAC UPGRADE — HR/Operations are Employee *specializations*, not new roles or a new
// auth system. A department-tagged employee gets the base Employee permissions PLUS
// a department-specific extension. Keyed as `${role}:${department}` so this stays additive:
// an Employee with no (or an unrecognized) department keeps getting PERMISSIONS[ROLES.EMPLOYEE]
// exactly as before. See usePermission.js for how the effective key is resolved.
export const DEPARTMENTS = {
  HR: "hr",
  OPERATIONS: "operations",
};

const EMPLOYEE_BASE = [
  "dashboard",
  "batches",
  "schedule",
  "ai-career-coach",
  "assignments",
  "assessments",
  "attendance",
  "performance",
  "resources",
  "messages",
  "announcements",
  "calendar",
  "certificates",
  "profile",
  "settings",
];

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ["*"],

  [ROLES.ORG_ADMIN]: [
    "dashboard",
    "employees",
    "employees.view",
    "employees.add",
    "employees.edit",
    "employees.delete",
    "employees.access",
    "students",
    "mentors",
    "courses",
    "batches",
    "live-classes",
    "webinars",
    "attendance",
    "assessments",
    "certificates",
    "departments",
    "branches",
    "performance",
    "reports",
    "approvals",
    "support",
    "daily-review",
    "audit-log",
    "ai-career-coach",
    "notifications",
    "settings",
    "settings.editOrganization",
    "settings.editInvoice",
    "settings.editEmail",
    "settings.editGeneral",
    "settings.editNotifications",
    "roles.view",
    "roles.create",
    "roles.edit",
    "roles.managePermissions",
    "syllabus.assign",
    "recycle-bin",
    "course.create",
  ],

  [ROLES.EMPLOYEE]: EMPLOYEE_BASE,

  // RBAC UPGRADE — HR department extension (visible: Dashboard, Employees, Departments,
  // Attendance, Leave, Payroll, Recruitment, Documents, Reports; hidden: Courses,
  // Live Classes, Billing, Organization Settings — none of which the base Employee role
  // has anyway, so nothing new needs hiding).
  [`${ROLES.EMPLOYEE}:${DEPARTMENTS.HR}`]: [
    "dashboard",
    "hr-dashboard",
    "hr-work-center",
    "employees",
    "employees.view",
    "employees.add",
    "employees.edit",
    "departments",
    "attendance.employee",
    "attendance",
    "leave",
    "payroll",
    "recruitment",
    "documents",
    "reports",
    "reports.limited",
  ],

  // RBAC UPGRADE — Operations department extension (visible: Dashboard, Admissions,
  // Enrollments, Student Support, Course Scheduling, Batches, Certificates, Reports;
  // hidden: Payroll, Billing, Employee Management, Organization Settings — same as above).
  [`${ROLES.EMPLOYEE}:${DEPARTMENTS.OPERATIONS}`]: [
    ...EMPLOYEE_BASE,
    "operations-dashboard",
    "admissions",
    "enrollments",
    "student-support",
    "scheduling",
    "certificates.issue",
    "reports.limited",
    "employees.view",
    "live-classes.view",
  ],

  [ROLES.MENTOR]: [
    "dashboard",
    "students",
    "courses",
    "batches",
    "classes",
    "syllabus",
    "live-classes",
    "attendance",
    "assessments",
    "assignments",
    "course-materials",
    "messages",
    "profile",
    "settings",
  ],

  [ROLES.STUDENT]: [
    "dashboard",
    "work-center",
    "courses",
    "my-classes",
    "learning-paths",
    "assessments",
    "certificates",
    "job-portal",
    "ai-career-coach",
    "mentor-chat",
    "notifications",
    "profile",
    "settings",
  ],
};

/**
 * resolvePermissions — single source of truth for turning (role, department) into a
 * permission list. Used by usePermission.js (real sessions) and DemoLogin.jsx (demo
 * sessions) so both resolve permissions identically instead of duplicating the lookup.
 */
export function resolvePermissions(role, department) {
  const normalizedDepartment = String(department || "")
    .trim()
    .toLowerCase();
  const departmentKey = normalizedDepartment
    ? `${role}:${normalizedDepartment}`
    : null;
  return (
    (departmentKey && PERMISSIONS[departmentKey]) || PERMISSIONS[role] || []
  );
}
