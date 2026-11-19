import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173/about', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href="/programs"]').filter({ hasText: 'Explore Programs' });
    await link.waitFor({ state: 'visible', timeout: 30000 });
    await page.evaluate(() => { window.aboutNavigationMarker = true; });
    await link.click();
    await page.waitForURL('**/programs');
    if (!await page.evaluate(() => window.aboutNavigationMarker)) throw new Error('Navigation reloaded the app');
    await page.goBack();
    await page.waitForURL('**/about');
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`PASS ${width}px: About CTA → Programs → Back, no reload or page errors`);
    await context.close();
  }
} finally { await browser.close(); }
