import { expect } from "@playwright/test";

export const LOGIN_PATH = "/login";

export const loginSelectors = {
  skipIntro: /skip intro/i,
  heading: /welcome back/i,
  logo: /kini edx hub logo/i,
  email: /email address/i,
  password: /^password$/i,
  signIn: /^sign in$/i,
  forgotPassword: /forgot password\?/i,
  rememberMe: /remember me for 30 days/i,
  createAccount: /create account/i,
  showPassword: /show password/i,
  hidePassword: /hide password/i,
};

export async function openLoginPage(page, path = LOGIN_PATH) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  const skipIntro = page.getByRole("button", { name: loginSelectors.skipIntro });
  if (await skipIntro.isVisible().catch(() => false)) {
    await skipIntro.click();
  }
  await expect(page.getByRole("heading", { name: loginSelectors.heading })).toBeVisible();
}

export async function fillLoginForm(page, { email, password, role = "student", rememberMe = false } = {}) {
  if (role !== "student") {
    await page.getByRole("button", { name: /student|employee|organization/i }).click();
    await page.getByRole("option", { name: new RegExp(role === "employee" ? "employee" : "organization", "i") }).click();
  }

  await page.getByLabel(loginSelectors.email).fill(email || "");
  await page.getByLabel(loginSelectors.password).fill(password || "");
  if (rememberMe) {
    await page.getByRole("checkbox", { name: loginSelectors.rememberMe }).check();
  }
}

export async function submitLogin(page) {
  await page.getByRole("button", { name: loginSelectors.signIn }).click({ force: true });
}
