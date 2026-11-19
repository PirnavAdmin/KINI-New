import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NotificationCenter } from '@/features/mentor/pages/MentorNotifications'
import { notificationService } from '@shared/services/notificationService'
import { mentorNotificationRecipient, subscribeNotificationRefresh } from '@shared/utils/notificationRefresh'

vi.mock('@shared/services/notificationService', () => ({ notificationService: {
  getMentorNotifications: vi.fn(),
} }))
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); localStorage.clear() })

it('shows an HR announcement arriving after the mentor notification page is open', async () => {
  notificationService.getMentorNotifications.mockResolvedValue([])
  render(<NotificationCenter recipientType="mentor" recipientId={7} notificationCategories={['All', 'Unread']} hideAnalytics hideSecondaryPanels hideSettings />)
  await act(async () => {})
  notificationService.getMentorNotifications.mockResolvedValue([{
    notificationId: 42, title: 'HR holiday announcement', message: 'Office closed tomorrow',
    notificationType: 'AnnouncementPublished', isRead: false,
  }])
  await act(async () => window.dispatchEvent(new Event('hr:announcements-changed')))
  expect(await screen.findByText('HR holiday announcement')).toBeInTheDocument()
  expect(screen.getByText('Office closed tomorrow')).toBeInTheDocument()
  expect(notificationService.getMentorNotifications).toHaveBeenLastCalledWith(7, expect.objectContaining({ onError: expect.any(Function) }))
})

it('polls for announcements from other sessions, refreshes on focus and cleans up', () => {
  vi.useFakeTimers()
  const refresh = vi.fn()
  const unsubscribe = subscribeNotificationRefresh(refresh)
  vi.advanceTimersByTime(15000)
  expect(refresh).toHaveBeenCalledTimes(1)
  window.dispatchEvent(new Event('focus'))
  expect(refresh).toHaveBeenCalledTimes(2)
  unsubscribe()
  vi.advanceTimersByTime(15000)
  window.dispatchEvent(new Event('hr:announcements-changed'))
  expect(refresh).toHaveBeenCalledTimes(2)
})

it('resolves mentor identity consistently without substituting the employee ID', () => {
  expect(mentorNotificationRecipient({ MentorId: 7, employeeId: 99 })).toBe(7)
  expect(mentorNotificationRecipient({ mentor: { mentorId: 8 } })).toBe(8)
  expect(mentorNotificationRecipient({ employeeId: 99 })).toBeNull()
})

it('shows a retryable error instead of an empty state and clears it after recovery', async () => {
  notificationService.getMentorNotifications.mockRejectedValue(new Error('Network Error'))
  render(<NotificationCenter recipientType="mentor" recipientId={7} notificationCategories={['All', 'Unread']} hideAnalytics hideSecondaryPanels hideSettings />)
  expect(await screen.findByRole('alert')).toHaveTextContent('server is unavailable')
  expect(screen.queryByText('No notifications match your filters.')).not.toBeInTheDocument()
  notificationService.getMentorNotifications.mockImplementation(async (id, { onError }) => {
    onError('')
    return [{ notificationId: 42, title: 'Recovered announcement', isRead: false }]
  })
  await act(async () => window.dispatchEvent(new Event('focus')))
  expect(await screen.findByText('Recovered announcement')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('continues displaying the last successful data if a refresh fails', async () => {
  notificationService.getMentorNotifications.mockResolvedValue([{ notificationId: 42, title: 'Existing announcement', isRead: false }])
  render(<NotificationCenter recipientType="mentor" recipientId={7} notificationCategories={['All', 'Unread']} hideAnalytics hideSecondaryPanels hideSettings />)
  await screen.findByText('Existing announcement')
  notificationService.getMentorNotifications.mockRejectedValue({ response: { status: 503 } })
  await act(async () => window.dispatchEvent(new Event('focus')))
  expect(await screen.findByRole('alert')).toHaveTextContent('503')
  expect(screen.getByText('Existing announcement')).toBeInTheDocument()
})
