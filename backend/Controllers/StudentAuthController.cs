using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Services;
using Microsoft.AspNetCore.Authorization;
namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/students")]
    public class StudentAuthController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentAuthController(
            IStudentService studentService)
        {
            _studentService = studentService;
        }

        // ==================================================
        // STUDENT GOOGLE LOGIN
        // ==================================================

        [HttpPost("google-login")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleLogin(
     [FromBody] StudentGoogleLoginDto dto)
        {
            try
            {
                var response =
                    await _studentService.GoogleLoginAsync(dto);

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
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message = "Student Google login failed."
                    });
            }
        }
    }
}