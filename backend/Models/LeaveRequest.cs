using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class LeaveRequest : BaseEntity
    {
        [Key]
        public int LeaveRequestId { get; set; }

        // ==========================================
        // Organization / Tenant
        // ==========================================

        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // ==========================================
        // Employee
        // ==========================================

        public int EmployeeId { get; set; }

        public Employee Employee { get; set; } = null!;

        // ==========================================
        // Leave Details
        // ==========================================

        public string LeaveType { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public string? Reason { get; set; }

        // ==========================================
        // Approval
        // ==========================================

        public LeaveRequestStatus Status { get; set; }

        public int? ApprovedBy { get; set; }

        public DateTime? ApprovedOn { get; set; }

        public DateTime AppliedOn { get; set; }

        public string? RejectionReason { get; set; }


    }
}