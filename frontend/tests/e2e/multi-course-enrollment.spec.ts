import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Organization → Students → Add New Student with several courses.
 *
 * The live API is stubbed (stateful) so no real student is created; every
 * create and StudentBatch call is captured. Contract under test:
 *   POST /api/v1/organization/students  — the student + first course/batch (once)
 *   POST /api/StudentBatch {batchId, studentIds:[id]} — each further course
 *   GET  /api/StudentBatch/student/{id}/enrollments — { studentId, courses: [...] },
 *        read before posting and again to confirm each enrollment was saved
 */

const SHOTS = path.resolve(__dirname, "../artifacts/multi-course");
const liveApiHost = (() => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    return new URL(env.match(/^VITE_API_BASE_URL=(.+)$/m)![1].trim()).hostname;
  } catch {
    return "";
  }
})();

const COURSES = [
  { courseId: 12, courseName: "RPA" }, { courseId: 10, courseName: "Python" }, { courseId: 4, courseName: "nodejs" },
  { courseId: 1, courseName: "React js" }, { courseId: 6, courseName: "Sql" },
  // In the catalogue but with no batch of this organization: must not be offered.
  { courseId: 99, courseName: "Course Without Batch" },
];
const BATCHES = [
  { batchId: 11, batchName: "RPA 1", courseId: 12, courseName: "RPA" }, { batchId: 13, batchName: "RPA 2", courseId: 12, courseName: "RPA" },
  { batchId: 9, batchName: "Python 1", courseId: 10, courseName: "Python" }, { batchId: 3, batchName: "nodejs 1", courseId: 4, courseName: "nodejs" }, { batchId: 15, batchName: "nodejs 2", courseId: 4, courseName: "nodejs" },
  { batchId: 1, batchName: "React js 1", courseId: 1, courseName: "React js" }, { batchId: 7, batchName: "Sql 1", courseId: 6, courseName: "Sql" },
].map((batch) => ({
  ...batch, capacity: 25, enrolledStudents: 2, status: "Active",
  mentorName: { 12: "kadiveti Narendra", 10: "Ravi Mentor" }[batch.courseId] ?? null,
  startDate: batch.courseId === 10 ? "2026-11-02T00:00:00" : null,
  endDate: null,
}));

type Call = { method: string; path: string; body: unknown };

type Options = { failBatchOnce?: number | null; dropBatch?: number | null; existing?: { courseId: number; batchId: number }[] };

const setup = async (page: Page, { failBatchOnce = null, dropBatch = null, existing = [] }: Options = {}) => {
  const calls: Call[] = [];
  const roster: Record<string, unknown>[] = existing.length
    ? [{ studentId: 51, firstName: "Asha", lastName: "Rao", email: "asha@example.test", phone: "9876500051", courseId: existing[0].courseId, batchId: existing[0].batchId, status: "Active" }]
    : [];
  // Server-side enrollments of student 51, as GET .../enrollments reports them.
  const enrolled: { courseId: number; batchId: number }[] = [...existing];
  const asCourse = ({ courseId, batchId }: { courseId: number; batchId: number }) => ({
    studentId: 51, courseId, courseName: COURSES.find((c) => c.courseId === courseId)!.courseName,
    batchId, batchName: BATCHES.find((b) => b.batchId === batchId)!.batchName, enrollmentStatus: "Active",
  });
  let failed = false;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("organizationToken", "seeded-org-token");
    localStorage.setItem("auth_token", "seeded-org-token");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "org-admin");
    localStorage.setItem("organization_id", "2");
    localStorage.setItem("user", JSON.stringify({ organizationId: 2, role: "org-admin" }));
  });
  await page.route((url) => url.hostname === liveApiHost, (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    const body = req.postData() ? JSON.parse(req.postData()!) : null;
    if (url.pathname === "/api/v1/organization/students" && req.method() === "POST") {
      calls.push({ method: "POST", path: url.pathname, body });
      const record = { studentId: 51, ...body, status: "Pending" };
      roster.push(record);
      enrolled.push({ courseId: body.courseId, batchId: body.batchId });
      return json(200, { success: true, data: record });
    }
    if (url.pathname === "/api/StudentBatch" && req.method() === "POST") {
      calls.push({ method: "POST", path: url.pathname, body });
      if (failBatchOnce != null && body.batchId === failBatchOnce && !failed) {
        failed = true;
        return json(500, { success: false, message: "Database timeout" });
      }
      // dropBatch: answers 200 but never stores the enrollment.
      if (body.batchId !== dropBatch) enrolled.push({ courseId: BATCHES.find((b) => b.batchId === body.batchId)!.courseId, batchId: body.batchId });
      return json(200, { success: true, message: "Students enrolled to batch" });
    }
    if (url.pathname === "/api/StudentBatch/student/51/enrollments") {
      calls.push({ method: "GET", path: url.pathname, body: null });
      return json(200, { studentId: 51, courses: enrolled.map(asCourse) });
    }
    if (url.pathname === "/api/v1/organization/students" && req.method() === "GET") return json(200, { success: true, data: roster });
    if (url.pathname === "/api/v1/organization/students/51" && req.method() === "PUT") {
      calls.push({ method: "PUT", path: url.pathname, body });
      return json(200, { success: true, data: { ...roster[0], ...body } });
    }
    if (url.pathname === "/api/v1/organization/students/51") return json(200, { success: true, data: { studentId: 51, firstName: "Asha", lastName: "Rao", email: "asha@example.test", phone: "9876500051", courseId: 12, courseName: "RPA", batchId: 11, batchName: "RPA 1", mentorName: "kadiveti Narendra", status: "Active" } });
    if (url.pathname === "/api/v1/courses") return json(200, { success: true, data: COURSES });
    if (url.pathname === "/api/v1/organization/batches") return json(200, { success: true, data: BATCHES });
    const rosterMatch = url.pathname.match(/^\/api\/StudentBatch\/(\d+)\/students$/);
    if (rosterMatch) {
      const batchId = Number(rosterMatch[1]);
      const primary = enrolled[0];
      const members = primary && primary.batchId !== batchId && enrolled.slice(1).some((e) => e.batchId === batchId)
        ? [{ studentId: 51, firstName: "Asha", lastName: "Rao", courseId: primary.courseId, batchId: primary.batchId, status: "Active" }]
        : [];
      return json(200, { batchId, students: members });
    }
    return json(200, { success: true, data: [] });
  });
  return calls;
};

