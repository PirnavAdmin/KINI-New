import { Blob as NativeBlob } from 'node:buffer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import apiClient from '@shared/services/apiClient';
import { courseMaterialService } from '@shared/services/courseMaterialService';
vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn(), defaults: { baseURL: 'https://api.example.test/api' } } }));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('Blob', NativeBlob); });
afterEach(() => vi.unstubAllGlobals());
const pdf = () => ({ data: new Blob(['%PDF-1.7\nTest course file'], { type: 'application/pdf' }) });

it('downloads a course PDF through its authenticated PDF endpoint', async () => {
  apiClient.get.mockResolvedValueOnce({ data: [{ courseId: 7, courseName: 'Java', pdfUrl: '/uploads/java.pdf' }] });
  const [material] = await courseMaterialService.list();
  apiClient.get.mockResolvedValueOnce(pdf());
  const blob = await courseMaterialService.file(material);
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/courses/7/pdf', expect.objectContaining({ responseType: 'blob' }));
  expect(await blob.text()).toContain('%PDF-');
});
it('resolves an uploaded file against the API origin rather than appending it to the API path', async () => {
  apiClient.get.mockResolvedValue(pdf());
  await courseMaterialService.file({ resourceUrl: '/uploads/java.pdf' });
  expect(apiClient.get).toHaveBeenCalledWith('https://api.example.test/uploads/java.pdf', { responseType: 'blob' });
});
it('uses the same uploaded PDF if this backend has no course PDF endpoint', async () => {
  apiClient.get.mockRejectedValueOnce({ response: { status: 404 } }).mockResolvedValueOnce(pdf());
  await courseMaterialService.file({ coursePdf: true, courseId: 7, resourceUrl: '/uploads/java.pdf' });
  expect(apiClient.get).toHaveBeenLastCalledWith('https://api.example.test/uploads/java.pdf', { responseType: 'blob' });
});
it('rejects an HTML response instead of downloading a broken PDF', async () => {
  apiClient.get.mockResolvedValue({ data: new Blob(['<html>Not found</html>']) });
  await expect(courseMaterialService.file({ resourceUrl: '/uploads/java.pdf' })).rejects.toThrow('valid course PDF');
});

it('retrieves the same uploaded PDF when the course endpoint returns metadata rather than bytes', async () => {
  apiClient.get.mockResolvedValueOnce({ data: new Blob([JSON.stringify({ pdfUrl: '/uploads/java.pdf' })], { type: 'application/json' }) }).mockResolvedValueOnce(pdf());
  const blob = await courseMaterialService.file({ coursePdf: true, courseId: 7, resourceUrl: '/uploads/java.pdf' });
  expect(apiClient.get).toHaveBeenLastCalledWith('https://api.example.test/uploads/java.pdf', { responseType: 'blob' });
  expect(await blob.text()).toContain('%PDF-');
});

it('does not retry uploaded URLs after a permission failure', async () => {
  apiClient.get.mockRejectedValueOnce({ response: { status: 403 } });
  await expect(courseMaterialService.file({ coursePdf: true, courseId: 7, resourceUrl: '/uploads/java.pdf' })).rejects.toMatchObject({ response: { status: 403 } });
  expect(apiClient.get).toHaveBeenCalledTimes(1);
});
