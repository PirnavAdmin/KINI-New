const readEnv = (key) => {
  const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
  return String(viteEnv?.[key] || process.env[key] || "").trim();
};

export const LOGIN_ENV = {
  apiBaseUrl: readEnv("VITE_API_BASE_URL"),
  email: readEnv("VITE_TEST_EMAIL"),
  password: readEnv("VITE_TEST_PASSWORD"),
  role: readEnv("VITE_TEST_LOGIN_ROLE") || "student",
};

export const hasLoginCredentials = () => Boolean(LOGIN_ENV.apiBaseUrl && LOGIN_ENV.email && LOGIN_ENV.password);

export const getLoginRoleValue = () => {
  const value = LOGIN_ENV.role.toLowerCase();
  if (value === "employee") return "employee";
  if (value === "org-admin" || value === "organization" || value === "orgadmin") return "org-admin";
  return "student";
};

export const getLoginRouteForRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "employee") return "/employee/dashboard";
  if (normalized === "org-admin") return "/organization/dashboard";
  if (normalized === "super-admin") return "/super-admin/dashboard";
  return "/student/dashboard";
};
