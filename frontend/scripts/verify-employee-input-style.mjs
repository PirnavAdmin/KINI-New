import { chromium } from 'playwright'
import assert from 'node:assert/strict'

// Synthetic API responses keep this visual check independent of employee data.
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => console.error(error.message))
  page.on('console', message => { if (message.type() === 'error') console.error(message.text()) })
  await page.addInitScript(() => {
    for (const [key, value] of Object.entries({ token: 'demo-token', auth_token: 'demo-token', token_expiration: new Date(Date.now() + 86400000).toISOString(), role: 'org-admin', user_role: 'org-admin', isAuthenticated: 'true' })) localStorage.setItem(key, value)
    localStorage.setItem('user', JSON.stringify({ userId: 1, organizationId: 3, role: 'org-admin', name: 'Kini', isDemo: true }))
  })
  await page.route('**/api/**', route => new URL(route.request().url()).pathname.startsWith('/api/')
    ? route.fulfill({ json: { success: true, data: [], totalRecords: 0 } })
    : route.continue())
  await page.goto('http://127.0.0.1:5173/artifacts/employee-input-preview.html')
  const controls = page.locator('.employee-form [data-form-control]')
  await controls.first().waitFor()
  assert.equal(await controls.count(), 7)
  const check = async () => {
    const styles = await controls.evaluateAll(elements => elements.map(element => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, image: style.backgroundImage, height: style.height, radius: style.borderRadius, color: style.color }
    }))
    for (const style of styles) {
      assert.equal(style.background, 'rgb(255, 248, 239)')
      assert.equal(style.image, 'none')
      assert.equal(style.height, '44px')
      assert.equal(style.radius, '14px')
    }
  }
  await check()
  await controls.first().hover()
  await check()
  await controls.first().focus()
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.employee-form [data-form-control]')).borderTopColor === 'rgb(243, 153, 36)')
  assert.equal(await controls.first().evaluate(el => getComputedStyle(el).borderTopColor), 'rgb(243, 153, 36)')
  await check()
  await page.locator('.employee-form button[aria-haspopup]').first().click()
  await check()
  await page.getByRole('option').first().click()
  await page.getByRole('button', { name: 'Create Employee', exact: true }).click()
  assert.ok(await page.locator('.employee-form [aria-invalid="true"]').count() > 0)
  await check()
  await controls.evaluateAll(elements => elements.forEach(element => { element.disabled = true }))
  await check()
  await page.screenshot({ path: 'artifacts/employee-input-style.png', fullPage: true })
  console.log('PASS: all seven employee controls keep cream backgrounds, 44px height and 14px corners through default, hover, focus, open, error and disabled states; orange focus border verified.')
} finally {
  await browser.close()
}
