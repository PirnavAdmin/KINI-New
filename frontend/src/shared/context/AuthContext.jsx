import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { authService, decodeJwtPayload, redactAuthResponse } from "@shared/services/authService";
import { employeeProfileService } from "@shared/services/employeeProfileService";
import { resolveMentorIdentity } from "@shared/services/mentorIdentityService";
import { clearAuthentication } from "@shared/services/apiClient";
import { disableGoogleAutoSelect } from "@shared/services/googleIdentity";
import { normalizeRole, normalizeUserRole, USER_ROLES, ROLE_DASHBOARD_ROUTES } from "@shared/constants/roles";

const readStoredJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const getStoredSessionRole = () => normalizeRole(
  localStorage.getItem("user_role") || localStorage.getItem("role") || localStorage.getItem("userRole") || localStorage.getItem("selectedRole")
);

const readStoredUser = () => readStoredJson(
  getStoredSessionRole() === "super-admin" ? "superAdmin" : "user"
);

const hasValidStoredExpiration = () => {
  const expiration = localStorage.getItem("token_expiration") || localStorage.getItem("tokenExpiration");
  if (!expiration) return true;
  const timestamp = Date.parse(expiration);
  return Number.isNaN(timestamp) || timestamp > Date.now();
};

const findUserId = (user, response) =>
  user?.userId ?? user?.UserId ?? user?.userID ?? user?.user_id
  ?? user?.user?.userId ?? user?.user?.id
  ?? response?.userId ?? response?.UserId ?? response?.userID ?? response?.user_id
  ?? response?.data?.userId ?? response?.data?.UserId ?? response?.data?.userID
  ?? response?.data?.user_id ?? null;

// JWT claim URIs are namespaced (e.g. ".../claims/mentorId") — take the last
// path/URI segment so a plain "mentorId" name still matches. Mirrors the
// claimValue() lookup already used in Login.jsx's password-login path.
const claimFromToken = (token, name) => {
  if (!token) return undefined;
  const payload = decodeJwtPayload(token);
  return Object.entries(payload).find(([key]) =>
    key.toLowerCase().split(/[/:.]/).pop() === name.toLowerCase()
  )?.[1];
};

// Employee and organization IDs have different meanings.  Keep both values from
// the login response so mentor/employee screens never have to infer one from the
// other (or from a generic `id`). Also check the JWT claims and the tutorId/
// trainerId/employeeRecordId/staffId aliases Login.jsx's own password-login
// extraction and mentorSessionIdentity.js already treat as legitimate — the
// Google-login path doesn't run that extraction itself, so this is the only
// place those responses get picked up.
const findEmployeeId = (user, response, token) =>
  user?.employeeId ?? user?.EmployeeId ?? user?.employeeRecordId ?? user?.staffId
  ?? user?.employee?.employeeId ?? user?.employee?.id
  ?? response?.employeeId ?? response?.EmployeeId
  ?? response?.employee?.employeeId ?? response?.employee?.id
  ?? response?.data?.employeeId ?? response?.data?.EmployeeId
  ?? response?.data?.employee?.employeeId ?? response?.data?.employee?.id
  ?? claimFromToken(token, "employeeId") ?? claimFromToken(token, "employeeRecordId") ?? claimFromToken(token, "staffId")
  ?? null;

const findStudentId = (user, response) =>
  user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? user?.student?.id
  ?? response?.studentId ?? response?.StudentId ?? response?.student?.studentId ?? response?.student?.id
  ?? response?.data?.studentId ?? response?.data?.StudentId
  ?? response?.data?.student?.studentId ?? response?.data?.student?.id ?? null;

