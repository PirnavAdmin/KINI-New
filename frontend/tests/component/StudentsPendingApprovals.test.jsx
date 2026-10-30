import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import StudentsPage from '@/pages/students/StudentsPage'
import { studentsApi } from '@/api/students'
import {
  createEnrollmentApprovalRequest,
  getPendingEnrollmentApprovals,
  updateEnrollmentApprovalRequest,
} from '@shared/services/enrollmentApprovalStore'

vi.mock('@/api/students', () => ({
  studentsApi: {
    list: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    getErrorMessage: (error) => error?.message || 'error',
  },
}))
vi.mock('@shared/services/invoiceService', () => ({ invoiceService: {}, default: {} }))
vi.mock('@/pages/students/StudentList', () => ({ default: () => <div>student-list-view</div> }))
vi.mock('@/pages/students/StudentForm', () => ({ default: () => null }))

const backendStudents = (extra = []) => [
  ...Array.from({ length: 10 }, (_, index) => ({ id: index + 1, studentId: index + 1, name: `Active ${index + 1}`, status: 'Active' })),
  ...Array.from({ length: 6 }, (_, index) => ({ id: index + 11, studentId: index + 11, name: `Rejected ${index + 1}`, status: 'Rejected' })),
  ...extra,
]

const checkoutRequest = (firstName, email) => createEnrollmentApprovalRequest({
  student: { firstName, lastName: 'kadiveti', email, phone: '9876543210', batchId: 7 },
  course: { id: 3, title: 'nodejs' },
  batch: { id: 7, name: 'Node Morning', shift: 'Morning' },
  payment: { status: 'Successful', transactionId: `txn-${firstName}`, amount: 4999, method: 'UPI', paidAt: new Date().toISOString() },
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

const renderStudents = (path = '/organization/students?tab=approvals') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/organization/students" element={<StudentsPage />} />
      <Route path="/organization/approvals" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>,
)

const kpi = (label) => screen.getByText(label, { selector: '.kini-kpi__label' }).closest('[data-ui="kpi-card"]').querySelector('.kini-kpi__value').textContent

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("organizationId", "2")
  studentsApi.list.mockResolvedValue({ data: backendStudents() })
})
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear() })

it('shows the pending enrollment requests the dashboard lists in Students → Pending approval', async () => {
  const prabha = checkoutRequest('prabha', 'prabha@example.com')
  const bhargav = checkoutRequest('bhargav', 'bhargav@example.com')
  // The dashboard widget and the Students tab must be fed by the same list.
  const dashboardIds = getPendingEnrollmentApprovals().map((approval) => approval.id).sort()
  expect(dashboardIds).toEqual([prabha.id, bhargav.id].sort())

  renderStudents()

  expect(await screen.findByText('prabha kadiveti')).toBeInTheDocument()
  expect(screen.getByText('bhargav kadiveti')).toBeInTheDocument()
  expect(screen.queryByText('All caught up!')).not.toBeInTheDocument()
  // Both cards carry the course, payment state and contact details from the request.
  expect(screen.getAllByText('nodejs')).toHaveLength(2)
  expect(screen.getAllByText('Successful')).toHaveLength(2)
  expect(screen.getByText('prabha@example.com')).toBeInTheDocument()
  // Pending KPI and tab badge agree with the list; enrollment requests are not students.
  const tab = within(screen.getByRole('navigation', { name: 'Student management views' })).getByRole('button', { name: /Pending Approval/ })
  expect(within(tab).getByText('2')).toBeInTheDocument()
  expect(kpi('Pending Approval')).toBe('2')
  expect(kpi('Total Students')).toBe('16')
  expect(kpi('Active Students')).toBe('10')
  expect(kpi('Rejected')).toBe('6')
})

it('shows the empty state only when there is nothing pending anywhere', async () => {
  renderStudents()
  expect(await screen.findByText('All caught up!')).toBeInTheDocument()
  expect(kpi('Pending Approval')).toBe('0')
})

