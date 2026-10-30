namespace TalentSphereAPI.DTOs.HR;

// ============================================================
// SUMMARY
// ============================================================

public class HrPerformanceSummaryDto
{
    public int TotalEmployees { get; set; }

    public decimal AveragePerformance { get; set; }

    public decimal TargetCompletion { get; set; }

    public int TopPerformers { get; set; }

    public int NeedsImprovement { get; set; }
}


// ============================================================
// TREND
// ============================================================

public class HrPerformanceTrendDto
{
    public List<HrPerformanceTrendItemDto> Series { get; set; } = new();
}

public class HrPerformanceTrendItemDto
{
    public string Month { get; set; } = string.Empty;

    public decimal AvgScore { get; set; }
}


// ============================================================
// BY ROLE
// ============================================================

public class HrPerformanceByRoleDto
{
    public List<HrPerformanceRoleItemDto> Items { get; set; } = new();
}

public class HrPerformanceRoleItemDto
{
    public string Role { get; set; } = string.Empty;

    public decimal AvgScore { get; set; }
}


// ============================================================
// FILTER / PAGINATION
// ============================================================

public class HrPerformanceFilterDto
{
    public string? Search { get; set; }

    public int? DepartmentId { get; set; }

    public string? Role { get; set; }

    public string? PerformanceFilter { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int Page { get; set; } = 1;

    public int Limit { get; set; } = 10;
}


// ============================================================
// LIST / DETAIL
// ============================================================

public class HrPerformancePagedResponse
{
    public List<HrPerformanceRecordDto> Items { get; set; } = new();

    public int Page { get; set; }

    public int Limit { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}

public class HrPerformanceRecordDto
{
    public int PerformanceId { get; set; }

    public string EmployeeId { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public int? DepartmentId { get; set; }

    public string? Department { get; set; }

    public List<string> AssignedBatches { get; set; } = new();

    public string Period { get; set; } = string.Empty;

    public decimal PerformanceScore { get; set; }

    public decimal TargetCompletion { get; set; }

    public decimal Attendance { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}


// ============================================================
// CREATE
// ============================================================

public class HrCreatePerformanceDto
{
    public string EmployeeId { get; set; } = string.Empty;

    public string Period { get; set; } = string.Empty;

    public decimal PerformanceScore { get; set; }

    public decimal TargetCompletion { get; set; }

    public string? Notes { get; set; }
}


// ============================================================
// UPDATE
// ============================================================

public class HrUpdatePerformanceDto
{
    public string? Period { get; set; }

    public decimal? PerformanceScore { get; set; }

    public decimal? TargetCompletion { get; set; }

    public string? Notes { get; set; }
}


// ============================================================
// EMPLOYEE HISTORY
// ============================================================

public class HrEmployeePerformanceHistoryResponse
{
    public List<HrPerformanceRecordDto> Items { get; set; } = new();
}


// ============================================================
// FILTER OPTIONS
// ============================================================

public class HrPerformanceFiltersDto
{
    public List<string> Departments { get; set; } = new();

    public List<string> Roles { get; set; } = new();

    public List<string> PerformanceStatuses { get; set; } = new()
    {
        "EXCELLENT",
        "GOOD",
        "NEEDS_IMPROVEMENT"
    };
}


// ============================================================
// DETAIL
// ============================================================

public class HrPerformanceDetailDto : HrPerformanceRecordDto
{
  

    public DateTime? CreatedAt { get; set; }
}