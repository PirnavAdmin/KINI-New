using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.LiveClass;
using TalentSphereAPI.Models;
using System.Security.Claims;

namespace TalentSphereAPI.Services
{
    public class LiveClassDashboardService : ILiveClassDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public LiveClassDashboardService(
     ApplicationDbContext context,
     IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private IQueryable<LiveClass> ApplyStudentScope(
    IQueryable<LiveClass> query)
        {
            var user = _httpContextAccessor.HttpContext?.User;

            // Preserve existing behavior for non-student roles.
            if (user?.Identity?.IsAuthenticated != true ||
                !user.IsInRole("Student"))
            {
                return query;
            }

            var studentClaim = user.FindFirst("StudentId")?.Value;

            var organizationClaim =
                user.FindFirst("OrganizationId")?.Value ??
                user.FindFirst("organizationId")?.Value;

            // Fail closed if required claims are missing.
            if (!int.TryParse(studentClaim, out var studentId) ||
                studentId <= 0 ||
                !int.TryParse(organizationClaim, out var organizationId) ||
                organizationId <= 0)
            {
                return query.Where(x => false);
            }

            return query.Where(x =>
                x.Batch != null &&
                x.Course != null &&
                x.Batch.OrganizationId == organizationId &&
                x.Course.OrganizationId == organizationId &&
                x.Batch.CourseId == x.CourseId &&

                _context.StudentEnrollments.Any(e =>
                    e.StudentId == studentId &&
                    e.OrganizationId == organizationId &&
                    e.Student.OrganizationId == organizationId &&
                    !e.Student.IsDeleted &&
                    e.IsActive &&
                    e.EndedAt == null &&
                    e.CourseId == x.CourseId &&
                    e.BatchId == x.BatchId &&
                    e.Batch.OrganizationId == organizationId &&
                    e.Course.OrganizationId == organizationId &&
                    e.Batch.CourseId == e.CourseId));
        }

        public async Task<LiveClassDashboardDto> GetDashboardAsync()
        {
            var totalClasses = await _context.LiveClasses.CountAsync();

            var scheduled = await _context.LiveClasses
                .CountAsync(x => x.Status == "Scheduled");

            var live = await _context.LiveClasses
                .CountAsync(x => x.Status == "Live");

            var completed = await _context.LiveClasses
                .CountAsync(x => x.Status == "Completed");

            var cancelled = await _context.LiveClasses
                .CountAsync(x => x.Status == "Cancelled");

            var totalStudents = await _context.Students.CountAsync();

            // Count students considered present
            var presentStudents = await _context.Attendances
     .CountAsync(x =>
         x.Status == AttendanceStatus.Present ||
         x.Status == AttendanceStatus.Late ||
         x.Status == AttendanceStatus.LeftEarly);

            var absentStudents = Math.Max(0, totalStudents - presentStudents);

            double attendancePercentage = totalStudents > 0
                ? Math.Round((double)presentStudents / totalStudents * 100, 2)
                : 0;

            double averageAttendance = completed > 0
                ? Math.Round((double)presentStudents / completed, 2)
                : 0;

            return new LiveClassDashboardDto
            {
                TotalClasses = totalClasses,
                ScheduledClasses = scheduled,
                LiveClasses = live,
                CompletedClasses = completed,
                CancelledClasses = cancelled,
                TotalAttendance = presentStudents,
                AverageAttendance = averageAttendance,
                TotalStudents = totalStudents,
                PresentStudents = presentStudents,
                AbsentStudents = absentStudents,
                AttendancePercentage = attendancePercentage
            };
        }

        public async Task<IEnumerable<LiveClassListDto>> GetUpcomingAsync()
        {
            return await ApplyStudentScope(_context.LiveClasses)
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .Include(x => x.Attendances)
                .Where(x => x.Status == "Scheduled")
                .OrderBy(x => x.ScheduledDate)
                .Select(x => new LiveClassListDto
                {
                    LiveClassId = x.LiveClassId,
                    CourseId = x.CourseId,
                    BatchId = x.BatchId,
                    MentorId = x.MentorId,
                    ClassTitle = x.ClassTitle,
                    CourseName = x.Course != null
                        ? x.Course.CourseName : string.Empty,
                    BatchName = x.Batch != null
                        ? x.Batch.BatchName : string.Empty,
                    MentorName = x.Mentor != null
                        ? $"{x.Mentor.FirstName} {x.Mentor.LastName}"
                        : string.Empty,
                    ScheduledDate = x.ScheduledDate,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    Status = x.Status,
                    AttendanceCount = x.Attendances.Count
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LiveClassListDto>> GetCompletedAsync()
        {
            return await ApplyStudentScope(_context.LiveClasses)
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .Include(x => x.Attendances)
                .Where(x => x.Status == "Completed")
                .OrderByDescending(x => x.ScheduledDate)
                .Select(x => new LiveClassListDto
                {
                    LiveClassId = x.LiveClassId,
                    CourseId = x.CourseId,
                    BatchId = x.BatchId,
                    MentorId = x.MentorId,
                    ClassTitle = x.ClassTitle,
                    CourseName = x.Course != null
                        ? x.Course.CourseName : string.Empty,
                    BatchName = x.Batch != null
                        ? x.Batch.BatchName : string.Empty,
                    MentorName = x.Mentor != null
                        ? $"{x.Mentor.FirstName} {x.Mentor.LastName}"
                        : string.Empty,
                    ScheduledDate = x.ScheduledDate,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    Status = x.Status,
                    AttendanceCount = x.Attendances.Count
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LiveClassListDto>> GetLiveAsync()
        {
            return await ApplyStudentScope(_context.LiveClasses)
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .Include(x => x.Attendances)
                .Where(x => x.Status == "Live")
                .OrderBy(x => x.StartTime)
                .Select(x => new LiveClassListDto
                {
                    LiveClassId = x.LiveClassId,
                    CourseId = x.CourseId,
                    BatchId = x.BatchId,
                    MentorId = x.MentorId,
                    ClassTitle = x.ClassTitle,
                    CourseName = x.Course != null
                        ? x.Course.CourseName : string.Empty,
                    BatchName = x.Batch != null
                        ? x.Batch.BatchName : string.Empty,
                    MentorName = x.Mentor != null
                        ? $"{x.Mentor.FirstName} {x.Mentor.LastName}"
                        : string.Empty,
                    ScheduledDate = x.ScheduledDate,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    Status = x.Status,
                    AttendanceCount = x.Attendances.Count
                })
                .ToListAsync();
        }
    }
}