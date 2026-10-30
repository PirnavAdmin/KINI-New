using Microsoft.AspNetCore.SignalR;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Hubs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AttendanceProcessor : IAttendanceProcessor
    {
        private readonly IHubContext<AttendanceHub> _hub;
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly ApplicationDbContext _context;

        public AttendanceProcessor(
            IAttendanceRepository attendanceRepository,
            IHubContext<AttendanceHub> hub,
            ApplicationDbContext context)
        {
            _attendanceRepository = attendanceRepository;
            _hub = hub;
            _context = context;
        }

        // =========================================================
        // PARTICIPANT JOINED
        // =========================================================

        public async Task ProcessParticipantJoinedAsync(
            MeetingEvent meetingEvent)
        {
            Console.WriteLine(
                $"[ATTENDANCE PROCESSOR] JOIN received. " +
                $"LiveClassId={meetingEvent.LiveClassId}, " +
                $"StudentId={meetingEvent.StudentId}, " +
                $"ParticipantId={meetingEvent.ParticipantId}, " +
                $"EventTime={meetingEvent.EventTime:O}");

            if (!meetingEvent.StudentId.HasValue)
            {
                Console.WriteLine(
                    "[ATTENDANCE PROCESSOR] JOIN ignored: StudentId is null.");
                return;
            }

            var attendance =
                await _attendanceRepository
                    .GetStudentAttendanceAsync(
                        meetingEvent.StudentId.Value,
                        meetingEvent.LiveClassId);

            if (attendance == null)
            {
                Console.WriteLine(
                    $"[ATTENDANCE PROCESSOR] JOIN ignored: Attendance not found. " +
                    $"StudentId={meetingEvent.StudentId}, LiveClassId={meetingEvent.LiveClassId}");
                return;
            }

            if (attendance.LiveClass == null)
            {
                Console.WriteLine(
                    $"[ATTENDANCE PROCESSOR] JOIN ignored: LiveClass navigation is null. " +
                    $"AttendanceId={attendance.AttendanceId}");
                return;
            }

            var liveClass = attendance.LiveClass;

            var eventTime =
                NormalizeUtc(meetingEvent.EventTime);

            var scheduledStartUtc =
                GetScheduledStartUtc(liveClass);

            var scheduledEndUtc =
                GetScheduledEndUtc(liveClass);

            // Ignore events after scheduled class end.
            if (eventTime > scheduledEndUtc)
            {
                await _hub.Clients
                    .Group($"LiveClass-{meetingEvent.LiveClassId}")
                    .SendAsync(
                        "AttendanceEventIgnored",
                        new
                        {
                            StudentId = meetingEvent.StudentId,
                            Reason =
                                "Participant event occurred after scheduled class end.",
                            EventTime = eventTime,
                            ScheduledEnd = scheduledEndUtc
                        });

                return;
            }

            var activeSession =
                await _attendanceRepository
                    .GetActiveSessionAsync(
                        attendance.AttendanceId);

            // =====================================================
            // Existing provisional TalentSphere session
            // =====================================================

            if (activeSession != null &&
                IsProvisionalSession(activeSession))
            {
                activeSession.JoinedAt = eventTime;

                activeSession.MeetingParticipantId =
                    meetingEvent.ParticipantId;

                activeSession.ParticipantEmail =
                    meetingEvent.ParticipantEmail;

                activeSession.ParticipantName =
                    meetingEvent.ParticipantName;

                activeSession.LeftAt = null;
                activeSession.DurationMinutes = 0;
                activeSession.IsCompleted = false;

                attendance.FirstJoinTime ??= eventTime;

                attendance.IsLate =
                    IsLateJoin(
                        attendance.FirstJoinTime.Value,
                        liveClass);

                attendance.IsAutoMarked = true;

                // If the webhook arrived after the application class was
                // already completed, the participant event can still be
                // valid because Zoom webhooks are asynchronous. Close the
                // recovered session at the scheduled class end so the late
                // webhook can repair the already-finalized attendance.
                if (string.Equals(
                        liveClass.Status,
                        "Completed",
                        StringComparison.OrdinalIgnoreCase))
                {
                    activeSession.LeftAt = scheduledEndUtc;
                    activeSession.DurationMinutes =
                        CalculateBoundedDurationMinutes(
                            activeSession.JoinedAt,
                            scheduledEndUtc,
                            scheduledStartUtc,
                            scheduledEndUtc);
                    activeSession.IsCompleted = true;
                }

                var finalizeRecoveredEvent =
                    string.Equals(
                        liveClass.Status,
                        "Completed",
                        StringComparison.OrdinalIgnoreCase);

                if (finalizeRecoveredEvent)
                {
                    attendance.TotalDurationMinutes =
                        activeSession.DurationMinutes;
                    attendance.FirstJoinTime = activeSession.JoinedAt;
                    attendance.LastLeaveTime = activeSession.LeftAt;
                    CalculateAttendanceStatus(
                        attendance,
                        liveClass,
                        true);
                }
                else
                {
                    attendance.Status =
                        AttendanceStatus.Pending;
                }

                await _attendanceRepository
                    .UpdateSessionAsync(activeSession);

                await _attendanceRepository
                    .UpdateAsync(attendance);

                await _attendanceRepository
                    .SaveChangesAsync();

                Console.WriteLine(
                    $"[ATTENDANCE PROCESSOR] JOIN mapped provisional session. " +
                    $"AttendanceId={attendance.AttendanceId}, " +
                    $"SessionId={activeSession.AttendanceSessionId}, " +
                    $"ParticipantId={activeSession.MeetingParticipantId}, " +
                    $"Duration={activeSession.DurationMinutes}, " +
                    $"Status={attendance.Status}");

                await SendStudentJoined(
                    meetingEvent,
                    attendance,
                    activeSession);

                return;
            }

            // =====================================================
            // Existing real Zoom session
            // =====================================================

            if (activeSession != null)
            {
                if (!string.IsNullOrWhiteSpace(
                        activeSession.MeetingParticipantId) &&
                    string.Equals(
                        activeSession.MeetingParticipantId,
                        meetingEvent.ParticipantId,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                // Prevent overlapping active sessions.
                return;
            }

            // =====================================================
            // Student entered Zoom directly
            // =====================================================

            var classAlreadyCompleted =
                string.Equals(
                    liveClass.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase);

            var recoveredLeaveAt =
                classAlreadyCompleted
                    ? scheduledEndUtc
                    : (DateTime?)null;

            var session =
                new AttendanceSession
                {
                    AttendanceId =
                        attendance.AttendanceId,

                    JoinedAt =
                        eventTime,

                    LeftAt = recoveredLeaveAt,

                    DurationMinutes =
                        classAlreadyCompleted
                            ? CalculateBoundedDurationMinutes(
                                eventTime,
                                scheduledEndUtc,
                                scheduledStartUtc,
                                scheduledEndUtc)
                            : 0,

                    MeetingParticipantId =
                        meetingEvent.ParticipantId,

                    ParticipantEmail =
                        meetingEvent.ParticipantEmail,

                    ParticipantName =
                        meetingEvent.ParticipantName,

                    IsCompleted = classAlreadyCompleted
                };

            await _attendanceRepository
                .AddSessionAsync(session);

            attendance.FirstJoinTime ??=
                eventTime;

            attendance.IsLate =
                IsLateJoin(
                    attendance.FirstJoinTime.Value,
                    liveClass);

            attendance.IsAutoMarked = true;

            if (classAlreadyCompleted)
            {
                attendance.TotalDurationMinutes =
                    session.DurationMinutes;
                attendance.FirstJoinTime =
                    session.JoinedAt;
                attendance.LastLeaveTime =
                    session.LeftAt;

                CalculateAttendanceStatus(
                    attendance,
                    liveClass,
                    true);
            }
            else
            {
                attendance.Status =
                    AttendanceStatus.Pending;
            }

            await _attendanceRepository
                .UpdateAsync(attendance);

            await _attendanceRepository
                .SaveChangesAsync();

            Console.WriteLine(
                $"[ATTENDANCE PROCESSOR] JOIN created real session. " +
                $"AttendanceId={attendance.AttendanceId}, " +
                $"SessionId={session.AttendanceSessionId}, " +
                $"ParticipantId={session.MeetingParticipantId}, " +
                $"Duration={session.DurationMinutes}, " +
                $"Status={attendance.Status}");

            await SendStudentJoined(
                meetingEvent,
                attendance,
                session);
        }

        // =========================================================
        // PARTICIPANT LEFT
        // =========================================================

        public async Task ProcessParticipantLeftAsync(
            MeetingEvent meetingEvent)
        {
            Console.WriteLine(
                $"[ATTENDANCE PROCESSOR] LEFT received. " +
                $"LiveClassId={meetingEvent.LiveClassId}, " +
                $"StudentId={meetingEvent.StudentId}, " +
                $"ParticipantId={meetingEvent.ParticipantId}, " +
                $"EventTime={meetingEvent.EventTime:O}");

            if (!meetingEvent.StudentId.HasValue)
                return;

            var attendance =
                await _attendanceRepository
                    .GetStudentAttendanceAsync(
                        meetingEvent.StudentId.Value,
                        meetingEvent.LiveClassId);

            if (attendance == null ||
                attendance.LiveClass == null)
            {
                return;
            }

            var liveClass = attendance.LiveClass;

            var sessions =
                await _attendanceRepository
                    .GetSessionsAsync(
                        attendance.AttendanceId);

            AttendanceSession? session = null;

            // Find exact Zoom participant session.
            if (!string.IsNullOrWhiteSpace(
                    meetingEvent.ParticipantId))
            {
                session =
                    sessions
                        .Where(s =>
                            !s.IsCompleted &&
                            s.LeftAt == null)
                        .Where(s =>
                            string.Equals(
                                s.MeetingParticipantId,
                                meetingEvent.ParticipantId,
                                StringComparison.OrdinalIgnoreCase))
                        .OrderByDescending(
                            s => s.JoinedAt)
                        .FirstOrDefault();
            }

            // Fallback to active real Zoom session.
            session ??=
                sessions
                    .Where(s =>
                        !s.IsCompleted &&
                        s.LeftAt == null &&
                        !IsProvisionalSession(s))
                    .OrderByDescending(
                        s => s.JoinedAt)
                    .FirstOrDefault();

            if (session == null ||
                IsProvisionalSession(session))
            {
                return;
            }

            var leftAt =
                NormalizeUtc(
                    meetingEvent.EventTime);

            var scheduledStartUtc =
                GetScheduledStartUtc(liveClass);

            var scheduledEndUtc =
                GetScheduledEndUtc(liveClass);

            if (leftAt < session.JoinedAt)
            {
                leftAt = session.JoinedAt;
            }

            if (leftAt > scheduledEndUtc)
            {
                leftAt = scheduledEndUtc;
            }

            session.LeftAt = leftAt;
            session.IsCompleted = true;

            session.DurationMinutes =
                CalculateBoundedDurationMinutes(
                    session.JoinedAt,
                    leftAt,
                    scheduledStartUtc,
                    scheduledEndUtc);

            await _attendanceRepository
                .UpdateSessionAsync(session);

            sessions =
                await _attendanceRepository
                    .GetSessionsAsync(
                        attendance.AttendanceId);

            var realCompletedSessions =
                sessions
                    .Where(s =>
                        s.IsCompleted &&
                        s.LeftAt.HasValue &&
                        !IsProvisionalSession(s))
                    .ToList();

            attendance.TotalDurationMinutes =
                CalculateTotalAttendanceMinutes(
                    realCompletedSessions,
                    scheduledStartUtc,
                    scheduledEndUtc);

            attendance.FirstJoinTime =
                sessions
                    .Where(s =>
                        !IsProvisionalSession(s))
                    .OrderBy(s => s.JoinedAt)
                    .Select(
                        s => (DateTime?)s.JoinedAt)
                    .FirstOrDefault();

            attendance.LastLeaveTime =
                realCompletedSessions
                    .OrderByDescending(
                        s => s.LeftAt)
                    .Select(
                        s => s.LeftAt)
                    .FirstOrDefault();

            if (attendance.FirstJoinTime.HasValue)
            {
                attendance.IsLate =
                    IsLateJoin(
                        attendance.FirstJoinTime.Value,
                        liveClass);
            }
            else
            {
                attendance.IsLate = false;
            }

            var finalizeLateWebhook =
                string.Equals(
                    liveClass.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase);

            CalculateAttendanceStatus(
                attendance,
                liveClass,
                finalizeLateWebhook);

            await _attendanceRepository
                .UpdateAsync(attendance);

            await _attendanceRepository
                .SaveChangesAsync();

            await _hub.Clients
                .Group(
                    $"LiveClass-{meetingEvent.LiveClassId}")
                .SendAsync(
                    "StudentLeft",
                    new
                    {
                        StudentId =
                            meetingEvent.StudentId,

                        StudentName =
                            meetingEvent.ParticipantName,

                        LeftAt =
                            leftAt,

                        Status =
                            attendance.Status.ToString(),

                        AttendancePercentage =
                            attendance.AttendancePercentage,

                        TotalDurationMinutes =
                            attendance.TotalDurationMinutes,

                        IsOnline = false
                    });
        }

        // =========================================================
        // SYNC ZOOM PARTICIPANTS
        // =========================================================
        //
        // This is the method missing from your current class.
        //
        // It is used when the Zoom meeting ends to retrieve the
        // authoritative participant history from Zoom and repair
        // missed/delayed participant webhooks.
        // =========================================================

        public async Task SyncZoomParticipantsAsync(
            LiveClass liveClass,
            List<MeetingParticipantDto> participants)
        {
            if (liveClass == null)
                throw new ArgumentNullException(nameof(liveClass));

            if (participants == null ||
                participants.Count == 0)
            {
                return;
            }

            var attendances =
                await _attendanceRepository
                    .GetAttendanceByLiveClassAsync(
                        liveClass.LiveClassId);

            if (attendances == null ||
                !attendances.Any())
            {
                return;
            }

            var scheduledStartUtc =
                GetScheduledStartUtc(liveClass);

            var scheduledEndUtc =
                GetScheduledEndUtc(liveClass);

            foreach (var participant in participants)
            {
                if (participant == null)
                    continue;

                var participantEmail =
                    participant.Email?.Trim();

                var participantName =
                    participant.Name?.Trim();

                Attendance? attendance = null;

                // =================================================
                // 1. Match by email
                // =================================================

                if (!string.IsNullOrWhiteSpace(
                        participantEmail))
                {
                    attendance =
                        attendances.FirstOrDefault(a =>
                            a.Student != null &&
                            !string.IsNullOrWhiteSpace(
                                a.Student.Email) &&
                            string.Equals(
                                a.Student.Email.Trim(),
                                participantEmail,
                                StringComparison.OrdinalIgnoreCase));
                }

                // =================================================
                // 2. Match by name only when unique
                // =================================================

                if (attendance == null &&
                    !string.IsNullOrWhiteSpace(
                        participantName))
                {
                    var normalizedParticipantName =
                        NormalizeName(participantName);

                    var nameMatches =
                        attendances
                            .Where(a =>
                                a.Student != null)
                            .Where(a =>
                                NormalizeName(
                                    GetStudentDisplayName(a.Student))
                                == normalizedParticipantName)
                            .ToList();

                    if (nameMatches.Count == 1)
                    {
                        attendance =
                            nameMatches[0];
                    }
                }

                // =================================================
                // 3. Cannot safely identify student
                // =================================================

                if (attendance == null)
                {
                    Console.WriteLine(
                        $"[ATTENDANCE SYNC] Participant could not be matched. " +
                        $"Name={participantName}, Email={participantEmail}, " +
                        $"ParticipantId={participant.ParticipantId}");
                    continue;
                }

                Console.WriteLine(
                    $"[ATTENDANCE SYNC] Participant matched. " +
                    $"StudentId={attendance.StudentId}, AttendanceId={attendance.AttendanceId}, " +
                    $"ParticipantId={participant.ParticipantId}, " +
                    $"Join={participant.JoinTime:O}, Leave={participant.LeaveTime:O}");

                var sessions =
                    await _attendanceRepository
                        .GetSessionsAsync(
                            attendance.AttendanceId);

                AttendanceSession? session = null;

                // =================================================
                // 4. Match existing Zoom session by participant ID
                // =================================================

                if (!string.IsNullOrWhiteSpace(
                        participant.ParticipantId))
                {
                    session =
                        sessions
                            .Where(s =>
                                !IsProvisionalSession(s))
                            .Where(s =>
                                !string.IsNullOrWhiteSpace(
                                    s.MeetingParticipantId))
                            .Where(s =>
                                string.Equals(
                                    s.MeetingParticipantId,
                                    participant.ParticipantId,
                                    StringComparison.OrdinalIgnoreCase))
                            .OrderByDescending(
                                s => s.JoinedAt)
                            .FirstOrDefault();
                }

                // =================================================
                // 5. Reuse an existing provisional session
                // =================================================
                // If the student clicked Join before Zoom's webhook or
                // past-meeting API was available, replace the app:*
                // session instead of creating a duplicate real session.
                if (session == null)
                {
                    session =
                        sessions
                            .Where(s =>
                                !s.IsCompleted &&
                                s.LeftAt == null &&
                                IsProvisionalSession(s))
                            .OrderByDescending(s => s.JoinedAt)
                            .FirstOrDefault();
                }

                // =================================================
                // 6. Fallback by join time
                // =================================================

                if (session == null &&
                    participant.JoinTime != default)
                {
                    var joinTime =
                        NormalizeUtc(
                            participant.JoinTime);

                    session =
                        sessions
                            .Where(s =>
                                !IsProvisionalSession(s))
                            .Where(s =>
                                Math.Abs(
                                    (
                                        NormalizeUtc(s.JoinedAt) -
                                        joinTime
                                    ).TotalSeconds) <= 30)
                            .OrderByDescending(
                                s => s.JoinedAt)
                            .FirstOrDefault();
                }

                // =================================================
                // 6. Create missing real Zoom session
                // =================================================

                if (session == null)
                {
                    var joinedAt =
                        NormalizeUtc(
                            participant.JoinTime);

                    var leaveAt =
                        participant.LeaveTime.HasValue
                            ? NormalizeUtc(
                                participant.LeaveTime.Value)
                            : scheduledEndUtc;

                    // Keep participant interval inside class window.
                    if (joinedAt < scheduledStartUtc)
                    {
                        joinedAt = scheduledStartUtc;
                    }

                    if (joinedAt > scheduledEndUtc)
                    {
                        continue;
                    }

                    if (leaveAt < joinedAt)
                    {
                        leaveAt = joinedAt;
                    }

                    if (leaveAt > scheduledEndUtc)
                    {
                        leaveAt = scheduledEndUtc;
                    }

                    session =
                        new AttendanceSession
                        {
                            AttendanceId =
                                attendance.AttendanceId,

                            JoinedAt =
                                joinedAt,

                            LeftAt =
                                leaveAt,

                            DurationMinutes =
                                CalculateBoundedDurationMinutes(
                                    joinedAt,
                                    leaveAt,
                                    scheduledStartUtc,
                                    scheduledEndUtc),

                            MeetingParticipantId =
                                participant.ParticipantId,

                            ParticipantEmail =
                                participant.Email ?? string.Empty,

                            ParticipantName =
                              participant.Name ?? string.Empty,

                            IsCompleted = true
                        };

                    await _attendanceRepository
                        .AddSessionAsync(session);

                    // Keep local collection current.
                    sessions.Add(session);
                }
                else
                {
                    // =================================================
                    // 7. Update existing Zoom session
                    // =================================================

                    if (!string.IsNullOrWhiteSpace(
                            participant.ParticipantId))
                    {
                        session.MeetingParticipantId =
                            participant.ParticipantId;
                    }

                    if (!string.IsNullOrWhiteSpace(
                            participant.Email))
                    {
                        session.ParticipantEmail =
                            participant.Email;
                    }

                    if (!string.IsNullOrWhiteSpace(
                            participant.Name))
                    {
                        session.ParticipantName =
                            participant.Name;
                    }

                    var joinedAt =
                        NormalizeUtc(
                            participant.JoinTime);

                    if (joinedAt < scheduledStartUtc)
                    {
                        joinedAt = scheduledStartUtc;
                    }

                    if (joinedAt > scheduledEndUtc)
                    {
                        continue;
                    }

                    session.JoinedAt = joinedAt;

                    var leaveAt =
                        participant.LeaveTime.HasValue
                            ? NormalizeUtc(
                                participant.LeaveTime.Value)
                            : scheduledEndUtc;

                    if (leaveAt < joinedAt)
                    {
                        leaveAt = joinedAt;
                    }

                    if (leaveAt > scheduledEndUtc)
                    {
                        leaveAt = scheduledEndUtc;
                    }

                    session.LeftAt = leaveAt;
                    session.IsCompleted = true;

                    session.DurationMinutes =
                        CalculateBoundedDurationMinutes(
                            joinedAt,
                            leaveAt,
                            scheduledStartUtc,
                            scheduledEndUtc);

                    await _attendanceRepository
                        .UpdateSessionAsync(session);
                }

                // =================================================
                // 8. Provisional frontend session must not count
                // =================================================

                var provisionalSessions =
                    sessions
                        .Where(s =>
                            !s.IsCompleted &&
                            s.LeftAt == null &&
                            IsProvisionalSession(s))
                        .ToList();

                foreach (var provisionalSession
                         in provisionalSessions)
                {
                    provisionalSession.LeftAt =
                        provisionalSession.JoinedAt;

                    provisionalSession.DurationMinutes = 0;

                    provisionalSession.IsCompleted = true;

                    await _attendanceRepository
                        .UpdateSessionAsync(
                            provisionalSession);
                }

                // =================================================
                // 9. Recalculate attendance
                // =================================================

                sessions =
                    await _attendanceRepository
                        .GetSessionsAsync(
                            attendance.AttendanceId);

                var realSessions =
                    sessions
                        .Where(s =>
                            !IsProvisionalSession(s) &&
                            s.LeftAt.HasValue)
                        .ToList();

                attendance.TotalDurationMinutes =
                    CalculateTotalAttendanceMinutes(
                        realSessions,
                        scheduledStartUtc,
                        scheduledEndUtc);

                attendance.FirstJoinTime =
                    realSessions
                        .OrderBy(s => s.JoinedAt)
                        .Select(
                            s => (DateTime?)s.JoinedAt)
                        .FirstOrDefault();

                attendance.LastLeaveTime =
                    realSessions
                        .OrderByDescending(
                            s => s.LeftAt)
                        .Select(
                            s => s.LeftAt)
                        .FirstOrDefault();

                if (attendance.FirstJoinTime.HasValue)
                {
                    attendance.IsLate =
                        IsLateJoin(
                            attendance.FirstJoinTime.Value,
                            liveClass);
                }
                else
                {
                    attendance.IsLate = false;
                }

                // Keep status Pending until FinalizeMeetingAsync.
                CalculateAttendanceStatus(
                    attendance,
                    liveClass,
                    false);

                attendance.IsAutoMarked = true;
                attendance.IsSynced = true;
                attendance.LastSyncedAt =
                    DateTime.UtcNow;

                await _attendanceRepository
                    .UpdateAsync(attendance);
            }

            await _attendanceRepository
                .SaveChangesAsync();

            Console.WriteLine(
                $"[ATTENDANCE SYNC] Completed for LiveClassId={liveClass.LiveClassId}. " +
                $"Participants={participants.Count}");
        }

        // =========================================================
        // CALCULATE ATTENDANCE STATUS
        // =========================================================

        private void CalculateAttendanceStatus(
            Attendance attendance,
            LiveClass liveClass,
            bool finalize)
        {
            var scheduledStartUtc =
                GetScheduledStartUtc(liveClass);

            var scheduledEndUtc =
                GetScheduledEndUtc(liveClass);

            var classDuration =
                Math.Max(
                    1,
                    (int)Math.Round(
                        (
                            scheduledEndUtc -
                            scheduledStartUtc
                        ).TotalMinutes,
                        MidpointRounding.AwayFromZero));

            attendance.TotalDurationMinutes =
                Math.Min(
                    classDuration,
                    Math.Max(
                        0,
                        attendance.TotalDurationMinutes));

            attendance.AttendancePercentage =
                Math.Round(
                    (
                        (decimal)attendance.TotalDurationMinutes
                        * 100m
                        / classDuration
                    ),
                    2);

            attendance.AttendancePercentage =
                Math.Min(
                    100m,
                    Math.Max(
                        0m,
                        attendance.AttendancePercentage));

            if (!finalize)
            {
                attendance.Status =
                    AttendanceStatus.Pending;

                return;
            }

            if (attendance.AttendancePercentage >= 75m)
            {
                attendance.Status =
                    AttendanceStatus.Present;
            }
            else if (attendance.AttendancePercentage >= 50m)
            {
                attendance.Status =
                    AttendanceStatus.Late;
            }
            else
            {
                attendance.Status =
                    AttendanceStatus.Absent;
            }

            attendance.LeftEarly =
                HasLeftEarly(
                    attendance,
                    liveClass);
        }

        // =========================================================
        // LEFT EARLY
        // =========================================================

        private bool HasLeftEarly(
            Attendance attendance,
            LiveClass liveClass)
        {
            if (!attendance.LastLeaveTime.HasValue)
                return false;

            var classEndUtc =
                GetScheduledEndUtc(liveClass);

            return attendance.LastLeaveTime.Value <
                   classEndUtc;
        }

        // =========================================================
        // LATE JOIN
        // =========================================================

        private bool IsLateJoin(
            DateTime joinTimeUtc,
            LiveClass liveClass)
        {
            try
            {
                var classStartUtc =
                    GetScheduledStartUtc(liveClass);

                return NormalizeUtc(joinTimeUtc) >
                       classStartUtc;
            }
            catch
            {
                return false;
            }
        }

        // =========================================================
        // FINALIZE MEETING
        // =========================================================

        public async Task FinalizeMeetingAsync(
            LiveClass liveClass,
            DateTime? endedAtUtc = null)
        {
            var attendances =
                await _attendanceRepository
                    .GetAttendanceByLiveClassAsync(
                        liveClass.LiveClassId);

            var scheduledStartUtc =
                GetScheduledStartUtc(liveClass);

            var scheduledEndUtc =
                GetScheduledEndUtc(liveClass);

            var meetingEndUtc =
                NormalizeUtc(
                    endedAtUtc ??
                    DateTime.UtcNow);

            if (meetingEndUtc < scheduledStartUtc)
            {
                meetingEndUtc =
                    scheduledStartUtc;
            }

            if (meetingEndUtc > scheduledEndUtc)
            {
                meetingEndUtc =
                    scheduledEndUtc;
            }

            foreach (var attendance in attendances)
            {
                var sessions =
                    await _attendanceRepository
                        .GetSessionsAsync(
                            attendance.AttendanceId);

                // Close all active real sessions.
                var activeRealSessions =
                    sessions
                        .Where(s =>
                            !s.IsCompleted &&
                            s.LeftAt == null &&
                            !IsProvisionalSession(s))
                        .ToList();

                foreach (var activeSession
                         in activeRealSessions)
                {
                    var leftAt =
                        meetingEndUtc;

                    if (leftAt <
                        activeSession.JoinedAt)
                    {
                        leftAt =
                            activeSession.JoinedAt;
                    }

                    if (leftAt >
                        scheduledEndUtc)
                    {
                        leftAt =
                            scheduledEndUtc;
                    }

                    activeSession.LeftAt =
                        leftAt;

                    activeSession.IsCompleted =
                        true;

                    activeSession.DurationMinutes =
                        CalculateBoundedDurationMinutes(
                            activeSession.JoinedAt,
                            leftAt,
                            scheduledStartUtc,
                            scheduledEndUtc);

                    await _attendanceRepository
                        .UpdateSessionAsync(
                            activeSession);
                }

                // Provisional sessions never count.
                var provisionalSessions =
                    sessions
                        .Where(s =>
                            !s.IsCompleted &&
                            s.LeftAt == null &&
                            IsProvisionalSession(s))
                        .ToList();

                foreach (var provisionalSession
                         in provisionalSessions)
                {
                    provisionalSession.LeftAt =
                        provisionalSession.JoinedAt;

                    provisionalSession.DurationMinutes =
                        0;

                    provisionalSession.IsCompleted =
                        true;

                    await _attendanceRepository
                        .UpdateSessionAsync(
                            provisionalSession);
                }

                sessions =
                    await _attendanceRepository
                        .GetSessionsAsync(
                            attendance.AttendanceId);

                var realCompletedSessions =
                    sessions
                        .Where(s =>
                            s.IsCompleted &&
                            s.LeftAt.HasValue &&
                            !IsProvisionalSession(s))
                        .ToList();

                foreach (var session
                         in realCompletedSessions)
                {
                    session.DurationMinutes =
                        CalculateBoundedDurationMinutes(
                            session.JoinedAt,
                            session.LeftAt!.Value,
                            scheduledStartUtc,
                            scheduledEndUtc);

                    await _attendanceRepository
                        .UpdateSessionAsync(
                            session);
                }

                attendance.TotalDurationMinutes =
                    CalculateTotalAttendanceMinutes(
                        realCompletedSessions,
                        scheduledStartUtc,
                        scheduledEndUtc);

                attendance.FirstJoinTime =
                    realCompletedSessions
                        .OrderBy(s => s.JoinedAt)
                        .Select(
                            s => (DateTime?)s.JoinedAt)
                        .FirstOrDefault();

                attendance.LastLeaveTime =
                    realCompletedSessions
                        .OrderByDescending(
                            s => s.LeftAt)
                        .Select(
                            s => s.LeftAt)
                        .FirstOrDefault();

                if (attendance.FirstJoinTime.HasValue)
                {
                    attendance.IsLate =
                        IsLateJoin(
                            attendance.FirstJoinTime.Value,
                            liveClass);
                }
                else
                {
                    attendance.IsLate = false;
                }

                CalculateAttendanceStatus(
                    attendance,
                    liveClass,
                    true);

                attendance.IsAutoMarked = true;
                attendance.IsSynced = true;
                attendance.LastSyncedAt =
                    DateTime.UtcNow;

                await _attendanceRepository
                    .UpdateAsync(attendance);
            }

            await _attendanceRepository
                .SaveChangesAsync();

            await _hub.Clients
                .Group(
                    $"LiveClass-{liveClass.LiveClassId}")
                .SendAsync(
                    "MeetingCompleted",
                    new
                    {
                        LiveClassId =
                            liveClass.LiveClassId,

                        Message =
                            "Meeting attendance finalized."
                    });
        }

        // =========================================================
        // CALCULATE TOTAL ATTENDANCE
        // =========================================================

        private static int CalculateTotalAttendanceMinutes(
            IEnumerable<AttendanceSession> sessions,
            DateTime scheduledStartUtc,
            DateTime scheduledEndUtc)
        {
            var intervals =
                sessions
                    .Where(s =>
                        s.LeftAt.HasValue)
                    .Select(s =>
                    {
                        var start =
                            NormalizeUtc(s.JoinedAt);

                        var end =
                            NormalizeUtc(
                                s.LeftAt!.Value);

                        if (start < scheduledStartUtc)
                            start = scheduledStartUtc;

                        if (end > scheduledEndUtc)
                            end = scheduledEndUtc;

                        return new
                        {
                            Start = start,
                            End = end
                        };
                    })
                    .Where(x =>
                        x.End > x.Start)
                    .OrderBy(x => x.Start)
                    .ToList();

            if (!intervals.Any())
                return 0;

            var totalSeconds = 0.0;

            var currentStart =
                intervals[0].Start;

            var currentEnd =
                intervals[0].End;

            for (var i = 1;
                 i < intervals.Count;
                 i++)
            {
                var next =
                    intervals[i];

                if (next.Start <= currentEnd)
                {
                    if (next.End > currentEnd)
                    {
                        currentEnd =
                            next.End;
                    }

                    continue;
                }

                totalSeconds +=
                    (
                        currentEnd -
                        currentStart
                    ).TotalSeconds;

                currentStart =
                    next.Start;

                currentEnd =
                    next.End;
            }

            totalSeconds +=
                (
                    currentEnd -
                    currentStart
                ).TotalSeconds;

            return Math.Max(
                0,
                (int)Math.Round(
                    totalSeconds / 60.0,
                    MidpointRounding.AwayFromZero));
        }

        // =========================================================
        // BOUNDED SESSION DURATION
        // =========================================================

        private static int CalculateBoundedDurationMinutes(
            DateTime joinedAt,
            DateTime leftAt,
            DateTime scheduledStartUtc,
            DateTime scheduledEndUtc)
        {
            var start =
                NormalizeUtc(joinedAt);

            var end =
                NormalizeUtc(leftAt);

            if (start < scheduledStartUtc)
            {
                start =
                    scheduledStartUtc;
            }

            if (end > scheduledEndUtc)
            {
                end =
                    scheduledEndUtc;
            }

            if (end <= start)
                return 0;

            return Math.Max(
                0,
                (int)Math.Round(
                    (
                        end -
                        start
                    ).TotalMinutes,
                    MidpointRounding.AwayFromZero));
        }

        // =========================================================
        // PROVISIONAL SESSION
        // =========================================================

        private static bool IsProvisionalSession(
            AttendanceSession session)
        {
            return
                !string.IsNullOrWhiteSpace(
                    session.MeetingParticipantId)
                &&
                session.MeetingParticipantId
                    .StartsWith(
                        "app:",
                        StringComparison.OrdinalIgnoreCase);
        }

        // =========================================================
        // STUDENT NAME
        // =========================================================

        private static string GetStudentDisplayName(
            dynamic student)
        {
            try
            {
                // Handles the common FirstName + LastName structure.
                var firstName =
                    student.FirstName?.ToString() ?? "";

                var lastName =
                    student.LastName?.ToString() ?? "";

                return $"{firstName} {lastName}".Trim();
            }
            catch
            {
                return "";
            }
        }

        // =========================================================
        // NORMALIZE NAME
        // =========================================================

        private static string NormalizeName(
            string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return string.Empty;

            return string.Join(
                " ",
                name
                    .Trim()
                    .Split(
                        ' ',
                        StringSplitOptions.RemoveEmptyEntries))
                .ToLowerInvariant();
        }

        // =========================================================
        // SCHEDULED START
        // =========================================================

        private static DateTime GetScheduledStartUtc(
            LiveClass liveClass)
        {
            var timezone =
                GetIndiaTimeZone();

            var local =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.StartTime);

            return TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(
                    local,
                    DateTimeKind.Unspecified),
                timezone);
        }

        // =========================================================
        // SCHEDULED END
        // =========================================================

        private static DateTime GetScheduledEndUtc(
            LiveClass liveClass)
        {
            var timezone =
                GetIndiaTimeZone();

            var local =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.EndTime);

            return TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(
                    local,
                    DateTimeKind.Unspecified),
                timezone);
        }

        // =========================================================
        // INDIA TIMEZONE
        // =========================================================

        private static TimeZoneInfo GetIndiaTimeZone()
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows()
                    ? "India Standard Time"
                    : "Asia/Kolkata");
        }

        // =========================================================
        // UTC
        // =========================================================

        private static DateTime NormalizeUtc(
            DateTime value)
        {
            if (value.Kind ==
                DateTimeKind.Utc)
            {
                return value;
            }

            if (value.Kind ==
                DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }

            return DateTime.SpecifyKind(
                value,
                DateTimeKind.Utc);
        }

        // =========================================================
        // SIGNALR - STUDENT JOINED
        // =========================================================

        private async Task SendStudentJoined(
            MeetingEvent meetingEvent,
            Attendance attendance,
            AttendanceSession session)
        {
            await _hub.Clients
                .Group(
                    $"LiveClass-{meetingEvent.LiveClassId}")
                .SendAsync(
                    "StudentJoined",
                    new
                    {
                        StudentId =
                            meetingEvent.StudentId,

                        StudentName =
                            meetingEvent.ParticipantName,

                        Email =
                            meetingEvent.ParticipantEmail,

                        JoinedAt =
                            session.JoinedAt,

                        Status =
                            attendance.Status.ToString(),

                        AttendancePercentage =
                            attendance.AttendancePercentage,

                        TotalDurationMinutes =
                            attendance.TotalDurationMinutes,

                        IsOnline = true
                    });
        }
    }
}