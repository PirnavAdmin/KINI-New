using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models;

public class HrSettings : BaseEntity
{
    [Key]
    public int HrSettingsId { get; set; }

    public int OrganizationId { get; set; }

    public int EmployeeId { get; set; }

    // ============================================================
    // NOTIFICATION PREFERENCES
    // ============================================================

    public bool LeaveRequests { get; set; } = true;

    public bool AttendanceAlerts { get; set; } = true;

    public bool EmployeeUpdates { get; set; } = true;

    public bool BatchScheduleUpdates { get; set; } = true;

    public bool PerformanceUpdates { get; set; } = false;

    public bool InstituteAnnouncements { get; set; } = true;


    // ============================================================
    // APPEARANCE PREFERENCES
    // ============================================================

    public bool DarkMode { get; set; } = false;

    public bool CompactView { get; set; } = false;

    public bool SidebarCollapsedByDefault { get; set; } = false;

    [MaxLength(20)]
    public string AccentColor { get; set; } = "#2563eb";


    // ============================================================
    // SECURITY
    // ============================================================
    [MaxLength(1000)]
    public string? PhotoUrl { get; set; }

    public bool TwoFactorEnabled { get; set; } = false;
 


    // ============================================================
    // AUDIT
    // ============================================================

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;


    // ============================================================
    // NAVIGATION
    // ============================================================

    public Organization Organization { get; set; } = null!;

    public Employee Employee { get; set; } = null!;
}