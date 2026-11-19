import { beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { loadPerformanceHistory } from '@features/hr/services/hrPerformanceHistory'
import { resourcePreviewBlob } from '@features/hr/services/hrResourcePreview'
import { optionsFor } from '@features/hr/services/hrFormOptions'
vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const reply = data => ({ data: { data }, status: 200, config: {} })
beforeEach(() => vi.clearAllMocks())
it('falls back to all performance pages on a missing history route and keeps only the selected employee', async () => {
  apiClient.request.mockImplementation(async request => {
    if (request.url.includes('/employee/')) throw { response: { status: 404 } }
    return reply({ items: request.params.Page === 1 ? [{ performanceId: 1, employeeId: 42 }] : [{ performanceId: 2, employeeId: 99 }, { performanceId: 3, employeeId: 42 }], totalPages: 2 })
  })
  expect(await loadPerformanceHistory(42)).toEqual([{ performanceId: 1, employeeId: 42 }, { performanceId: 3, employeeId: 42 }])
})
it('preserves permission errors instead of falling back', async () => {
  apiClient.request.mockRejectedValue({ response: { status: 403 } })
  await expect(loadPerformanceHistory(42)).rejects.toMatchObject({ response: { status: 403 } })
  expect(apiClient.request).toHaveBeenCalledTimes(1)
})
it('reads singular performance filter payloads without losing option values', () => {
  expect(optionsFor('performanceFilters', { PerformanceFilter: [{ FilterValue: 'Top', FilterName: 'Top performers' }] })).toEqual([{ value: 'Top', label: 'Top performers' }])
})
it('recognizes PDFs returned with a generic MIME type', async () => {
  const blob = await resourcePreviewBlob({ data: new Blob(['%PDF-1.7 test'], { type: 'application/octet-stream' }) })
  expect(blob.type).toBe('application/pdf')
})
it('reports API errors rather than embedding an error response as a document', async () => {
  await expect(resourcePreviewBlob({ data: new Blob([JSON.stringify({ message: 'Access denied' })], { type: 'application/json' }) })).rejects.toThrow('Access denied')
  await expect(resourcePreviewBlob({ data: new Blob(['Not a PDF'], { type: 'application/pdf' }) })).rejects.toThrow('invalid PDF')
})
