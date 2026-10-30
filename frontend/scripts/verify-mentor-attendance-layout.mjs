// Measures the mentor My Attendance layout at common 100%-zoom viewports.
// All API responses are intercepted (empty attendance); no real backend is contacted.
// Usage: node scripts/verify-mentor-attendance-layout.mjs [--shots]
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
      localStorage.setItem('user', JSON.stringify({ userId: 12, employeeId: 9, mentorId: 21, fullName: 'Nani Narendraaaa', email: 'mentor@example.com', role: 'mentor' }));
    });
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
      let data = [];
      if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Leave', 'Attendance'].map((moduleName) => ({ moduleName, canAccess: true, canView: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, mentorId: 21, role: 'mentor', fullName: 'Nani Narendraaaa' };
      return route.fulfill({ json: { data } });
    });
    await page.goto(`${BASE}/mentor/attendance`, { waitUntil: 'networkidle' });
    await page.locator('.mv15-table--attendance tbody tr').nth(6).waitFor();
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; }))));
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const r = (n) => (n == null ? null : Math.round(n * 10) / 10);
      const root = document.querySelector('.mentor-attendance-v15');
      const box = (sel) => root.querySelector(sel)?.getBoundingClientRect();
      const hero = box('.mentor-banner--attendance');
      const copy = box('.mentor-banner__copy');
      const art = box('.mentor-banner__art img');
      const buttons = [...root.querySelectorAll('.mentor-banner__actions .mentor-hero-btn')].map((b) => b.getBoundingClientRect());
      const identity = root.querySelector('.mv15-identity');
      const identityKids = [...identity.children].filter((el) => getComputedStyle(el).display !== 'none').map((el) => el.getBoundingClientRect());
      const stats = [...root.querySelectorAll('.mv15-stat')].map((el) => el.getBoundingClientRect());
      const head = root.querySelector('.mv15-history__head');
      const rows = [...root.querySelectorAll('.mv15-table--attendance tbody tr')].map((row) => row.getBoundingClientRect());
      const table = box('.mv15-table--attendance');
      const scroller = (() => { let el = root.parentElement; while (el && el !== document.body) { const s = getComputedStyle(el); if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el; el = el.parentElement; } return document.scrollingElement; })();
      const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        navbarBottom: r(document.querySelector('header')?.getBoundingClientRect().bottom),
        heroTop: r(hero.top),
        heroHeight: r(hero.height),
        heroCopyFits: copy.bottom <= hero.bottom + 0.5,
        heroButtonsOneRow: new Set(buttons.map((b) => Math.round(b.top))).size === 1,
        heroButtonHeight: r(buttons[0]?.height),
        heroCopyOverlapsButtons: buttons.some((b) => overlaps(b, copy)),
        heroArtHeight: r(art?.height),
        userStatusHeight: r(identity.getBoundingClientRect().height),
        userStatusOneRow: identityKids.every((a) => identityKids.every((b) => a.top < b.bottom && b.top < a.bottom)),
        kpiCardHeight: r(stats[0].height),
        kpiOneRow: new Set(stats.map((s) => Math.round(s.top))).size === 1,
        weekHeaderHeight: r(head.getBoundingClientRect().height),
        weekHeaderOneRow: (() => { const [a, b] = [...head.children].map((el) => el.getBoundingClientRect()); return a.top < b.bottom && b.top < a.bottom; })(),
        tableHeaderHeight: r(box('.mv15-table--attendance thead tr').height),
        ...Object.fromEntries(rows.slice(0, 7).map((row, i) => [`${days[i]}Height`, r(row.height)])),
        tableBottom: r(table.bottom),
        viewportBottom: innerHeight,
        allRowsVisible: rows.length >= 7 && rows[6].bottom <= innerHeight,
        scrollNeeded: scroller.scrollHeight - scroller.clientHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    console.log(`== ${width}x${height}`, JSON.stringify(m));
    if (SHOTS) await page.screenshot({ path: `artifacts/mentor-attendance-${width}x${height}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
