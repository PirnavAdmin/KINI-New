// Verifies the Batches page Students column against StudentBatch roster
// fixtures. Run against a dev server: npx vite --host 127.0.0.1 --port 5187
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5187';
await fs.mkdir('artifacts/batch-student-count', { recursive: true });

const batch = (batchId, batchName, extra = {}) => ({ batchId, batchName, batchCode: `B-${batchId}`, courseId: 101, mentorId: 201, capacity: 30, status: 'Active', startDate: '2026-10-01', endDate: '2026-12-31', ...extra });
// The stored enrolledStudents aggregate is deliberately stale so the test
// proves the column follows the roster instead.
const batches = [
  batch(1, 'Roster Morning', { enrolledStudents: 0 }),
  batch(2, 'Shared Evening', { enrolledStudents: 0 }),
  batch(3, 'Restricted Batch', { enrolledStudents: 9 }),
  batch(4, 'Empty Weekend'),
];
// Student 12 is enrolled in batches 1 and 2; the student list can only name one.
const rosters = {
  1: [{ studentId: 11, firstName: 'Asha' }, { studentId: 12, firstName: 'Bala' }],
  2: [{ studentId: 12, firstName: 'Bala' }, { studentId: 13, firstName: 'Chitra' }, { studentId: 14, firstName: 'Dev' }],
  4: [],
};
const studentList = [
  { studentId: 11, firstName: 'Asha', batchId: 1 },
  { studentId: 12, firstName: 'Bala', batchId: 1 },
  { studentId: 13, firstName: 'Chitra', batchName: 'Shared Evening (old name)' },
  { studentId: 14, firstName: 'Dev' },
];

// The previous calculation, kept here only to record the before values.
const previousCount = (b) => studentList.filter((s) => String(s.batchId ?? '') === String(b.batchId)
  || (String(s.batchName ?? '').trim().toLowerCase() === b.batchName.toLowerCase())).length;

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const rosterCalls = [];
    await context.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (!path.startsWith('/api/')) return route.continue();
      let body = { data: [], success: true };
      const roster = path.match(/\/api\/StudentBatch\/(\d+)\/students$/);
      if (roster) {
        rosterCalls.push(roster[1]);
        if (roster[1] === '3') return route.fulfill({ status: 403, json: { message: 'Forbidden' } });
        body = { batchId: Number(roster[1]), capacity: 30, students: rosters[roster[1]] ?? [] };
      } else if (path.endsWith('/organization/batches')) body = { data: batches, totalRecords: batches.length };
      else if (path.endsWith('/courses')) body = { data: [{ courseId: 101, courseName: 'Full Stack Web Development' }] };
      else if (path.endsWith('/mentors')) body = { data: [{ mentorId: 201, mentorName: 'Rahul Kumar', courseIds: [101], status: true }] };
      else if (/\/students$/i.test(path)) body = { data: studentList };
      await route.fulfill({ json: body });
    });
    await context.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 1, role: 'org-admin', userRole: 'org-admin', firstName: 'Test', lastName: 'Organization' }));
      for (const [key, value] of Object.entries({ auth_token: 'test-organization', token: 'test-organization', role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(key, value);
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${BASE}/organization/batches`);
    await page.getByRole('link', { name: 'Roster Morning', exact: true }).waitFor({ timeout: 90000 }).catch(async (error) => { await page.screenshot({ path: 'artifacts/batch-student-count/load-failure.png' }); console.log(page.url(), errors); throw error; });

    const readCounts = () => page.evaluate(() => {
      const headers = [...document.querySelectorAll('thead th')].map((th) => th.textContent.trim());
      const column = headers.indexOf('Students');
      return Object.fromEntries([...document.querySelectorAll('tbody tr')].map((row) => [
        row.querySelector('a')?.textContent.trim(),
        row.querySelectorAll('td')[column]?.textContent.trim(),
      ]));
    });
    await page.waitForFunction(() => ![...document.querySelectorAll('[aria-label="Loading student count"]')].length);
    const after = await readCounts();
    assert.deepEqual(after, { 'Roster Morning': '2', 'Shared Evening': '3', 'Restricted Batch': '—', 'Empty Weekend': '0' });
    assert.equal(await page.getByLabel('Student count unavailable').count(), 1);
    assert.deepEqual([...new Set(rosterCalls)].sort(), ['1', '2', '3', '4']);
    await page.screenshot({ path: `artifacts/batch-student-count/after-${width}.png`, fullPage: true });

    // A student joins the empty batch; the Refresh button reloads the rosters.
    rosters[4] = [{ studentId: 15, firstName: 'Esha' }];
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.waitForFunction(() => {
      const link = [...document.querySelectorAll('tbody a')].find((a) => a.textContent.trim() === 'Empty Weekend');
      return link?.closest('tr')?.textContent.includes('1');
    });
    const refreshed = await readCounts();
    assert.equal(refreshed['Empty Weekend'], '1');
    rosters[4] = [];

    assert.deepEqual(errors, []);
    const before = Object.fromEntries(batches.map((b) => [b.batchName, String(previousCount(b))]));
    results.push({ width, before, after, refreshed });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await fs.writeFile('artifacts/batch-student-count/results.json', JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
