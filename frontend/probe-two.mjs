import { chromium } from 'playwright'
const BASE = 'http://127.0.0.1:4173'
const SEED = () => {
  const now = Date.now() + 3600 * 24 * 1000
  localStorage.setItem('user_role', 'student')
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('token', 'demo-token')
  localStorage.setItem('token_expiration', new Date(now).toISOString())
  localStorage.setItem('user', JSON.stringify({ id: 1, userId: 1, name: 'Aarav Sharma', firstName: 'Aarav', role: 'student', isDemo: true, courseName: 'Full Stack' }))
}
const browser = await chromium.launch()
for (const route of ['/student/payments', '/student/class-schedule']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.addInitScript(SEED)
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(1000)
  const info = await page.evaluate(() => {
    const out = { h1s: [], agenda: null, ruleFound: false }
    out.h1s = [...document.querySelectorAll('[data-dashboard-role="student"] main h1')].map((el) => {
      const s = getComputedStyle(el)
      const ui = el.closest('[data-ui="student-page-header"]')
      return { text: el.textContent.trim().slice(0, 20), size: s.fontSize, parent: ui ? 'student-page-header' : 'other', cls: (el.className || '').toString().slice(0, 90), inMain: !!el.closest('main') }
    })
    for (const sheet of document.styleSheets) {
      let rules = []
      try { rules = [...sheet.cssRules] } catch { continue }
      const flat = []
      const walk = (list) => { for (const r of list) { if (r.cssRules) walk(r.cssRules); else if (r.selectorText) flat.push(r) } }
      walk(rules)
      if (flat.some((r) => r.selectorText && r.selectorText.includes('from-blue-50/80'))) out.ruleFound = true
    }
    const sec = [...document.querySelectorAll('section')].find((el) => (el.className || '').includes('from-blue-50/80'))
    if (sec) {
      const s = getComputedStyle(sec)
      out.agenda = { bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 60), matches: sec.matches('html body [data-dashboard-role="student"] main section[class*="from-blue-50/80"]') }
    }
    return out
  })
  console.log('==', route, JSON.stringify(info, null, 1))
  await page.close()
}
await browser.close()
