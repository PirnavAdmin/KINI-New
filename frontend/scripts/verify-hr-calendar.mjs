// Visual + behaviour check for the HR Calendar workspace (/employee/calendar).
//
//   node scripts/verify-hr-calendar.mjs [label]
//
// Needs the dev server on http://localhost:5173. The permission, profile and
// HR calendar APIs are answered with SYNTHETIC fixtures (page.route), placed
// relative to today, so the real UI renders as an HR user without a backend
// login; nothing here ships with the app.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'artifacts/hr-calendar'
const label = process.argv[2] ?? 'current'
mkdirSync(OUT, { recursive: true })

const pad = (n) => String(n).padStart(2, '0')
const local = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
const today = new Date()
const at = (dayOffset, h, m = 0) => { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, h, m); return local(d) }
const dateOnly = (dayOffset) => at(dayOffset, 0).slice(0, 10)
let EVENTS = [
  { eventId: 1, title: 'Team standup', eventType: 'MEETING', startDateTime: at(0, 9, 30), endDateTime: at(0, 10, 0), location: 'Room 2', meetingLink: 'https://meet.example.test/standup', allDay: false, description: 'Daily sync' },
  { eventId: 2, title: 'Hiring review', eventType: 'MEETING', startDateTime: at(0, 9, 45), endDateTime: at(0, 11, 0), allDay: false },
  { eventId: 3, title: 'Quarterly review – Sales', eventType: 'PERFORMANCE', startDateTime: at(1, 14, 0), endDateTime: at(1, 15, 30), allDay: false },
  { eventId: 4, title: 'Company offsite', eventType: 'MEETING', startDateTime: dateOnly(2), endDateTime: dateOnly(2), allDay: true },
]
const LEAVES = [{ leaveRequestId: 8, employeeId: 9, employeeName: 'Kiran Babu', leaveType: 'Sick', startDate: `${dateOnly(-1)}T00:00:00`, endDate: `${dateOnly(0)}T00:00:00`, status: 'APPROVED', reason: 'Fever' }]
const CLASSES = [{ liveClassId: 101, classTitle: 'React Live Class', scheduledDate: dateOnly(0), startTime: '11:00:00', endTime: '12:00:00', status: 'Scheduled' }]

const SEED = () => {
  const exp = new Date(Date.now() + 86400000).toISOString()
  for (const [k, v] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: exp, role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(k, v)
  localStorage.setItem('user', JSON.stringify({ userId: 1, employeeId: 1, organizationId: 3, role: 'HR', userRole: 'Employee', firstName: 'Saii', name: 'Saii Purna', email: 'saii@example.test' }))
}
const PROFILE = { userId: 1, employeeId: 1, organizationId: 3, firstName: 'Saii', lastName: 'Purna', email: 'saii@example.test', role: 'HR', userRole: 'Employee', departmentName: 'Human Resources', designation: 'HR' }
const GRANTS = Object.fromEntries(['dashboard', 'calendar', 'employees', 'leave'].map((key) => [key, { access: true, view: true, add: true, edit: true, delete: true }]))
const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })
const wrap = (data) => json({ success: true, data })

