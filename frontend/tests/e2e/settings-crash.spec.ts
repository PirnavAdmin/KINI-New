import { test, expect } from "@playwright/test";

/**
 * Regression test for the /organization/settings crash.
 *
 * Seeds a fake org-admin session, blocks every API call (the settings
 * endpoints are not all deployed yet — 404s must be handled gracefully),
 * then verifies the Settings hub renders with all six tabs and no uncaught
 * runtime error reaches the page (which would show the global
 * "Something Went Wrong" screen).
 */
test("organization settings loads with all six tabs when APIs return 404", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  // Simulate an org-admin session.
  await page.addInitScript(() => {
    localStorage.setItem("organizationToken", "seeded-token");
    localStorage.setItem("auth_token", "seeded-token");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "org-admin");
    localStorage.setItem("organization_id", "2");
    localStorage.setItem("organizationId", "2");
    localStorage.setItem(
      "user",
      JSON.stringify({ organizationId: 2, role: "org-admin" }),
    );
  });

  // Block backend calls (the real API host) — missing endpoints must not
  // crash Settings. Scoped to the API host so dev modules under /src/api are
  // never intercepted.
  const apiHost = process.env.VITE_API_BASE_URL || "latitude-apron-winter.ngrok-free.dev";
  await page.route("**" + apiHost.replace(/^https?:\/\//, "") + "/**", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: "{}",
    }),
  );

  await page.goto("/organization/settings", { waitUntil: "domcontentloaded" });

  // Header + all six tabs
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  const tabIds = [
    "organization",
    "invoice",
    "email-templates",
    "general",
    "roles",
    "notifications",
  ];
  for (const tabId of tabIds) {
    await expect(page.getByTestId(`settings-tab-${tabId}`)).toBeVisible();
  }

  // Click through every tab — any throw here would trip the ErrorBoundary.
  const clickOrder = ["invoice", "email-templates", "general", "roles", "notifications", "organization"];
  for (const tabId of clickOrder) {
    await page.getByTestId(`settings-tab-${tabId}`).click();
  }

  // The global error screen must never appear.
  await expect(page.getByText("Something Went Wrong")).toHaveCount(0);

  expect(pageErrors, `Uncaught page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  // Allow benign network 404s logged by the browser, but no real console errors.
  const realConsoleErrors = consoleErrors.filter(
    (text) => !text.includes("404") && !text.includes("favicon"),
  );
  expect(realConsoleErrors, `Console errors:\n${realConsoleErrors.join("\n")}`).toEqual([]);
});
