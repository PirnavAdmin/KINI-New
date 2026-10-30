import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Student Portal enrollments: My Batch, My Courses and Class Schedule read the
 * same token-scoped GET /api/v1/student/courses. The live API is stubbed with
 * its real body shape ({ success, studentId, courses: [...] }), so this proves
 * the frontend mapping and states, not the backend data.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.resolve(__dirname, "../artifacts/student-enrollments");
const liveApiHost = (() => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    return new URL(env.match(/^VITE_API_BASE_URL=(.+)$/m)![1].trim()).hostname;
  } catch {
    return "";
  }
})();

const pad = (n: number) => String(n).padStart(2, "0");
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const liveClass = (id: number, title: string, courseId: number, batchId: number) => ({
  liveClassId: id, classTitle: title, courseId, batchId, mentorName: "Mentor", scheduledDate: today,
  startTime: "18:00:00", endTime: "19:00:00", status: "Scheduled", meetingPlatform: "Jitsi", meetingLink: `https://meet.example.test/${id}`,
});
const CLASSES = [liveClass(301, "Java Collections Deep Dive", 2, 1), liveClass(302, "Other Org Node Class", 4, 3), liveClass(303, "Python Weekend Lab", 5, 8)];
const COURSES = [
  { courseId: 2, courseName: "Java Full Stack", batchId: 1, batchName: "Java Full Stack 1", mentorId: 1, mentorName: "Srinivas Poorna", enrollmentStatus: "Active" },
  { courseId: 5, courseName: "Python Data", batches: [{ batchId: 8, batchName: "Python Weekend", mentorName: "Ravi Kumar" }] },
];

const signIn = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.clear();
    for (const key of ["auth_token", "token"]) localStorage.setItem(key, "token-enrolled-student");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "student");
    localStorage.setItem("role", "student");
    localStorage.setItem("studentId", "41");
    localStorage.setItem("user", JSON.stringify({ studentId: 41, organizationId: 1, role: "student", firstName: "Test", lastName: "Student", email: "enrolled@example.test" }));
  });
};

const stub = async (page: Page, courses: "enrolled" | "empty" | "fail") => {
  await page.route((url) => url.hostname === liveApiHost, (route) => {
    const url = new URL(route.request().url());
    const json = (status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.pathname === "/api/v1/student/courses") {
      if (courses === "fail") return json(500, { success: false, message: "boom" });
      return json(200, { success: true, studentId: 41, studentName: "Test Student", courses: courses === "enrolled" ? COURSES : [] });
    }
    if (/^\/api\/v1\/live-classes(\/(upcoming|live|completed|today))?$/.test(url.pathname)) return json(200, { success: true, data: CLASSES });
    if (/\/api\/v1\/organization\/batches|\/api\/StudentBatch\/\d+\/students/.test(url.pathname)) return json(403, {});
    return json(200, { success: true, data: [] });
  });
};

const open = async (page: Page, courses: "enrolled" | "empty" | "fail", route: string) => {
  await stub(page, courses);
  await page.goto("/");
  await signIn(page);
  await page.goto(route);
};

test.describe.configure({ mode: "serial" });
test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }));

test("My Batch renders every assigned batch with its mentor", async ({ page }) => {
  await open(page, "enrolled", "/student/batch");
  await expect(page.getByLabel("Java Full Stack 1")).toBeVisible({ timeout: 45000 });
  await expect(page.getByLabel("Python Weekend")).toBeVisible();
  await expect(page.getByLabel("Java Full Stack 1").getByText("Srinivas Poorna")).toBeVisible();
  await expect(page.getByText("No Batch Assigned")).toHaveCount(0);
  await page.screenshot({ path: path.join(SHOTS, "01-my-batch.png"), fullPage: true });
});

test("My Courses renders every enrolled course", async ({ page }) => {
  await open(page, "enrolled", "/student/courses");
  await expect(page.getByText("Java Full Stack", { exact: true }).first()).toBeVisible({ timeout: 45000 });
  await expect(page.getByText("Python Data", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "02-my-courses.png"), fullPage: true });
});

test("Class Schedule shows only classes of the enrolled courses and batches", async ({ page }) => {
  await open(page, "enrolled", "/student/class-schedule");
  await expect(page.getByRole("heading", { name: /Learning Calendar/ })).toBeVisible({ timeout: 45000 });
  await expect(page.getByText("Java Collections Deep Dive").first()).toBeVisible();
  await expect(page.getByText("Python Weekend Lab").first()).toBeVisible();
  await expect(page.getByText("Other Org Node Class")).toHaveCount(0);
  await page.screenshot({ path: path.join(SHOTS, "03-class-schedule.png"), fullPage: true });
});

test("no enrollments shows the empty state", async ({ page }) => {
  await open(page, "empty", "/student/batch");
  await expect(page.getByText("No Batch Assigned")).toBeVisible({ timeout: 45000 });
});

test("a failed enrollment request shows an error, not No Batch Assigned", async ({ page }) => {
  await open(page, "fail", "/student/batch");
  await expect(page.getByRole("alert")).toContainText("Unable to load your batch information.", { timeout: 45000 });
  await expect(page.getByText("No Batch Assigned")).toHaveCount(0);
  await page.screenshot({ path: path.join(SHOTS, "04-my-batch-error.png"), fullPage: true });
});
