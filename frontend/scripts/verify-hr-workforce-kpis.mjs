import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  let failEmployees = false
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team' }))
    for (const [key, value] of Object.entries({ auth_token: 'test-hr', token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value)
  })
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort()
    let data = []
    if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Attendance', 'Leave'].map(moduleName => ({ moduleName, canAccess: true, canView: true }))
    if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' }
    if (url.pathname === '/api/hr/employees') {
      if (failEmployees) return route.fulfill({ status: 500, json: { message: 'Unavailable' } })
      // Exercise server pagination: the HR records are on the second page.
      const all = ['Mentor', 'Mentor', 'HR', 'HR Executive', 'HR_MANAGER', 'HR Coordinator'].map((role, index) => ({ employeeId: index + 1, fullName: `Employee ${index + 1}`, role, status: 'Active' }))
      data = { items: url.searchParams.get('Page') === '2' ? all.slice(2) : all.slice(0, 2), totalCount: 6, totalPages: 2 }
    }
    return route.fulfill({ json: { data } })
  })
  await page.goto('http://localhost:5173/employee/hr-dashboard')
  await page.waitForFunction(() => document.querySelector('.hr-dashboard')?.getAttribute('aria-busy') === 'false')
  // Match the exact title so "HR employees" does not overlap other metrics.
  const metric = title => page.locator('.hr-kpi').filter({ has: page.getByText(title, { exact: true }) }).locator('strong')
  assert.equal(await metric('Total employees').textContent(), '6')
  assert.equal(await metric('Mentors').textContent(), '2')
  assert.equal(await metric('HR employees').textContent(), '4')
  const positions = await page.locator('.hr-kpi').evaluateAll(cards => cards.map(card => card.getBoundingClientRect().top))
  assert.equal(positions.length, 7)
  assert.ok(positions.every(y => Math.abs(y - positions[0]) < 2))
  await page.screenshot({ path: 'hr-workforce-kpis-review.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  failEmployees = true
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('.hr-dashboard')?.getAttribute('aria-busy') === 'false')
  assert.equal(await metric('HR employees').textContent(), '—')
  assert.deepEqual(errors, [])
  console.log('PASS: 6 total / 2 mentors / 4 HR across server pages, seven desktop cards, mobile layout, unavailable count on failure.')
} finally { await browser.close() }
