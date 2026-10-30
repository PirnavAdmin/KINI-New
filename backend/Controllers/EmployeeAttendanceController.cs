using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.EmployeeAttendance;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeeAttendanceController : ControllerBase
    {
        private readonly IEmployeeAttendanceService _service;

        public EmployeeAttendanceController(
            IEmployeeAttendanceService service)
        {
            _service = service;
        }

        // ============================================================
        // EMPLOYEE / MENTOR CHECK-IN
        // ============================================================

        [HttpPost("check-in")]
        [Authorize(Roles = "Employee,Mentor")]
        public async Task<IActionResult> CheckIn(
            [FromBody] CheckInDto dto)
        {
            try
            {
                var result = await _service.CheckInAsync(dto);

                return Ok(new
                {
                    success = true,
                    message = "Check-in successful.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ============================================================
        // EMPLOYEE / MENTOR CHECK-OUT
        // ============================================================

        [HttpPost("check-out")]
        [Authorize(Roles = "Employee,Mentor")]
        public async Task<IActionResult> CheckOut(
            [FromBody] CheckOutDto dto)
        {
            try
            {
                var result = await _service.CheckOutAsync(dto);

                return Ok(new
                {
                    success = true,
                    message = "Check-out successful.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ============================================================
        // ORGANIZATION ATTENDANCE LIST
        // ORGANIZATION ADMIN ONLY
        //
        // GET:
        // /api/EmployeeAttendance
        // ============================================================

        [HttpGet]
        [Authorize(Roles = "OrganizationAdmin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] AttendanceFilterDto filter)
        {
            var result = await _service.GetAllAsync(filter);

            return Ok(new
            {
                success = true,
                data = result
            });
        }

        // ============================================================
        // MY ATTENDANCE
        // EMPLOYEE / MENTOR
        //
        // IMPORTANT:
        // EmployeeId is NOT accepted from the frontend.
        // The service gets the employee ID from the logged-in user.
        //
        // GET:
        // /api/EmployeeAttendance/my
        //
        // Optional:
        // ?fromDate=2026-09-01&toDate=2026-09-14
        // ============================================================

        [HttpGet("my")]
        [Authorize(Roles = "Employee,Mentor")]
        public async Task<IActionResult> GetMyAttendance(
            [FromQuery] DateOnly? fromDate = null,
            [FromQuery] DateOnly? toDate = null)
        {
            try
            {
                if (fromDate.HasValue &&
                    toDate.HasValue &&
                    fromDate.Value > toDate.Value)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "FromDate cannot be greater than ToDate."
                    });
                }

                var result =
                    await _service.GetMyAttendanceAsync(
                        fromDate,
                        toDate);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ============================================================
        // ATTENDANCE REPORT
        // ORGANIZATION ADMIN ONLY
        //
        // GET:
        // /api/EmployeeAttendance/report
        // ============================================================

        [HttpGet("report")]
        [Authorize(Roles = "OrganizationAdmin")]
        public async Task<IActionResult> GetReport(
            [FromQuery] DateOnly fromDate,
            [FromQuery] DateOnly toDate,
            [FromQuery] int? employeeId)
        {
            try
            {
                var result =
                    await _service.GetReportAsync(
                        fromDate,
                        toDate,
                        employeeId);

                return Ok(new
                {
                    success = true,
                    data = result
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
        // MY ATTENDANCE REPORT
        // EMPLOYEE / MENTOR
        //
        // GET:
        // /api/EmployeeAttendance/my/report
        //
        // EmployeeId is taken from the logged-in user.
        // ============================================================

        [HttpGet("my/report")]
        [Authorize(Roles = "Employee,Mentor")]
        public async Task<IActionResult> GetMyReport(
            [FromQuery] DateOnly fromDate,
            [FromQuery] DateOnly toDate)
        {
            try
            {
                if (fromDate > toDate)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "FromDate cannot be greater than ToDate."
                    });
                }

                /*
                 * GetMyAttendanceAsync() already resolves the
                 * currently logged-in employee.
                 *
                 * We therefore fetch the employee's attendance
                 * and calculate the report without accepting
                 * an employeeId from the client.
                 */

                var attendance =
                    await _service.GetMyAttendanceAsync(
                        fromDate,
                        toDate);

                var attendanceList =
                    attendance.ToList();

                var report = attendanceList
                    .GroupBy(x => new
                    {
                        x.EmployeeId,
                        x.EmployeeName
                    })
                    .Select(group => new EmployeeAttendanceReportDto
                    {
                        EmployeeId = group.Key.EmployeeId,

                        EmployeeName = group.Key.EmployeeName,

                        TotalWorkingDays = group.Count(),

                        TotalWorkingHours =
                            Math.Round(
                                group.Sum(x => x.WorkingHours),
                                2),

                        AverageWorkingHours =
                            group.Any()
                                ? Math.Round(
                                    group.Average(x => x.WorkingHours),
                                    2)
                                : 0
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = report
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ============================================================
        // ATTENDANCE CORRECTION REQUEST
        // EMPLOYEE / MENTOR
        // ============================================================

        [HttpPost("correction-request")]
        [Authorize(Roles = "Employee,Mentor")]
        public async Task<IActionResult> RequestCorrection(
            [FromBody] AttendanceCorrectionRequestDto dto)
        {
            try
            {
                var result =
                    await _service.RequestCorrectionAsync(dto);

                return Ok(new
                {
                    success = result,
                    message =
                        "Attendance correction request submitted successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
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
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}