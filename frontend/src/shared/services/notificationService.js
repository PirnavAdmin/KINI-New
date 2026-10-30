import apiClient from './apiClient'
import { getListPayload, getPayload } from './apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'
import { normalizeOrganizationNotification } from '../utils/organizationNotifications'
export { normalizeOrganizationNotification }

const endpoints = API_ENDPOINTS.notifications

export const notificationService = {
  getStudentNotifications: (studentId) => apiClient.get(endpoints.student(studentId)).then(getListPayload),
  getMentorNotifications: (mentorId) => apiClient.get(endpoints.mentor(mentorId)).then(getListPayload),
  getOrganizationNotifications: (organizationId) => apiClient.get(endpoints.organization(organizationId)).then(getListPayload).then(rows => rows.map(normalizeOrganizationNotification)),

  getStudentUnreadCount: (studentId) => apiClient.get(endpoints.studentUnreadCount(studentId)).then(getPayload),
  getMentorUnreadCount: (mentorId) => apiClient.get(endpoints.mentorUnreadCount(mentorId)).then(getPayload),
  getOrganizationUnreadCount: (organizationId) => apiClient.get(endpoints.organizationUnreadCount(organizationId)).then(getPayload),

  markRead: (notificationId) => apiClient.put(endpoints.markRead(notificationId)).then(getPayload),
  remove: (notificationId) => apiClient.delete(endpoints.remove(notificationId)).then(getPayload),

  markAllStudentRead: (studentId) => apiClient.put(endpoints.markAllStudentRead(studentId)).then(getPayload),
  markAllMentorRead: (mentorId) => apiClient.put(endpoints.markAllMentorRead(mentorId)).then(getPayload),
  markAllOrganizationRead: (organizationId) => apiClient.put(endpoints.markAllOrganizationRead(organizationId)).then(getPayload),

  // Back-compat aliases: individual read/delete are role-agnostic per the API contract.
  markOrganizationRead: (notificationId) => apiClient.put(endpoints.markRead(notificationId)).then(getPayload),
}

export default notificationService
