using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services; 


namespace TalentSphereAPI.Providers
{
    public class GoogleMeetAttendanceProvider : BaseMeetingAttendanceProvider
    {
        public GoogleMeetAttendanceProvider(
            IAttendanceProcessor attendanceProcessor)
            : base(attendanceProcessor)
        {
        }

        public override string ProviderName => "Google Meet";

        public override Task<CreateMeetingResponseDto> CreateMeetingAsync(LiveClass liveClass)
        {
            return Task.FromResult(new CreateMeetingResponseDto
            {
                MeetingId = Guid.NewGuid().ToString(),
                JoinUrl = liveClass.MeetingLink ?? string.Empty,
                HostUrl = liveClass.HostLink ?? string.Empty,
                Provider = ProviderName,
                StartTime = liveClass.ScheduledDate.Date.Add(liveClass.StartTime),
                EndTime = liveClass.ScheduledDate.Date.Add(liveClass.EndTime)
            });
        }
        public override Task<bool> UpdateMeetingAsync(LiveClass liveClass)
        {
            return Task.FromResult(true);
        }

        public override Task<bool> DeleteMeetingAsync(LiveClass liveClass)
        {
            return Task.FromResult(true);
        }

        public override Task<List<MeetingParticipantDto>> GetParticipantsAsync(
            LiveClass liveClass)
        {
            return Task.FromResult(new List<MeetingParticipantDto>());
        }

        public override Task SyncAttendanceAsync(LiveClass liveClass)
        {
            return Task.CompletedTask;
        }

        public override Task<bool> ValidateWebhookAsync(HttpRequest request)
        {
            return Task.FromResult(true);
        }

        public override Task<string?> GetRecordingUrlAsync(string meetingId)
        {
            return Task.FromResult<string?>(null);
        }
    }
}