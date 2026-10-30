import { useEffect, useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { resolvePermissions } from '@shared/constants/permissions'
import { permissionApi, toBackendUserRole, moduleKey as normalizeModuleKeyByName } from '@shared/services/platformModulesApi'

// HR shares Employee routes, but the Permission API uses distinct role names.
// Only use explicit identity fields; a department/title is not an API role.
const permissionRoleForUser = (role, user) => {
  if (role !== 'employee') return role
  const values = [user?.userRole, user?.UserRole, user?.roleName, user?.RoleName, user?.role, user?.Role]
  const specialist = values.find(value => ['hr', 'hrrecruiter', 'hrexecutive'].includes(
    String(value ?? '').replace(/[\s_-]/g, '').toLowerCase(),
  ))
  return specialist || role
}

const permissionEmployeeId = (user) => user?.employeeId
  ?? user?.EmployeeId
  ?? user?.employee?.employeeId
  ?? user?.employee?.id
  ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('employeeId') : null)
  ?? null

// Swagger-confirmed catalog from GET /api/Permission/modules — 17 modules,
// permissionId 1-17. EmployeeProfile (9) is distinct from Employees (2); an
// alias that collapsed them into one key previously let one module's
// permission state silently overwrite the other's.
//
// moduleKey() in platformModulesApi.js (imported here as normalizeModuleKeyByName)
// is the single source of truth for name-based normalization — every row that
// reaches this file already went through it once (see normalizePermissionRows)
// and carries the result on `.key`, which apiPermissionKeys() below now prefers
// before ever calling this function. This numeric map is only a last-resort
// fallback for the rare payload shape that supplies a bare permissionId with no
// module name at all; it must never disagree with platformModulesApi.js's own
// PERMISSION_MODULE_IDS reverse map on what an id means.
const NUMERIC_MODULE_ID_FALLBACK = {
  1: 'dashboard', 2: 'employees', 3: 'courses', 4: 'batches', 5: 'attendance',
  6: 'assessments', 7: 'reports', 8: 'live-classes', 9: 'employee-profile',
  10: 'students', 11: 'leave', 12: 'performance', 13: 'resources',
  14: 'announcements', 15: 'settings', 16: 'students', 17: 'calendar',
}

const permissionModuleKey = (value) => {
  const isBareNumericId = (typeof value === 'number' && Number.isFinite(value))
    || (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)))
  if (isBareNumericId && NUMERIC_MODULE_ID_FALLBACK[Number(value)]) {
    return NUMERIC_MODULE_ID_FALLBACK[Number(value)]
  }
  return normalizeModuleKeyByName(value)
}

const KNOWN_PERMISSION_MODULES = new Set([
  'dashboard', 'employees', 'courses', 'batches', 'attendance', 'assessments', 'reports',
  'students', 'classes', 'live-classes', 'employee-profile', 'leave', 'performance', 'calendar', 'settings', 'profile', 'schedule',
  'syllabus', 'assignments', 'resources', 'messages', 'announcements', 'certificates',
])

const permissionValue = (permission, ...keys) => {
  for (const key of keys) {
    if (permission?.[key] !== undefined) return permission[key]
  }
  return undefined
}

const isPermissionEnabled = (value) => {
  if (typeof value === 'string') {
    return !['false', '0', 'no', 'off', 'disabled', 'deny', 'denied', ''].includes(value.trim().toLowerCase())
  }
  return Boolean(value)
}

