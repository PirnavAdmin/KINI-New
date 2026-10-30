// Measures the My Batches layout at common 100%-zoom viewports.
// All API responses are intercepted; no real backend is contacted.
// Usage: node scripts/verify-mentor-batches-layout.mjs [--shots]
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SHOTS = process.argv.includes('--shots');
const VIEWPORTS = [
  [1280, 632], // 1920×1080 laptop at 150% Windows scaling
  [1366, 768],
  [1536, 864],
  [1920, 1080],
  [1200, 700],
  [1100, 700],
  [1024, 768],
  [390, 844],
];
const batches = [
  { batchId: 6, batchName: 'Devops 1', courseName: 'Devops', status: 'Completed', courseDescription: 'Learn CI/CD pipelines, containers, Kubernetes orchestration and infrastructure as code with hands-on labs and real deployment projects.', studentCount: 1, capacity: 25, startDate: '2026-06-01', endDate: '2026-12-01', progress: 0 },
  { batchId: 5, batchName: 'nodejs 1', courseName: 'NodeJS', status: 'Active', courseDescription: 'Build scalable backend services with Node.js, Express and MongoDB.', studentCount: 4, capacity: 25, startDate: '2026-05-01', endDate: '2026-11-01', progress: 0 },
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
      if (url.pathname.includes('/Permission/')) data = ['Dashboard', 'Batches', 'Students', 'Courses'].map((moduleName) => ({ moduleName, canAccess: true, canView: true }));
      if (url.pathname.includes('employee-profile') || url.pathname.includes('/Auth/profile')) data = { employeeId: 9, mentorId: 21, role: 'mentor', fullName: 'Test mentor' };
      if (url.pathname === '/api/mentor/dashboard/batches') data = { batches, totalRecords: batches.length };
      return route.fulfill({ json: { data } });
    });
    await page.goto(`${BASE}/mentor/batches`, { waitUntil: 'networkidle' });
    await page.locator('[data-ui="mentor-batch-card"]').first().waitFor();
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; }))));
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const box = (sel) => document.querySelector(sel)?.getBoundingClientRect();
      const r = (n) => (n == null ? null : Math.round(n));
      const grid = document.querySelector('.mv15-batch-grid');
      const cards = [...document.querySelectorAll('[data-ui="mentor-batch-card"]')].map((el) => el.getBoundingClientRect());
      const features = [...document.querySelectorAll('.mentor-banner--batches .mentor-banner__feature')].map((el) => r(el.getBoundingClientRect().top));
      const toolbarKids = [...document.querySelectorAll('.mv15-toolbar > *')].map((el) => r(el.getBoundingClientRect().top));
      const kpis = [...document.querySelectorAll('.mentor-batches-summary [data-ui="kpi"]')].map((el) => r(el.getBoundingClientRect().top));
      const hero = box('.mentor-banner--batches');
      const art = box('.mentor-banner--batches .mentor-banner__art img');
      const copy = box('.mentor-banner--batches .mentor-banner__copy');
      return {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        pageScrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        heroTop: r(hero?.top),
        heroHeight: r(hero?.height),
        heroCopyFits: copy && hero ? copy.bottom <= hero.bottom && copy.top >= hero.top : null,
        heroArtHeight: r(art?.height),
        heroSubtitleTruncated: (() => { const el = document.querySelector('.mentor-banner--batches .mentor-banner__subtitle'); return el ? el.scrollWidth > el.clientWidth : null; })(),
        heroCopyOverlapsArt: copy && art ? copy.right > art.left + 40 : null,
        heroFeatureRows: new Set(features).size,
        kpiHeight: r(box('.mentor-batches-summary [data-ui="kpi"]')?.height),
        kpiRows: new Set(kpis).size,
        filterHeight: r(box('.mv15-toolbar')?.height),
        filterRows: new Set(toolbarKids).size,
        batchGridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : null,
        batchCardsSideBySide: cards.length > 1 && Math.round(cards[0].top) === Math.round(cards[1].top),
        batchCardHeight: r(cards[0]?.height),
        batchCardHeights: cards.map((c) => Math.round(c.height * 10) / 10),
        statsOneRow: [...document.querySelectorAll('.mv15-batch__stats')].every((el) => { const rs = [...el.children].map((c) => c.getBoundingClientRect()); return rs.every((a) => rs.every((b) => a.top < b.bottom && b.top < a.bottom)); }),
        textTruncated: [...document.querySelectorAll('.mv15-batch :is(h2, .mv15-batch__course, .mv15-batch__stats b, .mv15-batch__seats > span:last-child)')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim()),
        footOneRow: [...document.querySelectorAll('.mv15-batch__foot')].every((el) => new Set([...el.children].map((c) => Math.round(c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2))).size === 1),
        cardContentClipped: [...document.querySelectorAll('.mv15-batch__body')].some((el) => el.scrollHeight > el.clientHeight + 1 || el.getBoundingClientRect().bottom > el.closest('.mv15-batch').getBoundingClientRect().bottom),
        batchCoverHeight: r(box('.mv15-batch__cover')?.height),
        batchGridBottom: r(box('.mv15-batch-grid')?.bottom),
        paginationBottom: r(box('.mv15-pager')?.bottom),
      };
    });
    console.log(`== ${width}x${height}`, JSON.stringify(m));
    if (SHOTS) await page.screenshot({ path: `artifacts/mentor-batches-${width}x${height}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
