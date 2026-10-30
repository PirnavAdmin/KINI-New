import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppProviders from "@app/providers";
import Login from "@features/auth/pages/login/Login";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import { toApiRole } from "@shared/services/authApi";
import apiClient from "@shared/services/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { LOGIN_ENV, getLoginRoleValue, getLoginRouteForRole, hasLoginCredentials } from "../fixtures/loginEnv";

const LocationProbe = () => {
  const location = useLocation();
  const { isAuthenticated, role, token, user } = useAuth();

  return (
    <>
      <div data-testid="pathname">{location.pathname}</div>
      <output data-testid="auth-state">
        {JSON.stringify({
          isAuthenticated,
          role,
          token: Boolean(token),
          userEmail: user?.email || null,
          userName: user?.name || user?.organizationName || null,
        })}
      </output>
      <Outlet />
    </>
  );
};

const Page = ({ title }) => (
  <main>
    <h1>{title}</h1>
  </main>
);

const renderLogin = (initialEntries = [ROUTES.AUTH.LOGIN]) =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<LocationProbe />}>
            <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
            <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<Page title="Forgot Password" />} />
            <Route path="/register" element={<Page title="Register" />} />
            <Route path="/student/dashboard" element={<Page title="Student Dashboard" />} />
            <Route path="/employee/dashboard" element={<Page title="Employee Dashboard" />} />
            <Route path="/organization/dashboard" element={<Page title="Organization Dashboard" />} />
            <Route path="/super-admin/dashboard" element={<Page title="Super Admin Dashboard" />} />
            <Route path="/dashboard" element={<Page title="Dashboard" />} />
            <Route path="/unauthorized" element={<Page title="Unauthorized" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );

const getEmailInput = () => screen.getByLabelText(/email address/i);
const getPasswordInput = () => screen.getByLabelText(/^password$/i);
const getSubmitButton = () => screen.getByRole("button", { name: /^sign in$/i });
const getAuthState = () => JSON.parse(screen.getByTestId("auth-state").textContent || "{}");

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("Login component", () => {
  test("renders the login surface and key controls", async () => {
    const user = userEvent.setup();

    renderLogin();

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /kini edx hub logo/i })).toBeVisible();
    expect(screen.getByText(/sign in to continue your learning journey/i)).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    expect(getEmailInput()).toHaveAttribute("type", "text");
    expect(getEmailInput()).toHaveAttribute("autocomplete", "username");
    expect(getPasswordInput()).toHaveAttribute("type", "password");
    expect(screen.getByRole("checkbox", { name: /remember me for 30 days/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /forgot password\?/i })).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();

    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);
  });

  test("supports typing, paste, tab navigation, checkbox toggle, and password visibility toggle", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(getEmailInput());
    await user.paste("student@example.com");
    await user.click(getPasswordInput());
    await user.type(getPasswordInput(), "Password123!");

    expect(getPasswordInput()).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(getPasswordInput()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(getPasswordInput()).toHaveAttribute("type", "password");

    const rememberMe = screen.getByRole("checkbox", { name: /remember me for 30 days/i });
    await user.click(rememberMe);
    expect(rememberMe).toBeChecked();

    await user.keyboard("{Tab}{Tab}");
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });

  test("shows validation errors and clears them after correction", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(getSubmitButton());
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(within(alert).getByText(/email or phone is required/i)).toBeInTheDocument();
    });

    await user.clear(getEmailInput());
    await user.type(getEmailInput(), "bad-email");
    await user.click(getSubmitButton());
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(within(alert).getByText(/valid email address or phone number/i)).toBeInTheDocument();
    });

    await user.clear(getEmailInput());
    await user.type(getEmailInput(), "  student@example.com  ");
    await user.click(getSubmitButton());
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(within(alert).getByText(/password is required/i)).toBeInTheDocument();
    });

    await user.type(getPasswordInput(), "short");
    await user.click(getSubmitButton());
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(within(alert).getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    await user.clear(getPasswordInput());
    await user.type(getPasswordInput(), "Password123!");
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  }, 15000);

  test("captures the initial render snapshot", async () => {
    const { asFragment } = renderLogin();

    await screen.findByRole("heading", { name: /welcome back/i });
    expect(asFragment()).toMatchSnapshot();
  });
});

