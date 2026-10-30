import { beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { batchService } from '@shared/services/batchService'

vi.mock('@shared/services/apiClient', () => ({ default: {
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
} }))
const base = '/api/v1/organization/batches'
const batch = { batchName: 'Security', courseId: '4', mentorId: '2', batchType: 'Online', startDate: '2026-10-01', endDate: '2026-12-01', capacity: 25, status: 'Active' }
beforeEach(() => vi.resetAllMocks())

it('lists batches with search, pagination and organization scope', async () => {
  apiClient.get.mockResolvedValue({ data: { data: [{ batchId: 5 }], totalRecords: 13, pageNumber: 2, pageSize: 6 } })
  const result = await batchService.getAll({ organizationId: 9, search: 'Security', pageNumber: 2, pageSize: 6 })
  expect(apiClient.get).toHaveBeenCalledWith(base, { params: expect.objectContaining({ organizationId: 9, search: 'Security', pageNumber: 2, pageSize: 6 }) })
  expect(result.totalRecords).toBe(13)
  expect(result.data[0].batchId).toBe(5)
})

it.each([['create', 'post'], ['update', 'put']])('sends %s with numeric course/mentor IDs and ISO dates', async (method, verb) => {
  apiClient[verb].mockResolvedValue({ data: { success: true, data: { batchId: 5 } } })
  if (method === 'update') await batchService.update(5, batch)
  else await batchService.create(batch)
  expect(apiClient[verb]).toHaveBeenCalledWith(method === 'update' ? `${base}/5` : base, expect.objectContaining({ courseId: 4, mentorId: 2, startDate: '2026-10-01T00:00:00.000Z', endDate: '2026-12-01T00:00:00.000Z' }))
})

it('reads the selected batch by ID and deletes that ID', async () => {
  apiClient.get.mockResolvedValue({ data: { batchId: 5, courseId: 4 } })
  expect((await batchService.getById(5)).courseId).toBe(4)
  expect(apiClient.get).toHaveBeenCalledWith(`${base}/5`, undefined)
  apiClient.delete.mockResolvedValue({ data: { success: true } })
  await batchService.remove(5)
  expect(apiClient.delete).toHaveBeenCalledWith(`${base}/5`)
})

it('unwraps detail envelopes without losing course and mentor IDs', async () => {
  apiClient.get.mockResolvedValue({ data: { success: true, data: { batchId: 5, courseId: 4, mentorId: 2 } } })
  expect(await batchService.getById(5)).toEqual(expect.objectContaining({ batchId: 5, courseId: 4, mentorId: 2 }))
})

it('reads summary data and downloads export as a blob', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { success: true, data: { totalBatches: 13 } } })
  expect(await batchService.getSummary()).toEqual({ totalBatches: 13 })
  expect(apiClient.get).toHaveBeenLastCalledWith(`${base}/summary`, { params: {} })
  const blob = new Blob(['batchId,batchName\n5,Security'])
  apiClient.get.mockResolvedValueOnce({ data: blob })
  expect(await batchService.export({ search: 'Security' })).toBe(blob)
  expect(apiClient.get).toHaveBeenLastCalledWith(`${base}/export`, { params: { search: 'Security' }, responseType: 'blob' })
})

it('loads employee-assigned batches from the employee route', async () => {
  apiClient.get.mockResolvedValueOnce({ data: { batches: [{ batchId: 5 }] } })
  apiClient.get.mockResolvedValueOnce({ data: { batchId: 5, students: [] } })
  expect((await batchService.getMentorBatches(2)).batches[0].batchId).toBe(5)
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organization/employees/2/batches')
})

it('preserves ownership errors and rejects a failure envelope even with HTTP 200', async () => {
  const message = 'Selected course does not belong to your organization.'
  apiClient.put.mockResolvedValueOnce({ status: 200, data: { success: false, message } })
  await expect(batchService.update(5, batch)).rejects.toThrow(message)
  const failure = { response: { status: 400, data: { success: false, message } } }
  apiClient.put.mockRejectedValueOnce(failure)
  await expect(batchService.update(5, batch)).rejects.toBe(failure)
})
