using Microsoft.AspNetCore.SignalR;

namespace TalentSphereAPI.Hubs
{
    public class AttendanceHub : Hub
    {
        public async Task JoinLiveClass(int liveClassId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"LiveClass-{liveClassId}");
        }

        public async Task LeaveLiveClass(int liveClassId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"LiveClass-{liveClassId}");
        }
    }
}