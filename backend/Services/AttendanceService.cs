using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AttendanceService(
            IAttendanceRepository attendanceRepository,
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _attendanceRepository = attendanceRepository;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // =========================================================
        // GET ATTENDANCE BY LIVE CLASS
        // =========================================================

        public async Task<List<Attendance>> GetAttendanceByLiveClassAsync(
            int liveClassId)
        {
            var organizationId = GetCurrentOrganizationId();

            var liveClassExists =
                await _context.LiveClasses
                    .Include(x => x.Batch)
                    .AnyAsync(x =>
                        x.LiveClassId == liveClassId &&
                        x.Batch.OrganizationId == organizationId);

            if (!liveClassExists)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Sessions)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Where(a =>
                    a.LiveClassId == liveClassId &&
                    a.Student.OrganizationId == organizationId &&
                    a.LiveClass.Batch.OrganizationId == organizationId)
                .OrderBy(a => a.Student.FirstName)
                .ThenBy(a => a.Student.LastName)
                .ToListAsync();
        }

        // =========================================================
        // GET ATTENDANCE BY STUDENT
        // =========================================================

        public async Task<List<Attendance>> GetAttendanceByStudentAsync(
            int studentId)
        {
            var organizationId = GetCurrentOrganizationId();

            // If this is a Student request, prevent accessing
            // another student's attendance.
            EnsureStudentOwnsRequestedStudent(studentId);

            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Include(a => a.Sessions)
                .Where(a =>
                    a.StudentId == studentId &&
                    a.Student.OrganizationId == organizationId &&
                    a.LiveClass.Batch.OrganizationId == organizationId)
                .OrderByDescending(a => a.LiveClass.ScheduledDate)
                .ThenByDescending(a => a.LiveClass.StartTime)
                .ToListAsync();
        }
        // =========================================================
        // GET STUDENT ATTENDANCE PERCENTAGE
        // =========================================================

        // =========================================================
        // GET STUDENT ATTENDANCE PERCENTAGE
        // =========================================================

        public async Task<AttendancePercentageDto>
            GetStudentAttendancePercentageAsync(
                int studentId)
        {
            // Reuse the secure student attendance method.
            var attendances = await GetAttendanceByStudentAsync(studentId);

            // Only completed classes should contribute to the
            // student's overall attendance percentage.
            //
            // Pending attendance records are normally created when
            // the class is scheduled or started, so they must not
            // count toward the percentage.
            var completedAttendances = attendances
                .Where(a =>
                    a.LiveClass != null &&
                    string.Equals(
                        a.LiveClass.Status,
                        "Completed",
                        StringComparison.OrdinalIgnoreCase) &&
                    a.Status != AttendanceStatus.Pending)
                .ToList();

            var totalClasses = completedAttendances.Count;

            if (totalClasses == 0)
            {
                return new AttendancePercentageDto
                {
                    TotalClasses = 0,
                    Present = 0,
                    Percentage = 0
                };
            }

            var present = completedAttendances.Count(
                a => a.Status == AttendanceStatus.Present);

            // AttendancePercentage is decimal.
            // Use decimal here to avoid CS0266.
            var percentage = Math.Round(
                completedAttendances.Average(
                    a => (decimal)a.AttendancePercentage),
                2);

            return new AttendancePercentageDto
            {
                TotalClasses = totalClasses,
                Present = present,
                Percentage = (double)Math.Round(
         completedAttendances.Average(
             a => (decimal)a.AttendancePercentage),
         2)
            };
        }


        // =========================================================
        // GET STUDENT ATTENDANCE SUMMARY
        // =========================================================

        public async Task<StudentAttendanceSummaryDto>
            GetStudentAttendanceSummaryAsync(
                int studentId)
        {
            // Reuse secure tenant/student validation.
            var attendances = await GetAttendanceByStudentAsync(studentId);

            // Only completed classes should contribute to the
            // student's overall attendance summary.
            var completedAttendances = attendances
                .Where(a =>
                    a.LiveClass != null &&
                    string.Equals(
                        a.LiveClass.Status,
                        "Completed",
                        StringComparison.OrdinalIgnoreCase) &&
                    a.Status != AttendanceStatus.Pending)
                .ToList();

            var averagePercentage = completedAttendances.Any()
                ? Math.Round(
                    completedAttendances.Average(
                        a => (decimal)a.AttendancePercentage),
                    2)
                : 0m;

            return new StudentAttendanceSummaryDto
            {
                TotalClasses = completedAttendances.Count,

                Present = completedAttendances.Count(
                    a => a.Status == AttendanceStatus.Present),

                Late = completedAttendances.Count(
                    a => a.Status == AttendanceStatus.Late),

                Absent = completedAttendances.Count(
                    a => a.Status == AttendanceStatus.Absent),

                AveragePercentage = averagePercentage
            };
        }
        // =========================================================
        // GET ATTENDANCE
        // =========================================================

        public async Task<Attendance?> GetAttendanceAsync(
            int studentId,
            int liveClassId)
        {
            var organizationId = GetCurrentOrganizationId();

            EnsureStudentOwnsRequestedStudent(studentId);

            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Include(a => a.Sessions)
                .FirstOrDefaultAsync(a =>
                    a.StudentId == studentId &&
                    a.LiveClassId == liveClassId &&
                    a.Student.OrganizationId == organizationId &&
                    a.LiveClass.Batch.OrganizationId == organizationId);
        }

        // =========================================================
        // UPDATE ATTENDANCE
        // =========================================================

        public async Task UpdateAttendanceAsync(
            Attendance attendance)
        {
            var organizationId = GetCurrentOrganizationId();

            var existingAttendance =
                await _context.Attendances
                    .Include(a => a.Student)
                    .Include(a => a.LiveClass)
                        .ThenInclude(l => l.Batch)
                    .FirstOrDefaultAsync(a =>
                        a.AttendanceId == attendance.AttendanceId &&
                        a.Student.OrganizationId == organizationId &&
                        a.LiveClass.Batch.OrganizationId == organizationId);

            if (existingAttendance == null)
            {
                throw new KeyNotFoundException(
                    "Attendance not found.");
            }

            // Students must not be able to update attendance.
            if (IsStudent())
            {
                throw new UnauthorizedAccessException(
                    "Students cannot update attendance.");
            }

            // -----------------------------------------------------
            // Update only attendance fields.
            // Never replace StudentId / LiveClassId.
            // -----------------------------------------------------

            existingAttendance.Status =
                attendance.Status;

            existingAttendance.AttendancePercentage =
                Math.Clamp(
                    attendance.AttendancePercentage,
                    0m,
                    100m);

            existingAttendance.FirstJoinTime =
                attendance.FirstJoinTime;

            existingAttendance.LastLeaveTime =
                attendance.LastLeaveTime;

            existingAttendance.TotalDurationMinutes =
                Math.Max(
                    0,
                    attendance.TotalDurationMinutes);

            existingAttendance.IsLate =
                attendance.IsLate;

            existingAttendance.LeftEarly =
                attendance.LeftEarly;

            existingAttendance.IsAutoMarked =
                attendance.IsAutoMarked;

            existingAttendance.IsSynced =
                attendance.IsSynced;

            existingAttendance.LastSyncedAt =
                attendance.LastSyncedAt;

            await _context.SaveChangesAsync();
        }

        // =========================================================
        // ADD ATTENDANCE SESSION
        // =========================================================

        public async Task AddAttendanceSessionAsync(
            AttendanceSession session)
        {
            if (session == null)
            {
                throw new ArgumentNullException(nameof(session));
            }

            if (session.AttendanceId <= 0)
            {
                throw new ArgumentException(
                    "Invalid AttendanceId.");
            }

            // Validate tenant before allowing session creation.
            await GetAttendanceByIdForCurrentOrganizationAsync(
                session.AttendanceId);

            await _attendanceRepository
                .AddSessionAsync(session);

            await _attendanceRepository
                .SaveChangesAsync();
        }

        // =========================================================
        // GET SESSIONS
        // =========================================================

        public async Task<List<AttendanceSession>> GetSessionsAsync(
            int attendanceId)
        {
            // Validate that attendance belongs to current organization.
            await GetAttendanceByIdForCurrentOrganizationAsync(
                attendanceId);

            return await _attendanceRepository
                .GetSessionsAsync(attendanceId);
        }

        // =========================================================
        // SAVE MEETING EVENT
        // =========================================================
        //
        // This method may be used internally by Zoom processing.
        // Do NOT require an HTTP organization claim here because
        // Zoom webhook requests may be anonymous.
        // =========================================================

        public async Task SaveMeetingEventAsync(
            MeetingEvent meetingEvent)
        {
            if (meetingEvent == null)
            {
                throw new ArgumentNullException(nameof(meetingEvent));
            }

            await _attendanceRepository
                .AddMeetingEventAsync(meetingEvent);

            await _attendanceRepository
                .SaveChangesAsync();
        }

        // =========================================================
        // CREATE ATTENDANCE FOR LIVE CLASS
        // =========================================================

        public async Task CreateAttendanceForLiveClassAsync(
            int liveClassId)
        {
            var organizationId = GetCurrentOrganizationId();

            var liveClass =
                await _context.LiveClasses
                    .Include(x => x.Batch)
                    .FirstOrDefaultAsync(x =>
                        x.LiveClassId == liveClassId &&
                        x.Batch.OrganizationId == organizationId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            var batch = liveClass.Batch;

            var students =
                await _context.Students
                    .Where(x =>
                        x.BatchId == batch.BatchId &&
                        x.OrganizationId == organizationId &&
                        x.Status == "Active")
                    .ToListAsync();

            if (!students.Any())
            {
                return;
            }

            var attendances =
                new List<Attendance>();

            foreach (var student in students)
            {
                var exists =
                    await _attendanceRepository
                        .ExistsAsync(
                            student.StudentId,
                            liveClass.LiveClassId);

                if (exists)
                {
                    continue;
                }

                attendances.Add(
                    new Attendance
                    {
                        StudentId =
                            student.StudentId,

                        LiveClassId =
                            liveClass.LiveClassId,

                        Status =
                            AttendanceStatus.Pending,

                        FirstJoinTime =
                            null,

                        LastLeaveTime =
                            null,

                        TotalDurationMinutes =
                            0,

                        AttendancePercentage =
                            0,

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
                    });
            }

            if (attendances.Any())
            {
                await _attendanceRepository
                    .AddRangeAsync(attendances);

                await _attendanceRepository
                    .SaveChangesAsync();
            }
        }

        // =========================================================
        // GET STUDENT ATTENDANCE
        // =========================================================

        public async Task<Attendance?> GetStudentAttendanceAsync(
            int studentId,
            int liveClassId)
        {
            var organizationId = GetCurrentOrganizationId();

            EnsureStudentOwnsRequestedStudent(studentId);

            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Include(a => a.Sessions)
                .FirstOrDefaultAsync(a =>
                    a.StudentId == studentId &&
                    a.LiveClassId == liveClassId &&
                    a.Student.OrganizationId == organizationId &&
                    a.LiveClass.Batch.OrganizationId == organizationId);
        }

        // =========================================================
        // GET MY ATTENDANCE
        // Logged-in Student
        // =========================================================

        public async Task<Attendance?> GetMyAttendanceAsync(
            int liveClassId)
        {
            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "Unable to determine the logged-in user.");
            }

            if (!httpContext.User.IsInRole("Student"))
            {
                throw new UnauthorizedAccessException(
                    "Only students can access this endpoint.");
            }

            var organizationId =
                GetCurrentOrganizationId();

            // -----------------------------------------------------
            // First preference: StudentId claim
            // -----------------------------------------------------

            var studentIdClaim =
                httpContext.User.FindFirst("StudentId")?.Value;

            Student? student = null;

            if (int.TryParse(
                    studentIdClaim,
                    out var studentId) &&
                studentId > 0)
            {
                student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.StudentId == studentId &&
                            s.Status == "Active" &&
                            s.OrganizationId == organizationId);
            }

            // -----------------------------------------------------
            // Fallback to email / name identifier
            // -----------------------------------------------------

            if (student == null)
            {
                var identityValue =
                    httpContext.User.FindFirst(
                        ClaimTypes.Email)?.Value;

                if (string.IsNullOrWhiteSpace(identityValue))
                {
                    identityValue =
                        httpContext.User.FindFirst(
                            ClaimTypes.NameIdentifier)?.Value;
                }

                if (string.IsNullOrWhiteSpace(identityValue))
                {
                    throw new UnauthorizedAccessException(
                        "Student identity was not found in the login token.");
                }

                identityValue =
                    identityValue.Trim();

                student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.Status == "Active" &&
                            s.OrganizationId == organizationId &&
                            (
                                s.Email == identityValue ||
                                s.Phone == identityValue
                            ));
            }

            if (student == null)
            {
                return null;
            }

            // -----------------------------------------------------
            // Verify live class belongs to same organization
            // -----------------------------------------------------

            var liveClass =
                await _context.LiveClasses
                    .Include(l => l.Batch)
                    .FirstOrDefaultAsync(l =>
                        l.LiveClassId == liveClassId &&
                        l.Batch.OrganizationId == organizationId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            // -----------------------------------------------------
            // Verify student belongs to live class batch
            // -----------------------------------------------------

            if (student.BatchId != liveClass.BatchId)
            {
                throw new UnauthorizedAccessException(
                    "The student is not enrolled in this live class batch.");
            }

            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Include(a => a.Sessions)
                .FirstOrDefaultAsync(a =>
                    a.StudentId == student.StudentId &&
                    a.LiveClassId == liveClassId &&
                    a.Student.OrganizationId == organizationId &&
                    a.LiveClass.Batch.OrganizationId == organizationId);
        }

        // =========================================================
        // MARK STUDENT JOINED
        // =========================================================
        //
        // Called when authenticated Student clicks Join.
        //
        // This creates a PROVISIONAL session.
        //
        // Zoom webhook later replaces:
        //
        // app:{studentId}:{guid}
        //
        // with the actual Zoom participant ID.
        //
        // The provisional session is NOT counted as actual
        // Zoom attendance.
        // =========================================================

        public async Task MarkStudentJoinedAsync(
            int liveClassId)
        {
            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "Unable to determine the logged-in user.");
            }

            if (!httpContext.User.IsInRole("Student"))
            {
                throw new UnauthorizedAccessException(
                    "Only students can join a live class.");
            }

            var organizationId =
                GetCurrentOrganizationId();

            // -----------------------------------------------------
            // Resolve StudentId from JWT if available
            // -----------------------------------------------------

            Student? student = null;

            var studentIdClaim =
                httpContext.User.FindFirst("StudentId")?.Value;

            if (int.TryParse(
                    studentIdClaim,
                    out var studentId) &&
                studentId > 0)
            {
                student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.StudentId == studentId &&
                            s.Status == "Active" &&
                            s.OrganizationId == organizationId);
            }

            // -----------------------------------------------------
            // Fallback to Email / NameIdentifier
            // -----------------------------------------------------

            if (student == null)
            {
                var identityValue =
                    httpContext.User.FindFirst(
                        ClaimTypes.Email)?.Value;

                if (string.IsNullOrWhiteSpace(identityValue))
                {
                    identityValue =
                        httpContext.User.FindFirst(
                            ClaimTypes.NameIdentifier)?.Value;
                }

                if (string.IsNullOrWhiteSpace(identityValue))
                {
                    throw new UnauthorizedAccessException(
                        "Student identity was not found in the login token.");
                }

                identityValue =
                    identityValue.Trim();

                student =
                    await _context.Students
                        .FirstOrDefaultAsync(s =>
                            s.Status == "Active" &&
                            s.OrganizationId == organizationId &&
                            (
                                s.Email == identityValue ||
                                s.Phone == identityValue
                            ));
            }

            if (student == null)
            {
                throw new UnauthorizedAccessException(
                    "Student was not found in your organization.");
            }

            // -----------------------------------------------------
            // Find LiveClass WITH Batch
            // -----------------------------------------------------

            var liveClass =
                await _context.LiveClasses
                    .Include(x => x.Batch)
                    .FirstOrDefaultAsync(x =>
                        x.LiveClassId == liveClassId &&
                        x.Batch.OrganizationId == organizationId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            // -----------------------------------------------------
            // Class must be Live
            // -----------------------------------------------------

            if (!string.Equals(
                    liveClass.Status,
                    "Live",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Live class is not currently live.");
            }

            // -----------------------------------------------------
            // Student must belong to this batch
            // -----------------------------------------------------

            if (student.BatchId != liveClass.BatchId)
            {
                throw new UnauthorizedAccessException(
                    "The logged-in student is not enrolled in this live class batch.");
            }

            // -----------------------------------------------------
            // Get Attendance
            // -----------------------------------------------------

            var attendance =
                await _context.Attendances
                    .Include(a => a.Student)
                    .Include(a => a.LiveClass)
                        .ThenInclude(l => l.Batch)
                    .Include(a => a.Sessions)
                    .FirstOrDefaultAsync(a =>
                        a.StudentId == student.StudentId &&
                        a.LiveClassId == liveClassId &&
                        a.Student.OrganizationId == organizationId &&
                        a.LiveClass.Batch.OrganizationId == organizationId);

            // -----------------------------------------------------
            // Defensive attendance creation
            // -----------------------------------------------------

            if (attendance == null)
            {
                attendance =
                    new Attendance
                    {
                        StudentId =
                            student.StudentId,

                        LiveClassId =
                            liveClassId,

                        Status =
                            AttendanceStatus.Pending,

                        AttendancePercentage =
                            0,

                        FirstJoinTime =
                            null,

                        LastLeaveTime =
                            null,

                        TotalDurationMinutes =
                            0,

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
            }

            // -----------------------------------------------------
            // Existing active session?
            // -----------------------------------------------------

            var activeSession =
                await _attendanceRepository
                    .GetActiveSessionAsync(
                        attendance.AttendanceId);

            if (activeSession != null)
            {
                return;
            }

            // -----------------------------------------------------
            // Create provisional session
            // -----------------------------------------------------

            var joinedAt =
                DateTime.UtcNow;

            var provisionalSession =
                new AttendanceSession
                {
                    AttendanceId =
                        attendance.AttendanceId,

                    JoinedAt =
                        joinedAt,

                    LeftAt =
                        null,

                    DurationMinutes =
                        0,

                    MeetingParticipantId =
                        $"app:{student.StudentId}:{Guid.NewGuid():N}",

                    ParticipantEmail =
                        student.Email ??
                        string.Empty,

                    ParticipantName =
                        $"{student.FirstName} {student.LastName}"
                            .Trim(),

                    IsCompleted =
                        false
                };

            await _attendanceRepository
                .AddSessionAsync(
                    provisionalSession);

            // -----------------------------------------------------
            // DO NOT count this as actual Zoom attendance yet.
            // -----------------------------------------------------

            attendance.Status =
                AttendanceStatus.Pending;

            attendance.IsAutoMarked =
                true;

            await _attendanceRepository
                .UpdateAsync(attendance);

            await _attendanceRepository
                .SaveChangesAsync();
        }

        // =========================================================
        // PROCESS MEETING EVENTS
        // =========================================================

        public async Task ProcessMeetingEventsAsync()
        {
            // Intentionally do not mark events as processed here.
            //
            // Zoom webhook processing is responsible for executing
            // attendance logic and marking events processed only
            // after successful processing.

            await Task.CompletedTask;
        }

        // =========================================================
        // LIVE DASHBOARD
        // =========================================================

        public async Task<LiveAttendanceDashboardDto>
            GetLiveDashboardAsync(
                int liveClassId)
        {
            // Tenant validation BEFORE repository access.
            await GetLiveClassForOrganizationAsync(
                liveClassId);

            return await _attendanceRepository
                .GetLiveDashboardAsync(
                    liveClassId);
        }

        // =========================================================
        // ATTENDANCE REPORT
        // =========================================================

        public async Task<AttendanceReportDto>
            GetAttendanceReportAsync(
                int liveClassId)
        {
            // Tenant validation BEFORE repository access.
            await GetLiveClassForOrganizationAsync(
                liveClassId);

            return await _attendanceRepository
                .GetAttendanceReportAsync(
                    liveClassId);
        }

        // =========================================================
        // ORGANIZATION / TENANT SECURITY
        // =========================================================

        private int GetCurrentOrganizationId()
        {
            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "Unable to determine the logged-in user.");
            }

            var organizationClaim =
                httpContext.User.FindFirst(
                    "OrganizationId")?.Value;

            if (!int.TryParse(
                    organizationClaim,
                    out var organizationId) ||
                organizationId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "Organization information was not found in the login token.");
            }

            return organizationId;
        }

        // =========================================================
        // CHECK CURRENT USER ROLE
        // =========================================================

        private bool IsStudent()
        {
            return _httpContextAccessor
                .HttpContext?
                .User
                .IsInRole("Student") == true;
        }

        // =========================================================
        // STUDENT ACCESS PROTECTION
        // =========================================================

        private void EnsureStudentOwnsRequestedStudent(
            int requestedStudentId)
        {
            if (!IsStudent())
            {
                return;
            }

            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "Unable to determine the logged-in user.");
            }

            var studentIdClaim =
                httpContext.User.FindFirst(
                    "StudentId")?.Value;

            if (!int.TryParse(
                    studentIdClaim,
                    out var loggedInStudentId) ||
                loggedInStudentId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "StudentId was not found in the login token.");
            }

            if (loggedInStudentId != requestedStudentId)
            {
                throw new UnauthorizedAccessException(
                    "Students can only access their own attendance.");
            }
        }

        // =========================================================
        // LIVE CLASS TENANT VALIDATION
        // =========================================================

        private async Task<LiveClass>
            GetLiveClassForOrganizationAsync(
                int liveClassId)
        {
            var organizationId =
                GetCurrentOrganizationId();

            var liveClass =
                await _context.LiveClasses
                    .Include(x => x.Batch)
                    .FirstOrDefaultAsync(x =>
                        x.LiveClassId == liveClassId &&
                        x.Batch.OrganizationId == organizationId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            return liveClass;
        }

        // =========================================================
        // ATTENDANCE TENANT VALIDATION
        // =========================================================

        private async Task<Attendance>
            GetAttendanceByIdForCurrentOrganizationAsync(
                int attendanceId)
        {
            var organizationId =
                GetCurrentOrganizationId();

            var attendance =
                await _context.Attendances
                    .Include(a => a.Student)
                    .Include(a => a.LiveClass)
                        .ThenInclude(l => l.Batch)
                    .FirstOrDefaultAsync(a =>
                        a.AttendanceId == attendanceId &&
                        a.Student.OrganizationId == organizationId &&
                        a.LiveClass.Batch.OrganizationId == organizationId);

            if (attendance == null)
            {
                throw new KeyNotFoundException(
                    "Attendance not found.");
            }

            return attendance;
        }
    }
}