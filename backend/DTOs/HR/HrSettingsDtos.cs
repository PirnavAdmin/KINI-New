namespace TalentSphereAPI.DTOs.HR;

// ============================================================
// PROFILE
// ============================================================

public class HrSettingsProfileDto
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string EmployeeId { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? CountryCode { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }
}


// ============================================================
// PROFILE UPDATE
// ============================================================

public class HrSettingsProfileUpdateDto
{
    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? CountryCode { get; set; }
}


// ============================================================
// PROFILE PHOTO
// ============================================================

public class HrSettingsPhotoResponseDto
{
    public string PhotoUrl { get; set; } = string.Empty;
}


// ============================================================
// NOTIFICATION SETTINGS
// ============================================================

public class HrSettingsNotificationDto
{
    public bool LeaveRequests { get; set; }

    public bool AttendanceAlerts { get; set; }

    public bool EmployeeUpdates { get; set; }

    public bool BatchScheduleUpdates { get; set; }

    public bool PerformanceUpdates { get; set; }

    public bool InstituteAnnouncements { get; set; }
}


// ============================================================
// SECURITY
// ============================================================

public class HrSettingsPasswordPolicyDto
{
    public int MinLength { get; set; } = 8;

    public bool RequireUppercase { get; set; } = true;

    public bool RequireLowercase { get; set; } = true;

    public bool RequireNumber { get; set; } = true;

    public bool RequireSpecialChar { get; set; } = true;
}


public class HrSettingsSecurityDto
{
    public bool TwoFactorEnabled { get; set; }

    public HrSettingsPasswordPolicyDto PasswordPolicy { get; set; }
        = new();
}


// ============================================================
// CHANGE PASSWORD
// ============================================================

public class HrSettingsChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}


public class HrSettingsSuccessDto
{
    public bool Success { get; set; }
}


// ============================================================
// SECURITY SESSIONS
// ============================================================

public class HrSettingsSessionDto
{
    public string SessionId { get; set; } = string.Empty;

    public string Device { get; set; } = string.Empty;

    public string? Location { get; set; }

    public DateTime LastActive { get; set; }

    public bool Current { get; set; }
}


public class HrSettingsSessionsResponseDto
{
    public List<HrSettingsSessionDto> Items { get; set; } = new();
}


// ============================================================
// TWO FACTOR AUTHENTICATION
// ============================================================

public class HrSettingsTwoFactorEnableResponseDto
{
    public bool Enabled { get; set; }

    public string? QrCodeUrl { get; set; }
}


public class HrSettingsTwoFactorDisableResponseDto
{
    public bool Enabled { get; set; }
}


// ============================================================
// PERMISSIONS
// ============================================================

public class HrSettingsPermissionModuleDto
{
    public string Module { get; set; } = string.Empty;

    public string Permissions { get; set; } = string.Empty;
}


public class HrSettingsPermissionsDto
{
    public string Role { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string EmployeeId { get; set; } = string.Empty;

    public string AccessLevel { get; set; } = string.Empty;

    public List<HrSettingsPermissionModuleDto> Modules { get; set; }
        = new();
}


// ============================================================
// PERMISSION MODULE LIST
// ============================================================

public class HrSettingsPermissionModulesDto
{
    public List<string> Items { get; set; } = new();
}


// ============================================================
// APPEARANCE
// ============================================================

public class HrSettingsAppearanceDto
{
    public bool DarkMode { get; set; }

    public bool CompactView { get; set; }

    public bool SidebarCollapsedByDefault { get; set; }

    public string AccentColor { get; set; } = "#2563eb";
}