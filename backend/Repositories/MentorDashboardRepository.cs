using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.DTOs.Dashboard;
using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class MentorDashboardRepository : IMentorDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public MentorDashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // MENTOR DASHBOARD
        // ============================================================
        public async Task<MentorDashboardDto> GetDashboardAsync(int mentorId)
        {
            // --------------------------------------------------------
            // 1. Check whether mentor exists
            // --------------------------------------------------------
            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(x => x.MentorId == mentorId);

            if (mentor == null)
                throw new Exception("Mentor not found.");

            var today = DateTime.Today;

            // --------------------------------------------------------
            // 2. Get all live classes for this mentor
            // --------------------------------------------------------
            var liveClasses = await _context.LiveClasses
                .Where(x => x.MentorId == mentorId)
                .ToListAsync();

            // --------------------------------------------------------
            // 3. Total courses assigned to this mentor
            // Course.MentorId -> Mentor.MentorId
            var totalCourses = await _context.Courses
      .CountAsync(x =>
          x.Batches.Any(b =>
              b.MentorId == mentorId));
            // --------------------------------------------------------
            // 4. Total batches assigned to this mentor
            // Batch.MentorId -> Mentor.MentorId
            // --------------------------------------------------------
            var totalBatches = await _context.Batches
    .CountAsync(x =>
        x.MentorId == mentorId);
            // --------------------------------------------------------
            // 5. Total students assigned to this mentor
            // Student.MentorId -> Mentor.MentorId
            // --------------------------------------------------------
            var totalStudents = await _context.Students
     .CountAsync(x =>
         x.Batch.MentorId == mentorId &&
         !x.IsDeleted);

            // --------------------------------------------------------
            // 6. Get attendance only for this mentor's live classes
            // --------------------------------------------------------
            var mentorAttendance = await _context.Attendances
                .Include(a => a.LiveClass)
                .Where(a => a.LiveClass.MentorId == mentorId)
                .ToListAsync();

            // --------------------------------------------------------
            // 7. Build dashboard response
            // --------------------------------------------------------
            var dashboard = new MentorDashboardDto
            {
                MentorId = mentor.MentorId,

                MentorName = mentor.FirstName + " " + mentor.LastName,

                // Classes scheduled for today
                TodayClasses = liveClasses.Count(x =>
                    x.ScheduledDate.Date == today),

                // Currently live classes
                LiveClasses = liveClasses.Count(x =>
                    x.Status == "Live"),

                // Future classes
                UpcomingClasses = liveClasses.Count(x =>
                    x.ScheduledDate.Date > today),

                // Completed classes
                CompletedClasses = liveClasses.Count(x =>
                    x.Status == "Completed"),

                // Courses directly assigned to mentor
                TotalCourses = totalCourses,

                // Batches directly assigned to mentor
                TotalBatches = totalBatches,

                // Students directly assigned to mentor
                TotalStudents = totalStudents,

                // Average attendance for this mentor
                AverageAttendance = mentorAttendance.Any()
                    ? Math.Round(
                        mentorAttendance.Average(
                            x => x.AttendancePercentage), 2)
                    : 0
            };

            return dashboard;
        }
        public async Task<List<MentorClassDto>>
    GetMentorClassesAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    !x.IsDeleted);

            if (user == null)
                throw new UnauthorizedAccessException(
                    "User not found.");

            if (user.Role != UserRole.Mentor)
                throw new UnauthorizedAccessException(
                    "Only mentors can access mentor classes.");

            if (!user.OrganizationId.HasValue)
                throw new UnauthorizedAccessException(
                    "Mentor organization not found.");

            var organizationId =
                user.OrganizationId.Value;

            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                   x.Email == user.Email &&
