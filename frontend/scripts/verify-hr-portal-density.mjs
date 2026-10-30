import { chromium } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ROUTES } from '../src/shared/constants/routeConstants.js'

// Real authenticated pages only: no fabricated tokens, API fixtures or zoom.
const origin = process.env.HR_DENSITY_URL || 'http://127.0.0.1:5173'
const phase = process.env.HR_DENSITY_PHASE || 'before'
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after for HR_DENSITY_PHASE')
const output = path.resolve('artifacts/hr-portal-density')
await mkdir(path.join(output, phase), { recursive: true })
await writeFile(path.join(output, '.gitignore'), '*\n')
const source = await readFile('src/app/routes/AppRoutes.jsx', 'utf8')
const inventory = new Map()
for (const match of source.matchAll(/path=\{ROUTES\.(EMPLOYEE|HR)\.(\w+)\}/g)) {
  const [, group, key] = match
  if (key === 'LOGIN') continue
  const route = ROUTES[group][key]
  if (route) inventory.set(route, { route, group, key })
}
for (const match of source.matchAll(/path="(\/employee\/[^"\s]+)"/g)) {
  inventory.set(match[1], { route: match[1], group: 'EMPLOYEE', key: 'DETAIL_OR_LITERAL' })
}
for (const match of source.matchAll(/path=\{`\$\{ROUTES\.EMPLOYEE\.(\w+)\}([^`]+)`\}/g)) {
  const route = ROUTES.EMPLOYEE[match[1]] + match[2]
  inventory.set(route, { route, group: 'EMPLOYEE', key: match[1] + '_DETAIL' })
}
const priority = ['/employee/hr-dashboard', '/employee/hr-employees', '/employee/batches', '/employee/syllabus', '/employee/students', '/employee/hr-attendance', '/employee/hr-leave', '/employee/hr-performance', '/employee/resources', '/employee/announcements', '/employee/calendar', '/employee/hr-settings']
const rank = route => { const index = priority.indexOf(route); return index < 0 ? priority.length : index }
const routes = [...inventory.values()].sort((a, b) => rank(a.route) - rank(b.route))
await writeFile(path.join(output, 'routes.json'), JSON.stringify(routes, null, 2))
const viewports = [
  { width: 1440, height: 900 }, { width: 1366, height: 768 },
  { width: 1536, height: 864 }, { width: 1920, height: 1080 },
]
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: viewports[0],
  ...(process.env.HR_DENSITY_STORAGE_STATE ? { storageState: process.env.HR_DENSITY_STORAGE_STATE } : {}),
})
const page = await context.newPage()
const results = []
let errors = []
let imageNetworkFailures = []
page.on('pageerror', error => errors.push({ type: 'pageerror', message: error.message }))
page.on('console', message => {
  if (message.type() === 'error') errors.push({ type: 'console', message: message.text() })
})
page.on('response', response => {
  if (response.request().resourceType() === 'image' && response.status() >= 400) imageNetworkFailures.push({ url: response.url(), status: response.status() })
})
page.on('requestfailed', request => {
  if (request.resourceType() === 'image') imageNetworkFailures.push({ url: request.url(), error: request.failure()?.errorText })
})
let capturedLogin = false
try {
  for (const entry of routes) {
    if (entry.route.includes(':')) {
      results.push({ ...entry, status: 'NOT VERIFIED', reason: 'Requires a real record ID discovered from the authenticated list page.' })
      continue
    }
    for (const viewport of viewports) {
      errors = []
      imageNetworkFailures = []
      await page.setViewportSize(viewport)
      try {
        await page.goto(new URL(entry.route, origin).href, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForFunction(() => /login|unauthorized/.test(location.pathname) || document.querySelector('main'), null, { timeout: 10000 })
      } catch (error) {
        if (!error.message.includes('Timeout')) throw error
      }
      await page.locator('body').waitFor()
      const finalPath = new URL(page.url()).pathname
      if (/login|unauthorized/.test(finalPath)) {
        results.push({ ...entry, viewport, status: 'NOT VERIFIED', reason: `Redirected to ${finalPath}`, errors })
        if (!capturedLogin) {
          await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
          const intro = page.getByRole('button', { name: 'Skip intro', exact: true })
          if (await intro.isVisible()) await intro.click()
          await page.evaluate(() => document.fonts.ready)
          await page.screenshot({ path: path.join(output, phase, 'authentication-blocker.png') })
          capturedLogin = true
        }
        console.log(JSON.stringify({ route: entry.route, status: 'NOT VERIFIED', finalPath }))
        // Other resolutions cannot verify a page that requires authentication.
        break
      }
      await page.evaluate(() => document.fonts.ready)
      await page.waitForFunction(() => [...document.images].filter(img => img.getBoundingClientRect().width && img.getBoundingClientRect().height).every(img => img.complete), null, { timeout: 10000 }).catch(() => {})
      const measurements = await page.evaluate(() => {
        const main = document.querySelector('main')
        const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
        const rect = el => {
          const r = el.getBoundingClientRect(), css = getComputedStyle(el)
          return { x: r.x, y: r.y, width: r.width, height: r.height, padding: css.padding, gap: css.gap }
        }
        const find = selector => [...document.querySelectorAll(selector)].filter(visible).map(rect)
        const images = [...document.images].filter(visible).map(img => ({
          src: img.currentSrc || img.src, alt: img.alt, complete: img.complete,
          naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
          broken: !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0,
          bounds: rect(img), objectFit: getComputedStyle(img).objectFit,
          hero: !!img.closest('.hrp-hero'),
        }))
        const overlap = (a, b) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1
        const kpiCollisions = []
        for (const grid of document.querySelectorAll('.hrp-kpis')) {
          const boxes = [...grid.children].filter(visible).map(rect)
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (overlap(boxes[i], boxes[j])) kpiCollisions.push([i, j])
        }
        return {
          viewport: { width: innerWidth, height: innerHeight },
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          main: main ? { ...rect(main), scrollHeight: main.scrollHeight, clientHeight: main.clientHeight } : null,
          heroes: find('.hrp-hero'), kpis: find('.hrp-kpi'), breadcrumbs: find('.hrp-crumbs'),
          tableHeaders: find('main thead tr'), tableRows: find('main tbody tr'),
          controls: find('main input:not([type=checkbox]):not([type=radio]), main select, main button'),
          cards: find('.hrp-panel'), sidebar: find('aside[data-ui="dashboard-sidebar"]'),
          navbar: find('[data-ui="dashboard-topbar"], .mentor-topbar'),
          images, kpiCollisions,
        }
      })
      const filename = entry.route.replace(/^\//, '').replaceAll('/', '-') + `-${viewport.width}x${viewport.height}`
      await page.screenshot({ path: path.join(output, phase, filename + '-viewport.png') })
      await page.screenshot({ path: path.join(output, phase, filename + '-full-page.png'), fullPage: true })
      results.push({ ...entry, viewport, finalPath, status: 'CAPTURED — visual review required', measurements, errors, imageNetworkFailures, screenshots: [filename + '-viewport.png', filename + '-full-page.png'] })
      console.log(JSON.stringify({ route: entry.route, viewport, ...measurements }))
    }
  }
} finally {
  await browser.close()
  await writeFile(path.join(output, phase, 'measurements.json'), JSON.stringify(results, null, 2))
  const lines = results.map(row => `| ${row.route} | ${row.viewport ? `${row.viewport.width} × ${row.viewport.height}` : '—'} | ${row.status} | ${row.reason || (row.measurements.horizontalOverflow ? 'Horizontal overflow detected' : 'No document overflow; screenshot review pending')} |`)
  await writeFile(path.join(output, phase, 'report.md'), [
    '# HR portal density audit', '',
    'Inventory comes from registered React routes and route constants. Includes shared employee screens and legacy HR redirects so coverage is not restricted to sidebar links.', '',
    'Screenshots use normal browser scale. No layout styles are injected. Full-page screenshots cover the document; pages with an internal main scroller need additional scrolled captures during visual review.', '',
    '| Route | Viewport | Status | Evidence / limitation |', '| --- | --- | --- | --- |', ...lines, '',
    'Employee create/edit and other modal flows require a signed-in session and real records. They have not been verified by this navigation audit.', '',
  ].join('\n'))
}
console.log(JSON.stringify({ discovered: routes.length, captures: results.filter(row => row.measurements).length, unverified: results.filter(row => row.status === 'NOT VERIFIED').length, report: path.join(output, phase, 'report.md') }))
if (results.some(row => row.status === 'NOT VERIFIED' || row.measurements?.horizontalOverflow || row.errors?.length)) process.exitCode = 1
