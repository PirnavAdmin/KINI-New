import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Demo Payment Mode end to end (needs VITE_PAYMENT_MODE=demo and
 * DEMO_PAYMENTS_ENABLED=true on the dev server, e.g. .env.development.local):
 * guest checkout → demo gateway (cancel, fail, succeed) → Pending Approval in
 * the Organization Portal (approve opens the live create-and-approve dialog; reject).
 *
 * The live API is never called: its host is stubbed, so the only backend in
 * play is the dev server's demo backend (/demo-api/v1). The demo store is
 * shared with anyone using the same dev server, so each run uses its own
 * student email and only asserts on its own records.
 */

const SHOTS = path.resolve(__dirname, "../artifacts/demo-payment");
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });

const liveApiHost = (() => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    const url = env.match(/^VITE_API_BASE_URL=(.+)$/m)?.[1]?.trim();
    return url ? new URL(url).hostname : "";
  } catch {
    return "";
  }
})();

const COURSES = [
  { id: 12, title: "RPA", name: "RPA", price: 25000, thumbnail: "" },
  { id: 10, title: "Python", name: "Python", price: 10000, thumbnail: "" },
];

/** Answers every live-API call with an empty success so pages render without a backend. */
const stubLiveApi = async (page: Page) => {
  await page.route((url) => url.hostname === liveApiHost || url.hostname.endsWith(".ngrok-free.dev"), (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/api/v1/batches/dropdown") || url.pathname.endsWith("/api/v1/organization/batches")) {
      // RPA has one open batch; Python has none, so its batch is assigned on approval.
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [{ batchId: 11, batchName: "RPA 1", courseId: 12, organizationId: 2, status: "Active", capacity: 30, enrolledStudents: 3 }] }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [] }) });
  });
};

const RUN = Date.now();
const EMAIL = `asha.rao+${RUN}@example.test`;
const PHONE = `9${String(RUN).slice(-9)}`;

const demoApi = (request: APIRequestContext) => ({
  order: async (orderId: string) => (await request.get(`/demo-api/v1/orders/${orderId}`)).json(),
  outbox: async () => (await (await request.get("/demo-api/v1/dev/outbox")).json()).filter((email: { to: string }) => email.to === EMAIL),
  requests: async () => (await (await request.get("/demo-api/v1/enrollment-requests", { headers: { Authorization: "Bearer test-reviewer" } })).json()).filter((r: { student: { email: string } }) => r.student.email === EMAIL),
});

test.describe.configure({ mode: "serial" });

