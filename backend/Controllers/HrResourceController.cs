using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/hr/resources")]
[Authorize]
public class HrResourceController : ControllerBase
{
    private readonly IHrResourceService _resourceService;

    public HrResourceController(
        IHrResourceService resourceService)
    {
        _resourceService = resourceService;
    }

    // ============================================================
    // SUMMARY
    // GET /api/hr/resources/summary
    // ============================================================

    [HttpGet("summary")]
    public async Task<ActionResult<HrResourceSummaryDto>>
        GetSummary()
    {
        try
        {
            var result =
                await _resourceService.GetSummaryAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // LIST
    // GET /api/hr/resources
    // ============================================================

    [HttpGet]
    public async Task<ActionResult<HrResourcePagedResponse>>
        GetResources(
            [FromQuery] HrResourceFilterDto filter)
    {
        try
        {
            var result =
                await _resourceService.GetResourcesAsync(filter);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // DETAIL
    // GET /api/hr/resources/{resourceId}
    // ============================================================

    [HttpGet("{resourceId:int}")]
    public async Task<ActionResult<HrResourceDetailDto>>
        GetById(int resourceId)
    {
        try
        {
            var result =
                await _resourceService.GetByIdAsync(resourceId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Resource not found."
                });
            }

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // UPLOAD
    // POST /api/hr/resources
    // ============================================================

    [HttpPost]
    [RequestSizeLimit(100L * 1024L * 1024L)]
    public async Task<ActionResult<HrResourceDetailDto>>
        Upload(
            [FromForm] HrResourceUploadDto dto)
    {
        try
        {
            if (dto.File == null)
            {
                return BadRequest(new
                {
                    message = "File is required."
                });
            }

            var result =
                await _resourceService.UploadAsync(
                    dto.File,
                    dto.Name,
                    dto.Category,
                    dto.Description);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    resourceId =
                        result.ResourceId
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
        catch (NotSupportedException ex)
        {
            return StatusCode(
                StatusCodes.Status415UnsupportedMediaType,
                new
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
    // PUT /api/hr/resources/{resourceId}
    // ============================================================

    [HttpPut("{resourceId:int}")]
    public async Task<ActionResult<HrResourceDetailDto>>
        Update(
            int resourceId,
            [FromBody] HrResourceUpdateDto dto)
    {
        try
        {
            var result =
                await _resourceService.UpdateAsync(
                    resourceId,
                    dto);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Resource not found."
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
    // DELETE /api/hr/resources/{resourceId}
    // ============================================================

    [HttpDelete("{resourceId:int}")]
    public async Task<IActionResult>
        Delete(int resourceId)
    {
        try
        {
            var deleted =
                await _resourceService.DeleteAsync(
                    resourceId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Resource not found."
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
    // DOWNLOAD
    // GET /api/hr/resources/{resourceId}/download
    // ============================================================

    [HttpGet("{resourceId:int}/download")]
    public async Task<IActionResult>
        Download(int resourceId)
    {
        try
        {
            var result =
                await _resourceService.DownloadAsync(
                    resourceId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Resource file not found."
                });
            }

            return File(
                result.Value.Content,
                result.Value.ContentType,
                result.Value.FileName);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // PREVIEW
    // GET /api/hr/resources/{resourceId}/preview
    // ============================================================

    [HttpGet("{resourceId:int}/preview")]
    public async Task<IActionResult>
        Preview(int resourceId)
    {
        try
        {
            var result =
                await _resourceService.PreviewAsync(
                    resourceId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Resource file not found."
                });
            }

            Response.Headers["Content-Disposition"] =
                $"inline; filename=\"{result.Value.FileName}\"";

            return File(
                result.Value.Content,
                result.Value.ContentType);
        }
        catch (NotSupportedException ex)
        {
            return StatusCode(
                StatusCodes.Status415UnsupportedMediaType,
                new
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
    // CATEGORIES
    // GET /api/hr/resources/categories
    // ============================================================

    [HttpGet("categories")]
    public async Task<ActionResult<HrResourceStringListDto>>
        GetCategories()
    {
        try
        {
            var result =
                await _resourceService.GetCategoriesAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // FILE TYPES
    // GET /api/hr/resources/file-types
    // ============================================================

    [HttpGet("file-types")]
    public async Task<ActionResult<HrResourceStringListDto>>
        GetFileTypes()
    {
        try
        {
            var result =
                await _resourceService.GetFileTypesAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // UPLOADERS
    // GET /api/hr/resources/uploaders
    // ============================================================

    [HttpGet("uploaders")]
    public async Task<ActionResult<HrResourceUploaderListDto>>
        GetUploaders()
    {
        try
        {
            var result =
                await _resourceService.GetUploadersAsync();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // ============================================================
    // EXPORT
    // GET /api/hr/resources/export
    // ============================================================

    [HttpGet("export")]
    public async Task<IActionResult>
        Export(
            [FromQuery] HrResourceFilterDto filter)
    {
        try
        {
            var content =
                await _resourceService.ExportAsync(filter);

            return File(
                content,
                "text/csv",
                $"hr-resources-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}