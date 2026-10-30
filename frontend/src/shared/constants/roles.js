/**
 * KINI EDUHUB — Role Constants
 *
 * Single source of truth for all role strings used across the app.
 * Prevents mismatches between route guards, sidebar config, and auth logic.
 */

// ── Canonical role values (used in localStorage, API, routing) ──
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ORG_ADMIN: 'org-admin',
  EMPLOYEE: 'employee',
  MENTOR: 'mentor',
  ADMIN: 'admin',
  STUDENT: 'student',
}

// ── All valid role values (for validation) ──────────────────────
export const ALL_ROLES = Object.values(ROLES)

// Enterprise HR module compatibility. HR remains an employee route-level role;
// these identifiers describe the user's HR specialization and access tier.
export const USER_ROLES = { ...ROLES, HR: 'hr' }
export const HR_ROLE_IDS = {
  EXECUTIVE: 'HR_EXECUTIVE',
  COORDINATOR: 'HR_COORDINATOR',
  MANAGER: 'HR_MANAGER',
}
export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ORG_ADMIN]: 'Organization Admin',
  [USER_ROLES.EMPLOYEE]: 'Employee',
  [USER_ROLES.HR]: 'HR',
  [USER_ROLES.MENTOR]: 'Mentor',
  [USER_ROLES.STUDENT]: 'Student',
}
export const HR_ROLE_LABELS = {
  [HR_ROLE_IDS.EXECUTIVE]: 'HR Executive',
  [HR_ROLE_IDS.COORDINATOR]: 'Recruiter',
  [HR_ROLE_IDS.MANAGER]: 'HR Admin',
}
export const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({ value, label }))
export const HR_ROLE_OPTIONS = Object.entries(HR_ROLE_LABELS).map(([value, label]) => ({ value, label }))

export const normalizeUserRole = (role) => {
  const value = String(role || '').replace(/[\s_-]/g, '').toLowerCase()
  if (value === 'hr' || value === 'humanresources') return USER_ROLES.HR
  return normalizeRole(role)
}

export const normalizeHrRole = (role) => {
  const value = String(role || '').replace(/[\s-]/g, '_').toUpperCase()
  if (['EXECUTIVE', 'HR_EXECUTIVE'].includes(value)) return HR_ROLE_IDS.EXECUTIVE
  if (['COORDINATOR', 'HR_COORDINATOR'].includes(value)) return HR_ROLE_IDS.COORDINATOR
  if (['MANAGER', 'HR_MANAGER'].includes(value)) return HR_ROLE_IDS.MANAGER
  return ''
}

export const normalizeRole = (role) => {
  const value = String(role || '').replace(/[\s_-]/g, '').toLowerCase()
  if (value === 'superadmin') return ROLES.SUPER_ADMIN
  if (value === 'admin') return ROLES.ADMIN
  if (value === 'organizationadmin' || value === 'orgadmin' || value === 'organization') return ROLES.ORG_ADMIN
  // Department/specialist roles use the Employee route group. Their narrower
  // access is enforced by department permissions rather than a second router.
  if (['employee', 'hr', 'hrmanager', 'hrexecutive', 'hrrecruiter', 'hrcoordinator', 'humanresources', 'operations', 'academiccoordinator',
    'coordinator', 'assessmentofficer', 'placementofficer', 'supportofficer',
    'supportteam'].includes(value)) return ROLES.EMPLOYEE
  if (value === 'mentor') return ROLES.MENTOR
  if (value === 'student') return ROLES.STUDENT
  return ''
}

// ── Role → Display label mapping ────────────────────────────────
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ORG_ADMIN]: 'Organization',
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.MENTOR]: 'Mentor',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.STUDENT]: 'Student',
}

// ── Role → Dashboard route mapping ──────────────────────────────
export const ROLE_DASHBOARD_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.ORG_ADMIN]: '/organization/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
  [ROLES.MENTOR]: '/mentor/dashboard',
  [ROLES.ADMIN]: '/super-admin/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
  // Legacy variants
  SuperAdmin: '/super-admin/dashboard',
  Admin: '/super-admin/dashboard',
  Organization: '/organization/dashboard',
  OrganizationAdmin: '/organization/dashboard',
  Employee: '/employee/dashboard',
  Mentor: '/mentor/dashboard',
  Student: '/student/dashboard',
}

// ── Role → Base path mapping ────────────────────────────────────
export const ROLE_BASE_PATHS = {
  [ROLES.SUPER_ADMIN]: '/super-admin',
  [ROLES.ORG_ADMIN]: '/organization',
  [ROLES.EMPLOYEE]: '/employee',
  [ROLES.MENTOR]: '/mentor',
  [ROLES.ADMIN]: '/super-admin',
  [ROLES.STUDENT]: '/student',
}

// ── Get role dashboard route (safe lookup) ──────────────────────
export const getRoleDashboard = (role) => {
  return ROLE_DASHBOARD_ROUTES[normalizeRole(role)] || '/dashboard'
}

// ── Get role base path (safe lookup) ────────────────────────────
export const getRoleBasePath = (role) => {
  return ROLE_BASE_PATHS[normalizeRole(role)] || '/'
}
