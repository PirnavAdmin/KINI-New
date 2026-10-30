using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Providers;

public interface IMeetingAttendanceProvider
{
    string ProviderName { get; }

    Task<CreateMeetingResponseDto> CreateMeetingAsync(LiveClass liveClass);

    Task<bool> UpdateMeetingAsync(LiveClass liveClass);

    Task<bool> DeleteMeetingAsync(LiveClass liveClass);

    Task<List<MeetingParticipantDto>> GetParticipantsAsync(LiveClass liveClass);

    Task SyncAttendanceAsync(LiveClass liveClass);

    Task ProcessParticipantJoinedAsync(MeetingEvent meetingEvent);

    Task ProcessParticipantLeftAsync(MeetingEvent meetingEvent);

    Task<bool> ValidateWebhookAsync(HttpRequest request);

    Task<string?> GetRecordingUrlAsync(string meetingId);

    Task<bool> TestConnectionAsync();
}