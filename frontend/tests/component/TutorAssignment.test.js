import { beforeEach, expect, it, vi } from 'vitest';
import apiClient from '../../src/shared/services/apiClient';
import { tutorService } from '../../src/shared/services/tutorService';

vi.mock('../../src/shared/services/apiClient', () => ({ default: { post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it('never reports a rejected assignment as a successful batch assignment', async () => {
  const error = { response: { status: 404, data: { message: 'Assignment endpoint unavailable' } } };
  apiClient.post.mockRejectedValue(error);
  await expect(tutorService.assign({ tutorId: 7, batchId: 11, courseId: 2 })).rejects.toBe(error);
});

it('rejects business failures and returns only confirmed assignment data', async () => {
  apiClient.post.mockResolvedValueOnce({ data: { success: false, message: 'Mentor not found' } });
  await expect(tutorService.assign({ tutorId: 7, batchId: 11 })).rejects.toThrow('Mentor not found');
  apiClient.post.mockResolvedValueOnce({ data: { data: { assignmentId: 3 } } });
  await expect(tutorService.assign({ tutorId: 7, batchId: 11 })).resolves.toEqual({ assignmentId: 3 });
});
