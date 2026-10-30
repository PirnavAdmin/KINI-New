// Integration smoke test; API responses are intercepted, no live records are changed.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    // Login supplies only the platform role; the HR identity arrives later.
    const user = { userId: 91, employeeId: 7, role: 'employee', fullName: 'HR verification', email: 'hr-test@example.com' };
    localStorage.setItem('user', JSON.stringify(user));
    for (const [key, value] of Object.entries({ auth_token: 'hr-ui-test', token: 'hr-ui-test', role: 'employee', user_role: 'employee', employeeId: '7', isAuthenticated: 'true' })) localStorage.setItem(key, value);
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/api/')) {
      requests.push(url.pathname);
      let data = [];
      if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Performance', 'Students', 'Settings', 'Resources', 'Calendar', 'Announcements', 'Batches', 'LiveClasses'].map(module => ({ module, canAccess: true, canView: true, canAdd: true, canEdit: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { userId: 91, employeeId: 7, role: 'employee', professionalDetails: { Department: { Name: 'Human Resources' } }, fullName: 'HR verification' };
      if (url.pathname === '/api/hr/employees') data = [{ employeeId: 7, fullName: 'Imported HR employee', email: 'hr-test@example.com', status: 'Active' }];
      if (url.pathname === '/api/students') data = [{ studentId: 8, fullName: 'Imported HR student', email: 'student-test@example.com', status: 'Active' }];
      if (url.pathname === '/api/hr/departments') data = [{ departmentId: 1, departmentName: 'HR department', description: 'People team' }];
      if (url.pathname.endsWith('/summary')) data = { total: 1 };
      return route.fulfill({ json: { data } });
    }
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    return route.continue();
  });
  const cases = [
    ['/employee/hr-dashboard', 'HR team builds a stronger workplace'],
    ['/employee/hr-employees', 'Imported HR employee'],
    ['/employee/students', 'Imported HR student'],
    ['/employee/hr-attendance', 'Attendance'],
    ['/employee/hr-leave', 'Leave Management'],
  ];
  await page.goto('http://localhost:5173/employee/dashboard');
  await page.waitForURL('**/employee/hr-dashboard');
  await page.getByRole('heading', { name: 'HR team builds a stronger workplace' }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'HR team builds a stronger workplace' }).waitFor();
  console.log('PASS: restored employee login resolves HR profile and redirects; refresh preserves HR dashboard.');
  for (const [path, text] of cases) {
    await page.goto(`http://localhost:5173${path}`);
    await page.getByText(text, { exact: true }).first().waitFor({ timeout: 30000 });
    assert.equal(new URL(page.url()).pathname, path);
    console.log('PASS', path);
  }
  await page.goto('http://localhost:5173/employee/hr-dashboard');
  await page.getByRole('heading', { name: 'HR team builds a stronger workplace' }).waitFor();
  await page.screenshot({ path: '.codex-hr1-import/dashboard-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.codex-hr1-import/dashboard-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile horizontal overflow');
  assert.equal(requests.some(path => path.includes('undefined')), false);
  assert.deepEqual(errors, []);
  console.log('PASS: HR import routes, API wiring, no runtime errors, and mobile width. Uses intercepted API fixtures.');
} finally {
  await browser.close();
}
