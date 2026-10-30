// ================================================================
// KINI HRMS — ENTERPRISE HR PERMISSION MATRIX (custom RBAC)
// ================================================================
// Additive front-end layer on top of the existing HR RBAC (hrPermissions.js).
// The Organization Admin assigns a fully custom permission profile to every
// HR user through the Permission Matrix UI. Each module is an expandable card
// with a "Select All" toggle; "Full HR Access" enables every module at once.
//
// IMPORTANT — this layer does NOT touch the backend, auth service, route
// guards or the existing level-based HR RBAC. When a logged-in HR user has a
// matching profile in the HR Users store (hrUserStore.js), their custom
// matrix overrides the level-based defaults. Everyone else resolves exactly
// as before (see useHrPermissions.js).
//
// COVERAGE — the matrix covers ALL 19 HRMS modules. The nine modules from the
// spec keep their exact action sets; the ten remaining HRMS pages (onboarding,
// shifts, holidays, payslips, performance, appraisal, assets, documents, exit,
// tickets) get sensible action sets so every page can be permission-gated.
// Each module also includes any extra action key its page already calls today
// (e.g. attendance "add" for correction requests, payroll "manage" for Run
// Payroll) so Full HR Access reveals every button on every page — a matrix
// that could not express a page's real actions would hide features even for
// full-access users.
//
// Action keys are the SAME canonical keys the HR pages already call today
// (view / add / edit / delete / export / approve / import / print / assign /
// manage / schedule / generate / reject) so existing `can(module, action)`
// call sites keep working without modification. "Create" is the display label
// for the `add` key.
// ================================================================

import {
  LayoutDashboard, Users, GraduationCap, Briefcase, CalendarCheck,
  ClipboardCheck, CreditCard, FileText, Settings, BookOpen,
  UserPlus, Clock4, PartyPopper, Banknote, Target, TrendingUp,
  Package, FolderOpen, DoorOpen, Ticket, ShieldCheck, Layers,
} from 'lucide-react'

// ── Module registry — one entry per matrix card, ordered as displayed ──────
// The nine spec modules come first (in the spec's order); the remaining HRMS
// pages follow, grouped by their HR meta group.
export const HR_PERMISSION_MODULES = [
  {
    id: 'batches', label: 'Batches', icon: Layers, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
    ],
  },
  {
    id: 'employees', label: 'Employees', icon: Users, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'export', label: 'Export' },
      // ENTERPRISE RBAC — page-supported actions that were missing from the
      // matrix: the roster quick actions call Import, the profile drawer calls
      // Print and Assign. Without these, Full HR Access could not reveal them.
      { key: 'import', label: 'Import' },
      { key: 'print', label: 'Print' },
      { key: 'assign', label: 'Assign' },
    ],
  },
  {
    id: 'mentors', label: 'Mentors', icon: GraduationCap, color: '#8b5cf6',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'recruitment', label: 'Recruitment', icon: Briefcase, color: '#8b5cf6',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'schedule', label: 'Schedule Interview' },
    ],
  },
  {
    id: 'attendance', label: 'Attendance', icon: CalendarCheck, color: '#F59E0B',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'approve', label: 'Approve' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'leave', label: 'Leave', icon: ClipboardCheck, color: '#06b6a8',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'approve', label: 'Approve' },
      { key: 'reject', label: 'Reject' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'payroll', label: 'Payroll', icon: CreditCard, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'generate', label: 'Generate' },
      { key: 'edit', label: 'Edit' },
      { key: 'approve', label: 'Approve' },
      { key: 'export', label: 'Export' },
      { key: 'manage', label: 'Manage' },
    ],
  },
  {
    id: 'reports', label: 'Reports', icon: FileText, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'export', label: 'Export' },
      { key: 'manage', label: 'Schedule' },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: Settings, color: '#64748b',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
    ],
  },
  {
    id: 'permissions', label: 'HR Permissions', icon: ShieldCheck, color: '#8b5cf6',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
    ],
  },
  {
    id: 'syllabus', label: 'Syllabus Assignments', icon: BookOpen, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'assign', label: 'Assign' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'onboarding', label: 'Onboarding', icon: UserPlus, color: '#10b981',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'shifts', label: 'Shifts', icon: Clock4, color: '#6366f1',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'assign', label: 'Assign' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'holidays', label: 'Holidays', icon: PartyPopper, color: '#EC4899',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      // ENTERPRISE RBAC — the Holiday page calls can('holidays', 'delete'); the
      // matrix must be able to express it so Full HR Access reveals the button.
      { key: 'delete', label: 'Delete' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'payslips', label: 'Payslips', icon: Banknote, color: '#10b981',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'generate', label: 'Generate' },
      { key: 'export', label: 'Export' },
      { key: 'manage', label: 'Manage' },
    ],
  },
  {
    id: 'performance', label: 'Performance', icon: Target, color: '#F59E0B',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'appraisal', label: 'Appraisal', icon: TrendingUp, color: '#0f55f7',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'assets', label: 'Assets', icon: Package, color: '#6366f1',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'documents', label: 'Documents', icon: FolderOpen, color: '#06b6a8',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'exit', label: 'Exit Management', icon: DoorOpen, color: '#EF4444',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'schedule', label: 'Schedule Interview' },
      { key: 'export', label: 'Export' },
    ],
  },
  {
    id: 'tickets', label: 'HR Tickets', icon: Ticket, color: '#F59E0B',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'add', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'export', label: 'Export' },
    ],
  },
]

