namespace TalentSphereAPI.DTOs.Dashboard
{
    public class HrDashboardDto
    {
        public HrDashboardSummaryDto Summary { get; set; } = new();

        public HrAttendanceOverviewDto AttendanceOverview { get; set; } = new();

        public List<HrTodayClassDto> TodaysClasses { get; set; } = new();

        public List<HrPendingLeaveDto> PendingLeaveRequests { get; set; } = new();

        public List<HrRecentEmployeeDto> RecentEmployees { get; set; } = new();

        public List<HrRecentActivityDto> RecentHrActivity { get; set; } = new();

        public List<HrPendingActionDto> PendingHrActions { get; set; } = new();

        public List<HrUpcomingEventDto> UpcomingEvents { get; set; } = new();

        public List<HrAnnouncementDto> Announcements { get; set; } = new();
    }

    public class HrDashboardSummaryDto
    {
        public int TotalEmployees { get; set; }

        public int ActiveEmployees { get; set; }

        public int TrainersMentors { get; set; }

        public int ActiveBatches { get; set; }

        public int ClassesToday { get; set; }

        public int PresentToday { get; set; }

        public int OnLeaveToday { get; set; }

        public int PendingLeaveRequests { get; set; }
    }

    public class HrAttendanceOverviewDto
    {
        public List<HrAttendanceDayDto> Series { get; set; } = new();
    }

    public class HrAttendanceDayDto
    {
        public DateOnly Date { get; set; }

        public int Present { get; set; }

        public int Absent { get; set; }

        public int Late { get; set; }

        public int OnLeave { get; set; }
    }

    public class HrTodayClassDto
    {
        public int ClassId { get; set; }

        public string Batch { get; set; } = string.Empty;

        public string Course { get; set; } = string.Empty;

        public string Trainer { get; set; } = string.Empty;

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Mode { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string MeetingLink { get; set; } = string.Empty;
    }

    public class HrPendingLeaveDto
    {
        public int LeaveId { get; set; }

        public string EmployeeId { get; set; } = string.Empty;

        public string EmployeeName { get; set; } = string.Empty;

        public string LeaveType { get; set; } = string.Empty;

        public DateOnly FromDate { get; set; }

        public DateOnly ToDate { get; set; }

        public int Days { get; set; }

        public string Status { get; set; } = string.Empty;
    }

    public class HrRecentEmployeeDto
    {
        public string EmployeeId { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public DateTime JoinedAt { get; set; }

        public string Status { get; set; } = string.Empty;
    }

    public class HrRecentActivityDto
    {
        public int Id { get; set; }

        public string Activity { get; set; } = string.Empty;

        public string Details { get; set; } = string.Empty;

        public DateTime Time { get; set; }
    }

    public class HrPendingActionDto
    {
        public string Task { get; set; } = string.Empty;

        public int Count { get; set; }

        public string Action { get; set; } = "Review";
    }

    public class HrUpcomingEventDto
    {
        public int EventId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string EventType { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }
    }

    public class HrAnnouncementDto
    {
        public int AnnouncementId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public DateTime PublishedAt { get; set; }
    }
}