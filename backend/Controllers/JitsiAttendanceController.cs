using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/jitsi-attendance")]
    [Authorize(Roles = "Student")]
    public class JitsiAttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAttendanceService _attendanceService;
        private readonly IAttendanceProcessor _attendanceProcessor;

        public JitsiAttendanceController(
            ApplicationDbContext context,
            IAttendanceService attendanceService,
            IAttendanceProcessor attendanceProcessor)
        {
            _context = context;
            _attendanceService = attendanceService;
            _attendanceProcessor = attendanceProcessor;
        }

        // =========================================================
        // STUDENT JOINED JITSI
        // =========================================================

        [HttpPost("join")]
        public async Task<IActionResult> StudentJoined(
            [FromBody] JitsiParticipantEventDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        message = "Request body is required."
                    });
                }

                if (request.LiveClassId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid LiveClassId is required."
                    });
                }

                if (string.IsNullOrWhiteSpace(request.ParticipantId))
                {
                    return BadRequest(new
                    {
                        message = "ParticipantId is required."
                    });
                }

                // -----------------------------------------------------
                // Resolve logged-in StudentId
                // -----------------------------------------------------

                var studentIdClaim =
                    User.FindFirst("StudentId")?.Value;

                if (!int.TryParse(
                        studentIdClaim,
                        out var studentId) ||
                    studentId <= 0)
                {
                    return Unauthorized(new
                    {
                        message =
                            "StudentId was not found in the login token."
                    });
                }

                // -----------------------------------------------------
                // Organization
                // -----------------------------------------------------

                var organizationClaim =
                    User.FindFirst("OrganizationId")?.Value;

                if (!int.TryParse(
                        organizationClaim,
                        out var organizationId) ||
                    organizationId <= 0)
                {
                    return Unauthorized(new
                    {
                        message =
                            "OrganizationId was not found in the login token."
                    });
                }

                // -----------------------------------------------------
                // Validate Student
                // -----------------------------------------------------

                var student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.StudentId == studentId &&
                            s.OrganizationId == organizationId &&
                            s.Status == "Active");

                if (student == null)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Student was not found in your organization."
                    });
                }

                // -----------------------------------------------------
                // Validate Live Class
                // -----------------------------------------------------

                var liveClass =
                    await _context.LiveClasses
                        .Include(x => x.Batch)
                        .FirstOrDefaultAsync(x =>
                            x.LiveClassId ==
                                request.LiveClassId &&
                            x.Batch.OrganizationId ==
                                organizationId);

                if (liveClass == null)
                {
                    return NotFound(new
                    {
                        message = "Live class not found."
                    });
                }

                // -----------------------------------------------------
                // Must be Jitsi
                // -----------------------------------------------------

                if (!string.Equals(
                        liveClass.MeetingPlatform,
                        "Jitsi",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message =
                            "This live class is not configured for Jitsi."
                    });
                }

                // -----------------------------------------------------
                // Class must be Live
                // -----------------------------------------------------

                if (!string.Equals(
                        liveClass.Status,
                        "Live",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message =
                            "Live class is not currently live."
                    });
                }

                // -----------------------------------------------------
                // Student must belong to the class batch
                // -----------------------------------------------------

                if (student.BatchId != liveClass.BatchId)
                {
                    return Forbid();
                }

                // -----------------------------------------------------
                // Validate MeetingId
                // -----------------------------------------------------

                if (string.IsNullOrWhiteSpace(
                        liveClass.MeetingId))
                {
                    return BadRequest(new
                    {
                        message =
                            "Jitsi meeting ID is not available."
                    });
                }

                // -----------------------------------------------------
                // Prevent duplicate event
                // -----------------------------------------------------

                var eventId =
                    string.IsNullOrWhiteSpace(request.EventId)
                        ? $"jitsi-join-{liveClass.LiveClassId}-" +
                          $"{studentId}-" +
                          $"{Guid.NewGuid():N}"
                        : request.EventId.Trim();

                var existingEvent =
                    await _context
                        .Set<MeetingEvent>()
                        .AnyAsync(x =>
                            x.EventId == eventId);

                if (existingEvent)
                {
                    return Ok(new
                    {
                        message =
                            "Jitsi join event already processed.",
                        liveClassId =
                            liveClass.LiveClassId,
                        studentId,
                        participantId =
                            request.ParticipantId
                    });
                }

                // -----------------------------------------------------
                // Create provisional application session
                //
                // This is important because the existing attendance
                // architecture expects the authenticated student
                // join to create an initial session.
                // -----------------------------------------------------

                await _attendanceService
                    .MarkStudentJoinedAsync(
                        liveClass.LiveClassId);

                // -----------------------------------------------------
                // Create MeetingEvent
                // -----------------------------------------------------

                var meetingEvent =
                    new MeetingEvent
                    {
                        LiveClassId =
                            liveClass.LiveClassId,

                        StudentId =
                            student.StudentId,

                        EventId =
                            eventId,

                        MeetingId =
                            liveClass.MeetingId,

                        ParticipantId =
                            request.ParticipantId.Trim(),

                        ParticipantEmail =
                            request.ParticipantEmail?.Trim()
                            ?? student.Email
                            ?? string.Empty,

                        ParticipantName =
                            request.ParticipantName?.Trim()
                            ?? $"{student.FirstName} {student.LastName}"
                                .Trim(),

                        EventType =
                            MeetingEventType.Joined,

                        EventTime =
                            DateTime.UtcNow,

                        IsProcessed =
                            false
                    };

                await _context
                    .Set<MeetingEvent>()
                    .AddAsync(meetingEvent);

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    $"[JITSI ATTENDANCE] JOIN event created. " +
                    $"LiveClassId={liveClass.LiveClassId}, " +
                    $"StudentId={student.StudentId}, " +
                    $"ParticipantId={meetingEvent.ParticipantId}");

                // -----------------------------------------------------
                // Process attendance immediately
                // -----------------------------------------------------

                await _attendanceProcessor
                    .ProcessParticipantJoinedAsync(
                        meetingEvent);

                // -----------------------------------------------------
                // Mark event processed
                // -----------------------------------------------------

                meetingEvent.IsProcessed = true;

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    $"[JITSI ATTENDANCE] JOIN processed successfully. " +
                    $"LiveClassId={liveClass.LiveClassId}, " +
                    $"StudentId={student.StudentId}");

                return Ok(new
                {
                    success = true,
                    message =
                        "Student Jitsi join attendance recorded.",
                    liveClassId =
                        liveClass.LiveClassId,
                    studentId =
                        student.StudentId,
                    participantId =
                        meetingEvent.ParticipantId,
                    eventTime =
                        meetingEvent.EventTime
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"[JITSI ATTENDANCE] JOIN ERROR: " +
                    $"{ex.Message}");

                if (ex.InnerException != null)
                {
                    Console.WriteLine(
                        $"[JITSI ATTENDANCE] INNER ERROR: " +
                        $"{ex.InnerException.Message}");
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message =
                            "Failed to record Jitsi join attendance.",
                        error = ex.Message
                    });
            }
        }

        // =========================================================
        // STUDENT LEFT JITSI
        // =========================================================

        [HttpPost("leave")]
        public async Task<IActionResult> StudentLeft(
            [FromBody] JitsiParticipantEventDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        message = "Request body is required."
                    });
                }

                if (request.LiveClassId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid LiveClassId is required."
                    });
                }

                if (string.IsNullOrWhiteSpace(request.ParticipantId))
                {
                    return BadRequest(new
                    {
                        message = "ParticipantId is required."
                    });
                }

                // -----------------------------------------------------
                // Resolve StudentId
                // -----------------------------------------------------

                var studentIdClaim =
                    User.FindFirst("StudentId")?.Value;

                if (!int.TryParse(
                        studentIdClaim,
                        out var studentId) ||
                    studentId <= 0)
                {
                    return Unauthorized(new
                    {
                        message =
                            "StudentId was not found in the login token."
                    });
                }

                // -----------------------------------------------------
                // Organization
                // -----------------------------------------------------

                var organizationClaim =
                    User.FindFirst("OrganizationId")?.Value;

                if (!int.TryParse(
                        organizationClaim,
                        out var organizationId) ||
                    organizationId <= 0)
                {
                    return Unauthorized(new
                    {
                        message =
                            "OrganizationId was not found in the login token."
                    });
                }

                // -----------------------------------------------------
                // Validate Student
                // -----------------------------------------------------

                var student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.StudentId == studentId &&
                            s.OrganizationId == organizationId &&
                            s.Status == "Active");

                if (student == null)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Student was not found in your organization."
                    });
                }

                // -----------------------------------------------------
                // Validate Live Class
                // -----------------------------------------------------

                var liveClass =
                    await _context.LiveClasses
                        .Include(x => x.Batch)
                        .FirstOrDefaultAsync(x =>
                            x.LiveClassId ==
                                request.LiveClassId &&
                            x.Batch.OrganizationId ==
                                organizationId);

                if (liveClass == null)
                {
                    return NotFound(new
                    {
                        message = "Live class not found."
                    });
                }

                // -----------------------------------------------------
                // Must be Jitsi
                // -----------------------------------------------------

                if (!string.Equals(
                        liveClass.MeetingPlatform,
                        "Jitsi",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message =
                            "This live class is not configured for Jitsi."
                    });
                }

                // -----------------------------------------------------
                // Student must belong to batch
                // -----------------------------------------------------

                if (student.BatchId != liveClass.BatchId)
                {
                    return Forbid();
                }

                // -----------------------------------------------------
                // Create unique leave event
                // -----------------------------------------------------

                var eventId =
                    string.IsNullOrWhiteSpace(request.EventId)
                        ? $"jitsi-leave-{liveClass.LiveClassId}-" +
                          $"{studentId}-" +
                          $"{Guid.NewGuid():N}"
                        : request.EventId.Trim();

                var existingEvent =
                    await _context
                        .Set<MeetingEvent>()
                        .AnyAsync(x =>
                            x.EventId == eventId);

                if (existingEvent)
                {
                    return Ok(new
                    {
                        message =
                            "Jitsi leave event already processed.",
                        liveClassId =
                            liveClass.LiveClassId,
                        studentId,
                        participantId =
                            request.ParticipantId
                    });
                }

                // -----------------------------------------------------
                // Create MeetingEvent
                // -----------------------------------------------------

                var meetingEvent =
                    new MeetingEvent
                    {
                        LiveClassId =
                            liveClass.LiveClassId,

                        StudentId =
                            student.StudentId,

                        EventId =
                            eventId,

                        MeetingId =
    liveClass.MeetingId
    ?? string.Empty,

                        ParticipantId =
                            request.ParticipantId.Trim(),

                        ParticipantEmail =
                            request.ParticipantEmail?.Trim()
                            ?? student.Email
                            ?? string.Empty,

                        ParticipantName =
                            request.ParticipantName?.Trim()
                            ?? $"{student.FirstName} {student.LastName}"
                                .Trim(),

                        EventType =
                            MeetingEventType.Left,

                        EventTime =
                            DateTime.UtcNow,

                        IsProcessed =
                            false
                    };

                await _context
                    .Set<MeetingEvent>()
                    .AddAsync(meetingEvent);

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    $"[JITSI ATTENDANCE] LEAVE event created. " +
                    $"LiveClassId={liveClass.LiveClassId}, " +
                    $"StudentId={student.StudentId}, " +
                    $"ParticipantId={meetingEvent.ParticipantId}");

                // -----------------------------------------------------
                // Process attendance
                // -----------------------------------------------------

                await _attendanceProcessor
                    .ProcessParticipantLeftAsync(
                        meetingEvent);

                // -----------------------------------------------------
                // Mark processed
                // -----------------------------------------------------

                meetingEvent.IsProcessed = true;

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    $"[JITSI ATTENDANCE] LEAVE processed successfully. " +
                    $"LiveClassId={liveClass.LiveClassId}, " +
                    $"StudentId={student.StudentId}");

                return Ok(new
                {
                    success = true,
                    message =
                        "Student Jitsi leave attendance recorded.",
                    liveClassId =
                        liveClass.LiveClassId,
                    studentId =
                        student.StudentId,
                    participantId =
                        meetingEvent.ParticipantId,
                    eventTime =
                        meetingEvent.EventTime
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"[JITSI ATTENDANCE] LEAVE ERROR: " +
                    $"{ex.Message}");

                if (ex.InnerException != null)
                {
                    Console.WriteLine(
                        $"[JITSI ATTENDANCE] INNER ERROR: " +
                        $"{ex.InnerException.Message}");
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message =
                            "Failed to record Jitsi leave attendance.",
                        error = ex.Message
                    });
            }
        }
    }
}