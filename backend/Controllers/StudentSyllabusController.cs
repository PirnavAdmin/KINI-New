using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student")]
    [Route("api/v1/student/courses")]
    public class StudentSyllabusController
        : ControllerBase
    {
        private readonly IStudentSyllabusService _service;

        public StudentSyllabusController(
            IStudentSyllabusService service)
        {
            _service = service;
        }

        // =====================================================
        // GET MY COURSE SYLLABUS
        //
        // GET:
        // /api/v1/student/courses/syllabus
        // =====================================================

        [HttpGet("syllabus")]
        public async Task<IActionResult> GetMySyllabus()
        {
            // =================================================
            // GET STUDENT IDENTIFIER FROM JWT
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
            // GET SYLLABUS
            // =================================================

            var result =
                await _service
                    .GetMySyllabusAsync(identifier);

            if (result == null)
            {
                return NotFound(new
                {
                    success = false,
                    message =
                        "Student record was not found."
                });
            }

            // =================================================
            // NO COURSE ASSIGNED
            // =================================================

            if (result.Course == null)
            {
                return NotFound(new
                {
                    success = false,
                    message =
                        "No course is assigned to this student.",
                    data = result
                });
            }

            // =================================================
            // SUCCESS
            // =================================================

            return Ok(new
            {
                success = true,

                message =
                    "Student syllabus retrieved successfully",

                data = result
            });
        }
    }
}