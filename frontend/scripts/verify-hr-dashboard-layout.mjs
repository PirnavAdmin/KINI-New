import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  const user = { employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team', email: 'hr@example.com' };
  localStorage.setItem('user', JSON.stringify(user));
  for (const [key, value] of Object.entries({ auth_token: 'test-hr', token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value);
});
const calls = [];
let failAttendance = false;
await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (!url.pathname.startsWith('/api/')) return ['localhost','127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  calls.push(url.pathname);
  let data = [];
  if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard','Employees','Attendance','Leave','Performance','Announcements','Calendar','Students','Resources','Batches','Settings'].map(moduleName => ({ moduleName, canAccess: true, canView: true }));
  else if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' };
  else if (url.pathname === '/api/hr/employees/summary') data = { totalEmployees: 6, trainersMentors: 2, administrativeStaff: 3, academicStaff: 1, onLeaveToday: 0 };
  else if (url.pathname === '/api/hr/employees') data = { items: Array.from({ length: 6 }, (_, i) => ({ employeeId: i+1, fullName: `Employee ${i+1}`, status: 'Active', role: i < 2 ? 'Mentor' : 'Employee', departmentName: i < 2 ? 'Training' : 'Operations' })) };
  else if (url.pathname === '/api/hr/attendance') {
    if (failAttendance) return route.fulfill({ status: 500, json: { message: 'Unavailable' } });
    data = { items: [{ employeeName: 'Team member', date: new Date().toLocaleDateString('en-CA'), status: 'Late' }, { date: new Date().toLocaleDateString('en-CA'), status: 'OnLeave' }] };
  }
  else if (url.pathname === '/api/hr/leave') data = [{ leaveId: 1, employeeName: 'Test employee', leaveType: 'Annual', fromDate: '2026-09-18', toDate: '2026-09-19', status: 'Pending' }];
  else if (url.pathname === '/api/employee/syllabus') data = [{ courseName: 'Assigned course', dueDate: '2026-10-01', progress: 25, status: 'Assigned' }];
  else if (url.pathname === '/api/students') data = [{ fullName: 'Dashboard student', courseName: 'Web development', status: 'Active' }];
  else if (url.pathname === '/api/hr/resources') data = [{ name: 'Employee handbook', category: 'Onboarding', fileType: 'PDF' }];
  return route.fulfill({ json: { data } });
});
try {
  await page.goto('http://127.0.0.1:5175/employee/hr-dashboard');
  await page.getByRole('heading', { name: 'HR dashboard', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('.hr-dashboard')?.getAttribute('aria-busy') === 'false');
  assert.equal(await page.getByText('Sample data', { exact: false }).count(), 0);
  assert.equal(await page.locator('.hr-kpi').count(), 7);
  for (const title of ['Batches', 'Assigned Syllabus', 'Students', 'Resources']) {
    await page.locator('.hr-module-previews').getByRole('heading', { name: title, exact: true }).waitFor();
  }
  await page.getByText('Dashboard student', { exact: true }).waitFor();
  await page.getByText('Employee handbook', { exact: true }).waitFor();
  await page.getByText('Assigned course', { exact: true }).waitFor();
  const sidebarPaths = await page.locator('aside a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
  const dashboardPaths = await page.locator('.hr-dashboard a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
  for (const path of sidebarPaths.filter(path => path.startsWith('/employee/') && !path.endsWith('/hr-dashboard'))) {
    assert.ok(dashboardPaths.includes(path), `Sidebar module missing from dashboard: ${path}`);
  }
  assert.equal(await page.locator('.hr-kpi').filter({ hasText: 'Present today' }).locator('strong').textContent(), '1');
  assert.equal(await page.locator('.hr-kpi').filter({ hasText: 'On leave today' }).locator('strong').textContent(), '1');
  const bounds = await page.evaluate(() => ({ sidebar: document.querySelector('aside').getBoundingClientRect().right, content: document.querySelector('.mentor-content-shell').getBoundingClientRect().left }));
  assert.ok(Math.abs(bounds.sidebar - bounds.content) < 2, JSON.stringify(bounds));
  await page.screenshot({ path: 'hr-dashboard-desktop-review.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'hr-dashboard-mobile-review.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  failAttendance = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Attendance could not' }).waitFor();
  assert.equal(await page.locator('.hr-kpi').filter({ hasText: 'Present today' }).locator('strong').textContent(), '—');
  assert.ok(!calls.some(path => path.includes('EmployeeAttendance')));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:5175/employee/hr-employees');
  await page.locator('.hr-summary-card').first().waitFor();
  const metrics = await page.locator('.hr-summary-card').evaluateAll(cards => cards.map(card => ({ y: card.getBoundingClientRect().y, height: card.getBoundingClientRect().height })));
  assert.equal(metrics.length, 5);
  assert.ok(metrics.every(card => card.height < 90 && Math.abs(card.y - metrics[0].y) < 2));
  await page.screenshot({ path: 'hr-employees-compact-review.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  assert.deepEqual(errors, []);
  console.log('PASS: desktop alignment, mobile overflow, live HR widgets, normalized attendance, failure states; no sample records or runtime errors.');
} finally { await browser.close(); }

