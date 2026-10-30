import { useCallback, useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import useDashboardFormReturn from '@shared/hooks/useDashboardFormReturn'
import { normalizeOrganizationNotification } from '@shared/services/notificationService'
import { getTimeAgo, formatTimestamp } from '@features/organization/data/notificationMockData'
import { isPendingApprovalStudent } from '@shared/utils/studentApprovalStatus'
import { NotificationDetailModal } from '@features/organization/pages/Notifications'

afterEach(() => { cleanup(); vi.useRealTimers() })
function Form({ trigger = 'create' }) {
  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  useDashboardFormReturn(open, show, trigger)
  return <><button onClick={show}>Open form</button>{open && <div role="dialog"><button onClick={() => setOpen(false)}>Cancel</button><button onClick={() => setOpen(false)}>Close</button></div>}</>
}
it.each(['Cancel', 'Close'])('returns dashboard quick actions to the dashboard using %s', async name => {
  render(<MemoryRouter initialEntries={['/form?create=true&returnTo=%2Forganization%2Fdashboard']}><Routes><Route path="/form" element={<Form />} /><Route path="/organization/dashboard" element={<p>Dashboard restored</p>} /></Routes></MemoryRouter>)
  await screen.findByRole('dialog')
  fireEvent.click(screen.getByRole('button', { name, exact: true }))
  expect(await screen.findByText('Dashboard restored')).toBeInTheDocument()
})
it('opens upload quick actions and keeps normal list forms on their list', async () => {
  const first = render(<MemoryRouter initialEntries={['/form?upload=true&returnTo=%2Forganization%2Fdashboard']}><Routes><Route path="/form" element={<Form trigger="upload" />} /><Route path="/organization/dashboard" element={<p>Dashboard restored</p>} /></Routes></MemoryRouter>)
  await screen.findByRole('dialog')
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  await screen.findByText('Dashboard restored')
  first.unmount()
  render(<MemoryRouter initialEntries={['/form']}><Form /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Open form' }))
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open form' })).toBeInTheDocument()
})
it('uses UTC notification timestamps consistently without inventing a creation date', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-16T09:00:00Z'))
  const notice = normalizeOrganizationNotification({ createdDate: '2026-10-16T08:58:00', title: 'HR created' })
  expect(notice.createdAt).toBe('2026-10-16T08:58:00Z')
  expect(getTimeAgo(notice.createdAt)).toBe('2 mins ago')
  expect(normalizeOrganizationNotification({ timestamp: '2026-10-16T14:28:00+05:30' }).createdAt).toBe('2026-10-16T14:28:00+05:30')
  expect(getTimeAgo(null)).toBe('Date unavailable')
  expect(formatTimestamp(null)).toBe('Date unavailable')
  expect(normalizeOrganizationNotification({ createdAt: 'invalid' }).createdAt).toBeNull()
})
it.each(['Pending', 'PendingApproval', 'Pending Approval', 'Pending_Enrollment_Approval', 'Awaiting Approval'])('recognizes pending enrollment status %s', status => {
  expect(isPendingApprovalStudent({ status })).toBe(true)
  expect(isPendingApprovalStudent({ status: 'Active', enrollmentStatus: status })).toBe(true)
  expect(isPendingApprovalStudent({ status, approvalStatus: 'Rejected' })).toBe(false)
})
it('portals notification details outside a clipped page container', async () => {
  const close = vi.fn()
  const { container } = render(<div style={{ transform: 'translateX(0)', overflow: 'hidden' }}><NotificationDetailModal notification={{ id: 1, title: 'New HR user', description: 'Employee created', priority: 'Medium', category: 'HR', timestamp: null, unread: true }} onClose={close} onMarkRead={vi.fn()} onDelete={vi.fn()} /></div>)
  const dialog = screen.getByRole('dialog')
  expect(container.contains(dialog)).toBe(false)
  expect(dialog.parentElement).toBe(document.body)
  expect(dialog).toHaveClass('z-[10000]')
  fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
  await waitFor(() => expect(close).toHaveBeenCalledOnce())
})
