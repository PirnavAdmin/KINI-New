import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { listEmployeeResources, loadResourceFile } from '@features/employee/services/employeeResourceService'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('Blob', NodeBlob) })
afterEach(() => vi.unstubAllGlobals())

it('loads actual resources with server search and pagination', async () => {
  apiClient.request.mockResolvedValue({ data: { items: [{ resourceId: 7, name: 'Guide', fileType: 'application/pdf', sizeKb: 25 }], totalCount: 14 }, config: {}, status: 200 })
  const result = await listEmployeeResources({ Search: 'Guide', Page: 2, Limit: 6 })
  expect(result).toMatchObject({ rows: [{ id: 7, title: 'Guide', type: 'pdf', size: '25 KB' }], hasNext: true })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hr/resources', params: { Search: 'Guide', Page: 2, Limit: 6 } }))
})

it.each(['preview', 'download'])('loads %s through the authenticated binary endpoint', async action => {
  apiClient.request.mockResolvedValue({ data: new Blob(['%PDF-1.7\n%%EOF'], { type: 'application/octet-stream' }), headers: {} })
  const result = await loadResourceFile({ id: 7, title: 'Guide', type: 'pdf' }, action)
  expect(result.blob.type).toBe('application/pdf')
  expect(result.filename).toBe('Guide.pdf')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: `/api/hr/resources/7/${action}`, responseType: 'blob' }))
})

it.each([
  ['', 'application/pdf'],
  ['<!doctype html><html>Sign in</html>', 'text/html'],
  ['{"success":false}', 'application/json'],
  ['not a PDF', 'application/pdf'],
])('rejects empty or invalid files instead of saving fake PDFs', async (content, type) => {
  apiClient.request.mockResolvedValue({ data: new Blob([content], { type }) })
  await expect(loadResourceFile({ id: 7, title: 'Guide', type: 'pdf' }, 'download')).rejects.toThrow()
})

it('preserves access errors without falling back to unprotected URLs', async () => {
  apiClient.request.mockRejectedValue({ response: { status: 403 } })
  await expect(loadResourceFile({ id: 7 }, 'download')).rejects.toMatchObject({ response: { status: 403 } })
  expect(apiClient.request).toHaveBeenCalledTimes(1)
})