x.OrganizationId == organizationId &&
                    !x.IsDeleted);

            if (mentor == null)
                throw new UnauthorizedAccessException(
                    "Mentor profile not found.");

            return await _context.LiveClasses
                .AsNoTracking()
                .Where(x =>
                    x.MentorId == mentor.MentorId)
                .OrderByDescending(x => x.ScheduledDate)
                .ThenBy(x => x.StartTime)
                .Select(x => new MentorClassDto
                {
                    LiveClassId =
                        x.LiveClassId,

                    ClassTitle =
                        x.ClassTitle,

                    CourseId =
                        x.CourseId,

                    CourseName =
                        x.Course.CourseName,

                    BatchId =
                        x.BatchId,

                    BatchName =
                        x.Batch.BatchName,

                    ScheduledDate =
                        x.ScheduledDate,

                    StartTime =
                        x.StartTime,

                    EndTime =
                        x.EndTime,

                    Status =
                        x.Status,

                    MeetingPlatform =
                        x.MeetingPlatform,

                    MeetingLink =
                               x.MeetingLink ?? string.Empty,

                    RecordingEnabled =
                        x.RecordingEnabled,

                    RecordingUrl =
                        x.RecordingUrl
                })
                .ToListAsync();
        }
        public async Task<List<MentorStudentDto>>
    GetMentorStudentsAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    !x.IsDeleted);

            if (user == null)
                throw new UnauthorizedAccessException(
                    "User not found.");

            if (user.Role != UserRole.Mentor)
                throw new UnauthorizedAccessException(
                    "Only mentors can access mentor students.");

            if (!user.OrganizationId.HasValue)
                throw new UnauthorizedAccessException(
                    "Mentor organization not found.");

            var organizationId =
                user.OrganizationId.Value;

            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Email == user.Email &&
x.OrganizationId == organizationId &&
                    !x.IsDeleted);

            if (mentor == null)
                throw new UnauthorizedAccessException(
                    "Mentor profile not found.");

            return await _context.Students
                .AsNoTracking()
                .Where(s =>
                    s.OrganizationId == organizationId &&
                    !s.IsDeleted &&
                    s.Batch.MentorId == mentor.MentorId)
                .OrderBy(s => s.FirstName)
                .ThenBy(s => s.LastName)
                .Select(s => new MentorStudentDto
                {
                    StudentId = s.StudentId,

                    FirstName = s.FirstName,

                    LastName = s.LastName,

                    Email = s.Email,

                    Phone = s.Phone,

                    CourseId = s.CourseId,

                    CourseName = s.Course.CourseName,

                    BatchId = s.BatchId,

                    BatchName = s.Batch.BatchName,

                    Attendance = s.Attendance,

                    AssessmentsCleared =
                        s.AssessmentsCleared,

                    Status = s.Status
                })
                .ToListAsync();
        }

        // ============================================================
        // TODAY'S CLASSES
        // ============================================================
        public async Task<List<TodayClassDto>> GetTodayClassesAsync(
            int mentorId)
        {
            var today = DateTime.Today;

            return await _context.LiveClasses
                .Include(x => x.Batch)
                .Where(x =>
                    x.MentorId == mentorId &&
                    x.ScheduledDate.Date == today)
                .Select(x => new TodayClassDto
                {
                    LiveClassId = x.LiveClassId,

                    ClassTitle = x.ClassTitle,

                    BatchName = x.Batch.BatchName,

                    ScheduledDate = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    Status = x.Status
                })
                .OrderBy(x => x.StartTime)
                .ToListAsync();
        }


        // ============================================================
        // UPCOMING CLASSES
        // ============================================================
        public async Task<List<TodayClassDto>> GetUpcomingClassesAsync(
            int mentorId)
        {
            var today = DateTime.Today;

            return await _context.LiveClasses
                .Include(x => x.Batch)
                .Where(x =>
                    x.MentorId == mentorId &&
                    x.ScheduledDate.Date > today)
                .Select(x => new TodayClassDto
                {
                    LiveClassId = x.LiveClassId,

                    ClassTitle = x.ClassTitle,

                    BatchName = x.Batch.BatchName,

                    ScheduledDate = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    Status = x.Status
                })
                .OrderBy(x => x.ScheduledDate)
                .ThenBy(x => x.StartTime)
                .ToListAsync();
        }

        // ============================================================
        // COURSES ALLOCATED TO LOGGED-IN MENTOR
        // ============================================================

        public async Task<List<MentorCourseDto>>
    GetMentorCoursesAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    !x.IsDeleted);

            if (user == null)
                throw new UnauthorizedAccessException(
                    "User not found.");

            if (user.Role != UserRole.Mentor)
                throw new UnauthorizedAccessException(
                    "Only mentors can access mentor courses.");

            if (!user.OrganizationId.HasValue)
                throw new UnauthorizedAccessException(
                    "Mentor organization not found.");

            var organizationId =
                user.OrganizationId.Value;

            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                   x.Email == user.Email &&
