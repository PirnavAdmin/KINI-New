using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Providers
{
    public class JitsiAttendanceProvider
        : BaseMeetingAttendanceProvider
    {
        private readonly IConfiguration _configuration;

        public JitsiAttendanceProvider(
            IAttendanceProcessor attendanceProcessor,
            IConfiguration configuration)
            : base(attendanceProcessor)
        {
            _configuration = configuration;
        }

        public override string ProviderName => "Jitsi";

        // =========================================================
        // CREATE JITSI MEETING
        // =========================================================

        public override Task<CreateMeetingResponseDto>
            CreateMeetingAsync(LiveClass liveClass)
        {
            var domain =
                _configuration["Jitsi:Domain"]
                ?? "meet.jit.si";

            domain = domain
                .Replace("https://", "")
                .Replace("http://", "")
                .TrimEnd('/');

            // Example:
            //
            // kiniedxhub-liveclass-25-a8f42c91
            //
            // Keep the room unique so an old class cannot
            // accidentally reuse the same Jitsi room.

            var roomName =
                $"kiniedxhub-liveclass-" +
                $"{liveClass.LiveClassId}-" +
                $"{Guid.NewGuid():N}".Substring(0, 8);

            var meetingUrl =
                $"https://{domain}/{roomName}";

            var startTime =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.StartTime);

            var endTime =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.EndTime);

            Console.WriteLine(
                $"[JITSI] Meeting generated. " +
                $"LiveClassId={liveClass.LiveClassId}, " +
                $"MeetingId={roomName}, " +
                $"MeetingLink={meetingUrl}");

            return Task.FromResult(
                new CreateMeetingResponseDto
                {
                    MeetingId = roomName,
                    JoinUrl = meetingUrl,
                    HostUrl = meetingUrl,
                    MeetingPassword = string.Empty,
                    Provider = ProviderName,
                    StartTime = startTime,
                    EndTime = endTime
                });
        }

        // =========================================================
        // UPDATE
        // =========================================================

        public override Task<bool>
            UpdateMeetingAsync(LiveClass liveClass)
        {
            // Jitsi room URL does not need to change when
            // the scheduled time changes.

            return Task.FromResult(true);
        }

        // =========================================================
        // DELETE
        // =========================================================

        public override Task<bool>
            DeleteMeetingAsync(LiveClass liveClass)
        {
            // No explicit room deletion is required for
            // meet.jit.si in this implementation.

            return Task.FromResult(true);
        }

        // =========================================================
        // GET PARTICIPANTS
        // =========================================================

        public override Task<List<MeetingParticipantDto>>
            GetParticipantsAsync(LiveClass liveClass)
        {
            // We do NOT scrape participants from Jitsi.
            //
            // Jitsi participantJoined / participantLeft events
            // will be sent to our backend by the application.

            return Task.FromResult(
                new List<MeetingParticipantDto>());
        }

        // =========================================================
        // SYNC
        // =========================================================

        public override Task
            SyncAttendanceAsync(LiveClass liveClass)
        {
            Console.WriteLine(
                $"[JITSI] Attendance sync requested. " +
                $"LiveClassId={liveClass.LiveClassId}. " +
                $"Jitsi attendance is event-driven.");

            return Task.CompletedTask;
        }

        // =========================================================
        // WEBHOOK VALIDATION
        // =========================================================

        public override Task<bool>
            ValidateWebhookAsync(HttpRequest request)
        {
            return Task.FromResult(true);
        }

        // =========================================================
        // RECORDING
        // =========================================================

        public override Task<string?>
            GetRecordingUrlAsync(string meetingId)
        {
            return Task.FromResult<string?>(null);
        }

        // =========================================================
        // CONNECTION TEST
        // =========================================================

        public override Task<bool>
            TestConnectionAsync()
        {
            var domain =
                _configuration["Jitsi:Domain"];

            return Task.FromResult(
                !string.IsNullOrWhiteSpace(domain));
        }
    }
}