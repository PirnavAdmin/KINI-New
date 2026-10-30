// Browser regression against the real UI/services with an explicitly mocked API.
// This verifies reload behavior, not live backend persistence.
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 600 } })
  page.setDefaultTimeout(30000)
  const errors = []
  page.on('pageerror', error => { errors.push(error.message); console.error(error.message) })
  let branches = []
  let creates = 0
  let deletes = 0
  let gets = 0
  await page.route('**/api/v1/organization/branches**', async route => {
    const request = route.request()
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (request.method() === 'POST') {
      branches.push({ ...request.postDataJSON(), branchId: 42 })
      creates++
      return route.fulfill({ status: 201, headers, json: { branchId: 42 } })
    }
    if (request.method() === 'DELETE') {
      assert.ok(request.url().endsWith('/42'))
      branches = []
      deletes++
      return route.fulfill({ status: 204, headers })
    }
    gets++
    return route.fulfill({ headers, json: branches })
  })
  await page.route('**/__branch-regression', route => route.fulfill({ contentType: 'text/html', body: `
    <html><body><div id="root"></div><script type="module">
      import RefreshRuntime from '/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      localStorage.setItem('organization_id', '7');
      localStorage.removeItem('isDemo');
      const ReactModule = await import('/node_modules/.vite/deps/react.js'); const React = ReactModule.default ?? ReactModule;
      const DOMModule = await import('/node_modules/.vite/deps/react-dom_client.js'); const {createRoot} = DOMModule.default ?? DOMModule;
      const {default: OrgBranches} = await import('/src/features/organization/pages/OrgBranches.jsx');
      await import('/src/index.css');
      createRoot(document.getElementById('root')).render(React.createElement(OrgBranches));
    </script></body></html>` }))
  await page.goto('http://127.0.0.1:4173/__branch-regression')
  await page.getByText('No branches found', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Add Branch', exact: true }).first().click()
  const required = page.locator('input[required]')
  for (const [index, value] of ['Browser Regression Branch', '9876543210', 'Hyderabad', 'India'].entries()) await required.nth(index).fill(value)
  await page.locator('textarea').fill('42 Browser Regression Street')
  const email = page.locator('input[type=email]')
  await email.scrollIntoViewIfNeeded()
  await email.click()
  await page.waitForTimeout(200)
  const before = await email.evaluate(el => el.closest('.overflow-y-auto').scrollTop)
  assert.ok(before > 0, 'Modal must be scrolled for this reproduction')
  await email.pressSequentially('test@example.com', { delay: 50 })
  const after = await email.evaluate(el => ({ scroll: el.closest('.overflow-y-auto').scrollTop, focused: document.activeElement === el }))
  assert.equal(after.scroll, before)
  assert.equal(after.focused, true)
  await page.getByRole('button', { name: 'Save Branch', exact: true }).click()
  await page.getByText('42 Browser Regression Street', { exact: true }).waitFor()
  assert.equal(creates, 1)
  assert.equal(branches[0].address, '42 Browser Regression Street')
  await page.reload()
  await page.getByText('42 Browser Regression Street', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Delete branch', exact: true }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByText('No branches found', { exact: true }).waitFor()
  await page.waitForTimeout(10000)
  await page.reload()
  await page.getByText('No branches found', { exact: true }).waitFor()
  assert.equal(deletes, 1)
  assert.ok(gets >= 5)
  assert.deepEqual(errors, [])
  console.log('PASS: real browser email scroll/focus; address POST/GET/reload; DELETE/refetch/10-second wait/reload (mock API).')
} finally {
  await browser.close()
}