x.OrganizationId == organizationId &&
                    !x.IsDeleted);

            if (mentor == null)
                throw new UnauthorizedAccessException(
                    "Mentor profile not found.");

            return await _context.Courses
                .AsNoTracking()
                .Where(c =>
                    c.OrganizationId == organizationId &&
                    c.Status &&
                    c.Batches.Any(b =>
                        b.MentorId == mentor.MentorId))
                .OrderBy(c => c.CourseName)
                .Select(c => new MentorCourseDto
                {
                    CourseId = c.CourseId,

                    CourseName = c.CourseName,

                    Duration = c.Duration,

                    Level = c.Level,

                    Price = c.Price,

                    Status = c.Status
                })
                .ToListAsync();
        }

        // ============================================================
        // MENTOR BATCHES
        // ============================================================

        public async Task<MentorBatchesResponseDto>
            GetMentorBatchesAsync(
                int userId,
                int page,
                int pageSize,
                BatchStatus? status,
                string? search)
        {
            // --------------------------------------------------------
            // 1. Get logged-in user
            // --------------------------------------------------------

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    !x.IsDeleted);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User not found.");
            }

            // --------------------------------------------------------
            // 2. Verify mentor role
            // --------------------------------------------------------

            if (user.Role != UserRole.Mentor)
            {
                throw new UnauthorizedAccessException(
                    "Only mentors can access mentor batches.");
            }

            // --------------------------------------------------------
            // 3. Organization is required
            // --------------------------------------------------------

            if (!user.OrganizationId.HasValue)
            {
                throw new UnauthorizedAccessException(
                    "Mentor organization not found.");
            }

            var organizationId =
                user.OrganizationId.Value;

            // --------------------------------------------------------
            // 4. Find mentor profile
            //
            // User does NOT contain EmployeeId.
            //
            // Mentor has:
            //     MentorId
            //     EmployeeId
            //     Email
            //     OrganizationId
            // --------------------------------------------------------

            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(m =>
                    m.Email == user.Email &&
                    m.OrganizationId == organizationId &&
                    !m.IsDeleted);

            if (mentor == null)
            {
                throw new UnauthorizedAccessException(
                    "Mentor profile not found.");
            }

            var mentorId =
                mentor.MentorId;

            // --------------------------------------------------------
            // 5. Get only batches assigned to this mentor
            // --------------------------------------------------------

            var query = _context.Batches
                .AsNoTracking()
                .Where(b =>
                    b.OrganizationId == organizationId &&
                    b.MentorId == mentorId);

            // --------------------------------------------------------
            // 6. Status filter
            // --------------------------------------------------------

            if (status.HasValue)
            {
                query = query.Where(b =>
                    b.Status == status.Value);
            }

            // --------------------------------------------------------
            // 7. Search filter
            // --------------------------------------------------------

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(b =>
                    b.BatchName.Contains(search) ||
                    b.Course.CourseName.Contains(search));
            }

            // --------------------------------------------------------
            // 8. Total count
            // --------------------------------------------------------

            var totalRecords =
                await query.CountAsync();

            // --------------------------------------------------------
            // 9. Get paginated batches
            // --------------------------------------------------------

            var batches = await query
                .OrderByDescending(b =>
                    b.BatchId)

                .Skip(
                    (page - 1) *
                    pageSize)

                .Take(pageSize)

                .Select(b =>
                    new MentorBatchDto
                    {
                        BatchId =
                            b.BatchId,

                        BatchName =
                            b.BatchName,

                        CourseId =
                            b.CourseId,

                        CourseName =
                            b.Course.CourseName,

                        Status =
                            b.Status.ToString(),

                        StartDate =
                            b.StartDate,

                        EndDate =
                            b.EndDate,

                        StudentCount =
                            _context.Students.Count(s =>
                                s.BatchId == b.BatchId &&
                                s.OrganizationId == organizationId &&
                                !s.IsDeleted),

                        Capacity =
                            b.Capacity
                    })
                .ToListAsync();

            // --------------------------------------------------------
            // 10. Return response
            // --------------------------------------------------------

            return new MentorBatchesResponseDto
            {
                EmployeeId =
                    mentor.EmployeeId,

                EmployeeName =
                    (
                        mentor.FirstName +
                        " " +
                        mentor.LastName
                    ).Trim(),

                TotalRecords =
                    totalRecords,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalPages =
                    (int)Math.Ceiling(
                        totalRecords /
                        (double)pageSize),

                Batches =
                    batches
            };
        }

        // ============================================================
        // ATTENDANCE SUMMARY
        // ============================================================
        public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(
            int mentorId)
        {
            var attendance = await _context.Attendances
                .Include(a => a.LiveClass)
                .Where(a =>
                    a.LiveClass.MentorId == mentorId)
                .ToListAsync();

            return new AttendanceSummaryDto
            {
                PresentStudents = attendance.Count(x =>
                    x.Status == AttendanceStatus.Present),

                LateStudents = attendance.Count(x =>
                    x.Status == AttendanceStatus.Late),

                AbsentStudents = attendance.Count(x =>
                    x.Status == AttendanceStatus.Absent),

                AverageAttendance = attendance.Any()
                    ? Math.Round(
                        attendance.Average(
                            x => x.AttendancePercentage), 2)
                    : 0
            };
        }
        // ============================================================
        // MENTOR COURSE SYLLABUS
        // Reads syllabus created by Organization
        // ============================================================

        public async Task<CourseSyllabusDto?>
            GetMentorCourseSyllabusAsync(
                int userId,
                int courseId)
        {
            // ========================================================
            // 1. GET LOGGED-IN USER
            // ========================================================

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    !x.IsDeleted);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User not found.");
            }

            // ========================================================
            // 2. VERIFY MENTOR
            // ========================================================

            if (user.Role != UserRole.Mentor)
            {
                throw new UnauthorizedAccessException(
                    "Only mentors can access mentor syllabus.");
            }

            // ========================================================
            // 3. ORGANIZATION
            // ========================================================

            if (!user.OrganizationId.HasValue)
            {
                throw new UnauthorizedAccessException(
                    "Mentor organization not found.");
            }

            var organizationId =
                user.OrganizationId.Value;

            // ========================================================
            // 4. FIND MENTOR
            // ========================================================

            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Email == user.Email &&
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

            if (mentor == null)
            {
                throw new UnauthorizedAccessException(
                    "Mentor profile not found.");
            }

            // ========================================================
            // 5. GET COURSE
            //
            // IMPORTANT:
            // Mentor must have a batch assigned for this course.
            // ========================================================

            var course = await _context.Courses
                .AsNoTracking()
                .Where(c =>
                    c.CourseId == courseId &&
                    c.OrganizationId == organizationId &&
                    c.Status &&
                    c.Batches.Any(b =>
                        b.MentorId == mentor.MentorId))
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Topics)
                        .ThenInclude(t => t.Lessons)
                .AsSplitQuery()
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return null;
            }

            // ========================================================
            // 6. RETURN ORGANIZATION'S EXISTING SYLLABUS
            // ========================================================

            return new CourseSyllabusDto
            {
                CourseId =
                    course.CourseId,

                CourseName =
                    course.CourseName,

                CourseCode =
                    course.CourseCode,

                Description =
                    course.Description ?? string.Empty,

                Modules =
                    course.Modules
                        .OrderBy(m => m.ModuleNumber)
                        .Select(m =>
                            new CourseModuleDto
                            {
                                ModuleId =
                                    m.ModuleId,

                                ModuleNumber =
                                    m.ModuleNumber,

                                ModuleName =
                                    m.ModuleName,

                                Description =
                                    m.Description
                                    ?? string.Empty,

                                Topics =
                                    m.Topics
                                        .OrderBy(t =>
                                            t.TopicNumber)
                                        .Select(t =>
                                            new CourseTopicDto
                                            {
                                                TopicId =
                                                    t.TopicId,

                                                TopicNumber =
                                                    t.TopicNumber,

                                                TopicName =
                                                    t.TopicName,

                                                Description =
                                                    t.Description
                                                    ?? string.Empty,

                                                Lessons =
                                                    t.Lessons
                                                        .OrderBy(l =>
                                                            l.LessonNumber)
                                                        .Select(l =>
                                                            new CourseLessonDto
                                                            {
                                                                LessonId =
                                                                    l.LessonId,

                                                                LessonNumber =
                                                                    l.LessonNumber,

                                                                LessonName =
                                                                    l.LessonName,

                                                                Description =
                                                                    l.Description
                                                                    ?? string.Empty
                                                            })
                                                        .ToList()
                                            })
                                        .ToList()
                            })
                        .ToList()
            };
        }
    }
}