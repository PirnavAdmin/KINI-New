import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Sun, Moon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { useAuth } from "@shared/hooks/useAuth";
import { normalizeRole, ROLES, ROLE_DASHBOARD_ROUTES } from "@shared/constants/roles";
import { authService, decodeJwtPayload } from "@shared/services/authService";
import { requestGoogleCredential, decodeGoogleCredential } from "@shared/services/googleIdentity";
import { clearAuthentication } from "@shared/services/apiClient";
import { toApiRole } from "@shared/services/authApi";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { toast } from "sonner";
import { isHrModuleUser } from "@features/hr/constants/hrPermissions";
 
import AuthHero from "../../components/AuthHero";
import LoginForm from "../../components/LoginForm";
import HeroBackground from "../../components/HeroBackground";
import GrainOverlay from "../../components/GrainOverlay";
import GlowOrb from "../../components/GlowOrb";
import WelcomeIntro from "../../components/WelcomeIntro";
 
const ROLE_TO_AUTH_ROLE = {
  student: ROLES.STUDENT,
  organization: ROLES.ORG_ADMIN,
  employee: ROLES.EMPLOYEE,
  mentor: ROLES.MENTOR,
  "super-admin": ROLES.SUPER_ADMIN,
};
 
const REGISTERED_ROLE_CONFIG = {
  Student: { forcedRole: "student", title: "Student Login", subtitle: "Welcome back, Student!" },
  Employee: { forcedRole: "employee", title: "Employee Login", subtitle: "Welcome back, Employee!" },
  Mentor: { forcedRole: "mentor", title: "Mentor Login", subtitle: "Welcome back, Mentor!" },
  Organization: { forcedRole: "organization", title: "Organization Login", subtitle: "Welcome back, Organization!" },
};
 
