import { chromium } from 'playwright'
const BASE = 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const runs = [
  ['/student/dashboard', { role: 'student' }],
  ['/student/my-classes', { role: 'student' }],
  ['/student/payments', { role: 'student' }],
  ['/student/batch', { role: 'student' }],
  ['/mentor/dashboard', { role: 'mentor' }],
  ['/mentor/courses', { role: 'mentor' }],
  ['/organization/employees', { role: 'org-admin' }],
]
for (const [route, { role }] of runs) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  await page.addInitScript(({ role }) => {
    const now = Date.now() + 3600 * 24 * 1000
    localStorage.setItem('user_role', role)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('token_expiration', new Date(now).toISOString())
    localStorage.setItem('user', JSON.stringify({ id: 1, userId: 1, name: 'Aarav Sharma', firstName: 'Aarav', role, isDemo: true }))
  }, { role })
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(1200)
    const res = await page.evaluate(() => ({
      path: location.pathname,
      canvas: (() => { const m = document.querySelector('[data-dashboard-role]'); return m ? getComputedStyle(m).backgroundColor : null })(),
      h1: [...document.querySelectorAll('main h1')].map((el) => el.textContent.trim().slice(0, 26)).join(' / ') || '(none)',
    }))
    console.log('==', route, '->', res.path, '| canvas:', res.canvas, '| h1:', res.h1, '| pageErrors:', errors.length ? errors.join(' ;; ') : 'none')
  } catch (err) {
    console.log('==', route, 'FAILED', String(err).slice(0, 140), 'errors:', errors.join(' ; '))
  }
  await page.close()
}
await browser.close()
