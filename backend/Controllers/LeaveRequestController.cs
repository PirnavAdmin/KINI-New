using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.LeaveRequest;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/leave-requests")]
    [Authorize]
    public class LeaveRequestController : ControllerBase
    {
        private readonly ILeaveRequestService _service;

        public LeaveRequestController(
            ILeaveRequestService service)
        {
            _service = service;
        }

        // =========================================================
        // CREATE LEAVE REQUEST
        // EMPLOYEE / MENTOR / HR
        // =========================================================

        [HttpPost]
        [Authorize(
            Roles = "Employee,Mentor,HR,HRRecruiter,HRExecutive,OperationAssociate")]
        public async Task<IActionResult> Create(
            [FromBody] CreateLeaveRequestDto dto)
        {
            try
            {
                var result =
                    await _service.CreateAsync(
                        dto.LeaveType,
                        dto.StartDate,
                        dto.EndDate,
                        dto.Reason);

                return Ok(new
                {
                    success = true,
                    message =
                        "Leave request submitted successfully.",
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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =========================================================
        // MY LEAVE REQUESTS
        // =========================================================

        [HttpGet("my")]
        [Authorize(
            Roles = "Employee,Mentor,HR,HRRecruiter,HRExecutive,OperationAssociate")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var result =
                    await _service.GetMyRequestsAsync();

                return Ok(new
                {
                    success = true,
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
        }

        // =========================================================
        // ALL LEAVE REQUESTS
        // ORGANIZATION ADMIN
        // =========================================================

        [HttpGet]
        [Authorize(Roles = "OrganizationAdmin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result =
                    await _service.GetAllAsync();

                return Ok(new
                {
                    success = true,
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
        }

        // =========================================================
        // APPROVE
        // ORGANIZATION ADMIN
        // =========================================================

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "OrganizationAdmin")]
        public async Task<IActionResult> Approve(
            int id)
        {
            try
            {
                var result =
                    await _service.ApproveAsync(id);

                return Ok(new
                {
                    success = true,
                    message =
                        "Leave request approved successfully.",
                    data = result
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
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

        // =========================================================
        // REJECT
        // ORGANIZATION ADMIN
        // =========================================================

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "OrganizationAdmin")]
        public async Task<IActionResult> Reject(
            int id)
        {
            try
            {
                var result =
                    await _service.RejectAsync(id);

                return Ok(new
                {
                    success = true,
                    message =
                        "Leave request rejected successfully.",
                    data = result
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
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
    }
}