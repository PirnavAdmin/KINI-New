import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NotificationCenter } from '@/features/mentor/pages/MentorNotifications';
import { notificationService } from '@shared/services/notificationService';

vi.mock('@shared/services/notificationService', () => ({ notificationService: {
  getStudentNotifications: vi.fn(), getStudentUnreadCount: vi.fn(),
} }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('uses the displayed notification data for unread counts instead of a stale server total', async () => {
  notificationService.getStudentNotifications.mockResolvedValue(Array.from({ length: 4 }, (_, index) => ({
    notificationId: index + 1, title: `Notice ${index + 1}`, isRead: index === 3,
  })));
  notificationService.getStudentUnreadCount.mockResolvedValue({ unreadCount: 8 });
  render(<NotificationCenter recipientType="student" recipientId={5} notificationCategories={['All', 'Unread']} hideAnalytics hideSecondaryPanels hideSettings />);
  await screen.findByText('Notice 4');
  fireEvent.click(screen.getByRole('button', { name: /Unread\s*3/ }));
  await waitFor(() => expect(screen.queryByText('Notice 4')).not.toBeInTheDocument());
  expect(screen.getByText('Notice 1')).toBeInTheDocument();
  expect(notificationService.getStudentUnreadCount).not.toHaveBeenCalled();
});
