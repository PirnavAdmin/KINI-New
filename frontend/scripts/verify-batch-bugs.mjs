import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const results = [];
await fs.mkdir('artifacts/batch-bugs', { recursive: true });
const batch = { batchId: 301, batchName: 'Full Stack Morning', batchCode: 'WEB-301', courseId: 101, courseName: 'Full Stack Web Development', mentorId: 201, mentorName: 'Rahul Kumar', capacity: 30, enrolledStudents: 1, studentsCount: 1, status: 'Active', startDate: '2026-10-01', endDate: '2026-12-31' };
try {
 for (const [width, height] of [[1440,900],[768,1024],[390,844]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  await context.route('**/api/**', async route => {
   const path = new URL(route.request().url()).pathname;
   if (!path.startsWith('/api/')) return route.continue();
   let body = { data: [], success: true };
   if (path.endsWith('/organization/batches')) body = { data: [batch], totalRecords: 1 };
   else if (path.endsWith('/batches/301')) body = { data: batch, success: true };
   else if (path.endsWith('/courses')) body = { data: [{ courseId: 101, courseName: 'Full Stack Web Development' }] };
   else if (path.endsWith('/mentors')) body = { data: [{ mentorId: 201, mentorName: 'Rahul Kumar', courseIds: [101], status: true }] };
   else if (path.endsWith('/available-students')) body = { data: [{ studentId: 102, firstName: 'Bob', lastName: 'Student', email: 'bob@example.com' }] };
   else if (path.endsWith('/students')) body = { batchId: 301, capacity: 30, students: [] };
   else if (/live-classes/.test(path)) body = [];
   await route.fulfill({ json: body });
  });
  await context.addInitScript(() => {
    localStorage.setItem("user", JSON.stringify({ userId: 1, organizationId: 1, role: "org-admin", userRole: "org-admin", firstName: "Test", lastName: "Organization" }));
    for (const [key,value] of Object.entries({ auth_token: "test-organization", token: "test-organization", role: "org-admin", user_role: "org-admin", isAuthenticated: "true" })) localStorage.setItem(key,value);
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5187/organization/batches');
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Edit Full Stack Morning', exact: true }).waitFor();
  await page.screenshot({ path: `artifacts/batch-bugs/list-${width}.png`, fullPage: true });
  const title = await page.getByRole('heading', { level: 1 }).boundingBox();
  const actions = await page.getByLabel('Batch header actions').boundingBox();
  if (width >= 1200) assert.ok(Math.abs(title.y + title.height / 2 - actions.y - actions.height / 2) < 3, "Desktop header actions must align with the title");
  const table = await page.getByRole('columnheader', { name: 'Batch Code' }).count();
  assert.equal(table, 1);
  await page.getByRole('button', { name: 'Edit Full Stack Morning', exact: true }).click();
  const listDialog = page.getByRole('dialog'); await listDialog.waitFor();
  await page.screenshot({ path: `artifacts/batch-bugs/edit-list-${width}.png` });
  await listDialog.locator('input[value="Full Stack Morning"]').waitFor();
  const editList = await listDialog.boundingBox();
  await page.goto('http://127.0.0.1:5187/organization/batches/301/details');
  await page.getByRole('button', { name: 'Students', exact: true }).click();
  await page.getByRole('button', { name: /Add students/i }).click();
  const addDialog = page.getByRole('dialog', { name: 'Add students to batch' }); await addDialog.waitFor();
  await page.getByText('Bob Student', { exact: true }).waitFor();
  await page.screenshot({ path: `artifacts/batch-bugs/add-students-${width}.png` });
  const add = await addDialog.boundingBox();
  assert.ok(add.width <= 673);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Edit batch/i }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit batch' }); await editDialog.waitFor();
  await page.screenshot({ path: `artifacts/batch-bugs/edit-details-${width}.png` });
  const edit = await editDialog.boundingBox();
  for (const box of [editList,add,edit]) {
   assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, JSON.stringify({width,box}));
   assert.ok(Math.abs(box.x + box.width / 2 - width / 2) < 3);
  }
  assert.deepEqual(errors, []);
  results.push({ width, title, actions, editList, add, edit });
  await context.close();
 }
 console.log(JSON.stringify(results, null, 2));
 await fs.writeFile('artifacts/batch-bugs/layout-results.json', JSON.stringify(results, null, 2));
} finally { await browser.close(); }





