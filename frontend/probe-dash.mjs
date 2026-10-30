import { chromium } from 'playwright'
const BASE = 'http://127.0.0.1:4173'
const SEED = () => {
  const now = Date.now() + 3600 * 24 * 1000
  localStorage.setItem('user_role', 'student'); localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('token', 'demo-token'); localStorage.setItem('token_expiration', new Date(now).toISOString())
  localStorage.setItem('user', JSON.stringify({ id: 1, userId: 1, name: 'Aarav Sharma', firstName: 'Aarav', role: 'student', isDemo: true, courseName: 'Full Stack Web Development' }))
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.addInitScript(SEED)
await page.goto(BASE + '/student/dashboard', { waitUntil: 'networkidle', timeout: 25000 })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const hero = document.querySelector('.student-premium-dashboard .premium-welcome')
  const hs = hero ? getComputedStyle(hero) : null
  const actionBtn = document.querySelector('.student-premium-dashboard .student-hero-action button')
  const ab = actionBtn ? getComputedStyle(actionBtn) : null
  const pill = document.querySelector('.student-premium-dashboard .student-course-pill')
  const ps = pill ? getComputedStyle(pill) : null
  const cards = [...document.querySelectorAll('.student-premium-dashboard .stat-card')].length
  const quick = [...document.querySelectorAll('.student-premium-dashboard .student-quick-access-card')].length
  const content = [...document.querySelectorAll('.student-premium-dashboard .content-card')].length
  const statChip = document.querySelector('.student-premium-dashboard .stat-icon')
  const chip = statChip ? getComputedStyle(statChip) : null
  const statVal = document.querySelector('.student-premium-dashboard .stat-card h2')
  const val = statVal ? getComputedStyle(statVal) : null
  const visibleAction = actionBtn ? actionBtn.getBoundingClientRect().width > 0 : false
  const blueText = [...document.querySelectorAll('[data-dashboard-role="student"] main *')].filter((el) => {
    const s = getComputedStyle(el); return s.color === 'rgb(15, 85, 247)' || s.color === 'rgb(37, 99, 235)'
  }).length
  return {
    heroBg: hs?.backgroundColor, heroBorder: hs?.borderColor, heroVisible: hero?.getBoundingClientRect().height > 0,
    heroActionVisible: visibleAction, btnBg: ab?.backgroundColor, btnColor: ab?.color,
    pillBg: ps?.backgroundColor, pillColor: ps?.color,
    statCards: cards, quickAccess: quick, contentCards: content,
    chipBg: chip?.backgroundColor, chipColor: chip?.color, statValueColor: val?.color,
    blueTextCount: blueText,
  }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
