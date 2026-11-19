import apiClient from './apiClient'
import { getListPayload, getPayload } from './apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'
import { normalizeOrganizationNotification } from '../utils/organizationNotifications'
import { isMentorAnnouncement, mentorAnnouncementService } from './mentorAnnouncementService'
import { notificationLoadError } from '../utils/notificationLoadError'
export { normalizeOrganizationNotification }

const endpoints = API_ENDPOINTS.notifications

export const notificationService = {
  getStudentNotifications: (studentId) => apiClient.get(endpoints.student(studentId)).then(getListPayload),
  getMentorNotifications: async (mentorId, { onError } = {}) => {
    const results = await Promise.allSettled([
      apiClient.get(endpoints.mentor(mentorId)).then(getListPayload),
      mentorAnnouncementService.list(mentorId),
    ])
    const errors = results.flatMap((result, index) => result.status === 'rejected'
      ? [notificationLoadError(result.reason, index === 0 ? 'Notifications' : 'HR announcements')] : [])
    if (errors.length === 2) throw Object.assign(new Error(errors.join(' ')), { feedErrors: errors })
    onError?.(errors.join(' '))
    const [notifications, announcements] = results.map(result => result.status === 'fulfilled' ? result.value : [])
    const linked = new Set(notifications.map(row => row.announcementId ?? row.relatedAnnouncementId).filter(value => value != null).map(String))
    return [...notifications, ...announcements.filter(row => !linked.has(String(row.announcementId)))]
      .sort((a, b) => Date.parse(b.createdAt ?? b.timestamp) - Date.parse(a.createdAt ?? a.timestamp))
  },
  getOrganizationNotifications: (organizationId) => apiClient.get(endpoints.organization(organizationId)).then(getListPayload).then(rows => rows.map(normalizeOrganizationNotification)),

  getStudentUnreadCount: (studentId) => apiClient.get(endpoints.studentUnreadCount(studentId)).then(getPayload),
  getMentorUnreadCount: async (mentorId) => ({ unreadCount: (await notificationService.getMentorNotifications(mentorId)).filter(row => !(row.isRead ?? row.read ?? false)).length }),
  getOrganizationUnreadCount: (organizationId) => apiClient.get(endpoints.organizationUnreadCount(organizationId)).then(getPayload),

  markRead: async (notificationId) => isMentorAnnouncement(notificationId)
    ? mentorAnnouncementService.markRead(notificationId)
    : apiClient.put(endpoints.markRead(notificationId)).then(getPayload),
  remove: async (notificationId) => isMentorAnnouncement(notificationId)
    ? mentorAnnouncementService.dismiss(notificationId)
    : apiClient.delete(endpoints.remove(notificationId)).then(getPayload),

  markAllStudentRead: (studentId) => apiClient.put(endpoints.markAllStudentRead(studentId)).then(getPayload),
  markAllMentorRead: async (mentorId) => {
    const announcements = await mentorAnnouncementService.list(mentorId)
    const result = await apiClient.put(endpoints.markAllMentorRead(mentorId)).then(getPayload)
    announcements.forEach(row => mentorAnnouncementService.markRead(row.id))
    return result
  },
  markAllOrganizationRead: (organizationId) => apiClient.put(endpoints.markAllOrganizationRead(organizationId)).then(getPayload),

  // Back-compat aliases: individual read/delete are role-agnostic per the API contract.
  markOrganizationRead: (notificationId) => apiClient.put(endpoints.markRead(notificationId)).then(getPayload),
}

export default notificationService
