// Visual + behaviour check for Organization → Employees (card grid) at 100% zoom.
//
//   node scripts/verify-employees-page.mjs [label]
//
// Needs the dev server on http://localhost:5173. The employee list and mentor
// batch APIs are answered with SYNTHETIC fixtures (page.route) so the real UI
// renders without a backend login; nothing here ships with the app. Other
// requests (departments, leave, photos) go to the real backend and fail with
// the demo token, which exercises the page's fallbacks.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'artifacts/employees-page'
const label = process.argv[2] ?? 'current'
mkdirSync(OUT, { recursive: true })

const EMPLOYEES = [
  ['Srinivas', 'Poorna', 'srinivassree.appsec@gmail.com', '8938836475', 'Mentor', 'Active', 'Full-time', 'Technology', '2025-06-12'],
  ['Lakshmi', 'Lahari', 'lakshmilahari.gandikota@example.test', '9951886175', 'Mentor', 'Active', 'Full-time', 'Technology', '2025-08-01'],
  ['Priya', 'Sharma', 'priya.sharma@example.test', '9000011122', 'HR', 'Active', 'Full-time', 'Human Resources', '2024-11-20'],
  ['Ravi', 'Kumar', 'ravi.kumar@example.test', '9000022233', 'Employee', 'Inactive', 'Contract', 'Operations', null],
  ['Anitha', 'Rao', 'anitha.rao.with.a.really.long.email.address@example-organization.test', '9000033344', 'Employee', 'Active', 'Part-time', null, '2026-01-05'],
  ['Kiran', 'Babu', 'kiran.babu@example.test', '9000044455', 'Mentor', 'Active', 'Intern', 'Technology', null],
  ['Divya', 'Sri', 'divya.sri@example.test', '9000055566', 'HR', 'Active', null, 'Human Resources', '2025-02-14'],
  ['Teja', 'Varma', 'teja.varma@example.test', '9000066677', 'Employee', 'Active', 'Full-time', 'Finance', '2023-09-30'],
].map(([firstName, lastName, email, phone, role, status, employeeType, departmentName, joiningDate], index) => ({
  employeeId: index + 1, firstName, lastName, email, phone, role, status, employeeType, departmentName, joiningDate, organizationId: 3,
}))
// Employee 9 has every optional field missing.
EMPLOYEES.push({ employeeId: 9, firstName: null, lastName: null, email: null, phone: null, role: null, status: null, employeeType: null, departmentName: null, joiningDate: null, organizationId: 3 })

const SEED = () => {
  const exp = new Date(Date.now() + 86400000).toISOString()
  for (const [k, v] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: exp, role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(k, v)
  localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 3, role: 'org-admin', name: 'Kini', firstName: 'Kini', email: 'organization@example.com', isDemo: true }))
}
const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

