import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { notificationService } from '@shared/services/notificationService'
import { mentorAnnouncementService } from '@shared/services/mentorAnnouncementService'
import MentorAnnouncements from '@features/mentor/components/MentorAnnouncements'

vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { mentorId: 7 } }) }))
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }))
const base = '/api/hr/announcements'
const row = { announcementId: 3, title: 'today holiday', audience: 'Mentor', status: 'PUBLISHED', publishDate: '2020-11-13T05:06:00', expiryDate: null, createdBy: 'poorna Bhai' }
const page = (items, number = 1, total = items.length, pages = 1) => ({ data: { items, page: number, limit: 100, totalCount: total, totalPages: pages } })
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  apiClient.get.mockImplementation(async url => url === base ? page([row]) : url === `${base}/3`
    ? { data: { ...row, content: 'hii — full holiday announcement' } }
    : { data: [{ notificationId: 15, title: 'New Chat Message', createdAt: '2019-01-01', isRead: true }] })
  apiClient.put.mockResolvedValue({ data: {} })
})
afterEach(cleanup)

it('merges an HR API announcement into the mentor bell feed even without a backend notification', async () => {
  const rows = await notificationService.getMentorNotifications(7)
  expect(rows.map(item => item.title)).toEqual(['today holiday', 'New Chat Message'])
  expect(apiClient.get).toHaveBeenCalledWith(base, expect.objectContaining({ params: { Status: 'Published', Page: 1, Limit: 100 } }))
  expect(rows[0]).toMatchObject({ announcementId: 3, isRead: false, category: 'Announcements' })
  expect(await notificationService.getMentorUnreadCount(7)).toEqual({ unreadCount: 1 })
})

it('filters other audiences, draft, expired and future announcements across all pages', async () => {
  apiClient.get.mockResolvedValueOnce(page([row, { ...row, announcementId: 4, audience: 'Students' }], 1, 6, 2))
    .mockResolvedValueOnce(page([{ ...row, announcementId: 5, status: 'Draft' }, { ...row, announcementId: 6, expiryDate: '2021-01-01' }, { ...row, announcementId: 7, publishDate: '2099-01-01' }, { ...row, announcementId: 8, audience: 'All' }], 2, 6, 2))
  expect((await mentorAnnouncementService.list(7)).map(item => item.announcementId)).toEqual([3, 8])
})

it('reads and dismisses locally per mentor without modifying HR posts or using synthetic notification URLs', async () => {
  const [notice] = await mentorAnnouncementService.list(7)
  await notificationService.markRead(notice.id)
  expect((await mentorAnnouncementService.list(7))[0].isRead).toBe(true)
  expect((await mentorAnnouncementService.list(8))[0].isRead).toBe(false)
  await notificationService.remove(notice.id)
  expect(await mentorAnnouncementService.list(7)).toEqual([])
  expect(apiClient.put).not.toHaveBeenCalled()
  expect(apiClient.delete).not.toHaveBeenCalled()
})

it('shows the real announcement on the dashboard and fetches full content on click', async () => {
  render(<MentorAnnouncements />)
  fireEvent.click(await screen.findByRole('button', { name: /today holiday/ }))
  expect(await screen.findByText('hii — full holiday announcement')).toBeInTheDocument()
  expect(apiClient.get).toHaveBeenCalledWith(`${base}/3`, expect.any(Object))
})

it('refreshes dashboard announcements after HR edits or deletes a post', async () => {
  render(<MentorAnnouncements />)
  await screen.findByText('today holiday')
  apiClient.get.mockResolvedValue(page([]))
  await act(async () => window.dispatchEvent(new Event('hr:announcements-changed')))
  expect(screen.queryByText('today holiday')).not.toBeInTheDocument()
  expect(screen.getByText('No active HR announcements.')).toBeInTheDocument()
})

it('preserves chat notifications and reports announcement access errors', async () => {
  apiClient.get.mockImplementation(async url => {
    if (url === base) throw { response: { status: 403, data: { message: 'Announcement access denied' } } }
    return { data: [{ notificationId: 15, title: 'New Chat Message' }] }
  })
  const onError = vi.fn()
  expect(await notificationService.getMentorNotifications(7, { onError })).toHaveLength(1)
  expect(onError).toHaveBeenCalledWith(expect.stringContaining('does not have permission'))
  render(<MentorAnnouncements />)
  expect(await screen.findByRole('alert')).toHaveTextContent('does not have permission')
})

it('keeps HR announcements when the normal mentor notification endpoint fails', async () => {
  apiClient.get.mockImplementation(async url => {
    if (url === base) return page([row])
    throw { response: { status: 500 } }
  })
  const onError = vi.fn()
  const rows = await notificationService.getMentorNotifications(7, { onError })
  expect(rows.map(item => item.title)).toEqual(['today holiday'])
  expect(onError).toHaveBeenCalledWith(expect.stringContaining('Notifications (500)'))
})

it('rejects total feed failure instead of returning an empty list and reports both causes', async () => {
  apiClient.get.mockRejectedValue({ response: { status: 403 } })
  await expect(notificationService.getMentorNotifications(7)).rejects.toThrow(/Notifications:.*permission.*HR announcements:.*permission/)
})
