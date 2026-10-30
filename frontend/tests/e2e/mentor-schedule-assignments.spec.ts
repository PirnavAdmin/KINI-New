import { test, expect, type Page, type Request } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mentor Schedule Live Class — course/batch options are the mentor's own.
 *
 * The API is stubbed: the organization dropdowns list every mentor's courses
 * and batches, and /api/mentor/dashboard/{courses,batches} answer per token
 * like the real JWT-scoped endpoints. The dialog must offer only the signed-in
 * mentor's assignments and POST only those ids.
 *
 * This proves the frontend scoping; it does not prove the backend rejects a
 * class for an unassigned course/batch — that needs real accounts.
 */

const SHOTS = path.resolve(__dirname, "../artifacts/mentor-schedule");
const liveApiHost = (() => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    return new URL(env.match(/^VITE_API_BASE_URL=(.+)$/m)![1].trim()).hostname;
  } catch {
    return "";
  }
})();

const MENTORS = {
  A: {
    token: "token-mentor-a", mentorId: 7, userId: 101, firstName: "Asha", lastName: "Rao", email: "mentor.a@example.test",
    courses: [{ courseId: 10, courseName: "React" }, { courseId: "10", courseName: "React" }, { courseId: 11, courseName: "Node" }],
    batches: [
      { batchId: 20, batchName: "React Morning", courseId: 10, courseName: "React", mentorId: 7 },
      { batchId: 21, batchName: "React Evening", courseId: 10, courseName: "React", mentorId: 7 },
      { batchId: "20", batchName: "React Morning", courseId: "10", courseName: "React", mentorId: "7" },
      { batchId: 22, batchName: "Node Weekend", courseId: 11, courseName: "Node", mentorId: 7 },
    ],
  },
  B: {
    token: "token-mentor-b", mentorId: 8, userId: 202, firstName: "Bala", lastName: "Iyer", email: "mentor.b@example.test",
    courses: [{ courseId: 30, courseName: "Python" }],
    batches: [{ batchId: 40, batchName: "Python Morning", courseId: 30, courseName: "Python", mentorId: 8 }],
  },
} as const;
type Who = keyof typeof MENTORS;

const ORG_DROPDOWNS = {
  courses: [{ id: 10, name: "React" }, { id: 11, name: "Node" }, { id: 30, name: "Python" }, { id: 31, name: "Go" }],
  batches: [{ id: 20, name: "React Morning" }, { id: 40, name: "Python Morning" }, { id: 41, name: "Go Night" }],
};
const MODULES = ["Dashboard", "Employees", "Courses", "Batches", "Attendance", "Assessments", "Reports", "Live Classes", "Employee Profile", "Students"];

const signIn = async (page: Page, who: Who) => {
  const m = MENTORS[who];
  await page.evaluate((m) => {
    localStorage.clear();
    localStorage.setItem("auth_token", m.token);
    localStorage.setItem("token", m.token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "mentor");
    localStorage.setItem("role", "mentor");
    localStorage.setItem("mentorId", String(m.mentorId));
    localStorage.setItem("userId", String(m.userId));
    localStorage.setItem("organizationId", "1");
    localStorage.setItem("user", JSON.stringify({ mentorId: m.mentorId, userId: m.userId, organizationId: 1, role: "mentor", firstName: m.firstName, lastName: m.lastName, fullName: `${m.firstName} ${m.lastName}`, email: m.email }));
  }, m);
};

const created: unknown[] = [];
const stub = async (page: Page, { batchesFail = false, empty = false } = {}) => {
  await page.route((url) => url.hostname === liveApiHost, (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const token = (req.headers()["authorization"] ?? "").replace("Bearer ", "");
    const who = (Object.keys(MENTORS) as Who[]).find((key) => MENTORS[key].token === token);
    const json = (status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.pathname.startsWith("/api/Permission/")) {
      return json(200, { success: true, data: MODULES.map((module, index) => ({ permissionId: index + 1, moduleName: module, canAccess: true, canView: true, canCreate: true, canEdit: true, canDelete: true })) });
    }
    if (url.pathname === "/api/mentor/dashboard/courses") return json(200, { success: true, data: who && !empty ? MENTORS[who].courses : [] });
    if (url.pathname === "/api/mentor/dashboard/batches") {
      if (batchesFail) return json(500, { success: false, message: "boom" });
      return json(200, { success: true, data: { items: who && !empty ? MENTORS[who].batches : [], totalCount: 0 } });
    }
    if (url.pathname === "/api/v1/organization/courses/10/syllabus") {
      // Batch-tagged completion (proposed contract): Module 1 is done in batch 20 only.
      return json(200, { success: true, data: { modules: [
        { moduleId: 1001, moduleNumber: 1, moduleName: "React.js Fundamentals", batchProgress: [{ batchId: 20, isCompleted: true }] },
        { moduleId: 1002, moduleNumber: 2, moduleName: "Components, Props and State" },
      ] } });
    }
    if (url.pathname === "/api/v1/courses/dropdown") return json(200, { success: true, data: ORG_DROPDOWNS.courses });
    if (url.pathname === "/api/v1/batches/dropdown") return json(200, { success: true, data: ORG_DROPDOWNS.batches });
    if (url.pathname === "/api/v1/live-classes" && req.method() === "POST") {
      created.push(req.postDataJSON());
      return json(200, { success: true, data: { liveClassId: 900 } });
    }
    return json(200, { success: true, data: [] });
  });
};

