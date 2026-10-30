using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class EmployeeAttendance : BaseEntity
    {
        [Key]
        public int EmployeeAttendanceId { get; set; }

        // Organization / Tenant
        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // Employee
        public int EmployeeId { get; set; }

        public Employee Employee { get; set; } = null!;

        // Attendance Date
        public DateOnly AttendanceDate { get; set; }

        // Check In / Check Out
        public DateTime? CheckIn { get; set; }

        public DateTime? CheckOut { get; set; }

        // Working Hours
        public decimal WorkingHours { get; set; }

        // Attendance Status
        public string Status { get; set; } = "Pending";

        // Late Checkout
        public bool IsLateCheckout { get; set; }

        // Remarks
        public string? Remarks { get; set; }
    }
}