const openForm = async (page: Page) => {
  await page.goto("/organization/students");
  await page.getByRole("button", { name: /Add Student/ }).first().click();
  const dialog = page.getByRole("dialog", { name: /Add New Student/ });
  await expect(dialog).toBeVisible({ timeout: 30000 });
  await dialog.locator("#student-first-name").fill("Asha");
  await dialog.locator("#student-last-name").fill("Rao");
  await dialog.locator("#student-email").fill("asha@example.test");
  await dialog.locator("#student-phone").fill("9876500051");
  await expect(dialog.locator("#student-course-0 option")).not.toHaveCount(1, { timeout: 20000 });
  return dialog;
};

const pick = async (dialog: Locator, index: number, courseId: number, batchId: number) => {
  if (index > 0) await dialog.getByRole("button", { name: "Add another course" }).click();
  await dialog.locator(`#student-course-${index}`).selectOption(String(courseId));
  await dialog.locator(`#student-batch-${index}`).selectOption(String(batchId));
};

test.describe.configure({ mode: "serial" });
test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }));

test("one course: a single create call, unchanged payload", async ({ page }) => {
  const calls = await setup(page);
  const dialog = await openForm(page);
  await pick(dialog, 0, 12, 11);
  await dialog.getByRole("button", { name: "Add Student", exact: true }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
  expect(calls).toEqual([{ method: "POST", path: "/api/v1/organization/students", body: { firstName: "Asha", lastName: "Rao", email: "asha@example.test", phone: "9876500051", courseId: 12, batchId: 11 } }]);
});

test("only this organization's courses with batches, filtered batches, reset and duplicates", async ({ page }) => {
  await setup(page);
  const dialog = await openForm(page);
  const courseOptions = await dialog.locator("#student-course-0 option").allTextContents();
  expect(courseOptions).not.toContain("Course Without Batch");
  await dialog.locator("#student-course-0").selectOption("12");
  expect(await dialog.locator("#student-batch-0 option").allTextContents()).toEqual(["Select batch", expect.stringMatching(/^RPA 1/), expect.stringMatching(/^RPA 2/)]);
  await dialog.locator("#student-batch-0").selectOption("13");
  // Changing the course clears the incompatible batch.
  await dialog.locator("#student-course-0").selectOption("10");
  await expect(dialog.locator("#student-batch-0")).toHaveValue("");
  await dialog.locator("#student-batch-0").selectOption("9");
  // A course already chosen can't be picked again in another row.
  await dialog.getByRole("button", { name: "Add another course" }).click();
  await expect(dialog.locator('#student-course-1 option[value="10"]')).toBeDisabled();
  await expect(dialog.locator('#student-course-1 option[value="10"]')).toHaveText("Python (already added)");
  // Removing a row before submitting.
  await dialog.getByRole("button", { name: "Remove course 2" }).click();
  await expect(dialog.locator("#student-course-1")).toHaveCount(0);
});

test("two courses with a partial failure: retry re-sends only the failed course", async ({ page }) => {
  const calls = await setup(page, { failBatchOnce: 9 });
  const dialog = await openForm(page);
  await pick(dialog, 0, 12, 11);
  await pick(dialog, 1, 10, 9);
  await page.screenshot({ path: path.join(SHOTS, "01-two-courses.png") });
  await dialog.getByRole("button", { name: "Add Student", exact: true }).click();
  await expect(dialog.getByText("Student saved. 1 of 2 courses enrolled; 1 enrollment failed. Retry sends only the failed ones.")).toBeVisible({ timeout: 20000 });
  await expect(dialog.getByText("Saved", { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Not added: Backend error: Database timeout/)).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "02-partial-failure.png") });
  await dialog.getByRole("button", { name: "Retry failed courses" }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
  expect(calls.map((call) => `${call.method} ${call.path}${call.body && call.path === "/api/StudentBatch" ? ` batch ${(call.body as { batchId: number }).batchId}` : ""}`)).toEqual([
    "POST /api/v1/organization/students",
    "GET /api/StudentBatch/student/51/enrollments",
    "POST /api/StudentBatch batch 9",
    // Retry: re-check, re-send only Python, confirm.
    "GET /api/StudentBatch/student/51/enrollments",
    "POST /api/StudentBatch batch 9",
    "GET /api/StudentBatch/student/51/enrollments",
  ]);
});

