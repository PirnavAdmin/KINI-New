namespace TalentSphereAPI.DTOs.HR;

public class HrCalendarEventDto
{
    public int EventId { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public string? Location { get; set; }

    public string? MeetingLink { get; set; }

    public bool AllDay { get; set; }

    public string? Color { get; set; }

    public int? CourseId { get; set; }

    public string CourseName { get; set; } = string.Empty;

    public int? BatchId { get; set; }

    public string BatchName { get; set; } = string.Empty;

    public int? EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public int? StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string? EmployeeProfilePhotoUrl { get; set; }

    public string? StudentProfilePhotoUrl { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }
}


public class HrCalendarEventCreateDto
{
    public string EventType { get; set; } = "OTHER";

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public string? Location { get; set; }

    public string? MeetingLink { get; set; }

    public bool AllDay { get; set; }

    public string? Color { get; set; }

    public int? CourseId { get; set; }

    public int? BatchId { get; set; }

    public int? EmployeeId { get; set; }

    public int? StudentId { get; set; }
}


public class HrCalendarEventUpdateDto
{
    public string EventType { get; set; } = "OTHER";

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public string? Location { get; set; }

    public string? MeetingLink { get; set; }

    public bool AllDay { get; set; }

    public string? Color { get; set; }

    public int? CourseId { get; set; }

    public int? BatchId { get; set; }

    public int? EmployeeId { get; set; }

    public int? StudentId { get; set; }
}


public class HrCalendarQueryDto
{
    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public string? EventType { get; set; }

    public string? Search { get; set; }

    public int? CourseId { get; set; }

    public int? BatchId { get; set; }

    public int? EmployeeId { get; set; }

    public int? StudentId { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 50;
}


public class HrCalendarStatsDto
{
    public int TotalEvents { get; set; }

    public int TodayEvents { get; set; }

    public int UpcomingEvents { get; set; }

    public int ClassEvents { get; set; }

    public int MeetingEvents { get; set; }

    public int HolidayEvents { get; set; }

    public int LeaveEvents { get; set; }

    public int TrainingEvents { get; set; }

    public int InterviewEvents { get; set; }

    public int OtherEvents { get; set; }
}


public class HrCalendarHolidayDto
{
    public int EventId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public bool AllDay { get; set; }
}


public class HrCalendarLeaveDto
{
    public int LeaveRequestId { get; set; }

    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string? EmployeeProfilePhotoUrl { get; set; }

    public string LeaveType { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Reason { get; set; }
}


public class HrCalendarClassDto
{
    public int ClassId { get; set; }

    public string ClassTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int? CourseId { get; set; }

    public string CourseName { get; set; } = string.Empty;

    public int? BatchId { get; set; }

    public string BatchName { get; set; } = string.Empty;

    public DateTime ScheduledDate { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public string EndTime { get; set; } = string.Empty;

    public string MeetingPlatform { get; set; } = string.Empty;

    public string? MeetingLink { get; set; }
}