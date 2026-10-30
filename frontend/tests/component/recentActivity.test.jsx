import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { latestActivity } from '@features/organization/utils/recentActivity'
import { RecentActivityCard } from '@features/organization/components/dashboard/OrgDashboardSections'

afterEach(cleanup)

// Test-only records: one per minute from 10:00, in shuffled order.
const at = (minute) => `2026-10-21T10:${String(minute).padStart(2, '0')}:00`
const entry = (n, extra = {}) => ({ key: `student:${n}`, type: 'student', text: `Student ${n} joined as a student`, timestamp: at(n), path: `/organization/students/${n}`, ...extra })
const texts = (items) => items.map((item) => item.text)

it('keeps the five newest of more than five, newest first', () => {
  const items = [3, 7, 1, 6, 2, 5, 4].map((n) => entry(n))
  expect(texts(latestActivity(items))).toEqual([7, 6, 5, 4, 3].map((n) => `Student ${n} joined as a student`))
})

it('shows exactly five, fewer than five, or none as available', () => {
  expect(latestActivity([1, 2, 3, 4, 5].map((n) => entry(n)))).toHaveLength(5)
  expect(texts(latestActivity([entry(2), entry(9)]))).toEqual(['Student 9 joined as a student', 'Student 2 joined as a student'])
  expect(latestActivity([])).toEqual([])
  expect(latestActivity(undefined)).toEqual([])
})

it('puts a newly created activity at the top after a refresh', () => {
  const before = latestActivity([1, 2, 3, 4, 5, 6].map((n) => entry(n)))
  const after = latestActivity([entry(30, { key: 'notification:99', text: 'New batch created' }), ...before])
  expect(after[0].text).toBe('New batch created')
  expect(after).toHaveLength(5)
})

it('drops duplicates from repeated polls and from two sources for one event', () => {
  const polled = [entry(4), entry(4), entry(3)]
  expect(latestActivity(polled)).toHaveLength(2)
  // The notification and the student record announce the same join.
  const crossSource = [
    { key: 'notification:12', type: 'student', text: 'Student 8 joined as a student', timestamp: '2026-10-21T10:08:20' },
    entry(8),
  ]
  expect(latestActivity(crossSource)).toHaveLength(1)
  // The same message at different times is two real events.
  expect(latestActivity([entry(1, { key: 'a' }), entry(2, { key: 'b', text: 'Student 1 joined as a student' })])).toHaveLength(2)
})

it('orders undated entries after dated ones without crashing', () => {
  const items = [entry(1, { timestamp: null }), entry(2, { timestamp: 'not a date' }), entry(3)]
  expect(texts(latestActivity(items))).toEqual(['Student 3 joined as a student', 'Student 1 joined as a student', 'Student 2 joined as a student'])
})

const renderCard = (props) => render(<MemoryRouter><RecentActivityCard onOpen={() => {}} {...props} /></MemoryRouter>)

it('renders the latest five newest first with their times', () => {
  renderCard({ items: latestActivity([1, 2, 3, 4, 5, 6, 7].map((n) => entry(n))) })
  const rows = within(screen.getByRole('list')).getAllByRole('listitem')
  expect(rows).toHaveLength(5)
  expect(rows[0]).toHaveTextContent('Student 7 joined as a student')
  expect(rows[0]).toHaveTextContent(/21 Oct 2026, 10:07 AM/i)
  expect(rows[4]).toHaveTextContent('Student 3 joined as a student')
})

it('omits the time when the API gave none, and shows empty and error states', () => {
  renderCard({ items: [entry(1, { timestamp: null })] })
  expect(screen.getByText('Student 1 joined as a student').closest('li').querySelector('time')).toBeNull()
  cleanup()
  renderCard({ items: [], unavailable: true })
  expect(screen.getByText(/No recent activity/)).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Notifications couldn’t be loaded')
})
