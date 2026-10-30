import { chromium } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Read user-supplied credentials at runtime; never embed them or print responses/tokens.
const attachment = process.env.HR_LOGIN_INSTRUCTIONS
if (!attachment) throw new Error('Set HR_LOGIN_INSTRUCTIONS to the user-supplied instructions file')
const instructions = await readFile(attachment, 'utf8')
const email = instructions.match(/Email:\s*([^\s]+)/)?.[1]
const password = instructions.match(/Password:\s*([^\s]+)/)?.[1]
if (!email || !password) throw new Error('Credentials not found in the supplied instructions')
const output = path.resolve('artifacts/hr-portal-density/authenticated')
await mkdir(output, { recursive: true })
await writeFile(path.dirname(output) + '/.gitignore', '*\n')
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const loginResponses = []
const loginRequestFailures = []
page.on('requestfailed', request => {
  if (request.method() === 'POST' && /login/i.test(new URL(request.url()).pathname)) loginRequestFailures.push({ url: request.url().split('?')[0], error: request.failure()?.errorText })
})
page.on('response', async response => {
  if (response.request().method() !== 'POST' || !/login/i.test(new URL(response.url()).pathname)) return
  let message = null
  try { const body = await response.json(); message = body.message || body.error?.message || (typeof body.error === 'string' ? body.error : null) } catch {}
  loginResponses.push({ url: response.url().split('?')[0], status: response.status(), message })
})
let result
try {
  await page.goto('http://127.0.0.1:5173/employee/login', { waitUntil: 'domcontentloaded' })
  const intro = page.getByRole('button', { name: 'Skip intro', exact: true })
  if (await intro.isVisible()) await intro.click()
  await page.getByRole('dialog', { name: 'Welcome to Kini Edx Hub', exact: true }).waitFor({ state: 'detached' })
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL(url => !url.pathname.includes('login'), { timeout: 25000 }).catch(() => {})
  const visibleErrors = await page.locator('[role="alert"]').allTextContents()
  const authenticated = !new URL(page.url()).pathname.includes('login')
  const navigation = authenticated ? await page.locator('aside').innerText().catch(() => '') : ''
  result = { loginPageUrl: 'http://127.0.0.1:5173/employee/login', loginSucceeded: authenticated, loginResponses, loginRequestFailures, resultingUrl: page.url(), visibleErrors, hrNavigationVisible: /employees|attendance|leave|HR/i.test(navigation), navigation }
  if (authenticated && result.hrNavigationVisible) {
    await context.storageState({ path: path.join(output, 'temporary-auth-state.json') })
    await page.screenshot({ path: path.join(output, 'login-success-1440x900.png') })
  } else {
    await page.screenshot({ path: path.join(output, 'login-failure-1440x900.png'), mask: [page.locator('#login-password')], maskColor: '#ffffff' })
    await page.locator('#login-password').fill('').catch(() => {})
  }
  await writeFile(path.join(output, 'login-result.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
  if (!authenticated || !result.hrNavigationVisible) process.exitCode = 1
} finally { await browser.close() }
