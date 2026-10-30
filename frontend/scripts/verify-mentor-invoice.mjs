// Run with the local Vite server on port 5173. All API traffic is mocked.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const invoice = { invoiceId: 2, invoiceNumber: 'INV-20260908-000002', studentName: 'Test learner',
  courseName: 'Node.js', subTotal: 4500, totalAmount: 4500, paidAmount: 0, taxAmount: 0,
  taxPercentage: 0, status: 'Pending', invoiceDate: '2026-09-08', dueDate: '2026-09-08' };
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], calls = [];
  let classesFail = true;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (localStorage.getItem('isAuthenticated')) return;
    localStorage.setItem('token', 'ui-verification-session');
    localStorage.setItem('auth_token', 'ui-verification-session');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', 'mentor');
    localStorage.setItem('employeeId', '9');
    localStorage.setItem('user', JSON.stringify({ userId: 12, employeeId: 9, firstName: 'Nani', fullName: 'Nani Narendra', email: 'mentor@example.com', role: 'mentor' }));
  });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/api/')) {
      calls.push(url.pathname);
      let data = [];
      if (url.pathname.includes('/Permission/')) data = [
        ['Dashboard', 1], ['Attendance', 4], ['Leave', 5], ['Courses', 6], ['Batches', 7],
        ['LiveClasses', 8], ['Students', 10], ['Assessments', 11], ['Reports', 14], ['Settings', 15],
      ].map(([module, permissionId]) => ({ module, permissionId, canAccess: true, canView: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, fullName: 'Nani Narendra', email: 'mentor@example.com' };
      if (url.pathname.endsWith('/dashboard/courses')) data = [{ courseId: 1, courseName: 'Node.js' }];
      if (url.pathname.endsWith('/dashboard/batches')) data = [{ batchId: 1, batchName: 'Evening batch', studentCount: 3 }];
      if (url.pathname.endsWith('/dashboard/students')) data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      if (url.pathname.endsWith('/dashboard/classes')) {
        if (classesFail) return route.fulfill({ status: 500, json: { message: 'Test failure' } });
        data = [{ id: 1, title: 'Node.js functions', courseName: 'Node.js', batchName: 'Evening batch', classDate: new Date().toISOString().slice(0, 10), startTime: '15:00', status: 'Scheduled' }];
      }
      if (url.pathname === '/api/v1/invoices') data = [invoice];
      if (url.pathname === '/api/v1/invoices/2') data = invoice;
      if (url.pathname === '/api/v1/invoices/2/pdf') return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n%%EOF' });
      return route.fulfill({ json: { data } });
    }
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    return route.continue();
  });
  await page.goto('http://localhost:5173/mentor/dashboard');
  await page.getByText('Upcoming classes are temporarily unavailable.').waitFor();
  await page.getByText('Unable to find your mentor profile in the organization records.').waitFor();
  assert.equal(await page.getByText('React Hooks Quiz', { exact: true }).count(), 0);
  assert.equal(await page.locator('aside:visible').getByText('Assigned Syllabus', { exact: true }).count(), 0);
  assert.equal(calls.filter((path) => path === '/api/mentor/dashboard/courses').length, 1);
  classesFail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).last().click();
  await page.getByText('Node.js functions').first().waitFor();
  assert.equal(calls.some((path) => /dashboard\/(null|undefined|9)(\/|$)/.test(path)), false);
  await page.screenshot({ path: 'mentor-dashboard-review.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('.mentor-sidebar-shell').isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.locator('aside:visible').getByText('My Courses', { exact: true }).waitFor();
  await page.screenshot({ path: 'mentor-dashboard-mobile-review.png', fullPage: true });
  console.log('PASS: mentor widgets without mentorId, persistent profile warning, Retry, permission-filtered sidebar and mobile drawer.');

  await page.evaluate(() => {
    localStorage.setItem('role', 'org-admin');
    localStorage.setItem('user_role', 'org-admin');
    localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 3, role: 'org-admin', name: 'Test organization', email: 'organization@example.com' }));
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:5173/organization/invoices?tab=invoice-list');
  await page.getByText(invoice.invoiceNumber, { exact: true }).first().click();
  await page.getByText('Tax (0%)', { exact: true }).waitFor();
  await page.screenshot({ path: 'invoice-details-review.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.invoice-download').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), `${invoice.invoiceNumber}.pdf`);
  assert.equal(calls.includes('/api/v1/invoices/2/pdf'), true);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('.invoice-details-modal').evaluate((el) => el.scrollWidth > el.clientWidth), false);
  await page.screenshot({ path: 'invoice-details-mobile-review.png', fullPage: true });
  await page.getByRole('button', { name: 'Close modal' }).click();
  await page.locator('.invoice-details-modal').waitFor({ state: 'hidden' });
  assert.deepEqual(errors, []);
  console.log('PASS: invoice API values, 0% tax, backend PDF request/download, modal close and mobile width; no page errors.');
  console.log('Permission requests:', calls.filter((path) => path.includes('/Permission/')));
} finally { await browser.close(); }