// Mentor.mentorId is a distinct backend field from Mentor.employeeId (Swagger-
// confirmed) — never interchangeable. A missed mentorId here silently falls
// back to employeeId at every call site, which queries a different/nonexistent
// mentor row (e.g. GET /api/v1/notifications/mentor/{id} returns a legitimate-
// looking empty list for the wrong id). Match findEmployeeId/findStudentId's
// coverage of both `user` and the raw `response`, not just the merged user.
const findMentorId = (user, response, token) =>
  user?.mentorId ?? user?.MentorId ?? user?.tutorId ?? user?.TutorId ?? user?.trainerId ?? user?.TrainerId
  ?? user?.mentor?.mentorId ?? user?.mentor?.id
  ?? response?.mentorId ?? response?.MentorId ?? response?.tutorId ?? response?.TutorId ?? response?.trainerId ?? response?.TrainerId
  ?? response?.mentor?.mentorId ?? response?.mentor?.id
  ?? response?.data?.mentorId ?? response?.data?.MentorId
  ?? response?.data?.mentor?.mentorId ?? response?.data?.mentor?.id
  ?? claimFromToken(token, "mentorId") ?? claimFromToken(token, "tutorId") ?? claimFromToken(token, "trainerId")
  ?? null;

const findOrganizationId = (user, response) =>
  user?.organizationId ?? user?.organisationId ?? user?.organization?.id ?? user?.organisation?.id
  ?? response?.organizationId ?? response?.organisationId
  ?? response?.organization?.id ?? response?.organization?.organizationId
  ?? response?.organisation?.id ?? response?.organisation?.organizationId
  ?? response?.data?.organizationId ?? response?.data?.organisationId
  ?? response?.data?.organization?.id ?? response?.data?.organization?.organizationId
  ?? response?.data?.organisation?.id ?? response?.data?.organisation?.organizationId ?? null;

const findOrganizationName = (user, response) =>
  user?.organizationName ?? user?.organisationName ?? user?.name
  ?? user?.organization?.organizationName ?? user?.organization?.name
  ?? response?.organizationName ?? response?.organisationName
  ?? response?.organization?.organizationName ?? response?.organization?.name
  ?? response?.organisation?.organizationName ?? response?.organisation?.name
  ?? response?.data?.organizationName ?? response?.data?.organisationName
  ?? response?.data?.organization?.organizationName ?? response?.data?.organization?.name
  ?? response?.data?.organisation?.organizationName ?? response?.data?.organisation?.name ?? null;

const findOrganizationEmail = (user, response) =>
  user?.organizationEmail ?? user?.email ?? response?.organizationEmail ?? response?.OrganizationEmail ?? response?.email ?? response?.Email
  ?? response?.data?.organizationEmail ?? response?.data?.OrganizationEmail ?? null;

const findRefreshToken = (user, response) =>
  user?.refreshToken ?? user?.refresh_token ?? response?.refreshToken ?? response?.RefreshToken
  ?? response?.refresh_token ?? response?.data?.refreshToken ?? response?.data?.RefreshToken
  ?? response?.data?.refresh_token ?? null;

const findSelectedRole = (user, response) =>
  user?.selectedRole ?? response?.selectedRole ?? response?.SelectedRole
  ?? response?.data?.selectedRole ?? response?.data?.SelectedRole ?? null;

const findRawRole = (user, response) =>
  user?.userRole ?? user?.role ?? response?.userRole ?? response?.UserRole
  ?? response?.selectedRole ?? response?.SelectedRole ?? response?.role ?? response?.Role
  ?? response?.data?.userRole ?? response?.data?.UserRole
  ?? response?.data?.selectedRole ?? response?.data?.SelectedRole
  ?? response?.data?.role ?? response?.data?.Role ?? null;

// Some login responses don't carry employeeId anywhere (top-level, nested
// user, or JWT claims) even for a real, backend-linked mentor/employee — the
// login endpoint just doesn't return it. GET /api/v1/employee-profile
// (employeeProfileService.getProfile(), auth-token-scoped: no id in the URL,
// resolves "my own" record) is the one already-wired candidate for filling
// that gap after the fact. Its exact response shape isn't confirmed against
// this backend, so this checks every plausible path defensively — the same
// style as findEmployeeId() above — rather than committing to one guess.
const extractEmployeeIdFromProfile = (profile) => {
  const data = profile?.data ?? profile;
  return data?.employeeId ?? data?.EmployeeId
    ?? data?.personalInfo?.employeeId ?? data?.personalInfo?.EmployeeId
    ?? data?.PersonalInfo?.employeeId ?? data?.PersonalInfo?.EmployeeId
    ?? data?.employee?.employeeId ?? data?.employee?.id
    ?? null;
};

const debugAuth = () => {};

