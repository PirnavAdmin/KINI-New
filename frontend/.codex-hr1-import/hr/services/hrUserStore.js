// ================================================================
// KINI HRMS — HR USERS STORE (custom permission profiles)
// ================================================================
// Additive front-end store for HR user accounts created by the Organization
// Admin through Employee Management / HR Settings. Each record carries the
// account details (name, email, mobile, designation, status), the canonical
// RBAC identifiers (role + hrRole) and the custom permission profile assigned
// via the Permission Matrix.
//
// ENTERPRISE RBAC — user model:
//   { id, name, email, mobile, designation, status, role, hrRole, permissions, createdAt }
//   • role   — canonical platform User Role (default HR)
//   • hrRole — canonical HR role tier for HR users (default HR_EXECUTIVE),
//              null for non-HR user roles
//   • passwords are NEVER persisted as part of the RBAC profile. The create/edit
//     forms still collect (and validate) them for demo UX, but credentials do
//     not leave the form — login in this demo goes through the personas on
//     /demo-login, which never read a stored password.
//
// IMPORTANT — this is a demo/local persistence layer only. It does NOT touch
// the existing employee APIs, the auth service or the database. When a logged
// in HR employee's email matches a stored record, useHrPermissions.js resolves
// permissions from this profile instead of the level-based defaults.
// ================================================================

import { useCallback, useEffect, useState } from 'react'
import {
  USER_ROLES, HR_ROLE_IDS, normalizeUserRole, normalizeHrRole,
} from '@shared/constants/roles'
import { emptyPermissions, normalizePermissions } from '@features/hr/constants/hrPermissionMatrix'
import { defaultPermissionsForHrRole } from '@features/hr/constants/hrPermissions'

export const HR_USERS_STORAGE_KEY = 'kini_hr_users_v1'
export const HR_USERS_CHANGED_EVENT = 'kini:hr-users-changed'

// ── Low-level persistence ──────────────────────────────────────────────────

export const readHrUsers = () => {
  try {
    const raw = localStorage.getItem(HR_USERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeHrUsers = (users) => {
  try {
    localStorage.setItem(HR_USERS_STORAGE_KEY, JSON.stringify(users))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(HR_USERS_CHANGED_EVENT))
    }
  } catch {
    // Storage unavailable (private mode / quota) — state still works in memory.
  }
}

// ── Record helpers ─────────────────────────────────────────────────────────

export const createHrUserId = () =>
  `HRU-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

/** A blank HR user draft — used to initialise the create form. */
export const emptyHrUser = () => ({
  id: '',
  name: '',
  lastName: '',
  email: '',
  mobile: '',
  designation: '',
  employeeType: 'Full-Time',
  status: 'active',
  // ENTERPRISE RBAC — canonical user model. The store only manages HR accounts,
  // so User Role defaults to HR with the least-privilege HR role tier.
  role: USER_ROLES.HR,
  hrRole: HR_ROLE_IDS.EXECUTIVE,
  password: '',
  confirmPassword: '',
  permissions: emptyPermissions(),
  createdAt: '',
})

/**
 * Build a persisted record from form values.
 * Normalizes the canonical role + hrRole: HR accounts always carry an HR role
 * tier (least-privilege default), and non-HR user roles must not carry one.
 * Passwords are validated by the forms but deliberately NOT persisted.
 */
export const buildHrUser = (draft) => {
  const role = normalizeUserRole(draft.role) || USER_ROLES.HR
  const hrRole = role === USER_ROLES.HR
    ? (normalizeHrRole(draft.hrRole) || HR_ROLE_IDS.EXECUTIVE)
    : null
  const hasCustomPermissions = Object.values(draft.permissions || {}).some(
    (granted) => Array.isArray(granted) && granted.length > 0,
  )
  return {
    id: draft.id || createHrUserId(),
    name: String(draft.name || '').trim(),
    lastName: String(draft.lastName || '').trim(),
    email: String(draft.email || '').trim().toLowerCase(),
    mobile: String(draft.mobile || '').trim(),
    designation: String(draft.designation || '').trim(),
    employeeType: String(draft.employeeType || draft.employmentType || 'Full-Time').trim() || 'Full-Time',
    status: draft.status === 'inactive' ? 'inactive' : 'active',
    role,
    hrRole,
    permissions: normalizePermissions(
      hasCustomPermissions ? draft.permissions : defaultPermissionsForHrRole(hrRole),
    ),
    createdAt: draft.createdAt || new Date().toISOString().slice(0, 10),
  }
}

// ── Queries ────────────────────────────────────────────────────────────────

/** Case-insensitive lookup by email (the key used to resolve permissions at login). */
export const findHrUserByEmail = (email) => {
  const target = String(email || '').trim().toLowerCase()
  if (!target) return null
  return readHrUsers().find((user) => String(user?.email || '').trim().toLowerCase() === target) || null
}

export const findHrUserById = (id) =>
  readHrUsers().find((user) => user?.id === id) || null

// ── Mutations ──────────────────────────────────────────────────────────────

export const upsertHrUser = (draft) => {
  const record = buildHrUser(draft)
  const users = readHrUsers()
  const index = users.findIndex((user) => user.id === record.id)
  if (index >= 0) {
    users[index] = { ...users[index], ...record }
  } else {
    users.push(record)
  }
  writeHrUsers(users)
  return record
}

export const removeHrUser = (id) => {
  writeHrUsers(readHrUsers().filter((user) => user.id !== id))
}

// ── Reactive hook ──────────────────────────────────────────────────────────

/**
 * useHrUsers — reactive access to the HR Users store.
 * Returns the list plus create/update/delete helpers that persist to
 * localStorage AND update React state in the same tab. Cross-tab changes are
 * picked up via the storage event.
 */
export const useHrUsers = () => {
  const [users, setUsers] = useState(readHrUsers)

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === HR_USERS_STORAGE_KEY) setUsers(readHrUsers())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const saveUser = useCallback((draft) => {
    const record = upsertHrUser(draft)
    setUsers(readHrUsers())
    return record
  }, [])

  const replaceUsers = useCallback((nextUsers) => {
    const records = (Array.isArray(nextUsers) ? nextUsers : []).map(buildHrUser)
    writeHrUsers(records)
    setUsers(records)
    return records
  }, [])

  const deleteUser = useCallback((id) => {
    removeHrUser(id)
    setUsers(readHrUsers())
  }, [])

  const refresh = useCallback(() => setUsers(readHrUsers()), [])

  // create/update share one upsert implementation.
  return { users, saveUser, createUser: saveUser, updateUser: saveUser, replaceUsers, deleteUser, refresh }
}
