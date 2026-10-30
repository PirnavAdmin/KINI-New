using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Zoom;
using TalentSphereAPI.Models;
using TalentSphereAPI.Providers;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/zoom/webhook")]
    [AllowAnonymous]
    public class ZoomWebhookController : ControllerBase
    {
        private readonly ZoomAttendanceProvider _zoomProvider;
        private readonly IAttendanceProcessor _attendanceProcessor;
        private readonly ILiveClassService _liveClassService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ZoomWebhookController> _logger;

        public ZoomWebhookController(
            ZoomAttendanceProvider zoomProvider,
            IAttendanceProcessor attendanceProcessor,
            ILiveClassService liveClassService,
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<ZoomWebhookController> logger)
        {
            _zoomProvider = zoomProvider;
            _attendanceProcessor = attendanceProcessor;
            _liveClassService = liveClassService;
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        // =========================================================
        // ZOOM WEBHOOK
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> ReceiveWebhook()
        {
            try
            {
                Request.EnableBuffering();

                string rawBody;

                using (var reader = new StreamReader(
                    Request.Body,
                    Encoding.UTF8,
                    leaveOpen: true))
                {
                    rawBody = await reader.ReadToEndAsync();
                }

                Request.Body.Position = 0;

                if (string.IsNullOrWhiteSpace(rawBody))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Empty Zoom webhook body."
                    });
                }

                // =====================================================
                // SIGNATURE VALIDATION
                // =====================================================

                var timestamp =
     Request.Headers["x-zm-request-timestamp"]
         .FirstOrDefault();

                var signature =
                    Request.Headers["x-zm-signature"]
                        .FirstOrDefault();

                // Safe diagnostics.
                // DO NOT log the webhook secret or the complete signature.
                _logger.LogInformation(
                    "Zoom webhook received. Timestamp={Timestamp}, HasSignature={HasSignature}, BodyLength={BodyLength}",
                    timestamp,
                    !string.IsNullOrWhiteSpace(signature),
                    rawBody.Length);

                var webhookSecret =
                    _configuration["Zoom:WebhookSecret"];

                if (string.IsNullOrWhiteSpace(webhookSecret))
                {
                    _logger.LogError(
                        "Zoom webhook rejected because Zoom:WebhookSecret is not configured.");

                    return StatusCode(500, new
                    {
                        Success = false,
                        Message = "Zoom webhook secret is not configured."
                    });
                }

                if (string.IsNullOrWhiteSpace(timestamp) ||
                    string.IsNullOrWhiteSpace(signature))
                {
                    _logger.LogWarning(
                        "Zoom webhook rejected because signature headers are missing. " +
                        "HasTimestamp={HasTimestamp}, HasSignature={HasSignature}",
                        !string.IsNullOrWhiteSpace(timestamp),
                        !string.IsNullOrWhiteSpace(signature));

                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Missing Zoom webhook signature."
                    });
                }

                if (!long.TryParse(timestamp, out var timestampValue))
                {
                    _logger.LogWarning(
                        "Zoom webhook rejected because timestamp is invalid. Timestamp={Timestamp}",
                        timestamp);

                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Invalid Zoom webhook timestamp."
                    });
                }

                var nowUnix =
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                if (Math.Abs(nowUnix - timestampValue) > 300)
                {
                    _logger.LogWarning(
                        "Zoom webhook rejected because timestamp is outside the allowed " +
                        "5-minute window. Timestamp={Timestamp}, Now={NowUnix}",
                        timestampValue,
                        nowUnix);

                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Expired Zoom webhook request."
                    });
                }

                var message =
                    $"v0:{timestamp}:{rawBody}";

                using var hmac =
                    new HMACSHA256(
                        Encoding.UTF8.GetBytes(webhookSecret));

                var hash =
                    hmac.ComputeHash(
                        Encoding.UTF8.GetBytes(message));

                var expectedSignature =
                    $"v0={Convert.ToHexString(hash).ToLowerInvariant()}";

                var receivedSignature =
                    signature.Trim();

                if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSignature),
                    Encoding.UTF8.GetBytes(receivedSignature)))
                {
                    _logger.LogWarning(
                        "Zoom webhook signature validation failed. " +
                        "Timestamp={Timestamp}, BodyLength={BodyLength}",
                        timestamp,
                        rawBody.Length);

                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Invalid Zoom webhook signature."
                    });
                }

                _logger.LogInformation(
                    "Zoom webhook signature validated successfully.");

                // =====================================================
                // DESERIALIZE
                // =====================================================

                var options =
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                var webhook =
                    JsonSerializer.Deserialize<ZoomWebhookEventDto>(
                        rawBody,
                        options);

                if (webhook == null)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Invalid Zoom webhook payload."
                    });
                }

                // =====================================================
                // ZOOM URL VALIDATION
                // =====================================================

                if (string.Equals(
                    webhook.Event,
                    "endpoint.url_validation",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var plainToken =
                        webhook.Payload?.PlainToken;

                    if (string.IsNullOrWhiteSpace(plainToken))
                    {
                        return BadRequest(new
                        {
                            Success = false,
                            Message = "Zoom plainToken missing."
                        });
                    }

                    using var tokenHmac =
                        new HMACSHA256(
                            Encoding.UTF8.GetBytes(webhookSecret));

                    var encryptedToken =
                        Convert.ToHexString(
                            tokenHmac.ComputeHash(
                                Encoding.UTF8.GetBytes(plainToken)))
                            .ToLowerInvariant();

                    return Ok(new
                    {
                        plainToken,
                        encryptedToken
                    });
                }

                var zoomEventId =
     webhook.EventId?.Trim();

                var eventIdForDatabase =
                    string.IsNullOrWhiteSpace(zoomEventId)
                        ? null
                        : zoomEventId;

                var meeting =
                    webhook.Payload?.Object;

                var zoomMeetingId =
                    NormalizeMeetingId(meeting?.Id);

                if (string.IsNullOrWhiteSpace(zoomMeetingId))
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Zoom meeting ID missing."
                    });
                }

                // =====================================================
                // FIND LIVE CLASS
                // =====================================================

                var liveClass =
                    await _context.LiveClasses
                        .FirstOrDefaultAsync(x =>
                            x.MeetingId == zoomMeetingId);

                if (liveClass == null)
                {
                    _logger.LogWarning(
                        "Zoom meeting {MeetingId} was not found in TalentSphere.",
                        zoomMeetingId);

                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Zoom meeting is not registered in TalentSphere."
                    });
                }

                // =====================================================
                // MEETING ENDED
                // =====================================================

                if (string.Equals(
                    webhook.Event,
                    "meeting.ended",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var endedAtUtc =
                        webhook.EventTs > 0
                            ? DateTimeOffset
                                .FromUnixTimeMilliseconds(
                                    webhook.EventTs)
                                .UtcDateTime
                            : DateTime.UtcNow;

                    _logger.LogInformation(
                        "Zoom meeting ended. LiveClassId={LiveClassId}, MeetingId={MeetingId}",
                        liveClass.LiveClassId,
                        zoomMeetingId);

                    await _liveClassService.EndClassAsync(
                        liveClass.LiveClassId,
                        endedAtUtc);

                    // -------------------------------------------------
                    // Recording
                    // -------------------------------------------------

                    if (liveClass.RecordingEnabled &&
                        !string.IsNullOrWhiteSpace(
                            liveClass.MeetingId))
                    {
                        try
                        {
                            var recordingUrl =
                                await _zoomProvider
                                    .GetRecordingUrlAsync(
                                        liveClass.MeetingId);

                            if (!string.IsNullOrWhiteSpace(recordingUrl))
                            {
                                liveClass.RecordingUrl =
                                    recordingUrl;

                                liveClass.RecordingUploadedAt =
                                    DateTime.UtcNow;

                                await _context.SaveChangesAsync();
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(
                                ex,
                                "Unable to retrieve Zoom recording for LiveClassId={LiveClassId}",
                                liveClass.LiveClassId);
                        }
                    }

                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Zoom meeting ended and attendance finalized."
                    });
                }

                // =====================================================
                // SUPPORTED EVENTS
                // =====================================================

                var zoomEventType =
                    webhook.Event?.Trim() ?? string.Empty;

                MeetingEventType? eventType =
                    zoomEventType.ToLowerInvariant() switch
                    {
                        "meeting.participant_joined" =>
                            MeetingEventType.Joined,

                        "meeting.participant_left" =>
                            MeetingEventType.Left,

                        _ => null
                    };

                if (!eventType.HasValue)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Zoom event ignored."
                    });
                }

                // =====================================================
                // IMPORTANT: DO NOT REJECT PARTICIPANT EVENTS BECAUSE
                // THE APPLICATION CLASS IS ALREADY COMPLETED.
                //
                // Zoom webhooks are asynchronous. A valid participant
                // event can arrive after the application has already
                // changed LiveClass.Status to Completed. The processor
                // validates the participant event time against the
                // scheduled class window and can reconcile late events.
                // =====================================================

                // =====================================================
                // PARTICIPANT
                // =====================================================

                var participant =
                    meeting?.Participant;

                if (participant == null)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Participant information missing."
                    });
                }

                var participantEmail =
                    participant.Email?.Trim() ?? string.Empty;

                var participantName =
                    participant.UserName?.Trim() ?? string.Empty;

                var participantId =
                    !string.IsNullOrWhiteSpace(
                        participant.ParticipantUserId)
                        ? participant.ParticipantUserId.Trim()
                        : !string.IsNullOrWhiteSpace(
                            participant.UserId)
                            ? participant.UserId.Trim()
                            : !string.IsNullOrWhiteSpace(
                                participant.Id)
                                ? participant.Id.Trim()
                                : string.Empty;

                _logger.LogInformation(
    "ZOOM PARTICIPANT RECEIVED: " +
    "LiveClassId={LiveClassId}, " +
    "MeetingId={MeetingId}, " +
    "ParticipantId={ParticipantId}, " +
    "UserId={UserId}, " +
    "ParticipantUserId={ParticipantUserId}, " +
    "Name={Name}, " +
    "Email={Email}, " +
    "JoinTime={JoinTime}, " +
    "LeaveTime={LeaveTime}",
    liveClass.LiveClassId,
    zoomMeetingId,
    participantId,
    participant.UserId,
    participant.ParticipantUserId,
    participantName,
    participantEmail,
    participant.JoinTime,
    participant.LeaveTime);

                if (string.IsNullOrWhiteSpace(participantId))
                {
                    _logger.LogWarning(
                        "Zoom participant ID missing. LiveClassId={LiveClassId}",
                        liveClass.LiveClassId);

                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Zoom participant ID missing."
                    });
                }

                // =====================================================
                // EVENT TIME
                // =====================================================

                DateTime eventTime;

                if (eventType == MeetingEventType.Joined)
                {
                    eventTime =
                        participant.JoinTime
                        ?? DateTime.UtcNow;
                }
                else
                {
                    eventTime =
                        participant.LeaveTime
                        ?? DateTime.UtcNow;
                }

                eventTime = NormalizeUtc(eventTime);

                // =====================================================
                // LOAD ACTIVE STUDENTS
                // =====================================================

                var students =
                    await _context.Students
                        .Where(s =>
                            s.BatchId == liveClass.BatchId &&
                            s.Status == "Active")
                        .ToListAsync();

                Student? student = null;

                // =====================================================
                // 1. MATCH BY EMAIL
                // =====================================================

                if (!string.IsNullOrWhiteSpace(participantEmail))
                {
                    var emailMatches =
                        students
                            .Where(s =>
                                !string.IsNullOrWhiteSpace(s.Email) &&
                                string.Equals(
                                    s.Email.Trim(),
                                    participantEmail,
                                    StringComparison.OrdinalIgnoreCase))
                            .ToList();

                    if (emailMatches.Count == 1)
                    {
                        student = emailMatches[0];
                    }
                }

                // =====================================================
                // 2. MATCH BY UNIQUE FULL NAME
                // =====================================================

                if (student == null &&
                    !string.IsNullOrWhiteSpace(participantName))
                {
                    var normalizedName =
                        NormalizeName(participantName);

                    var nameMatches =
                        students
                            .Where(s =>
                                NormalizeName(
                                    $"{s.FirstName} {s.LastName}") ==
                                normalizedName)
                            .ToList();

                    if (nameMatches.Count == 1)
                    {
                        student = nameMatches[0];
                    }
                }

                // =====================================================
                // 3. IMPORTANT FALLBACK:
                // MATCH AGAINST EXISTING ATTENDANCE SESSION
                // =====================================================
                //
                // This handles cases where:
                //
                // - Zoom email is missing
                // - Zoom display name is different
                // - Student already clicked Join
                //
                // The provisional session contains:
                //
                // app:{StudentId}:{Guid}
                //
                // =====================================================

                if (student == null)
                {
                    var provisionalSessions =
                        await _context.AttendanceSessions
                            .Include(s => s.Attendance)
                                .ThenInclude(a => a.Student)
                            .Where(s =>
                                !s.IsCompleted &&
                                s.LeftAt == null &&
                                s.MeetingParticipantId.StartsWith("app:") &&
                                s.Attendance.LiveClassId ==
                                    liveClass.LiveClassId)
                            .ToListAsync();

                    // Match participant email against provisional session.
                    if (!string.IsNullOrWhiteSpace(participantEmail))
                    {
                        var matchingSession =
                            provisionalSessions
                                .Where(s =>
                                    !string.IsNullOrWhiteSpace(
                                        s.ParticipantEmail))
                                .Where(s =>
                                    string.Equals(
                                        s.ParticipantEmail.Trim(),
                                        participantEmail,
                                        StringComparison.OrdinalIgnoreCase))
                                .OrderByDescending(s => s.JoinedAt)
                                .FirstOrDefault();

                        if (matchingSession != null)
                        {
                            student =
                                matchingSession.Attendance.Student;
                        }
                    }

                    // Match participant name against provisional session.
                    if (student == null &&
                        !string.IsNullOrWhiteSpace(participantName))
                    {
                        var normalizedParticipantName =
                            NormalizeName(participantName);

                        var matchingSession =
                            provisionalSessions
                                .Where(s =>
                                    NormalizeName(
                                        s.ParticipantName) ==
                                    normalizedParticipantName)
                                .OrderByDescending(s => s.JoinedAt)
                                .FirstOrDefault();

                        if (matchingSession != null)
                        {
                            student =
                                matchingSession.Attendance.Student;
                        }
                    }
                }

                // =====================================================
                // UNKNOWN PARTICIPANT
                // =====================================================

                if (student == null)
                {
                    _logger.LogWarning(
                        "Unable to match Zoom participant. " +
                        "LiveClassId={LiveClassId}, Email={Email}, Name={Name}, ParticipantId={ParticipantId}",
                        liveClass.LiveClassId,
                        participantEmail,
                        participantName,
                        participantId);

                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Zoom participant could not be matched to a TalentSphere student."
                    });
                }

                _logger.LogInformation(
                    "Zoom participant matched. " +
                    "LiveClassId={LiveClassId}, StudentId={StudentId}, Email={Email}, Name={Name}",
                    liveClass.LiveClassId,
                    student.StudentId,
                    participantEmail,
                    participantName);

                // =====================================================
                // ENSURE ATTENDANCE EXISTS
                // =====================================================
                //
                // THIS IS THE IMPORTANT FIX.
                //
                // Previously the processor returned when Attendance
                // didn't exist.
                //
                // Now the webhook creates it.
                // =====================================================

                var attendance =
                    await _context.Attendances
                        .Include(a => a.Student)
                        .Include(a => a.LiveClass)
                            .ThenInclude(l => l.Batch)
                        .Include(a => a.Sessions)
                        .FirstOrDefaultAsync(a =>
                            a.StudentId == student.StudentId &&
                            a.LiveClassId ==
                                liveClass.LiveClassId);

                if (attendance == null)
                {
                    attendance =
                        new Attendance
                        {
                            StudentId =
                                student.StudentId,

                            LiveClassId =
                                liveClass.LiveClassId,

                            AttendancePercentage =
                                0,

                            FirstJoinTime =
                                null,

                            LastLeaveTime =
                                null,

                            TotalDurationMinutes =
                                0,

                            Status =
                                AttendanceStatus.Pending,

                            IsLate =
                                false,

                            LeftEarly =
                                false,

                            IsAutoMarked =
                                true,

                            IsSynced =
                                false,

                            LastSyncedAt =
                                null
                        };

                    await _context.Attendances
                        .AddAsync(attendance);

                    await _context.SaveChangesAsync();

                    _logger.LogInformation(
                        "Created missing Attendance. " +
                        "AttendanceId={AttendanceId}, StudentId={StudentId}, LiveClassId={LiveClassId}",
                        attendance.AttendanceId,
                        student.StudentId,
                        liveClass.LiveClassId);

                    // Reload navigation properties.
                    attendance =
                        await _context.Attendances
                            .Include(a => a.Student)
                            .Include(a => a.LiveClass)
                                .ThenInclude(l => l.Batch)
                            .Include(a => a.Sessions)
                            .FirstAsync(a =>
                                a.AttendanceId ==
                                attendance.AttendanceId);
                }

                // =====================================================
                // EVENT DUPLICATE / RETRY PROTECTION
                // =====================================================

                MeetingEvent? existingEvent = null;

                if (!string.IsNullOrWhiteSpace(zoomEventId))
                {
                    existingEvent =
                        await _context.MeetingEvents
                            .FirstOrDefaultAsync(e =>
                                e.EventId == zoomEventId);
                }

                if (existingEvent != null &&
                    existingEvent.IsProcessed)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message =
                            "Duplicate Zoom event already processed."
                    });
                }

                // =====================================================
                // CREATE / UPDATE MEETING EVENT
                // =====================================================

                MeetingEvent meetingEvent;

                if (existingEvent != null)
                {
                    meetingEvent = existingEvent;

                    meetingEvent.LiveClassId =
                        liveClass.LiveClassId;

                    meetingEvent.StudentId =
                        student.StudentId;

                    meetingEvent.ParticipantEmail =
                        participantEmail;

                    meetingEvent.ParticipantName =
                        participantName;

                    meetingEvent.ParticipantId =
                        participantId;

                    meetingEvent.EventTime =
                        eventTime;

                    meetingEvent.EventType =
                        eventType.Value;

                    meetingEvent.MeetingId =
                        zoomMeetingId;

                    meetingEvent.IsProcessed =
                        false;
                }
                else
                {
                    meetingEvent =
                        new MeetingEvent
                        {
                            LiveClassId =
                                liveClass.LiveClassId,

                            StudentId =
                                student.StudentId,

                            EventId =
                                        eventIdForDatabase,

                            MeetingId =
                                zoomMeetingId,

                            ParticipantId =
                                participantId,

                            ParticipantEmail =
                                participantEmail,

                            ParticipantName =
                                participantName,

                            EventType =
                                eventType.Value,

                            EventTime =
                                eventTime,

                            IsProcessed =
                                false
                        };

                    await _context.MeetingEvents
                        .AddAsync(meetingEvent);

                    await _context.SaveChangesAsync();
                }

                // =====================================================
                // PROCESS ATTENDANCE
                // =====================================================

                _logger.LogInformation(
                    "Sending Zoom attendance event to AttendanceProcessor. " +
                    "EventType={EventType}, LiveClassId={LiveClassId}, " +
                    "StudentId={StudentId}, ParticipantId={ParticipantId}, " +
                    "EventTime={EventTime}, ClassStatus={ClassStatus}",
                    eventType.Value,
                    liveClass.LiveClassId,
                    student.StudentId,
                    participantId,
                    eventTime,
                    liveClass.Status);

                if (eventType == MeetingEventType.Joined)
                {
                    await _attendanceProcessor
                        .ProcessParticipantJoinedAsync(
                            meetingEvent);
                }
                else if (eventType == MeetingEventType.Left)
                {
                    await _attendanceProcessor
                        .ProcessParticipantLeftAsync(
                            meetingEvent);
                }

                _logger.LogInformation(
                    "Zoom attendance event successfully processed by AttendanceProcessor. " +
                    "EventType={EventType}, LiveClassId={LiveClassId}, StudentId={StudentId}",
                    eventType.Value,
                    liveClass.LiveClassId,
                    student.StudentId);

                // =====================================================
                // MARK PROCESSED ONLY AFTER SUCCESS
                // =====================================================

                meetingEvent.IsProcessed = true;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Success = true,
                    Message =
                        "Zoom webhook processed successfully.",
                    StudentId =
                        student.StudentId,
                    AttendanceId =
                        attendance.AttendanceId,
                    EventType =
                        eventType.ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error processing Zoom webhook.");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        Success = false,
                        Message =
                            "Error processing Zoom webhook.",
                        Error =
                            ex.Message
                    });
            }
        }

        // =========================================================
        // NORMALIZE MEETING ID
        // =========================================================

        private static string? NormalizeMeetingId(
            string? meetingId)
        {
            if (string.IsNullOrWhiteSpace(meetingId))
            {
                return null;
            }

            var digits =
                new string(
                    meetingId
                        .Where(char.IsDigit)
                        .ToArray());

            return string.IsNullOrWhiteSpace(digits)
                ? null
                : digits;
        }

        // =========================================================
        // NORMALIZE NAME
        // =========================================================

        private static string NormalizeName(
            string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return string.Empty;
            }

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
        // UTC
        // =========================================================

        private static DateTime NormalizeUtc(
            DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }

            if (value.Kind == DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }

            return DateTime.SpecifyKind(
                value,
                DateTimeKind.Utc);
        }
    }
}