test("guest pays with the demo gateway and the organization reviews the request", async ({ browser, request }) => {
  test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
  fs.mkdirSync(SHOTS, { recursive: true });
  const api = demoApi(request);
  const status = await (await request.get("/demo-api/v1/status")).json();
  test.skip(!status.enabled, "Demo payments are not enabled on the dev server");

  // ── Student: guest checkout for two courses ──────────────────────────
  const student = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await student.newPage();
  await stubLiveApi(page);
  await page.addInitScript((courses) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.clear();
      localStorage.setItem("kini:enrollment:draft", JSON.stringify({ step: "details", courses }));
      sessionStorage.setItem("seeded", "1");
    }
  }, COURSES);
  await page.goto("/enrollment");

  await page.getByLabel("First Name").fill("Asha");
  await page.getByLabel("Last Name").fill("Rao");
  await page.getByLabel("Email Address").fill(`${EMAIL}`);
  await page.getByLabel("Phone Number").fill(PHONE);
  await page.getByLabel("Pincode").fill("500001");
  await page.locator("select[name=state]").selectOption("Telangana");
  await page.locator("select[name=qualification]").selectOption("Bachelor's Degree");
  await page.locator("select[name=experience]").selectOption("Student / Fresher");
  await page.locator("select[name=batch_12]").selectOption("11");
  await expect(page.getByText("No open batch is listed for Python yet.", { exact: false })).toBeVisible();
  await page.getByRole("checkbox", { name: /Terms/ }).check();
  await page.getByRole("button", { name: /Continue to Checkout/ }).click();

  await expect(page.getByText("Demo Payment Mode")).toBeVisible();
  await expect(page.getByText("This is a test transaction. No real money will be charged.")).toBeVisible();
  await expect(page.getByText(/Sign in to/)).toHaveCount(0);
  await page.getByRole("button", { name: /Google Pay/ }).click();
  const pay = page.getByRole("button", { name: /^Pay\s*₹35,000/ });
  await expect(pay).toBeEnabled();
  await shot(page, "01-checkout-demo-mode");

  // Cancel: no transaction.
  await pay.click();
  const gateway = page.getByRole("dialog", { name: "Demo Payment Gateway" });
  await expect(gateway).toBeVisible();
  await expect(gateway.getByText("DEMO PAYMENT — NO REAL MONEY CHARGED")).toBeVisible();
  await expect(gateway.getByText("₹35,000")).toBeVisible();
  await expect(gateway.getByText("UPI (Google Pay)")).toBeVisible();
  await shot(page, "02-demo-gateway-modal");
  const orderId = (await gateway.getByText(/^DEMO-ORD-\d{6}$/).textContent())!.trim();
  await gateway.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByText("Demo payment cancelled.", { exact: false })).toBeVisible();
  expect((await api.order(orderId)).transactions).toHaveLength(0);

  // Failure: recorded separately, no enrollment, cart and details kept.
  await pay.click();
  await gateway.getByRole("button", { name: "Simulate Failed Payment" }).click();
  await expect(page.getByText(/The demo payment failed \(transaction DEMO-TXN-\d{6}\)/)).toBeVisible();
  await shot(page, "03-demo-payment-failed");
  const afterFail = await api.order(orderId);
  expect(afterFail.transactions.map((txn: { paymentStatus: string }) => txn.paymentStatus)).toEqual(["DemoFailed"]);
  expect(afterFail.requests).toHaveLength(0);

  // Retry and succeed: the same order, one DemoSuccess, one request per course.
  await pay.click();
  await gateway.getByRole("button", { name: "Simulate Successful Payment" }).click();
  await expect(page.getByRole("heading", { name: "Payment Successful!" })).toBeVisible();
  await expect(page.getByText("Your payment has been received. Your enrollment request has been sent to the organization for approval.")).toBeVisible();
  await expect(page.getByText("DEMO PAYMENT — NO REAL MONEY CHARGED")).toBeVisible();
  await expect(page.getByText("Pending approval")).toBeVisible();
  await expect(page.getByText("You will receive an email once your enrollment is approved.", { exact: false })).toBeVisible();
  await page.waitForTimeout(1200);
  await shot(page, "04-demo-payment-success");

  const paid = await api.order(orderId);
  expect(paid.status).toBe("Paid");
  expect(paid.transactions.map((txn: { paymentStatus: string }) => txn.paymentStatus)).toEqual(["DemoFailed", "DemoSuccess"]);
  expect(paid.requests.map((r: { course: { title: string }; enrollmentStatus: string }) => [r.course.title, r.enrollmentStatus])).toEqual([["RPA", "PendingApproval"], ["Python", "PendingApproval"]]);

  // A duplicate completion callback changes nothing.
  const duplicate = await (await request.post(`/demo-api/v1/orders/${orderId}/complete`, { data: { outcome: "success", paymentMethod: "UPI", attemptId: "replayed" } })).json();
  expect(duplicate.transactionId).toBe(paid.successTransactionId);
  expect(await api.requests()).toHaveLength(2);

  // A refresh keeps the verified receipt.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Payment Successful!" })).toBeVisible();
  await student.close();

  // ── Organization: Students → Pending Approval ────────────────────────
  const org = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const orgPage = await org.newPage();
  await stubLiveApi(orgPage);
  await orgPage.addInitScript(() => {
    localStorage.setItem("organizationToken", "seeded-token");
    localStorage.setItem("auth_token", "seeded-token");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "org-admin");
    localStorage.setItem("organization_id", "2");
    localStorage.setItem("organizationId", "2");
    localStorage.setItem("user", JSON.stringify({ organizationId: 2, role: "org-admin", email: "admin@org.test" }));
  });
  await orgPage.goto("/organization/students?tab=approvals");
  const rpaCard = orgPage.locator("article", { hasText: `${EMAIL}` }).filter({ hasText: "RPA" });
  const pythonCard = orgPage.locator("article", { hasText: `${EMAIL}` }).filter({ hasText: "Python" });
  await expect(rpaCard).toBeVisible({ timeout: 20000 });
  await expect(rpaCard.getByText("Demo payment")).toBeVisible();
  await expect(rpaCard.getByText("Payment: Demo success")).toBeVisible();
  await expect(rpaCard.getByText("Enrollment: Pending approval")).toBeVisible();
  await expect(rpaCard.getByText(paid.successTransactionId)).toBeVisible();
  await expect(rpaCard.getByText(PHONE)).toBeVisible();
  await expect(pythonCard.getByText("Assign on approval")).toBeVisible();
  await rpaCard.scrollIntoViewIfNeeded();
  await shot(orgPage, "05-org-pending-approval");

  // Approve now goes to the live backend (covered in live-student-approval.spec.ts):
  // it opens the create-and-approve dialog and sends nothing until confirmed.
  await expect(rpaCard.getByText(/No backend student has this email yet/)).toBeVisible();
  await rpaCard.getByRole("button", { name: "Approve" }).click();
  const provision = orgPage.getByRole("dialog", { name: "Approve Asha Rao?" });
  await expect(provision.getByRole("button", { name: "Create & approve" })).toBeVisible();
  await provision.getByRole("button", { name: "Cancel" }).click();

  // Reject stays in the demo backend: no backend record exists to reject.
  for (const card of [pythonCard, rpaCard]) {
    await card.getByRole("button", { name: "Reject" }).click();
    await card.getByRole("button", { name: "Confirm reject" }).click();
    await expect(card).toHaveCount(0);
  }
  await shot(orgPage, "06-org-after-review");

  const reviewed = await api.requests();
  expect(reviewed.map((r: { course: { title: string }; enrollmentStatus: string }) => [r.course.title, r.enrollmentStatus]).sort()).toEqual([["Python", "Rejected"], ["RPA", "Rejected"]]);
  expect(await api.outbox()).toHaveLength(0);
  await org.close();
});
