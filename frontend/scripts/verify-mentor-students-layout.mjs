// Measures the mentor My Students layout at common 100%-zoom viewports.
// All API responses are intercepted (13 mock students); no real backend is contacted.
// Usage: node scripts/verify-mentor-students-layout.mjs [--shots]
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SHOTS = process.argv.includes('--shots');
const VIEWPORTS = [
  [1280, 585], // 1920×1080 laptop at 150% Windows scaling, Chrome UI + taskbar visible
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [1100, 700],
  [390, 844],
];
const names = ['hari krishna', 'sri hari', 'venkat kadiveti', 'siva kumar', 'NARAYANA MOHAN', 'lakshmi priya', 'arjun reddy', 'meena kumari', 'rahul varma', 'divya sree', 'kiran teja', 'anil kumar', 'swathi rao'];
const students = names.map((studentName, i) => ({
  studentId: i + 1,
  studentName,
  email: `${studentName.toLowerCase().replace(/\s+/g, '')}${i}@gmail.com`,
  batchId: 5,
  batchName: 'nodejs 1',
  courseName: 'nodejs',
  status: 'Active',
}));

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
      if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Students', 'Batches'].map((moduleName) => ({ moduleName, canAccess: true, canView: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, mentorId: 21, role: 'mentor', fullName: 'Test mentor' };
      if (url.pathname === '/api/mentor/dashboard/students') data = { students, totalRecords: students.length };
      if (url.pathname === '/api/mentor/dashboard/batches') data = { batches: [{ batchId: 5, batchName: 'nodejs 1', courseName: 'nodejs' }] };
      return route.fulfill({ json: { data } });
    });
    await page.goto(`${BASE}/mentor/students`, { waitUntil: 'networkidle' });
    await page.locator('.mv15-table--students tbody tr').first().waitFor();
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; }))));
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const r = (n) => (n == null ? null : Math.round(n * 10) / 10);
      const root = document.querySelector('.mentor-students-page');
      const box = (sel) => root.querySelector(sel)?.getBoundingClientRect();
      const hero = box('.mentor-banner--students');
      const copy = box('.mentor-banner__copy');
      const kpis = [...root.querySelectorAll('[data-ui="kpi"]')].map((el) => el.getBoundingClientRect());
      const toolbar = root.querySelector('.mv15-toolbar');
      const tools = [...toolbar.children].map((el) => el.getBoundingClientRect());
      const table = root.querySelector('.mv15-table--students');
      const wrap = root.querySelector('.mv15-table-wrap');
      const rows = [...table.querySelectorAll('tbody tr')].map((row) => row.getBoundingClientRect());
      const scroller = (() => { let el = root.parentElement; while (el && el !== document.body) { const s = getComputedStyle(el); if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el; el = el.parentElement; } return document.scrollingElement; })();
      const truncated = [...table.querySelectorAll('thead th')].filter((th) => th.scrollWidth > th.clientWidth + 1).map((th) => th.textContent.trim());
      return {
        viewport: `${innerWidth}x${innerHeight}`,
        heroTop: r(hero.top),
        heroHeight: r(hero.height),
        heroCopyFits: copy.bottom <= hero.bottom + 0.5,
        heroArtHeight: r(box('.mentor-banner__art img')?.height),
        kpiHeight: r(kpis[0].height),
        kpiRows: new Set(kpis.map((k) => Math.round(k.top))).size,
        filterHeight: r(toolbar.getBoundingClientRect().height),
        filterControlHeight: r(tools[0].height),
        filterRows: new Set(tools.map((t) => Math.round(t.top))).size,
        tableTop: r(table.getBoundingClientRect().top),
        tableHeaderHeight: r(table.querySelector('thead tr').getBoundingClientRect().height),
        studentRowHeight: r(rows[0]?.height),
        visibleStudentRows: rows.filter((row) => row.bottom <= innerHeight).length,
        tableWidth: r(table.getBoundingClientRect().width),
        availableContentWidth: r(wrap.clientWidth),
        horizontalOverflow: wrap.scrollWidth > wrap.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth,
        truncatedHeaders: truncated,
        pageScrollHeight: scroller.scrollHeight,
      };
    });
    console.log(`== ${width}x${height}`, JSON.stringify(m));
    if (SHOTS) await page.screenshot({ path: `artifacts/mentor-students-${width}x${height}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
