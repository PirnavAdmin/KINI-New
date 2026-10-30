import { Blob as NodeBlob } from 'node:buffer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { courseMaterialService } from '../../src/shared/services/courseMaterialService';
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@shared/services/apiClient', () => ({ default: { get: mocks.get } }));
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('Blob', NodeBlob); });
afterEach(() => vi.unstubAllGlobals());

it('accepts legacy material URL strings and restores the PDF content type', async () => {
  mocks.get.mockResolvedValue({ data: new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/octet-stream' }) });
  const blob = await courseMaterialService.file('/files/course.pdf');
  expect(mocks.get).toHaveBeenCalledWith('/files/course.pdf', { responseType: 'blob' });
  expect(blob.type).toBe('application/pdf');
});

it('rejects an HTML error page instead of downloading it as a PDF', async () => {
  mocks.get.mockResolvedValue({ data: new Blob(['<!doctype html>'], { type: 'text/html' }) });
  await expect(courseMaterialService.file('/files/course.pdf')).rejects.toThrow('valid course PDF');
});

it('does not try an alternate file URL after access is denied', async () => {
  mocks.get.mockRejectedValue({ response: { status: 403 } });
  await expect(courseMaterialService.file({ courseId: 4, resourceUrl: '/files/course.pdf' })).rejects.toMatchObject({ response: { status: 403 } });
  expect(mocks.get).toHaveBeenCalledTimes(1);
});

it('opens A, B, then A using each selected URL, never a course certificate endpoint', async () => {
  mocks.get.mockImplementation(async (url) => ({ data: new Blob([`%PDF-1.4\n${url}`]) }));
  const a = { materialId: 51, courseId: 4, resourceUrl: '/files/java-notes.pdf', certificateUrl: '/files/certificate.pdf' };
  const b = { materialId: 52, courseId: 4, resourceUrl: '/files/java-exercises.pdf' };
  for (const material of [a, b, a]) {
    expect(await (await courseMaterialService.file(material)).text()).toContain(material.resourceUrl);
  }
  expect(mocks.get.mock.calls.map(([url]) => url)).toEqual([a.resourceUrl, b.resourceUrl, a.resourceUrl]);
});

it('does not mistake a material ID for a course ID or use a certificate URL', async () => {
  await expect(courseMaterialService.file({ id: 51, certificateUrl: '/certificate.pdf' })).rejects.toThrow('does not have an uploaded file');
  expect(mocks.get).not.toHaveBeenCalled();
});

it('does not replace an invalid selected document with a different course PDF', async () => {
  mocks.get.mockResolvedValue({ data: new Blob(['<html>not a PDF</html>']) });
  await expect(courseMaterialService.file({ courseId: 4, resourceUrl: '/notes.pdf' })).rejects.toThrow('valid course PDF');
  expect(mocks.get).toHaveBeenCalledTimes(1);
});
