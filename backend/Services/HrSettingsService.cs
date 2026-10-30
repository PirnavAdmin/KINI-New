using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services;

public class HrSettingsService : IHrSettingsService
{
    private const long MaxPhotoSize = 2 * 1024 * 1024;

    private static readonly HashSet<string> AllowedPhotoExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png"
        };

    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _environment;

    public HrSettingsService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor,
        IWebHostEnvironment environment)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _environment = environment;
    }

    // ============================================================
    // CURRENT USER / TENANT
    // ============================================================

    private async Task<(User User, Employee Employee)> GetCurrentUserAsync()
    {
        var principal = _httpContextAccessor.HttpContext?.User;

        if (principal?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User is not authenticated.");

        var userIdText =
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdText, out var userId) || userId <= 0)
            throw new UnauthorizedAccessException(
                "UserId was not found in the authenticated token.");

        var organizationText =
            principal.FindFirst("OrganizationId")?.Value;

        if (!int.TryParse(organizationText, out var organizationId) ||
            organizationId <= 0)
        {
            throw new UnauthorizedAccessException(
                "OrganizationId was not found in the authenticated token.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        if (user == null)
            throw new UnauthorizedAccessException(
                "Authenticated user was not found.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == organizationId &&
                x.UserId == userId &&
                !x.IsDeleted);

        // Backward-compatible fallback
        if (employee == null && !string.IsNullOrWhiteSpace(user.Email))
        {
            employee = await _context.Employees
                .FirstOrDefaultAsync(x =>
                    x.OrganizationId == organizationId &&
                    x.Email == user.Email &&
                    !x.IsDeleted);
        }

        if (employee == null)
            throw new UnauthorizedAccessException(
                "Authenticated user is not linked to an employee.");

        return (user, employee);
    }

    private async Task<HrSettings> GetOrCreateSettingsAsync(
        int organizationId,
        int employeeId)
    {
        var settings = await _context.HrSettings
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == organizationId &&
                x.EmployeeId == employeeId &&
                !x.IsDeleted);

        if (settings != null)
            return settings;

        settings = new HrSettings
        {
            OrganizationId = organizationId,
            EmployeeId = employeeId,
            LeaveRequests = true,
            AttendanceAlerts = true,
            EmployeeUpdates = true,
            BatchScheduleUpdates = true,
            PerformanceUpdates = false,
            InstituteAnnouncements = true,
            DarkMode = false,
            CompactView = false,
            SidebarCollapsedByDefault = false,
            AccentColor = "#2563eb",
            TwoFactorEnabled = false,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        await _context.HrSettings.AddAsync(settings);
        await _context.SaveChangesAsync();

        return settings;
    }

    // ============================================================
    // PROFILE
    // ============================================================

    public async Task<HrSettingsProfileDto?> GetProfileAsync()
    {
        var (user, employee) = await GetCurrentUserAsync();

        var profile = await _context.EmployeeProfiles
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == employee.OrganizationId &&
                x.EmployeeId == employee.EmployeeId &&
                !x.IsDeleted);

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        return new HrSettingsProfileDto
        {
            FirstName = employee.FirstName,
            LastName = employee.LastName,

            // EmployeeCode is stored in EmployeeProfile
            EmployeeId = string.IsNullOrWhiteSpace(profile?.EmployeeCode)
          ? $"P{employee.EmployeeId}"
          : profile.EmployeeCode,

            Email = employee.Email,
            Phone = employee.Phone,
            CountryCode = null,

            Role = employee.User?.Role.ToString() ?? string.Empty,

            // Department and Designation are stored in EmployeeProfile
            Department = profile?.Department?.Name ?? string.Empty,
            Designation = profile?.Designation ?? string.Empty,

            PhotoUrl = employee.ProfilePhotoUrl
        };
    }

    public async Task<HrSettingsProfileDto?> UpdateProfileAsync(
        HrSettingsProfileUpdateDto dto)
    {
        var (user, employee) = await GetCurrentUserAsync();

        var firstName = dto.FirstName?.Trim();
        var lastName = dto.LastName?.Trim();
        var email = dto.Email?.Trim();
        var phone = dto.Phone?.Trim();

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        var duplicateEmail = await _context.Users
            .AnyAsync(x =>
                x.UserId != user.UserId &&
                x.Email == email &&
                !x.IsDeleted);

        if (duplicateEmail)
            throw new ArgumentException(
                "Email address is already used by another user.");

        if (!string.IsNullOrWhiteSpace(phone))
        {
            var duplicatePhone = await _context.Users
                .AnyAsync(x =>
                    x.UserId != user.UserId &&
                    x.Phone == phone &&
                    !x.IsDeleted);

            if (duplicatePhone)
                throw new ArgumentException(
                    "Phone number is already used by another user.");
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.Email = email;
        user.Phone = string.IsNullOrWhiteSpace(phone)
            ? null
            : phone;

        employee.FirstName = firstName;
        employee.LastName = lastName;
        employee.Email = email;
        employee.Phone = string.IsNullOrWhiteSpace(phone)
            ? string.Empty
            : phone;

        await _context.SaveChangesAsync();

        return await GetProfileAsync();
    }

    

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    public async Task<HrSettingsNotificationDto>
        GetNotificationsAsync()
    {
        var (_, employee) = await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        return MapNotifications(settings);
    }

    public async Task<HrSettingsNotificationDto>
        UpdateNotificationsAsync(
            HrSettingsNotificationDto dto)
    {
        var (_, employee) = await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        settings.LeaveRequests = dto.LeaveRequests;
        settings.AttendanceAlerts = dto.AttendanceAlerts;
        settings.EmployeeUpdates = dto.EmployeeUpdates;
        settings.BatchScheduleUpdates = dto.BatchScheduleUpdates;
        settings.PerformanceUpdates = dto.PerformanceUpdates;
        settings.InstituteAnnouncements =
            dto.InstituteAnnouncements;

        settings.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapNotifications(settings);
    }

    private static HrSettingsNotificationDto MapNotifications(
        HrSettings settings)
    {
        return new HrSettingsNotificationDto
        {
            LeaveRequests = settings.LeaveRequests,
            AttendanceAlerts = settings.AttendanceAlerts,
            EmployeeUpdates = settings.EmployeeUpdates,
            BatchScheduleUpdates =
                settings.BatchScheduleUpdates,
            PerformanceUpdates =
                settings.PerformanceUpdates,
            InstituteAnnouncements =
                settings.InstituteAnnouncements
        };
    }

    // ============================================================
    // SECURITY
    // ============================================================

    public async Task<HrSettingsSecurityDto>
        GetSecurityAsync()
    {
        var (_, employee) = await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        return new HrSettingsSecurityDto
        {
            TwoFactorEnabled = settings.TwoFactorEnabled,

            PasswordPolicy = new HrSettingsPasswordPolicyDto
            {
                MinLength = 8,
                RequireUppercase = true,
                RequireLowercase = true,
                RequireNumber = true,
                RequireSpecialChar = true
            }
        };
    }

    public async Task<bool> ChangePasswordAsync(
        HrSettingsChangePasswordDto dto)
    {
        var (user, _) = await GetCurrentUserAsync();

        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            throw new ArgumentException(
                "Current password is required.");

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            throw new ArgumentException(
                "New password is required.");

        ValidatePasswordPolicy(dto.NewPassword);

        if (dto.CurrentPassword == dto.NewPassword)
            throw new ArgumentException(
                "New password must be different from current password.");

        var currentHash =
            HashPassword(dto.CurrentPassword);

        if (!string.Equals(
                user.PasswordHash,
                currentHash,
                StringComparison.Ordinal))
        {
            return false;
        }

        user.PasswordHash =
            HashPassword(dto.NewPassword);

        await _context.SaveChangesAsync();

        return true;
    }

    private static void ValidatePasswordPolicy(string password)
    {
        if (password.Length < 8)
            throw new ArgumentException(
                "Password must be at least 8 characters long.");

        if (!password.Any(char.IsUpper))
            throw new ArgumentException(
                "Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsLower))
            throw new ArgumentException(
                "Password must contain at least one lowercase letter.");

        if (!password.Any(char.IsDigit))
            throw new ArgumentException(
                "Password must contain at least one number.");

        if (!password.Any(ch =>
                !char.IsLetterOrDigit(ch)))
        {
            throw new ArgumentException(
                "Password must contain at least one special character.");
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();

        var bytes =
            Encoding.UTF8.GetBytes(password);

        var hash =
            sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }

    // ============================================================
    // SESSIONS
    // ============================================================

    public async Task<HrSettingsSessionsResponseDto>
        GetSessionsAsync()
    {
        var httpContext =
            _httpContextAccessor.HttpContext;

        if (httpContext == null)
            throw new UnauthorizedAccessException(
                "HTTP context is unavailable.");

        var principal = httpContext.User;

        if (principal.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException(
                "User is not authenticated.");

        var sessionId =
            principal.FindFirst("jti")?.Value;

        if (string.IsNullOrWhiteSpace(sessionId))
        {
            var token =
                await httpContext.GetTokenAsync("access_token");

            if (!string.IsNullOrWhiteSpace(token))
            {
                sessionId = Convert.ToHexString(
                    SHA256.HashData(
                        Encoding.UTF8.GetBytes(token)))
                    .Substring(0, 32);
            }
            else
            {
                sessionId = "current-session";
            }
        }

        var userAgent =
            httpContext.Request.Headers.UserAgent.ToString();

        if (string.IsNullOrWhiteSpace(userAgent))
            userAgent = "Unknown device";

        var ipAddress =
            httpContext.Connection.RemoteIpAddress?.ToString();

        return new HrSettingsSessionsResponseDto
        {
            Items = new List<HrSettingsSessionDto>
            {
                new HrSettingsSessionDto
                {
                    SessionId = sessionId,
                    Device = userAgent,
                    Location = ipAddress,
                    LastActive = DateTime.UtcNow,
                    Current = true
                }
            }
        };
    }

    public async Task<bool> DeleteSessionAsync(
        string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return false;

        var sessions = await GetSessionsAsync();

        var session = sessions.Items.FirstOrDefault(
            x => x.SessionId == sessionId);

        if (session == null)
            return false;

        /*
         * JWT authentication is currently stateless in TalentSphere.
         * Therefore an existing JWT cannot be physically revoked
         * here without adding a persistent session/revocation store.
         *
         * This endpoint validates that the requested session belongs
         * to the currently authenticated user.
         */
        return true;
    }

    // ============================================================
    // TWO FACTOR AUTHENTICATION
    // ============================================================

    public async Task<HrSettingsTwoFactorEnableResponseDto>
        EnableTwoFactorAsync()
    {
        var (_, employee) = await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        settings.TwoFactorEnabled = true;
        settings.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new HrSettingsTwoFactorEnableResponseDto
        {
            Enabled = true,
            QrCodeUrl = null
        };
    }

    public async Task<HrSettingsTwoFactorDisableResponseDto>
        DisableTwoFactorAsync()
    {
        var (_, employee) = await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        settings.TwoFactorEnabled = false;
        settings.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new HrSettingsTwoFactorDisableResponseDto
        {
            Enabled = false
        };
    }

    // ============================================================
    // PERMISSIONS
    // ============================================================

    public async Task<HrSettingsPermissionsDto>
        GetPermissionsAsync()
    {
        var (user, employee) =
            await GetCurrentUserAsync();

        var role = user.Role;

        var employeePermissionRows =
            await _context.EmployeePermissions
                .Include(x => x.Permission)
                .Where(x =>
                    x.EmployeeId == employee.EmployeeId &&
                    x.Permission.IsActive)
                .ToListAsync();

        var rolePermissionRows =
            await _context.RolePermissions
                .Include(x => x.Permission)
                .Where(x =>
                    x.Role == role &&
                    x.Permission.IsActive &&
                    (x.OrganizationId == null ||
                     x.OrganizationId == employee.OrganizationId))
                .ToListAsync();

        var permissionMap =
            new Dictionary<string, HashSet<string>>(
                StringComparer.OrdinalIgnoreCase);

        foreach (var row in rolePermissionRows)
        {
            AddPermission(
                permissionMap,
                row.Permission.Module,
                row.CanView,
                row.CanAdd,
                row.CanEdit,
                row.CanDelete,
                row.CanAccess);
        }

        foreach (var row in employeePermissionRows)
        {
            /*
             * Employee-specific permissions override role permissions.
             * Replace the module entry instead of merging it.
             */
            permissionMap[row.Permission.Module] =
                new HashSet<string>(
                    StringComparer.OrdinalIgnoreCase);

            AddPermission(
                permissionMap,
                row.Permission.Module,
                row.CanView,
                row.CanAdd,
                row.CanEdit,
                row.CanDelete,
                row.CanAccess);
        }

        var modules = permissionMap
            .OrderBy(x => x.Key)
            .Select(x => new HrSettingsPermissionModuleDto
            {
                Module = x.Key,
                Permissions = string.Join(
                    ", ",
                    x.Value.OrderBy(y => y))
            })
            .ToList();

        var profile = await _context.EmployeeProfiles
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == employee.OrganizationId &&
                x.EmployeeId == employee.EmployeeId &&
                !x.IsDeleted);

        var accessLevel =
            employeePermissionRows.Any()
                ? "Employee Override"
                : "Role";

        return new HrSettingsPermissionsDto
        {
            Role = role.ToString(),
            Department =
                profile?.Department?.Name ?? string.Empty,
            EmployeeId =
                employee.EmployeeId.ToString(),
            AccessLevel = accessLevel,
            Modules = modules
        };
    }

    private static void AddPermission(
        Dictionary<string, HashSet<string>> map,
        string module,
        bool canView,
        bool canAdd,
        bool canEdit,
        bool canDelete,
        bool canAccess)
    {
        if (!map.TryGetValue(module, out var permissions))
        {
            permissions =
                new HashSet<string>(
                    StringComparer.OrdinalIgnoreCase);

            map[module] = permissions;
        }

        if (canView)
            permissions.Add("View");

        if (canAdd)
            permissions.Add("Add");

        if (canEdit)
            permissions.Add("Edit");

        if (canDelete)
            permissions.Add("Delete");

        if (canAccess)
            permissions.Add("Access");
    }

    public async Task<HrSettingsPermissionModulesDto>
        GetPermissionModulesAsync()
    {
        var (_, employee) =
            await GetCurrentUserAsync();

        var modules = await _context.Permissions
            .Where(x => x.IsActive)
            .Select(x => x.Module)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return new HrSettingsPermissionModulesDto
        {
            Items = modules
        };
    }

    // ============================================================
    // APPEARANCE
    // ============================================================

    public async Task<HrSettingsAppearanceDto>
        GetAppearanceAsync()
    {
        var (_, employee) =
            await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        return MapAppearance(settings);
    }

    public async Task<HrSettingsAppearanceDto>
        UpdateAppearanceAsync(
            HrSettingsAppearanceDto dto)
    {
        var (_, employee) =
            await GetCurrentUserAsync();

        var settings = await GetOrCreateSettingsAsync(
            employee.OrganizationId,
            employee.EmployeeId);

        settings.DarkMode = dto.DarkMode;
        settings.CompactView = dto.CompactView;
        settings.SidebarCollapsedByDefault =
            dto.SidebarCollapsedByDefault;

        settings.AccentColor =
            string.IsNullOrWhiteSpace(dto.AccentColor)
                ? "#2563eb"
                : dto.AccentColor.Trim();

        settings.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapAppearance(settings);
    }

    private static HrSettingsAppearanceDto MapAppearance(
        HrSettings settings)
    {
        return new HrSettingsAppearanceDto
        {
            DarkMode = settings.DarkMode,
            CompactView = settings.CompactView,
            SidebarCollapsedByDefault =
                settings.SidebarCollapsedByDefault,
            AccentColor = settings.AccentColor
        };
    }
}