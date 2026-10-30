import { test, expect, type Page, type Route } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Organization → Students → Pending Approval with the live approval call:
 * PUT /api/v1/organization/students/{studentId}/approve.
 *
 * The live API is stubbed with a stateful fake so no real student is
 * approved; every request the page sends to it is captured and asserted. A
 * demo checkout for the same email (dev server demo backend) checks that two
 * paid courses fold into one live approval.
 */

const SHOTS = path.resolve(__dirname, "../artifacts/live-approval");
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const RUN = Date.now();
const UDAY = `uday+${RUN}@example.test`;
const DEMO_ONLY = `demo-only+${RUN}@example.test`;

const liveApiHost = (() => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    return new URL(env.match(/^VITE_API_BASE_URL=(.+)$/m)![1].trim()).hostname;
  } catch {
    return "";
  }
})();

type Captured = { method: string; path: string; authorization: string | null; body: string | null };

const student = (id: number, first: string, last: string, email: string, status: string, courseId: number, courseName: string) => ({
  studentId: id, firstName: first, lastName: last, email, phone: `98765${String(id).padStart(5, "0")}`,
  courseId, courseName, batchId: 11, batchName: `${courseName} 1`, status, registrationDate: "2026-10-12",
});

test("approves a backend student through the live API and folds the matching demo payments", async ({ browser, request }) => {
  test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
  const status = await (await request.get("/demo-api/v1/status")).json();
  test.skip(!status.enabled, "Demo payments are not enabled on the dev server");
  fs.mkdirSync(SHOTS, { recursive: true });

  // A demo checkout for the same email as backend student #31: two courses, one payment.
  const order = await (await request.post("/demo-api/v1/orders", { data: {
    idempotencyKey: `live-approval-${RUN}`,
    student: { firstName: "Uday", lastName: "Kiran", email: UDAY, phone: "9876500031" },
    items: [{ courseId: "12", courseTitle: "RPA", listPrice: 25000, organizationId: "2" }, { courseId: "10", courseTitle: "Python", listPrice: 10000, organizationId: "2" }],
  } })).json();
  await request.post(`/demo-api/v1/orders/${order.orderId}/complete`, { data: { outcome: "success", paymentMethod: "UPI", attemptId: "a" } });
  // And one demo checkout with no backend student at all.
  const orphan = await (await request.post("/demo-api/v1/orders", { data: {
    idempotencyKey: `live-approval-orphan-${RUN}`,
    student: { firstName: "Demo", lastName: "Only", email: DEMO_ONLY, phone: "9876500099" },
    items: [{ courseId: "6", courseTitle: "Sql", listPrice: 5000, organizationId: "2" }],
  } })).json();
  await request.post(`/demo-api/v1/orders/${orphan.orderId}/complete`, { data: { outcome: "success", paymentMethod: "UPI", attemptId: "a" } });

  // Stateful fake of the live backend.
  const roster = new Map<number, ReturnType<typeof student>>([
    [31, student(31, "Uday", "Kiran", UDAY, "Pending", 12, "RPA")],
    [32, student(32, "Ravi", "Teja", `ravi+${RUN}@example.test`, "Pending", 3, "Java Full Stack")],
    [33, student(33, "Meena", "Das", `meena+${RUN}@example.test`, "Pending", 1, "React js")],
  ]);
  const approveCalls: Captured[] = [];
  let raviAttempts = 0;

  const org = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await org.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("organizationToken", "seeded-org-token");
    localStorage.setItem("auth_token", "seeded-org-token");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "org-admin");
    localStorage.setItem("organization_id", "2");
    localStorage.setItem("organizationId", "2");
    localStorage.setItem("user", JSON.stringify({ organizationId: 2, role: "org-admin", email: "admin@org.test" }));
  });
  await page.route((url) => url.hostname === liveApiHost, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const approve = url.pathname.match(/^\/api\/v1\/organization\/students\/(\d+)\/approve$/);
    if (approve) {
      const id = Number(approve[1]);
      approveCalls.push({ method: req.method(), path: url.pathname, authorization: req.headers()["authorization"] ?? null, body: req.postData() });
      if (id === 32) {
        raviAttempts += 1;
        return raviAttempts === 1
          ? route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Database timeout" }) })
          : route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, message: "Student already approved" }) });
      }
      if (id === 33) return route.abort("connectionrefused");
      const record = roster.get(id)!;
      roster.set(id, { ...record, status: "Active" });
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        success: true,
        message: "Student approved successfully",
        data: { studentId: id, email: record.email, status: "Active", accountCreated: true, emailSent: false, emailError: "SMTP not configured" },
      }) });
    }
    if (url.pathname === "/api/v1/organization/students" && req.method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [...roster.values()] }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.goto("/organization/students?tab=approvals");
  const udayCard = page.locator("article", { hasText: UDAY });
  await expect(udayCard).toHaveCount(1, { timeout: 20000 });
  await expect(udayCard.getByText("Demo payment matched by email")).toBeVisible();
  const folded = udayCard.locator("li");
  await expect(folded).toHaveText([/^RPA\s*DEMO-TXN-\d{6}$/, /^Python\s*DEMO-TXN-\d{6}$/]);
  const orphanCard = page.locator("article", { hasText: DEMO_ONLY });
  await expect(orphanCard.getByText(/No backend student has this email yet/)).toBeVisible();
  const pendingTab = page.getByRole("button", { name: /^Pending Approval \d+$/ });
  const pendingBefore = Number((await pendingTab.innerText()).match(/\d+/)?.[0]);
  await udayCard.scrollIntoViewIfNeeded();
  await shot(page, "01-pending-with-folded-demo-payments");

  // Approve #31: confirmation first, nothing sent until confirmed.
  await udayCard.getByRole("button", { name: "Approve" }).click();
  const dialog = page.getByRole("dialog", { name: "Approve Uday Kiran?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("#31")).toBeVisible();
  await expect(dialog.getByText("PUT /api/v1/organization/students/31/approve", { exact: false })).toBeVisible();
  expect(approveCalls).toHaveLength(0);
  await shot(page, "02-confirm-dialog");
  await dialog.getByRole("button", { name: "Approve student" }).click();

  const done = page.getByRole("dialog", { name: "Student approved" });
  await expect(done.getByText("Backend answered 200: Student approved successfully")).toBeVisible();
  await expect(done.getByText("Active", { exact: true })).toBeVisible();
  await expect(done.getByText("Created", { exact: true })).toBeVisible();
  await expect(done.getByText("Not sent", { exact: true })).toBeVisible();
  await expect(done.getByText(/backend reports the email was not sent/)).toBeVisible();
  await shot(page, "03-backend-response");

  expect(approveCalls).toEqual([{ method: "PUT", path: "/api/v1/organization/students/31/approve", authorization: "Bearer seeded-org-token", body: null }]);
  await done.getByRole("button", { name: "Done" }).click();

  // One live call covered both demo courses; they are recorded against #31 without a demo email.
  await expect(udayCard).toHaveCount(0);
  await expect.poll(async () => Number((await pendingTab.innerText()).match(/\d+/)?.[0])).toBe(pendingBefore - 1);
  const demoRequests = (await (await request.get("/demo-api/v1/enrollment-requests", { headers: { Authorization: "Bearer test" } })).json())
    .filter((r: { student: { email: string } }) => r.student.email === UDAY);
  expect(demoRequests.map((r: { course: { title: string }; enrollmentStatus: string; approvedVia: string; liveStudentId: string }) => [r.course.title, r.enrollmentStatus, r.approvedVia, r.liveStudentId]))
    .toEqual([["RPA", "Approved", "live-backend", "31"], ["Python", "Approved", "live-backend", "31"]]);
  const outbox = (await (await request.get("/demo-api/v1/dev/outbox")).json()).filter((email: { to: string }) => email.to === UDAY);
  expect(outbox).toHaveLength(0);

  // #32: 500, then the retry answers 409 (already approved).
  const raviCard = page.locator("article", { hasText: `ravi+${RUN}@example.test` });
  await raviCard.getByRole("button", { name: "Approve" }).click();
  const raviDialog = page.getByRole("dialog", { name: "Approve Ravi Teja?" });
  await raviDialog.getByRole("button", { name: "Approve student" }).click();
  await expect(raviDialog.getByRole("alert")).toContainText("The backend failed (500): Database timeout");
  await raviDialog.getByRole("button", { name: "Try again" }).click();
  await expect(raviDialog.getByRole("alert")).toContainText("Student #32 is already approved. (HTTP 409)");
  await shot(page, "04-already-approved-409");
  await raviDialog.getByRole("button", { name: "Done" }).click();

  // #33: the tunnel is down.
  const meenaCard = page.locator("article", { hasText: `meena+${RUN}@example.test` });
  await meenaCard.getByRole("button", { name: "Approve" }).click();
  const meenaDialog = page.getByRole("dialog", { name: "Approve Meena Das?" });
  await meenaDialog.getByRole("button", { name: "Approve student" }).click();
  await expect(meenaDialog.getByRole("alert")).toContainText("Can't reach the backend");
  await meenaDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(meenaCard).toHaveCount(1);

  // The approved student shows as Active in the Student List, with their course intact.
  await page.getByRole("button", { name: /Student List/ }).click();
  const row = page.locator("tr, article", { hasText: UDAY }).first();
  await expect(row).toContainText("Active");
  await expect(row).toContainText("RPA");
  await shot(page, "05-student-list-active");

  expect(approveCalls.map((call) => call.path)).toEqual([
    "/api/v1/organization/students/31/approve",
    "/api/v1/organization/students/32/approve",
    "/api/v1/organization/students/32/approve",
    "/api/v1/organization/students/33/approve",
  ]);
  await org.close();
});

