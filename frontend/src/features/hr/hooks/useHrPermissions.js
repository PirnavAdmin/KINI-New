import usePermission from '@shared/hooks/usePermission'
import { useEffect, useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import {
  resolveHrRole, hrRoleToLevel, HR_ROLE_META, HR_LEVELS, HR_LEVEL_ACTIONS, HR_LEVEL_MODULE_ACTIONS, HR_MODULE_VIEW, isHrModuleUser, canAccessDocumentCategory,
} from '@features/hr/constants/hrPermissions'
import { normalizeRole } from '@shared/constants/roles'
import { findHrUserByEmail, HR_USERS_CHANGED_EVENT, HR_USERS_STORAGE_KEY } from '@features/hr/services/hrUserStore'
import {
  HR_ACTION_ALIASES, countGranted, countGrantedModules,
} from '@features/hr/constants/hrPermissionMatrix'

/**
 * Live HR identity comes from the authenticated profile. Module/action grants
 * come from the same Permission API used by Organization Employee Access.
 * Browser-stored custom profiles and role defaults are for demo sessions only.
 */
export default function useHrPermissions() {
  const { user, role, employeeProfileResolving } = useAuth()
  const apiPermissions = usePermission()
  const isDemo = localStorage.getItem('isDemo') === 'true'
  const liveHr = !isDemo && role === 'employee' && isHrModuleUser(user)
  const resolvedPlatformRole = normalizeRole(user?.userRole ?? user?.role ?? role)
  const isOrganizationAdmin = resolvedPlatformRole === 'org-admin'

  // ENTERPRISE RBAC — explicit fields first. The active store record (when one
  // matches the logged-in user) carries the canonical role + hrRole assigned by
  // the Organization Admin; its hrRole is authoritative for custom profiles,
  // falling back to the level resolver only when the record has no hrRole.
  const record = (() => {
    if (!isDemo) return null
    const email = String(user?.email || '').trim().toLowerCase()
    if (!email) return null
    const found = findHrUserByEmail(email)
    return found && found.status === 'active' ? found : null
  })()
  // Organization Admin is authoritative even if an old local HR profile with
  // the same email still exists in the browser's HR store.
  const isHrUser = !isOrganizationAdmin && (isDemo
    ? Boolean(record) || isHrModuleUser(user)
    : liveHr)
  const profile = record?.permissions && typeof record.permissions === 'object' ? record.permissions : null
  const isCustom = Boolean(profile)
  const hrRole = isHrUser && isCustom && record?.hrRole
    ? (hrRoleToLevel(record.hrRole) || resolveHrRole(user))
    : isHrUser ? resolveHrRole(user) : null
  const meta = hrRole ? HR_ROLE_META[hrRole] : null
  const actions = hrRole ? HR_LEVEL_ACTIONS[hrRole] : {}
  const visibleModules = hrRole ? (HR_MODULE_VIEW[hrRole] || []) : []

  // Re-render (and thus re-resolve the profile) when the HR Users store changes
  // in another tab — the same-tab store hook refreshes itself on mutation.
  const [, setStoreVersion] = useState(0)
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === HR_USERS_STORAGE_KEY) setStoreVersion((v) => v + 1)
    }
    const onUsersChanged = () => setStoreVersion((v) => v + 1)
    window.addEventListener('storage', onStorage)
    window.addEventListener(HR_USERS_CHANGED_EVENT, onUsersChanged)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(HR_USERS_CHANGED_EVENT, onUsersChanged)
    }
  }, [])


  // Uniform action surface — every module shares the same set of actions for the
  // resolved HR level. Unknown actions default to FALSE (never over-grant).
  const can = (module, action) => {
    if (liveHr) return apiPermissions.can(module, action)
    if (!isHrUser || !action) return false
    const canonical = HR_ACTION_ALIASES[action] || action
    if (isCustom) {
      const granted = profile[module]
      if (!Array.isArray(granted) || !granted.length) return false
      // A granted module implies View access (module is usable once enabled).
      if (canonical === 'view') return true
      return granted.includes(canonical)
    }
    if (hrRole === HR_LEVELS.MANAGER) return Boolean(actions[canonical])
    return Boolean(HR_LEVEL_MODULE_ACTIONS[hrRole]?.[module]?.includes(canonical))
  }

  // Menu-level visibility — spec: a module is visible when at least one
  // permission exists for it (level mode: the HR level's module view).
  const canModule = (module) => {
    if (liveHr) return apiPermissions.hasPermission(module)
    if (!isHrUser) return false
    if (isCustom) return Boolean(profile[module]?.length)
    return visibleModules.includes(module)
  }

  // Content-level visibility — custom profiles need the explicit View action
  // before the module's content renders; level mode keeps today's behaviour.
  const canAccessModule = (module) => {
    if (liveHr) return apiPermissions.hasPermission(module)
    if (!isHrUser) return false
    if (isCustom) return Boolean(profile[module]?.includes('view'))
    return visibleModules.includes(module)
  }

  const grantedCount = isCustom ? countGranted(profile) : 0
  const grantedModules = isCustom ? countGrantedModules(profile) : 0

  return {
    isLoading: !isDemo && role === 'employee' && (employeeProfileResolving || apiPermissions.isLoading),
    hrRole,
    roleLabel: meta?.label || (isCustom ? 'HR User' : 'HR Executive'),
    accessLevel: isCustom ? 'Custom' : meta?.accessLevel || 'Editor',
    roleColor: isCustom ? '#0f55f7' : meta?.color || '#0f55f7',
    roleDescription: isCustom
      ? 'Custom permissions assigned by the Organization Admin.'
      : meta?.description || '',
    permissionSource: liveHr ? 'api' : isCustom ? 'custom' : 'level',
    permissions: liveHr ? apiPermissions.permissions : isCustom ? profile : null,
    grantedCount,
    grantedModules,
    can,
    canModule,
    canAccessModule,
    canAccessDocumentCategory: (category) => canAccessDocumentCategory(hrRole, category),
    // A live Organization Admin assignment is authoritative even before a
    // legacy department field has been added to the login profile.
    isHrUser,
  }
}
