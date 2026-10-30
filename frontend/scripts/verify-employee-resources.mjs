import { chromium } from 'playwright'
import { jsPDF } from 'jspdf'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const pdf = new jsPDF()
pdf.text('Resource preview test - page one', 20, 20)
pdf.addPage()
pdf.text('Resource preview test - page two', 20, 20)
const bytes = Buffer.from(pdf.output('arraybuffer'))
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
  const errors = []
  const calls = []
  let failFile = false
  let failList = false
  let empty = false
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    const user = { employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team', email: 'hr@example.test' }
    localStorage.setItem('user', JSON.stringify(user))
    for (const [key, value] of Object.entries({ auth_token: 'test-hr', token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value)
  })
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (!url.pathname.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort()
    calls.push(url.pathname)
    if (/\/resources\/7\/(download|preview)$/.test(url.pathname)) {
      assert.equal(route.request().headers().authorization, 'Bearer test-hr')
      return failFile ? route.fulfill({ status: 404, json: { message: 'Missing attachment' } }) : route.fulfill({ contentType: 'application/pdf', headers: { 'content-disposition': 'attachment; filename="guide.pdf"' }, body: bytes })
    }
    let data = []
    if (url.pathname.startsWith('/api/Permission/')) data = ['Dashboard', 'Resources'].map(moduleName => ({ moduleName, canAccess: true, canView: true }))
    if (url.pathname.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' }
    if (url.pathname === '/api/hr/resources') {
      if (failList) return route.fulfill({ status: 500, json: { message: 'Unavailable' } })
      data = { items: empty || url.searchParams.get('Search') === 'missing' ? [] : [{ resourceId: 7, name: 'Team learning guide', fileName: { name: 'guide.pdf' }, fileType: { label: 'PDF' }, category: { id: 2, name: 'Learning' }, description: { text: 'Shared learning material' }, size: { value: 4, unit: 'KB' } }], totalCount: empty ? 0 : 1 }
    }
    return route.fulfill({ json: { data } })
  })
  // Match the user's origin: localhost and 127.0.0.1 can reach different
  // IPv6/IPv4 Vite instances even when both use port 5173.
  await page.goto(process.env.RESOURCE_TEST_URL || 'http://localhost:5173/employee/resources')
  // These use real bundled files from Vite, never mocked file responses.
  const library = JSON.parse(await readFile('src/features/employee/data/learningResources.json', 'utf8'))
  await page.getByRole('button', { name: 'View React Hooks Cheat Sheet' }).waitFor()
  assert.equal(await page.getByRole('article').count(), 6)
  await page.screenshot({ path: 'employee-learning-library-review.png', fullPage: true })
  for (const resource of library) {
    const downloadReady = page.waitForEvent('download')
    await page.getByRole('button', { name: `Download ${resource.title}`, exact: true }).click()
    const downloaded = await downloadReady
    assert.equal(downloaded.suggestedFilename(), resource.fileName)
    assert.deepEqual(await readFile(await downloaded.path()), await readFile(`public${resource.url}`))
    await page.getByRole('button', { name: `View ${resource.title}`, exact: true }).click()
    const reader = page.getByRole('dialog')
    if (resource.type === 'pdf') await reader.locator('canvas:not(.hidden)').waitFor()
    else { await reader.locator('pre').filter({ hasText: 'import' }).waitFor() }
    if (resource.type === 'pdf') await page.screenshot({ path: 'employee-learning-pdf-review.png', fullPage: true })
    await reader.getByRole('button', { name: 'Close', exact: true }).click()
    await reader.waitFor({ state: 'hidden' })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'employee-learning-library-mobile-review.png', fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Shared by HR' }).click()
  const direct = page.getByRole('button', { name: 'Download Team learning guide', exact: true })
  await direct.waitFor()
  const downloadEvent = page.waitForEvent('download')
  await direct.click()
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'guide.pdf')
  assert.deepEqual(await readFile(await download.path()), bytes)
  assert.equal(await page.getByRole('dialog').count(), 0)
  const countBeforeView = calls.filter(path => path.endsWith('/download')).length
  await page.getByRole('button', { name: 'View Team learning guide' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('canvas:not(.hidden)').waitFor()
  assert.equal(calls.filter(path => path.endsWith('/download')).length, countBeforeView)
  await dialog.getByRole('button', { name: 'Next page' }).click()
  await dialog.getByText('Page 2 of 2').waitFor()
  await dialog.locator('canvas:not(.hidden)').waitFor()
  await page.waitForFunction(() => [...document.querySelectorAll('[role="dialog"] button')].some(button => button.textContent === 'Previous page' && !button.disabled))
  await page.screenshot({ path: 'employee-resource-preview-review.png', fullPage: true })
  const modalDownload = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Download file' }).click()
  await modalDownload
  assert.equal(await dialog.count(), 1)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'employee-resource-preview-mobile-review.png', fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  failFile = true
  let failedDownloads = 0
  const unexpectedDownload = () => { failedDownloads++ }
  page.on('download', unexpectedDownload)
  await direct.click()
  await page.getByText('This file is missing. Ask HR to upload the attachment again.', { exact: true }).waitFor()
  assert.equal(failedDownloads, 0)
  page.off('download', unexpectedDownload)
  await page.getByRole('button', { name: 'View Team learning guide' }).click()
  await dialog.getByRole('alert').filter({ hasText: 'file is missing' }).waitFor()
  failFile = false
  await dialog.getByRole('button', { name: 'Retry preview' }).click()
  await dialog.locator('canvas:not(.hidden)').waitFor()
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('textbox', { name: 'Search resources' }).fill('missing')
  await page.getByText('No matching resources').waitFor()
  await page.getByRole('textbox', { name: 'Search resources' }).fill('')
  await direct.waitFor()
  failList = true
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Unable to load' }).waitFor()
  failList = false
  empty = true
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await page.getByText('No resources available', { exact: true }).waitFor()
  assert.equal(await page.getByText('React Hooks Cheat Sheet').count(), 0)
  assert.deepEqual(errors, [])
  console.log('PASS: six actual bundled files downloaded and previewed; HR authenticated downloads, two-page PDF preview, mobile layout, retry/search/empty states.')
} finally { await browser.close() }
