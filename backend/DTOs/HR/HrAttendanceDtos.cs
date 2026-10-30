namespace TalentSphereAPI.DTOs.HR
{
    // ============================================================
    // FILTER
    // ============================================================

    public class HrAttendanceFilterDto
    {
        public string? Search { get; set; }

        public DateOnly? Date { get; set; }

        public int? DepartmentId { get; set; }

        public string? Role { get; set; }

        public string? Status { get; set; }

        public int Page { get; set; } = 1;

        public int Limit { get; set; } = 10;
    }


    // ============================================================
    // PAGINATED RESPONSE
    // ============================================================

    public class HrAttendancePagedResponse
    {
        public List<HrAttendanceRecordDto> Items { get; set; }
            = new();

        public int Page { get; set; }

        public int Limit { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }
    }


    // ============================================================
    // ATTENDANCE RECORD
    // ============================================================

    public class HrAttendanceRecordDto
    {
        public int AttendanceId { get; set; }

        public string EmployeeId { get; set; } = string.Empty;

        public string EmployeeName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }

        public string Role { get; set; } = string.Empty;

        public int? DepartmentId { get; set; }

        public string? Department { get; set; }

        public DateOnly Date { get; set; }

        public string? CheckIn { get; set; }

        public string? CheckOut { get; set; }

        public string WorkingHours { get; set; } = "0h 0m";

        public string Status { get; set; } = string.Empty;
    }


    // ============================================================
    // SUMMARY
    // ============================================================

    public class HrAttendanceSummaryDto
    {
        public int TotalEmployees { get; set; }

        public int PresentToday { get; set; }

        public int AbsentToday { get; set; }

        public int OnLeaveToday { get; set; }

        public int LateToday { get; set; }

        public decimal AttendanceRate { get; set; }
    }




   


    // ============================================================
    // DISTRIBUTION
    // ============================================================

    public class HrAttendanceDistributionDto
    {
        public int Total { get; set; }

        public int Present { get; set; }

        public int Absent { get; set; }

        public int OnLeave { get; set; }

        public int Late { get; set; }
    }


    // ============================================================
    // MARK ATTENDANCE
    // ============================================================

    public class HrMarkAttendanceDto
    {
        public string EmployeeId { get; set; } = string.Empty;

        public DateOnly Date { get; set; }

        public string? CheckIn { get; set; }

        public string? CheckOut { get; set; }

        public string Status { get; set; } = string.Empty;
    }


    // ============================================================
    // UPDATE / CORRECT ATTENDANCE
    // ============================================================

    public class HrUpdateAttendanceDto
    {
        public string Status { get; set; } = string.Empty;

        public string? CheckIn { get; set; }

        public string? CheckOut { get; set; }
    }


    // ============================================================
    // EMPLOYEE HISTORY
    // ============================================================

    public class HrEmployeeAttendanceHistoryResponse
    {
        public List<HrAttendanceRecordDto> Items { get; set; }
            = new();
    }


    // ============================================================
    // OVERVIEW QUERY
    // ============================================================

    public class HrAttendanceOverviewQueryDto
    {
        public string Range { get; set; } = "LAST_7_DAYS";

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }
    }


    // ============================================================
    // FILTER DROPDOWN
    // ============================================================

    public class HrAttendanceFiltersDto
    {
        public List<string> Departments { get; set; }
            = new();

        public List<string> Roles { get; set; }
            = new();

        public List<string> Statuses { get; set; }
            = new();
    }
}