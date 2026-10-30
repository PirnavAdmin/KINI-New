import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(15000)
  const errors = []
  const posts = []
  let canAdd = true
  let rejectStudent = false
  const batches = [{ batchId: 10, batchName: 'React 1', courseId: 1, courseName: 'React', mentorId: 7, mentorName: 'Test Mentor', capacity: 25, status: 'Upcoming', studentsCount: 0 }]
  const students = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', lastName: 'Team' }))
    for (const [key, value] of Object.entries({ auth_token: 'test-hr', token: 'test-hr', role: 'employee', user_role: 'employee', isAuthenticated: 'true' })) localStorage.setItem(key, value)
  })
  await page.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (!path.startsWith('/api/')) return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort()
    let data = []
    if (path.startsWith('/api/Permission/')) data = ['Dashboard', 'Employees', 'Batches', 'Students', 'Courses'].map(moduleName => ({ moduleName, canAccess: true, canView: true, canAdd }))
    else if (path.includes('employee-profile')) data = { employeeId: 7, role: 'HR', department: 'HR' }
    else if (request.method() === 'POST') {
      assert.equal(request.headers().authorization, 'Bearer test-hr')
      const payload = request.postDataJSON()
      posts.push({ path, payload })
      if (path === '/api/v1/organization/batches') { data = { ...payload, batchId: 11, courseName: 'React', mentorName: 'Test Mentor' }; batches.push(data) }
      else if (path === '/api/v1/organization/students') {
        if (rejectStudent) return route.fulfill({ status: 403, json: { message: 'You do not have permission to add students.' } })
        data = { ...payload, studentId: 12, fullName: `${payload.firstName} ${payload.lastName}`, status: 'Active' }; students.push(data)
      } else throw new Error(`Unexpected create endpoint: ${path}`)
    } else if (/\/courses$/i.test(path)) data = { items: [{ courseId: 1, courseName: 'React', status: true }], totalCount: 1 }
    else if (path === '/api/v1/organization/mentors') data = { items: [{ mentorId: 7, mentorName: 'Test Mentor', status: 'Active', courseIds: [1] }], totalCount: 1 }
    else if (path === '/api/v1/organization/batches') data = { items: batches, totalRecords: batches.length, pageNumber: 1, pageSize: 1000, totalPages: 1 }
    else if (path === '/api/students' || path === '/api/v1/organization/students') data = { items: students, totalCount: students.length, totalPages: 1 }
    return route.fulfill({ json: { success: true, data } })
  })
  await page.goto('http://localhost:5173/employee/batches')
  await page.getByRole('button', { name: 'Add Batch', exact: true }).click()
  const batchForm = page.locator('#batch-management-form')
  await batchForm.waitFor()
  const employeeFields = await batchForm.locator('label').allTextContents()
  await batchForm.getByRole('button', { name: 'Select course', exact: true }).click()
  await batchForm.getByRole('option', { name: /React/ }).click()
  const mentorButton = batchForm.locator('label').filter({ hasText: '2. Assigned Mentor' }).locator('..').getByRole('button').first()
  await mentorButton.click()
  await batchForm.getByRole('option', { name: /Test Mentor/ }).click()
  await batchForm.locator('input[placeholder="Generated after course selection"]').fill('Employee-created batch')
  const start = new Date(); start.setDate(start.getDate() + 5)
  const end = new Date(); end.setDate(end.getDate() + 35)
  await batchForm.locator('input[type="date"]').nth(0).fill(start.toISOString().slice(0, 10))
  await batchForm.locator('input[type="date"]').nth(1).fill(end.toISOString().slice(0, 10))
  await batchForm.getByRole('checkbox', { name: 'Mon' }).check()
  await page.screenshot({ path: 'employee-add-batch-review.png', fullPage: true })
  await page.locator('button[form="batch-management-form"]').click()
  await batchForm.waitFor({ state: 'hidden' })
  await page.getByRole('heading', { name: 'Employee-created batch' }).waitFor()
  assert.equal(posts[0].path, '/api/v1/organization/batches')
  assert.equal(posts[0].payload.courseId, 1)
  assert.equal(posts[0].payload.mentorId, 7)
  assert.equal(posts[0].payload.capacity, 25)
  assert.deepEqual(posts[0].payload.scheduleDays, ['Monday'])
  assert.ok(page.url().endsWith('/employee/batches'))

  await page.goto('http://localhost:5173/employee/students')
  await page.getByRole('button', { name: 'Add Student', exact: true }).click()
  const studentForm = page.locator('form').filter({ has: page.locator('#student-first-name') })
  await studentForm.waitFor()
  const studentLabels = await studentForm.locator('label').allTextContents()
  for (const [id, value] of [['first-name', 'Test'], ['last-name', 'Student'], ['email', 'test.student@example.test'], ['phone', '9876543210']]) await page.locator(`#student-${id}`).fill(value)
  await page.locator('#student-course').selectOption('1')
  await page.locator('#student-batch').selectOption('10')
  rejectStudent = true
  await studentForm.getByRole('button', { name: 'Add Student', exact: true }).click()
  await studentForm.getByText(/permission to add students/).waitFor()
  assert.equal(await page.locator('#student-first-name').inputValue(), 'Test')
  rejectStudent = false
  await page.screenshot({ path: 'employee-add-student-review.png', fullPage: true })
  await studentForm.getByRole('button', { name: 'Add Student', exact: true }).click()
  await studentForm.waitFor({ state: 'hidden' })
  await page.getByText('Test Student', { exact: true }).waitFor()
  assert.equal(posts.at(-1).path, '/api/v1/organization/students')
  assert.deepEqual(posts.at(-1).payload, { firstName: 'Test', lastName: 'Student', email: 'test.student@example.test', phone: '9876543210', courseId: 1, batchId: 10 })
  assert.ok(page.url().endsWith('/employee/students'))
  // No create controls for a view-only employee.
  canAdd = false
  await page.reload()
  await page.getByRole('heading', { name: 'Students', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Add Student', exact: true }).count(), 0)
  await page.goto('http://localhost:5173/employee/batches')
  await page.getByRole('heading', { name: 'Batches', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Add Batch', exact: true }).count(), 0)
  assert.ok(employeeFields.length >= 10)
  assert.equal(studentLabels.length, 6)
  assert.deepEqual(errors, [])
  console.log('PASS: employee Add Batch/Student reuse organization fields, validated payloads and HR token; saved records refresh; forbidden saves preserve form; view-only permissions respected.')
} finally { await browser.close() }
