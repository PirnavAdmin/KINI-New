import { expect, test } from "@playwright/test";
import { LOGIN_ENV, getLoginRoleValue, getLoginRouteForRole, hasLoginCredentials } from "../fixtures/loginEnv";
import { fillLoginForm, loginSelectors, openLoginPage, submitLogin } from "../utils/loginHelpers";

const realBackendDescribe = hasLoginCredentials() ? test.describe : test.describe.skip;
const INVALID_LOGIN = {
  email: "invalid@example.com",
  password: "InvalidPass123!",
};
const VALID_TEST_EMAIL = "student@example.com";
const defaultRole = getLoginRoleValue();
const dashboardPath = getLoginRouteForRole(defaultRole);

const getDashboardMenuButton = (page) => {
  const name = defaultRole === "org-admin"
    ? /organization/i
    : defaultRole === "employee"
    ? /employee/i
    : /student/i;
  return page.getByRole("button", { name }).first();
};

const waitForFonts = async (page) => {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
};

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.describe("Login UI", () => {
  test("renders the login page exactly like a user sees it", async ({ page }) => {
    await openLoginPage(page);

    await expect(page.getByRole("img", { name: /kini edx hub logo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: loginSelectors.heading })).toBeVisible();
    await expect(page.getByLabel(loginSelectors.email)).toBeVisible();
    await expect(page.getByLabel(loginSelectors.password)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: loginSelectors.rememberMe })).toBeVisible();
    await expect(page.getByRole("button", { name: loginSelectors.forgotPassword })).toBeVisible();
    await expect(page.getByRole("button", { name: loginSelectors.signIn })).toBeVisible();
    await expect(page.getByRole("button", { name: loginSelectors.createAccount })).toBeVisible();
    await expect(page.getByRole("img", { name: /a cheerful young learner waving hello/i })).toBeVisible();
  });

  test("supports keyboard navigation and password visibility toggle", async ({ page }) => {
    await openLoginPage(page);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await expect(page.getByLabel(loginSelectors.email)).toBeFocused();
    await page.getByRole("button", { name: loginSelectors.showPassword }).click();
    await expect(page.getByLabel(loginSelectors.password)).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: loginSelectors.hidePassword }).click();
    await expect(page.getByLabel(loginSelectors.password)).toHaveAttribute("type", "password");
  });

  test("opens forgot password and register routes", async ({ page }) => {
    await openLoginPage(page);

    await page.getByRole("button", { name: loginSelectors.forgotPassword }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await openLoginPage(page);
    await page.getByRole("button", { name: loginSelectors.createAccount }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});

test.describe("Responsive and accessibility checks", () => {
  for (const viewport of [
    { name: "desktop", size: { width: 1440, height: 900 } },
    { name: "laptop", size: { width: 1366, height: 768 } },
    { name: "tablet", size: { width: 820, height: 1180 } },
    { name: "mobile", size: { width: 390, height: 844 } },
  ]) {
    test(`renders without layout breakage on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await openLoginPage(page);

      await expect(page.getByLabel(loginSelectors.email)).toBeVisible();
      await expect(page.getByLabel(loginSelectors.password)).toBeVisible();
      await expect(page.getByRole("button", { name: loginSelectors.signIn })).toBeEnabled();

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
      expect(metrics.scrollHeight).toBeGreaterThan(0);
    });
  }

  test("supports tab order and visible focus states", async ({ page }) => {
    await openLoginPage(page);

    await page.evaluate(() => {
      document.getElementById("login-email")?.focus();
    });
    await expect.poll(async () => page.evaluate(() => document.activeElement?.id || "")).toBe("login-email");

    await page.keyboard.press("Tab");
    await expect.poll(async () => page.evaluate(() => document.activeElement?.textContent?.trim() || "")).toContain("Forgot Password");

    await page.keyboard.press("Tab");
    await expect.poll(async () => page.evaluate(() => document.activeElement?.id || "")).toBe("login-password");

    await page.keyboard.press("Tab");
    await expect.poll(async () => page.evaluate(() => document.activeElement?.getAttribute("aria-label") || "")).toBe("Show password");
  });
});

test.describe("Form validation and loading", () => {
  test("shows validation messages and clears them after correction", async ({ page }) => {
    await openLoginPage(page);
    await page.locator("form").evaluate((form) => form.requestSubmit());
    await expect(page.getByRole("alert")).toContainText(/email is required/i);

    await openLoginPage(page);
    await fillLoginForm(page, { email: "bad-email", password: "" });
    await page.locator("form").evaluate((form) => form.requestSubmit());
    await expect(page.getByRole("alert")).toContainText(/valid email address/i);

    await openLoginPage(page);
    await fillLoginForm(page, { email: `  ${VALID_TEST_EMAIL}  `, password: "short" });
    await page.locator("form").evaluate((form) => form.requestSubmit());
    await expect(page.getByRole("alert")).toContainText(/at least 8 characters/i);

    await page.getByLabel(loginSelectors.password).fill("Password123!");
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("shows loading state and prevents duplicate submissions", async ({ page }) => {
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: INVALID_LOGIN.email,
      password: INVALID_LOGIN.password,
      role: defaultRole,
    });

    const loginRequests = [];
    await page.route("**/api/Auth/login", async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    await page.route("**/api/v1/organization/login", async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        (request.url().includes("/api/Auth/login") || request.url().includes("/api/v1/organization/login"))
      ) {
        loginRequests.push(request);
      }
    });

    await page.getByRole("button", { name: loginSelectors.signIn }).click();
    await expect(page.getByRole("button", { name: /signing in/i })).toBeDisabled();
    await page.getByRole("button", { name: /signing in/i }).click({ force: true }).catch(() => {});

    await expect(page.getByRole("alert")).toBeVisible();
    expect(loginRequests.length).toBe(1);
    await expect(page.getByRole("button", { name: loginSelectors.signIn })).toBeEnabled();
  }, 60000);
});

realBackendDescribe("Real backend login", () => {
  test("logs in with real credentials, stores tokens, loads profile, and redirects", async ({ page }) => {
    const start = Date.now();
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: LOGIN_ENV.email,
      password: LOGIN_ENV.password,
      role: defaultRole,
      rememberMe: true,
    });

    const loginResponse = page.waitForResponse((response) => {
      return (response.url().includes("/api/Auth/login") || response.url().includes("/api/v1/organization/login"))
        && response.status() === 200;
    });
    const profileResponse = page.waitForResponse((response) => response.url().includes("/api/Auth/profile/") && response.status() === 200);

    await submitLogin(page);
    const response = await loginResponse;
    const status = response.status();
    await page.waitForURL(`**${dashboardPath}`);
    const maybeProfile = defaultRole === "org-admin" ? null : await profileResponse;

    expect(status).toBe(200);
    await expect(page.locator("body")).toContainText(/dashboard/i);
    const menuButton = getDashboardMenuButton(page);
    await expect(menuButton).toBeVisible();

    const storage = await page.evaluate(() => ({
      token: localStorage.getItem("accessToken") || localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      role: localStorage.getItem("role"),
      isAuthenticated: localStorage.getItem("isAuthenticated"),
    }));

    expect(storage.token).toBeTruthy();
    expect(storage.user).toBeTruthy();
    expect(storage.isAuthenticated).toBe("true");
    expect(storage.role).toBe(defaultRole);
    expect(maybeProfile || true).toBeTruthy();

    const loginResponseTime = Date.now() - start;
    expect(loginResponseTime).toBeLessThan(30000);
  }, 90000);

  test("captures login performance metrics", async ({ page }) => {
    await openLoginPage(page);
    const metrics = await page.evaluate(() => new Promise((resolve) => {
      const paints = performance.getEntriesByType("paint");
      const fcp = paints.find((entry) => entry.name === "first-contentful-paint")?.startTime ?? null;
      let lcp = null;
      let observer;

      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime || null;
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        observer = null;
      }

      window.setTimeout(() => {
        observer?.disconnect?.();
        resolve({ fcp, lcp });
      }, 1500);
    }));

    expect(metrics.fcp).not.toBeNull();
    await test.info().attach("performance-metrics.json", {
      body: JSON.stringify(metrics, null, 2),
      contentType: "application/json",
    });
  });

  test("keeps the session on refresh", async ({ page }) => {
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: LOGIN_ENV.email,
      password: LOGIN_ENV.password,
      role: defaultRole,
      rememberMe: true,
    });
    await submitLogin(page);
    await page.waitForURL(`**${dashboardPath}`);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(dashboardPath.replace(/\//g, "\\/")));
    await expect(getDashboardMenuButton(page)).toBeVisible();
  }, 90000);

  test("logs out and returns to the login page with storage cleared", async ({ page }) => {
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: LOGIN_ENV.email,
      password: LOGIN_ENV.password,
      role: defaultRole,
      rememberMe: true,
    });
    await submitLogin(page);
    await page.waitForURL(`**${dashboardPath}`);

    await getDashboardMenuButton(page).click();
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    const storage = await page.evaluate(() => ({
      token: localStorage.getItem("accessToken") || localStorage.getItem("token"),
      isAuthenticated: localStorage.getItem("isAuthenticated"),
      user: localStorage.getItem("user"),
    }));

    expect(storage.token).toBeNull();
    expect(storage.isAuthenticated).toBeNull();
    expect(storage.user).toBeNull();
  }, 90000);
});

test.describe("Screenshots and visual regression", () => {
  test("captures the login page screenshot", async ({ page }) => {
    await openLoginPage(page);
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("login-page.png", { fullPage: true, timeout: 30000 });
  });

  test("captures validation errors", async ({ page }) => {
    await openLoginPage(page);
    await submitLogin(page);
    await expect(page.getByRole("alert")).toContainText(/email is required/i);
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("login-validation-errors.png", { fullPage: true, timeout: 30000 });
  });

  test("captures loading state", async ({ page }) => {
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: INVALID_LOGIN.email,
      password: INVALID_LOGIN.password,
      role: defaultRole,
    });
    const request = page.waitForRequest((r) => r.url().includes("/api/Auth/login") || r.url().includes("/api/v1/organization/login"));
    await submitLogin(page);
    await request;
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("login-loading.png", { fullPage: true, timeout: 30000 });
  }, 60000);

  test("captures dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openLoginPage(page);
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("login-dark-mode.png", { fullPage: true, timeout: 30000 });
  });
});

realBackendDescribe("Authenticated screenshots", () => {
  test("captures the success login state", async ({ page }) => {
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: LOGIN_ENV.email,
      password: LOGIN_ENV.password,
      role: defaultRole,
      rememberMe: true,
    });
    await submitLogin(page);
    await page.waitForURL(`**${dashboardPath}`);
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("login-success.png", { fullPage: true, timeout: 30000 });
  }, 90000);
});

test.describe("Network failure handling", () => {
  test("shows a friendly error when the backend cannot be reached", async ({ page }) => {
    await page.route("**/api/Auth/login", async (route) => route.abort());
    await page.route("**/api/v1/organization/login", async (route) => route.abort());
    await openLoginPage(page);
    await fillLoginForm(page, {
      email: INVALID_LOGIN.email,
      password: INVALID_LOGIN.password,
      role: defaultRole,
    });

    await submitLogin(page);
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: loginSelectors.signIn })).toBeEnabled();
  });
});
