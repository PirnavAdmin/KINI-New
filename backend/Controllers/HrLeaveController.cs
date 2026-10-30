using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/hr/leave")]
    public class HrLeaveController : ControllerBase
    {
        private readonly IHrLeaveService _service;

        public HrLeaveController(
            IHrLeaveService service)
        {
            _service = service;
        }


        // ============================================================
        // 1. SUMMARY
        // ============================================================

        [HttpGet("summary")]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetSummary()
        {
            return Ok(
                await _service.GetSummaryAsync());
        }


        // ============================================================
        // 2. LIST
        // ============================================================

        [HttpGet]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetLeaves(
            [FromQuery] HrLeaveQueryDto query)
        {
            try
            {
                return Ok(
                    await _service.GetLeavesAsync(query));
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
        // 3. DETAIL
        // ============================================================

        [HttpGet("{leaveId:int}")]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetById(
            int leaveId)
        {
            var result =
                await _service.GetByIdAsync(
                    leaveId);

            if (result == null)
            {
                return NotFound(new
                {
                    error = new
                    {
                        code = "NOT_FOUND",
                        message =
                            "Leave request not found."
                    }
                });
            }

            return Ok(result);
        }


        // ============================================================
        // 4. CREATE
        // ============================================================

        [HttpPost]
        [HasPermission("Leave Management", "add")]
        public async Task<IActionResult> Create(
            [FromBody] HrCreateLeaveDto dto)
        {
            try
            {
                var result =
                    await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        leaveId =
                            result.LeaveId
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
        // 5. APPROVE
        // ============================================================

        [HttpPut("{leaveId:int}/approve")]
        [HasPermission("Leave Management", "edit")]
        public async Task<IActionResult> Approve(
            int leaveId)
        {
            try
            {
                return Ok(
                    await _service.ApproveAsync(
                        leaveId));
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
        // 6. REJECT
        // ============================================================

        [HttpPut("{leaveId:int}/reject")]
        [HasPermission("Leave Management", "edit")]
        public async Task<IActionResult> Reject(
            int leaveId,
            [FromBody] HrRejectLeaveDto dto)
        {
            try
            {
                return Ok(
                    await _service.RejectAsync(
                        leaveId,
                        dto.RejectionReason));
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
        // 7. EMPLOYEE HISTORY
        // ============================================================

        [HttpGet("employee/{employeeId:int}")]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetEmployeeHistory(
            int employeeId)
        {
            try
            {
                return Ok(
                    await _service
                        .GetEmployeeHistoryAsync(
                            employeeId));
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
        // 8. BALANCE
        // ============================================================

        [HttpGet("balance/{employeeId:int}")]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetBalance(
            int employeeId)
        {
            try
            {
                return Ok(
                    await _service
                        .GetBalanceAsync(
                            employeeId));
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
        // 9. TYPES
        // ============================================================

        [HttpGet("types")]
        [HasPermission("Leave Management", "view")]
        public async Task<IActionResult> GetTypes()
        {
            return Ok(
                await _service.GetTypesAsync());
        }
    }
}