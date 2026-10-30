// Measures the mentor Leave Requests layout at common 100%-zoom viewports.
// All API responses are intercepted; no real backend is contacted.
// Usage: node scripts/verify-leave-requests-layout.mjs [--shots]
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SHOTS = process.argv.includes('--shots');
const VIEWPORTS = [
  [1280, 585], // 1920×1080 laptop at 150% Windows scaling, Chrome UI + taskbar visible
  [1366, 768],
  [1536, 864],
  [1920, 1080],
  [1100, 700],
  [390, 844],
];
const leave = (leaveRequestId, leaveType, startDate, endDate, totalDays, reason, status) => ({ leaveRequestId, leaveType, startDate, endDate, totalDays, reason, status });
const history = [
  leave(3, 'Work From Home', '2026-09-26', '2026-09-27', 2, 'hi', 'Pending'),
  leave(4, 'Sick', '2026-09-26', '2026-09-26', 1, 'dsfdf', 'Pending'),
  leave(2, 'Sick', '2026-09-25', '2026-09-26', 2, 'dkjhakdfha', 'Pending'),
  leave(1, 'Sick', '2026-09-17', '2026-09-23', 7, 'hiiii health emergency', 'Approved'),
];

const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.addInitScript(() => {
      localStorage.setItem('token', 'layout-test-session');
      localStorage.setItem('auth_token', 'layout-test-session');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('role', 'mentor');
      localStorage.setItem('employeeId', '9');
      localStorage.setItem('user', JSON.stringify({ userId: 12, employeeId: 9, mentorId: 21, fullName: 'Test mentor', email: 'mentor@example.com', role: 'mentor' }));
    });
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
      let data = [];
      if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Leave', 'Attendance'].map((moduleName) => ({ moduleName, canAccess: true, canView: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, mentorId: 21, role: 'mentor', fullName: 'Test mentor' };
      if (url.pathname === '/api/v1/leave-requests/my') data = history;
      return route.fulfill({ json: { data } });
    });
    await page.goto(`${BASE}/mentor/leave`, { waitUntil: 'networkidle' });
    await page.locator('[data-leave-row]').first().waitFor();
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; }))));
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const r = (n) => (n == null ? null : Math.round(n * 10) / 10);
      const root = document.querySelector('.leave-requests-page');
      const box = (sel) => root.querySelector(sel)?.getBoundingClientRect();
      const hero = box('.mentor-banner--leave');
      const heroEl = root.querySelector('.mentor-banner--leave');
      const copy = box('.mentor-banner__copy');
      const art = box('.mentor-banner__art img');
      const btn = box('.mentor-banner__actions .mentor-hero-btn');
      const script = box('.mentor-banner__script');
      const kpis = [...root.querySelectorAll('[data-ui="kpi"]')].map((el) => el.getBoundingClientRect());
      const filter = root.querySelector('[role="search"]');
      const filterKids = [...filter.children].map((el) => Math.round(el.getBoundingClientRect().top));
      const rows = [...root.querySelectorAll('[data-leave-row]')].map((el) => el.getBoundingClientRect());
      const footer = root.querySelector('table').closest('section').lastElementChild.getBoundingClientRect();
      const scroller = (() => { let el = root.parentElement; while (el && el !== document.body) { const s = getComputedStyle(el); if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el; el = el.parentElement; } return document.scrollingElement; })();
      const overlap = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return {
        viewport: `${innerWidth}x${innerHeight}`,
        navbarBottom: r(document.querySelector('header')?.getBoundingClientRect().bottom),
        heroTop: r(hero?.top),
        heroHeight: r(hero?.height),
        heroContentOverflow: heroEl ? copy.bottom > hero.bottom - 1 : null,
        heroButtonOverlapsArt: overlap(btn, art),
        heroScriptOverlapsButton: overlap(script, btn),
        heroArtHeight: r(art?.height),
        kpiHeight: r(kpis[0]?.height),
        kpiOneRow: new Set(kpis.map((k) => Math.round(k.top))).size === 1,
        filterHeight: r(filter.getBoundingClientRect().height),
        filterControlHeight: r(filter.querySelector('label').getBoundingClientRect().height),
        filterOneRow: new Set(filterKids).size === 1,
        tableHeaderHeight: r(root.querySelector('thead tr').getBoundingClientRect().height),
        rowHeights: rows.map((row) => r(row.height)),
        tableFooterHeight: r(footer.height),
        tableFooterBottom: r(footer.bottom),
        allRowsAndFooterVisible: footer.bottom <= innerHeight,
        scrollNeeded: scroller.scrollHeight - scroller.clientHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        viewportHeight: innerHeight,
      };
    });
    console.log(`== ${width}x${height}`, JSON.stringify(m));
    if (SHOTS) await page.screenshot({ path: `artifacts/leave-requests-${width}x${height}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
