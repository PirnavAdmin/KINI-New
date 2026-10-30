using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // CREATE
        // =========================================================

        public async Task<Notification> CreateAsync(
            Notification notification)
        {
            await _context.Notifications.AddAsync(
                notification);

            await _context.SaveChangesAsync();

            return notification;
        }

        public async Task CreateBulkAsync(
            List<Notification> notifications)
        {
            if (notifications == null ||
                notifications.Count == 0)
            {
                return;
            }

            await _context.Notifications.AddRangeAsync(
                notifications);

            await _context.SaveChangesAsync();
        }

        // =========================================================
        // STUDENT NOTIFICATIONS
        // =========================================================

        public async Task<IEnumerable<Notification>>
            GetStudentNotificationsAsync(
                int studentId,
                int pageNumber,
                int pageSize,
                bool? isRead)
        {
            IQueryable<Notification> query =
                _context.Notifications
                    .Where(x =>
                        x.StudentId == studentId);

            if (isRead.HasValue)
            {
                query = query.Where(x =>
                    x.IsRead == isRead.Value);
            }

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int>
            GetStudentUnreadCountAsync(
                int studentId)
        {
            return await _context.Notifications
                .CountAsync(x =>
                    x.StudentId == studentId &&
                    !x.IsRead);
        }

        // =========================================================
        // MENTOR NOTIFICATIONS
        // =========================================================

        public async Task<IEnumerable<Notification>>
            GetMentorNotificationsAsync(
                int mentorId,
                int pageNumber,
                int pageSize,
                bool? isRead)
        {
            IQueryable<Notification> query =
                _context.Notifications
                    .Where(x =>
                        x.MentorId == mentorId);

            if (isRead.HasValue)
            {
                query = query.Where(x =>
                    x.IsRead == isRead.Value);
            }

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int>
            GetMentorUnreadCountAsync(
                int mentorId)
        {
            return await _context.Notifications
                .CountAsync(x =>
                    x.MentorId == mentorId &&
                    !x.IsRead);
        }

        // =========================================================
        // ORGANIZATION NOTIFICATIONS
        // =========================================================

        public async Task<IEnumerable<Notification>>
            GetOrganizationNotificationsAsync(
                int organizationId,
                int pageNumber,
                int pageSize,
                bool? isRead)
        {
            IQueryable<Notification> query =
                _context.Notifications
                    .Where(x =>
                        x.OrganizationId == organizationId);

            if (isRead.HasValue)
            {
                query = query.Where(x =>
                    x.IsRead == isRead.Value);
            }

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int>
            GetOrganizationUnreadCountAsync(
                int organizationId)
        {
            return await _context.Notifications
                .CountAsync(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsRead);
        }

        // =========================================================
        // COMMON
        // =========================================================

        public async Task<Notification?>
            GetByIdAsync(
                int notificationId)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(x =>
                    x.NotificationId == notificationId);
        }

        public async Task UpdateAsync(
            Notification notification)
        {
            _context.Notifications.Update(
                notification);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(
            Notification notification)
        {
            _context.Notifications.Remove(
                notification);

            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}