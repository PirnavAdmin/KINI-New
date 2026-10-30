using Microsoft.AspNetCore.SignalR;

namespace TalentSphereAPI.SignalR
{
    public class NotificationHub : Hub
    {
        // =========================================================
        // BATCH
        // =========================================================

        public async Task JoinBatchGroup(
            int batchId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Batch_{batchId}");
        }

        public async Task LeaveBatchGroup(
            int batchId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"Batch_{batchId}");
        }

        // =========================================================
        // MENTOR
        // =========================================================

        public async Task JoinMentorGroup(
            int mentorId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Mentor_{mentorId}");
        }

        public async Task LeaveMentorGroup(
            int mentorId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"Mentor_{mentorId}");
        }

        // =========================================================
        // STUDENT
        // =========================================================

        public async Task JoinStudentGroup(
            int studentId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Student_{studentId}");
        }

        public async Task LeaveStudentGroup(
            int studentId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"Student_{studentId}");
        }

        // =========================================================
        // ORGANIZATION
        // =========================================================

        public async Task JoinOrganizationGroup(
            int organizationId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Organization_{organizationId}");
        }

        public async Task LeaveOrganizationGroup(
            int organizationId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"Organization_{organizationId}");
        }

        public async Task JoinEmployeeGroup(int employeeId)
        {
            // Do not deploy this method without verifying
            // that the authenticated caller owns this employee ID.
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Employee_{employeeId}");
        }
    }
}