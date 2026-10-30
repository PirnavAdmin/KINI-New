// Visual + behaviour check for the HR dashboard (/employee/hr-dashboard).
//
//   node scripts/verify-hr-dashboard.mjs [label] [scenario]
//
// Needs the dev server on http://localhost:5173. The permission and HR module
// APIs are answered with SYNTHETIC fixtures (page.route) so the real UI renders
// as an HR user without a backend login; nothing here ships with the app.
// scenario "empty" returns no rows; "error" fails every HR module request.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'artifacts/hr-dashboard'
const label = process.argv[2] ?? 'current'
const scenario = process.argv[3] ?? 'data'
mkdirSync(OUT, { recursive: true })

const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const EMPLOYEES = [
  ['Saii', 'Purna', 'HR', 'Human Resources', 'Active'], ['Srinivas', 'Poorna', 'Mentor', 'Academic', 'Active'],
  ['Lakshmilahari', 'Gandikota', 'Mentor', 'Academic', 'Active'], ['Mahesh', 'Gajjela', 'Employee', 'Administration', 'Active'],
  ['Divya', 'Sri', 'HR', 'Human Resources', 'Active'], ['Kiran', 'Babu', 'Employee', null, 'On Leave'],
].map(([firstName, lastName, role, departmentName, status], index) => ({ employeeId: index + 1, firstName, lastName, fullName: `${firstName} ${lastName}`, role, departmentName, status, email: `${firstName.toLowerCase()}@example.test` }))
const ATTENDANCE = []
for (let offset = -9; offset <= 0; offset += 1) {
  if (offset === -6) continue // a day with no records at all
  EMPLOYEES.forEach((employee, index) => {
    const status = index === 5 ? 'OnLeave' : (index + offset) % 7 === 0 ? 'Absent' : 'Present'
    ATTENDANCE.push({ attendanceId: ATTENDANCE.length + 1, employeeId: employee.employeeId, employeeName: employee.fullName, date: `${day(offset)}T09:00:00`, status })
  })
}
const LEAVE = [
  ['Srinivas Poorna', 'Casual', -2, -2, 'Approved'], ['Lakshmilahari Gandikota', 'Work From Home', -2, -2, 'Approved'],
  ['Lakshmilahari Gandikota', 'Casual', -5, -4, 'Rejected'], ['Kiran Babu', 'Sick', 0, 2, 'Pending'],
  ['Mahesh Gajjela', 'Earned', 5, 9, 'Pending'], ['Divya Sri', 'Casual', 3, 3, 'Pending'],
  ['Saii Purna', 'Sick', -20, -19, 'Approved'], ['Srinivas Poorna', 'Earned', 10, 14, 'Pending'],
].map(([employeeName, leaveType, from, to, status], index) => ({ leaveId: 100 + index, employeeName, leaveType, fromDate: day(from), toDate: day(to), status }))
const PERFORMANCE = [['Mahesh Gajjela', '2026-10', 40], ['Srinivas Poorna', '2026-09', 40], ['Saii Purna', '2026-10', 40], ['Lakshmilahari Gandikota', '2026-10', 25]]
  .map(([employeeName, period, performanceScore], index) => ({ performanceId: index + 1, employeeName, period, performanceScore }))
const ANNOUNCEMENTS = [{ announcementId: 1, title: 'Diwali holiday schedule', audience: 'All staff', status: 'Published', publishDate: `${day(-1)}T00:00:00Z`, expiryDate: null }]
const CALENDAR = [{ eventId: 1, title: 'Team Meeting', eventType: 'Meeting', startDateTime: `${day(0)}T23:00:00`, endDateTime: `${day(0)}T23:45:00` }, { eventId: 2, title: 'Quarterly review', eventType: 'Review', startDateTime: `${day(4)}T10:00:00`, endDateTime: `${day(4)}T11:00:00` }]
const STUDENTS = [{ studentId: 1, fullName: 'Gandikota Lahari', courseName: 'Java Script', batchName: 'Java Script 1', status: 'Active' }, { studentId: 2, fullName: 'Sai Sree', courseName: 'SQL', batchName: 'SQL 1', status: 'Active' }]
const RESOURCES = [{ resourceId: 1, name: 'Employee Handbook', category: 'Policy', fileType: 'PDF', fileSize: 2516582 }, { resourceId: 2, name: 'Leave Policy', category: 'Policy', fileType: 'PDF', fileSize: 1153434 }, { resourceId: 3, name: 'Code of Conduct', category: 'Policy', fileType: 'PDF' }]
const MODULE_ROWS = { employees: EMPLOYEES, departments: [], attendance: ATTENDANCE, leave: LEAVE, performance: PERFORMANCE, announcements: ANNOUNCEMENTS, 'calendar/events': CALENDAR, resources: RESOURCES }

