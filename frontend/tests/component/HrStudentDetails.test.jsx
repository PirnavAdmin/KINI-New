import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import apiClient from '@shared/services/apiClient'
import StudentDetails from '@features/hr/pages/StudentDetails'
import HrApiModule from '@features/hr/components/HrApiModule'
import { loadHrStudentDetails } from '@features/hr/services/hrStudentDetails'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/services/courseService', () => ({ courseService: { getCourse: vi.fn().mockResolvedValue({ courseId: 18, name: 'New Course' }) } }))
vi.mock('@shared/services/batchService', () => ({ batchService: { getById: vi.fn() } }))
vi.mock('@shared/services/mentorService', () => ({ mentorService: { getMentor: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, hero }) => <main>{hero}{children}</main> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
const rows = [
  { studentId: 24, studentCode: 'STD-024', userId: 999, fullName: 'First Student', courseName: 'Node', batchName: 'Node 1', mentorName: 'First Mentor', courseId: 1, batchId: 2, mentorId: 3, email: 'first@example.com', status: 'Active' },
  { StudentId: 51, studentCode: 'STD-051', fullName: 'Second Student', courseName: 'React', batchName: 'React 2', mentorName: 'Second Mentor', status: 'Rejected' },
]
const response = data => ({ data, status: 200, config: {} })
function setup(detail = {}) {
  apiClient.request.mockImplementation(async ({ url }) => {
    if (url === '/api/students') return response({ items: rows, totalCount: 2 })
    const row = rows.find(item => String(item.studentId ?? item.StudentId) === url.split('/').at(-1))
    if (!row) throw { response: { status: 404 } }
    return response({ studentId: row.studentId ?? row.StudentId, email: row.email, ...detail })
  })
}
const app = entry => render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="/employee/students" element={<HrApiModule module="students" />} /><Route path="/employee/students/:studentId" element={<StudentDetails />} /></Routes></MemoryRouter>)
it.each([24, 51])('loads student %s directly and preserves that student’s relationships', async id => {
  setup(); app(`/employee/students/${id}`)
  const expected = id === 24 ? rows[0] : rows[1]
  await screen.findByRole('heading', { name: expected.fullName })
  expect(screen.getAllByText(expected.mentorName).length).toBeGreaterThan(0)
  expect(screen.getAllByText(expected.courseName).length).toBeGreaterThan(0)
  expect(screen.queryByText(id === 24 ? 'Second Mentor' : 'First Mentor')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: `/api/students/${id}` }))
})
it.each(['name', 'avatar'])('%s navigates with studentId instead of code or userId', async action => {
  setup(); app('/employee/students')
  const button = await screen.findByRole('button', { name: 'First Student' })
  fireEvent.click(action === 'avatar' ? button.firstElementChild : button)
  await screen.findByRole('heading', { name: 'First Student' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/students/24' }))
  expect(apiClient.request.mock.calls.some(([request]) => /STD-024|999/.test(request.url))).toBe(false)
})
it('falls back to an exact roster match on detail 404', async () => {
  setup(); const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/students/24' ? Promise.reject({ response: { status: 404 } }) : original(request))
  const result = await loadHrStudentDetails('24')
  expect(result.student.fullName).toBe('First Student')
  expect(result.warning).toContain('Detailed profile is unavailable')
})
it('rejects a mismatched profile', async () => {
  setup({ studentId: 51 })
  await expect(loadHrStudentDetails('24')).rejects.toThrow('unexpected student')
})
it('does not treat an authentication failure as successful roster fallback', async () => {
  setup(); const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/students/24' ? Promise.reject({ response: { status: 401 } }) : original(request))
  app('/employee/students/24')
  expect(await screen.findByRole('alert')).toHaveTextContent('session has expired')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('session has expired')
})
it('shows not found only after checking the full roster', async () => {
  setup(); app('/employee/students/77')
  await screen.findByText('Student not found.')
  expect(screen.getByRole('link', { name: /Back to Students/ })).toHaveAttribute('href', '/employee/students')
})
it('does not retain an old relationship name when its ID changed', async () => {
  setup({ courseId: 18 })
  const result = await loadHrStudentDetails('24')
  expect(result.student.courseName).toBe('New Course')
})
it('preserves the existing edit DTO and saves to the route student ID', async () => {
  HTMLElement.prototype.scrollTo = vi.fn()
  setup({ firstName: 'First', lastName: 'Student', phone: '9999999999' })
  app('/employee/students/24')
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Student' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'First Name' }), { target: { value: 'Updated' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findByRole('button', { name: 'Edit Student' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/api/students/24', data: { firstName: 'Updated', lastName: 'Student', email: 'first@example.com', phone: '9999999999', courseId: 1, batchId: 2, mentorId: 3 } }))
})

