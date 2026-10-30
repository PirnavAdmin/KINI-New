using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.Notification;
using TalentSphereAPI.Services.Interfaces;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1/notifications")]

    //[Authorize]

    public class NotificationController : ControllerBase

    {

        private readonly INotificationService _notificationService;

        public NotificationController(

            INotificationService notificationService)

        {

            _notificationService = notificationService;

        }


        // Student Notifications

        [HttpGet("student/{studentId}")]

        public async Task<IActionResult> GetStudentNotifications(

            int studentId,

            [FromQuery] NotificationQueryParameters query)

        {

            var result =

                await _notificationService

                .GetStudentNotificationsAsync(

                    studentId,

                    query);

            return Ok(result);

        }


        // Mentor Notifications

        [HttpGet("mentor/{mentorId}")]

        public async Task<IActionResult> GetMentorNotifications(

            int mentorId,

            [FromQuery] NotificationQueryParameters query)

        {

            var result =

                await _notificationService

                .GetMentorNotificationsAsync(

                    mentorId,

                    query);

            return Ok(result);

        }


        // Student unread count

        [HttpGet("student/{studentId}/unread-count")]

        public async Task<IActionResult> GetStudentUnreadCount(

            int studentId)

        {

            var count =

                await _notificationService

                .GetStudentUnreadCountAsync(studentId);

            return Ok(new

            {

                count

            });

        }


        // Mentor unread count

        [HttpGet("mentor/{mentorId}/unread-count")]

        public async Task<IActionResult> GetMentorUnreadCount(

            int mentorId)

        {

            var count =

                await _notificationService

                .GetMentorUnreadCountAsync(mentorId);

            return Ok(new

            {

                count

            });

        }


        // Mark single notification read

        [HttpPut("{notificationId}/read")]

        public async Task<IActionResult> MarkAsRead(

            int notificationId)

        {

            var result =

                await _notificationService

                .MarkAsReadAsync(notificationId);

            if (!result)

                return NotFound();

            return Ok(new

            {

                message = "Notification marked as read"

            });

        }


        // Mark all student notifications read

        [HttpPut("student/{studentId}/read-all")]

        public async Task<IActionResult> MarkAllStudentRead(

            int studentId)

        {

            var result =

                await _notificationService

                .MarkAllStudentNotificationsReadAsync(studentId);

            return Ok(new

            {

                success = result

            });

        }


        // Mark all mentor notifications read

        [HttpPut("mentor/{mentorId}/read-all")]

        public async Task<IActionResult> MarkAllMentorRead(

            int mentorId)

        {

            var result =

                await _notificationService

                .MarkAllMentorNotificationsReadAsync(mentorId);

            return Ok(new

            {

                success = result

            });

        }


        // Delete notification

        [HttpDelete("{notificationId}")]

        public async Task<IActionResult> DeleteNotification(

            int notificationId)

        {

            var result =

                await _notificationService

                .DeleteNotificationAsync(notificationId);

            if (!result)

                return NotFound();

            return Ok(new

            {

                message = "Notification deleted"

            });

        }
        // =========================================================
        // ORGANIZATION NOTIFICATIONS
        // =========================================================

        [HttpGet("organization/{organizationId}")]
        public async Task<IActionResult>
            GetOrganizationNotifications(
                int organizationId,
                [FromQuery]
        NotificationQueryParameters query)
        {
            var result =
                await _notificationService
                    .GetOrganizationNotificationsAsync(
                        organizationId,
                        query);

            return Ok(result);
        }


        // =========================================================
        // ORGANIZATION UNREAD COUNT
        // =========================================================

        [HttpGet("organization/{organizationId}/unread-count")]
        public async Task<IActionResult>
            GetOrganizationUnreadCount(
                int organizationId)
        {
            var count =
                await _notificationService
                    .GetOrganizationUnreadCountAsync(
                        organizationId);

            return Ok(new
            {
                count
            });
        }


        // =========================================================
        // MARK ALL ORGANIZATION NOTIFICATIONS READ
        // =========================================================

        [HttpPut("organization/{organizationId}/read-all")]
        public async Task<IActionResult>
            MarkAllOrganizationRead(
                int organizationId)
        {
            var result =
                await _notificationService
                    .MarkAllOrganizationNotificationsReadAsync(
                        organizationId);

            return Ok(new
            {
                success = result
            });
        }

    }

}