const SEED = () => {
  const exp = new Date(Date.now() + 86400000).toISOString()
  for (const [k, v] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: exp, role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(k, v)
  localStorage.setItem('user', JSON.stringify({ userId: 1, employeeId: 1, organizationId: 3, role: 'HR', userRole: 'Employee', firstName: 'Saii', name: 'Saii Purna', email: 'saii@example.test' }))
}
const PROFILE = { userId: 1, employeeId: 1, organizationId: 3, firstName: 'Saii', lastName: 'Purna', fullName: 'Saii Purna', email: 'saii@example.test', role: 'HR', userRole: 'Employee', departmentName: 'Human Resources', designation: 'HR' }
const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })
const paged = (items) => json({ success: true, data: { items, page: 1, limit: 100, totalCount: items.length, totalPages: 1 } })
const GRANTS = Object.fromEntries(['dashboard', 'employees', 'attendance', 'leave', 'performance', 'announcements', 'calendar', 'students', 'resources', 'batches', 'schedule', 'syllabus'].map((key) => [key, { access: true, view: true, add: true, edit: true, delete: true }]))

const browser = await chromium.launch()
const report = {}
for (const [w, h] of [[1536, 900], [1280, 900], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource|status of 40\d|status of 50\d/.test(message.text())) consoleErrors.push(message.text().slice(0, 160)) })
  await page.addInitScript(SEED)
  await page.route(/\/api\/Permission\//, (route) => route.fulfill(json({ success: true, data: GRANTS })))
  // The signed-in user's own profile: an HR employee.
  await page.route(/\/api\/(v1\/employee-profile|Auth\/profile\/1)(\?|$)/, (route) => route.fulfill(json({ success: true, data: PROFILE })))
  await page.route(/\/api\/hr\/(employees|departments|attendance|leave|performance|announcements|calendar\/events|resources)(\?|$)/, (route) => {
    if (scenario === 'error') return route.fulfill(json({ success: false, message: 'Service unavailable' }, 503))
    const key = route.request().url().match(/\/api\/hr\/([a-z/]+?)(\?|$)/)[1]
    const rows = scenario === 'empty' ? [] : MODULE_ROWS[key] ?? []
    // The announcements service reads the paged object at the top level.
    if (key === 'announcements') return route.fulfill(json({ items: rows, page: 1, limit: 100, totalCount: rows.length, totalPages: 1 }))
    return route.fulfill(paged(rows))
  })
  await page.route(/\/api\/hr\/resources\/\d+\/download/, (route) => route.fulfill({ status: 200, contentType: 'application/pdf', headers: { 'content-disposition': 'attachment; filename="employee-handbook.pdf"' }, body: '%PDF-1.4 test fixture' }))
  await page.route(/\/api\/students(\?|$)/, (route) => route.fulfill(scenario === 'error' ? json({ message: 'Service unavailable' }, 503) : paged(scenario === 'empty' ? [] : STUDENTS)))
  await page.goto(`${BASE}/employee/hr-dashboard`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.hx-hero', { timeout: 40000 })
  await page.waitForFunction(() => !document.querySelector('.hx .hx-skeleton'), null, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${label}-${scenario}-${w}x${h}.png` })
  // The page scrolls inside the dashboard's content area, so capture the lower sections by scrolling it.
  for (const [index, selector] of ['.hx-leave', '.hx-quick'].entries()) {
    await page.locator(selector).first().scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${label}-${scenario}-${w}x${h}-part${index + 2}.png` })
  }
  await page.evaluate(() => { const main = document.querySelector('.hx')?.closest('main'); if (main) main.scrollTop = 0 })
  const metrics = await page.evaluate(() => {
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] }
    const scroller = document.querySelector('.hx').closest('main') ?? document.documentElement
    return {
      url: location.pathname,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      panelOverflow: [...document.querySelectorAll('.hx-panel, .hx-hero')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.querySelector('h2, h1')?.textContent),
      hero: box(document.querySelector('.hx-hero')),
      greeting: document.querySelector('.hx-hero h1')?.textContent,
      kpis: [...document.querySelectorAll('.hrp-kpis > *')].map((el) => el.innerText.replace(/\s+/g, ' ').trim()),
      kpiRows: new Set([...document.querySelectorAll('.hrp-kpis > *')].map((el) => Math.round(el.getBoundingClientRect().top))).size,
      panels: [...document.querySelectorAll('.hx-panel h2')].map((el) => el.textContent),
      departments: [...document.querySelectorAll('.hx-dept__legend li')].map((el) => el.innerText.replace(/\s+/g, ' ').trim()),
      legend: [...document.querySelectorAll('.hx-legend li')].map((el) => el.innerText.replace(/\s+/g, ' ').trim()),
      dots: document.querySelectorAll('.hx-chart .recharts-line-dot').length,
      leaveRows: document.querySelectorAll('.hx-table tbody tr').length,
      checkboxes: document.querySelectorAll('.hx input[type=checkbox]').length,
      quickActions: [...document.querySelectorAll('.hx h2')].some((el) => /quick actions/i.test(el.textContent)),
      empties: [...document.querySelectorAll('.hx-empty strong')].map((el) => el.textContent),
      pageHeight: scroller.scrollHeight,
    }
  })
  if (w === 1536 && scenario === 'data') {
    const checks = {}
    const apply = () => page.getByRole('button', { name: 'Apply' }).click()
    checks.firstLeaveRows = await page.locator('.hx-table tbody tr').evaluateAll((rows) => rows.slice(0, 3).map((row) => row.innerText.replace(/\s+/g, ' ').trim()))
    checks.glance = await page.locator('.hx-glance__list li').allInnerTexts().then((all) => all.map((t) => t.replace(/\s+/g, ' ')))
    checks.quick = await page.locator('.hx-quick a').allInnerTexts()
    await page.getByLabel('Date range').selectOption('14')
    await page.waitForTimeout(500)
    checks.range14 = { title: await page.locator('.hx-attendance h2').innerText(), dots: await page.locator('.hx-chart .recharts-line-dot').count() }
    await page.locator('.hx-chart .recharts-line-dot').last().hover()
    await page.waitForTimeout(300)
    checks.tooltip = (await page.locator('.hx-tooltip').innerText().catch(() => '')).replace(/\s+/g, ' ')
    await page.getByLabel('Search by employee').fill('lakshmi')
    checks.beforeApply = await page.locator('.hx-table tbody tr').count()
    await apply()
    checks.searchRows = await page.locator('.hx-table tbody tr').count()
    await page.getByLabel('Search by employee').fill('')
    await page.getByLabel(/^Status/).selectOption('pending')
    await apply()
    checks.pendingRows = await page.locator('.hx-table tbody tr').allInnerTexts().then((all) => all.map((t) => t.split('\t')[1]?.trim()))
    checks.storedStatus = await page.evaluate(() => localStorage.getItem('hr-dashboard-leave-status'))
    await page.getByLabel('From date').fill(day(4))
    await apply()
    checks.fromDateRows = await page.locator('.hx-table tbody tr').count()
    await page.getByRole('button', { name: 'Reset' }).click()
    checks.afterReset = await page.locator('.hx-table tbody tr').count()
    checks.pager = await page.locator('.hx-pager').innerText().catch(() => null)
    checks.reviewHref = await page.locator('.hx-review').first().getAttribute('href')
    checks.tabs = await page.getByRole('tab').allInnerTexts()
    if (checks.tabs.length > 1) {
      await page.getByRole('tab').nth(1).click()
      checks.secondTabSelected = await page.getByRole('tab').nth(1).getAttribute('aria-selected')
    }
    const download = page.waitForEvent('download', { timeout: 6000 }).catch(() => null)
    await page.getByRole('button', { name: 'Download Employee Handbook' }).click()
    checks.resourceDownload = (await download)?.suggestedFilename() ?? null
    checks.resourceMeta = await page.locator('.hx-files li', { hasText: 'Employee Handbook' }).innerText().then((t) => t.replace(/\s+/g, ' '))
    await page.locator('.hx-more').first().click()
    await page.waitForTimeout(500)
    checks.moreNavigates = new URL(page.url()).pathname
    await page.goBack()
    await page.waitForSelector('.hrp-kpis > *', { timeout: 20000 })
    await page.locator('.hrp-kpis > *').first().click()
    await page.waitForTimeout(600)
    checks.kpiNavigates = new URL(page.url()).pathname
    metrics.checks = checks
  }
  report[`${w}x${h}`] = { ...metrics, consoleErrors: consoleErrors.slice(0, 5) }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
