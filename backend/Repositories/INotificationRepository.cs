using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface INotificationRepository
    {
        // =========================================================
        // CREATE
        // =========================================================

        Task<Notification> CreateAsync(
            Notification notification);

        Task CreateBulkAsync(
            List<Notification> notifications);

        // =========================================================
        // STUDENT NOTIFICATIONS
        // =========================================================

        Task<IEnumerable<Notification>> GetStudentNotificationsAsync(
            int studentId,
            int pageNumber,
            int pageSize,
            bool? isRead);

        Task<int> GetStudentUnreadCountAsync(
            int studentId);

        // =========================================================
        // MENTOR NOTIFICATIONS
        // =========================================================

        Task<IEnumerable<Notification>> GetMentorNotificationsAsync(
            int mentorId,
            int pageNumber,
            int pageSize,
            bool? isRead);

        Task<int> GetMentorUnreadCountAsync(
            int mentorId);

        // =========================================================
        // ORGANIZATION NOTIFICATIONS
        // =========================================================

        Task<IEnumerable<Notification>> GetOrganizationNotificationsAsync(
            int organizationId,
            int pageNumber,
            int pageSize,
            bool? isRead);

        Task<int> GetOrganizationUnreadCountAsync(
            int organizationId);

        // =========================================================
        // COMMON
        // =========================================================

        Task<Notification?> GetByIdAsync(
            int notificationId);

        Task UpdateAsync(
            Notification notification);

        Task DeleteAsync(
            Notification notification);

        Task SaveChangesAsync();
    }
}