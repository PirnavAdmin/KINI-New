import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { normalizeRole } from '@shared/constants/roles'
import { getDashboardRouteForRole, getStoredRole, getStoredUser, hasStoredSession } from '@shared/utils/authSession'

const LoadingSession = () => <div className="flex h-dvh items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" /></div>

const ProtectedRoute = ({ children, allowedRoles = [], requireOrganization = false }) => {
  const location = useLocation()
  const { authLoading, role } = useAuth()
  const storedRole = normalizeRole(role || getStoredRole())
  if (authLoading) return <LoadingSession />
  if (!hasStoredSession()) {
    const isOrganizationRoute = requireOrganization || location.pathname.startsWith('/organization')
    const isEmployeeRoute = location.pathname.startsWith('/employee')
      || location.pathname.startsWith('/hr')
    const loginPath = isOrganizationRoute
      ? '/organization/login'
      : isEmployeeRoute
        ? '/employee/login'
        : '/login'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }
  if (allowedRoles.length && !allowedRoles.map(normalizeRole).filter(Boolean).includes(storedRole)) {
    const roleDashboard = getDashboardRouteForRole(storedRole, '')
    return <Navigate to={roleDashboard || '/unauthorized'} replace state={{ from: location }} />
  }
  if (requireOrganization) {
    const storedUser = getStoredUser()
    const organizationId = localStorage.getItem('organization_id') || localStorage.getItem('organizationId') || storedUser?.organizationId || storedUser?.organisationId || storedUser?.organization?.id || storedUser?.organisation?.id
    if (!organizationId) return <Navigate to="/organization/login" replace state={{ from: location }} />
  }
  return children || <Outlet />
}

export default ProtectedRoute
export { ProtectedRoute }
