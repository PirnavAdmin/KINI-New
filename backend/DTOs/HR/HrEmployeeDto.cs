namespace TalentSphereAPI.DTOs.HR
{
    // ============================================================
    // EMPLOYEE LIST QUERY
    // ============================================================

    public class HrEmployeeQueryDto
    {
        public string? Search { get; set; }

        public int? DepartmentId { get; set; }

        public string? Role { get; set; }

        public string? Status { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int Page { get; set; } = 1;

        public int Limit { get; set; } = 10;

        public string? SortBy { get; set; }

        public string SortOrder { get; set; } = "asc";
    }


    // ============================================================
    // EMPLOYEE RESPONSE
    // ============================================================

    public class HrEmployeeResponseDto
    {
        public string Id { get; set; } = string.Empty;

        public int EmployeeProfileId { get; set; }
        public string Name { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public int? DepartmentId { get; set; }

        public string? Department { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime? JoiningDate { get; set; }
    }


    // ============================================================
    // PAGINATED RESPONSE
    // ============================================================

    public class HrEmployeePagedResponse
    {
        public List<HrEmployeeResponseDto> Items { get; set; }
            = new();

        public int Page { get; set; }

        public int Limit { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }
    }


    // ============================================================
    // SUMMARY
    // ============================================================

    public class HrEmployeeSummaryDto
    {
        public int TotalEmployees { get; set; }

        public string TotalEmployeesTrend { get; set; } = "0%";

        public int TrainersMentors { get; set; }

        public string TrainersMentorsTrend { get; set; } = "0%";

        public int AdministrativeStaff { get; set; }

        public string AdministrativeStaffTrend { get; set; } = "0%";

        public int AcademicStaff { get; set; }

        public string AcademicStaffTrend { get; set; } = "0%";

        public int OnLeaveToday { get; set; }

        public string OnLeaveTodayTrend { get; set; } = "0%";
    }


    // ============================================================
    // DISTRIBUTION
    // ============================================================

    public class HrDepartmentDistributionItem
    {
        public string Department { get; set; } = string.Empty;

        public int Count { get; set; }
    }


    public class HrDepartmentDistributionResponse
    {
        public List<HrDepartmentDistributionItem> Items { get; set; }
            = new();
    }


    // ============================================================
    // TYPE DISTRIBUTION
    // ============================================================

    public class HrTypeDistributionItem
    {
        public string Type { get; set; } = string.Empty;

        public int Count { get; set; }

        public decimal Percent { get; set; }
    }
    public class HrAttendanceOverviewSeriesDto
    {
        public DateOnly Date { get; set; }

        public int Present { get; set; }

        public int Absent { get; set; }

        public int Late { get; set; }

        public int OnLeave { get; set; }
    }

    public class HrTypeDistributionResponse
    {
        public int Total { get; set; }

        public List<HrTypeDistributionItem> Items { get; set; }
            = new();
    }


    // ============================================================
    // ATTENDANCE OVERVIEW
    // ============================================================

    public class HrAttendanceOverviewDto
    {
        // Used by HR Employees attendance overview
        public decimal AvgAttendance { get; set; }

        public int Present { get; set; }

        public int OnLeave { get; set; }

        public int Absent { get; set; }

        // Used by HR Attendance overview
        public List<HrAttendanceOverviewSeriesDto> Series { get; set; }
            = new();
    }


    // ============================================================
    // CREATE EMPLOYEE
    // ============================================================

    public class HrCreateEmployeeDto
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string EmploymentType { get; set; } = "Full-time";
    }


    // ============================================================
    // UPDATE EMPLOYEE
    // ============================================================

    public class HrUpdateEmployeeDto
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Role { get; set; }

        public int? DepartmentId { get; set; }

        public string? Designation { get; set; }

        public string? EmploymentType { get; set; }

        public DateTime? JoiningDate { get; set; }
    }


    // ============================================================
    // STATUS
    // ============================================================

    public class HrEmployeeStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }


    // ============================================================
    // DROPDOWN
    // ============================================================

    public class HrDepartmentDropdownItem
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }


    public class HrDepartmentDropdownResponse
    {
        public List<HrDepartmentDropdownItem> Items { get; set; }
            = new();
    }


    public class HrRolesDropdownResponse
    {
        public List<string> Items { get; set; }
            = new();
    }
}