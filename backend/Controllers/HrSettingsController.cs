using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.DTOs.Profile;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/hr/settings")]
[Authorize]
public class HrSettingsController : ControllerBase
{
    private readonly IHrSettingsService _settingsService;
    private readonly IProfilePhotoService _profilePhotoService;

    public HrSettingsController(
     IHrSettingsService settingsService,
     IProfilePhotoService profilePhotoService)
    {
        _settingsService = settingsService;
        _profilePhotoService = profilePhotoService;
    }

    // ============================================================
    // 1. PROFILE
    // GET /api/hr/settings/profile
    // ============================================================

    [HttpGet("profile")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsProfileDto>>
        GetProfile()
    {
        try
        {
            var result = await _settingsService.GetProfileAsync();

            if (result == null)
                return NotFound(new
                {
                    message = "HR profile not found."
                });

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 2. UPDATE PROFILE
    // PUT /api/hr/settings/profile
    // ============================================================

    [HttpPut("profile")]
    [HasPermission("Settings", "edit")]
    public async Task<ActionResult<HrSettingsProfileDto>>
        UpdateProfile(
            [FromBody] HrSettingsProfileUpdateDto dto)
    {
        try
        {
            var result =
                await _settingsService.UpdateProfileAsync(dto);

            if (result == null)
                return NotFound(new
                {
                    message = "HR profile not found."
                });

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 3. PROFILE PHOTO
    // POST /api/hr/settings/profile/photo
    // ============================================================

    [HttpPost("profile/photo")]
    [HasPermission("Settings", "edit")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UpdateProfilePhoto(
       IFormFile photo)
    {
        try
        {
            if (photo == null || photo.Length == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Profile photo is required."
                });
            }

            var dto = new UploadProfilePhotoDto
            {
                Photo = photo
            };

            var result =
                await _profilePhotoService.UploadPhotoAsync(dto);

            return Ok(new
            {
                success = true,
                message = "Profile photo uploaded successfully.",
                data = result
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // ============================================================
    // 4. NOTIFICATIONS
    // GET /api/hr/settings/notifications
    // ============================================================

    [HttpGet("notifications")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsNotificationDto>>
        GetNotifications()
    {
        try
        {
            var result =
                await _settingsService.GetNotificationsAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 5. UPDATE NOTIFICATIONS
    // PUT /api/hr/settings/notifications
    // ============================================================

    [HttpPut("notifications")]
    [HasPermission("Settings", "edit")]
    public async Task<ActionResult<HrSettingsNotificationDto>>
        UpdateNotifications(
            [FromBody] HrSettingsNotificationDto dto)
    {
        try
        {
            var result =
                await _settingsService
                    .UpdateNotificationsAsync(dto);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 6. SECURITY
    // GET /api/hr/settings/security
    // ============================================================

    [HttpGet("security")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsSecurityDto>>
        GetSecurity()
    {
        try
        {
            var result =
                await _settingsService.GetSecurityAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 7. CHANGE PASSWORD
    // PUT /api/hr/settings/security/password
    // ============================================================

    [HttpPut("security/password")]
    [HasPermission("Settings", "edit")]
    public async Task<ActionResult<HrSettingsSuccessDto>>
        ChangePassword(
            [FromBody] HrSettingsChangePasswordDto dto)
    {
        try
        {
            var changed =
                await _settingsService.ChangePasswordAsync(dto);

            if (!changed)
            {
                return Unauthorized(new
                {
                    message = "Current password is incorrect."
                });
            }

            return Ok(new HrSettingsSuccessDto
            {
                Success = true
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 8. SESSIONS
    // GET /api/hr/settings/security/sessions
    // ============================================================

    [HttpGet("security/sessions")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsSessionsResponseDto>>
        GetSessions()
    {
        try
        {
            var result =
                await _settingsService.GetSessionsAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 9. DELETE SESSION
    // DELETE /api/hr/settings/security/sessions/{sessionId}
    // ============================================================

    [HttpDelete("security/sessions/{sessionId}")]
    [HasPermission("Settings", "edit")]
    public async Task<IActionResult>
        DeleteSession(string sessionId)
    {
        try
        {
            var deleted =
                await _settingsService
                    .DeleteSessionAsync(sessionId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Session not found."
                });
            }

            return Ok(new
            {
                success = true
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 10. ENABLE 2FA
    // POST /api/hr/settings/security/2fa/enable
    // ============================================================

    [HttpPost("security/2fa/enable")]
    [HasPermission("Settings", "edit")]
    public async Task<
        ActionResult<HrSettingsTwoFactorEnableResponseDto>>
        EnableTwoFactor()
    {
        try
        {
            var result =
                await _settingsService.EnableTwoFactorAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 11. DISABLE 2FA
    // POST /api/hr/settings/security/2fa/disable
    // ============================================================

    [HttpPost("security/2fa/disable")]
    [HasPermission("Settings", "edit")]
    public async Task<
        ActionResult<HrSettingsTwoFactorDisableResponseDto>>
        DisableTwoFactor()
    {
        try
        {
            var result =
                await _settingsService.DisableTwoFactorAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 12. PERMISSIONS
    // GET /api/hr/settings/permissions
    // ============================================================

    [HttpGet("permissions")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsPermissionsDto>>
        GetPermissions()
    {
        try
        {
            var result =
                await _settingsService.GetPermissionsAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 13. PERMISSION MODULES
    // GET /api/hr/settings/permissions/modules
    // ============================================================

    [HttpGet("permissions/modules")]
    [HasPermission("Settings", "view")]
    public async Task<
        ActionResult<HrSettingsPermissionModulesDto>>
        GetPermissionModules()
    {
        try
        {
            var result =
                await _settingsService
                    .GetPermissionModulesAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 14. APPEARANCE
    // GET /api/hr/settings/appearance
    // ============================================================

    [HttpGet("appearance")]
    [HasPermission("Settings", "view")]
    public async Task<ActionResult<HrSettingsAppearanceDto>>
        GetAppearance()
    {
        try
        {
            var result =
                await _settingsService.GetAppearanceAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }

    // ============================================================
    // 15. UPDATE APPEARANCE
    // PUT /api/hr/settings/appearance
    // ============================================================

    [HttpPut("appearance")]
    [HasPermission("Settings", "edit")]
    public async Task<ActionResult<HrSettingsAppearanceDto>>
        UpdateAppearance(
            [FromBody] HrSettingsAppearanceDto dto)
    {
        try
        {
            var result =
                await _settingsService
                    .UpdateAppearanceAsync(dto);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message = "Authenticated HR user could not be resolved."
            });
        }
    }
}