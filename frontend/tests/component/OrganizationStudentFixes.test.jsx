import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import apiClient from '@shared/services/apiClient'
import { batchService } from '@shared/services/batchService'
import { studentBatchAssignmentService } from '@shared/services/studentBatchAssignmentService'
import { studentsApi } from '@/api/students'
import { buildEnrollmentRows } from '@features/organization/utils/studentEnrollments'
import ApprovalQueue from '@/pages/students/ApprovalQueue'
vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('single and bulk assignment use the enrollment API instead of editing the batch', async () => {
  apiClient.post.mockResolvedValue({ data: { success: true } })
  await studentBatchAssignmentService.assign(17, { courseId: 4, batchId: 5 })
  await batchService.assignStudents({ studentId: 18, batchId: 5 })
  expect(apiClient.post).toHaveBeenNthCalledWith(1, '/api/StudentBatch', { batchId: 5, studentIds: [17] })
  expect(apiClient.post).toHaveBeenNthCalledWith(2, '/api/StudentBatch', { batchId: 5, studentIds: [18] })
  expect(apiClient.put).not.toHaveBeenCalled()
})
it('rejects missing identifiers before assignment', async () => {
  await expect(batchService.assignStudents({ studentId: '', batchId: 5 })).rejects.toThrow('valid batch ID and student ID')
  expect(apiClient.post).not.toHaveBeenCalled()
})
it('maps country, phone and enrollment date returned by the API', async () => {
  apiClient.get.mockResolvedValue({ data: { studentId: 17, countryName: 'India', phoneNumber: '9876543210', enrollmentDate: '2026-10-16' } })
  const { data } = await studentsApi.getById(17)
  expect(data).toMatchObject({ country: 'India', mobile: '9876543210', registrationDate: '2026-10-16' })
})
it('keeps each enrolled course duration with its own course', () => {
  const rows = buildEnrollmentRows({ enrollments: [{ courseId: 4, courseDuration: '3 months' }, { courseId: 5, course: { duration: '6 months' } }] })
  expect(rows.map(row => row.duration)).toEqual(['3 months', '6 months'])
})
it('shows one approval card for the same student and preserves each course review', () => {
  const requests = [1, 2].map(id => ({ id, name: 'Same Student', course: `Course ${id}`, student: { email: 'same@example.com' }, docs: [], createdAt: '2026-10-16' }))
  render(<ApprovalQueue enrollmentApprovals={requests} onReviewEnrollment={vi.fn()} />)
  expect(screen.getAllByRole('heading', { name: 'Same Student' })).toHaveLength(1)
  expect(screen.getByText('Course 1, Course 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Review Course 2' })).toBeInTheDocument()
})