export default function Login({
  forcedRole = "student",
  title = "Student Login",
  subtitle,
  registerLabel,
  registerTo,
  showFooter,
  infoMessage,
  redirectPath,
  useOrganizationLoginEndpoint = false,
} = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle: toggleTheme } = useThemeContext();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  // Checkout sign-in is a continuation step; don't cover its instructions
  // with the regular login welcome animation.
  const [showIntro, setShowIntro] = useState(() => !location.state?.enrollmentReturnTo);
 
  // ── Override props based on registered role from registration flow ──
  const isStudentLoginRoute = location.pathname === "/login";
  const registeredRole = location.state?.registeredRole;
  const roleConfig = !isStudentLoginRoute && registeredRole ? REGISTERED_ROLE_CONFIG[registeredRole] : null;
  const effectiveForcedRole = isStudentLoginRoute ? "student" : (roleConfig?.forcedRole || forcedRole);
  const effectiveTitle = isStudentLoginRoute ? "Login" : (roleConfig?.title || title);
  const effectiveSubtitle = isStudentLoginRoute
    ? (subtitle || "Sign in to continue your learning journey")
    : (roleConfig?.subtitle || subtitle);
  const recoveryReturnTo = {
    mentor: "/mentor/login",
    employee: "/employee/login",
    organization: "/organization/login",
    "org-admin": "/organization/login",
    "super-admin": "/super-admin/login",
  }[effectiveForcedRole] || location.pathname;
 
  const clearError = useCallback(() => setErrorMessage(""), []);
  const debugAuth = useCallback((label, payload) => {
    if (import.meta.env.DEV) {
      console.debug(label, payload);
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log(`LOGIN COMPONENT: ${String(effectiveForcedRole || "student").toUpperCase()} LOGIN`);
  }, [effectiveForcedRole]);
 
  const handleLogin = useCallback(
    async ({ email, password, remember }) => {
      clearError();
      const authRole = ROLE_TO_AUTH_ROLE[effectiveForcedRole] || effectiveForcedRole;
      const identifier = String(email || "").trim().toLowerCase();
      const isEmailIdentifier = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isPhoneIdentifier = /^\+?\d{10,15}$/.test(identifier);
      // Select the organization endpoint from the resolved role too. This
      // prevents route/state-driven renders from falling back to /api/Auth/login
      // when an optional wrapper prop is accidentally omitted.
      const normalizedLoginRole = normalizeRole(effectiveForcedRole);
      const isOrganizationLogin = Boolean(useOrganizationLoginEndpoint)
        || normalizedLoginRole === ROLES.ORG_ADMIN;
 
      if (!identifier) {
        const message = isOrganizationLogin ? "Email is required." : "Email or phone is required.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (isOrganizationLogin ? !isEmailIdentifier : (!isEmailIdentifier && !isPhoneIdentifier)) {
        const message = isOrganizationLogin
          ? "Enter a valid email address."
          : "Enter a valid email address or phone number.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (!password) {
        setErrorMessage("Password is required.");
        toast.error("Password is required.");
        return;
      }
      if (password.length < 8) {
        setErrorMessage("Password must contain at least 8 characters.");
        toast.error("Password must contain at least 8 characters.");
        return;
      }
 
      setIsLoggingIn(true);
      try {
        const requestBody = isOrganizationLogin
          ? {
              email: identifier,
              password,
            }
          : null;
        if (isOrganizationLogin) {
          debugAuth("========== ORGANIZATION LOGIN REQUEST ==========", {
            endpoint: "POST /api/v1/organization/login",
            email: identifier,
          });
        }
 
        const response = isOrganizationLogin
          ? await authService.loginOrganization(requestBody)
          : effectiveForcedRole === "student"
            ? await authService.loginStudent({
                identifier,
                password,
                rememberMe: Boolean(remember),
              })
            : await authService.login({
              identifier,
              password,
              selectedRole: toApiRole(authRole),
              rememberMe: Boolean(remember),
            });
        const nested = response?.data && typeof response.data === "object" ? response.data : {};
        const responseError = response?.error || response?.Error || nested?.error || nested?.Error;
        const responseSucceeded = response?.success ?? response?.Success ?? nested?.success ?? nested?.Success;
        debugAuth("======== LOGIN RESPONSE ========", {
          hasToken: Boolean(response?.token || response?.Token || response?.accessToken || response?.AccessToken
            || response?.jwtToken || response?.JwtToken || nested.token || nested.Token
            || nested.accessToken || nested.AccessToken || nested.jwtToken || nested.JwtToken),
          role: response?.role || response?.Role || nested?.role || nested?.Role,
          selectedRole: response?.selectedRole || response?.SelectedRole || nested?.selectedRole || nested?.SelectedRole || authRole,
          user: response?.user || response?.User || response?.userDetails || response?.UserDetails
            || response?.organization || response?.Organization || nested.user || nested.User
            || nested.userDetails || nested.UserDetails || nested.organization || nested.Organization || null,
          organization: response?.organization || response?.Organization || nested?.organization || nested?.Organization || null,
        });
        if (responseError || responseSucceeded === false) {
          const message = String(responseError || response?.message || response?.Message || nested?.message || nested?.Message || "Login failed.")
            .split(/\r?\n/)[0]
            .trim();
          throw new Error(message);
        }
        const token = response?.token || response?.Token || response?.accessToken || response?.AccessToken
          || response?.jwtToken || response?.JwtToken || nested.token || nested.Token
          || nested.accessToken || nested.AccessToken || nested.jwtToken || nested.JwtToken;
        const returnedUser = response?.user || response?.User || response?.userDetails || response?.UserDetails
          || response?.organization || response?.Organization || nested.user || nested.User
          || nested.userDetails || nested.UserDetails || nested.organization || nested.Organization || {};
 
        if (!token || !String(token).trim()) {
          setErrorMessage("Login succeeded, but the authentication token was not returned.");
          return;
        }
 
        if (isOrganizationLogin) {
          const organizationId = response?.organizationId ?? response?.OrganizationId
            ?? nested?.organizationId ?? nested?.OrganizationId ?? null;
          const organizationName = response?.organizationName ?? response?.OrganizationName
            ?? nested?.organizationName ?? nested?.OrganizationName ?? "";
          const organizationEmail = response?.email ?? response?.Email
            ?? nested?.email ?? nested?.Email ?? identifier;
          const expiration = response?.expiration ?? response?.Expiration
            ?? nested?.expiration ?? nested?.Expiration ?? "";
          const organizationRole = normalizeRole(
            response?.role ?? response?.Role ?? response?.userRole ?? response?.UserRole
            ?? nested?.role ?? nested?.Role ?? nested?.userRole ?? nested?.UserRole ?? "organization"
          );
          const storedUser = {
            organizationId,
            organizationName,
            email: organizationEmail,
            expiration,
            role: organizationRole,
            userRole: organizationRole,
          };
 
          flushSync(() => {
            login({
              token,
              user: storedUser,
              response: {
                ...response,
                organizationId,
                organizationName,
                email: organizationEmail,
                expiration,
                userRole: organizationRole,
                selectedRole: organizationRole,
                role: organizationRole,
                user: storedUser,
              },
              rememberMe: remember,
            });
          });
 
          debugAuth("========== ORGANIZATION LOGIN RESPONSE ==========", {
            message: response?.message || response?.Message || nested?.message || nested?.Message || "Login successful.",
            organizationId,
            organizationName,
            email: organizationEmail,
            hasToken: Boolean(token),
            expiration,
          });
          debugAuth("========== AUTH STATE ==========", {
            isAuthenticated: true,
            role: organizationRole,
            currentRoute: location.pathname,
          });
          toast.success(response?.message || "Login successful", { duration: 1200 });
          navigate("/organization/dashboard", { replace: true, state: { from: location.pathname } });
          setIsLoggingIn(false);
          return;
        }
 
        let rawRole = returnedUser?.role || returnedUser?.roleName || response?.role || response?.roleName
          || nested?.role || nested?.roleName;
        const userId = returnedUser?.userId || returnedUser?.UserId
          || returnedUser?.userID || returnedUser?.user_id
          || returnedUser?.user?.userId || returnedUser?.user?.id
          || response?.userId || response?.UserId || response?.userID || response?.user_id
          || response?.user?.userId || response?.user?.id
          || nested?.userId || nested?.UserId || nested?.userID || nested?.user_id
          || nested?.user?.userId || nested?.user?.id;
        let organizationId = returnedUser?.organizationId || returnedUser?.organisationId
          || returnedUser?.OrganizationId || returnedUser?.OrganisationId
          || returnedUser?.organization?.id || returnedUser?.organisation?.id
          || response?.organizationId || response?.organisationId || response?.OrganizationId || response?.OrganisationId
          || nested?.organizationId || nested?.organisationId || nested?.OrganizationId || nested?.OrganisationId;
        let profile = null;
        let profileData = null;
        let userRole = normalizeRole(rawRole);
        const tokenClaims = decodeJwtPayload(token);
        const claimValue = (name) => Object.entries(tokenClaims).find(([key]) =>
          key.toLowerCase().split(/[/:.]/).pop() === name.toLowerCase()
        )?.[1];
        const returnedMentorId = returnedUser?.mentorId ?? returnedUser?.MentorId
          ?? returnedUser?.tutorId ?? returnedUser?.TutorId ?? returnedUser?.trainerId ?? returnedUser?.TrainerId
          ?? returnedUser?.mentor?.mentorId ?? returnedUser?.mentor?.id
          ?? claimValue("mentorId") ?? claimValue("tutorId") ?? claimValue("trainerId");
        const returnedEmployeeId = returnedUser?.employeeId ?? returnedUser?.EmployeeId
          ?? returnedUser?.employeeRecordId ?? returnedUser?.staffId
          ?? returnedUser?.employee?.employeeId ?? returnedUser?.employee?.id
          ?? response?.employeeId ?? response?.EmployeeId
          ?? response?.employee?.employeeId ?? response?.employee?.id
          ?? nested?.employeeId ?? nested?.EmployeeId
          ?? nested?.employee?.employeeId ?? nested?.employee?.id
          ?? claimValue("employeeId") ?? claimValue("employeeRecordId") ?? claimValue("staffId");
        const returnedStudentId = returnedUser?.studentId ?? returnedUser?.StudentId
          ?? returnedUser?.student?.studentId ?? returnedUser?.student?.id
          ?? response?.studentId ?? response?.StudentId
          ?? nested?.studentId ?? nested?.StudentId
          ?? claimValue("studentId");

        if (userId && (!userRole
          || (userRole === "mentor" && (!returnedMentorId || !returnedEmployeeId))
          || (userRole === "student" && !returnedStudentId))) {
          profile = await authService.getProfile(userId, token);
          profileData = profile?.data && typeof profile.data === "object" ? profile.data : profile;
          organizationId = profileData?.organizationId || profileData?.organisationId
            || profileData?.organization?.id || profileData?.organisation?.id;
          rawRole = profileData?.role || profileData?.roleName || profileData?.userRole || rawRole;
          userRole = normalizeRole(rawRole);
        }
 
        if (!userRole) {
          throw new Error("Login response did not include a supported authenticated role.");
        }

        const enrollmentReturnTo = location.state?.enrollmentReturnTo;
        const validEnrollmentReturnTo = typeof enrollmentReturnTo === "string"
          && /^\/enrollment(?:[/?#]|$)/.test(enrollmentReturnTo)
          ? enrollmentReturnTo
          : null;
        if (validEnrollmentReturnTo && userRole !== ROLES.STUDENT) {
          throw new Error("Please sign in with a student account to continue this enrollment.");
        }
 
        const loginEmail = isEmailIdentifier ? String(identifier).trim().toLowerCase() : "";
        const returnedEmail = String(
          returnedUser.email || returnedUser.Email || response?.email || response?.Email || "",
        ).trim().toLowerCase();
        const superAdminIdentityMismatch = userRole === "super-admin"
          && loginEmail
          && returnedEmail
          && returnedEmail !== loginEmail;
        const loginEmailName = loginEmail
          .split("@")[0]
          .split(/[._-]+/)
          .filter(Boolean)
          .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
          .join(" ");

        const storedUser = {
          ...returnedUser,
          ...(profileData && typeof profileData === "object" ? profileData : {}),
          studentId: returnedUser?.studentId ?? returnedUser?.StudentId
            ?? returnedUser?.student?.studentId ?? returnedUser?.student?.id
            ?? profileData?.studentId ?? profileData?.StudentId
            ?? profileData?.student?.studentId ?? profileData?.student?.id
            ?? response?.studentId ?? response?.StudentId
            ?? response?.student?.studentId ?? response?.student?.id
            ?? nested?.studentId ?? nested?.StudentId
            ?? nested?.student?.studentId ?? nested?.student?.id
            ?? claimValue("studentId") ?? null,
          mentorId: returnedMentorId
            ?? profileData?.mentorId ?? profileData?.MentorId
            ?? profileData?.mentor?.mentorId ?? profileData?.mentor?.id
            ?? response?.mentorId ?? response?.MentorId
            ?? response?.mentor?.mentorId ?? response?.mentor?.id
            ?? nested?.mentorId ?? nested?.MentorId
            ?? nested?.mentor?.mentorId ?? nested?.mentor?.id
            ?? claimValue("mentorId") ?? null,
          employeeId: returnedEmployeeId
            ?? profileData?.employeeId ?? profileData?.EmployeeId
            ?? profileData?.employee?.employeeId ?? profileData?.employee?.id
            ?? null,
          email: returnedUser.email || returnedUser.Email || response?.email || response?.Email || (isEmailIdentifier ? identifier : ""),
          phone: returnedUser.phone || returnedUser.Phone || response?.phone || response?.Phone || (isPhoneIdentifier ? identifier : ""),
          organizationName: returnedUser.organizationName || returnedUser.OrganizationName
            || returnedUser.name || returnedUser.Name || response?.organizationName
            || response?.OrganizationName || nested?.organizationName || nested?.OrganizationName,
          userId,
          organizationId,
          expiration: response?.expiration || response?.Expiration || nested?.expiration || nested?.Expiration,
          roleName: profileData?.roleName ?? returnedUser?.roleName ?? rawRole,
          role: userRole,
          ...(userRole === "super-admin" ? {
            // The credentials entered for this successful login identify the
            // active account. Never retain another Super Admin's stale profile.
            email: loginEmail || returnedEmail,
            identityVerifiedFromLogin: true,
            ...(superAdminIdentityMismatch ? {
              firstName: loginEmailName || "Super Admin",
              lastName: "",
              fullName: loginEmailName || "Super Admin",
              name: loginEmailName || "Super Admin",
              organizationName: "",
              organisationName: "",
            } : {}),
          } : {}),
        };
        login({
          token,
          user: storedUser,
          response: {
            ...response,
            user: storedUser,
            selectedRole: authRole,
            role: userRole,
            organizationId,
          },
          rememberMe: remember,
        });
        toast.success(response?.message || "Login successful", { duration: 1200 });
        const isHrAccount = userRole === "employee" && isHrModuleUser(storedUser);
        const defaultTarget = isHrAccount
          ? "/employee/hr-dashboard"
          : ROLE_DASHBOARD_ROUTES[userRole] || "/dashboard";
        const targetRoute = userRole === ROLES.STUDENT && validEnrollmentReturnTo
          ? validEnrollmentReturnTo
          : redirectPath || defaultTarget;
        debugAuth("======== NAVIGATION TARGET ========", {
          currentRoute: location.pathname,
          targetRoute,
          isAuthenticated: true,
          role: userRole,
          selectedRole: authRole,
          organizationId,
        });
        queueMicrotask(() => {
          navigate(targetRoute, {
            replace: true,
            ...(validEnrollmentReturnTo && userRole === ROLES.STUDENT ? { state: { resumeEnrollment: true } } : {}),
          });
        });
      } catch (err) {
        const message = err.response?.data?.message || getApiErrorMessage(err, err?.message || "Unable to sign in.");
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [debugAuth, effectiveForcedRole, login, navigate, clearError, redirectPath, useOrganizationLoginEndpoint, location.pathname, location.state]
  );

  const handleGoogleLogin = useCallback(async () => {
    clearError();
    if (isGoogleLoggingIn || isLoggingIn) return;
    const normalizedLoginRole = normalizeRole(effectiveForcedRole);
    const isOrganizationLogin = Boolean(useOrganizationLoginEndpoint) || normalizedLoginRole === ROLES.ORG_ADMIN;
    const isStudentLogin = !isOrganizationLogin && normalizedLoginRole !== ROLES.EMPLOYEE;
    // Only Student, Employee and Organization have a Google sign-in endpoint today.
    if (isStudentLogin && normalizedLoginRole && normalizedLoginRole !== ROLES.STUDENT) {
      const message = "Google sign-in is not available for this login yet.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    const googleLoginMethod = normalizedLoginRole === ROLES.EMPLOYEE
      ? authService.googleLoginEmployee
      : isOrganizationLogin
        ? authService.googleLoginOrganization
        : authService.googleLoginStudent;

    setIsGoogleLoggingIn(true);
    try {
      // Every Google login click is a brand-new authentication attempt, never
      // a continuation of whatever session (if any) is already stored. This
      // clears only the auth-scoped keys (token, user, role, ids, ...) —
      // never the full localStorage, so unrelated app settings survive — so
      // the credential this attempt is about to receive can't get merged
      // with a previous user's identity.
      clearAuthentication();

      const credential = await requestGoogleCredential();
      const selectedAccount = decodeGoogleCredential(credential);
      debugAuth("========== GOOGLE SELECTED ACCOUNT ==========", selectedAccount
        ? { sub: selectedAccount.sub, email: selectedAccount.email, name: selectedAccount.name, picture: selectedAccount.picture }
        : { note: "credential could not be decoded client-side" });
      debugAuth("========== GOOGLE LOGIN REQUEST ==========", { role: normalizedLoginRole });
      const response = await googleLoginMethod({ credential });
      const nested = response?.data && typeof response.data === "object" ? response.data : {};
      const token = response?.token ?? response?.Token ?? response?.accessToken ?? response?.AccessToken
        ?? response?.jwtToken ?? response?.JwtToken ?? nested.token ?? nested.Token
        ?? nested.accessToken ?? nested.AccessToken ?? nested.jwtToken ?? nested.JwtToken;

      if (!token || !String(token).trim()) {
        setErrorMessage("Google sign-in succeeded, but the authentication token was not returned.");
        return;
      }

      const returnedUser = response?.user ?? response?.User ?? response?.userDetails ?? response?.UserDetails
        ?? response?.organization ?? response?.Organization ?? nested.user ?? nested.User
        ?? nested.userDetails ?? nested.UserDetails ?? nested.organization ?? nested.Organization ?? {};
      const rawRole = returnedUser?.role ?? returnedUser?.roleName ?? response?.role ?? response?.roleName
        ?? nested?.role ?? nested?.roleName;
      const userRole = normalizeRole(rawRole) || normalizedLoginRole;

      if (!userRole) {
        throw new Error("Google sign-in response did not include a supported authenticated role.");
      }

      const enrollmentReturnTo = location.state?.enrollmentReturnTo;
      const validEnrollmentReturnTo = typeof enrollmentReturnTo === "string"
        && /^\/enrollment(?:[/?#]|$)/.test(enrollmentReturnTo)
        ? enrollmentReturnTo
        : null;
      if (validEnrollmentReturnTo && userRole !== ROLES.STUDENT) {
        throw new Error("Please sign in with a student account to continue this enrollment.");
      }

      // The backend must authenticate the exact Google account whose
      // credential was just submitted. If the email it returns doesn't match
      // the credential's own email, something is wrong server-side (or in a
      // caching layer in between) — never silently sign the user into that
      // other account.
      const backendEmail = String(
        returnedUser.email || returnedUser.Email || response?.email || response?.Email || nested?.email || nested?.Email || ""
      ).trim().toLowerCase();
      const credentialEmail = String(selectedAccount?.email || "").trim().toLowerCase();
      if (credentialEmail && backendEmail && credentialEmail !== backendEmail) {
        console.error("GOOGLE ACCOUNT MISMATCH", {
          "Google credential email": credentialEmail,
          "Backend email": backendEmail,
        });
        const message = "Google sign-in returned a different account than the one you selected. Please try again.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      const storedUser = { ...returnedUser, roleName: returnedUser?.roleName ?? rawRole, role: userRole };
      flushSync(() => {
        login({
          token,
          user: storedUser,
          response: { ...response, user: storedUser, role: userRole, selectedRole: userRole },
          rememberMe: true,
        });
      });

      toast.success(response?.message || response?.Message || "Signed in with Google", { duration: 1200 });
      const targetRoute = (userRole === ROLES.STUDENT && validEnrollmentReturnTo ? validEnrollmentReturnTo : null)
        || redirectPath
        || (isOrganizationLogin ? "/organization/dashboard" : ROLE_DASHBOARD_ROUTES[userRole] || "/dashboard");
      queueMicrotask(() => navigate(targetRoute, {
        replace: true,
        ...(validEnrollmentReturnTo && userRole === ROLES.STUDENT ? { state: { resumeEnrollment: true } } : {}),
      }));
    } catch (err) {
      const message = err.response?.data?.message || getApiErrorMessage(err, err?.message || "Google sign-in failed.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsGoogleLoggingIn(false);
    }
  }, [clearError, debugAuth, effectiveForcedRole, isGoogleLoggingIn, isLoggingIn, login, navigate, redirectPath, useOrganizationLoginEndpoint, location.state]);

  return (
    <>
      <AnimatePresence>
        {showIntro && <WelcomeIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      <div className={`fixed inset-0 flex min-h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto p-4 transition-colors duration-300 sm:p-6 lg:p-8 lg:h-dvh lg:overflow-hidden ${
      isDark ? "bg-slate-950" : "bg-slate-100"
    }`}>
      <HeroBackground />
      <GrainOverlay />
      <GlowOrb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
 
      {/* Main Grid Frame */}
      <div className={`relative z-10 grid min-h-[620px] w-full max-w-5xl grid-cols-1 border shadow-[0_32px_80px_-18px_rgba(8,15,70,0.55)] transition-all duration-500 lg:min-h-0 lg:grid-cols-2 lg:rounded-2xl ${
        isDark ? "bg-[#070b35] border-indigo-400/70" : "bg-[#070b35] border-indigo-300/70"
      }`}>
       
        {/* Left Graphics Panel */}
        <div className="relative h-72 sm:h-80 lg:h-full w-full overflow-hidden bg-[#070b35] lg:rounded-s-2xl">
          <AuthHero />
        </div>
       
        {/* Right Form Panel */}
        <div className="login-panel relative m-0 flex min-h-0 w-full flex-col justify-start overflow-y-auto bg-white pb-6 pt-16 dark:bg-slate-900 lg:m-3 lg:w-auto lg:rounded-[24px] lg:pt-14 lg:pb-10 xl:m-4">
          {/* Main Top Actions Row */}
          <div className="login-actions absolute top-5 right-6 flex items-center gap-2 z-30">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/60 bg-white/80 dark:border-slate-800 dark:bg-slate-950 text-slate-500 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/60 bg-white/80 dark:border-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              <X size={14} />
            </button>
          </div>
 
          <LoginForm
            onLogin={handleLogin}
            errorMessage={errorMessage}
            onClearError={clearError}
            isLoading={isLoggingIn}
            title={effectiveTitle}
            subtitle={effectiveSubtitle}
            registerLabel={registerLabel}
            registerTo={registerTo}
            showFooter={showFooter}
            registerState={location.state?.enrollmentReturnTo
              ? { enrollmentReturnTo: location.state.enrollmentReturnTo }
              : undefined}
            checkoutLogin={Boolean(location.state?.enrollmentReturnTo)}
            initialEmail={location.state?.registeredEmail || ""}
            infoMessage={infoMessage || (location.state?.organizationRegistered
              ? "Organization registered successfully. Sign in with the email and password you created."
              : location.state?.enrollmentReturnTo
                ? "Sign in with your student account to return to checkout. Your enrollment is not complete until payment is verified."
                : "")}
            recoveryReturnTo={recoveryReturnTo}
            onGoogleLogin={handleGoogleLogin}
            googleLoading={isGoogleLoggingIn}
          />
        </div>
      </div>
      </div>
    </>
  );
}