test("five courses with different batches: one student, four batch enrollments", async ({ page }) => {
  const calls = await setup(page);
  const dialog = await openForm(page);
  const plan: [number, number][] = [[12, 13], [10, 9], [4, 3], [1, 1], [6, 7]];
  for (const [index, [courseId, batchId]] of plan.entries()) await pick(dialog, index, courseId, batchId);
  await page.screenshot({ path: path.join(SHOTS, "03-five-courses.png"), fullPage: true });
  await dialog.getByRole("button", { name: "Add Student", exact: true }).click();
  await expect(dialog).toBeHidden({ timeout: 30000 });
  // The confirmation toast auto-dismisses, so the outcome is asserted from the requests below.
  expect(calls.filter((call) => call.path === "/api/v1/organization/students")).toHaveLength(1);
  expect(calls.filter((call) => call.path === "/api/StudentBatch").map((call) => (call.body as { batchId: number }).batchId)).toEqual([9, 3, 1, 7]);
});

test("Student Details → Academic: table and Course & Batch cards list every enrollment", async ({ page }) => {
  await setup(page, { existing: [{ courseId: 12, batchId: 11 }, { courseId: 10, batchId: 9 }] });
  await page.goto("/organization/students/51?tab=academic");
  const table = page.getByRole("table");
  await expect(table).toBeVisible({ timeout: 30000 });
  await expect(table.locator("thead th")).toHaveText(["Course", "Batch", "Mentor", "Enrollment Status"], { timeout: 20000 });
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.locator("tbody tr").nth(0)).toHaveText(/RPA\s*RPA 1\s*kadiveti Narendra\s*Active/);
  // React-equivalent second course: its own batch's mentor, not the first course's.
  await expect(table.locator("tbody tr").nth(1)).toHaveText(/Python\s*Python 1\s*Ravi Mentor\s*Active/);

  const first = page.locator("section", { has: page.getByRole("heading", { name: "Course 1 — RPA" }) });
  const second = page.locator("section", { has: page.getByRole("heading", { name: "Course 2 — Python" }) });
  await expect(first).toContainText("RPA 1");
  await expect(first).toContainText("kadiveti Narendra");
  await expect(second).toContainText("Python 1");
  await expect(second).toContainText("Ravi Mentor");
  await expect(second).toContainText("02 Nov 2026");
  await expect(second).not.toContainText("kadiveti Narendra");
  await page.screenshot({ path: path.join(SHOTS, "04-academic-tab.png"), fullPage: true });
});

test("Academic cards: five courses render five cards; an enrollments failure keeps the record's course", async ({ page }) => {
  await setup(page, { existing: [{ courseId: 12, batchId: 11 }, { courseId: 10, batchId: 9 }, { courseId: 4, batchId: 3 }, { courseId: 1, batchId: 1 }, { courseId: 6, batchId: 7 }] });
  await page.goto("/organization/students/51?tab=academic");
  await expect(page.getByRole("heading", { name: /^Course \d — / })).toHaveCount(5, { timeout: 30000 });
  await expect(page.getByRole("heading", { name: "Course 5 — Sql" })).toBeVisible();
});

const openEdit = async (page: Page) => {
  await page.goto("/organization/students?edit=51");
  const dialog = page.getByRole("dialog", { name: /Edit Student/ });
  await expect(dialog).toBeVisible({ timeout: 30000 });
  await expect(dialog.locator("#student-course-0 option")).not.toHaveCount(1, { timeout: 20000 });
  return dialog;
};

