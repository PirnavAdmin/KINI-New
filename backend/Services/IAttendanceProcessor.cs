using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IAttendanceProcessor
    {
        Task ProcessParticipantJoinedAsync(
            MeetingEvent meetingEvent);

        Task ProcessParticipantLeftAsync(
            MeetingEvent meetingEvent);

        Task FinalizeMeetingAsync(
            LiveClass liveClass,
            DateTime? endedAtUtc = null);

        Task SyncZoomParticipantsAsync(
            LiveClass liveClass,
            List<MeetingParticipantDto> participants);
    }
}