const apiPermissionKeys = (payload) => {
  const source = payload?.permissions ?? payload?.data?.permissions ?? payload?.data ?? payload
  const keys = new Set()
  const rows = Array.isArray(source)
      ? source.map((permission) => [
      // `.key` (set by platformModulesApi.js's normalizePermissionRows, the
      // single source of truth for module normalization) must win over the
      // raw `.module` name whenever present — checking it first here is what
      // makes this file and platformModulesApi.js agree on every module,
      // including ones added after this list was last hand-maintained.
      permission?.key
        ?? permissionValue(permission, 'moduleKey', 'ModuleKey', 'moduleName', 'ModuleName', 'moduleId', 'ModuleId', 'module', 'Module', 'permissionKey', 'name', 'Name')
        ?? permission?.module?.name
        ?? permission?.Module?.Name,
      permission,
    ])
    : source && typeof source === 'object'
      ? Object.entries(source).flatMap(([key, value]) => {
        const [moduleKey, action] = String(key).split('.')
        if (action) return [[moduleKey, { [action.toLowerCase()]: value }]]
        return [[key, value && typeof value === 'object' ? value : { view: value }]]
      })
      : null
  if (!rows) return null
  // Role defaults have already been merged by effectiveByEmployee.
  if (rows.length === 0) return []

  let recognizedRows = 0
  rows.forEach(([moduleValue, permission]) => {
    const module = permissionModuleKey(moduleValue)
    if (!KNOWN_PERMISSION_MODULES.has(module)) return
    recognizedRows += 1
    const fields = {
      view: permissionValue(permission, 'canView', 'CanView', 'view', 'View'),
      add: permissionValue(permission, 'canAdd', 'CanAdd', 'add', 'Add'),
      edit: permissionValue(permission, 'canEdit', 'CanEdit', 'edit', 'Edit'),
      delete: permissionValue(permission, 'canDelete', 'CanDelete', 'delete', 'Delete'),
      access: permissionValue(permission, 'canAccess', 'CanAccess', 'hasAccess', 'HasAccess', 'access', 'Access'),
      export: permissionValue(permission, 'canExport', 'CanExport', 'export', 'Export'),
      approve: permissionValue(permission, 'canApprove', 'CanApprove', 'approve', 'Approve'),
    }
    Object.entries(fields).forEach(([action, allowed]) => {
      if (isPermissionEnabled(allowed)) keys.add(`${module}.${action}`)
    })
    // The bare module key gates the sidebar item and the route guard
    // (PermissionGuard permission="live-classes" etc.) — "Access" is the
    // module's own explicit page-level gate, independent of the View/Add/
    // Edit/Delete row-action toggles, and must be the one that decides it.
    if (isPermissionEnabled(fields.access)) keys.add(module)
    const action = String(permissionValue(permission, 'action', 'Action', 'actionKey', 'ActionKey', 'permission', 'Permission') ?? '').toLowerCase()
    if (isPermissionEnabled(permissionValue(permission, 'allowed', 'Allowed', 'isAllowed', 'IsAllowed', 'value', 'Value')) && action) {
      keys.add(action === 'access' ? module : `${module}.${action}`)
    }
  })
  return recognizedRows ? [...keys] : null
}

const permissionRequestCache = new Map()
const permissionDebugKeys = new Set()
const permissionCheckLogKeys = new Set()

/**
 * usePermission — checks the current user's role (+ optional department) against
 * the permission map. `role` from useAuth() is already normalized (see AuthContext.jsx).
 *
 * Supports two call styles:
 *   hasPermission("settings.editEmail")            — flat key from the permission map
 *   can("settings", "editEmail")  /  can("students", "view") — module + action pair,
 *   resolved to `${module}.${action}`. Both fall back gracefully.
 *
 * RBAC UPGRADE — future-compatible department resolution: the backend may eventually
 * return either `{ role: "Employee", department: "HR" }` or `{ role: "HR" }` directly.
 * Both shapes resolve the same way here — `user.role` (already normalized to "employee")
 * combined with `user.department` (case-insensitive) — without the UI ever hardcoding
 * `role === "HR"`. An employee with no department, or one PERMISSIONS doesn't recognize,
 * falls back to the plain role's permission set untouched. Demo sessions (DemoLogin.jsx)
 * resolve permissions the exact same way via resolvePermissions().
 */
