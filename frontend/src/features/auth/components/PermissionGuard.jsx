import { Navigate } from 'react-router-dom'
import usePermission from '@shared/hooks/usePermission'
import { useAuth } from '@shared/hooks/useAuth'

/**
 * PermissionGuard — narrower, additive companion to RoleBasedRoute.
 * RoleBasedRoute already confirms the user's *role* may enter this route group;
 * PermissionGuard then confirms they hold the specific *permission* a route needs
 * (e.g. a department-gated dashboard) before rendering it, redirecting to
 * /unauthorized otherwise. Does not replace or alter RoleBasedRoute/ProtectedRoute.
 */
export default function PermissionGuard({ permission, children }) {
  // employeeId/role come from usePermission() — the same resolution it uses
  // to decide hasPermission() itself — rather than being re-derived here from
  // `user`. A separate, incomplete re-derivation previously logged
  // `employeeId: null` for sessions usePermission correctly resolved,
  // because it skipped the localStorage fallback AuthContext relies on.
  const { hasPermission, isLoading, permissions, employeeId, role } = usePermission()
  const { user } = useAuth()

  const guardResult = !isLoading && hasPermission(permission)

  // TEMPORARY DIAGNOSTIC — remove once the Mentor Schedule Class /unauthorized
  // report is confirmed resolved. No token/secret values are logged.
  if (import.meta.env.DEV) {
    console.log('[PermissionGuard]', {
      requiredPermission: permission,
      role,
      employeeId,
      userId: user?.userId ?? user?.UserId ?? user?.id ?? null,
      isLoading,
      currentPermissions: permissions,
      hasRequiredPermission: isLoading ? '(loading)' : hasPermission(permission),
      guardResult: isLoading ? '(loading)' : guardResult,
    })
  }

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">Checking access...</div>
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export { PermissionGuard }
