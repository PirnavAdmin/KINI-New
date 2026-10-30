// Intercepted API regression check; does not submit leave to a real organization.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [], submissions = [];
  let history = [], failSubmit = false, failHistory = false;
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('token', 'leave-test-session');
    localStorage.setItem('auth_token', 'leave-test-session');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', 'mentor');
    localStorage.setItem('employeeId', '9');
    localStorage.setItem('user', JSON.stringify({ userId: 12, employeeId: 9, mentorId: 21, fullName: 'Test mentor', email: 'mentor@example.com', role: 'mentor' }));
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
    let data = [];
    if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Leave', 'Attendance'].map(moduleName => ({ moduleName, canAccess: true, canView: true }));
    if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, mentorId: 21, role: 'mentor', fullName: 'Test mentor' };
    if (url.pathname === '/api/v1/leave-requests/my') {
      assert.equal(url.search, ''); // Identity comes from the session, not a client-selected employee.
      if (failHistory) return route.fulfill({ status: 500, json: { message: 'History unavailable' } });
      data = history;
    }
    if (url.pathname === '/api/v1/leave-requests' && route.request().method() === 'POST') {
      assert.equal(route.request().headers().authorization, 'Bearer leave-test-session');
      const payload = route.request().postDataJSON();
      submissions.push(payload);
      if (failSubmit) return route.fulfill({ status: 500, json: { message: 'Submission unavailable' } });
      data = { ...payload, leaveRequestId: 41, totalDays: 2, status: 'Pending' };
      history.push(data);
    }
    return route.fulfill({ json: { data } });
  });
  await page.goto('http://127.0.0.1:5173/mentor/dashboard');
  await page.locator('aside').getByRole('link', { name: 'Leave Requests', exact: true }).click();
  await page.getByRole('heading', { name: 'My Leave Requests' }).waitFor();
  assert.ok(page.url().endsWith('/mentor/leave'));
  assert.equal(await page.getByLabel('Reason', { exact: true }).count(), 0);
  await page.goto('http://127.0.0.1:5173/mentor/dashboard');
  await page.getByRole('button', { name: 'Apply leave', exact: true }).click();
  await page.getByLabel('Start Date').fill('2026-10-01');
  await page.getByLabel('End Date').fill('2026-10-02');
  await page.getByLabel('Reason', { exact: true }).fill('Family commitment');
  failSubmit = true;
  await page.getByRole('button', { name: 'Send to HR review' }).click();
  await page.getByRole('alert').filter({ hasText: 'Submission unavailable' }).waitFor();
  assert.equal(await page.getByLabel('Reason', { exact: true }).inputValue(), 'Family commitment');
  failSubmit = false;
  await page.getByRole('button', { name: 'Send to HR review' }).click();
  await page.getByText('Request #41', { exact: true }).waitFor();
  assert.deepEqual(submissions.at(-1), { leaveType: 'Casual', startDate: '2026-10-01', endDate: '2026-10-02', reason: 'Family commitment' });
  await page.reload();
  await page.getByText('Request #41', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('Reason', { exact: true }).count(), 0);
  history[0].status = 'Rejected';
  history[0].rejectionReason = 'Please select a different date';
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByText('Please select a different date', { exact: false }).waitFor();
  await page.screenshot({ path: 'mentor-leave-history-review.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: 'mentor-leave-history-mobile-review.png', fullPage: true });
  failHistory = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'History unavailable' }).waitFor();
  failHistory = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('Request #41', { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: mentor apply/history navigation, authenticated POST, failure retention, reload persistence, HR status/reason refresh, retry, mobile overflow; no runtime errors. All API responses intercepted.');
} finally { await browser.close(); }
