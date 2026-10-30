using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrSettingsService
{
    // ============================================================
    // PROFILE
    // ============================================================

    Task<HrSettingsProfileDto?> GetProfileAsync();

    Task<HrSettingsProfileDto?> UpdateProfileAsync(
        HrSettingsProfileUpdateDto dto);

   


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    Task<HrSettingsNotificationDto> GetNotificationsAsync();

    Task<HrSettingsNotificationDto> UpdateNotificationsAsync(
        HrSettingsNotificationDto dto);


    // ============================================================
    // SECURITY
    // ============================================================

    Task<HrSettingsSecurityDto> GetSecurityAsync();

    Task<bool> ChangePasswordAsync(
        HrSettingsChangePasswordDto dto);


    // ============================================================
    // SESSIONS
    // ============================================================

    Task<HrSettingsSessionsResponseDto>
        GetSessionsAsync();

    Task<bool> DeleteSessionAsync(
        string sessionId);


    // ============================================================
    // TWO FACTOR AUTHENTICATION
    // ============================================================

    Task<HrSettingsTwoFactorEnableResponseDto>
        EnableTwoFactorAsync();

    Task<HrSettingsTwoFactorDisableResponseDto>
        DisableTwoFactorAsync();


    // ============================================================
    // PERMISSIONS
    // ============================================================

    Task<HrSettingsPermissionsDto>
        GetPermissionsAsync();

    Task<HrSettingsPermissionModulesDto>
        GetPermissionModulesAsync();


    // ============================================================
    // APPEARANCE
    // ============================================================

    Task<HrSettingsAppearanceDto>
        GetAppearanceAsync();

    Task<HrSettingsAppearanceDto>
        UpdateAppearanceAsync(
            HrSettingsAppearanceDto dto);
}