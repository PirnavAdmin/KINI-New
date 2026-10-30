import apiClient from '@shared/services/apiClient'
import { extractApiData, logApiError, logApiRequest, logApiSuccess, withPagedResponse } from '@shared/services/apiModuleHelpers'
import { employeeProfileService } from '@shared/services/employeeProfileService'

const EMPLOYEE_ENDPOINT = '/api/employee'

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload)
  try {
    const response = await executor()
    logApiSuccess(response)
    return extractApiData(response)
  } catch (error) {
    logApiError(error)
    throw error
  }
}

export const getDashboard = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/dashboard`)
    return extractApiData(response)
  } catch { return {} }
}

export const getMyLearning = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/learning`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getLiveClasses = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/live-classes`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getRecordedSessions = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/recorded-sessions`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getAssignments = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/assignments`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getAssessments = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/assessments`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getAttendance = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/attendance`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getPerformance = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/performance`)
    return extractApiData(response)
  } catch { return {} }
}

export const getSkills = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/skills`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getGoals = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/goals`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getCareer = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/career`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getCareerCoach = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/career-coach`)
    return extractApiData(response)
  } catch { return {} }
}

export const getCertificates = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/certificates`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getReports = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/reports`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getResources = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/resources`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getTodaySchedule = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/today-schedule`)
    return extractApiData(response)
  } catch { return { data: [] } }
}

export const getCalendar = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/calendar`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getMessages = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/messages`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getNotifications = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/notifications`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getAnnouncements = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/announcements`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getReviews = async () => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_ENDPOINT}/reviews`)
    return withPagedResponse(extractApiData(response))
  } catch { return { data: [] } }
}

export const getProfile = async () => {
  try {
    return await employeeProfileService.getProfile()
  } catch { return {} }
}

export const updateProfile = async (payload) => {
  return employeeProfileService.updatePersonal(payload)
}

export const updateSettings = async (payload) => {
  return sendRequest('PUT', `${EMPLOYEE_ENDPOINT}/settings`, () => apiClient.put(`${EMPLOYEE_ENDPOINT}/settings`, payload), payload)
}

const employeeService = {
  getDashboard,
  getMyLearning,
  getLiveClasses,
  getRecordedSessions,
  getAssignments,
  getAssessments,
  getAttendance,
  getPerformance,
  getSkills,
  getGoals,
  getCareer,
  getCareerCoach,
  getCertificates,
  getReports,
  getResources,
  getTodaySchedule,
  getCalendar,
  getMessages,
  getNotifications,
  getAnnouncements,
  getReviews,
  getProfile,
  updateProfile,
  updateSettings,
}

export default employeeService
