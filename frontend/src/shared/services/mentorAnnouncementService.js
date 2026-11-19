import apiClient from './apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { activeAnnouncements, loadDashboardAnnouncements, normalizeAnnouncementResponse } from '@features/hr/services/hrAnnouncementData'

const base = API_ENDPOINTS.hr.announcements
const prefix = 'hr-announcement:'
const audienceMatches = row => ['mentor', 'mentors', 'all', 'everyone', 'all staff', 'staff', 'employees'].includes(String(row.audience ?? '').trim().toLowerCase())
const stateKey = id => `kini:mentor-announcement:${id}`
function state(id) {
  try { return JSON.parse(localStorage.getItem(stateKey(id))) || {} } catch { return {} }
}

export const isMentorAnnouncement = id => typeof id === 'string' && id.startsWith(prefix)

export const mentorAnnouncementService = {
  async list(mentorId, signal) {
    const rows = await loadDashboardAnnouncements({
      list: async (params, requestSignal) => normalizeAnnouncementResponse('GET', base,
        (await apiClient.get(base, { params, signal: requestSignal })).data),
    }, signal)
    return activeAnnouncements(rows).filter(audienceMatches).map(row => {
      const id = `${prefix}${encodeURIComponent(mentorId)}:${row.announcementId}`
      const saved = state(id)
      return {
        ...row, id, notificationId: id, notificationType: 'AnnouncementPublished', category: 'Announcements',
        description: `Announcement from ${row.createdBy || 'HR'}. Open to read the full update.`,
        createdAt: row.publishDate, isRead: Boolean(saved.read), dismissed: Boolean(saved.dismissed),
      }
    }).filter(row => !row.dismissed)
  },
  async detail(id, signal) {
    const row = normalizeAnnouncementResponse('GET', `${base}/{announcementId}`,
      (await apiClient.get(`${base}/${encodeURIComponent(id)}`, { signal })).data)
    if (!audienceMatches(row) || !activeAnnouncements([row]).length) throw new Error('This announcement is no longer available.')
    return row
  },
  // The announcement API has no recipient read/delete operations. Keep these
  // preferences on this browser, scoped to the mentor, and never DELETE HR's post.
  markRead(id) { localStorage.setItem(stateKey(id), JSON.stringify({ ...state(id), read: true })) },
  dismiss(id) { localStorage.setItem(stateKey(id), JSON.stringify({ ...state(id), dismissed: true })) },
}
