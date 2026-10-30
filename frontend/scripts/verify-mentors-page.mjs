// Visual + behaviour check for Organization → Mentors (directory | detail workspace).
//
//   node scripts/verify-mentors-page.mjs [label]
//
// Needs the dev server on http://localhost:5173. The employee list, mentor
// batch and batch roster APIs are answered with SYNTHETIC fixtures
// (page.route) so the real UI renders without a backend login; nothing here
// ships with the app. Other requests go to the real backend and fail with the
// demo token, which exercises the page's fallbacks.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'artifacts/mentors-page'
const label = process.argv[2] ?? 'current'
mkdirSync(OUT, { recursive: true })

const MENTORS = [
  ['Lakshmilahari', 'Gandikota', 'lakshmilaharigandikota@gmail.com', '9784627836', 'Active', 'Full-time'],
  ['Srinivas', 'Poorna', 'srinivassree.appsec@gmail.com', '8938836475', 'Active', 'Full-time'],
  ['Anitha', 'Rao', 'anitha.rao.with.a.really.long.email.address@example-organization.test', '9000033344', 'Active', 'Part-time'],
  ['Kiran', 'Babu', 'kiran.babu@example.test', '9000044455', 'On Leave', 'Contract'],
  ['Divya', 'Sri', 'divya.sri@example.test', '9000055566', 'Inactive', 'Full-time'],
].map(([firstName, lastName, email, phone, status, employeeType], index) => ({
  employeeId: index + 1, firstName, lastName, email, phone, role: 'Mentor', status, employeeType, designation: index === 0 ? 'Senior Mentor' : 'Mentor', departmentName: 'Technology', joiningDate: index === 0 ? '2025-08-01' : null, organizationId: 3,
}))
const BATCHES = {
  1: [{ batchId: 11, batchName: 'Java Script', courseName: 'Java Script', startDate: '2025-09-01', startTime: '10:00', endTime: '11:30', scheduleDays: ['Monday', 'Wednesday'] }, { batchId: 12, batchName: 'Java Script 1', courseName: 'Java Script' }, { batchId: 13, batchName: 'React 1', courseName: 'React JS' }],
  2: [{ batchId: 14, batchName: 'Python 1', courseName: 'Python' }],
}
const ROSTER = { 11: 4, 12: 3, 13: 1, 14: 6 }

const SEED = () => {
  const exp = new Date(Date.now() + 86400000).toISOString()
  for (const [k, v] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: exp, role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(k, v)
  localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 3, role: 'org-admin', name: 'Kini', firstName: 'Kini', email: 'organization@example.com', isDemo: true }))
}
const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

