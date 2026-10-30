import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

// Public smoke checks in a fresh, unauthenticated context. Does not read or
// change the user's signed-in browser, submit credentials, or mock responses.
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const viewport of [
    { width: 1366, height: 768 }, { width: 1440, height: 900 },
    { width: 1536, height: 864 }, { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto(`${process.env.HR_DENSITY_URL || 'http://127.0.0.1:5173'}/employee/hr-dashboard`)
    await page.waitForURL('**/employee/login')
    await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor({ state: 'visible' })
    const intro = page.getByRole('button', { name: 'Skip intro', exact: true })
    if (await intro.isVisible()) await intro.click()
    assert.ok(await page.getByLabel('Email Address or Phone').isVisible())
    assert.ok(await page.getByLabel('Password', { exact: true }).isVisible())
    const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }))
    assert.ok(layout.scrollWidth <= layout.width, `Public login overflow at ${viewport.width}`)
    console.log(JSON.stringify({ viewport, loginControlsVisible: true, horizontalOverflow: false }))
  }
  assert.deepEqual(errors, [])
  console.log('PASS: public authentication redirect and login controls at all four desktop viewports. Authenticated HR density remains pending.')
} finally { await browser.close() }