test("creates the backend student for a demo-only payment, then approves them", async ({ browser, request }) => {
  test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
  const status = await (await request.get("/demo-api/v1/status")).json();
  test.skip(!status.enabled, "Demo payments are not enabled on the dev server");
  fs.mkdirSync(SHOTS, { recursive: true });
  const ASHA = `asha+${RUN}@example.test`;

  // Demo checkout: RPA with batch 11, Python without a batch; no backend student yet.
  const order = await (await request.post("/demo-api/v1/orders", { data: {
    idempotencyKey: `provision-${RUN}`,
    student: { firstName: "Asha", lastName: "Rao", email: ASHA, phone: "9876500041" },
    items: [
      { courseId: "12", courseTitle: "RPA", batchId: "11", batchName: "RPA 1", listPrice: 25000, organizationId: "2" },
      { courseId: "10", courseTitle: "Python", listPrice: 10000, organizationId: "2" },
    ],
  } })).json();
  await request.post(`/demo-api/v1/orders/${order.orderId}/complete`, { data: { outcome: "success", paymentMethod: "UPI", attemptId: "a" } });

  const roster = new Map<number, ReturnType<typeof student>>([[40, student(40, "Existing", "Learner", `existing+${RUN}@example.test`, "Active", 1, "React js")]]);
  const calls: Captured[] = [];
  const org = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await org.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("organizationToken", "seeded-org-token");
    localStorage.setItem("auth_token", "seeded-org-token");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "org-admin");
    localStorage.setItem("organization_id", "2");
    localStorage.setItem("user", JSON.stringify({ organizationId: 2, role: "org-admin", email: "admin@org.test" }));
  });
  await page.route((url) => url.hostname === liveApiHost, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (statusCode: number, body: unknown) => route.fulfill({ status: statusCode, contentType: "application/json", body: JSON.stringify(body) });
    const capture = () => calls.push({ method: req.method(), path: url.pathname, authorization: req.headers()["authorization"] ?? null, body: req.postData() });
    if (url.pathname === "/api/v1/organization/students" && req.method() === "POST") {
      capture();
      const body = JSON.parse(req.postData() ?? "{}");
      roster.set(41, { ...student(41, body.firstName, body.lastName, body.email, "Pending", body.courseId, "RPA"), batchId: body.batchId, phone: body.phone });
      return json(200, { success: true, message: "Student created", data: roster.get(41) });
    }
    if (url.pathname === "/api/StudentBatch" && req.method() === "POST") {
      capture();
      return json(200, { success: true, message: "Students enrolled to batch" });
    }
    if (url.pathname === "/api/v1/organization/students/41/approve") {
      capture();
      roster.set(41, { ...roster.get(41)!, status: "Active" });
      return json(200, { success: true, message: "Student approved", data: { studentId: 41, email: ASHA, status: "Active" } });
    }
    if (url.pathname === "/api/v1/organization/students" && req.method() === "GET") return json(200, { success: true, data: [...roster.values()] });
    if (url.pathname === "/api/v1/organization/batches") {
      return json(200, { success: true, data: [{ batchId: 9, batchName: "Python 1", courseId: 10 }, { batchId: 11, batchName: "RPA 1", courseId: 12 }] });
    }
    return json(200, { success: true, data: [] });
  });

  await page.goto("/organization/students?tab=approvals");
  const cards = page.locator("article", { hasText: ASHA });
  await expect(cards).toHaveCount(2, { timeout: 20000 });
  await expect(cards.first().getByText(/No backend student has this email yet/)).toBeVisible();
  await cards.filter({ hasText: "Python" }).getByRole("button", { name: "Approve" }).click();

  const dialog = page.getByRole("dialog", { name: "Approve Asha Rao?" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Batch for Python").selectOption("9");
  await shot(page, "06-provision-confirm");
  expect(calls).toHaveLength(0);
  await dialog.getByRole("button", { name: "Create & approve" }).click();

  const done = page.getByRole("dialog", { name: "Student approved" });
  await expect(done.getByText("Created backend student #41")).toBeVisible();
  await expect(done.getByText("Python: added to batch #9")).toBeVisible();
  await expect(done.getByText("Approved #41")).toBeVisible();
  await expect(done.getByText("Backend answered 200: Student approved")).toBeVisible();
  await expect(done.getByText("Not reported by the backend").last()).toBeVisible();
  await shot(page, "07-provision-done");

  expect(calls.map((call) => [call.method, call.path, call.authorization])).toEqual([
    ["POST", "/api/v1/organization/students", "Bearer seeded-org-token"],
    ["POST", "/api/StudentBatch", "Bearer seeded-org-token"],
    ["PUT", "/api/v1/organization/students/41/approve", "Bearer seeded-org-token"],
  ]);
  expect(JSON.parse(calls[0].body!)).toEqual({ firstName: "Asha", lastName: "Rao", email: ASHA, phone: "9876500041", courseId: 12, batchId: 11 });
  expect(JSON.parse(calls[1].body!)).toEqual({ batchId: 9, studentIds: [41] });
  expect(calls[2].body).toBeNull();

  await done.getByRole("button", { name: "Done" }).click();
  await expect(cards).toHaveCount(0);
  const demoRequests = (await (await request.get("/demo-api/v1/enrollment-requests", { headers: { Authorization: "Bearer test" } })).json())
    .filter((r: { student: { email: string } }) => r.student.email === ASHA);
  expect(demoRequests.map((r: { course: { title: string }; enrollmentStatus: string; liveStudentId: string }) => [r.course.title, r.enrollmentStatus, r.liveStudentId]))
    .toEqual([["RPA", "Approved", "41"], ["Python", "Approved", "41"]]);
  expect((await (await request.get("/demo-api/v1/dev/outbox")).json()).filter((email: { to: string }) => email.to === ASHA)).toHaveLength(0);

  // Retrying is safe: the roster now has the email, so no second student is created.
  await page.getByRole("button", { name: /Student List/ }).click();
  const row = page.locator("tr, article", { hasText: ASHA }).first();
  await expect(row).toContainText("Active");
  await shot(page, "08-provisioned-student-list");
  await org.close();
});