test("existing student adds another course: one enrollment, confirmed by GET", async ({ page }) => {
  const calls = await setup(page, { existing: [{ courseId: 12, batchId: 11 }] });
  const dialog = await openEdit(page);
  await pick(dialog, 1, 10, 9);
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
  expect(calls.filter((call) => call.method === "POST").map((call) => [call.path, call.body])).toEqual([["/api/StudentBatch", { batchId: 9, studentIds: [51] }]]);
  expect(calls.filter((call) => call.method === "GET")).toHaveLength(2);
});

test("a course already held in the same batch is not sent again", async ({ page }) => {
  const calls = await setup(page, { existing: [{ courseId: 12, batchId: 11 }, { courseId: 10, batchId: 9 }] });
  const dialog = await openEdit(page);
  await pick(dialog, 1, 10, 9);
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
  expect(calls.filter((call) => call.path === "/api/StudentBatch")).toHaveLength(0);
});

test("the same course in a different batch is refused as a duplicate", async ({ page }) => {
  const calls = await setup(page, { existing: [{ courseId: 12, batchId: 11 }, { courseId: 4, batchId: 15 }] });
  const dialog = await openEdit(page);
  await pick(dialog, 1, 4, 3);
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(dialog.getByText("Not added: Already enrolled in this course (nodejs 2).")).toBeVisible({ timeout: 20000 });
  expect(calls.filter((call) => call.path === "/api/StudentBatch")).toHaveLength(0);
  await page.screenshot({ path: path.join(SHOTS, "05-duplicate-refused.png") });
});

test("a 200 that the GET doesn't confirm is reported as not saved", async ({ page }) => {
  const calls = await setup(page, { dropBatch: 9 });
  const dialog = await openForm(page);
  await pick(dialog, 0, 12, 11);
  await pick(dialog, 1, 10, 9);
  await dialog.getByRole("button", { name: "Add Student", exact: true }).click();
  await expect(dialog.getByText(/Not added: The backend accepted the request but didn't save this enrollment/)).toBeVisible({ timeout: 20000 });
  expect(calls.filter((call) => call.path === "/api/StudentBatch")).toHaveLength(1);
});

test("Students table: one row with every course, aligned batches, +N more, filters on any course", async ({ page }) => {
  await setup(page, { existing: [{ courseId: 12, batchId: 11 }, { courseId: 10, batchId: 9 }, { courseId: 4, batchId: 3 }, { courseId: 1, batchId: 1 }] });
  await page.goto("/organization/students");
  const row = page.locator("tbody tr", { hasText: "asha@example.test" });
  await expect(row).toHaveCount(1, { timeout: 30000 });
  const cells = row.locator("td");
  const courseCell = cells.nth(5);
  await expect(courseCell).toContainText("RPA");
  await expect(courseCell).toContainText("Python");
  await expect(courseCell.getByRole("button", { name: "+2 more" })).toBeVisible({ timeout: 20000 });
  await expect(courseCell).not.toContainText("nodejs");
  await courseCell.getByRole("button", { name: "+2 more" }).click();
  await expect(courseCell).toHaveText(/RPA\s*Python\s*nodejs\s*React js\s*Show less/);
  await expect(cells.nth(6)).toHaveText(/RPA 1\s*Python 1\s*nodejs 1\s*React js 1/);
  await page.screenshot({ path: path.join(SHOTS, "06-students-table.png") });

  // Filtering by any enrolled course or batch finds the one student.
  await page.getByLabel("Course", { exact: true }).selectOption("nodejs");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("Course", { exact: true }).selectOption("All");
  await page.getByLabel("Batch", { exact: true }).selectOption("React js 1");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByText(/Showing 1 to 1 of 1/)).toBeVisible();
});

test("Academic tab: Add course enrolls one more course and confirms it", async ({ page }) => {
  const calls = await setup(page, { existing: [{ courseId: 12, batchId: 11 }] });
  await page.goto("/organization/students/51?tab=academic");
  await page.getByRole("button", { name: "Add course" }).click();
  const course = page.locator("label", { hasText: /^Course/ }).locator("select");
  await expect(course.locator("option", { hasText: "Python" })).toHaveCount(1, { timeout: 20000 });
  await expect(course.locator("option", { hasText: /^RPA$/ })).toHaveCount(0);
  await course.selectOption({ label: "Python" });
  await page.locator("label", { hasText: /^Batch/ }).locator("select").selectOption({ label: "Python 1" });
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const table = page.getByRole("table");
  await expect(table.locator("tbody tr")).toHaveCount(2, { timeout: 20000 });
  await expect(table.locator("tbody tr").nth(1)).toHaveText(/Python\s*Python 1\s*Ravi Mentor\s*Active/);
  expect(calls.filter((call) => call.method === "POST").map((call) => call.body)).toEqual([{ batchId: 9, studentIds: [51] }]);
});
