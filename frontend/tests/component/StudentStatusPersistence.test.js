import { beforeEach, expect, it, vi } from 'vitest';
import { studentsApi } from '@/api/students';
import apiClient from '@shared/services/apiClient';

vi.mock('@shared/services/apiClient', () => ({ default: { patch: vi.fn(), get: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());

it.each(['Inactive', 'Active'])('saves %s using the status API and verifies the persisted organization record', async (status) => {
  apiClient.patch.mockResolvedValue({ data: { success: true } });
  apiClient.get.mockResolvedValue({ data: { studentId: 1, status } });
  const listener = vi.fn();
  window.addEventListener('kini:student-updated', listener);
  try {
    expect((await studentsApi.updateStatus(1, status)).data.status).toBe(status);
    expect(apiClient.patch).toHaveBeenCalledWith('/api/students/1/status', { status });
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organization/students/1', { skipAuthRedirect: true });
    expect(listener).toHaveBeenCalledOnce();
  } finally { window.removeEventListener('kini:student-updated', listener); }
});

it('rejects an update that the backend did not persist', async () => {
  apiClient.patch.mockResolvedValue({ data: { success: true } });
  apiClient.get.mockResolvedValue({ data: { studentId: 1, status: 'Active' } });
  await expect(studentsApi.updateStatus(1, 'Inactive')).rejects.toThrow('did not save');
});

it('rejects logical failures without reporting success', async () => {
  apiClient.patch.mockResolvedValue({ data: { success: false, message: 'Denied' } });
  await expect(studentsApi.updateStatus(1, 'Inactive')).rejects.toThrow('Denied');
  expect(apiClient.get).not.toHaveBeenCalled();
});
