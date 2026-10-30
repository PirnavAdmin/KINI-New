using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/hr/announcements")]
[Authorize]
public class HrAnnouncementController : ControllerBase
{
    private readonly IHrAnnouncementService _announcementService;

    public HrAnnouncementController(
        IHrAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }


    // ============================================================
    // SUMMARY
    // GET /api/hr/announcements/summary
    // ============================================================

    [HttpGet("summary")]
    [HasPermission("Announcements", "view")]
    public async Task<ActionResult<HrAnnouncementSummaryDto>>
        GetSummary()
    {
        var result =
            await _announcementService.GetSummaryAsync();

        return Ok(result);
    }


    // ============================================================
    // LIST
    // GET /api/hr/announcements
    // ============================================================

    [HttpGet]
    [HasPermission("Announcements", "view")]
    public async Task<ActionResult<HrAnnouncementPagedResponse>>
        GetAnnouncements(
            [FromQuery] HrAnnouncementFilterDto filter)
    {
        var result =
            await _announcementService
                .GetAnnouncementsAsync(filter);

        return Ok(result);
    }


    // ============================================================
    // DETAIL
    // GET /api/hr/announcements/{announcementId}
    // ============================================================

    [HttpGet("{announcementId:int}")]
    [HasPermission("Announcements", "view")]
    public async Task<ActionResult<HrAnnouncementDetailDto>>
        GetById(
            int announcementId)
    {
        var result =
            await _announcementService
                .GetByIdAsync(announcementId);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Announcement not found."
            });
        }

        return Ok(result);
    }


    // ============================================================
    // CREATE
    // POST /api/hr/announcements
    // ============================================================

    [HttpPost]
    [HasPermission("Announcements", "add")]
    public async Task<ActionResult<HrAnnouncementDetailDto>>
        Create(
            [FromBody] HrAnnouncementCreateDto dto)
    {
        try
        {
            var result =
                await _announcementService
                    .CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    announcementId =
                        result.AnnouncementId
                },
                result);
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
            return Forbid();
        }
    }


    // ============================================================
    // UPDATE
    // PUT /api/hr/announcements/{announcementId}
    // ============================================================

    [HttpPut("{announcementId:int}")]
    [HasPermission("Announcements", "edit")]
    public async Task<ActionResult<HrAnnouncementDetailDto>>
        Update(
            int announcementId,
            [FromBody] HrAnnouncementUpdateDto dto)
    {
        try
        {
            var result =
                await _announcementService
                    .UpdateAsync(
                        announcementId,
                        dto);

            if (result == null)
            {
                return NotFound(new
                {
                    message =
                        "Announcement not found."
                });
            }

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
            return Forbid();
        }
    }


    // ============================================================
    // DELETE
    // DELETE /api/hr/announcements/{announcementId}
    // ============================================================

    [HttpDelete("{announcementId:int}")]
    [HasPermission("Announcements", "delete")]
    public async Task<IActionResult>
        Delete(
            int announcementId)
    {
        try
        {
            var deleted =
                await _announcementService
                    .DeleteAsync(
                        announcementId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message =
                        "Announcement not found."
                });
            }

            return Ok(new
            {
                success = true
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // OPTIONS
    // GET /api/hr/announcements/options
    // ============================================================

    [HttpGet("options")]
    [HasPermission("Announcements", "view")]
    public async Task<ActionResult<HrAnnouncementOptionsDto>>
        GetOptions()
    {
        var result =
            await _announcementService
                .GetOptionsAsync();

        return Ok(result);
    }


    // ============================================================
    // EXPORT
    // GET /api/hr/announcements/export
    // ============================================================

    [HttpGet("export")]
    [HasPermission("Announcements", "view")]
    public async Task<IActionResult>
        Export(
            [FromQuery] HrAnnouncementFilterDto filter)
    {
        var content =
            await _announcementService
                .ExportAsync(filter);

        return File(
            content,
            "text/csv",
            $"hr-announcements-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}