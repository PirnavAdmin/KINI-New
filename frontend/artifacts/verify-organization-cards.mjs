import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Synthetic API fixtures only: this check never reads or changes live tenant data.
const before = process.argv.includes('--before');
const liveOnly = process.argv.includes('--live');
const prefix = before ? 'before' : 'after';
const root = 'artifacts/organization-cards';
fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', timezoneId: 'Asia/Kolkata' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
await page.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ organizationId: 2, role: 'org-admin', firstName: 'Test Admin' }));
  for (const [key, value] of Object.entries({ organizationToken: 'test-token', auth_token: 'test-token', user_role: 'org-admin', organization_id: '2', organizationId: '2', isAuthenticated: 'true' })) localStorage.setItem(key, value);
});
let populated = false;
let live = false;
const future = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const classes = ['Frontend workshop', 'Data analysis lab', 'Security fundamentals', 'Backend architecture'].map((title, index) => ({
  liveClassId: index + 1, classTitle: title, organizationId: 2, courseId: index + 1, batchId: index + 10, batchName: `Cohort ${index + 1}`, mentorName: `Mentor ${index + 1}`,
  scheduledDate: `${future}T00:00:00`, startTime: `${10 + index}:00:00`, endTime: `${11 + index}:00:00`, status: 'Scheduled',
}));
await page.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.pathname.includes('/demo-api/v1/enrollment-requests')) return route.fulfill({ json: [] });
  if (!url.pathname.startsWith('/api/')) return route.continue();
  let data = [];
  if (/\/organization\/(dashboard|stats)$/.test(url.pathname)) data = {};
  if (populated && url.pathname === '/api/v1/live-classes') data = [...classes,
    ...(live ? [{ ...classes[0], liveClassId: 99, classTitle: 'Current live lab', scheduledDate: `${today}T00:00:00`, status: 'Live' }] : []),
    { ...classes[0], liveClassId: 90, organizationId: 9, classTitle: 'Other tenant class' }];
  if (populated && url.pathname === '/api/v1/organization/batches') data = classes.map(item => ({ batchId: item.batchId, courseId: item.courseId, batchName: item.batchName, organizationId: 2 }));
  if (populated && url.pathname === '/api/v1/organization/students') data = [{ studentId: 1, organizationId: 2, firstName: 'Test', lastName: 'Learner', courseId: 1, courseName: 'Frontend course', batchId: 10, status: 'Active' }];
  if (populated && url.pathname === '/api/StudentBatch/student/1/enrollments') return route.fulfill({ json: { studentId: 1, courses: [{ courseId: 1, courseName: 'Frontend course', batchId: 10, enrollmentStatus: 'Active' }] } });
  if (populated && url.pathname === '/api/v1/organization/students/1/progress') data = { percentage: 45 };
  return route.fulfill({ json: { success: true, data } });
});
const report = [];
try {
  for (const scenario of before ? ['empty'] : liveOnly ? ['live'] : ['empty', 'populated']) {
    populated = scenario !== 'empty';
    live = scenario === 'live';
    for (const [width, height] of before || liveOnly ? [[1440, 900]] : [[1440, 900], [1280, 929], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto('http://127.0.0.1:5173/organization/dashboard', { waitUntil: 'networkidle' });
      const heading = page.getByRole('heading', { name: 'Upcoming Classes', exact: true });
      await heading.waitFor();
      const row = heading.locator('xpath=ancestor::section[1]/parent::*');
      await row.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${root}/${prefix}-${scenario}-${width}-page.png`, fullPage: true });
      if (width > 1100) await row.screenshot({ path: `${root}/${prefix}-${scenario}-${width}-cards.png` });
      else {
        // The dashboard scrolls inside main. Capture each mobile card after
        // scrolling it into view so the scroll panel cannot clip later cards.
        for (const [index, card] of (await row.locator(':scope > section').all()).entries()) {
          await card.scrollIntoViewIfNeeded();
          await card.screenshot({ path: `${root}/${prefix}-${scenario}-${width}-card-${index + 1}.png` });
        }
      }
      const metrics = await row.evaluate(element => ({
        width: element.getBoundingClientRect().width,
        columns: getComputedStyle(element).gridTemplateColumns,
        gap: getComputedStyle(element).gap,
        cards: [...element.children].map(card => ({ width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height, radius: getComputedStyle(card).borderRadius, heading: getComputedStyle(card.querySelector('h2')).fontSize })),
        donut: element.querySelector('.kd-donut').getBoundingClientRect().width,
        images: [...element.querySelectorAll('img')].map(image => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })),
      }));
      report.push({ scenario, width, ...metrics });
      if (!before) {
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'page overflow');
        assert.ok(metrics.images.length === (live ? 1 : 2) && metrics.images.every(image => image.loaded), 'illustrations loaded');
        if (live) await row.getByText('LIVE', { exact: true }).waitFor();
        if (width >= 1280) {
          assert.ok(metrics.cards.every(card => Math.abs(card.height - 424) <= 1), 'equal 424px cards');
          assert.ok(metrics.donut <= 180 && metrics.donut >= 140, 'compact responsive donut');
        }
        if (populated) {
          assert.equal(await row.locator('.kd-list li').count(), 4);
          assert.equal(await row.getByText('Other tenant class').count(), 0);
          await row.getByText('45%', { exact: true }).first().waitFor();
        } else await row.getByText('0%', { exact: true }).waitFor();
      }
    }
  }
  if (!before && !liveOnly) {
    const upcoming = page.getByRole('heading', { name: 'Upcoming Classes', exact: true }).locator('xpath=ancestor::section[1]');
    await upcoming.getByRole('button', { name: 'Schedule a Class', exact: true }).click();
    await page.waitForURL('**/organization/live-classes?create=true');
    await page.getByRole('heading', { name: 'Schedule Live Class', exact: true }).waitFor();
  }
  assert.deepEqual(errors, []);
  if (liveOnly) {
    await page.getByRole('button', { name: 'Join Live Class', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/organization/live-classes' && url.searchParams.get('class')?.includes('Current live lab'));
  }
  fs.writeFileSync(`${root}/${prefix}${liveOnly ? '-live' : ''}-metrics.json`, JSON.stringify({ report, errors }, null, 2));
  console.log(JSON.stringify({ report, errors }, null, 2));
} finally { await browser.close(); }
