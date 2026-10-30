// Intercepted regression checks: no real employee records are modified.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ userId: 1, role: 'org-admin', organizationId: 1 }));
  for (const [key, value] of Object.entries({ auth_token: 'test-org-admin', token: 'test-org-admin', role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(key, value);
});
let employees = [
  { employeeId: 42, mentorId: 99, userId: 101, firstName: 'Poorna', lastName: 'Sai', email: 'test-poorna@example.com', phone: '9876543210', role: 'Mentor', employeeType: 'FULL_TIME', status: 'Inactive' },
  { employeeId: 43, userId: 102, firstName: 'Test', lastName: 'Employee', email: 'test-employee@example.com', phone: '9876543211', role: 'Employee', employeeType: 'Contract', status: 'Active' },
];
const writes = [];
let rejectDelete = true;
await context.route('**/*', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  let data = [];
  if (url.pathname === '/api/v1/organization/employees') data = { items: employees, totalCount: employees.length };
  else if (/\/api\/v1\/organization\/employees\/\d+$/.test(url.pathname)) {
    const id = Number(url.pathname.split('/').pop());
    data = employees.find((employee) => employee.employeeId === id);
    if (['PUT', 'DELETE'].includes(request.method())) writes.push({ path: url.pathname, method: request.method(), payload: request.postDataJSON() });
    if (request.method() === 'PUT') { Object.assign(data, request.postDataJSON()); }
    if (request.method() === 'DELETE') {
      if (rejectDelete) return route.fulfill({ status: 409, json: { message: 'Employee has active assignments' } });
      employees = employees.filter((employee) => employee.employeeId !== id);
      data = { success: true };
    }
  } else if (url.pathname.includes('/organization/mentors/')) {
    throw new Error(`Unexpected mentor request: ${request.method()} ${url.pathname}`);
  } else if (url.pathname.includes('/Auth/profile')) data = { userId: 1, role: 'Organization' };
  return route.fulfill({ json: { data } });
});
const page = await context.newPage();
try {
  await page.goto('http://localhost:5173/organization/employees');
  await page.getByRole('button', { name: 'Edit Poorna Sai', exact: true }).click();
  const employmentType = page.locator('label').filter({ hasText: 'Employment Type' }).locator('..').getByRole('button');
  await employmentType.waitFor();
  assert.equal((await employmentType.textContent()).trim(), 'Full-time');
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.getByText('Employee updated successfully.', { exact: true }).waitFor();
  assert.equal(writes[0].path, '/api/v1/organization/employees/42');
  assert.equal(writes[0].payload.employeeType, 'Full-time');
  assert.equal('courseIds' in writes[0].payload, false);
  await page.getByRole('button', { name: 'Edit Test Employee', exact: true }).click();
  await employmentType.waitFor();
  assert.equal((await employmentType.textContent()).trim(), 'Contract');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.ok(await page.getByPlaceholder('Search employees by name, email, phone, or designation...').count());
  for (const width of [1440, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    const first = await page.getByRole('button', { name: 'Edit Poorna Sai', exact: true }).boundingBox();
    const second = await page.getByRole('button', { name: 'Edit Test Employee', exact: true }).boundingBox();
    assert.ok(Math.abs(first.x - second.x) < 1, 'Edit buttons align between rows');
    assert.ok(first.width >= 32 && Math.abs(first.width - second.width) < 1, 'Edit buttons retain consistent usable widths');
  }
  await page.getByRole('button', { name: 'Delete Poorna Sai', exact: true }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Employee has active assignments', { exact: true }).first().waitFor();
  assert.ok(await page.getByRole('button', { name: 'Delete Poorna Sai', exact: true }).count());
  rejectDelete = false;
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Employee deleted successfully.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Delete Poorna Sai', exact: true }).waitFor({ state: 'detached' });
  assert.ok(writes.filter((request) => request.method === 'DELETE').every((request) => request.path.endsWith('/employees/42')));
  console.log('PASS: edit mapping, employee update/delete routing and payload, failed delete retention, search terminology, responsive action alignment.');
} finally {
  await browser.close();
}
