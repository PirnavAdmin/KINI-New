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
  if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Batches', 'Students'].map(moduleName => ({ moduleName, canAccess: true, canView: true }));
  else if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' };
  else if (url.pathname === '/api/v1/organization/batches') data = { items: [{ batchId: 7, batchName: 'Test Batch', courseName: 'Advanced Full Stack Development', studentsCount: 99, status: 'Active', startDate: '2026-11-01' }], totalPages: 1, totalCount: 1 };
  else if (url.pathname === '/api/StudentBatch/7/students') data = { students: [{ studentId: 1, status: 'Active' }, { studentId: 1, status: 'Active' }, { studentId: 2, status: 'Rejected' }] };
  else if (url.pathname === '/api/v1/organization/students') data = [{ studentId: 3, batchId: 7, status: 'Active' }];
  return route.fulfill({ json: { data } });
});
try {
  await page.goto('http://127.0.0.1:5175/employee/batches');
  await page.getByText('2 Students', { exact: true }).waitFor();
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  assert.match(await crumbs.innerText(), /Batches/);
  assert.ok(!(await crumbs.innerText()).includes('Employee'));
  for (const width of [1440, 1280, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const fits = await page.locator('.hrb-filters select').evaluateAll(nodes => nodes.every(node => {
      const style = getComputedStyle(node);
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); ctx.font = style.font;
      const available = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return ctx.measureText(node.selectedOptions[0].textContent).width <= available;
    }));
    assert.ok(fits, `Filter labels fit at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No page overflow at ${width}px`);
  }
  console.log('PASS: batch breadcrumb, reconciled student count, filter labels and mobile overflow (mocked API data).');
} finally { await browser.close(); }
