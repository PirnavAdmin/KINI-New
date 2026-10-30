// ================================================================
// KINI HRMS — HR ROLE PERMISSIONS (RBAC UI layer)
// ================================================================
// Front-end-only Role-Based Access Control for the HR Module.
// One dashboard for every HR user — the UI adapts by hiding /
// disabling elements according to the logged-in user's HR level.
//
// IMPORTANT — this layer does NOT touch the backend, auth service,
// existing route guards or the existing usePermission() module
// keys. It derives the HR level from the profile fields the login
// already stores, so no API or auth changes were required.
//
// ENTERPRISE RBAC — explicit fields take priority over inference:
//   1. user.role  (canonical platform role — 'HR' identifies HR users)
//   2. user.hrRole (canonical HR_EXECUTIVE / HR_COORDINATOR / HR_MANAGER,
//      or a legacy label like "Manager")
//   3. legacy keyword fallback (designation, jobTitle, title, …)
// The canonical identifiers live in @shared/constants/roles; the legacy
// inference below is preserved unchanged for backward compatibility.
//
// Roles: HR Executive · HR Coordinator · HR Manager
// ================================================================

import {
  USER_ROLES, HR_ROLE_IDS, normalizeUserRole, normalizeHrRole,
} from '@shared/constants/roles'
import { HR_FULL_ACCESS } from '@features/hr/constants/hrPermissionMatrix'

export const HR_LEVELS = {
  EXECUTIVE: 'hr-executive',
  COORDINATOR: 'hr-coordinator',
  MANAGER: 'hr-manager',
}

// Canonical hrRole identifier → HR level. Keep in sync with HR_ROLE_IDS in
// @shared/constants/roles — this is what makes an explicit hrRole authoritative.
export const CANONICAL_HR_ROLE_TO_LEVEL = {
  [HR_ROLE_IDS.EXECUTIVE]: HR_LEVELS.EXECUTIVE,
  [HR_ROLE_IDS.COORDINATOR]: HR_LEVELS.COORDINATOR,
  [HR_ROLE_IDS.MANAGER]: HR_LEVELS.MANAGER,
}

/** Map a canonical hrRole identifier to its HR level (null when unrecognized). */
export const hrRoleToLevel = (hrRole) =>
  CANONICAL_HR_ROLE_TO_LEVEL[normalizeHrRole(hrRole)] || null

// ── Role metadata (label, access-level badge, colour) ─────────────
export const HR_ROLE_META = {
  [HR_LEVELS.EXECUTIVE]: {
    label: 'HR Executive',
    accessLevel: 'Editor',
    color: '#0f55f7',
    description: 'Daily HR operations, employee records and attendance workflow.',
  },
  [HR_LEVELS.COORDINATOR]: {
    label: 'Recruiter',
    accessLevel: 'Recruitment',
    color: '#8b5cf6',
    description: 'Recruitment, interviews, onboarding and candidate documents.',
  },
  [HR_LEVELS.MANAGER]: {
    label: 'HR Admin',
    accessLevel: 'Administrator',
    color: '#06b6a8',
    description: 'Full access — view, add, edit, delete, approve, import, export, manage.',
  },
}

export const HR_DOCUMENT_CATEGORIES = {
  GENERAL: 'general',
  OPERATIONS: 'operations',
  CONFIDENTIAL: 'confidential',
  RECRUITMENT: 'recruitment',
  // Backward-compatible aliases for existing callers.
  EMPLOYEE: 'general',
  ONBOARDING: 'recruitment',
  PAYROLL: 'confidential',
}

const GENERAL_DOCUMENT_TYPES = new Set([
  'PAN Card', 'Aadhaar', 'Passport', 'Visa / Work Permit', 'Address Proof',
  'Degree Certificate', 'Relieving Letter', 'Joining Form',
])

const OPERATIONS_DOCUMENT_TYPES = new Set([
  'Attendance Record', 'Leave Request', 'Shift Assignment', 'Holiday Calendar',
])

const RECRUITMENT_DOCUMENT_TYPES = new Set([
  'Offer Letter', 'Resume', 'Interview Feedback', 'Candidate Resume',
  'Candidate Document', 'Onboarding Document', 'Welcome Kit',
])

export const documentCategoryForType = (type) => {
  const normalized = String(type || '').trim()
  if (RECRUITMENT_DOCUMENT_TYPES.has(normalized)) return HR_DOCUMENT_CATEGORIES.RECRUITMENT
  if (OPERATIONS_DOCUMENT_TYPES.has(normalized)) return HR_DOCUMENT_CATEGORIES.OPERATIONS
  if (GENERAL_DOCUMENT_TYPES.has(normalized)) return HR_DOCUMENT_CATEGORIES.GENERAL
  return HR_DOCUMENT_CATEGORIES.CONFIDENTIAL
}