const realLoginDescribe = hasLoginCredentials() ? describe : describe.skip;

realLoginDescribe("Live backend login flow", () => {
  test("returns a successful login response and persists auth state", async () => {
    const loginRole = getLoginRoleValue();
    const endpoint = loginRole === "org-admin" ? API_ENDPOINTS.organization.login : API_ENDPOINTS.auth.login;
    const payload = endpoint === API_ENDPOINTS.organization.login
      ? { email: LOGIN_ENV.email, password: LOGIN_ENV.password }
      : {
          email: LOGIN_ENV.email,
          password: LOGIN_ENV.password,
          selectedRole: toApiRole(loginRole),
          rememberMe: true,
        };

    const response = await apiClient.post(endpoint, payload);
    const body = response.data?.data ?? response.data;
    const requestPayload = JSON.parse(response.config?.data || "{}");

    expect(response.status).toBe(200);
    expect(requestPayload.email).toBe(LOGIN_ENV.email);
    expect(requestPayload.password).toBe(LOGIN_ENV.password);
    if (endpoint === API_ENDPOINTS.auth.login) {
      expect(requestPayload.selectedRole).toBe(toApiRole(loginRole));
      expect(requestPayload.rememberMe).toBe(true);
    }
    expect(body).toBeTruthy();
    expect(
      body?.token || body?.Token || body?.accessToken || body?.AccessToken || body?.jwtToken || body?.JwtToken ||
      body?.data?.token || body?.data?.Token || body?.data?.accessToken || body?.data?.AccessToken ||
      body?.data?.jwtToken || body?.data?.JwtToken
    ).toBeTruthy();
    expect(
      body?.user || body?.User || body?.userDetails || body?.UserDetails ||
      body?.organization || body?.Organization ||
      body?.data?.user || body?.data?.User || body?.data?.userDetails || body?.data?.UserDetails ||
      body?.data?.organization || body?.data?.Organization
    ).toBeTruthy();
  }, 60000);

  test("rejects invalid credentials with a 401 response", async () => {
    const loginRole = getLoginRoleValue();
    const endpoint = loginRole === "org-admin" ? API_ENDPOINTS.organization.login : API_ENDPOINTS.auth.login;
    const payload = endpoint === API_ENDPOINTS.organization.login
      ? { email: LOGIN_ENV.email, password: `${LOGIN_ENV.password}__invalid__` }
      : {
          email: LOGIN_ENV.email,
          password: `${LOGIN_ENV.password}__invalid__`,
          selectedRole: toApiRole(loginRole),
          rememberMe: false,
        };

    await expect(apiClient.post(endpoint, payload)).rejects.toMatchObject({
      response: { status: 401 },
    });
  }, 60000);

  test("navigates to the correct dashboard route after a successful login", async () => {
    const user = userEvent.setup();
    const role = getLoginRoleValue();
    const dashboardRoute = getLoginRouteForRole(role);

    renderLogin();
    await screen.findByRole("heading", { name: /welcome back/i });

    if (role !== "student") {
      const roleButton = screen.getByRole("button", { name: /student|employee|organization/i });
      await user.click(roleButton);
      await user.click(await screen.findByRole("option", { name: new RegExp(role === "employee" ? "employee" : "organization", "i") }));
    }

    await user.type(getEmailInput(), LOGIN_ENV.email);
    await user.type(getPasswordInput(), LOGIN_ENV.password);
    await user.click(screen.getByRole("checkbox", { name: /remember me for 30 days/i }));
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(getAuthState().isAuthenticated).toBe(true);
      expect(screen.getByTestId("pathname")).toHaveTextContent(dashboardRoute);
    });
  }, 60000);
});
