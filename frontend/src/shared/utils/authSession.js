import { ROUTES } from "@shared/constants/routeConstants";
import { normalizeRole, ROLE_DASHBOARD_ROUTES } from "@shared/constants/roles";

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem("organizationToken")
  || localStorage.getItem("auth_token")
  || localStorage.getItem("accessToken")
  || localStorage.getItem("token");

const getExplicitStoredRole = () => normalizeRole(
  localStorage.getItem("user_role")
    || localStorage.getItem("role")
    || localStorage.getItem("userRole")
    || localStorage.getItem("selectedRole")
);

export const getStoredUser = () => readJson(getExplicitStoredRole() === "super-admin" ? "superAdmin" : "user");

export const getStoredRole = () => getExplicitStoredRole()
  || normalizeRole(getStoredUser()?.role);

export const hasStoredSession = () => Boolean(getStoredToken() && localStorage.getItem("isAuthenticated") === "true");

export const hasStoredSuperAdminSession = () => hasStoredSession()
  && getStoredRole() === "super-admin"
  && Boolean(readJson("superAdmin"));

export const getSessionSnapshot = () => ({
  token: getStoredToken(),
  isAuthenticated: hasStoredSession(),
  role: getStoredRole(),
  user: getStoredUser(),
  refreshToken: localStorage.getItem("refreshToken"),
  organizationEmail: localStorage.getItem("organizationEmail"),
  tokenExpiration: localStorage.getItem("tokenExpiration") || localStorage.getItem("token_expiration"),
});

export const getDashboardRouteForRole = (role, fallback = "/dashboard") => {
  const normalizedRole = normalizeRole(role);
  return ROLE_DASHBOARD_ROUTES[normalizedRole] || fallback;
};

export const getRoleBasePath = (role) => {
  const dashboardRoute = getDashboardRouteForRole(role, "");
  if (!dashboardRoute) return "";
  return dashboardRoute.replace(/\/dashboard$/, "");
};

export const getAuthRedirectRoute = (role) => {
  const normalizedRole = normalizeRole(role);
  return getDashboardRouteForRole(normalizedRole, ROUTES.SUPER_ADMIN.DASHBOARD);
};
