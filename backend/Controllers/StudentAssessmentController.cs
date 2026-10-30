
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.StudentAssessment;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student")]
    [Route("api/[controller]")]
    public class StudentAssessmentController : ControllerBase
    {
        private readonly IStudentAssessmentService
            _studentAssessmentService;

        public StudentAssessmentController(
            IStudentAssessmentService studentAssessmentService)
        {
            _studentAssessmentService =
                studentAssessmentService;
        }

        // ==========================================
        // Get Logged-in Student ID
        // ==========================================

        private bool TryGetStudentId(
            out int studentId)
        {
            studentId = 0;

            // IMPORTANT:
            // Student APIs use the StudentId claim,
            // NOT the universal UserId claim.

            var value =
                User.FindFirst("StudentId")?.Value;

            return int.TryParse(
                value,
                out studentId)
                && studentId > 0;
        }

        // ==========================================
        // Available Assessments
        // ==========================================

        [HttpGet("available")]
        public async Task<IActionResult>
            GetAvailableAssessments()
        {
            if (!TryGetStudentId(out var studentId))
            {
                return Unauthorized(new
                {
                    Message =
                        "Student identity was not found."
                });
            }

            var assessments =
                await _studentAssessmentService
                    .GetAvailableAssessmentsAsync(
                        studentId);

            return Ok(assessments);
        }

        // ==========================================
        // Start Assessment
        // ==========================================

        [HttpPost("start")]
        public async Task<IActionResult>
            StartAssessment(
                StartAssessmentDto dto)
        {
            if (!TryGetStudentId(out var studentId))
            {
                return Unauthorized(new
                {
                    Message =
                        "Student identity was not found."
                });
            }

            try
            {
                var id =
                    await _studentAssessmentService
                        .StartAssessmentAsync(
                            studentId,
                            dto);

                return Ok(new
                {
                    Message =
                        "Assessment started successfully.",

                    StudentAssessmentId = id
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    Message = ex.Message
                });
            }
        }

        // ==========================================
        // Get Assessment Questions
        // ==========================================

        [HttpGet("{studentAssessmentId:int}")]
        public async Task<IActionResult>
            GetAssessment(
                int studentAssessmentId)
        {
            if (!TryGetStudentId(out var studentId))
            {
                return Unauthorized(new
                {
                    Message =
                        "Student identity was not found."
                });
            }

            var assessment =
                await _studentAssessmentService
                    .GetAssessmentAsync(
                        studentId,
                        studentAssessmentId);

            if (assessment == null)
            {
                return NotFound(new
                {
                    Message =
                        "Assessment not found."
                });
            }

            return Ok(assessment);
        }

        // ==========================================
        // Submit Assessment
        // ==========================================

        [HttpPost("submit")]
        public async Task<IActionResult>
            SubmitAssessment(
                SubmitAssessmentDto dto)
        {
            if (!TryGetStudentId(out var studentId))
            {
                return Unauthorized(new
                {
                    Message =
                        "Student identity was not found."
                });
            }

            try
            {
                var result =
                    await _studentAssessmentService
                        .SubmitAssessmentAsync(
                            studentId,
                            dto);

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    Message = ex.Message
                });
            }
        }

        // ==========================================
        // Result
        // ==========================================

        [HttpGet("result/{studentAssessmentId:int}")]
        public async Task<IActionResult>
            GetResult(
                int studentAssessmentId)
        {
            if (!TryGetStudentId(out var studentId))
            {
                return Unauthorized(new
                {
                    Message =
                        "Student identity was not found."
                });
            }

            var result =
                await _studentAssessmentService
                    .GetResultAsync(
                        studentId,
                        studentAssessmentId);

            if (result == null)
            {
                return NotFound(new
                {
                    Message =
                        "Result not found."
                });
            }

            return Ok(result);
        }

       
    }
}
