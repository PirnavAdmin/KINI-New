namespace TalentSphereAPI.DTOs.HR
{
    // ============================================================
    // SUMMARY
    // ============================================================

    public class HrLeaveSummaryDto
    {
        public int PendingRequests { get; set; }

        public int ApprovedThisMonth { get; set; }

        public int RejectedThisMonth { get; set; }

        public int OnLeaveToday { get; set; }
    }


    // ============================================================
    // QUERY
    // ============================================================

    public class HrLeaveQueryDto
    {
        public string? Search { get; set; }

        public string? Status { get; set; }

        public string? LeaveType { get; set; }

        public int? DepartmentId { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public int Page { get; set; } = 1;

        public int Limit { get; set; } = 10;
    }


    // ============================================================
    // LIST RESPONSE
    // ============================================================

    public class HrLeavePagedResponse
    {
        public List<HrLeaveResponseDto> Items { get; set; }
            = new();

        public int Page { get; set; }

        public int Limit { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }
    }


    // ============================================================
    // LEAVE RESPONSE
    // ============================================================

    public class HrLeaveResponseDto
    {
        public int LeaveId { get; set; }

        public string EmployeeId { get; set; }
            = string.Empty;

        public string EmployeeName { get; set; }
            = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
        public string LeaveType { get; set; }
            = string.Empty;

        public DateOnly FromDate { get; set; }

        public DateOnly ToDate { get; set; }

        public int Days { get; set; }

        public string? Reason { get; set; }

        public string Status { get; set; }
            = string.Empty;

        public DateTime AppliedOn { get; set; }

        public int? ApprovedBy { get; set; }

        public DateTime? ApprovedOn { get; set; }

        public string? RejectionReason { get; set; }
    }


    // ============================================================
    // CREATE
    // ============================================================

    public class HrCreateLeaveDto
    {
        public string EmployeeId { get; set; }
            = string.Empty;

        public string LeaveType { get; set; }
            = string.Empty;

        public DateOnly FromDate { get; set; }

        public DateOnly ToDate { get; set; }

        public string? Reason { get; set; }
    }


    // ============================================================
    // REJECT
    // ============================================================

    public class HrRejectLeaveDto
    {
        public string RejectionReason { get; set; }
            = string.Empty;
    }


    // ============================================================
    // EMPLOYEE HISTORY
    // ============================================================

    public class HrEmployeeLeaveHistoryResponse
    {
        public List<HrLeaveResponseDto> Items { get; set; }
            = new();
    }


    // ============================================================
    // BALANCE
    // ============================================================

    public class HrLeaveBalanceResponse
    {
        public List<HrLeaveBalanceItemDto> Items { get; set; }
            = new();
    }


    public class HrLeaveBalanceItemDto
    {
        public string LeaveType { get; set; }
            = string.Empty;

        public int Allotted { get; set; }

        public int Used { get; set; }

        public int Remaining { get; set; }
    }


    // ============================================================
    // TYPES
    // ============================================================

    public class HrLeaveTypesResponse
    {
        public List<string> Items { get; set; }
            = new();
    }
}