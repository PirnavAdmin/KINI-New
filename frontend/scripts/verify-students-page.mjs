// Visual + behaviour check for Organization → Students at 100% zoom.
//
//   node scripts/verify-students-page.mjs [label]
//
// Needs the dev server on http://localhost:5173. The three Students API calls
// are answered with SYNTHETIC fixtures (page.route) so the real UI renders
// rows without a backend login; nothing here ships with the app. Student 1 is
// enrolled in three courses: its record carries Python 1, the StudentBatch
// rosters add React 1 and Java Full Stack 11.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'artifacts/students-page'
const label = process.argv[2] ?? 'current'
mkdirSync(OUT, { recursive: true })

const BATCHES = [
  { batchId: 1, batchName: 'Python 1', courseId: 1, courseName: 'Python', mentorName: 'Lakshmilahari', organizationId: 3, status: 'Active' },
  { batchId: 2, batchName: 'React 1', courseId: 2, courseName: 'React', mentorName: 'Lakshmilahari', organizationId: 3, status: 'Active' },
  { batchId: 3, batchName: 'Java Full Stack 11', courseId: 3, courseName: 'Java Full Stack', mentorName: 'Lakshmilahari', organizationId: 3, status: 'Active' },
  { batchId: 4, batchName: 'Cyber Security 1', courseId: 4, courseName: 'Cyber Security', mentorName: 'Srinivas Poorna', organizationId: 3, status: 'Active' },
  { batchId: 5, batchName: 'RPA 111', courseId: 5, courseName: 'RPA', mentorName: 'Srinivas Poorna', organizationId: 3, status: 'Active' },
]
const NAMES = ['Gandikota Lahari', 'kadiveti Narendra', 'SAI SREE', 'SRINIVAS Student HR', 'SRINIVAS SS HR STUDNET', 'POORNA SSS DJ', 'NANI FOOD', 'Lahari Gandikota', 'poorna Sai', 'Mani Teja', 'Ravi Kumar', 'Anitha Rao', 'Kiran Babu', 'Divya Sri', 'Teja Varma', 'Pending Applicant', 'Rejected Applicant']
const STUDENTS = NAMES.map((name, index) => {
  const batch = BATCHES[[0, 1, 0, 3, 2, 0, 4, 2, 1, 0, 3, 1, 2, 0, 4, 1, 0][index]]
  const [firstName, ...rest] = name.split(' ')
  return {
    studentId: index + 1,
    firstName,
    lastName: rest.join(' '),
    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.test`,
    phone: String(9000000000 + index * 7919),
    courseId: batch.courseId,
    courseName: batch.courseName,
    batchId: batch.batchId,
    batchName: batch.batchName,
    mentorName: batch.mentorName,
    // Student 3 has no attendance recorded yet; the rest are real-looking values.
    attendance: index === 2 ? null : [92, 78, 0, 64, 45, 88, 100, 71, 59, 83, 90, 67, 74, 81, 96, 0, 0][index],
    status: index === 15 ? 'Pending' : index === 16 ? 'Rejected' : index === 13 ? 'Inactive' : 'Active',
    organizationId: 3,
  }
})
// Student 18 has every optional field missing and an upper-case status, to
// check the null fallbacks and that the Active filter still includes it.
STUDENTS.push({ studentId: 18, firstName: null, lastName: null, name: null, email: null, phone: null, courseId: null, courseName: null, batchId: null, batchName: null, mentorName: null, attendance: null, status: "ACTIVE", organizationId: 3 })
// StudentBatch rosters: student 1 was added to React 1 and Java Full Stack 11.
const ROSTERS = { 1: [], 2: [STUDENTS[0]], 3: [STUDENTS[0]], 4: [], 5: [] }

const SEED = () => {
  const exp = new Date(Date.now() + 86400000).toISOString()
  for (const [k, v] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: exp, role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(k, v)
  localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 3, role: 'org-admin', name: 'Kini', firstName: 'Kini', email: 'organization@example.com', isDemo: true }))
}

const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
const browser = await chromium.launch()
const report = {}
for (const [w, h] of [[1440, 900], [1280, 929], [1920, 1080], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) consoleErrors.push(message.text()) })
  await page.addInitScript(SEED)
  await page.route(/\/api\/v1\/organization\/students(\?|$)/, (route) => route.fulfill(json({ success: true, data: STUDENTS, totalRecords: STUDENTS.length })))
  await page.route(/\/api\/v1\/organization\/batches(\?|$)/, (route) => route.fulfill(json({ success: true, data: BATCHES, totalRecords: BATCHES.length })))
  await page.route(/\/api\/StudentBatch\/(\d+)\/students/, (route) => {
    const id = Number(route.request().url().match(/StudentBatch\/(\d+)\/students/)[1])
    return route.fulfill(json({ success: true, data: { batchId: id, students: ROSTERS[id] ?? [] } }))
  })
  // Attendance records (GET /api/Attendance/student/{id}): student 1 attended
  // 3 of 4 classes, student 2 errors, students 3/16/17 have no records, the
  // rest get 10 classes matching their roster percentage.
  await page.route(/\/api\/Attendance\/student\/(\d+)(\?|$)/, (route) => {
    const id = Number(route.request().url().match(/student\/(\d+)/)[1])
    if (id === 2) return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Synthetic failure" }) })
    if ([3, 16, 17, 18].includes(id)) return route.fulfill(json({ success: true, data: [] }))
    const present = id === 1 ? 3 : Math.round((STUDENTS[id - 1].attendance ?? 0) / 10)
    const total = id === 1 ? 4 : 10
    return route.fulfill(json({ success: true, data: Array.from({ length: total }, (_, i) => ({ attendanceId: id * 100 + i, status: i < present ? "Present" : "Absent", attendanceDate: "2026-10-0" + ((i % 9) + 1) })) }))
  })
  await page.goto(`${BASE}/organization/students`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('table tbody tr', { state: 'attached', timeout: 30000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}.png` })
  const metrics = await page.evaluate(() => {
    const box = (selector) => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), height: Math.round(r.height) } }
    const firstRow = document.querySelector('table tbody tr')
    const lahari = [...document.querySelectorAll('table tbody tr')].find((tr) => tr.innerText.includes('Gandikota Lahari'))
    return {
      overflowX: document.documentElement.scrollWidth - innerWidth,
      hero: box('[data-students-hero], .osh-v14'),
      table: box('table'),
      headerRow: box('table thead tr'),
      rowHeight: firstRow ? Math.round(firstRow.getBoundingClientRect().height) : null,
      rowsVisible: [...document.querySelectorAll('table tbody tr')].filter((tr) => tr.getBoundingClientRect().bottom <= innerHeight).length,
      multiEnrollmentRow: lahari?.innerText.replace(/\s+/g, ' ').slice(0, 200) ?? null,
      columns: [...document.querySelectorAll('table[aria-label="Students"] thead th')].map((th) => `${th.className.match(/students-th--(w+)/)?.[1]}:${Math.round(th.getBoundingClientRect().width)}`).join(' '),
      tableVsCard: (() => { const t = document.querySelector('table[aria-label="Students"]'); const wrap = t?.closest('.overflow-x-auto'); return t && wrap ? `${Math.round(t.getBoundingClientRect().width)} / ${wrap.clientWidth}` : null })(),
      // Header labels wider than their column (they would run into the next one).
      headerClipped: [...document.querySelectorAll('table[aria-label="Students"] thead th')].filter((th) => th.scrollWidth > th.clientWidth + 1).map((th) => th.innerText.trim()),
      // Header colours left to right: [label, block background, text colour].
      headerColors: [...document.querySelectorAll('table[aria-label="Students"] thead th')].map((th) => [th.innerText.trim() || "(select)", getComputedStyle(th, "::before").display === "none" ? "hidden" : getComputedStyle(th, "::before").backgroundColor, getComputedStyle(th).webkitTextFillColor || getComputedStyle(th).color]),
      headerHeight: Math.round(document.querySelector('table[aria-label="Students"] thead tr')?.getBoundingClientRect().height ?? 0),
      heroHeight: box('.osh-v14--students')?.height ?? null,
      kpiHeight: box('section[aria-label="Student statistics"] > *')?.height ?? null,
      rowHeights: [...new Set([...document.querySelectorAll('table[aria-label="Students"] tbody tr')].map((tr) => Math.round(tr.getBoundingClientRect().height)))],
      // Cells whose text is cut off (each still has a title tooltip).
      truncated: [...document.querySelectorAll('table[aria-label="Students"] tbody td .truncate, table[aria-label="Students"] tbody td .students-chip-cell')]
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => `${el.textContent.trim()}${el.title || el.closest('[title]')?.title ? '' : ' (NO TOOLTIP)'}`),
      // Horizontal scroll inside the table card (0 = every column fits).
      tableOverflow: (() => { const wrap = document.querySelector('table[aria-label="Students"]')?.closest('.overflow-x-auto'); return wrap ? wrap.scrollWidth - wrap.clientWidth : null })(),
    }
  })
  if (w === 1440) {
    // "+N more" lists every enrollment as one course/batch/mentor record.
    await page.getByRole('button', { name: /\+\d+ more/ }).first().click()
    const dialog = page.getByRole('dialog', { name: /Enrollments for/ })
    await dialog.waitFor()
    await page.waitForTimeout(300)
    metrics.enrollmentPopover = (await dialog.locator('li').allInnerTexts()).map((text) => text.replace(/\s+/g, ' ').trim())
    await page.screenshot({ path: `${OUT}/${label}-${w}x${h}-enrollments.png` })
    await page.keyboard.press('Escape')
    metrics.popoverClosesOnEscape = (await dialog.count()) === 0

    // Behaviour on the real components (same synthetic data).
    const rows = () => page.locator('table[aria-label="Students"] tbody tr').count()
    const checks = {}
    await page.getByLabel('Search students').fill('SAI SREE')
    checks.searchRows = await rows()
    await page.getByLabel('Search students').fill('')
    await page.locator('.students-filter-bar select').first().selectOption('Rejected')
    checks.rejectedFilterRows = await rows()
    await page.getByRole('button', { name: 'Clear Filters' }).click()
    checks.rowsAfterClear = await rows()
    await page.getByLabel('Rows per page').selectOption('10')
    checks.rowsAtTenPerPage = await rows()
    checks.pageSummary = (await page.locator('.students-table-footer span').first().innerText()).trim()
    await page.getByRole('button', { name: 'Next page' }).click()
    checks.rowsOnPageTwo = await rows()
    await page.getByRole('navigation', { name: 'Student management views' }).getByRole('button', { name: /Pending Approval/ }).click()
    checks.pendingTabShowsApplicant = await page.getByText('Pending Applicant').first().isVisible().catch(() => false)
    await page.getByRole('navigation', { name: 'Student management views' }).getByRole('button', { name: /Student List/ }).click()
    await page.getByRole('button', { name: 'Add Student' }).click()
    checks.addStudentOpensForm = await page.getByRole('dialog').first().isVisible().catch(() => false)
    await page.keyboard.press("Escape")
    if (await page.getByRole("dialog").first().isVisible().catch(() => false)) {
      await page.getByRole("dialog").first().getByRole("button", { name: /^(Cancel|Close)/i }).first().click()
    }
    await page.getByRole("dialog").first().waitFor({ state: "hidden", timeout: 5000 }).catch(() => {})
    await page.getByLabel("Rows per page").selectOption("25")
    await page.waitForTimeout(800)
    const attendanceOf = async (name) => {
      const cell = page.locator('table[aria-label="Students"] tbody tr', { hasText: name }).first().locator('td').nth(8)
      const text = (await cell.innerText()).replace(/\s+/g, ' ').trim()
      const title = await cell.locator('[title]').first().getAttribute('title').catch(() => null)
      return title ? `${text} (${title})` : text
    }
    checks.attendance = {
      threeOfFour: await attendanceOf("Gandikota Lahari"),
      requestFailed: await attendanceOf("kadiveti Narendra"),
      noRecords: await attendanceOf("SAI SREE"),
      tenRecords: await attendanceOf("NANI FOOD"),
    }
    checks.longNameVisible = await page.getByRole("button", { name: "SRINIVAS SS HR STUDNET", exact: true }).evaluate((el) => el.scrollHeight <= el.clientHeight + 1)
    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: "Export" }).first().click()
    const csvPath = await (await download).path()
    const csv = (await import("node:fs")).readFileSync(csvPath, "utf8")
    checks.exportRow = csv.split('\n').find((line) => line.startsWith('"Gandikota Lahari"'))
    checks.exportRows = csv.trim().split('\n').length - 1
    await page.getByRole('button', { name: 'Actions for Gandikota Lahari' }).click()
    await page.getByRole('menuitem', { name: 'View student' }).click()
    await page.waitForURL(/\/organization\/students\/1/)
    checks.viewStudentUrl = new URL(page.url()).pathname
    await page.goto(`${BASE}/organization/students`, { waitUntil: "domcontentloaded" })
    await page.waitForSelector("table tbody tr", { timeout: 30000 })
    await page.getByLabel("Search students").fill("")
    const nullRow = page.locator("table[aria-label=\"Students\"] tbody tr", { hasText: "Unnamed student" })
    await page.getByLabel("Rows per page").selectOption("25")
    checks.nullStudentRow = (await nullRow.first().innerText()).replace(/\s+/g, " ").trim()
    await page.locator(".students-filter-bar select").first().selectOption("Active")
    checks.activeFilterIncludesUpperCaseStatus = (await nullRow.count()) === 1
    checks.activeFilterMarkedActive = await page.locator(".students-filter-bar [data-active]").count()
    checks.clearFiltersBadge = (await page.locator(".students-clear__count").innerText().catch(() => "")).trim()
    await page.getByLabel("Search students").fill("zzz-no-match")
    checks.emptyStateText = (await page.locator(".students-empty").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim()
    metrics.checks = checks
  }
  report[`${w}x${h}`] = { ...metrics, consoleErrors: consoleErrors.slice(0, 5) }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
