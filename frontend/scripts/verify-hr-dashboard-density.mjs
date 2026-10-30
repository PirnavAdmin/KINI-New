import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1272, height: 900 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team' }))
  for (const [key, value] of Object.entries({ auth_token: 'test-hr', token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value)
})
await page.route('**/*', route => {
  const url = new URL(route.request().url())
  if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort()
  let data = []
  if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Performance', 'Announcements', 'Calendar', 'Students', 'Resources', 'Batches', 'Settings'].map(moduleName => ({ moduleName, canAccess: true, canView: true, canAdd: true }))
  else if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' }
  else if (url.pathname === '/api/hr/employees') data = { items: Array.from({ length: 7 }, (_, i) => ({ employeeId: i + 1, fullName: `Employee ${i + 1}`, status: 'Active', role: i < 3 ? 'Mentor' : 'HR' })) }
  else if (url.pathname === '/api/hr/attendance') data = { items: Array.from({ length: 7 }, (_, i) => ({ date: `2026-09-${24 + i}`, status: i === 1 ? 'Present' : 'Absent' })) }
  else if (url.pathname === '/api/hr/leave') data = Array.from({ length: 4 }, (_, i) => ({ leaveId: i + 1, employeeName: 'Test employee', leaveType: i % 2 ? 'Work From Home' : 'Sick', fromDate: '2026-10-01', toDate: '2026-10-02', days: 2, status: 'Pending' }))
  else if (/Batch/i.test(url.pathname)) data = [{ batchName: 'AI&ML 1', status: 'Active' }, { batchName: '.Net 1', status: 'Upcoming' }, { batchName: 'Devops 1', status: 'Completed' }]
  else if (/students/i.test(url.pathname)) data = Array.from({ length: 3 }, (_, i) => ({ fullName: `Dashboard student ${i + 1}`, courseName: 'nodejs', batchName: 'nodejs 1', status: 'Active' }))
  return route.fulfill({ json: { data } })
})
const measure = () => page.evaluate(() => {
  const root = document.querySelector('.hr-dashboard')
  const rect = el => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })
  return {
    width: root.clientWidth, height: root.getBoundingClientRect().height,
    cards: [...root.querySelectorAll('.hrp-kpi')].map(rect),
    hero: rect(root.querySelector('.hrp-hero')),
    rows: [...root.querySelectorAll('.hrd-row')].map(row => [...row.children].map(rect)),
    previews: [...root.querySelectorAll('.hrd-mini')].map(rect),
    filters: [...root.querySelector('.hrd-filters').children].map(rect),
    overflow: document.documentElement.scrollWidth > innerWidth,
    sidebar: document.querySelector('aside[data-ui="dashboard-sidebar"]').getBoundingClientRect().right,
    content: document.querySelector('.mentor-content-shell').getBoundingClientRect().left,
    clippedLabels: [...root.querySelectorAll('.hrp-kpi__label, .hrd-mini header b')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent),
  }
})
// The application scrolls inside main; expose that canvas only while capturing
// so fullPage includes the lower widgets instead of stopping at the viewport.
const screenshot = path => page.screenshot({ path, fullPage: true, style: `
  [data-dashboard-role] { height: auto !important; }
  .mentor-content-shell { overflow: visible !important; }
  .mentor-content-shell > main { overflow: visible !important; flex: none !important; }
` })
try {
  await page.goto(process.env.HR_DENSITY_URL || 'http://127.0.0.1:5175/employee/hr-dashboard')
  await page.waitForFunction(() => document.querySelector('.hr-dashboard')?.getAttribute('aria-busy') === 'false')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const density = await page.locator('style[data-vite-dev-id$="hrDashboardDensity.css"]').textContent()
  await page.locator('style[data-vite-dev-id$="hrDashboardDensity.css"]').evaluate(el => { el.textContent = '' })
  await page.waitForTimeout(250)
  const before = await measure()
  await screenshot('artifacts/hr-density-before-1272.png')
  await page.locator('style[data-vite-dev-id$="hrDashboardDensity.css"]').evaluate((el, css) => { el.textContent = css }, density)
  await page.waitForTimeout(250)
  const after = await measure()
  assert.ok(after.height < before.height * .85, `Expected substantial height reduction: ${before.height} -> ${after.height}`)
  console.log(JSON.stringify({ beforeHeight: before.height, afterHeight: after.height, reduction: `${Math.round((1 - after.height / before.height) * 100)}%` }))
  for (const width of [1272, 1366, 1440, 1536, 1920, 1024, 820, 768, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(250)
    const layout = await measure()
    assert.equal(layout.cards.length, 6)
    assert.equal(layout.overflow, false, `Page overflow at ${width}`)
    assert.deepEqual(layout.clippedLabels, [], `Clipped labels at ${width}`)
    if (layout.width >= 1000) {
      assert.ok(layout.cards.every(card => Math.abs(card.y - layout.cards[0].y) < 2), `KPI wrapping at ${width}`)
      assert.ok(layout.previews.every(card => Math.abs(card.y - layout.previews[0].y) < 2), `Preview wrapping at ${width}`)
      assert.ok(layout.filters.every(control => Math.abs(control.y - layout.filters[0].y) < 2), `Filter wrapping at ${width}`)
    }
    if (layout.width >= 760) for (const row of layout.rows) assert.ok(Math.abs(row[0].y - row[1].y) < 2, `Sections stacked at ${width}`)
    if (width >= 1024) assert.ok(Math.abs(layout.sidebar - layout.content) < 2, `Sidebar offset at ${width}`)
    await screenshot(`artifacts/hr-density-${width}.png`)
    console.log(JSON.stringify({ viewport: width, content: layout.width, height: layout.height, kpiRows: new Set(layout.cards.map(card => card.y)).size }))
  }
  await page.setViewportSize({ width: 1272, height: 900 })
  await page.getByPlaceholder('Search by employee name...').fill('Missing employee')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByText('No leave requests match these filters.', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  assert.equal(await page.locator('.hrd-table tbody tr').count(), 4)
  assert.equal(await page.locator('.hrd-table thead th').count(), 9)
  await page.getByRole('checkbox', { name: 'Select all', exact: true }).check()
  assert.equal(await page.locator('.hrd-table tbody input:checked').count(), 4)
  await page.locator('.hrd-review').first().click()
  await page.waitForURL('**/employee/hr-leave?leave=1')
  assert.deepEqual(errors, [])
  console.log('PASS: responsive grids, compact page, readable labels, sidebar offsets, leave filters, selection and review navigation.')
} finally { await browser.close() }