export const HR_PERMISSION_MODULE_MAP = Object.fromEntries(
  HR_PERMISSION_MODULES.map((module) => [module.id, module]),
)

// Some call sites use synonyms for the same capability (e.g. "create" for the
// "add" key). Aliases are normalized before every permission check.
export const HR_ACTION_ALIASES = {
  create: 'add',
  'schedule-interview': 'schedule',
  'schedule interview': 'schedule',
  generate: 'generate',
  reject: 'reject',
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Total number of actions across every module (denominator for summaries). */
export const HR_TOTAL_ACTIONS = HR_PERMISSION_MODULES.reduce(
  (sum, module) => sum + module.actions.length,
  0,
)

/** Action keys available for a module. */
export const moduleActionKeys = (moduleId) =>
  HR_PERMISSION_MODULE_MAP[moduleId]?.actions.map((action) => action.key) || []

/** An empty (all-denied) permission profile: { moduleId: [] } for every module. */
export const emptyPermissions = () =>
  Object.fromEntries(HR_PERMISSION_MODULES.map((module) => [module.id, []]))

/** Full-access profile: every action of every module. */
export const HR_FULL_ACCESS = Object.fromEntries(
  HR_PERMISSION_MODULES.map((module) => [module.id, moduleActionKeys(module.id)]),
)

/**
 * Normalize an arbitrary permission value into the canonical
 * { moduleId: [actionKey] } shape — drops unknown modules/actions, dedupes.
 */
export const normalizePermissions = (value) => {
  const source = value && typeof value === 'object' ? value : {}
  const normalized = emptyPermissions()
  for (const module of HR_PERMISSION_MODULES) {
    const granted = Array.isArray(source[module.id]) ? source[module.id] : []
    normalized[module.id] = module.actions
      .map((action) => action.key)
      .filter((key) => granted.includes(key))
  }
  return normalized
}

/** Is every action of this module granted? */
export const moduleAllGranted = (permissions, moduleId) => {
  const keys = moduleActionKeys(moduleId)
  if (!keys.length) return false
  return keys.every((key) => permissions?.[moduleId]?.includes(key))
}

/** Is at least one action of this module granted? */
export const moduleAnyGranted = (permissions, moduleId) =>
  Boolean(permissions?.[moduleId]?.length)

/** Number of granted actions inside a single module. */
export const countModuleGranted = (permissions, moduleId) =>
  permissions?.[moduleId]?.length || 0

/** Total granted actions across every module. */
export const countGranted = (permissions) =>
  HR_PERMISSION_MODULES.reduce(
    (sum, module) => sum + countModuleGranted(permissions, module.id),
    0,
  )

/** Number of modules that have at least one granted action. */
export const countGrantedModules = (permissions) =>
  HR_PERMISSION_MODULES.filter((module) => moduleAnyGranted(permissions, module.id)).length

/** Is the profile the full-access preset? */
export const isFullAccess = (permissions) =>
  countGranted(permissions) === HR_TOTAL_ACTIONS