export const canAccessDocumentCategory = (hrRole, category) => {
  const level = hrRoleToLevel(hrRole) || HR_LEVELS.EXECUTIVE
  if (level === HR_LEVELS.MANAGER) return true
  if (level === HR_LEVELS.COORDINATOR) {
    return [HR_DOCUMENT_CATEGORIES.GENERAL, HR_DOCUMENT_CATEGORIES.RECRUITMENT].includes(category)
  }
  return [HR_DOCUMENT_CATEGORIES.GENERAL, HR_DOCUMENT_CATEGORIES.OPERATIONS, HR_DOCUMENT_CATEGORIES.RECRUITMENT].includes(category)
}

// ── Granular action surface (per HR level, uniform across modules) ─
// Actions: view · add · edit · delete · approve · export · import ·
//          print · assign · manage
export const HR_LEVEL_ACTIONS = {
  [HR_LEVELS.EXECUTIVE]: {
    view: true, add: true, edit: false, delete: false, approve: false,
    export: true, import: false, print: false, assign: false, manage: false,
  },
  [HR_LEVELS.COORDINATOR]: {
    view: true, add: false, edit: true, delete: false, approve: false,
    export: true, import: false, print: false, assign: false, manage: false,
  },
  [HR_LEVELS.MANAGER]: {
    view: true, add: true, edit: true, delete: true, approve: true,
    export: true, import: true, print: true, assign: true, manage: true,
  },
}

// Module-specific defaults keep sensitive HR areas out of recruitment and
// operations roles while preserving the manager's full-access profile.
export const HR_LEVEL_MODULE_ACTIONS = {
  [HR_LEVELS.EXECUTIVE]: {
    dashboard: ['view'],
    employees: ['view', 'edit', 'export'],
    onboarding: ['view', 'add', 'edit', 'export'],
    attendance: ['view', 'add', 'edit', 'export'],
    leave: ['view', 'add', 'edit', 'export'],
    shifts: ['view', 'add', 'edit', 'export'],
    holidays: ['view'],
    payroll: ['view', 'export'],
    payslips: ['view', 'export'],
    recruitment: ['view', 'add', 'edit', 'schedule', 'export'],
    documents: ['view', 'add', 'edit', 'export'],
    assets: ['view', 'edit', 'export'],
    exit: ['view'],
    mentors: ['view', 'edit'],
    reports: ['view', 'export'],
    tickets: ['view', 'add'],
  },
  [HR_LEVELS.COORDINATOR]: {
    dashboard: ['view'],
    onboarding: ['view', 'add', 'edit', 'export'],
    recruitment: ['view', 'add', 'edit', 'schedule', 'export'],
    documents: ['view', 'add', 'edit', 'export'],
    reports: ['view', 'export'],
  },
}

// ── Module registry ids (mirrors HR_MODULES in hrMeta.js) ─────────
// 'mentors' is the legacy standalone page — hidden from navigation and always
// visible so its redirect (to Employee Management) keeps working.
export const HR_MODULE_IDS = [
  'dashboard', 'employees', 'onboarding',
  'attendance', 'leave', 'shifts', 'holidays',
  'payroll', 'payslips', 'recruitment', 'performance', 'appraisal',
  'assets', 'documents', 'exit', 'tickets', 'reports', 'settings', 'permissions', 'syllabus', 'mentors',
]

// ── Module-level view access per HR level ─────────────────────────
// Which modules appear in the sidebar, workspace and dashboard KPIs.
// Enterprise default: escalation from core HR → finance → talent →
// operations → system. HR Manager sees everything.
export const HR_MODULE_VIEW = {
  [HR_LEVELS.EXECUTIVE]: Object.keys(HR_LEVEL_MODULE_ACTIONS[HR_LEVELS.EXECUTIVE]),
  [HR_LEVELS.COORDINATOR]: Object.keys(HR_LEVEL_MODULE_ACTIONS[HR_LEVELS.COORDINATOR]),
  [HR_LEVELS.MANAGER]: HR_MODULE_IDS,
}

export const defaultPermissionsForHrRole = (hrRole) => {
  const level = hrRoleToLevel(hrRole) || HR_LEVELS.EXECUTIVE
  if (level === HR_LEVELS.MANAGER) return HR_FULL_ACCESS
  const moduleActions = HR_LEVEL_MODULE_ACTIONS[level] || {}
  return Object.fromEntries(
    HR_MODULE_IDS.map((moduleId) => [moduleId, [...(moduleActions[moduleId] || [])]]),
  )
}

