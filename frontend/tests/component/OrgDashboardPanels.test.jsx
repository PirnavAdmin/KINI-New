import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  BatchPerformanceCard,
  CertificatesCard,
  DashboardHero,
  DashboardKpis,
  LearningProgressCard,
  LiveSessionCard,
  QuickActions,
  RecentActivityCard,
  UpcomingClassesCard,
} from '@features/organization/components/dashboard/OrgDashboardSections'
import {
  AtRiskCard,
  AttendanceCard,
  OperationsCard,
  RevenueCard,
  StudentProgressCard,
} from '@features/organization/components/dashboard/OrgDashboardInsights'

afterEach(cleanup)

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

it('renders the hero with the user name, date chip and working actions', () => {
  const onPrimary = vi.fn()
  const onRefresh = vi.fn()
  wrap(<DashboardHero name="Kini" onPrimary={onPrimary} today={{ date: 'Monday, 19 October 2026', greeting: 'Good morning, Kini', updated: '10:19 am', onRefresh }} />)
  expect(screen.getByText('Welcome back, Kini')).toBeInTheDocument()
  expect(screen.getByText('Monday, 19 October 2026')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Create Course/ }))
  fireEvent.click(screen.getByRole('button', { name: /Refresh dashboard/ }))
  expect(onPrimary).toHaveBeenCalledOnce()
  expect(onRefresh).toHaveBeenCalledOnce()
})

it('shows KPI values from data and a dash (never a zero) for unknown values', () => {
  wrap(<DashboardKpis onOpen={() => {}} items={[
    { key: 'students', label: 'Total Students', value: '15', note: 'Registered learners', path: '/organization/students' },
    { key: 'inactive', label: 'Inactive Students', value: null, note: 'Not currently learning', path: '/organization/students?status=inactive' },
  ]} />)
  expect(screen.getByRole('button', { name: /Total Students: 15/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Inactive Students: —/ })).toBeInTheDocument()
})

it('lists upcoming classes with batch, mentor and time', () => {
  const onJoin = vi.fn()
  wrap(<UpcomingClassesCard onJoin={onJoin} classes={[
    { id: '1', title: 'React Basics - Live Session', batch: 'React 1', mentor: 'John Mentor', dateLabel: 'Today', date: '2026-10-19', time: '10:00 AM', state: 'upcoming' },
  ]} />)
  expect(screen.getByText('React 1 • John Mentor')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'View React Basics - Live Session' }))
  expect(onJoin).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
})

it('shows learning progress counts and the current course', () => {
  wrap(<LearningProgressCard progress={{ completed: 2, inProgress: 3, notStarted: 5, overall: 34, current: { name: 'Java Full Stack', value: 40 } }} />)
  expect(screen.getByRole('img', { name: 'Overall progress 34 percent' })).toBeInTheDocument()
  expect(screen.getByText('Java Full Stack')).toBeInTheDocument()
})

it('offers to join a live session and falls back to an empty state', () => {
  const onJoin = vi.fn()
  const { rerender } = wrap(<LiveSessionCard session={{ title: 'Python Live', mentor: 'Sai', state: 'live' }} onJoin={onJoin} />)
  fireEvent.click(screen.getByRole('button', { name: /Join Live Class/ }))
  expect(onJoin).toHaveBeenCalledOnce()
  rerender(<MemoryRouter><LiveSessionCard session={null} onView={() => {}} /></MemoryRouter>)
  expect(screen.getByText('No live or upcoming session right now.')).toBeInTheDocument()
})

it('routes each quick action to its page', () => {
  const onOpen = vi.fn()
  wrap(<QuickActions onOpen={onOpen} />)
  fireEvent.click(screen.getByRole('button', { name: /Generate Certificate/ }))
  expect(onOpen).toHaveBeenCalledWith('/organization/certificates')
  expect(screen.getAllByRole('button')).toHaveLength(6)
})

it('renders batch rows, activity timestamps and certificate placeholders', () => {
  wrap(<>
    <BatchPerformanceCard rows={[{ batch: 'Cyber Security 1', students: 2, attendance: 80, progress: 45 }]} />
    <RecentActivityCard onOpen={() => {}} items={[{ type: 'student', text: 'Gandikota Lahari joined as a student', timestamp: '2026-10-19T10:14:00' }]} />
    <CertificatesCard certificates={{ count: null, recent: [] }} />
  </>)
  expect(screen.getByRole('img', { name: 'Cyber Security 1 progress 45%' })).toBeInTheDocument()
  expect(screen.getByText(/19 Oct 2026, 10:14 AM/i)).toBeInTheDocument()
  expect(screen.getByText('Certificates Issued').previousElementSibling.textContent).toBe('—')
})

it('renders approvals, revenue, attendance, progress and at-risk students from data', () => {
  const onReview = vi.fn()
  const onView = vi.fn()
  wrap(<>
    <OperationsCard onReview={onReview} approvals={[{ id: 'a1', name: 'shreiyu uuejeu', type: 'Enrollment approval', course: 'SQL', sla: 'Pending 16 Oct 2026', time: '', docs: [] }]} />
    <RevenueCard available onOpenTab={() => {}} note="Monthly collections trend" trend={[{ month: '2026-10', value: 12000 }]} finance={{ collected: 12000, pending: 3000, overdue: 0, collectionRate: 80, billed: 15000 }} />
    <AttendanceCard scope="students" onScope={() => {}} value={92} hasData series={[{ day: 'Mon', present: 10, absent: 1 }]} />
    <StudentProgressCard onSelect={() => {}} selected={{ name: 'In progress', value: 60, count: 3 }} groups={[{ name: 'In progress', value: 60, count: 3, color: '#0d9488' }]} />
    <AtRiskCard onView={onView} students={[{ id: 7, name: 'SAI SREE', course: 'python', attendance: 40, progress: 20, reason: 'Low attendance', risk: 'High Risk' }]} />
  </>)
  fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
  expect(onReview).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }), false)
  expect(screen.getByText('₹12,000')).toBeInTheDocument()
  expect(screen.getByText('80% of ₹15,000 collected')).toBeInTheDocument()
  expect(screen.getByText('92%')).toBeInTheDocument()
  const row = screen.getByText('SAI SREE').closest('tr')
  expect(within(row).getByText('High Risk')).toBeInTheDocument()
  fireEvent.click(within(row).getByRole('button', { name: 'View' }))
  expect(onView).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }))
})

it('shows empty states instead of zeros when analytics data is missing', () => {
  wrap(<>
    <RevenueCard available={false} onOpenTab={() => {}} trend={[]} finance={{ collected: null, pending: null, overdue: null }} />
    <AttendanceCard scope="employees" onScope={() => {}} hasData={false} series={[]} />
    <StudentProgressCard onSelect={() => {}} selected={{ name: 'No progress data', value: null, count: 0 }} groups={[]} />
  </>)
  expect(screen.getAllByText('—')).toHaveLength(3)
  expect(screen.getByText('Payment data is unavailable right now.')).toBeInTheDocument()
  expect(screen.getByText('No attendance data recorded yet.')).toBeInTheDocument()
  expect(screen.getByText('Workforce attendance across staff')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'View All Progress' })).toBeInTheDocument()
})
