import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Captures only the real accessible login surface in a separate context.
// No credentials, API mocking, storage manipulation or density overrides.
const output = path.resolve('artifacts/hr-portal-density/after')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const results = []
let networkFailures = [], consoleErrors = [], pageErrors = []
page.on('response', response => {
  if (response.request().resourceType() === 'image' && response.status() >= 400) networkFailures.push({ url: response.url(), status: response.status() })
})
page.on('requestfailed', request => {
  if (request.resourceType() === 'image') networkFailures.push({ url: request.url(), error: request.failure()?.errorText })
})
page.on('pageerror', error => pageErrors.push(error.message))
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 1536, height: 864 }, { width: 1920, height: 1080 }]) {
    networkFailures = []; consoleErrors = []; pageErrors = []
    await page.setViewportSize(viewport)
    await page.goto(`${process.env.HR_DENSITY_URL || 'http://127.0.0.1:5173'}/employee/hr-dashboard`)
    await page.waitForURL('**/employee/login')
    await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor({ state: 'visible' })
    const intro = page.getByRole('button', { name: 'Skip intro', exact: true })
    if (await intro.isVisible()) await intro.click()
    await page.getByRole('dialog', { name: 'Welcome to Kini Edx Hub', exact: true }).waitFor({ state: 'detached' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => [...document.images].filter(img => img.getBoundingClientRect().width && img.getBoundingClientRect().height).every(img => img.complete), null, { timeout: 10000 }).catch(() => {})
    const evidence = await page.evaluate(() => {
      const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
      return {
        viewport: { width: innerWidth, height: innerHeight },
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        images: [...document.images].filter(img => img.getBoundingClientRect().width && img.getBoundingClientRect().height).map(img => ({
          src: img.currentSrc || img.src, alt: img.alt, complete: img.complete,
          naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
          broken: !img.complete || !img.naturalWidth || !img.naturalHeight,
          objectFit: getComputedStyle(img).objectFit, bounds: rect(img),
        })),
        backgrounds: [...document.querySelectorAll('body *')].map(el => ({ tag: el.tagName, background: getComputedStyle(el).backgroundImage })).filter(row => row.background.includes('url(')),
        controls: [...document.querySelectorAll('input, button')].filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height).map(el => ({ tag: el.tagName, label: el.getAttribute('aria-label') || el.name || el.textContent, bounds: rect(el) })),
      }
    })
    const screenshot = `employee-login-${viewport.width}x${viewport.height}.png`
    await page.screenshot({ path: path.join(output, screenshot), animations: 'disabled' })
    results.push({ route: '/employee/login', requestedRoute: '/employee/hr-dashboard', viewport, screenshot, ...evidence, imageNetworkFailures: [...networkFailures], consoleErrors: [...consoleErrors], pageErrors: [...pageErrors], status: 'CAPTURED — requires screenshot review' })
    console.log(JSON.stringify({ viewport, screenshot, images: evidence.images.map(img => ({ alt: img.alt, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, broken: img.broken })), horizontalOverflow: evidence.horizontalOverflow, imageNetworkFailures: networkFailures, pageErrors }))
  }
} finally {
  await browser.close()
  await writeFile(path.join(output, 'public-image-audit.json'), JSON.stringify(results, null, 2))
}
