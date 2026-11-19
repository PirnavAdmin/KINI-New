import { beforeEach, expect, it, vi } from 'vitest';
import apiClient from '../../src/shared/services/apiClient';
import { tutorService } from '../../src/shared/services/tutorService';
import { batchService } from '../../src/shared/services/batchService';
vi.mock('../../src/shared/services/batchService', () => ({ batchService: { getById: vi.fn(), update: vi.fn() } }));

vi.mock('../../src/shared/services/apiClient', () => ({ default: { post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it('uses the supported batch update when the legacy assignment route is absent, preserving batch settings', async () => {
  apiClient.post.mockRejectedValue({ response: { status: 404 } });
  const batch = { batchId: 11, courseId: 2, batchName: 'Java Full Stack', mentorId: 1, capacity: 25, status: 'Active' };
  batchService.getById.mockResolvedValueOnce(batch).mockResolvedValueOnce({ ...batch, mentorId: 99 });
  batchService.update.mockResolvedValue({});
  await tutorService.assign({ tutorId: 7, mentorId: 99, batchId: 11, courseId: 2 });
  expect(batchService.update).toHaveBeenCalledWith(11, { ...batch, mentorId: 99 });
});

it('does not assign a batch from a different course', async () => {
  apiClient.post.mockRejectedValue({ response: { status: 404 } });
  batchService.getById.mockResolvedValue({ batchId: 11, courseId: 5 });
  await expect(tutorService.assign({ tutorId: 7, mentorId: 99, batchId: 11, courseId: 2 })).rejects.toThrow('does not belong');
  expect(batchService.update).not.toHaveBeenCalled();
});

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
