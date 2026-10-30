import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Student Portal class isolation (frontend defence).
 *
 * The live API is stubbed to behave like a LEAKING backend: every live-class
 * list returns both organizations' classes. GET /api/v1/student/courses is
 * answered per token, like the real token-scoped endpoint. The pages must show
 * and open only the signed-in student's own classes.
 *
 * This proves the frontend withholds out-of-scope rows; it does not prove the
 * backend is fixed — that needs real accounts against the live API.
 */

const SHOTS = path.resolve(__dirname, "../artifacts/class-isolation");
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
const at = (minutesFromNow: number) => {
  const d = new Date(Date.now() + minutesFromNow * 60000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

// Organization A: course 12 (RPA), batch 11. Organization B: course 4 (nodejs), batch 3.
const liveClass = (id: number, title: string, courseId: number, courseName: string, batchId: number | null, status: string, start: number, end: number) => ({
  liveClassId: id, classTitle: title, courseId, courseName, batchId, batchName: batchId ? `${courseName} ${batchId}` : null,
  mentorName: courseId === 12 ? "Org A Mentor" : "nani narendra", scheduledDate: today, startTime: at(start), endTime: at(end),
  status, meetingPlatform: "Jitsi", meetingLink: `https://meet.example.test/class-${id}`,
});
const CLASSES = [
  liveClass(101, "RPA Bots Lab", 12, "RPA", 11, "Scheduled", 120, 180),
  liveClass(201, "node js fundamental", 4, "nodejs", 3, "Live", -5, 55),
  liveClass(202, "fundamentals", 4, "nodejs", null, "Scheduled", 240, 300),
];

const STUDENTS = {
  A: { token: "token-student-a", studentId: 31, organizationId: 1, firstName: "Sai", lastName: "Narayana", email: "student.a@example.test", courses: [{ courseId: 12, courseName: "RPA", batchId: 11, enrollmentStatus: "Approved" }] },
  B: { token: "token-student-b", studentId: 77, organizationId: 2, firstName: "Ravi", lastName: "B", email: "student.b@example.test", courses: [{ courseId: 4, courseName: "nodejs", batchId: 3, enrollmentStatus: "Approved" }] },
  NEW: { token: "token-student-new", studentId: 88, organizationId: 1, firstName: "New", lastName: "Learner", email: "new@example.test", courses: [{ courseId: 12, courseName: "RPA", batchId: 11, enrollmentStatus: "PendingApproval" }] },
} as const;
type Who = keyof typeof STUDENTS;

const signIn = async (page: Page, who: Who) => {
  const s = STUDENTS[who];
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem("auth_token", s.token);
    localStorage.setItem("token", s.token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user_role", "student");
    localStorage.setItem("role", "student");
    localStorage.setItem("studentId", String(s.studentId));
    localStorage.setItem("organizationId", String(s.organizationId));
    localStorage.setItem("user", JSON.stringify({ studentId: s.studentId, organizationId: s.organizationId, role: "student", firstName: s.firstName, lastName: s.lastName, email: s.email }));
  }, s);
};

const joinCalls: string[] = [];
const stub = async (page: Page, { coursesFail = false } = {}) => {
  await page.route((url) => url.hostname === liveApiHost, (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const token = (req.headers()["authorization"] ?? "").replace("Bearer ", "");
    const who = (Object.keys(STUDENTS) as Who[]).find((key) => STUDENTS[key].token === token);
    const json = (status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.pathname === "/api/v1/student/courses") {
      if (coursesFail) return json(500, { success: false, message: "boom" });
      return json(200, { success: true, data: who ? STUDENTS[who].courses : [] });
    }
    const join = url.pathname.match(/^\/api\/v1\/live-classes\/(\d+)\/join$/);
    if (join) {
      joinCalls.push(`${who}:${join[1]}`);
      return json(200, { success: true, data: { meetingLink: `https://meet.example.test/class-${join[1]}` } });
    }
    if (/^\/api\/v1\/live-classes(\/(upcoming|live|completed|today))?$/.test(url.pathname)) {
      // The leak: every student gets every organization's classes.
      return json(200, { success: true, data: CLASSES });
    }
    return json(200, { success: true, data: [] });
  });
};

const openSchedule = async (page: Page) => {
  await page.goto("/student/class-schedule");
  await expect(page.getByRole("heading", { name: /Learning Calendar/ })).toBeVisible({ timeout: 30000 });
};

test.describe.configure({ mode: "serial" });
test.skip(!liveApiHost, "VITE_API_BASE_URL is needed to stub the live API host");
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }));

test("Organization A student sees only Organization A classes", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "A");
  await openSchedule(page);
  await expect(page.getByText("RPA Bots Lab").first()).toBeVisible();
  await expect(page.getByText("node js fundamental")).toHaveCount(0);
  await expect(page.getByText("fundamentals", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: path.join(SHOTS, "01-org-a-student.png") });
});

test("Organization B student sees only Organization B classes", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "B");
  await openSchedule(page);
  await expect(page.getByText("node js fundamental").first()).toBeVisible();
  await expect(page.getByText("RPA Bots Lab")).toHaveCount(0);
  await page.screenshot({ path: path.join(SHOTS, "02-org-b-student.png") });
});

test("Organization A student opening an Organization B class URL is refused without joining", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "A");
  joinCalls.length = 0;
  await page.goto("/student/classes/201/join");
  await expect(page.getByText("You don't have access to this class.", { exact: false })).toBeVisible({ timeout: 30000 });
  expect(joinCalls).toEqual([]);
  await page.screenshot({ path: path.join(SHOTS, "03-org-a-denied-org-b-class.png") });
});

test("a student with only a pending enrollment sees no classes", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "NEW");
  await openSchedule(page);
  await expect(page.getByText("No upcoming classes yet.")).toBeVisible();
  for (const title of ["RPA Bots Lab", "node js fundamental"]) await expect(page.getByText(title)).toHaveCount(0);
});

test("switching accounts shows only the new student's classes", async ({ page }) => {
  await stub(page);
  await page.goto("/");
  await signIn(page, "A");
  await openSchedule(page);
  await expect(page.getByText("RPA Bots Lab").first()).toBeVisible();
  await signIn(page, "B");
  await openSchedule(page);
  await expect(page.getByText("node js fundamental").first()).toBeVisible();
  await expect(page.getByText("RPA Bots Lab")).toHaveCount(0);
});

test("if enrollments can't be loaded, no class is shown", async ({ page }) => {
  await stub(page, { coursesFail: true });
  await page.goto("/");
  await signIn(page, "A");
  await openSchedule(page);
  await expect(page.getByText(/could not verify your course enrollments/)).toBeVisible();
  for (const title of ["RPA Bots Lab", "node js fundamental", "fundamentals"]) await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});
