using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/hr/attendance")]
    public class HrAttendanceController : ControllerBase
    {
        private readonly IHrAttendanceService _service;

        public HrAttendanceController(
            IHrAttendanceService service)
        {
            _service = service;
        }


        // ============================================================
        // 1. SUMMARY
        // ============================================================

        [HttpGet("summary")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetSummary()
        {
            return Ok(
                await _service.GetSummaryAsync());
        }


        // ============================================================
        // 2. OVERVIEW
        // ============================================================

        [HttpGet("overview")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetOverview(
            [FromQuery] HrAttendanceOverviewQueryDto query)
        {
            try
            {
                return Ok(
                    await _service.GetOverviewAsync(query));
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
        // 3. DISTRIBUTION
        // ============================================================

        [HttpGet("distribution")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetDistribution(
            [FromQuery] DateOnly? date)
        {
            return Ok(
                await _service.GetDistributionAsync(date));
        }


        // ============================================================
        // 4. LIST
        // ============================================================

        [HttpGet]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetAttendance(
            [FromQuery] HrAttendanceFilterDto filter)
        {
            return Ok(
                await _service.GetAttendanceAsync(filter));
        }


        // ============================================================
        // 5. DETAIL
        // ============================================================

        [HttpGet("{attendanceId:int}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetById(
            int attendanceId)
        {
            var result =
                await _service.GetByIdAsync(
                    attendanceId);

            if (result == null)
            {
                return NotFound(new
                {
                    error = new
                    {
                        code = "NOT_FOUND",
                        message = "Attendance record not found."
                    }
                });
            }

            return Ok(result);
        }


        // ============================================================
        // 6. MARK
        // ============================================================

        [HttpPost("mark")]
        [HasPermission("Attendance", "edit")]
        public async Task<IActionResult> MarkAttendance(
            [FromBody] HrMarkAttendanceDto dto)
        {
            try
            {
                var result =
                    await _service.MarkAttendanceAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        attendanceId =
                            result.AttendanceId
                    },
                    result);
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
        }


        // ============================================================
        // 7. CORRECT
        // ============================================================

        [HttpPut("{attendanceId:int}")]
        [HasPermission("Attendance", "edit")]
        public async Task<IActionResult> UpdateAttendance(
            int attendanceId,
            [FromBody] HrUpdateAttendanceDto dto)
        {
            try
            {
                var result =
                    await _service.UpdateAttendanceAsync(
                        attendanceId,
                        dto);

                if (result == null)
                {
                    return NotFound(new
                    {
                        error = new
                        {
                            code = "NOT_FOUND",
                            message =
                                "Attendance record not found."
                        }
                    });
                }

                return Ok(result);
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
        // 8. EMPLOYEE HISTORY
        // ============================================================

        [HttpGet("employee/{employeeId}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetEmployeeHistory(
     string employeeId,
     [FromQuery] DateOnly? startDate,
     [FromQuery] DateOnly? endDate)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(employeeId))
                {
                    return BadRequest(new
                    {
                        error = new
                        {
                            code = "VALIDATION_ERROR",
                            message = "EmployeeId is required."
                        }
                    });
                }

                var normalized =
                    employeeId.Trim();

                if (normalized.StartsWith(
                        "EMP-",
                        StringComparison.OrdinalIgnoreCase))
                {
                    normalized =
                        normalized.Substring(4);
                }

                if (!int.TryParse(
                        normalized,
                        out var numericEmployeeId) ||
                    numericEmployeeId <= 0)
                {
                    return BadRequest(new
                    {
                        error = new
                        {
                            code = "VALIDATION_ERROR",
                            message = "Invalid employeeId."
                        }
                    });
                }

                return Ok(
                    await _service.GetEmployeeHistoryAsync(
                        numericEmployeeId,
                        startDate,
                        endDate));
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
        }

        // ============================================================
        // 9. EXPORT
        // ============================================================

        [HttpGet("export")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> Export(
            [FromQuery] HrAttendanceFilterDto filter)
        {
            var file =
                await _service.ExportAsync(filter);

            return File(
                file,
                "text/csv",
                $"Attendance_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
        }


        // ============================================================
        // 10. FILTERS
        // ============================================================

        [HttpGet("filters")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetFilters()
        {
            return Ok(
                await _service.GetFiltersAsync());
        }
    }
}