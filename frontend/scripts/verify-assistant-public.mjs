import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const route of ['/', '/enrollment?courseId=5']) {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
      const launcher = page.getByRole('button', { name: 'Open Kini Assistant', exact: true });
      await launcher.click({ timeout: 30000 });
      await page.getByText('Hi! I’m the Kini Assistant.', { exact: false }).waitFor();
      if (await page.getByText('Session snapshot', { exact: true }).count()) throw new Error('Guest diagnostics are visible');
      if (await page.getByText('Live backend connected', { exact: true }).count()) throw new Error('Unverified connection status is visible');
      const expected = route === '/' ? 'What courses are available?' : 'What is this course fee?';
      await page.getByRole('button', { name: expected, exact: true }).waitFor();
      await page.locator('#kini-assistant-input').fill('How do I enroll?');
      if (!await page.getByRole('button', { name: 'Send message', exact: true }).isEnabled()) throw new Error('Send is disabled');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (overflow) throw new Error('Horizontal overflow');
      await page.getByRole('button', { name: 'Close Kini Assistant', exact: true }).click();
      console.log(`PASS ${viewport.width}px ${route}: guest branding, suggestions, input, close, overflow`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
