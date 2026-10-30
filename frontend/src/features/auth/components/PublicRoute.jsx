import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import { getDashboardRouteForRole, getStoredRole, hasStoredSession } from "@shared/utils/authSession";

/**
 * PublicRoute redirects authenticated users away from auth pages
 * to their role-appropriate dashboard.
 */
const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading, role, getDashboardRoute } = useAuth();

  const effectiveAuth = isAuthenticated || hasStoredSession();
  const effectiveRole = role || getStoredRole();
  // Allow an intentional role switch after enrollment even when an
  // organization session is still present in this browser.
  const allowRoleSwitch = location.state?.allowRoleSwitch === true;

  if (import.meta.env.DEV) {
    console.debug("======== PUBLIC ROUTE ========", {
      currentRoute: location.pathname,
      currentRole: effectiveRole || null,
      isAuthenticated: effectiveAuth,
      loading,
      dashboardRoute: getDashboardRoute(),
      decision: loading && !hasStoredSession()
        ? "loading"
        : effectiveAuth && !allowRoleSwitch
          ? "redirect:dashboard"
          : "allow",
    });
  }

  if (loading && !hasStoredSession()) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          <span className="text-sm font-medium text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (effectiveAuth && !allowRoleSwitch) {
    const redirectTo = getDashboardRouteForRole(
      effectiveRole,
      getDashboardRoute() || ROUTES.SUPER_ADMIN.DASHBOARD
    );

    if (redirectTo === location.pathname) {
      return children || <Outlet />;
    }

    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children || <Outlet />;
};

export default PublicRoute;

// eslint-disable-next-line react-refresh/only-export-components
export { PublicRoute };
