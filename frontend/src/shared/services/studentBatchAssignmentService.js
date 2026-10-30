import apiClient from './apiClient'
import { batchService } from './batchService'
import { courseService } from './courseService'
import { API_ENDPOINTS } from '@/api/endpoints'

const endpoints = API_ENDPOINTS.organization
const data = (response) => response?.data?.data ?? response?.data ?? response

// All endpoints derive organization scope from the authenticated organization token.
export const studentBatchAssignmentService = {
  getStudent: async (studentId) => data(await apiClient.get(endpoints.student(studentId))),
  getPaymentStatus: async (studentId) => data(await apiClient.get(endpoints.studentPaymentStatus(studentId))),
  getCourses: async () => (await courseService.getCourses({ pageNumber: 1, pageSize: 1000 })).data,
  getBatches: async (courseId) => data(await apiClient.get(endpoints.batches, { params: { courseId } })),
  approveEnrollment: async (studentId) => data(await apiClient.post(endpoints.approveStudentEnrollment(studentId))),
  assign: async (studentId, payload) => {
    const batchId = Number(payload?.batchId)
    if (!Number.isInteger(batchId) || batchId <= 0) throw new Error('A valid batch ID is required.')
    return batchService.assignStudents({ batchId, studentId })
  },
  generateCredentials: async (studentId) => data(await apiClient.post(endpoints.studentCredentials(studentId))),
  sendCredentials: async (studentId) => data(await apiClient.post(endpoints.sendStudentCredentials(studentId))),
}

export default studentBatchAssignmentService
