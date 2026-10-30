using TalentSphereAPI.DTOs.Notification;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Services
{
    public interface INotificationService
    {
        // =========================================================
        // LIVE CLASS NOTIFICATIONS
        // =========================================================

        Task NotifyClassScheduledAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            DateTime scheduledDate,
            TimeSpan startTime,
            List<int> studentIds);

        Task NotifyClassUpdatedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        Task NotifyClassCancelledAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        Task NotifyClassStartedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        Task NotifyClassReminderAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        Task NotifyRecordingUploadedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        Task NotifyClassEndedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds);

        // =========================================================
        // STUDENT NOTIFICATIONS
        // =========================================================

        Task<IEnumerable<NotificationResponseDto>>
            GetStudentNotificationsAsync(
                int studentId,
                NotificationQueryParameters query);

        Task<int>
            GetStudentUnreadCountAsync(
                int studentId);

        Task<bool>
            MarkAllStudentNotificationsReadAsync(
                int studentId);

        // =========================================================
        // MENTOR NOTIFICATIONS
        // =========================================================

        Task<IEnumerable<NotificationResponseDto>>
            GetMentorNotificationsAsync(
                int mentorId,
                NotificationQueryParameters query);

        Task<int>
            GetMentorUnreadCountAsync(
                int mentorId);

        Task<bool>
            MarkAllMentorNotificationsReadAsync(
                int mentorId);

        // =========================================================
        // ORGANIZATION ADMIN NOTIFICATIONS
        // =========================================================

        Task CreateOrganizationNotificationAsync(
            int organizationId,
            string title,
            string message,
            NotificationType notificationType,
            int referenceId,
            ReferenceType referenceType);

        Task<IEnumerable<NotificationResponseDto>>
            GetOrganizationNotificationsAsync(
                int organizationId,
                NotificationQueryParameters query);

        Task<int>
            GetOrganizationUnreadCountAsync(
                int organizationId);

        Task<bool>
            MarkAllOrganizationNotificationsReadAsync(
                int organizationId);

 // =========================================================
// CHAT
// =========================================================

Task NotifyChatMessageAsync(
    int conversationId,
    int senderId,
    string senderType,
    int recipientId,
    string senderName,
    string message);

        // =========================================================
        // COMMON
        // =========================================================

        Task<bool>
            MarkAsReadAsync(
                int notificationId);

        Task<bool>
            DeleteNotificationAsync(
                int notificationId);

        Task<NotificationResponseDto> CreateEmployeeNotificationAsync(
    int employeeId,
    NotificationType notificationType,
    ReferenceType referenceType,
    int referenceId,
    string title,
    string message);
    }
}