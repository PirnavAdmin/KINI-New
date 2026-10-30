using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
    public class EmployeeAuthController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeAuthController(
            IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpPost("google-login")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleLogin(
            [FromBody] EmployeeGoogleLoginDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Credential))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Google credential is required."
                });
            }

            try
            {
                var response =
                    await _employeeService.GoogleLoginAsync(
                        dto.Credential);

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
        }
    }
}