it('does not show resolved requests and reacts live when a request is approved elsewhere', async () => {
  const approved = checkoutRequest('prabha', 'prabha@example.com')
  checkoutRequest('bhargav', 'bhargav@example.com')
  updateEnrollmentApprovalRequest(approved.id, { status: 'Approved' })

  renderStudents()
  expect(await screen.findByText('bhargav kadiveti')).toBeInTheDocument()
  expect(screen.queryByText('prabha kadiveti')).not.toBeInTheDocument()
  expect(kpi('Pending Approval')).toBe('1')

  const remaining = getPendingEnrollmentApprovals()[0]
  act(() => { updateEnrollmentApprovalRequest(remaining.id, { status: 'Rejected' }) })
  await waitFor(() => expect(screen.getByText('All caught up!')).toBeInTheDocument())
  expect(kpi('Pending Approval')).toBe('0')
})

it('opens the existing review screen for an enrollment request', async () => {
  const request = checkoutRequest('prabha', 'prabha@example.com')
  renderStudents()
  await screen.findByText('prabha kadiveti')
  fireEvent.click(screen.getByRole('button', { name: 'Review & approve' }))
  expect(screen.getByTestId('location')).toHaveTextContent(`/organization/approvals?student=${request.id}`)
})

it('still lists, approves and counts backend students awaiting approval', async () => {
  studentsApi.list.mockResolvedValue({ data: backendStudents([{ id: 99, studentId: 99, name: 'Backend Pending', status: 'Pending', course: 'React', email: 'b@example.com', mobile: '9000000000' }]) })
  studentsApi.approve.mockImplementation(async () => {
    studentsApi.list.mockResolvedValue({ data: backendStudents([{ id: 99, studentId: 99, name: 'Backend Pending', status: 'Active', course: 'React', email: 'b@example.com' }]) });
    return {};
  })
  checkoutRequest('prabha', 'prabha@example.com')

  renderStudents()
  expect(await screen.findByText('Backend Pending')).toBeInTheDocument()
  expect(screen.getByText('prabha kadiveti')).toBeInTheDocument()
  expect(kpi('Pending Approval')).toBe('2')
  expect(kpi('Total Students')).toBe('17')

  fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Approve student' }))
  await waitFor(() => expect(studentsApi.approve).toHaveBeenCalledWith(99))
  fireEvent.click(await screen.findByRole('button', { name: 'Done' }))
  await waitFor(() => expect(screen.queryByText('Backend Pending')).not.toBeInTheDocument())
  expect(kpi('Pending Approval')).toBe('1')
  expect(kpi('Active Students')).toBe('11')
})

it('keeps the Student list tab working', async () => {
  checkoutRequest('prabha', 'prabha@example.com')
  renderStudents('/organization/students')
  expect(await screen.findByText('student-list-view')).toBeInTheDocument()
  expect(kpi('Pending Approval')).toBe('1')
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Student management views' })).getByRole('button', { name: /Pending Approval/ }))
  expect(await screen.findByText('prabha kadiveti')).toBeInTheDocument()
})

it('uses the same pending aliases and applicant grouping for the KPI, badge and queue', async () => {
  studentsApi.list.mockResolvedValue({ data: backendStudents([{ id: 99, studentId: 99, name: 'Pending Applicant', status: 'Active', approvalStatus: 'PendingEnrollmentApproval' }]) });
  const first = checkoutRequest('Grouped', 'same@example.com');
  createEnrollmentApprovalRequest({ student: { firstName: 'Grouped', lastName: 'kadiveti', email: 'same@example.com', phone: '9876543210' }, course: { id: 4, title: 'React' }, batch: { id: 8 }, payment: { transactionId: 'second-course' } });
  renderStudents();
  expect(await screen.findByText('Pending Applicant')).toBeInTheDocument();
  expect(screen.getAllByText('Grouped kadiveti')).toHaveLength(1);
  expect(kpi('Pending Approval')).toBe('2');
  expect(getPendingEnrollmentApprovals().some(item => item.id === first.id)).toBe(true);
});
