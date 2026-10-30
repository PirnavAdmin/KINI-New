using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student")]
    [Route("api/v1/student/courses")]
    public class StudentCoursesController
        : ControllerBase
    {
        private readonly IStudentCourseService _service;

        public StudentCoursesController(
            IStudentCourseService service)
        {
            _service = service;
        }

        // =====================================================
        // GET MY COURSES
        // GET:
        // /api/v1/student/courses
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetMyCourses()
        {
            // =================================================
            // Get identifier from JWT
            // =================================================

            var identifier =
                User.FindFirst(
                    ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(identifier))
            {
                return Unauthorized(new
                {
                    success = false,
                    message =
                        "Student identity was not found in the login token."
                });
            }

            // =================================================
            // Get courses
            // =================================================

            var result =
                await _service
                    .GetMyCoursesAsync(identifier);

            if (result == null)
            {
                return NotFound(new
                {
                    success = false,
                    message =
                        "Student record was not found."
                });
            }

            return Ok(result);
        }
    }
}