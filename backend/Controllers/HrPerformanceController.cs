using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/hr/performance")]
public class HrPerformanceController : ControllerBase
{
    private readonly IHrPerformanceService _service;

    public HrPerformanceController(
        IHrPerformanceService service)
    {
        _service = service;
    }


    // ============================================================
    // 1. SUMMARY
    // GET /api/hr/performance/summary
    // ============================================================

    [HttpGet("summary")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] string? period = "6M")
    {
        var result =
            await _service.GetSummaryAsync(
                period);

        return Ok(result);
    }


    // ============================================================
    // 2. TREND
    // GET /api/hr/performance/trend
    // ============================================================

    [HttpGet("trend")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetTrend()
    {
        var result =
            await _service.GetTrendAsync();

        return Ok(result);
    }


    // ============================================================
    // 3. BY ROLE
    // GET /api/hr/performance/by-role
    // ============================================================

    [HttpGet("by-role")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetByRole()
    {
        var result =
            await _service.GetByRoleAsync();

        return Ok(result);
    }


    // ============================================================
    // 4. PAGINATED LIST
    // GET /api/hr/performance
    // ============================================================

    [HttpGet]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetPerformance(
        [FromQuery] HrPerformanceFilterDto filter)
    {
        var result =
            await _service.GetPerformanceAsync(
                filter);

        return Ok(result);
    }


    // ============================================================
    // 5. DETAIL
    // GET /api/hr/performance/{performanceId}
    // ============================================================

    [HttpGet("{performanceId:int}")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetById(
        int performanceId)
    {
        var result =
            await _service.GetByIdAsync(
                performanceId);

        if (result == null)
        {
            return NotFound(new
            {
                error = new
                {
                    code = "NOT_FOUND",
                    message =
                        "Performance record not found."
                }
            });
        }

        return Ok(result);
    }


    // ============================================================
    // 6. EMPLOYEE HISTORY
    // GET /api/hr/performance/employee/{employeeId}
    // ============================================================

    [HttpGet("employee/{employeeId:int}")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult>
        GetEmployeeHistory(
            int employeeId)
    {
        if (employeeId <= 0)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message =
                        "Invalid employee ID."
                }
            });
        }

        var result =
            await _service
                .GetEmployeeHistoryAsync(
                    employeeId);

        return Ok(result);
    }


    // ============================================================
    // 7. CREATE
    // POST /api/hr/performance
    // ============================================================

    [HttpPost]
    [HasPermission("Performance", "add")]
    public async Task<IActionResult> Create(
        [FromBody] HrCreatePerformanceDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message =
                        "Request body is required."
                }
            });
        }

        try
        {
            var result =
                await _service.CreateAsync(
                    dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    performanceId =
                        result.PerformanceId
                },
                result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                error = new
                {
                    code = "NOT_FOUND",
                    message = ex.Message
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                error = new
                {
                    code = "CONFLICT",
                    message = ex.Message
                }
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }


    // ============================================================
    // 8. UPDATE
    // PUT /api/hr/performance/{performanceId}
    // ============================================================

    [HttpPut("{performanceId:int}")]
    [HasPermission("Performance", "edit")]
    public async Task<IActionResult> Update(
        int performanceId,
        [FromBody] HrUpdatePerformanceDto dto)
    {
        if (performanceId <= 0)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message =
                        "Invalid performance ID."
                }
            });
        }

        if (dto == null)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message =
                        "Request body is required."
                }
            });
        }

        try
        {
            var result =
                await _service.UpdateAsync(
                    performanceId,
                    dto);

            if (result == null)
            {
                return NotFound(new
                {
                    error = new
                    {
                        code = "NOT_FOUND",
                        message =
                            "Performance record not found."
                    }
                });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                error = new
                {
                    code = "CONFLICT",
                    message = ex.Message
                }
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }


    // ============================================================
    // 9. FILTERS
    // GET /api/hr/performance/filters
    // ============================================================

    [HttpGet("filters")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> GetFilters()
    {
        var result =
            await _service.GetFiltersAsync();

        return Ok(result);
    }


    // ============================================================
    // 10. EXPORT
    // GET /api/hr/performance/export
    // ============================================================

    [HttpGet("export")]
    [HasPermission("Performance", "view")]
    public async Task<IActionResult> Export(
        [FromQuery] HrPerformanceFilterDto filter)
    {
        var bytes =
            await _service.ExportAsync(
                filter);

        var fileName =
            $"performance-export-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

        return File(
            bytes,
            "text/csv",
            fileName);
    }
}