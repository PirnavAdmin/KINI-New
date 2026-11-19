import { expect, it, vi } from 'vitest';
import apiClient from '@shared/services/apiClient';
import { createConversation } from '@shared/services/chatService';
vi.mock('@shared/services/apiClient', () => ({ default: { post: vi.fn() } }));

it('keeps action-level conversation refusals from ending an unexpired session', async () => {
  const failure = { response: { status: 401 } };
  apiClient.post.mockRejectedValueOnce(failure);
  await expect(createConversation({ mentorId: 12 })).rejects.toBe(failure);
  expect(apiClient.post).toHaveBeenCalledWith(expect.any(String), { mentorId: 12 }, { skipAuthRedirect: 'unless-expired' });
});
