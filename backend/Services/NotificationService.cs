using TalentSphereAPI.DTOs.Notification;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ISignalRService _signalRService;

        public NotificationService(
            INotificationRepository notificationRepository,
            ISignalRService signalRService)
        {
            _notificationRepository = notificationRepository;
            _signalRService = signalRService;
        }

        // =========================================================
        // LIVE CLASS - SCHEDULED
        // =========================================================

        public async Task NotifyClassScheduledAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            DateTime scheduledDate,
            TimeSpan startTime,
            List<int> studentIds)
        {
            var notifications = new List<Notification>();

            var scheduledDateTime =
                scheduledDate.Date.Add(startTime);

            var formattedSchedule =
                scheduledDateTime.ToString(
                    "dd MMM yyyy 'at' hh:mm tt");

            // Student notifications
            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Live Class Scheduled",
                    Message =
                        $"{classTitle} is scheduled for {formattedSchedule}.",
                    NotificationType =
                        NotificationType.LiveClassScheduled,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Mentor notification
            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Live Class Scheduled",
                Message =
                    $"You successfully scheduled {classTitle} for {formattedSchedule}.",
                NotificationType =
                    NotificationType.LiveClassScheduled,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            // SignalR - Students
            await _signalRService.NotifyBatchAsync(
                batchId,
                new NotificationResponseDto
                {
                    Title = "Live Class Scheduled",
                    Message =
                        $"{classTitle} is scheduled for {formattedSchedule}.",
                    NotificationType =
                        NotificationType.LiveClassScheduled.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });

            // SignalR - Mentor
            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Live Class Scheduled",
                    Message =
                        $"You successfully scheduled {classTitle} for {formattedSchedule}.",
                    NotificationType =
                        NotificationType.LiveClassScheduled.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // STUDENT NOTIFICATIONS
        // =========================================================

        public async Task<IEnumerable<NotificationResponseDto>>
            GetStudentNotificationsAsync(
                int studentId,
                NotificationQueryParameters query)
        {
            if (query == null)
            {
                query = new NotificationQueryParameters();
            }

            if (query.PageNumber < 1)
            {
                query.PageNumber = 1;
            }

            if (query.PageSize < 1)
            {
                query.PageSize = 10;
            }

            if (query.PageSize > 100)
            {
                query.PageSize = 100;
            }

            var notifications =
                await _notificationRepository
                    .GetStudentNotificationsAsync(
                        studentId,
                        query.PageNumber,
                        query.PageSize,
                        query.IsRead);

            return notifications.Select(x =>
                new NotificationResponseDto
                {
                    NotificationId =
                        x.NotificationId,
                    Title =
                        x.Title,
                    Message =
                        x.Message,
                    NotificationType =
                        x.NotificationType.ToString(),
                    ReferenceId =
                        x.ReferenceId,
                    ReferenceType =
                        x.ReferenceType.ToString(),
                    IsRead =
                        x.IsRead,
                    CreatedAt =
                        x.CreatedAt,
                    ReadAt =
                        x.ReadAt
                });
        }

        public async Task<int>
            GetStudentUnreadCountAsync(
                int studentId)
        {
            return await _notificationRepository
                .GetStudentUnreadCountAsync(studentId);
        }

        public async Task<bool>
            MarkAllStudentNotificationsReadAsync(
                int studentId)
        {
            var notifications =
                await _notificationRepository
                    .GetStudentNotificationsAsync(
                        studentId,
                        1,
                        int.MaxValue,
                        false);

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                await _notificationRepository
                    .UpdateAsync(notification);
            }

            return true;
        }

        // =========================================================
        // MENTOR NOTIFICATIONS
        // =========================================================

        public async Task<IEnumerable<NotificationResponseDto>>
            GetMentorNotificationsAsync(
                int mentorId,
                NotificationQueryParameters query)
        {
            if (query == null)
            {
                query = new NotificationQueryParameters();
            }

            if (query.PageNumber < 1)
            {
                query.PageNumber = 1;
            }

            if (query.PageSize < 1)
            {
                query.PageSize = 10;
            }

            if (query.PageSize > 100)
            {
                query.PageSize = 100;
            }

            var notifications =
                await _notificationRepository
                    .GetMentorNotificationsAsync(
                        mentorId,
                        query.PageNumber,
                        query.PageSize,
                        query.IsRead);

            return notifications.Select(x =>
                new NotificationResponseDto
                {
                    NotificationId =
                        x.NotificationId,
                    Title =
                        x.Title,
                    Message =
                        x.Message,
                    NotificationType =
                        x.NotificationType.ToString(),
                    ReferenceId =
                        x.ReferenceId,
                    ReferenceType =
                        x.ReferenceType.ToString(),
                    IsRead =
                        x.IsRead,
                    CreatedAt =
                        x.CreatedAt,
                    ReadAt =
                        x.ReadAt
                });
        }

        public async Task<int>
            GetMentorUnreadCountAsync(
                int mentorId)
        {
            return await _notificationRepository
                .GetMentorUnreadCountAsync(mentorId);
        }

        public async Task<bool>
            MarkAllMentorNotificationsReadAsync(
                int mentorId)
        {
            var notifications =
                await _notificationRepository
                    .GetMentorNotificationsAsync(
                        mentorId,
                        1,
                        int.MaxValue,
                        false);

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                await _notificationRepository
                    .UpdateAsync(notification);
            }

            return true;
        }

        // =========================================================
        // MARK SINGLE NOTIFICATION AS READ
        // =========================================================

        public async Task<bool>
            MarkAsReadAsync(
                int notificationId)
        {
            var notification =
                await _notificationRepository
                    .GetByIdAsync(notificationId);

            if (notification == null)
            {
                return false;
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _notificationRepository
                .UpdateAsync(notification);

            return true;
        }

        // =========================================================
        // DELETE NOTIFICATION
        // =========================================================

        public async Task<bool>
            DeleteNotificationAsync(
                int notificationId)
        {
            var notification =
                await _notificationRepository
                    .GetByIdAsync(notificationId);

            if (notification == null)
            {
                return false;
            }

            await _notificationRepository
                .DeleteAsync(notification);

            return true;
        }

        // =========================================================
        // LIVE CLASS - UPDATED
        // =========================================================

        public async Task NotifyClassUpdatedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Live Class Updated",
                    Message =
                        $"{classTitle} schedule has been updated.",
                    NotificationType =
                        NotificationType.LiveClassUpdated,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Live Class Updated",
                Message =
                    $"You updated {classTitle} schedule.",
                NotificationType =
                    NotificationType.LiveClassUpdated,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Live Class Updated",
                        Message =
                            $"{classTitle} schedule has been updated.",
                        NotificationType =
                            NotificationType.LiveClassUpdated.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Live Class Updated",
                    Message =
                        $"You updated {classTitle} schedule.",
                    NotificationType =
                        NotificationType.LiveClassUpdated.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // LIVE CLASS - CANCELLED
        // =========================================================

        public async Task NotifyClassCancelledAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Live Class Cancelled",
                    Message =
                        $"{classTitle} has been cancelled.",
                    NotificationType =
                        NotificationType.LiveClassCancelled,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Live Class Cancelled",
                Message =
                    $"You cancelled {classTitle}.",
                NotificationType =
                    NotificationType.LiveClassCancelled,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Live Class Cancelled",
                        Message =
                            $"{classTitle} has been cancelled.",
                        NotificationType =
                            NotificationType.LiveClassCancelled.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Live Class Cancelled",
                    Message =
                        $"You cancelled {classTitle}.",
                    NotificationType =
                        NotificationType.LiveClassCancelled.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // LIVE CLASS - STARTED
        // =========================================================

        public async Task NotifyClassStartedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Class Started",
                    Message =
                        $"{classTitle} has started. Join now.",
                    NotificationType =
                        NotificationType.ClassStarted,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Class Started",
                Message =
                    $"You started {classTitle}.",
                NotificationType =
                    NotificationType.ClassStarted,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Class Started",
                        Message =
                            $"{classTitle} has started. Join now.",
                        NotificationType =
                            NotificationType.ClassStarted.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Class Started",
                    Message =
                        $"You started {classTitle}.",
                    NotificationType =
                        NotificationType.ClassStarted.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // LIVE CLASS - REMINDER
        // =========================================================

        public async Task NotifyClassReminderAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Class Reminder",
                    Message =
                        $"{classTitle} starts in 10 minutes.",
                    NotificationType =
                        NotificationType.ClassReminder,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Class Reminder",
                Message =
                    $"Your class {classTitle} starts in 10 minutes.",
                NotificationType =
                    NotificationType.ClassReminder,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Class Reminder",
                        Message =
                            $"{classTitle} starts in 10 minutes.",
                        NotificationType =
                            NotificationType.ClassReminder.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Class Reminder",
                    Message =
                        $"Your class {classTitle} starts in 10 minutes.",
                    NotificationType =
                        NotificationType.ClassReminder.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // LIVE CLASS - RECORDING UPLOADED
        // =========================================================

        public async Task NotifyRecordingUploadedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Recording Uploaded",
                    Message =
                        $"Recording for {classTitle} is now available.",
                    NotificationType =
                        NotificationType.RecordingUploaded,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Recording Uploaded",
                Message =
                    $"You uploaded the recording for {classTitle}.",
                NotificationType =
                    NotificationType.RecordingUploaded,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Recording Uploaded",
                        Message =
                            $"Recording for {classTitle} is now available.",
                        NotificationType =
                            NotificationType.RecordingUploaded.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Recording Uploaded",
                    Message =
                        $"You uploaded the recording for {classTitle}.",
                    NotificationType =
                        NotificationType.RecordingUploaded.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // LIVE CLASS - ENDED
        // =========================================================

        public async Task NotifyClassEndedAsync(
            int mentorId,
            int batchId,
            int liveClassId,
            string classTitle,
            List<int> studentIds)
        {
            var notifications =
                new List<Notification>();

            foreach (var studentId in studentIds)
            {
                notifications.Add(new Notification
                {
                    StudentId = studentId,
                    Title = "Class Ended",
                    Message =
                        $"{classTitle} has ended.",
                    NotificationType =
                        NotificationType.ClassEnded,
                    ReferenceId = liveClassId,
                    ReferenceType =
                        ReferenceType.LiveClass,
                    CreatedByMentorId = mentorId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            notifications.Add(new Notification
            {
                MentorId = mentorId,
                Title = "Class Ended",
                Message =
                    $"You ended {classTitle}.",
                NotificationType =
                    NotificationType.ClassEnded,
                ReferenceId = liveClassId,
                ReferenceType =
                    ReferenceType.LiveClass,
                CreatedByMentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            });

            await _notificationRepository
                .CreateBulkAsync(notifications);

            foreach (var studentId in studentIds)
            {
                await _signalRService.NotifyBatchAsync(
                    batchId,
                    new NotificationResponseDto
                    {
                        Title = "Class Ended",
                        Message =
                            $"{classTitle} has ended.",
                        NotificationType =
                            NotificationType.ClassEnded.ToString(),
                        ReferenceId = liveClassId,
                        ReferenceType = "LIVE_CLASS",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _signalRService.NotifyMentorAsync(
                mentorId,
                new NotificationResponseDto
                {
                    Title = "Class Ended",
                    Message =
                        $"You ended {classTitle}.",
                    NotificationType =
                        NotificationType.ClassEnded.ToString(),
                    ReferenceId = liveClassId,
                    ReferenceType = "LIVE_CLASS",
                    CreatedAt = DateTime.UtcNow
                });
        }

        // =========================================================
        // ORGANIZATION ADMIN - CREATE
        // =========================================================


        public async Task CreateOrganizationNotificationAsync(
            int organizationId,
            string title,
            string message,
            NotificationType notificationType,
            int referenceId,
            ReferenceType referenceType)
        {
            if (organizationId <= 0)
                throw new ArgumentException("Invalid organization ID.");

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Notification title cannot be empty.");

            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Notification message cannot be empty.");

            var notification = new Notification
            {
                OrganizationId = organizationId,
                CreatedByMentorId = null,
                Title = title.Trim(),
                Message = message.Trim(),
                NotificationType = notificationType,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            // 1. Persist the notification in MySQL.
            var savedNotification =
                await _notificationRepository.CreateAsync(notification);

            // 2. Push the saved notification to the organization group.
            await _signalRService.NotifyOrganizationAsync(
                organizationId,
                new NotificationResponseDto
                {
                    NotificationId = savedNotification.NotificationId,
                    Title = savedNotification.Title,
                    Message = savedNotification.Message,
                    NotificationType =
                        savedNotification.NotificationType.ToString(),
                    ReferenceId = savedNotification.ReferenceId,
                    ReferenceType =
                        savedNotification.ReferenceType.ToString(),
                    IsRead = savedNotification.IsRead,
                    CreatedAt = savedNotification.CreatedAt,
                    ReadAt = savedNotification.ReadAt
                });
        }

        // =========================================================
        // ORGANIZATION ADMIN - GET
        // =========================================================

        public async Task<IEnumerable<NotificationResponseDto>>
            GetOrganizationNotificationsAsync(
                int organizationId,
                NotificationQueryParameters query)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "Invalid organization ID.");
            }

            if (query == null)
            {
                query = new NotificationQueryParameters();
            }

            if (query.PageNumber < 1)
            {
                query.PageNumber = 1;
            }

            if (query.PageSize < 1)
            {
                query.PageSize = 10;
            }

            if (query.PageSize > 100)
            {
                query.PageSize = 100;
            }

            var notifications =
                await _notificationRepository
                    .GetOrganizationNotificationsAsync(
                        organizationId,
                        query.PageNumber,
                        query.PageSize,
                        query.IsRead);

            return notifications.Select(x =>
                new NotificationResponseDto
                {
                    NotificationId =
                        x.NotificationId,

                    Title =
                        x.Title,

                    Message =
                        x.Message,

                    NotificationType =
                        x.NotificationType.ToString(),

                    ReferenceId =
                        x.ReferenceId,

                    ReferenceType =
                        x.ReferenceType.ToString(),

                    IsRead =
                        x.IsRead,

                    CreatedAt =
                        x.CreatedAt,

                    ReadAt =
                        x.ReadAt
                });
        }

        // =========================================================
        // ORGANIZATION ADMIN - UNREAD COUNT
        // =========================================================

        public async Task<int>
            GetOrganizationUnreadCountAsync(
                int organizationId)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "Invalid organization ID.");
            }

            return await _notificationRepository
                .GetOrganizationUnreadCountAsync(
                    organizationId);
        }

        // =========================================================
        // ORGANIZATION ADMIN - MARK ALL READ
        // =========================================================

        public async Task<bool>
            MarkAllOrganizationNotificationsReadAsync(
                int organizationId)
        {
            if (organizationId <= 0)
            {
                return false;
            }

            var notifications =
                await _notificationRepository
                    .GetOrganizationNotificationsAsync(
                        organizationId,
                        1,
                        int.MaxValue,
                        false);

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt =
                    DateTime.UtcNow;

                await _notificationRepository
                    .UpdateAsync(notification);
            }

            return true;
        }
        // =========================================================
        // CHAT MESSAGE NOTIFICATION
        // =========================================================

        public async Task NotifyChatMessageAsync(
            int conversationId,
            int senderId,
            string senderType,
            int recipientId,
            string senderName,
            string message)
        {
            var notificationMessage =
                string.IsNullOrWhiteSpace(message)
                    ? $"{senderName} sent you an attachment."
                    : $"{senderName}: {message}";

            // Keep notification preview short
            if (notificationMessage.Length > 500)
            {
                notificationMessage =
                    notificationMessage.Substring(0, 497) + "...";
            }

            var notification =
                new Notification
                {
                    Title = "New Chat Message",

                    Message =
                        notificationMessage,

                    NotificationType =
                        NotificationType.ChatMessageReceived,

                    ReferenceId =
                        conversationId,

                    ReferenceType =
                        ReferenceType.ChatConversation,

                    IsRead = false,

                    CreatedAt =
                        DateTime.UtcNow
                };

            // =========================================================
            // RECIPIENT
            // =========================================================

            if (senderType.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                // Mentor sent message
                // Student receives notification

                notification.StudentId =
                    recipientId;

                notification.CreatedByMentorId =
                    senderId;
            }
            else if (senderType.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                // Student sent message
                // Mentor receives notification

                notification.MentorId =
                    recipientId;
            }
            else
            {
                throw new ArgumentException(
                    "Invalid sender type.");
            }

            // =========================================================
            // SAVE DATABASE NOTIFICATION
            // =========================================================

            await _notificationRepository
                .CreateAsync(notification);

            // =========================================================
            // REAL-TIME SIGNALR NOTIFICATION
            // =========================================================

            var response =
                new NotificationResponseDto
                {
                    NotificationId =
                        notification.NotificationId,

                    Title =
                        notification.Title,

                    Message =
                        notification.Message,

                    NotificationType =
                        notification.NotificationType
                            .ToString(),

                    ReferenceId =
                        notification.ReferenceId,

                    ReferenceType =
                        notification.ReferenceType
                            .ToString(),

                    IsRead =
                        notification.IsRead,

                    CreatedAt =
                        notification.CreatedAt,

                    ReadAt =
                        notification.ReadAt
                };

            if (senderType.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                await _signalRService
                    .NotifyStudentAsync(
                        recipientId,
                        response);
            }
            else
            {
                await _signalRService
                    .NotifyMentorAsync(
                        recipientId,
                        response);
            }
        }

        public async Task<NotificationResponseDto>
            CreateEmployeeNotificationAsync(
                int employeeId,
                NotificationType notificationType,
                ReferenceType referenceType,
                int referenceId,
                string title,
                string message)
        {
            if (employeeId <= 0)
                throw new ArgumentException("Invalid employee ID.");

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Message is required.");

            var notification = new Notification
            {
                EmployeeId = employeeId,
                Title = title.Trim(),
                Message = message.Trim(),
                NotificationType = notificationType,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _notificationRepository.CreateAsync(
                notification);

            var response = new NotificationResponseDto
            {
                NotificationId = created.NotificationId,
                Title = created.Title,
                Message = created.Message,
                NotificationType = created.NotificationType.ToString(),
                ReferenceId = created.ReferenceId,
                ReferenceType = created.ReferenceType.ToString(),
                IsRead = created.IsRead,
                CreatedAt = created.CreatedAt,
                ReadAt = created.ReadAt
            };

            await _signalRService.NotifyEmployeeAsync(
                employeeId,
                response);

            return response;
        }

    }
}