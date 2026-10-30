import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import InstituteAdminDashboard from '@features/organization/pages/InstituteAdminDashboard'
import { createDemoPaymentStore } from '../../server/demo-payments/demoPaymentStore'

const data = vi.hoisted(() => ({ approvals: [], dashboard: {}, students: [] }))
vi.mock('@/hooks/usePendingEnrollmentApprovals', () => ({ default: () => data.approvals }))
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { organizationId: '2', name: 'Admin' } }) }))
vi.mock('@shared/hooks/useScrollReveal', () => ({ default: () => {} }))
vi.mock('@shared/services/apiServices', () => ({
  dashboardApi: { organizationDashboard: async () => data.dashboard, organizationStats: async () => ({}) },
  employeeApi: { list: async () => [] },
  paymentApi: { paymentHistory: async () => [] },
  readStoredOrganizationId: () => '2',
  getApiErrorMessage: error => error.message,
}))
vi.mock('@/api/students', () => ({ studentsApi: { list: async () => ({ data: data.students }) } }))
vi.mock('@shared/services/mentorService', () => ({ mentorService: { getMentors: async () => [] } }))
vi.mock('@shared/services/batchService', () => ({ batchService: { getOrganizationBatches: async () => [] } }))
vi.mock('@shared/services/courseService', () => ({ courseService: { getCourses: async () => [] } }))
vi.mock('@features/live-classes/services/liveClassService', () => ({ liveClassService: { list: async () => [], today: async () => [] } }))
vi.mock('@shared/services/employeeAttendanceService', () => ({ default: { report: async () => [], list: async () => [] } }))
vi.mock('@shared/services/notificationService', () => ({ notificationService: { getOrganizationNotifications: async () => [] } }))
vi.mock('@/pages/students/StudentForm', () => ({ default: () => null }))
vi.mock('@features/organization/components/EmployeeFormModal', () => ({ default: () => null }))
vi.mock('@features/organization/components/dashboard/OrgDashboardSections', () => {
  const Empty = () => null
  return { DashboardKpis: ({ items }) => <div>{items.map(item => <p key={item.key}>{item.label}: {item.value}</p>)}</div>, ...Object.fromEntries(['BatchPerformanceCard', 'CertificatesCard', 'DashboardHero', 'LearningProgressCard', 'LiveSessionCard', 'QuickActions', 'RecentActivityCard', 'UpcomingClassesCard'].map(name => [name, Empty])) }
})

const approval = fields => ({ id: 'approval-1', organizationId: '2', name: 'Test applicant', course: 'React', ...fields })
const renderDashboard = () => render(<MemoryRouter initialEntries={['/organization/dashboard']}><Routes>
  <Route path="/organization/dashboard" element={<InstituteAdminDashboard />} />
  <Route path="/organization/students" element={<p>Student approvals destination</p>} />
</Routes></MemoryRouter>)

beforeEach(() => { localStorage.clear(); data.approvals = []; data.dashboard = {}; data.students = [] })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it.each([
  [{ time: '2 hours ago' }, 'Pending 2 hours'],
  [{}, 'Pending'],
  [{ time: null, sla: null }, 'Pending'],
  [{ time: 12, sla: 0 }, '0'],
  [{ time: {}, sla: {} }, 'Pending'],
  [{ time: [], sla: [] }, 'Pending'],
  [{ time: '2 hours ago', sla: 'Waiting 4 hours' }, 'Waiting 4 hours'],
  [{ pendingDuration: 'Waiting 5 hours' }, 'Waiting 5 hours'],
  [{ createdAt: 'invalid' }, 'Pending'],
])('renders an approval safely with timing %j', async (fields, label) => {
  const errors = vi.spyOn(console, 'error')
  data.approvals = [approval(fields)]
  renderDashboard()
  const name = await screen.findByText('Test applicant')
  expect(name.nextElementSibling.textContent).toBe(`Enrollment approval · React · ${label}`)
  expect(errors).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Approve', exact: true }))
  expect(await screen.findByText('Student approvals destination')).toBeInTheDocument()
})

it('renders the demo API response using createdAt when time and sla are absent', async () => {
  const store = createDemoPaymentStore()
  const order = store.createOrder({
    idempotencyKey: 'dashboard-test',
    student: { firstName: 'Test', lastName: 'Applicant', email: 'dashboard@example.test', phone: '9876543210' },
    items: [{ courseId: '3', courseTitle: 'React', organizationId: '2', listPrice: 1000 }],
  })
  store.completeOrder(order.orderId, { outcome: 'success', paymentMethod: 'UPI', attemptId: 'dashboard-test' })
  const [response] = store.listRequests({ status: 'PendingApproval', organizationId: '2' })
  expect(response.createdAt).toEqual(expect.any(String))
  expect(response).not.toHaveProperty('time')
  expect(response).not.toHaveProperty('sla')
  // Match the name/course transformation in usePendingEnrollmentApprovals.
  data.approvals = [{ ...response, name: 'Test applicant', course: response.course.title }]
  renderDashboard()
  const name = await screen.findByText('Test applicant')
  const date = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(response.createdAt))
  expect(name.nextElementSibling.textContent).toBe(`Enrollment approval · React · Pending ${date}`)
})

it('keeps dashboard approvals sorted, deduplicated, scoped and reviewable', async () => {
  data.dashboard = { pendingApprovals: [approval({ sla: 'Pending 8 hours', docs: [['ID', false]] })] }
  data.approvals = [null, false, [], 'invalid', approval({}), approval({ id: 'second', name: 'Second applicant', sla: 'Pending 2 hours' }), approval({ id: 'other', organizationId: '9', name: 'Other organization' })]
  renderDashboard()
  await screen.findByText('Test applicant')
  expect(screen.getAllByText('Test applicant')).toHaveLength(1)
  expect(screen.getByText('Second applicant')).toBeInTheDocument()
  expect(screen.queryByText('Other organization')).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /^(Review issues|Approve)$/ }).map(button => button.textContent)).toEqual(['Review issues', 'Approve'])
  expect(screen.getByLabelText('ID: Missing or rejected')).toBeInTheDocument()
})

it.each([[], null, {}])('renders an empty approval queue for %j', async approvals => {
  data.approvals = approvals
  renderDashboard()
  expect(await screen.findByText('No approvals waiting for review.')).toBeInTheDocument()
})

it('counts registered, active and inactive students with the same status filters as Student Management', async () => {
  data.students = ['Active', 'Inactive', 'PendingApproval', 'Rejected'].map((status, index) => ({ id: index + 1, studentId: index + 1, name: `Applicant ${index}`, status, organizationId: '2' }));
  renderDashboard();
  expect(await screen.findByText('Total Students: 4')).toBeInTheDocument();
  expect(screen.getByText('Active Students: 1')).toBeInTheDocument();
  expect(screen.getByText('Inactive Students: 1')).toBeInTheDocument();
  expect(screen.getByText('Applicant 2')).toBeInTheDocument();
});

it('groups multiple enrollment requests for one applicant into one dashboard review', async () => {
  data.approvals = [approval({ id: 'first', student: { email: 'one@example.test' } }), approval({ id: 'second', student: { email: 'one@example.test' } })];
  renderDashboard();
  await screen.findByText('Test applicant');
  expect(screen.getAllByText('Test applicant')).toHaveLength(1);
});
