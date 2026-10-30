using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.LiveClass;
using TalentSphereAPI.Models;
using TalentSphereAPI.Providers;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class LiveClassService : ILiveClassService
    {
        private readonly IMeetingProviderFactory _meetingProviderFactory;
        private readonly ApplicationDbContext _context;
        private readonly IAttendanceService _attendanceService;
        private readonly INotificationService _notificationService;
        private readonly IAttendanceProcessor _attendanceProcessor;
        public LiveClassService(
    ApplicationDbContext context,
    IAttendanceService attendanceService,
    INotificationService notificationService,
    IMeetingProviderFactory meetingProviderFactory,
    IAttendanceProcessor attendanceProcessor)
        {
            _context = context;
            _attendanceService = attendanceService;
            _notificationService = notificationService;
            _meetingProviderFactory = meetingProviderFactory;
            _attendanceProcessor = attendanceProcessor;
        }
        // =========================================================
        // GET ALL
        // =========================================================

        public async Task<(
            IEnumerable<LiveClassResponseDto> Classes,
            int TotalCount)>
            GetAllAsync(LiveClassQueryParameters query)
        {
            var liveClasses = _context.LiveClasses
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                liveClasses = liveClasses.Where(x =>
                    x.ClassTitle.Contains(query.Search));
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                liveClasses = liveClasses.Where(x =>
                    x.Status == query.Status);
            }

            if (query.Date.HasValue)
            {
                liveClasses = liveClasses.Where(x =>
                    x.ScheduledDate.Date ==
                    query.Date.Value.Date);
            }

            liveClasses = query.Descending
                ? liveClasses.OrderByDescending(
                    x => x.ScheduledDate)
                : liveClasses.OrderBy(
                    x => x.ScheduledDate);

            var totalCount =
                await liveClasses.CountAsync();

            var items =
                await liveClasses
                    .Skip((query.Page - 1) * query.PageSize)
                    .Take(query.PageSize)
                    .Select(x => new LiveClassResponseDto
                    {
                        LiveClassId = x.LiveClassId,

                        ClassTitle = x.ClassTitle,

                        Description = x.Description,

                        CourseId = x.CourseId,

                        CourseName =
                            x.Course!.CourseName,

                        BatchId = x.BatchId,

                        BatchName =
                            x.Batch!.BatchName,

                        MentorId = x.MentorId,

                        MentorName =
                            x.Mentor!.FirstName +
                            " " +
                            x.Mentor.LastName,

                        ScheduledDate =
                            x.ScheduledDate,

                        StartTime =
                            x.StartTime,

                        EndTime =
                            x.EndTime,

                        MeetingPlatform =
                            x.MeetingPlatform,

                        MeetingLink =
                            x.MeetingLink,

                        RecordingEnabled =
                            x.RecordingEnabled,

                        Status =
                            x.Status,

                        AttendanceCount =
    x.Attendances.Count(a =>
        a.FirstJoinTime.HasValue)
                    })
                    .ToListAsync();

            return (items, totalCount);
        }

        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<LiveClassResponseDto?>
            GetByIdAsync(int id)
        {
            return await _context.LiveClasses
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .Include(x => x.Attendances)
                .Where(x => x.LiveClassId == id)
                .Select(x => new LiveClassResponseDto
                {
                    LiveClassId = x.LiveClassId,

                    ClassTitle = x.ClassTitle,

                    Description = x.Description,

                    CourseId = x.CourseId,

                    CourseName =
                        x.Course.CourseName,

                    BatchId = x.BatchId,

                    BatchName =
                        x.Batch.BatchName,

                    MentorId = x.MentorId,

                    MentorName =
                        x.Mentor.FirstName +
                        " " +
                        x.Mentor.LastName,

                    ScheduledDate =
                        x.ScheduledDate,

                    StartTime =
                        x.StartTime,

                    EndTime =
                        x.EndTime,

                    MeetingPlatform =
                        x.MeetingPlatform,

                    MeetingLink =
                        x.MeetingLink,

                    RecordingEnabled =
                        x.RecordingEnabled,

                    Status =
                        x.Status,
                    AttendanceCount =
    x.Attendances.Count(a =>
        a.FirstJoinTime.HasValue)
                })
                .FirstOrDefaultAsync();
        }

        // =========================================================
        // CREATE LIVE CLASS
        // =========================================================

        public async Task<LiveClassResponseDto>
            CreateAsync(CreateLiveClassDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.ClassTitle))
                throw new ArgumentException("Class title is required.", nameof(dto));

            if (dto.CourseId <= 0)
                throw new ArgumentException("A valid courseId is required.", nameof(dto));

            if (dto.BatchId <= 0)
                throw new ArgumentException("A valid batchId is required.", nameof(dto));

            if (dto.ModuleId <= 0)
                throw new ArgumentException("A valid moduleId is required.", nameof(dto));

            if (dto.EndTime <= dto.StartTime)
                throw new ArgumentException("End Time must be greater than Start Time.", nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.MeetingPlatform))
                throw new ArgumentException("Meeting platform is required.", nameof(dto));

            var platform = dto.MeetingPlatform.Trim();

            // Zoom meetings are created manually in Zoom, so a join link is required.
            if (platform.Equals("Zoom", StringComparison.OrdinalIgnoreCase) &&
                string.IsNullOrWhiteSpace(dto.MeetingLink))
            {
                throw new ArgumentException("Zoom meeting link is required.", nameof(dto));
            }

            // Load the course explicitly. Do not depend on a navigation property
            // being populated by EF Core.
            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CourseId == dto.CourseId);

            if (course == null)
                throw new KeyNotFoundException($"Course {dto.CourseId} was not found.");

            var batch = await _context.Batches
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BatchId == dto.BatchId);

            if (batch == null)
                throw new KeyNotFoundException($"Batch {dto.BatchId} was not found.");

            if (batch.CourseId != course.CourseId)
            {
                throw new ArgumentException(
                    "The selected batch does not belong to the selected course.");
            }

            if (batch.OrganizationId != course.OrganizationId)
            {
                throw new ArgumentException(
                    "The selected batch and course belong to different organizations.");
            }

            if (batch.MentorId <= 0)
                throw new ArgumentException("The selected batch does not have a valid mentor.");

            var module = await _context.CourseModules
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.ModuleId == dto.ModuleId);

            if (module == null)
                throw new KeyNotFoundException($"Module {dto.ModuleId} was not found.");

            if (module.CourseId != course.CourseId)
            {
                throw new ArgumentException(
                    "The selected module does not belong to the selected course.");
            }

            var completion = await _context.BatchModuleCompletions
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BatchId == dto.BatchId &&
                    x.CourseId == dto.CourseId &&
                    x.ModuleId == dto.ModuleId);

            if (completion?.IsCompleted == true)
            {
                throw new ArgumentException(
                    "This module is already completed for the selected batch and cannot be scheduled again.");
            }

            var scheduledDate = dto.ScheduledDate.Date;

            // Prevent overlapping classes for the assigned mentor.
            var mentorOverlap = await _context.LiveClasses.AnyAsync(x =>
                x.MentorId == batch.MentorId &&
                x.ScheduledDate.Date == scheduledDate &&
                x.Status != "Cancelled" &&
                dto.StartTime < x.EndTime &&
                dto.EndTime > x.StartTime);

            if (mentorOverlap)
                throw new InvalidOperationException("Mentor already has a class during this time.");

            // Prevent overlapping classes for the same batch.
            var batchOverlap = await _context.LiveClasses.AnyAsync(x =>
                x.BatchId == dto.BatchId &&
                x.ScheduledDate.Date == scheduledDate &&
                x.Status != "Cancelled" &&
                dto.StartTime < x.EndTime &&
                dto.EndTime > x.StartTime);

            if (batchOverlap)
                throw new InvalidOperationException("Batch already has a class during this time.");

            var entity = new LiveClass
            {
                ClassTitle = dto.ClassTitle.Trim(),
                Description = dto.Description?.Trim(),
                CourseId = course.CourseId,
                BatchId = batch.BatchId,

                // Required mapping: persist the selected module.
                ModuleId = module.ModuleId,

                // The batch is the source of truth for mentor assignment.
                MentorId = batch.MentorId,

                // Keep the date and time-of-day separate; do not apply a UTC
                // conversion to TimeSpan values.
                ScheduledDate = scheduledDate,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,

                MeetingPlatform = platform,
                MeetingLink = string.IsNullOrWhiteSpace(dto.MeetingLink)
                    ? null
                    : dto.MeetingLink.Trim(),
                MeetingPassword = string.IsNullOrWhiteSpace(dto.MeetingPassword)
                    ? null
                    : dto.MeetingPassword.Trim(),
                MeetingId = platform.Equals("Zoom", StringComparison.OrdinalIgnoreCase)
                    ? ExtractZoomMeetingId(dto.MeetingLink)
                    : null,
                RecordingEnabled = dto.RecordingEnabled,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow
            };

            _context.LiveClasses.Add(entity);
            await _context.SaveChangesAsync();

            // Generate the Jitsi meeting after the class has an ID.
            if (platform.Equals("Jitsi", StringComparison.OrdinalIgnoreCase))
            {
                var jitsiProvider = _meetingProviderFactory.GetProvider("Jitsi");
                if (jitsiProvider == null)
                {
                    throw new InvalidOperationException(
                        "Jitsi meeting provider is not registered.");
                }

                var meeting = await jitsiProvider.CreateMeetingAsync(entity);
                if (meeting == null)
                {
                    throw new InvalidOperationException(
                        "Jitsi provider returned no meeting details.");
                }

                if (string.IsNullOrWhiteSpace(meeting.JoinUrl))
                {
                    throw new InvalidOperationException(
                        "Jitsi provider did not return a meeting join URL.");
                }

                entity.MeetingId = meeting.MeetingId;
                entity.MeetingLink = meeting.JoinUrl;
                entity.HostLink = meeting.HostUrl;
                entity.MeetingPassword = meeting.MeetingPassword;

                await _context.SaveChangesAsync();
            }

            await _attendanceService.CreateAttendanceForLiveClassAsync(entity.LiveClassId);

            var studentIds = await _context.Students
                .Where(s => s.BatchId == entity.BatchId)
                .Select(s => s.StudentId)
                .ToListAsync();

            await _notificationService.NotifyClassScheduledAsync(
                entity.MentorId,
                entity.BatchId,
                entity.LiveClassId,
                entity.ClassTitle,
                entity.ScheduledDate,
                entity.StartTime,
                studentIds);

            var response = await GetByIdAsync(entity.LiveClassId);
            return response ?? throw new InvalidOperationException(
                $"Live class {entity.LiveClassId} was created but could not be retrieved.");
        }

        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<bool> UpdateAsync(
            int id,
            UpdateLiveClassDto dto)
        {
            var entity =
                await _context.LiveClasses
                    .FindAsync(id);

            if (entity == null)
                return false;

            // -----------------------------------------------------
            // Status validation
            // -----------------------------------------------------

            if (entity.Status == "Completed")
            {
                throw new Exception(
                    "Completed live classes cannot be updated.");
            }

            if (entity.Status == "Cancelled")
            {
                throw new Exception(
                    "Cancelled live classes cannot be updated.");
            }

            if (entity.Status == "Live")
            {
                throw new Exception(
                    "A live class cannot be updated while it is live.");
            }

            // -----------------------------------------------------
            // Time validation
            // -----------------------------------------------------

            if (dto.EndTime <= dto.StartTime)
            {
                throw new Exception(
                    "End Time must be greater than Start Time.");
            }

            // -----------------------------------------------------
            // Validate meeting platform
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(dto.MeetingPlatform))
            {
                throw new Exception(
                    "Meeting platform is required.");
            }

            // -----------------------------------------------------
            // Manual Zoom validation
            // -----------------------------------------------------

            if (dto.MeetingPlatform.Equals(
                    "Zoom",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(dto.MeetingLink))
                {
                    throw new Exception(
                        "Zoom meeting link is required.");
                }
            }

            // -----------------------------------------------------
            // Validate batch
            // -----------------------------------------------------

            var batch =
                await _context.Batches
                    .FirstOrDefaultAsync(
                        b => b.BatchId == dto.BatchId);

            if (batch == null)
            {
                throw new Exception(
                    "Batch not found.");
            }

            if (batch.MentorId <= 0)
            {
                throw new Exception(
                    "The selected batch does not have a valid mentor.");
            }

            // -----------------------------------------------------
            // Validate course
            // -----------------------------------------------------
            var course = await _context.Courses
                .FirstOrDefaultAsync(c =>
                    c.CourseId == dto.CourseId &&
                    c.OrganizationId == batch.OrganizationId);

            if (course == null)
                throw new ArgumentException(
                    "Course not found in the selected organization.");

            var moduleExists = await _context.CourseModules
                .AnyAsync(m =>
                    m.ModuleId == dto.ModuleId &&
                    m.CourseId == dto.CourseId);

            if (!moduleExists)
                throw new ArgumentException(
                    "The selected module does not belong to this course.");

            var completion = await _context.BatchModuleCompletions
                .FirstOrDefaultAsync(x =>
                    x.BatchId == dto.BatchId &&
                    x.CourseId == dto.CourseId &&
                    x.ModuleId == dto.ModuleId);

            if (completion?.IsCompleted == true)
            {
                throw new ArgumentException(
                    "This module is already completed for the selected batch and cannot be scheduled again.");
            }

            // -----------------------------------------------------
            // Prevent changing meeting platform
            // -----------------------------------------------------

            if (!string.Equals(
                    entity.MeetingPlatform,
                    dto.MeetingPlatform,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    "Meeting platform cannot be changed after the live class is created.");
            }

            // -----------------------------------------------------
            // Mentor overlap
            // -----------------------------------------------------

            var mentorOverlap =
                await _context.LiveClasses.AnyAsync(x =>
                    x.LiveClassId != id &&
                    x.MentorId == batch.MentorId &&
                    x.ScheduledDate.Date ==
                        dto.ScheduledDate.Date &&
                    x.Status != "Cancelled" &&
                    dto.StartTime < x.EndTime &&
                    dto.EndTime > x.StartTime);

            if (mentorOverlap)
            {
                throw new Exception(
                    "Mentor already has a class during this time.");
            }

            // -----------------------------------------------------
            // Batch overlap
            // -----------------------------------------------------

            var batchOverlap =
                await _context.LiveClasses.AnyAsync(x =>
                    x.LiveClassId != id &&
                    x.BatchId == dto.BatchId &&
                    x.ScheduledDate.Date ==
                        dto.ScheduledDate.Date &&
                    x.Status != "Cancelled" &&
                    dto.StartTime < x.EndTime &&
                    dto.EndTime > x.StartTime);

            if (batchOverlap)
            {
                throw new Exception(
                    "Batch already has a class during this time.");
            }

            // -----------------------------------------------------
            // Update entity values
            // -----------------------------------------------------

            entity.ClassTitle =
                dto.ClassTitle.Trim();

            entity.Description =
                dto.Description?.Trim();

            entity.CourseId =
                dto.CourseId;

            entity.BatchId =
                dto.BatchId;

            entity.ModuleId =
                dto.ModuleId;

            entity.MentorId =
                batch.MentorId;

            entity.ScheduledDate =
                dto.ScheduledDate.Date;

            entity.StartTime =
                dto.StartTime;

            entity.EndTime =
                dto.EndTime;

            entity.MeetingPlatform =
                dto.MeetingPlatform.Trim();

            // Manual Zoom details
            entity.MeetingLink =
                dto.MeetingLink?.Trim();

            entity.MeetingPassword =
                dto.MeetingPassword?.Trim();

            entity.RecordingEnabled =
                dto.RecordingEnabled;

            entity.UpdatedAt =
                DateTime.UtcNow;

            // -----------------------------------------------------
            // IMPORTANT
            // -----------------------------------------------------
            // We do NOT call Zoom UpdateMeetingAsync here.
            //
            // This is a manually-created Zoom meeting.
            // We only update the stored meeting details.
            // -----------------------------------------------------

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Notify students
            // -----------------------------------------------------

            var studentIds =
                await _context.Students
                    .Where(s =>
                        s.BatchId ==
                        entity.BatchId)
                    .Select(s =>
                        s.StudentId)
                    .ToListAsync();

            await _notificationService
                .NotifyClassUpdatedAsync(
                    entity.MentorId,
                    entity.BatchId,
                    entity.LiveClassId,
                    entity.ClassTitle,
                    studentIds);

            return true;
        }

        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(int id)
        {
            var entity =
                await _context.LiveClasses
                    .FindAsync(id);

            if (entity == null)
                return false;

            if (entity.Status == "Live")
            {
                throw new Exception(
                    "A live class cannot be deleted while it is live.");
            }

            // -----------------------------------------------------
            // Manual Zoom
            // -----------------------------------------------------
            // Do NOT call Zoom DeleteMeetingAsync.
            // The meeting was created manually in Zoom.
            // -----------------------------------------------------

            // -----------------------------------------------------
            // Delete database record
            // -----------------------------------------------------

            _context.LiveClasses.Remove(entity);

            await _context.SaveChangesAsync();

            return true;
        }

        // =========================================================
        // START CLASS
        // =========================================================

        public async Task<bool> StartClassAsync(int id)
        {
            var entity =
                await _context.LiveClasses
                    .FindAsync(id);

            if (entity == null)
                return false;

            if (entity.Status == "Cancelled")
            {
                throw new Exception(
                    "Cancelled classes cannot be started.");
            }

            if (entity.Status == "Completed")
            {
                throw new Exception(
                    "Completed classes cannot be started again.");
            }

            if (string.IsNullOrWhiteSpace(entity.MeetingLink))
            {
                throw new Exception(
                    "Meeting link is not available.");
            }

            await _attendanceService
    .CreateAttendanceForLiveClassAsync(id);


            entity.Status =
                "Live";

            entity.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Get students
            // -----------------------------------------------------

            var studentIds =
                await _context.Students
                    .Where(s =>
                        s.BatchId ==
                        entity.BatchId)
                    .Select(s =>
                        s.StudentId)
                    .ToListAsync();

            // -----------------------------------------------------
            // Notify
            // -----------------------------------------------------

            await _notificationService
                .NotifyClassStartedAsync(
                    entity.MentorId,
                    entity.BatchId,
                    entity.LiveClassId,
                    entity.ClassTitle,
                    studentIds);

            return true;
        }



        // =========================================================
        // END CLASS
        // =========================================================

        public async Task<bool> EndClassAsync(
            int id,
            DateTime? endedAtUtc = null)
        {
            var entity =
                await _context.LiveClasses
                    .FindAsync(id);

            if (entity == null)
                return false;

            if (entity.Status == "Cancelled")
            {
                throw new Exception(
                    "Cancelled classes cannot be completed.");
            }

            // =========================================================
            // CLASS ALREADY COMPLETED
            // =========================================================

            if (entity.Status == "Completed")
            {
                Console.WriteLine(
                    $"[LIVE CLASS] Class already completed. " +
                    $"LiveClassId={entity.LiveClassId}");

                // Zoom synchronization is BEST EFFORT.
                //
                // IMPORTANT:
                // Do not allow a Zoom API failure to make the
                // End Class API return HTTP 500.
                if (!string.IsNullOrWhiteSpace(entity.MeetingPlatform))
                {
                    try
                    {
                        var provider =
                            _meetingProviderFactory.GetProvider(
                                entity.MeetingPlatform);

                        await provider.SyncAttendanceAsync(entity);

                        Console.WriteLine(
                            $"[LIVE CLASS] Zoom attendance synchronization completed. " +
                            $"LiveClassId={entity.LiveClassId}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(
                            $"[LIVE CLASS] WARNING: Zoom attendance synchronization failed " +
                            $"for already completed LiveClassId={entity.LiveClassId}. " +
                            $"Attendance will rely on webhook/session data. " +
                            $"Error={ex.Message}");
                    }
                }

                // Re-run finalization so late Zoom webhook data can
                // reconcile attendance.
                await _attendanceProcessor.FinalizeMeetingAsync(
                    entity,
                    endedAtUtc);

                return true;
            }

            // =========================================================
            // 1. ZOOM SYNCHRONIZATION - BEST EFFORT
            // =========================================================
            //
            // Zoom participant history is useful for repairing:
            //
            //   missed participant_left webhook
            //   delayed webhook
            //   missed participant_joined webhook
            //
            // BUT Zoom synchronization must NOT block the
            // mentor from ending the class.
            // =========================================================

            if (!string.IsNullOrWhiteSpace(entity.MeetingPlatform))
            {
                try
                {
                    var provider =
                        _meetingProviderFactory.GetProvider(
                            entity.MeetingPlatform);

                    Console.WriteLine(
                        $"[LIVE CLASS] Starting provider attendance synchronization. " +
                        $"LiveClassId={entity.LiveClassId}, " +
                        $"Platform={entity.MeetingPlatform}, " +
                        $"MeetingId={entity.MeetingId}");

                    await provider.SyncAttendanceAsync(entity);

                    Console.WriteLine(
                        $"[LIVE CLASS] Provider attendance synchronization completed. " +
                        $"LiveClassId={entity.LiveClassId}");
                }
                catch (Exception ex)
                {
                    // =====================================================
                    // IMPORTANT
                    // =====================================================
                    //
                    // DO NOT throw this exception.
                    //
                    // Zoom API can temporarily fail immediately after a
                    // meeting ends. Webhooks may still arrive afterwards.
                    //
                    // AttendanceProcessor can also recover late webhook
                    // events after the class has been marked Completed.
                    // =====================================================

                    Console.WriteLine(
                        $"[LIVE CLASS] WARNING: Provider attendance synchronization failed. " +
                        $"LiveClassId={entity.LiveClassId}, " +
                        $"MeetingId={entity.MeetingId}, " +
                        $"Error={ex.Message}");

                    if (ex.InnerException != null)
                    {
                        Console.WriteLine(
                            $"[LIVE CLASS] Inner Error: " +
                            $"{ex.InnerException.Message}");
                    }
                }
            }

            // =========================================================
            // 2. FINALIZE ATTENDANCE
            // =========================================================

            Console.WriteLine(
                $"[LIVE CLASS] Finalizing attendance. " +
                $"LiveClassId={entity.LiveClassId}");

            await _attendanceProcessor
                .FinalizeMeetingAsync(
                    entity,
                    endedAtUtc);

            Console.WriteLine(
                $"[LIVE CLASS] Attendance finalized. " +
                $"LiveClassId={entity.LiveClassId}");

            // =========================================================
            // 3. MARK CLASS COMPLETED
            // =========================================================

            entity.Status =
                "Completed";

            entity.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            Console.WriteLine(
                $"[LIVE CLASS] Class marked Completed. " +
                $"LiveClassId={entity.LiveClassId}");

            // =========================================================
            // 4. GET STUDENTS
            // =========================================================

            var studentIds =
                await _context.Students
                    .Where(s =>
                        s.BatchId ==
                        entity.BatchId)
                    .Select(s =>
                        s.StudentId)
                    .ToListAsync();

            // =========================================================
            // 5. NOTIFY STUDENTS
            // =========================================================

            await _notificationService
                .NotifyClassEndedAsync(
                    entity.MentorId,
                    entity.BatchId,
                    entity.LiveClassId,
                    entity.ClassTitle,
                    studentIds);

            Console.WriteLine(
                $"[LIVE CLASS] EndClassAsync completed successfully. " +
                $"LiveClassId={entity.LiveClassId}");

            return true;
        }

        // =========================================================
        // CANCEL CLASS
        // =========================================================

        public async Task<bool> CancelClassAsync(int id)
        {
            var entity =
                await _context.LiveClasses
                    .FindAsync(id);

            if (entity == null)
                return false;

            if (entity.Status == "Completed")
            {
                throw new Exception(
                    "Completed classes cannot be cancelled.");
            }

            if (entity.Status == "Cancelled")
            {
                return true;
            }

            if (entity.Status == "Live")
            {
                throw new Exception(
                    "A live class cannot be cancelled while it is live.");
            }

            // -----------------------------------------------------
            // Manual Zoom
            // -----------------------------------------------------
            // Do NOT delete the Zoom meeting through API.
            // The meeting was created manually.
            // -----------------------------------------------------

            entity.Status =
                "Cancelled";

            entity.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Get students
            // -----------------------------------------------------

            var studentIds =
                await _context.Students
                    .Where(s =>
                        s.BatchId ==
                        entity.BatchId)
                    .Select(s =>
                        s.StudentId)
                    .ToListAsync();

            // -----------------------------------------------------
            // Notify
            // -----------------------------------------------------

            await _notificationService
                .NotifyClassCancelledAsync(
                    entity.MentorId,
                    entity.BatchId,
                    entity.LiveClassId,
                    entity.ClassTitle,
                    studentIds);

            return true;
        }

        // =========================================================
        // TODAY'S CLASSES
        // =========================================================

        public async Task<IEnumerable<LiveClassListDto>>
            GetTodaysClassesAsync()
        {
            var today =
                DateTime.Today;

            return await _context.LiveClasses
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .Include(x => x.Attendances)
                .Where(x =>
                    x.ScheduledDate.Date ==
                    today)
                .OrderBy(x =>
                    x.StartTime)
                .Select(x => new LiveClassListDto
                {
                    LiveClassId =
                        x.LiveClassId,

                    ClassTitle =
                        x.ClassTitle,

                    CourseName =
                        x.Course!.CourseName,

                    BatchName =
                        x.Batch!.BatchName,

                    MentorName =
                        x.Mentor!.FirstName +
                        " " +
                        x.Mentor.LastName,

                    ScheduledDate =
                        x.ScheduledDate,

                    StartTime =
                        x.StartTime,

                    EndTime =
                        x.EndTime,

                    Status =
                        x.Status,

                    AttendanceCount =
    x.Attendances.Count(a =>
        a.FirstJoinTime.HasValue)
                })
                .ToListAsync();
        }

        // =========================================================
        // JOIN LIVE CLASS
        // =========================================================

        public async Task<JoinLiveClassResponseDto>
            JoinLiveClassAsync(int liveClassId)
        {
            var liveClass =
                await _context.LiveClasses
                    .Include(x => x.Course)
                    .Include(x => x.Batch)
                    .Include(x => x.Mentor)
                    .FirstOrDefaultAsync(x =>
                        x.LiveClassId ==
                        liveClassId);

            if (liveClass == null)
            {
                throw new Exception(
                    "Live class not found.");
            }

            // -----------------------------------------------------
            // Class must be live
            // -----------------------------------------------------

            if (liveClass.Status != "Live")
            {
                throw new Exception(
                    "Live class is not currently live.");
            }

            // -----------------------------------------------------
            // Meeting link is required
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                liveClass.MeetingLink))
            {
                throw new Exception(
                    "Meeting link is not available.");
            }

            // -----------------------------------------------------
            // IMPORTANT:
            // Do NOT require MeetingId.
            //
            // Manual Zoom meetings may only have:
            // MeetingLink
            // MeetingPassword
            // -----------------------------------------------------

            return new JoinLiveClassResponseDto
            {
                LiveClassId =
                    liveClass.LiveClassId,

                ClassTitle =
                    liveClass.ClassTitle,

                MeetingPlatform =
                    liveClass.MeetingPlatform,

                MeetingUrl =
                    liveClass.MeetingLink,

                MeetingId =
                    liveClass.MeetingId,

                MeetingPassword =
                    liveClass.MeetingPassword,

                ScheduledDate =
                    liveClass.ScheduledDate,

                StartTime =
                    liveClass.StartTime,

                EndTime =
                    liveClass.EndTime,

                Status =
                    liveClass.Status
            };
        }
        private static string? ExtractZoomMeetingId(
    string? meetingLink)
        {
            if (string.IsNullOrWhiteSpace(meetingLink))
                return null;

            if (!Uri.TryCreate(
                    meetingLink.Trim(),
                    UriKind.Absolute,
                    out var uri))
            {
                return null;
            }

            var host =
                uri.Host;

            var isZoomHost =
                host.Equals(
                    "zoom.us",
                    StringComparison.OrdinalIgnoreCase)
                ||
                host.EndsWith(
                    ".zoom.us",
                    StringComparison.OrdinalIgnoreCase);

            if (!isZoomHost)
                return null;

            var segments =
                uri.AbsolutePath
                    .Trim('/')
                    .Split(
                        '/',
                        StringSplitOptions.RemoveEmptyEntries);

            var joinIndex =
                Array.FindIndex(
                    segments,
                    x => x.Equals(
                        "j",
                        StringComparison.OrdinalIgnoreCase));

            if (joinIndex < 0 ||
                joinIndex + 1 >= segments.Length)
            {
                return null;
            }

            var meetingId =
                segments[joinIndex + 1];

            // Remove anything unexpected from the ID.
            meetingId =
                new string(
                    meetingId
                        .Where(char.IsDigit)
                        .ToArray());

            return string.IsNullOrWhiteSpace(meetingId)
                ? null
                : meetingId;
        }
    }
}