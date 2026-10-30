using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Providers
{
    public abstract class BaseMeetingAttendanceProvider
        : IMeetingAttendanceProvider
    {
        protected readonly IAttendanceProcessor _attendanceProcessor;

        protected BaseMeetingAttendanceProvider(
            IAttendanceProcessor attendanceProcessor)
        {
            _attendanceProcessor = attendanceProcessor;
        }

        public virtual Task<bool> TestConnectionAsync()
        {
            return Task.FromResult(false);
        }

        public abstract string ProviderName { get; }

        public abstract Task<CreateMeetingResponseDto>
            CreateMeetingAsync(
                LiveClass liveClass);

        public abstract Task<bool>
            UpdateMeetingAsync(
                LiveClass liveClass);

        public abstract Task<bool>
            DeleteMeetingAsync(
                LiveClass liveClass);

        public abstract Task<List<MeetingParticipantDto>>
            GetParticipantsAsync(
                LiveClass liveClass);

        public virtual Task ProcessParticipantJoinedAsync(
            MeetingEvent meetingEvent)
        {
            return _attendanceProcessor
                .ProcessParticipantJoinedAsync(
                    meetingEvent);
        }

        public virtual Task ProcessParticipantLeftAsync(
            MeetingEvent meetingEvent)
        {
            return _attendanceProcessor
                .ProcessParticipantLeftAsync(
                    meetingEvent);
        }

        public virtual async Task SyncAttendanceAsync(
      LiveClass liveClass)
        {
            var participants =
                await GetParticipantsAsync(liveClass);

            if (participants != null &&
                participants.Count > 0)
            {
                await _attendanceProcessor
                    .SyncZoomParticipantsAsync(
                        liveClass,
                        participants);
            }
        }

        public abstract Task<bool>
            ValidateWebhookAsync(
                HttpRequest request);

        public abstract Task<string?>
            GetRecordingUrlAsync(
                string meetingId);
    }
}