const browser = await chromium.launch()
const report = {}
for (const [w, h] of [[1536, 900], [1280, 800], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const consoleErrors = []
  const requests = []
  page.on('pageerror', (error) => consoleErrors.push(String(error)))
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource|status of 40\d|status of 50\d/.test(message.text())) consoleErrors.push(message.text().slice(0, 160)) })
  await page.addInitScript(SEED)
  await page.route(/\/api\/Permission\//, (route) => route.fulfill(wrap(GRANTS)))
  await page.route(/\/api\/(v1\/employee-profile|Auth\/profile\/1)(\?|$)/, (route) => route.fulfill(wrap(PROFILE)))
  await page.route(/\/api\/hr\/calendar\//, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    requests.push(`${request.method()} ${url.pathname.replace('/api/hr/calendar', '')}${url.searchParams.get('FromDate') ? `?from=${url.searchParams.get('FromDate').slice(0, 10)}&to=${url.searchParams.get('ToDate').slice(0, 10)}` : ''}`)
    const path = url.pathname.replace('/api/hr/calendar', '')
    if (path === '/events' && request.method() === 'POST') { const body = request.postDataJSON(); EVENTS = [...EVENTS, { eventId: 50, ...body }]; return route.fulfill(wrap({ eventId: 50 })) }
    if (path === '/events') return route.fulfill(wrap({ items: EVENTS, totalPages: 1, totalCount: EVENTS.length }))
    if (path === '/events/upcoming') return route.fulfill(wrap({ items: EVENTS.filter((e) => new Date(e.endDateTime) >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) }))
    if (path === '/events/stats') return route.fulfill(wrap({ eventsThisMonth: EVENTS.length, classesScheduled: 1, meetings: 3, holidays: 0, leaveEvents: 1 }))
    if (/^\/events\/\d+$/.test(path)) return route.fulfill(wrap(EVENTS.find((e) => String(e.eventId) === path.split('/').pop()) ?? {}))
    if (path === '/leaves') return route.fulfill(wrap({ items: LEAVES }))
    if (path === '/classes') return route.fulfill(wrap({ items: CLASSES }))
    if (path === '/holidays') return route.fulfill(wrap({ items: [] }))
    return route.fulfill(wrap({ items: [] }))
  })
  await page.goto(`${BASE}/employee/calendar`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.hcw', { timeout: 40000 })
  await page.waitForFunction(() => !document.querySelector('.hcw-bar__loading'), null, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/${label}-${w}x${h}.png` })
  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - innerWidth,
    hcwOverflow: (() => { const el = document.querySelector('.hcw'); return el.scrollWidth - el.clientWidth })(),
    view: document.querySelector('.hcw-views [aria-pressed="true"]')?.textContent,
    range: document.querySelector('.hcw-bar__range')?.textContent,
    sidebar: Boolean(document.querySelector('.hcw-side')),
    timedEvents: [...document.querySelectorAll('.hcw-event')].map((el) => { const r = el.getBoundingClientRect(); return [el.querySelector('b').textContent, Math.round(r.left), Math.round(r.width), Math.round(r.height)] }),
    allDay: [...document.querySelectorAll('.hcw-allday .hcw-chip')].map((el) => el.textContent),
    nowLine: Boolean(document.querySelector('.hcw-now')),
    agendaItems: document.querySelectorAll('.hcw-agenda button').length,
    alerts: [...document.querySelectorAll('[role=alert]')].map((el) => el.textContent.slice(0, 120)),
    calendars: [...document.querySelectorAll('.hcw-cals label')].map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
  }))
  if (w === 1536) {
    const checks = {}
    checks.requests = [...new Set(requests)]
    // Drag 2:00 → 3:30 PM on today's column: opens the Add Event form pre-filled.
    const column = page.locator('.hcw-col.is-today')
    const box = await column.boundingBox()
    await page.locator('.hcw-time__body').evaluate((el) => { el.scrollTop = 44 * 12 })
    const top = (await column.boundingBox()).y
    await page.mouse.move(box.x + box.width / 2, top + 44 * 14 + 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, top + 44 * 15, { steps: 4 })
    await page.mouse.move(box.x + box.width / 2, top + 44 * 15.5, { steps: 4 })
    checks.selectionLabel = await page.locator('.hcw-selection').textContent().catch(() => null)
    await page.mouse.up()
    await page.waitForTimeout(600)
    // The existing HR form modal has no dialog role; its date-time fields identify it.
    checks.prefilled = await page.evaluate(() => [...document.querySelectorAll('input[type="datetime-local"]')].map((el) => el.value))
    checks.createForm = checks.prefilled.length > 0
    await page.screenshot({ path: `${OUT}/${label}-create.png` })
    await page.getByLabel(/^Title/).fill('Interview loop')
    // Event Type is a select when the API supplies options, otherwise a text field.
    const typeField = page.getByLabel(/^Event Type/)
    if (await typeField.evaluate((el) => el.tagName === 'SELECT')) await typeField.selectOption('MEETING')
    else await typeField.fill('MEETING')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(1500)
    checks.postSent = requests.includes('POST /events')
    checks.createdVisible = await page.locator('.hcw-event', { hasText: 'Interview loop' }).count()
    // Event details panel.
    await page.locator('.hcw-event', { hasText: 'Team standup' }).click()
    checks.panel = (await page.locator('.hcw-panel').innerText()).replace(/\s+/g, ' ')
    checks.meetingLink = await page.locator('.hcw-panel a').getAttribute('href')
    await page.screenshot({ path: `${OUT}/${label}-panel.png` })
    await page.keyboard.press('Escape')
    checks.panelClosed = (await page.locator('.hcw-panel').count()) === 0
    // Read-only leave event.
    await page.locator('.hcw-allday .hcw-chip', { hasText: 'Kiran Babu' }).first().click()
    checks.leavePanel = (await page.locator('.hcw-panel').innerText()).replace(/\s+/g, ' ')
    await page.keyboard.press('Escape')
    // Filters update immediately.
    await page.getByRole('checkbox', { name: /^Meetings/ }).uncheck()
    checks.afterHidingMeetings = await page.locator('.hcw-event').evaluateAll((els) => els.map((el) => el.querySelector('b').textContent))
    await page.getByRole('checkbox', { name: /^Meetings/ }).check()
    // Search.
    await page.getByPlaceholder('Search events or people').fill('kiran')
    checks.searchAllDay = await page.locator('.hcw-allday .hcw-chip').allInnerTexts()
    await page.getByPlaceholder('Search events or people').fill('')
    // Views and navigation.
    await page.getByRole('button', { name: 'Day', exact: true }).click()
    checks.dayRange = await page.locator('.hcw-bar__range').textContent()
    await page.getByRole('button', { name: 'Next day' }).click()
    checks.nextDayRange = await page.locator('.hcw-bar__range').textContent()
    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.getByRole('button', { name: 'Month', exact: true }).click()
    checks.monthCells = await page.locator('.hcw-month__cell').count()
    checks.monthToday = await page.locator('.hcw-month__cell.is-today .hcw-month__day').textContent()
    await page.screenshot({ path: `${OUT}/${label}-month.png` })
    await page.getByRole('button', { name: 'Next month' }).first().click()
    await page.waitForTimeout(1200)
    checks.nextMonthRange = await page.locator('.hcw-bar__range').textContent()
    checks.nextMonthRequest = requests.filter((r) => r.startsWith('GET /events?')).slice(-1)[0]
    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.getByRole('button', { name: 'Agenda', exact: true }).click()
    await page.waitForTimeout(800)
    checks.agenda = await page.locator('.hcw-agenda > li').evaluateAll((els) => els.slice(0, 3).map((el) => el.innerText.replace(/\s+/g, ' ').slice(0, 120)))
    await page.screenshot({ path: `${OUT}/${label}-agenda.png` })
    // Keyboard: Enter on a day column opens the form.
    await page.getByRole('button', { name: 'Week', exact: true }).click()
    await page.locator('.hcw-col').first().focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(400)
    checks.keyboardCreate = await page.evaluate(() => [...document.querySelectorAll('input[type="datetime-local"]')].map((el) => el.value))
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /^(Cancel|Close)$/ }).first().click({ timeout: 1500 }).catch(() => {})
    // Collapse the sidebar.
    await page.getByRole('button', { name: 'Hide sidebar' }).click()
    checks.sidebarHidden = (await page.locator('.hcw-side').count()) === 0
    metrics.checks = checks
  }
  report[`${w}x${h}`] = { ...metrics, consoleErrors: consoleErrors.slice(0, 5) }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