const openScheduler = async (page: Page) => {
  await page.goto("/mentor/calendar?tab=schedule&create=1");
  const dialog = page.getByRole("dialog", { name: /Schedule Live Class/ });
  await expect(dialog).toBeVisible({ timeout: 30000 });
  return dialog;
};
const optionTexts = (select: ReturnType<Page["locator"]>) => select.locator("option").evaluateAll((nodes) => nodes.filter((n) => (n as HTMLOptionElement).value).map((n) => `${(n as HTMLOptionElement).value}:${n.textContent}`));

test.describe.configure({ mode: "serial" });
test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }));

test("Mentor A sees only A's courses and batches, deduped, and posts A's ids", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request: Request) => { if (new URL(request.url()).hostname === liveApiHost) requests.push(`${request.method()} ${new URL(request.url()).pathname}`); });
  await stub(page);
  await page.goto("/");
  await signIn(page, "A");
  const dialog = await openScheduler(page);
  const course = dialog.getByLabel(/^Course/);
  await expect(course).toBeEnabled();
  expect(await optionTexts(course)).toEqual(["10:React", "11:Node"]);

  await course.selectOption("10");
  const batch = dialog.getByLabel(/^Batch/);
  expect(await optionTexts(batch)).toEqual(["20:React Morning", "21:React Evening"]);
  await batch.selectOption("21");
  await page.screenshot({ path: path.join(SHOTS, "01-mentor-a-options.png") });

  await course.selectOption("11");
  await expect(batch).toHaveValue("");
  expect(await optionTexts(batch)).toEqual(["22:Node Weekend"]);
  await batch.selectOption("22");

  await dialog.getByLabel(/Class Title/).fill("Express routing");
  await dialog.getByLabel(/^Date/).fill("2026-11-02");
  await dialog.getByLabel(/Start Time/).fill("10:00");
  await dialog.getByLabel(/End Time/).fill("11:00");
  await dialog.getByLabel(/Meeting Platform/).selectOption("Zoom");
  await dialog.getByLabel(/Meeting URL/).fill("https://zoom.us/j/555");
  await dialog.getByRole("button", { name: "Schedule Live Class" }).click();
  await expect.poll(() => created.length).toBe(1);
  expect(created[0]).toMatchObject({ courseId: 11, batchId: 22 });

  expect(requests).toContain("GET /api/mentor/dashboard/courses");
  expect(requests).toContain("GET /api/mentor/dashboard/batches");
});

test("Mentor B sees only B's courses and batches", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "B");
  const dialog = await openScheduler(page);
  const course = dialog.getByLabel(/^Course/);
  await expect(course).toBeEnabled();
  expect(await optionTexts(course)).toEqual(["30:Python"]);
  await course.selectOption("30");
  expect(await optionTexts(dialog.getByLabel(/^Batch/))).toEqual(["40:Python Morning"]);
  await page.screenshot({ path: path.join(SHOTS, "02-mentor-b-options.png") });
});

test("a mentor with no assignments sees the empty state", async ({ page }) => {
  await stub(page, { empty: true });
  await page.goto("/");
  await signIn(page, "A");
  const dialog = await openScheduler(page);
  await expect(dialog.getByRole("option", { name: "No courses assigned to you" })).toBeAttached();
  await expect(dialog.getByText(/no course or batch assignments/i)).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "03-empty.png") });
});

test("a failed batches request shows an error, not an empty list", async ({ page }) => {
  await stub(page, { batchesFail: true });
  await page.goto("/");
  await signIn(page, "A");
  const dialog = await openScheduler(page);
  await expect(dialog.getByRole("option", { name: "Couldn't load your courses" })).toBeAttached();
  await expect(dialog.getByText(/could not be loaded/i)).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "04-error.png") });
});

test("a module completed in one batch is disabled there and open in another batch", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "A");
  const dialog = await openScheduler(page);
  await expect(dialog.getByLabel(/^Course/)).toBeEnabled();
  await dialog.getByLabel(/^Course/).selectOption("10");
  await dialog.getByLabel(/^Batch/).selectOption("20");
  const moduleSelect = dialog.getByLabel(/^Module/);
  await expect(moduleSelect).toBeEnabled();
  const done = moduleSelect.locator('option[value="1001"]');
  await expect(done).toHaveText("Module 1 — React.js Fundamentals (Completed)");
  // toBeDisabled() does not read <option disabled>; check the DOM property.
  expect(await done.evaluate((node) => (node as HTMLOptionElement).disabled)).toBe(true);
  await moduleSelect.selectOption("1002");
  await page.screenshot({ path: path.join(SHOTS, "05-module-completed-batch-20.png") });

  await dialog.getByLabel(/^Batch/).selectOption("21");
  await expect(moduleSelect.locator('option[value="1001"]')).toHaveText("Module 1 — React.js Fundamentals");
  expect(await moduleSelect.locator('option[value="1001"]').evaluate((node) => (node as HTMLOptionElement).disabled)).toBe(false);
  await expect(moduleSelect).toHaveValue("1002");
});
