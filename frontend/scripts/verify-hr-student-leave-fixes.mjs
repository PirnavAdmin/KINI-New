import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ employeeId: 7, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', email: 'hr@example.test' }));
  for (const [key, value] of Object.entries({ auth_token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value);
});
await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  let data = [];
  if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Students', 'Resources'].map(moduleName => ({ moduleName, canAccess: true, canView: true, canAdd: true, canEdit: true, canExport: true }));
  else if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' };
  else if (url.pathname === '/api/hr/leave/balance/42') data = { employeeId: 42, remainingDays: 8 };
  else if (url.pathname === '/api/hr/leave') data = { items: [{ leaveId: 1, employeeId: 42, employeeName: 'Test Employee', status: 'Approved', fromDate: '2026-11-05', toDate: '2026-11-05' }], totalPages: 1 };
  else if (url.pathname === '/api/hr/employees') data = { items: [{ employeeId: 42, fullName: 'Test Employee' }], totalPages: 1 };
  else if (url.pathname === '/api/students') data = { items: [{ studentId: 1, fullName: 'Test Student', status: false }], totalPages: 1 };
  else if (url.pathname === '/api/hr/attendance') data = { items: [], totalPages: 1 };
  return route.fulfill({ json: { data } });
});
try {
  for (const path of ['/employee/hr-attendance', '/employee/hr-leave']) {
    await page.goto(`http://127.0.0.1:5175${path}`);
    await page.locator('.hr-page').waitFor();
    const gap = await page.evaluate(() => document.querySelector('.hr-page').getBoundingClientRect().left - document.querySelector('.dashboard-desktop-sidebar').getBoundingClientRect().right);
    assert.ok(gap >= 12, `${path} must have a gutter beside the sidebar; actual gap ${gap}`);
  }
  await page.getByRole('button', { name: 'Balance', exact: true }).click();
  const balance = page.getByRole('dialog', { name: 'Leave balance' });
  await balance.getByText('8', { exact: true }).waitFor();
  await page.goto('http://127.0.0.1:5175/employee/students');
  await page.getByRole('button', { name: 'Test Student' }).waitFor();
  await page.getByRole('checkbox', { name: 'Select row', exact: true }).check();
  await page.getByRole('button', { name: 'Export selected', exact: true }).click();
  await page.getByText('Exported 1 record.', { exact: true }).waitFor();
  const toast = page.locator('.hr-export-toast');
  const rect = await toast.boundingBox();
  assert.ok(rect.x >= 0 && rect.x + rect.width <= 1440);
  assert.equal(await toast.evaluate(node => getComputedStyle(node).display), 'flex');
  console.log('PASS: attendance/leave sidebar gutters, balance action, student export toast placement (mocked API data).');
} finally { await browser.close(); }
