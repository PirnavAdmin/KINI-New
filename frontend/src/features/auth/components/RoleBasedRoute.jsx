import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { normalizeRole, ROLES } from '@shared/constants/roles'
import { getDashboardRouteForRole, getStoredRole, hasStoredSession, hasStoredSuperAdminSession } from '@shared/utils/authSession'

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation()
  const { role, isAuthenticated, loading, getDashboardRoute } = useAuth()
  const effectiveRole = normalizeRole(role || getStoredRole())
  const effectiveAuth = isAuthenticated || hasStoredSession()

  if (loading) {
    return <div className="flex h-dvh items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" /><span className="text-sm font-medium text-slate-400">Verifying access...</span></div></div>
  }
  const requiresSuperAdminSession = location.pathname.startsWith('/super-admin')
  if (!effectiveAuth || (requiresSuperAdminSession && !hasStoredSuperAdminSession())) {
    return <Navigate to={requiresSuperAdminSession ? "/super-admin/login" : "/login"} replace state={{ from: location }} />
  }

  const isAllowed = allowedRoles.map(normalizeRole).filter(Boolean).includes(effectiveRole)
  if (!isAllowed) {
    if (location.pathname === '/organization/ai-career-coach' && effectiveRole === ROLES.STUDENT) return <Navigate to="/student/ai-career-coach" replace state={{ from: location }} />
    return <Navigate to={getDashboardRouteForRole(effectiveRole, getDashboardRoute())} replace state={{ from: location }} />
  }
  return children || <Outlet />
}

export default RoleBasedRoute
export { RoleBasedRoute }
