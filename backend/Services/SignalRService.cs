using Microsoft.AspNetCore.SignalR;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.SignalR;

namespace TalentSphereAPI.Services
{
    public class SignalRService : ISignalRService
    {
        private readonly IHubContext<NotificationHub>
            _hubContext;

        public SignalRService(
            IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyBatchAsync(
            int batchId,
            object notification)
        {
            await _hubContext.Clients
                .Group($"Batch_{batchId}")
                .SendAsync(
                    "ReceiveNotification",
                    notification);
        }

        public async Task NotifyMentorAsync(
            int mentorId,
            object notification)
        {
            await _hubContext.Clients
                .Group($"Mentor_{mentorId}")
                .SendAsync(
                    "ReceiveNotification",
                    notification);
        }

        // =========================================================
        // STUDENT
        // =========================================================

        public async Task NotifyStudentAsync(
            int studentId,
            object notification)
        {
            await _hubContext.Clients
                .Group($"Student_{studentId}")
                .SendAsync(
                    "ReceiveNotification",
                    notification);
        }


        // =====================================================
        // EMPLOYEE
        // =====================================================
        public async Task NotifyEmployeeAsync(
    int employeeId,
    object notification)
        {
            await _hubContext.Clients
                .Group($"Employee_{employeeId}")
                .SendAsync("ReceiveNotification", notification);
        }

        // =====================================================
        // ORGANIZATION
        // =====================================================

        public async Task NotifyOrganizationAsync(
            int organizationId,
            object notification)
        {
            await _hubContext.Clients
                .Group($"Organization_{organizationId}")
                .SendAsync(
                    "ReceiveNotification",
                    notification);
        }
    }
}