import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { normalizeRole, ROLES } from '@shared/constants/roles'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'

/** Keeps direct HR URLs aligned with the assigned module permissions. */
export default function HrRouteGuard({ module, action = 'view', allowOrganizationAdmin = false, children }) {
  const { role, user } = useAuth()
  const { can, canAccessModule, isLoading } = useHrPermissions()
  const resolvedRole = normalizeRole(user?.userRole ?? user?.role ?? role)
  const isOrganizationAdmin = role === ROLES.ORG_ADMIN || resolvedRole === ROLES.ORG_ADMIN
  const allowed = (allowOrganizationAdmin && isOrganizationAdmin)
    || (action === 'view' ? canAccessModule(module) : can(module, action))

  if (isLoading) return <p role="status">Loading permissions...</p>

  if (!allowed) {
    return <Navigate to="/unauthorized" replace state={{ status: 403, module, action }} />
  }

  return children
}