const browser = await chromium.launch()
const report = {}
for (const [w, h] of [[1280, 929], [1366, 900], [1440, 900], [1536, 900], [1920, 1080], [1100, 900], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) consoleErrors.push(message.text().slice(0, 160)) })
  // Failed app requests, split into those answered by the real backend (which
  // rejects the demo token) and anything else (a real regression).
  const failedRequests = []
  page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${new URL(response.url()).pathname}`) })
  page.on('requestfailed', (request) => failedRequests.push(`failed ${new URL(request.url()).pathname}`))
  await page.addInitScript(SEED)
  await page.route(/\/api\/v1\/organization\/employees(\?|$)/, (route) => {
    const url = new URL(route.request().url())
    const size = Number(url.searchParams.get('PageSize') ?? 10)
    const number = Number(url.searchParams.get('PageNumber') ?? 1)
    const status = (url.searchParams.get('Status') ?? '').toLowerCase()
    const rows = EMPLOYEES.filter((employee) => !status || String(employee.status ?? 'active').toLowerCase() === status)
    return route.fulfill(json({ success: true, data: rows.slice((number - 1) * size, number * size), totalRecords: rows.length, pageNumber: number, pageSize: size, totalPages: Math.max(1, Math.ceil(rows.length / size)) }))
  })
  await page.route(/\/api\/v1\/organization\/employees\/(\d+)\/batches/, (route) => {
    const id = Number(route.request().url().match(/employees\/(\d+)\/batches/)[1])
    const batches = id === 1 ? [{ batchId: 1, batchName: 'Python 1' }, { batchId: 4, batchName: 'Cyber Security 1' }] : id === 2 ? [{ batchId: 2, batchName: 'React 1' }] : []
    return route.fulfill(json({ success: true, data: { batches, totalRecords: batches.length } }))
  })
  await page.goto(`${BASE}/organization/employees`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ec-grid .ec-card:not(.is-skeleton)', { timeout: 30000 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}.png` })
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}-full.png`, fullPage: true })
  // Close-up of the first row of cards.
  await page.locator('.ec-grid:not([aria-busy="true"])').screenshot({ path: `${OUT}/${label}-${w}x${h}-cards.png`, clip: undefined }).catch(() => {})
  const metrics = await page.evaluate(() => {
    const grid = document.querySelector('.ec-grid:not([aria-busy="true"])') ?? document.querySelector('.ec-grid')
    const cards = [...grid.querySelectorAll('.ec-card')]
    const rows = new Map()
    cards.forEach((card) => {
      const r = card.getBoundingClientRect()
      const top = Math.round(r.top)
      rows.set(top, [...(rows.get(top) ?? []), Math.round(r.height)])
    })
    const box = (selector) => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
    const rects = cards.map((card) => card.getBoundingClientRect())
    return {
      viewport: [innerWidth, innerHeight], document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], dpr: devicePixelRatio,
      boxes: { sidebar: box('aside'), main: box('main'), hero: box('.osh--v14'), kpis: box('section[aria-label="Employee statistics"]'), toolbar: box('.employees-toolbar'), grid: box('.ec-grid'), card: box('.ec-card'), footer: box('.employees-footer') },
      // Columns counted from where the cards actually sit, not only from the template.
      columnsFromBoxes: new Set(rects.map((r) => Math.round(r.left))).size,
      cardsOverlapping: rects.some((a, i) => rects.some((b, j) => j > i && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)),
      emailsTruncated: [...document.querySelectorAll('.ec-email__local, .ec-email__domain')].filter((el) => el.scrollWidth > el.clientWidth + 1).length,
      toolbarOverflowing: [...document.querySelectorAll('.employees-toolbar :is(input, button)')].some((el) => { const r = el.getBoundingClientRect(); const t = document.querySelector('.employees-toolbar').getBoundingClientRect(); return r.width > 0 && (r.right > t.right + 1 || r.left < t.left - 1) }),
      paginationVisible: Boolean(document.querySelector('.employees-footer')?.getBoundingClientRect().height),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      cardWidth: Math.round(cards[0].getBoundingClientRect().width),
      // Cards in one grid row stretch to the same height.
      unevenRows: [...rows.values()].filter((heights) => new Set(heights).size > 1).length,
      cardsOverflowing: cards.filter((card) => card.scrollWidth > card.clientWidth + 1).length,
      // KPI cards: one height, and no grid row left with a hole.
      kpiHeights: [...new Set([...document.querySelectorAll('section[aria-label="Employee statistics"] > *')].map((el) => Math.round(el.getBoundingClientRect().height)))],
      kpiRowWidths: (() => { const rows = new Map(); document.querySelectorAll('section[aria-label="Employee statistics"] > *').forEach((el) => { const r = el.getBoundingClientRect(); const t = Math.round(r.top); rows.set(t, (rows.get(t) ?? 0) + Math.round(r.width)) }); return [...rows.values()] })(),
      // Footers: the Access/Edit row sits at the same height in every card of a grid row.
      footersAligned: (() => { const rows = new Map(); document.querySelectorAll('.ec-grid .ec-card:not(.is-skeleton)').forEach((card) => { const t = Math.round(card.getBoundingClientRect().top); const f = card.querySelector('.ec-card__foot'); if (f) rows.set(t, [...(rows.get(t) ?? []), Math.round(f.getBoundingClientRect().top)]) }); return [...rows.values()].every((tops) => new Set(tops).size === 1) })(),
      heroAccentColor: getComputedStyle(document.querySelector('.osh__title em') ?? document.body).webkitTextFillColor,
      emailDomainsVisible: [...document.querySelectorAll('.ec-email__domain')].every((el) => el.getBoundingClientRect().right <= el.closest('.ec-card').getBoundingClientRect().right - 10),
      toolbarControlHeights: [...document.querySelectorAll('.employees-toolbar :is(input, button)')].map((el) => Math.round(el.getBoundingClientRect().height)).filter((value) => value > 0),
    }
  })
  if (w === 1440) {
    const checks = {}
    const cards = () => page.locator('.ec-grid .ec-card:not(.is-skeleton)')
    checks.cardsOnPage = await cards().count()
    checks.firstCard = (await cards().first().innerText()).replace(/\s+/g, ' ').trim()
    checks.mentorBatches = (await page.locator('.ec-card', { hasText: 'Srinivas Poorna' }).innerText()).includes('Mentoring 2 batches')
    checks.nullCard = (await page.locator('.ec-card', { hasText: 'Unnamed employee' }).innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    checks.longEmailTitle = await page.locator('.ec-card a[href^="mailto:anitha"]').getAttribute('title')
    checks.noFabricatedFullTime = !(await page.locator('.ec-card', { hasText: 'Unnamed employee' }).innerText()).includes('Full-time')

    // ⋮ menu: keyboard-reachable items, Escape closes.
    await page.getByRole('button', { name: 'More actions for Srinivas Poorna' }).click()
    checks.menuItems = await page.getByRole('menu', { name: 'Actions for Srinivas Poorna' }).getByRole('menuitem').allInnerTexts()
    checks.menuFocusFirst = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'menuitem')
    await page.keyboard.press('Escape')
    checks.menuClosesOnEscape = (await page.getByRole('menu').count()) === 0

    // Delete opens the existing confirmation (not confirmed here).
    await page.getByRole('button', { name: 'More actions for Ravi Kumar' }).click()
    await page.getByRole('menuitem', { name: 'Delete employee' }).click()
    checks.deleteConfirmShown = await page.getByText('Delete Employee', { exact: true }).first().waitFor({ timeout: 4000 }).then(() => true, () => false)
    checks.deleteConfirmNamesEmployee = await page.getByText('Delete Ravi Kumar?').first().isVisible().catch(() => false)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /^Cancel$/ }).first().click({ timeout: 2000 }).catch(() => {})

    // Access drawer and Edit form open from the card footer.
    await page.getByRole('button', { name: /^(Assign HR module permissions|View role and access) for Priya Sharma$/ }).click()
    checks.accessPanelOpens = await page.locator('#employee-access-title').waitFor({ timeout: 8000 }).then(() => true, () => false)
    await page.getByRole('button', { name: 'Close role and access panel' }).click({ timeout: 3000 }).catch(() => page.keyboard.press('Escape'))
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Edit Teja Varma' }).click()
    await page.waitForTimeout(600)
    checks.editFormOpens = await page.getByText(/^Edit Employee$/).first().waitFor({ timeout: 5000 }).then(() => true, () => false)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /^(Cancel|Close)$/ }).first().click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(400)

    // Selection + bulk export.
    await page.getByLabel('Select all on this page').check()
    checks.selectedChip = (await page.locator('.employees-toolbar-actions').innerText()).match(/\d+ selected/)?.[0] ?? null
    const download = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
    await page.locator('.employees-toolbar-actions').getByRole('button', { name: 'Export' }).click()
    checks.exportDownloaded = Boolean(await download)
    await page.getByLabel('Select all on this page').uncheck()

    // Search, empty state and Clear Filters.
    await page.getByLabel('Search employees').fill('Srinivas')
    await page.waitForTimeout(1200)
    checks.searchCards = await cards().count()
    await page.getByLabel('Search employees').fill('zzz-no-match')
    await page.waitForTimeout(1200)
    checks.emptyState = (await page.getByText('No employees found').first().isVisible().catch(() => false))
    checks.emptyDescription = (await page.getByText(/No employees match/).first().innerText().catch(() => '')).trim()
    await page.getByRole('button', { name: 'Clear Filters' }).click()
    await page.waitForTimeout(1200)
    checks.cardsAfterClear = await cards().count()

    // Pagination: 9 employees at 10/page → one page; footer range is real.
    checks.footer = (await page.locator('.employees-footer p').first().innerText()).trim()

    // View profile from the name.
    await page.getByRole('button', { name: 'Srinivas Poorna', exact: true }).click()
    await page.waitForURL(/\/organization\/employees\/1/, { timeout: 5000 }).catch(() => {})
    checks.profileUrl = new URL(page.url()).pathname
    metrics.checks = checks
  }
  report[`${w}x${h}`] = { ...metrics, consoleErrors: consoleErrors.slice(0, 5), failedRequests: [...new Set(failedRequests)].slice(0, 8) }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
