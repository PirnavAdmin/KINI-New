// Stateful intercepted API test. Sessions are seeded; real authentication is not tested.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const catalog = [{ permissionId: 1, moduleName: 'Dashboard' }, { permissionId: 2, moduleName: 'Employees' }, { permissionId: 5, moduleName: 'Attendance' }];
let saved = catalog.map(row => ({ ...row, canAccess: false, canView: false, canAdd: false, canEdit: false, canDelete: false }));
let saves = 0;
const employee = { employeeId: 7, userId: 91, firstName: 'HR', lastName: 'Verification', email: 'hr-test@example.com', role: 'HR', status: 'Active' };
const errors = [];
async function session(role) {
  const context = await browser.newContext();
  await context.addInitScript(role => {
    const user = role === 'employee'
      ? { employeeId: 7, userId: 91, role: 'employee', email: 'hr-test@example.com' }
      : { userId: 1, role: 'org-admin', organizationId: 1 };
    localStorage.setItem('user', JSON.stringify(user));
    for (const [key, value] of Object.entries({ auth_token: `test-${role}`, token: `test-${role}`, role, user_role: role, isAuthenticated: 'true' })) localStorage.setItem(key, value);
  }, role);
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
    let data = [];
    if (url.pathname === '/api/Permission/modules') data = catalog;
    else if (url.pathname.startsWith('/api/Permission/roles/')) data = catalog.map(row => ({ ...row, canAccess: false, canView: false }));
    else if (url.pathname === '/api/Permission/employees/7') {
      if (route.request().method() === 'PUT') { saved = route.request().postDataJSON(); saves++; }
      data = saved.map(row => ({ ...row, moduleName: catalog.find(module => module.permissionId === row.permissionId)?.moduleName }));
    } else if (url.pathname === '/api/v1/organization/employees') data = { items: [employee], totalCount: 1 };
    else if (url.pathname === '/api/v1/organization/employees/7') data = employee;
    else if (url.pathname.includes('employee-profile')) data = { ...employee, department: 'HR' };
    else if (url.pathname.includes('/Auth/profile')) data = role === 'employee' ? employee : { userId: 1, role: 'Organization' };
    else if (url.pathname === '/api/hr/employees') data = [employee];
    return route.fulfill({ json: { data } });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return { context, page };
}
try {
  const admin = await session('org-admin');
  await admin.page.goto('http://127.0.0.1:5173/organization/employees');
  await admin.page.getByRole('button', { name: /Assign HR module permissions for/ }).click();
  await admin.page.getByRole('button', { name: 'Manage HR access', exact: true }).click();
  await admin.page.getByRole('button', { name: 'Mark all', exact: true }).click();
  await admin.page.getByRole('button', { name: 'Save HR permissions', exact: true }).click();
  await admin.page.getByText('HR permissions updated successfully.', { exact: true }).waitFor();
  assert.equal(saves, 1);
  assert.ok(saved.every(row => row.canAccess && row.canView));
  assert.equal(await admin.page.evaluate(() => localStorage.getItem('kini_hr_users_v1')), null);
  console.log('PASS: Organization HR Access saves full catalog grants through PUT, without a local HR record.');

  const hr = await session('employee');
  await hr.page.goto('http://127.0.0.1:5173/employee/dashboard');
  await hr.page.waitForURL('**/employee/hr-dashboard');
  await hr.page.getByRole('heading', { name: 'HR dashboard' }).waitFor();
  assert.ok(await hr.page.locator('aside').getByRole('link', { name: 'Employees', exact: true }).count());
  await hr.page.reload();
  await hr.page.getByRole('heading', { name: 'HR dashboard' }).waitFor();
  await hr.page.goto('http://127.0.0.1:5173/employee/hr-employees');
  await hr.page.getByText('hr-test@example.com', { exact: true }).first().waitFor();
  console.log('PASS: separate employee session resolves HR profile, redirects, refreshes, and opens authorized direct route.');

  await admin.page.getByRole('button', { name: 'Manage HR access', exact: true }).click();
  const employeeRow = admin.page.getByText('Employees', { exact: true }).last().locator('..').locator('..');
  await employeeRow.getByRole('button', { name: /access: allowed$/ }).click();
  await admin.page.getByRole('button', { name: 'Save HR permissions', exact: true }).click();
  await admin.page.waitForFunction(() => !document.body.textContent.includes('Saving...'));
  assert.equal(saves, 2);
  assert.equal(saved.find(row => row.permissionId === 2).canAccess, false);
  await hr.page.goto('http://127.0.0.1:5173/employee/hr-dashboard');
  await hr.page.getByRole('heading', { name: 'HR dashboard' }).waitFor();
  assert.equal(await hr.page.locator('aside').getByRole('link', { name: 'Employees', exact: true }).count(), 0);
  await hr.page.goto('http://127.0.0.1:5173/employee/hr-employees');
  await hr.page.waitForURL('**/unauthorized');
  assert.deepEqual(errors, []);
  console.log('PASS: admin revocation removes sidebar entry and denies direct HR route after reload. No runtime errors.');
} finally { await browser.close(); }