it('uses the backend id alias when studentId is blank', async () => {
  setup()
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === '/api/students'
    ? Promise.resolve(response({ items: [{ ...rows[0], studentId: '', id: 24 }], totalCount: 1 }))
    : original(request))
  app('/employee/students')
  fireEvent.click(await screen.findByRole('button', { name: 'First Student' }))
  await screen.findByRole('heading', { name: 'First Student' })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/students/24' }))
})
it('prefers new nested relationship names over old roster names', async () => {
  setup({ course: { courseId: 18, name: 'Updated Course' }, batch: { batchId: 19, name: 'Updated Batch' }, mentor: { mentorId: 20, firstName: 'Updated', lastName: 'Mentor' } })
  const result = await loadHrStudentDetails('24')
  expect(result.student).toMatchObject({ courseId: 18, courseName: 'Updated Course', batchId: 19, batchName: 'Updated Batch', mentorId: 20, mentorName: 'Updated Mentor' })
})
it('rejects an unidentifiable detail response without an exact roster match', async () => {
  setup()
  apiClient.request.mockImplementation(async ({ url }) => response(url === '/api/students' ? { items: [], totalCount: 0 } : { fullName: 'Unverified Student' }))
  await expect(loadHrStudentDetails('24')).rejects.toThrow('verify the student identifier')
})
it('clears the previous profile when navigating to another student', async () => {
  setup()
  app('/employee/students')
  fireEvent.click(await screen.findByRole('button', { name: 'First Student' }))
  await screen.findByRole('heading', { name: 'First Student' })
  fireEvent.click(screen.getByRole('link', { name: /Back to Students/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Second Student' }))
  await screen.findByRole('heading', { name: 'Second Student' })
  expect(screen.queryByRole('heading', { name: 'First Student' })).not.toBeInTheDocument()
  expect(screen.queryByText('First Mentor')).not.toBeInTheDocument()
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/students/51' }))
})

it('opens a student Overview with profile information and the returned student metrics', async () => {
  setup({ attendancePercentage: 92, completionPercentage: 65, assessmentsCleared: 4, enrolledCoursesCount: 2 })
  app('/employee/students')
  fireEvent.click(await screen.findByRole('button', { name: 'First Student' }))
  await screen.findByRole('heading', { name: 'First Student' })
  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Overview')
  expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Academic & Enrollment Details' })).toBeInTheDocument()
  for (const [label, value] of [['Attendance', '92%'], ['Learning Progress', '65%'], ['Assessments Cleared', '4'], ['Enrolled Courses', '2']]) {
    expect(screen.getByText(label, { selector: '.kini-kpi__label' }).closest('.kini-kpi').querySelector('.kini-kpi__value')).toHaveTextContent(value)
  }
  expect(screen.getByRole('button', { name: 'Edit Student' })).toBeInTheDocument()
})

it('keeps unavailable student metrics empty instead of fabricating zeros', async () => {
  setup()
  app('/employee/students/24')
  await screen.findByRole('heading', { name: 'First Student' })
  for (const value of document.querySelectorAll('.kini-kpi__value')) expect(value).toHaveTextContent('\u2014')
})
