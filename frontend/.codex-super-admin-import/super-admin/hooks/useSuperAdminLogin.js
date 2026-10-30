import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import { ROLES } from "@shared/constants/roles";
import { decodeJwtPayload } from "@shared/services/authService";
import getApiErrorMessage, { flattenErrors } from "@/utils/getApiErrorMessage";
import { superAdminAuth } from "../services/superAdminAuth";

// Friendly fallbacks keyed by HTTP status. A safe message returned by the
// backend always wins over these, so raw server details are never shown.
const LOGIN_STATUS_FALLBACKS = {
  400: "Invalid request. Please check the entered information.",
  401: "Invalid Super Admin email or password.",
  403: "This account does not have Super Admin access.",
  404: "The Super Admin account was not found.",
  422: "Please correct the validation errors and try again.",
  429: "Too many login attempts. Please wait a moment and try again.",
  500: "The server could not complete the request. Please try again later.",
  502: "The authentication server is temporarily unavailable.",
  503: "The authentication server is temporarily unavailable.",
  504: "The authentication server took too long to respond.",
};

const UNSAFE_SERVER_MESSAGE = /unexpected error|internal server|exception|stack trace|\bat\s+[\w.]+\(|\.cs:line/i;

const getSuperAdminLoginErrorMessage = (error) => {
  if (!error?.response) {
    // Application-level failures (e.g. "no token returned") and network errors.
    if (error?.message && error.message !== "Network Error") return error.message;
    return "Unable to connect to the authentication server.";
  }

  const { status, data } = error.response;
  if (data && typeof data === "object") {
    const validationMessage = flattenErrors(data?.errors);
    if (validationMessage) return validationMessage;

    // The Super Admin API reports invalid credentials as HTTP 500 with the
    // user-facing message in `Error`, so prefer Error/error over Message and
    // drop generic server boilerplate. Generic ProblemDetails `title` values
    // ("Unauthorized", "One or more validation errors occurred.", ...) are
    // intentionally skipped so the status-based fallback below is shown.
    for (const value of [data?.Error, data?.error, data?.Message, data?.message]) {
      if (typeof value === "string" && value.trim() && !UNSAFE_SERVER_MESSAGE.test(value)) {
        return value.trim();
      }
    }
  }

  return LOGIN_STATUS_FALLBACKS[status]
    || getApiErrorMessage(error, "Unable to sign in to the Super Admin portal.");
};

export const useSuperAdminLogin = () => {
  const navigate = useNavigate();
  const { login: persistLogin } = useAuth();
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await superAdminAuth.login({ email, password });

      // Inspected live response: { success, message, token }. Keep a defensive
      // fallback chain anyway, but never assume a property that the API does
      // not return.
      const token = response?.token || response?.accessToken || response?.jwtToken;

      if (!token || !String(token).trim()) {
        throw new Error("Login succeeded, but no authentication token was returned.");
      }

      // The login response carries no user object; the JWT payload provides the
      // authenticated identity (email + sub) and the SuperAdmin role claim.
      const tokenPayload = decodeJwtPayload(token);
      const user = {
        email: tokenPayload?.email || response?.email || String(email).trim().toLowerCase(),
        userId: tokenPayload?.sub || tokenPayload?.nameid || response?.userId || "",
        role: ROLES.SUPER_ADMIN,
      };

      persistLogin({
        token,
        user,
        response: { ...response, role: ROLES.SUPER_ADMIN, user },
        rememberMe,
      });
      setStatus("success");
      toast.success(response?.message || "Super Admin login successful");
      navigate(ROUTES.SUPER_ADMIN.DASHBOARD, { replace: true });
    } catch (error) {
      setErrorMessage(getSuperAdminLoginErrorMessage(error));
      setStatus("error");
    }
  }, [navigate, persistLogin]);

  return { login, resetState, status, isLoading: status === "loading", errorMessage };
};
