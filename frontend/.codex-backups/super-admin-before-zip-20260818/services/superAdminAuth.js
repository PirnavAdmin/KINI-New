import { authService } from "@shared/services/authService";

export const superAdminAuth = {
  login: async ({ email, password }) => {
    return authService.loginSuperAdmin({
      email: String(email || "").trim().toLowerCase(),
      password,
    });
  },
};

export default superAdminAuth;