export default function usePermission() {
  const { role, user, token, employeeIdResolving } = useAuth()
  const [apiPermissionState, setApiPermissionState] = useState({ userId: null, role: null, permissions: null, succeeded: false, error: null })
  const employeeId = permissionEmployeeId(user)
  const permissionRole = permissionRoleForUser(role, user)
  // Employee and mentor accounts can both receive user-level permissions from
  // Organization Access. User rows override role defaults when present.
  // Demo sessions (DemoLogin.jsx) have no backend token, so the API request
  // always fails and fail-closed would deny everything; they use the static
  // role map from resolvePermissions() instead.
  const isDemoSession = localStorage.getItem('isDemo') === 'true'
  const readsApiPermissions = !isDemoSession && (role === 'employee' || role === 'mentor')

  useEffect(() => {
    let active = true
    if (!readsApiPermissions) return undefined
    // AuthContext is still trying to resolve employeeId (login response
    // didn't include one). Without it this hook would call
    // GET /api/Permission/roles/{role} — the ROLE's defaults — instead of
    // this employee's own Organization > Employee Access overrides, which
    // is how a module an admin explicitly disabled for one mentor can still
    // show up (the role default, not the override, gets used). Wait for
    // enrichment to settle rather than resolving permissions from the wrong
    // source first and correcting a moment later.
    if (employeeIdResolving) return undefined
    const identityKey = `${role}:${permissionRole}:${employeeId ?? 'role-only'}`
    const cacheKey = `${token ?? ''}:${identityKey}`
    if (import.meta.env.DEV && !permissionDebugKeys.has(cacheKey)) {
      permissionDebugKeys.add(cacheKey)
      const safeUser = user && typeof user === 'object'
        ? Object.fromEntries(Object.entries(user).filter(([key]) => !/token|secret|password/i.test(key)))
        : user
      const token = localStorage.getItem('auth_token')
        || localStorage.getItem('accessToken')
        || localStorage.getItem('token')
        || localStorage.getItem('organizationToken')
      console.group('[Permission Debug]')
      console.log('Authenticated user:', safeUser)
      console.log('User ID:', user?.userId ?? user?.UserId ?? localStorage.getItem('userId'))
      console.log('Employee ID:', employeeId)
      console.log('Mentor ID:', user?.mentorId ?? user?.MentorId ?? localStorage.getItem('mentorId'))
      console.log('Login role:', user?.role)
      console.log('User role:', user?.userRole ?? localStorage.getItem('userRole') ?? localStorage.getItem('user_role'))
      console.log('Resolved permission role (internal, lowercase):', role)
      // The internal `role` above is intentionally lowercase — it's the app-wide
      // routing/permission key, not what goes over the wire. This is the value
      // actually sent as the {role} path segment on /api/Permission/roles/{role}.
      console.log('Backend-cased role used in the /api/Permission/roles/{role} request:', toBackendUserRole(permissionRole))
      console.log('Token exists:', Boolean(token))
      console.log('Token length:', token?.length ?? 0)
      console.groupEnd()
    }
    if (import.meta.env.DEV) {
      console.log('[PERMISSION START]', { employeeId, role })
      console.log('[PERMISSION SOURCE]', employeeId
        ? { source: 'employee-specific', endpoint: `/api/Permission/employees/${employeeId}` }
        : { source: 'role-only', endpoint: `/api/Permission/roles/${toBackendUserRole(permissionRole)}` })
    }
    let permissionRequest = permissionRequestCache.get(cacheKey)
    if (!permissionRequest) {
      permissionRequest = (async () => {
        // This requests role permissions and overlays any employee-specific rows.
        // A valid empty/all-false response must remain authoritative — but a
        // request that actually FAILED (network error, 403, etc.) is tracked
        // explicitly via `succeeded: false` rather than folded into "empty",
        // so the organization's permission configuration stays the source of
        // truth: unknown must never be treated as allowed.
        if (employeeId) {
          try {
            const rows = await permissionApi.effectiveByEmployee(employeeId, permissionRole)
            return { permissions: rows, succeeded: true, error: null }
          } catch (error) {
            return { permissions: null, succeeded: false, error }
          }
        }

        try {
          const rows = await permissionApi.byRole(permissionRole)
          return { permissions: rows, succeeded: true, error: null }
        } catch (error) {
          return { permissions: null, succeeded: false, error }
        }
      })()
      permissionRequestCache.set(cacheKey, permissionRequest)
      permissionRequest.catch(() => permissionRequestCache.delete(cacheKey))
    }
    Promise.resolve(permissionRequest).then(({ permissions: permissionPayload, succeeded, error }) => {
      if (!active) return
      const rolePermissions = succeeded ? apiPermissionKeys(permissionPayload) : null
      if (import.meta.env.DEV) {
        const rows = Array.isArray(permissionPayload) ? permissionPayload : []
        console.log('[PERMISSION RESPONSE]', {
          employeeId,
          status: succeeded ? 200 : (error?.response?.status ?? 'error'),
          count: rows.length,
        })
        console.log('[PERMISSION NORMALIZED]', {
          employeeId,
          modules: rows.map((row) => ({
            module: row.module,
            key: row.key,
            permissionId: row.permissionId,
            canAccess: row.canAccess,
            duplicate: Boolean(row.__duplicateModule),
          })),
        })
      }
      // TEMPORARY DIAGNOSTIC — remove once the Mentor Schedule Class
      // /unauthorized report is confirmed resolved.
      if (import.meta.env.DEV) {
        const rows = Array.isArray(permissionPayload) ? permissionPayload : []
        const liveClassesRow = rows.find((row) => row.key === 'live-classes' || row.permissionId === 8)
        console.log('[usePermission] resolved effective permissions:', {
          role,
          employeeId,
          succeeded,
          error: error ? (error.response?.status ?? error.message) : null,
          moduleId: 8,
          moduleName: liveClassesRow?.module ?? '(no row returned for module 8)',
          permissionKey: 'live-classes',
          liveClassesRow: liveClassesRow ?? null,
          liveClassesGranted: Boolean(rolePermissions?.includes('live-classes')),
          resolvedPermissions: rolePermissions,
        })
      }
      setApiPermissionState({
        userId: employeeId,
        role,
        permissionRole,
        permissions: rolePermissions,
        succeeded,
        error,
      })
    })
    return () => { active = false }
  }, [readsApiPermissions, role, permissionRole, employeeId, employeeIdResolving, token])

  const apiState = apiPermissionState.userId === employeeId && apiPermissionState.role === role && apiPermissionState.permissionRole === permissionRole
    ? apiPermissionState
    : null
  // API-driven sessions fail closed. effectiveByEmployee already merges role
  // defaults; empty/invalid results must not reintroduce static HR grants.
  const permissions = !apiState
    ? resolvePermissions(role, user?.department)
    : apiState.succeeded
      ? (apiState.permissions ?? [])
      : []
  const isLoading = readsApiPermissions && (
    employeeIdResolving || !apiState
  )

  const hasPermission = (key) => {
    if (!key) return true
    if (isLoading) return false
    const result = permissions.includes('*') || permissions.includes(key)
    if (import.meta.env.DEV) {
      // Logged once per (identity, key, result) rather than on every render —
      // hasPermission runs for every sidebar item on every render, so an
      // unconditional log here would drown the console.
      const logKey = `${role}:${employeeId ?? 'role-only'}:${key}:${result}`
      if (!permissionCheckLogKeys.has(logKey)) {
        permissionCheckLogKeys.add(logKey)
        console.log('[PERMISSION CHECK]', { employeeId, requested: key, normalized: permissionModuleKey(key), result })
      }
    }
    return result
  }

  /**
   * can(module, action) — e.g. can("students", "add").
   * Also accepts a pre-built dotted key: can("students.add").
   */
  const can = (module, action) => {
    if (!module) return true
    const key = action ? `${module}.${action}` : module
    return hasPermission(key)
  }

  // Exposed so callers (PermissionGuard, Sidebar) never have to re-derive
  // employeeId from `user` themselves — permissionEmployeeId() above is the
  // only place that knows every fallback (nested user.employee.*, and the
  // localStorage value AuthContext persists even when the login/profile
  // response never put a flat employeeId on the stored user object). A
  // second, incomplete re-derivation elsewhere previously produced `null`
  // here while this hook correctly resolved 9, purely because it skipped
  // that localStorage fallback.
  return { hasPermission, can, permissions, isLoading, employeeId, role }
}