const findExpiration = (user, response) =>
  user?.expiration ?? user?.tokenExpiration ?? response?.expiration ?? response?.Expiration
  ?? response?.data?.expiration ?? response?.data?.Expiration ?? null;

export const AuthProvider = ({ children }) => {
  const storedSessionIsValid = Boolean(
    (localStorage.getItem("organizationToken") || localStorage.getItem("auth_token") || localStorage.getItem("accessToken") || localStorage.getItem("token"))
    && localStorage.getItem("isAuthenticated") === "true" && hasValidStoredExpiration()
  );
  const [user, setUser] = useState(() => storedSessionIsValid ? readStoredUser() : null);
  const [token, setToken] = useState(() => storedSessionIsValid
    ? localStorage.getItem("organizationToken") || localStorage.getItem("auth_token") || localStorage.getItem("accessToken") || localStorage.getItem("token")
    : null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const snapshot = refreshAuth();

    if (import.meta.env.DEV && localStorage.getItem("debugAuth") === "true") {
      console.group("🛡 AuthProvider");
      console.debug("======== AUTH HYDRATION ========", snapshot);
      console.log("Token:", snapshot.token);
      console.log("Auth Token:", localStorage.getItem("token"));
      console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
      console.log("Stored User:", localStorage.getItem("user"));
      console.log("Role:", snapshot.role);
      console.log("storedSessionIsValid:", snapshot.isAuthenticated);
      console.groupEnd();
    }

    setAuthLoading(false);
    // Run once on mount to sync localStorage into context before guards render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback(({ token: nextToken, user: nextUser, response, rememberMe }) => {
    if (!nextToken || !String(nextToken).trim()) {
      throw new Error("Login succeeded, but no authentication token was returned.");
    }

    const safeUser = nextUser && typeof nextUser === "object" ? nextUser : {};
    const rawRole = findRawRole(safeUser, response);
    const normalizedRole = normalizeRole(
      rawRole ?? safeUser.role ?? response?.role ?? response?.userRole ?? response?.data?.role
    );
    const storedUser = normalizedRole ? { ...safeUser, role: normalizedRole } : safeUser;
    // Demo mode is session state, not a browser preference. A previous demo
    // login must never make a real organization render demo records.
    if (String(nextToken) === "demo-token") {
      localStorage.setItem("isDemo", "true");
    } else {
      localStorage.removeItem("isDemo");
      localStorage.removeItem("demo_permissions");
    }
    if (normalizeUserRole(rawRole) === USER_ROLES.HR) storedUser.userRole = USER_ROLES.HR;
    const isSuperAdminSession = normalizedRole === "super-admin";
    const userId = findUserId(storedUser, response);
    const employeeId = findEmployeeId(storedUser, response, nextToken);
    const studentId = findStudentId(storedUser, response);
    const mentorId = findMentorId(storedUser, response, nextToken);
    if (import.meta.env.DEV && (normalizedRole === "mentor" || normalizedRole === "employee")) {
      // JSON.stringify so the values print inline instead of behind a
      // collapsed "Object" reference that has to be expanded by hand.
      console.log(
        "[AuthContext] resolved IDs at login:",
        JSON.stringify({ userId, employeeId, mentorId, role: normalizedRole }, null, 2)
      );
      console.log(
        "[AuthContext] raw login response (tokens/passwords redacted):",
        JSON.stringify({ user: redactAuthResponse(storedUser), response: redactAuthResponse(response) }, null, 2)
      );
      if (employeeId !== null && employeeId !== undefined) {
        console.log("[AUTH IDENTITY RESOLVED]", { userId, employeeId, role: normalizedRole });
      } else {
        console.log("[AUTH IDENTITY ERROR]", {
          reason: "employeeId missing from login response",
          checkedPaths: "user.employeeId / user.EmployeeId / user.employeeRecordId / user.staffId / user.employee.{employeeId,id} / response equivalents / JWT claims (employeeId, employeeRecordId, staffId) — see findEmployeeId() above",
        });
      }
    }
    const organizationId = findOrganizationId(storedUser, response);
    const organizationName = findOrganizationName(storedUser, response);
    const organizationEmail = findOrganizationEmail(storedUser, response);
    const tokenExpiration = findExpiration(storedUser, response);
    const userEmail = storedUser.email ?? response?.email ?? response?.Email ?? response?.data?.email ?? null;
    const refreshToken = findRefreshToken(storedUser, response);
    const selectedRole = findSelectedRole(storedUser, response) || rawRole || normalizedRole || storedUser.role || null;
    const organization = storedUser.organization
      ?? response?.organization
      ?? response?.organisation
      ?? response?.data?.organization
      ?? response?.data?.organisation
      ?? null;

    localStorage.setItem("organizationToken", String(nextToken));
    localStorage.setItem("auth_token", String(nextToken));
    localStorage.setItem("accessToken", String(nextToken));
    localStorage.setItem("token", String(nextToken));
    localStorage.setItem("isAuthenticated", "true");
    if (isSuperAdminSession) {
      localStorage.setItem("superAdmin", JSON.stringify(storedUser));
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("user", JSON.stringify(storedUser));
      localStorage.removeItem("superAdmin");
    }
    if (normalizedRole) {
      localStorage.setItem("user_role", normalizedRole);
      localStorage.setItem("role", normalizedRole);
    }
    if (rawRole !== null && rawRole !== undefined && String(rawRole).trim()) {
      localStorage.setItem("userRole", String(rawRole));
    } else if (normalizedRole) {
      localStorage.setItem("userRole", normalizedRole);
    } else {
      localStorage.removeItem("userRole");
    }
    if (userId !== null && userId !== undefined && String(userId).trim()) {
      localStorage.setItem("userId", String(userId));
    } else {
      localStorage.removeItem("userId");
    }
    if (employeeId !== null && employeeId !== undefined && String(employeeId).trim()) {
      localStorage.setItem("employeeId", String(employeeId));
    } else {
      localStorage.removeItem("employeeId");
    }
    if (studentId !== null && studentId !== undefined && String(studentId).trim()) {
      localStorage.setItem("studentId", String(studentId));
    } else {
      localStorage.removeItem("studentId");
    }
    if (mentorId !== null && mentorId !== undefined && String(mentorId).trim()) {
      localStorage.setItem("mentorId", String(mentorId));
    } else {
      localStorage.removeItem("mentorId");
    }
    if (organizationId !== null && organizationId !== undefined && String(organizationId).trim()) {
      localStorage.setItem("organization_id", String(organizationId));
      localStorage.setItem("organizationId", String(organizationId));
    } else {
      localStorage.removeItem("organization_id");
      localStorage.removeItem("organizationId");
    }
    if (organizationName !== null && organizationName !== undefined && String(organizationName).trim()) {
      localStorage.setItem("organization_name", String(organizationName));
      localStorage.setItem("organizationName", String(organizationName));
    } else {
      localStorage.removeItem("organization_name");
      localStorage.removeItem("organizationName");
    }
    if (organizationEmail !== null && organizationEmail !== undefined && String(organizationEmail).trim()) {
      localStorage.setItem("organizationEmail", String(organizationEmail));
    } else {
      localStorage.removeItem("organizationEmail");
    }
    if (refreshToken !== null && refreshToken !== undefined && String(refreshToken).trim()) {
      localStorage.setItem("refreshToken", String(refreshToken));
    } else {
      localStorage.removeItem("refreshToken");
    }
    if (selectedRole !== null && selectedRole !== undefined && String(selectedRole).trim()) {
      localStorage.setItem("selectedRole", String(selectedRole));
    } else {
      localStorage.removeItem("selectedRole");
    }
    if (organization && typeof organization === "object") {
      localStorage.setItem("organization", JSON.stringify(organization));
    } else {
      localStorage.removeItem("organization");
    }
    if (userEmail !== null && userEmail !== undefined && String(userEmail).trim()) {
      localStorage.setItem("user_email", String(userEmail));
    } else {
      localStorage.removeItem("user_email");
    }
    if (tokenExpiration !== null && tokenExpiration !== undefined && String(tokenExpiration).trim()) {
      localStorage.setItem("token_expiration", String(tokenExpiration));
      localStorage.setItem("tokenExpiration", String(tokenExpiration));
    } else {
      localStorage.removeItem("token_expiration");
      localStorage.removeItem("tokenExpiration");
    }
    if (rememberMe !== undefined) {
      localStorage.setItem("remember_me", String(Boolean(rememberMe)));
      localStorage.setItem("rememberMe", String(Boolean(rememberMe)));
    }

    setToken(String(nextToken));
    setUser(storedUser);
    debugAuth("======== LOGIN SESSION STORED ========", {
      token: nextToken,
      role: normalizedRole || rawRole || storedUser?.role || null,
      userRole: rawRole || null,
      selectedRole,
      user: storedUser,
      organization,
    });
    return storedUser;
  }, []);

  const login = useCallback((session) => persistSession(session), [persistSession]);

  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem("organizationToken")
      || localStorage.getItem("auth_token")
      || localStorage.getItem("accessToken")
      || localStorage.getItem("token");
    try {
      if (currentToken) await authService.logout();
    } catch {
      // Always clear local auth state even if the server session is already gone.
    } finally {
      clearAuthentication();
      // Also stop GIS from auto-selecting this account on the next visit —
      // otherwise a returning user could get silently signed back in without
      // ever seeing the account chooser.
      disableGoogleAutoSelect();
      setToken(null);
      setUser(null);
      debugAuth("======== AUTH LOGOUT ========", { token: null, user: null, role: null });
    }
  }, []);

  const refreshAuth = useCallback(() => {
    const nextToken = localStorage.getItem("organizationToken")
      || localStorage.getItem("auth_token")
      || localStorage.getItem("accessToken")
      || localStorage.getItem("token");
    const storedRole = getStoredSessionRole();
    const storedSuperAdmin = storedRole === "super-admin" ? readStoredJson("superAdmin") : null;
    const hasScopedSuperAdmin = storedRole !== "super-admin"
      || Boolean(storedSuperAdmin?.identityVerifiedFromLogin);
    if (storedRole === "super-admin" && !hasScopedSuperAdmin) {
      clearAuthentication();
    }
    const isStoredAuthenticated = Boolean(nextToken && localStorage.getItem("isAuthenticated") === "true" && hasScopedSuperAdmin && hasValidStoredExpiration());
    const nextUser = isStoredAuthenticated ? readStoredUser() : null;

    if (nextToken && nextToken !== "demo-token") {
      localStorage.removeItem("isDemo");
      localStorage.removeItem("demo_permissions");
    }

    setToken(isStoredAuthenticated ? nextToken : null);
    setUser(nextUser);

    const snapshot = {
      token: isStoredAuthenticated ? nextToken : null,
      user: nextUser,
      isAuthenticated: isStoredAuthenticated,
      role: normalizeRole(
        nextUser?.role || storedRole
      ),
    };
    debugAuth("======== AUTH REFRESH ========", snapshot);
    return snapshot;
  }, []);

  const updateStoredUser = useCallback((nextUser) => {
    setUser((current) => {
      const merged = { ...(current || {}), ...(nextUser || {}) };
      const storageKey = normalizeRole(merged.role || getStoredSessionRole()) === "super-admin"
        ? "superAdmin"
        : "user";
      localStorage.setItem(storageKey, JSON.stringify(merged));
      const nextRole = normalizeRole(merged.role);
      if (nextRole) {
        localStorage.setItem("user_role", nextRole);
        localStorage.setItem("role", nextRole);
        localStorage.setItem("userRole", merged.userRole ? String(merged.userRole) : nextRole);
      }
      if (merged.userRole !== undefined) {
        localStorage.setItem("userRole", String(merged.userRole));
      }
      if (merged.selectedRole !== undefined) {
        localStorage.setItem("selectedRole", String(merged.selectedRole));
      }
      return merged;
    });
  }, []);

  const refreshProfile = useCallback(async (requestedUserId) => {
    const id = requestedUserId || user?.userId || user?.id || localStorage.getItem("userId");
    if (!id) throw new Error("User ID is required.");
    const profile = await authService.getProfile(id);
    updateStoredUser(profile);
    return profile;
  }, [updateStoredUser, user]);

  const role = normalizeRole(
    user?.role
      || localStorage.getItem("user_role")
      || localStorage.getItem("role")
      || localStorage.getItem("userRole")
      || localStorage.getItem("selectedRole")
  );

  const isAuthenticated = Boolean(token && localStorage.getItem("isAuthenticated") === "true");

  // Fallback identity enrichment: some logins never carry employeeId anywhere
  // (top-level response, nested user, or JWT). Without it, usePermission.js
  // has no employeeId to call GET /api/Permission/employees/{id} with, so it
  // calls GET /api/Permission/roles/{role} instead — the ROLE's default
  // permissions, not this specific employee's Organization > Employee Access
  // overrides. That is how a module an admin explicitly disabled for one
  // mentor (e.g. Dashboard) can still show up: the override was never
  // fetched, so the role default (which may have it enabled) wins by
  // default. `employeeIdResolving` lets usePermission.js hold off on
  // resolving permissions at all until this attempt has actually finished,
  // instead of momentarily authorizing against the wrong (role-level) source.
  //
  // Two sources are tried, in order: GET /api/v1/employee-profile (auth-
  // scoped "my own record"), then GET /api/Auth/profile/{userId} — the same
  // endpoint Login.jsx's own password-login path already calls for this
  // exact reason, so it's proven-relevant when this effect fires outside
  // that flow (OAuth login, or a session restored from localStorage).
  const [employeeIdResolving, setEmployeeIdResolving] = useState(false);
  const employeeIdEnrichmentAttempted = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) {
      employeeIdEnrichmentAttempted.current = false;
      setEmployeeIdResolving(false);
      return undefined;
    }
    if (role !== "mentor" && role !== "employee") {
      setEmployeeIdResolving(false);
      return undefined;
    }
    const alreadyResolved = user?.employeeId ?? user?.EmployeeId
      ?? user?.employee?.employeeId ?? user?.employee?.id
      ?? localStorage.getItem("employeeId");
    if (alreadyResolved || employeeIdEnrichmentAttempted.current) {
      setEmployeeIdResolving(false);
      return undefined;
    }
    employeeIdEnrichmentAttempted.current = true;
    setEmployeeIdResolving(true);

    const userId = user?.userId ?? user?.UserId ?? user?.id ?? localStorage.getItem("userId");

    let active = true;
    employeeProfileService.getProfile()
      .then((profile) => extractEmployeeIdFromProfile(profile))
      .catch(() => null)
      .then((viaEmployeeProfile) => {
        if (!active) return null;
        if (viaEmployeeProfile !== null && viaEmployeeProfile !== undefined && String(viaEmployeeProfile).trim()) {
          return { source: "/api/v1/employee-profile", resolvedEmployeeId: viaEmployeeProfile };
        }
        if (!userId) return { source: null, resolvedEmployeeId: null };
        return authService.getProfile(userId)
          .then((profile) => {
            const data = profile?.data && typeof profile.data === "object" ? profile.data : profile;
            const resolvedEmployeeId = data?.employeeId ?? data?.EmployeeId
              ?? data?.employee?.employeeId ?? data?.employee?.id ?? null;
            return { source: "/api/Auth/profile/{userId}", resolvedEmployeeId };
          })
          .catch(() => ({ source: "/api/Auth/profile/{userId}", resolvedEmployeeId: null, failed: true }));
      })
      .then((result) => {
        if (!active || !result) return;
        const { source, resolvedEmployeeId, failed } = result;
        if (import.meta.env.DEV) {
          console.log("[AUTH IDENTITY ENRICHMENT]", { field: "employeeId", source, resolvedEmployeeId, failed: Boolean(failed) });
          if (!resolvedEmployeeId) {
            console.log("[AUTH IDENTITY ERROR]", {
              reason: "employeeId missing from login response, JWT, /api/v1/employee-profile, and /api/Auth/profile/{userId}",
            });
          }
        }
        if (resolvedEmployeeId !== null && resolvedEmployeeId !== undefined && String(resolvedEmployeeId).trim()) {
          localStorage.setItem("employeeId", String(resolvedEmployeeId));
          updateStoredUser({ employeeId: resolvedEmployeeId });
        }
      })
      .finally(() => {
        if (active) setEmployeeIdResolving(false);
      });
    return () => { active = false; employeeIdEnrichmentAttempted.current = false; };
  }, [isAuthenticated, role, user, updateStoredUser]);

  // Resolve the workspace even when login already supplied an employee ID.
  const workspaceUserId = user?.userId ?? user?.UserId ?? user?.id;
  const workspaceKey = isAuthenticated && role === 'employee' && token
    ? `${token}:${workspaceUserId ?? ''}` : null;
  const [resolvedWorkspaceKey, setResolvedWorkspaceKey] = useState(null);
  const employeeProfileResolving = Boolean(workspaceKey && resolvedWorkspaceKey !== workspaceKey);
  useEffect(() => {
    if (!workspaceKey) return undefined;
    let active = true;
    employeeProfileService.getProfile().then((profile) => {
      if (active && profile && typeof profile === 'object') {
        // Preserve the authenticated role/IDs; profile data selects the
        // workspace and does not grant any module permissions.
        updateStoredUser({ workspaceProfile: profile });
      }
    }).catch(() => {
      // Keep the login identity if the optional profile service is unavailable.
    }).finally(() => { if (active) setResolvedWorkspaceKey(workspaceKey); });
    return () => { active = false; };
  }, [workspaceKey, updateStoredUser]);

  const [mentorIdResolving, setMentorIdResolving] = useState(false);
  const [mentorIdResolutionError, setMentorIdResolutionError] = useState(null);
  const [mentorIdentityRevision, setMentorIdentityRevision] = useState(0);
  const retryMentorIdentity = useCallback(() => {
    setMentorIdResolving(true);
    setMentorIdResolutionError(null);
    setMentorIdentityRevision((value) => value + 1);
  }, []);
  const sessionUserId = user?.userId ?? user?.UserId ?? user?.id ?? localStorage.getItem("userId");
  const sessionEmployeeId = user?.employeeId ?? user?.EmployeeId ?? localStorage.getItem("employeeId");
  const sessionOrganizationId = user?.organizationId ?? user?.OrganizationId ?? localStorage.getItem("organizationId");
  const sessionEmail = user?.email ?? user?.Email;
  const sessionMentorId = findMentorId(user, null, token) ?? localStorage.getItem("mentorId");

  useEffect(() => {
    if (!isAuthenticated || role !== "mentor" || sessionMentorId) {
      setMentorIdResolving(false);
      setMentorIdResolutionError(null);
      return undefined;
    }
    let active = true;
    setMentorIdResolving(true);
    setMentorIdResolutionError(null);
    resolveMentorIdentity({
      userId: sessionUserId,
      employeeId: sessionEmployeeId,
      organizationId: sessionOrganizationId,
      email: sessionEmail,
    }).then((mentorId) => {
      if (!active) return;
      if (mentorId !== null && mentorId !== undefined && String(mentorId).trim()) {
        localStorage.setItem("mentorId", String(mentorId));
        updateStoredUser({ mentorId });
      }
    }).catch((error) => {
      if (active) setMentorIdResolutionError({ status: error?.response?.status ?? null });
    }).finally(() => {
      if (active) setMentorIdResolving(false);
    });
    // Cancel stale responses while allowing StrictMode and identity changes to restart.
    return () => { active = false; };
  }, [isAuthenticated, role, token, sessionUserId, sessionEmployeeId, sessionOrganizationId,
    sessionEmail, sessionMentorId, mentorIdentityRevision, updateStoredUser]);

  const getDashboardRoute = useCallback(
    () => ROLE_DASHBOARD_ROUTES[role] || "/dashboard",
    [role]
  );

  const value = useMemo(() => ({
    user,
    token,
    role,
    isAuthenticated,
    authLoading,
    loading: authLoading,
    mentorIdResolving,
    mentorIdResolutionError,
    retryMentorIdentity,
    employeeIdResolving,
    employeeProfileResolving,
    login,
    register,
    logout,
    refreshAuth,
    updateStoredUser,
    updateUser: updateStoredUser,
    refreshProfile,
    getDashboardRoute,
    isEmployee: role === "employee",
    isMentor: role === "mentor",
    isAdmin: role === "admin",
    isOrganization: role === "org-admin",
    isSuperAdmin: role === "super-admin",
    superAdmin: role === "super-admin" ? user : null,
    isStudent: role === "student",
  }), [retryMentorIdentity, authLoading, employeeIdResolving, employeeProfileResolving, getDashboardRoute, isAuthenticated, login, logout, mentorIdResolutionError, mentorIdResolving, refreshAuth, refreshProfile, register, role, token, updateStoredUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
