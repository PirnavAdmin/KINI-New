import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import { ROLES } from "@shared/constants/roles";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { superAdminAuth } from "../services/superAdminAuth";

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
      const nested = response?.data && typeof response.data === "object" ? response.data : {};
      const token = response?.token || response?.accessToken || response?.jwtToken
        || nested?.token || nested?.accessToken || nested?.jwtToken;

      if (!token) throw new Error("Login succeeded, but no authentication token was returned.");

      const returnedUser = response?.user || response?.userDetails || nested?.user || nested?.userDetails || response;
      const firstName = returnedUser?.firstName ?? response?.firstName ?? nested?.firstName;
      const lastName = returnedUser?.lastName ?? response?.lastName ?? nested?.lastName;
      const name = (
        returnedUser?.name ?? returnedUser?.fullName ?? returnedUser?.userName
        ?? response?.name ?? response?.fullName ?? response?.userName
        ?? [firstName, lastName].filter(Boolean).join(" ")
      ) || undefined;
      const emailAddress = returnedUser?.email ?? returnedUser?.emailId
        ?? response?.email ?? response?.emailId ?? nested?.email ?? nested?.emailId;
      const user = {
        ...(returnedUser?.id ?? returnedUser?.userId ?? response?.id ?? response?.userId ?? nested?.id ?? nested?.userId
          ? { userId: returnedUser?.userId ?? returnedUser?.id ?? response?.userId ?? response?.id ?? nested?.userId ?? nested?.id }
          : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(name ? { name } : {}),
        ...(emailAddress ? { email: emailAddress } : {}),
        role: ROLES.SUPER_ADMIN,
      };

      persistLogin({ token, user, response: { ...response, role: ROLES.SUPER_ADMIN }, rememberMe });
      setStatus("success");
      toast.success(response?.message || "Super Admin login successful");
      navigate(ROUTES.SUPER_ADMIN.DASHBOARD, { replace: true });
    } catch (error) {
      const fallback = error?.response?.status === 401
        ? "Invalid Super Admin email or password."
        : "Unable to sign in to the Super Admin portal.";
      const message = error.response?.data?.message || getApiErrorMessage(error, fallback);
      setErrorMessage(message);
      setStatus("error");
    }
  }, [navigate, persistLogin]);

  return { login, resetState, status, isLoading: status === "loading", errorMessage };
};
