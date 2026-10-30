import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, timeout: 30000 });
const modules = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Performance', 'Announcements', 'Calendar', 'Students', 'Resources', 'Batches', 'Settings', 'Courses', 'Schedule', 'Reports', 'Assessments'];
async function portal(role) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.addInitScript(role => {
    const user = { employeeId: 7, userId: 91, mentorId: role === 'mentor' ? 7 : undefined, role, userRole: role === 'mentor' ? 'Mentor' : 'HR', department: role === 'mentor' ? 'Training' : 'HR', firstName: role === 'mentor' ? 'Mentor' : 'HR', email: `${role}@example.com` };
    localStorage.setItem('user', JSON.stringify(user));
    for (const [key, value] of Object.entries({ auth_token: 'test-sidebar', token: 'test-sidebar', role, user_role: role, isAuthenticated: 'true' })) localStorage.setItem(key, value);
  }, role);
  await page.route('**/api/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    if (!pathname.startsWith('/api/')) return route.continue();
    const data = pathname.includes('employee-profile')
      ? { employeeId: 7, mentorId: role === 'mentor' ? 7 : undefined, role: role === 'mentor' ? 'Mentor' : 'HR', department: role === 'mentor' ? 'Training' : 'HR' }
      : pathname.includes('/Permission/') ? modules.map(moduleName => ({ moduleName, canAccess: true, canView: true })) : [];
    return route.fulfill({ json: { data } });
  });
  return page;
}
async function appearance(page) {
  return page.locator('aside[data-ui="dashboard-sidebar"]:visible').evaluate(el => {
    const styles = (node, properties) => Object.fromEntries(properties.map(key => [key, getComputedStyle(node)[key]]));
    const box = node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height });
    const item = el.querySelector('nav a .mentor-sidebar-item');
    return {
      rail: { ...box(el), ...styles(el, ['backgroundColor', 'borderRadius']) },
      brand: { ...box(el.querySelector('.sidebar-brand-header')), ...styles(el.querySelector('.sidebar-brand-header'), ['padding', 'backgroundColor']) },
      logo: box(el.querySelector('.mentor-company-logo')),
      toggle: { ...box(el.querySelector('.sidebar-collapse')), ...styles(el.querySelector('.sidebar-collapse'), ['color', 'borderRadius']) },
      section: styles(el.querySelector('nav > div > div'), ['fontSize', 'fontWeight', 'fontFamily', 'letterSpacing', 'color', 'margin', 'padding']),
      item: { ...box(item), ...styles(item, ['padding', 'margin', 'borderRadius', 'backgroundColor', 'color']) },
      label: styles(item.querySelector('span'), ['fontSize', 'fontWeight', 'fontFamily', 'lineHeight']),
      icon: { ...box(item.querySelector('svg')), ...styles(item.querySelector('svg'), ['color']) },
      contentLeft: document.querySelector('.mentor-content-shell').getBoundingClientRect().left,
    };
  });
}
try {
  const hr = await portal('employee'), mentor = await portal('mentor');
  for (const [width, height] of [[1920,1080], [1536,864], [1366,768]]) {
    for (const [page, route] of [[hr, '/employee/hr-dashboard'], [mentor, '/mentor/dashboard']]) {
      await page.setViewportSize({ width, height });
      await page.goto(`http://127.0.0.1:5176${route}`);
      await page.locator('aside[data-ui="dashboard-sidebar"]:visible').waitFor();
      await page.waitForTimeout(400);
    }
    const hrStyle = await appearance(hr), mentorStyle = await appearance(mentor);
    assert.deepEqual(hrStyle, mentorStyle, `HR/Mentor expanded styling differs at ${width}x${height}`);
    assert.equal(hrStyle.rail.width, hrStyle.contentLeft);
    assert.ok(await hr.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await hr.screenshot({ path: `artifacts/hr-mentor-match-${width}x${height}.png` });
    await mentor.screenshot({ path: `artifacts/mentor-reference-${width}x${height}.png` });
    console.log(`PASS ${width}x${height}: all compared sidebar styles match; width ${hrStyle.rail.width}px`);
  }
  for (const page of [hr, mentor]) {
    await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
    await page.waitForTimeout(400);
  }
  const collapsedHr = await appearance(hr), collapsedMentor = await appearance(mentor);
  assert.deepEqual(collapsedHr, collapsedMentor, 'Collapsed sidebar styles differ');
  assert.equal(collapsedHr.rail.width, collapsedHr.contentLeft);
  console.log(`PASS collapsed: both ${collapsedHr.rail.width}px`);
  await hr.goto('http://127.0.0.1:5176/employee/hr-leave/employee/15');
  await hr.locator('aside nav a[href="/employee/hr-leave"][aria-current="page"]').waitFor();
  await hr.goto('http://127.0.0.1:5176/employee/students/24');
  await hr.locator('aside nav a[href="/employee/students"][aria-current="page"]').waitFor();
  assert.equal(await hr.locator('aside [aria-current="page"]').count(), 1);
  for (const [page, route] of [[hr, '/employee/hr-dashboard'], [mentor, '/mentor/dashboard']]) {
    await page.setViewportSize({ width: 820, height: 1000 });
    await page.goto(`http://127.0.0.1:5176${route}`);
    assert.equal(await page.locator('.dashboard-desktop-sidebar').isVisible(), false);
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
    await page.locator('.dashboard-sidebar-drawer aside').waitFor();
    await page.waitForTimeout(400);
  }
  assert.deepEqual(await appearance(hr), await appearance(mentor), 'Tablet drawers differ');
  await hr.setViewportSize({ width: 390, height: 700 });
  await mentor.setViewportSize({ width: 390, height: 700 });
  await hr.waitForTimeout(400);
  assert.deepEqual(await appearance(hr), await appearance(mentor), 'Mobile drawers differ');
  const drawer = hr.locator('.dashboard-sidebar-drawer');
  assert.equal(await drawer.evaluate(el => el.getBoundingClientRect().height), 700);
  await hr.screenshot({ path: 'artifacts/hr-mentor-match-mobile.png' });
  await mentor.screenshot({ path: 'artifacts/mentor-reference-mobile.png' });
  await hr.getByRole('button', { name: 'Close navigation', exact: true }).click();
  await drawer.waitFor({ state: 'detached' });
  console.log('PASS shared expanded/collapsed/tablet/mobile design, layout alignment and nested HR route highlights.');
} finally { await browser.close(); }