// ── HR level resolution from the stored user profile ─────────────
// The login flow is untouched: we read the profile fields a real
// login already persists (designation, jobTitle, title, hrRole…)
// and match them against HR level keywords. Unrecognised profiles
// resolve to the least-privilege default (HR Executive).
const LEVEL_KEYWORDS = [
  {
    level: HR_LEVELS.MANAGER,
    words: ['manager', 'head', 'director', 'chief', 'admin', 'administrator'],
  },
  {
    level: HR_LEVELS.COORDINATOR,
    words: ['coordinator', 'officer', 'supervisor'],
  },
  {
    level: HR_LEVELS.EXECUTIVE,
    words: ['executive', 'specialist'],
  },
]

// Dedicated HR-role fields are trusted on their own (e.g. hrRole: "Manager").
const DEDICATED_ROLE_FIELDS = ['hrRole', 'subRole', 'employeeRole', 'accessLevel', 'permissionLevel', 'roleTitle']
// Profiles explicitly flagged as view-only (the removed HR Viewer tier) resolve
// to the least-privilege default instead of escalating via other profile fields.
const VIEW_ONLY_WORDS = ['viewer', 'analyst', 'associate', 'intern', 'trainee', 'readonly', 'read-only', 'view only']
// Generic profile fields only escalate when the value itself references an HR
// context — prevents titles like "Team Manager" or "Department Head" from
// silently granting full HR Manager access on a least-privilege default.
const LABEL_ROLE_FIELDS = ['roleName', 'designation', 'jobTitle', 'title', 'position', 'level', 'role']
const HR_CONTEXT_KEYWORDS = ['hr', 'human resource', 'human capital', 'people']

const matchLevel = (value) => {
  const text = String(value || '').toLowerCase()
  if (!text) return null
  for (const { level, words } of LEVEL_KEYWORDS) {
    if (words.some((word) => text.includes(word))) return level
  }
  return null
}

export function resolveHrRole(user) {
  const profile = user && typeof user === 'object' ? user : {}
  // PRIORITY 1 — explicit canonical hrRole (stable identifiers). Legacy keyword
  // inference below also matches these strings, but this explicit map keeps the
  // canonical values authoritative and unambiguous (e.g. HR_COORDINATOR can never
  // drift into a different tier via substring guessing).
  const canonicalHrRole = normalizeHrRole(profile.hrRole)
  if (canonicalHrRole) return CANONICAL_HR_ROLE_TO_LEVEL[canonicalHrRole]
  // PRIORITY 2 — legacy dedicated-field / label-field keyword fallback.
  for (const field of DEDICATED_ROLE_FIELDS) {
    const text = String(profile[field] || '').toLowerCase()
    if (!text) continue
    // Explicitly view-only dedicated field → least-privilege default (never escalate).
    if (VIEW_ONLY_WORDS.some((word) => text.includes(word))) return HR_LEVELS.EXECUTIVE
    const level = matchLevel(text)
    if (level) return level
  }
  for (const field of LABEL_ROLE_FIELDS) {
    const text = String(profile[field] || '').toLowerCase()
    if (!text || !HR_CONTEXT_KEYWORDS.some((keyword) => text.includes(keyword))) continue
    const level = matchLevel(text)
    if (level) return level
  }
  return HR_LEVELS.EXECUTIVE
}

// Convenience — is this user an HR-module user at all?
// An explicit canonical User Role of HR identifies HR-module users even when the
// legacy `department` marker is absent; legacy department = 'hr' still works for
// every existing profile (and real backend logins that only send a department).
export const isHrModuleUser = (user) => {
  const profile = user?.profile ?? user?.employee ?? {}
  const markers = [user?.userRole, user?.role, user?.hrRole, user?.designation, user?.departmentName, user?.department?.name, profile.department, profile.role, profile.hrRole]
  if (markers.some(value => /^(hr([ _-]|$)|human[ _-]?resources$)/i.test(String(value ?? '').trim()))) return true
  const department = String(user?.department || '').trim().toLowerCase()
  if (department === 'hr' || department === 'human resources') return true
  // Backend sessions may keep the platform role as "employee" while storing
  // the HR tier separately. That tier still identifies an HR module user.
  if (normalizeHrRole(user?.hrRole)) return true
  // Canonical role may arrive on the `role` field (pure canonical model) or on
  // the raw `userRole` field (platform role stays on `role` — e.g. demo personas
  // that must keep routing as employee). Either one identifies an HR user.
  return normalizeUserRole(user?.role) === USER_ROLES.HR
    || normalizeUserRole(user?.userRole) === USER_ROLES.HR
}
