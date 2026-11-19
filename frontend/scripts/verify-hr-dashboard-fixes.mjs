import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1500 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team', email: 'hr@example.test' }));
  for (const [key, value] of Object.entries({ auth_token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value);
});
await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  const date = new Date().toLocaleDateString('en-CA');
  let data = [];
  if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Performance', 'Announcements', 'Calendar', 'Students', 'Resources', 'Batches', 'Settings'].map(moduleName => ({ moduleName, canAccess: true, canView: true, canAdd: true }));
  else if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' };
  else if (url.pathname === '/api/hr/employees') data = { items: [{ employeeId: 1, fullName: 'Test Employee', status: 'Active', role: 'Employee' }] };
  else if (url.pathname === '/api/hr/attendance') data = { items: Array.from({ length: 14 }, (_, index) => {
    const day = new Date(); day.setDate(day.getDate() - index);
    return { employeeId: 2, date: day.toLocaleDateString('en-CA'), status: 'Present' };
  }) };
  else if (url.pathname === '/api/hr/leave') data = [{ leaveId: 1, employeeId: 1, employeeName: 'Test Employee', fromDate: date, toDate: date, status: 'Approved' }];
  return route.fulfill({ json: { data } });
});
try {
  await page.goto('http://127.0.0.1:5175/employee/hr-dashboard');
  await page.locator('.hr-dashboard[aria-busy="false"]').waitFor();
  await page.locator('header').getByRole('navigation', { name: 'Breadcrumb' }).getByText('Dashboard', { exact: true }).waitFor();
  const leaveCard = page.locator('.hrp-kpis > *').filter({ hasText: 'On Leave Today' });
  assert.match(await leaveCard.innerText(), /\b1\b/);
  await page.getByLabel('Date range').selectOption('14');
  await page.waitForTimeout(1000);
  const ticks = await page.locator('.hx-attendance svg text').evaluateAll(nodes => nodes.filter(node => /^\d{2} [A-Za-z]{3}$/.test(node.textContent)).map(node => {
    const rect = node.getBoundingClientRect(); return { x: rect.x, right: rect.right };
  }).sort((a, b) => a.x - b.x));
  assert.ok(ticks.length > 1);
  assert.ok(ticks.every((tick, index) => !index || tick.x >= ticks[index - 1].right), 'Date labels must not overlap');
  for (const width of [1920, 1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.waitForTimeout(150);
    const tabsFit = await page.locator('.hx-tabs').evaluate(node => [...node.children].every(child => child.scrollWidth <= child.clientWidth + 1));
    assert.ok(tabsFit, `Training tab text must fit at width ${width}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `No page overflow at width ${width}`);
  }
  await page.setViewportSize({ width: 1920, height: 1500 });
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/hr-dashboard-fixes.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: header breadcrumb, approved leave count, 14-day chart labels, responsive training tabs; mocked API fixtures.');
} finally {
  await browser.close();
}