const browser = await chromium.launch()
const report = {}
for (const [w, h] of [[1536, 900], [1280, 900], [1440, 900], [1100, 900], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) consoleErrors.push(message.text().slice(0, 160)) })
  await page.addInitScript(SEED)
  await page.route(/\/api\/v1\/organization\/employees(\?|$)/, (route) => route.fulfill(json({ success: true, data: MENTORS, totalRecords: MENTORS.length, pageNumber: 1, pageSize: 1000, totalPages: 1 })))
  await page.route(/\/api\/v1\/organization\/employees\/(\d+)\/batches/, (route) => {
    const id = Number(route.request().url().match(/employees\/(\d+)\/batches/)[1])
    const batches = BATCHES[id] ?? []
    return route.fulfill(json({ success: true, data: { batches, totalRecords: batches.length } }))
  })
  await page.route(/\/api\/StudentBatch\/(\d+)\/students/, (route) => {
    const id = Number(route.request().url().match(/StudentBatch\/(\d+)\/students/)[1])
    const students = Array.from({ length: ROSTER[id] ?? 0 }, (_, i) => ({ studentId: id * 100 + i, studentName: `Student ${id}-${i}`, batchId: id }))
    return route.fulfill(json({ success: true, data: students }))
  })
  await page.goto(`${BASE}/organization/tutors`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.mw-dir__item', { timeout: 40000 })
  await page.waitForSelector('.mw-detail__head', { timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}.png` })
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}-full.png`, fullPage: true })
  const box = (selector) => page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }, selector)
  const metrics = {
    overflowX: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    pageOverflow: await page.evaluate(() => { const main = document.querySelector('.tutor-management-page'); return main.scrollWidth - main.clientWidth }),
    hero: await box('.mm-hero'),
    art: await page.evaluate(() => { const img = document.querySelector('.mm-hero__art'); return getComputedStyle(img).display === 'none' ? null : [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height), img.naturalWidth > 0] }),
    quoteShown: await page.evaluate(() => getComputedStyle(document.querySelector('.mm-hero__quote')).display !== 'none'),
    kpiRows: await page.evaluate(() => new Set([...document.querySelectorAll('.mm-kpis > *')].map((el) => Math.round(el.getBoundingClientRect().top))).size),
    kpiHeights: await page.evaluate(() => [...new Set([...document.querySelectorAll('.mm-kpis > *')].map((el) => Math.round(el.getBoundingClientRect().height)))]),
    directory: await box('.mw-dir'),
    detail: await box('.mw-detail'),
    // Directory share of the workspace when side by side, else "stacked".
    split: await page.evaluate(() => { const d = document.querySelector('.mw-dir').getBoundingClientRect(); const p = document.querySelector('.mw-detail').getBoundingClientRect(); return Math.abs(d.top - p.top) < 2 ? Math.round((d.width / (d.width + p.width)) * 100) + '%' : 'stacked' }),
    overviewColumns: await page.evaluate(() => getComputedStyle(document.querySelector('.mw-overview')).gridTemplateColumns.split(' ').length),
    items: await page.locator('.mw-dir__item').count(),
    selected: await page.locator('.mw-dir__item[aria-selected="true"]').innerText().then((t) => t.split('\n')[0]),
    detailName: await page.locator('.mw-detail__who h2').innerText(),
    overflowingEls: await page.evaluate(() => [...document.querySelectorAll('.mw-panel, .mw-card, .mm-hero')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.className.split(' ').slice(0, 2).join('.') + ':' + (el.scrollWidth - el.clientWidth))),
  }
  if (w === 1536) {
    const checks = {}
    const detailName = () => page.locator('.mw-detail__who h2').innerText()
    checks.overview = (await page.locator('.mw-overview').innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)
    // Select by click, then by keyboard.
    await page.getByRole('option', { name: /Srinivas Poorna/ }).click()
    checks.clickSelects = await detailName()
    await page.keyboard.press('ArrowUp')
    checks.arrowSelects = await detailName()
    checks.focusFollows = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'option' && document.activeElement.getAttribute('aria-selected') === 'true')
    // Every tab renders its own content.
    await page.getByRole('option', { name: /Lakshmilahari Gandikota/ }).click()
    const tabs = {}
    for (const name of ['Courses & Batches', 'Students', 'Schedule', 'Activity', 'Overview']) {
      await page.getByRole('tab', { name }).click()
      await page.waitForTimeout(400)
      tabs[name] = (await page.getByRole('tabpanel').innerText()).replace(/\s+/g, ' ').trim().slice(0, 160)
    }
    checks.tabs = tabs
    await page.getByRole('tab', { name: 'Overview' }).focus()
    await page.keyboard.press('ArrowRight')
    checks.tabArrow = await page.getByRole('tab', { selected: true }).innerText()
    await page.getByRole('tab', { name: 'Overview' }).click()
    await page.screenshot({ path: `${OUT}/${label}-${w}x${h}-detail.png` })
    // "+N" opens the full list.
    await page.locator('.mw-overview__batches').getByRole('button', { name: /Show all/ }).click()
    checks.plusOpensTeaching = await page.getByRole('tab', { selected: true }).innerText()
    await page.getByRole('tab', { name: 'Overview' }).click()
    // Status chips with counts, search, clear.
    checks.chips = await page.locator('.mw-status__chip').allInnerTexts().then((all) => all.map((t) => t.replace(/\s+/g, ' ')))
    await page.locator('.mw-status__chip', { hasText: 'On Leave' }).click()
    checks.onLeaveItems = await page.locator('.mw-dir__item').allInnerTexts().then((all) => all.map((t) => t.split('\n')[0]))
    checks.detailFollowsFilter = await detailName()
    await page.locator('.mw-status__chip', { hasText: 'All' }).click()
    await page.getByLabel('Search mentors').fill('anitha')
    checks.searchItems = await page.locator('.mw-dir__item').count()
    checks.searchChips = await page.locator('.mw-status__chip').allInnerTexts().then((all) => all.map((t) => t.replace(/\s+/g, ' ')))
    await page.getByRole('button', { name: /Clear filters/ }).first().click()
    // Course / batch / type filters.
    await page.getByRole('button', { name: /More filters/ }).click()
    await page.getByLabel('Filter by course').selectOption('React JS')
    checks.courseItems = await page.locator('.mw-dir__item').allInnerTexts().then((all) => all.map((t) => t.split('\n')[0]))
    await page.getByRole('button', { name: /Clear filters/ }).first().click()
    // Actions.
    await page.getByRole('option', { name: /Lakshmilahari Gandikota/ }).click()
    await page.getByRole('button', { name: 'More actions for Lakshmilahari Gandikota' }).click()
    checks.menuItems = await page.getByRole('menu').getByRole('menuitem').allInnerTexts()
    await page.keyboard.press('Escape')
    await page.locator('.mw-detail__actions').getByRole('button', { name: 'Edit' }).click()
    checks.editOpens = await page.getByText('Edit mentor').first().isVisible().catch(() => false)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Discard', exact: true }).click({ timeout: 1500 }).catch(() => {})
    await page.getByRole('button', { name: 'Close', exact: true }).first().click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(300)
    // Add Mentor and the header Assign Courses button are removed from this page.
    checks.noAddMentor = (await page.getByRole('button', { name: 'Add Mentor' }).count()) === 0
    checks.noAssignCourses = (await page.getByRole('button', { name: 'Assign Courses' }).count()) === 0
    // Course assignment stays reachable from the ⋮ menu.
    await page.getByRole('button', { name: 'More actions for Lakshmilahari Gandikota' }).click()
    await page.getByRole('menuitem', { name: 'Assign Batch' }).click()
    await page.waitForTimeout(400)
    checks.assignFromMenuOpens = (await page.locator('[role=dialog], .fixed.inset-0').count()) > 0
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /^(Cancel|Close)/ }).first().click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(300)
    checks.headerActions = await page.locator('.mw-detail__actions > *').evaluateAll((els) => els.map((el) => el.innerText.trim() || el.querySelector('button')?.getAttribute('aria-label')))
    const download = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
    await page.getByRole('button', { name: 'Export mentors shown' }).click()
    checks.exportFile = (await download)?.suggestedFilename() ?? null
    await page.getByRole('button', { name: 'View Profile' }).click()
    checks.fullProfile = await page.getByRole('button', { name: /Back to mentors/ }).isVisible().catch(() => false)
    metrics.checks = checks
  }
  report[`${w}x${h}`] = { ...metrics, consoleErrors: consoleErrors.slice(0, 5) }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
