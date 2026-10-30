using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DateTimeService _dateTimeService;

        public DashboardRepository(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    DateTimeService dateTimeService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _dateTimeService = dateTimeService;
        }

       

        // ============================================================
        // SUPER ADMIN DASHBOARD
        // ============================================================

        public async Task<SuperAdminDashboardDto>
            GetSuperAdminDashboardAsync()
        {
            return new SuperAdminDashboardDto
            {
                TotalOrganizations =
                    await _context.Organizations.CountAsync(),

                TotalUsers =
                    await _context.Users.CountAsync(),

                TotalEmployees =
                    await _context.Employees.CountAsync(),

                ActiveOrganizations =
                    await _context.Organizations.CountAsync()
            };
        }

        // ============================================================
        // ORGANIZATION DASHBOARD
        // ============================================================

        public async Task<OrganizationDashboardDto>
            GetOrganizationDashboardAsync()
        {
            return new OrganizationDashboardDto
            {
                TotalDepartments =
                    await _context.Departments.CountAsync(),

                TotalTeams =
                    await _context.Teams.CountAsync(),

                TotalEmployees =
                    await _context.Users
                        .CountAsync(x =>
                            x.Role == UserRole.Employee),

                ActiveEmployees =
                    await _context.Users
                        .CountAsync(x =>
                            x.Role == UserRole.Employee),

                TotalStudents =
                    await _context.Users
                        .CountAsync(x =>
                            x.Role == UserRole.Student)
            };
        }

        // ============================================================
        // EMPLOYEE DASHBOARD
        // ============================================================

        public async Task<EmployeeDashboardDto>
            GetEmployeeDashboardAsync()
        {
            return new EmployeeDashboardDto
            {
                TotalSkills =
                    await _context.Skills.CountAsync(),

                TotalCompetencies =
                    await _context.Competencies.CountAsync(),

                CompletedAssessments = 0,

                PendingAssessments = 0
            };
        }

        // ============================================================
        // STUDENT DASHBOARD
        // ============================================================

        public async Task<StudentDashboardDto>
            GetStudentDashboardAsync()
        {
            return new StudentDashboardDto
            {
                TotalCourses = 0,

                CompletedCourses = 0,

                PendingCourses = 0,

                TotalSkills =
                    await _context.Skills.CountAsync()
            };
        }

        // ============================================================
        // HR DASHBOARD
        // ============================================================

        public async Task<
            TalentSphereAPI.DTOs.Dashboard.HrDashboardDto>
            GetHrDashboardAsync()
        {
            var organizationId =
                GetOrganizationId();

            var today =
                DateTime.Today;

            var tomorrow =
                today.AddDays(1);

            var sevenDaysAgo =
                today.AddDays(-6);

            // ========================================================
            // EMPLOYEES
            // ========================================================

            var employeeQuery =
                _context.Employees
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            var totalEmployees =
                await employeeQuery.CountAsync();

            var activeEmployees =
                await employeeQuery.CountAsync(x =>
                    x.Status == "Active");

            var trainersMentors =
                await employeeQuery.CountAsync(x =>
                    x.Role == "Trainer" ||
                    x.Role == "Mentor");

            // ========================================================
            // ACTIVE BATCHES
            // ========================================================

            var activeBatches =
                await _context.Batches
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == organizationId &&
                        x.Status == BatchStatus.Active);

            // ========================================================
            // TODAY'S CLASSES
            // ========================================================

            var todaysClasses =
                await _context.LiveClasses
                    .AsNoTracking()
                    .Include(x => x.Course)
                    .Include(x => x.Batch)
                    .Include(x => x.Mentor)
                    .Where(x =>
                        x.Batch.OrganizationId == organizationId &&
                        x.ScheduledDate >= today &&
                        x.ScheduledDate < tomorrow &&
                        x.Status != "Cancelled")
                    .OrderBy(x => x.StartTime)
                    .ToListAsync();

            // ========================================================
            // PENDING LEAVE
            // ========================================================

            var pendingLeaveQuery =
                _context.LeaveRequests
                    .AsNoTracking()
                    .Include(x => x.Employee)
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.Status == LeaveRequestStatus.Pending);

            var pendingLeaveCount =
                await pendingLeaveQuery.CountAsync();

            var pendingLeaveEntities =
                await pendingLeaveQuery
                    .OrderBy(x => x.StartDate)
                    .ThenBy(x => x.LeaveRequestId)
                    .Take(5)
                    .ToListAsync();

            var pendingLeaves =
                pendingLeaveEntities
                    .Select(x =>
                        new TalentSphereAPI.DTOs.Dashboard.HrPendingLeaveDto
                        {
                            LeaveId =
                                x.LeaveRequestId,

                            EmployeeId =
                                "EMP-" +
                                x.EmployeeId.ToString("D3"),

                            EmployeeName =
                                $"{x.Employee.FirstName} {x.Employee.LastName}"
                                    .Trim(),

                            LeaveType =
                                x.LeaveType,

                            FromDate =
                                x.StartDate,

                            ToDate =
                                x.EndDate,

                            Days =
                                x.EndDate.DayNumber -
                                x.StartDate.DayNumber +
                                1,

                            Status =
                                x.Status
                                    .ToString()
                                    .ToUpperInvariant()
                        })
                    .ToList();

            // ========================================================
            // TODAY ATTENDANCE
            // ========================================================

            var todayDateOnly =
                DateOnly.FromDateTime(today);

            var presentToday =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == organizationId &&
                        x.AttendanceDate == todayDateOnly &&
                        string.Equals(
                            x.Status,
                            "Present",
                            StringComparison.OrdinalIgnoreCase));

            var onLeaveToday =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.Status ==
                            LeaveRequestStatus.Approved &&
                        x.StartDate <= todayDateOnly &&
                        x.EndDate >= todayDateOnly)
                    .Select(x => x.EmployeeId)
                    .Distinct()
                    .CountAsync();

            // ========================================================
            // ATTENDANCE OVERVIEW
            // ========================================================

            var attendanceOverview =
                await BuildAttendanceOverviewAsync(
                    organizationId,
                    sevenDaysAgo,
                    today);

            // ========================================================
            // RECENT EMPLOYEES
            // ========================================================

            var recentEmployees =
                await BuildRecentEmployeesAsync(
                    organizationId,
                    5);

            // ========================================================
            // RECENT HR ACTIVITY
            // ========================================================

            var recentActivity =
                await _context.Notifications
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Take(5)
                    .Select(x =>
                        new TalentSphereAPI.DTOs.Dashboard.HrRecentActivityDto
                        {
                            Id =
                                x.NotificationId,

                            Activity =
                                x.Title,

                            Details =
                                x.Message,

                            Time =
                                x.CreatedAt
                        })
                    .ToListAsync();

            // ========================================================
            // UPCOMING EVENTS
            // ========================================================

            var upcomingEvents =
                await _context.LiveClasses
                    .AsNoTracking()
                    .Where(x =>
                        x.Batch.OrganizationId == organizationId &&
                        x.ScheduledDate >= today &&
                        x.Status != "Cancelled")
                    .OrderBy(x => x.ScheduledDate)
                    .ThenBy(x => x.StartTime)
                    .Take(5)
                    .Select(x =>
                        new TalentSphereAPI.DTOs.Dashboard.HrUpcomingEventDto
                        {
                            EventId =
                                x.LiveClassId,

                            Title =
                                x.ClassTitle,

                            EventType =
                                "CLASS",

                            Date =
                                x.ScheduledDate,

                            StartTime =
                                x.StartTime,

                            EndTime =
                                x.EndTime
                        })
                    .ToListAsync();

            // ========================================================
            // PENDING HR ACTIONS
            // ========================================================

            var pendingActions =
                new List<
                    TalentSphereAPI.DTOs.Dashboard.HrPendingActionDto>();

            if (pendingLeaveCount > 0)
            {
                pendingActions.Add(
                    new TalentSphereAPI.DTOs.Dashboard.HrPendingActionDto
                    {
                        Task =
                            "Leave Requests Pending Approval",

                        Count =
                            pendingLeaveCount,

                        Action =
                            "Review"
                    });
            }

            // ========================================================
            // FINAL DASHBOARD
            // ========================================================

            return new TalentSphereAPI.DTOs.Dashboard.HrDashboardDto
            {
                Summary =
                    new TalentSphereAPI.DTOs.Dashboard.HrDashboardSummaryDto
                    {
                        TotalEmployees =
                            totalEmployees,

                        ActiveEmployees =
                            activeEmployees,

                        TrainersMentors =
                            trainersMentors,

                        ActiveBatches =
                            activeBatches,

                        ClassesToday =
                            todaysClasses.Count,

                        PresentToday =
                            presentToday,

                        OnLeaveToday =
                            onLeaveToday,

                        PendingLeaveRequests =
                            pendingLeaveCount
                    },

                AttendanceOverview =
                    new TalentSphereAPI.DTOs.Dashboard.HrAttendanceOverviewDto
                    {
                        Series =
                            attendanceOverview
                    },

                TodaysClasses =
                    todaysClasses
                        .Select(x =>
                            new TalentSphereAPI.DTOs.Dashboard.HrTodayClassDto
                            {
                                ClassId =
                                    x.LiveClassId,

                                Batch =
                                    x.Batch?.BatchName ??
                                    string.Empty,

                                Course =
                                    x.Course?.CourseName ??
                                    string.Empty,

                                Trainer =
                                    x.Mentor == null
                                        ? string.Empty
                                        : $"{x.Mentor.FirstName} {x.Mentor.LastName}"
                                            .Trim(),

                                StartTime =
                                    x.StartTime,

                                EndTime =
                                    x.EndTime,

                                Mode =
                                    x.MeetingPlatform ??
                                    string.Empty,

                                Status =
                                    GetClassStatus(
                                        x,
                                        today),

                                MeetingLink =
                                    x.MeetingLink ??
                                    string.Empty
                            })
                        .ToList(),

                PendingLeaveRequests =
                    pendingLeaves,

                RecentEmployees =
                    recentEmployees,

                RecentHrActivity =
                    recentActivity,

                PendingHrActions =
                    pendingActions,

                UpcomingEvents =
                    upcomingEvents,

                Announcements =
                    new List<
                        TalentSphereAPI.DTOs.Dashboard.HrAnnouncementDto>()
            };
        }

        // ============================================================
        // ATTENDANCE OVERVIEW
        // ============================================================

        private async Task<
            List<TalentSphereAPI.DTOs.Dashboard.HrAttendanceDayDto>>
            BuildAttendanceOverviewAsync(
                int organizationId,
                DateTime startDate,
                DateTime endDate)
        {
            var start =
                DateOnly.FromDateTime(startDate);

            var end =
                DateOnly.FromDateTime(endDate);

            var attendanceRows =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.AttendanceDate >= start &&
                        x.AttendanceDate <= end)
                    .Select(x => new
                    {
                        x.AttendanceDate,
                        x.Status
                    })
                    .ToListAsync();

            var approvedLeaves =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.Status ==
                            LeaveRequestStatus.Approved &&
                        x.StartDate <= end &&
                        x.EndDate >= start)
                    .Select(x => new
                    {
                        x.EmployeeId,
                        x.StartDate,
                        x.EndDate
                    })
                    .ToListAsync();

            var result =
                new List<
                    TalentSphereAPI.DTOs.Dashboard.HrAttendanceDayDto>();

            for (
                var date = startDate.Date;
                date <= endDate.Date;
                date = date.AddDays(1))
            {
                var dateOnly =
                    DateOnly.FromDateTime(date);

                var rows =
                    attendanceRows
                        .Where(x =>
                            x.AttendanceDate == dateOnly)
                        .ToList();

                var approvedLeaveEmployees =
                    approvedLeaves
                        .Where(x =>
                            x.StartDate <= dateOnly &&
                            x.EndDate >= dateOnly)
                        .Select(x => x.EmployeeId)
                        .Distinct()
                        .Count();

                var present =
                    rows.Count(x =>
                        string.Equals(
                            x.Status,
                            "Present",
                            StringComparison.OrdinalIgnoreCase));

                var absent =
                    rows.Count(x =>
                        string.Equals(
                            x.Status,
                            "Absent",
                            StringComparison.OrdinalIgnoreCase));

                var late =
                    rows.Count(x =>
                        string.Equals(
                            x.Status,
                            "Late",
                            StringComparison.OrdinalIgnoreCase) ||

                        string.Equals(
                            x.Status,
                            "LateCheckIn",
                            StringComparison.OrdinalIgnoreCase) ||

                        string.Equals(
                            x.Status,
                            "LATE_CHECK_IN",
                            StringComparison.OrdinalIgnoreCase));

                var onLeaveStatus =
                    rows.Count(x =>
                        string.Equals(
                            x.Status,
                            "OnLeave",
                            StringComparison.OrdinalIgnoreCase) ||

                        string.Equals(
                            x.Status,
                            "ON_LEAVE",
                            StringComparison.OrdinalIgnoreCase));

                result.Add(
                    new TalentSphereAPI.DTOs.Dashboard.HrAttendanceDayDto
                    {
                        Date =
                            dateOnly,

                        Present =
                            present,

                        Absent =
                            absent,

                        Late =
                            late,

                        OnLeave =
                            Math.Max(
                                onLeaveStatus,
                                approvedLeaveEmployees)
                    });
            }

            return result;
        }

        // ============================================================
        // RECENT EMPLOYEES
        // ============================================================

        private async Task<
            List<TalentSphereAPI.DTOs.Dashboard.HrRecentEmployeeDto>>
            BuildRecentEmployeesAsync(
                int organizationId,
                int count)
        {
            var employees =
                await _context.Employees
                    .AsNoTracking()
                    .Include(x => x.User)
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted)
                    .OrderByDescending(
                        x => x.User != null
                            ? x.User.CreatedDate
                            : DateTime.MinValue)
                    .ThenByDescending(
                        x => x.EmployeeId)
                    .Take(count)
                    .ToListAsync();

            var employeeIds =
                employees
                    .Select(x => x.EmployeeId)
                    .ToList();

            var profiles =
                await _context.EmployeeProfiles
                    .AsNoTracking()
                    .Include(x => x.Department)
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        employeeIds.Contains(x.EmployeeId))
                    .ToListAsync();

            var profileByEmployee =
                profiles
                    .GroupBy(x => x.EmployeeId)
                    .ToDictionary(
                        x => x.Key,
                        x => x.First());

            return employees
                .Select(x =>
                {
                    profileByEmployee.TryGetValue(
                        x.EmployeeId,
                        out var profile);

                    var joinedAt =
                        profile?.JoiningDate
                        ?? x.User?.CreatedDate
                        ?? DateTime.MinValue;

                    return new TalentSphereAPI.DTOs.Dashboard.HrRecentEmployeeDto
                    {
                        EmployeeId =
                            string.IsNullOrWhiteSpace(
                                profile?.EmployeeCode)
                                ? "EMP-" +
                                  x.EmployeeId.ToString("D3")
                                : profile!.EmployeeCode,

                        Name =
                            $"{x.FirstName} {x.LastName}"
                                .Trim(),

                        Role =
                            x.Role,

                        Department =
                            profile?.Department?.Name ??
                            string.Empty,

                        JoinedAt =
                            joinedAt,

                        Status =
                            x.Status
                    };
                })
                .ToList();
        }

        // ============================================================
        // CLASS STATUS
        // ============================================================

        private string GetClassStatus(
            LiveClass liveClass,
            DateTime today)
        {
            if (string.Equals(
                liveClass.Status,
                "Cancelled",
                StringComparison.OrdinalIgnoreCase))
            {
                return "CANCELLED";
            }

            if (liveClass.ScheduledDate.Date <
                today.Date)
            {
                return "COMPLETED";
            }

            if (liveClass.ScheduledDate.Date >
                today.Date)
            {
                return "UPCOMING";
            }

            var now = _dateTimeService.Now().TimeOfDay;

            if (now < liveClass.StartTime)
            {
                return "UPCOMING";
            }

            if (now <= liveClass.EndTime)
            {
                return "ONGOING";
            }

            return "COMPLETED";
        }

        // ============================================================
        // ORGANIZATION ID
        // ============================================================

        private int GetOrganizationId()
        {
            var claim =
                _httpContextAccessor
                    .HttpContext?
                    .User
                    .FindFirst("OrganizationId")?
                    .Value;

            if (!int.TryParse(
                claim,
                out var organizationId) ||
                organizationId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "OrganizationId was not found in the authenticated token.");
            }

            return organizationId;
        }
    }
}