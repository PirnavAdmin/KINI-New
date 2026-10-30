using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/mentor/dashboard")]
    [Authorize]
    public class MentorDashboardController : ControllerBase
    {
        private readonly IMentorDashboardService _dashboardService;

        public MentorDashboardController(
            IMentorDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // ============================================================
        // GET DASHBOARD
        // Dashboard -> View
        // ============================================================

        [HttpGet("{mentorId:int}")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetDashboard(
            int mentorId)
        {
            var dashboard =
                await _dashboardService
                    .GetDashboardAsync(mentorId);

            return Ok(dashboard);
        }

        // ============================================================
        // TODAY CLASSES
        // Dashboard -> View
        // ============================================================

        [HttpGet("{mentorId:int}/today")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetTodayClasses(
            int mentorId)
        {
            var classes =
                await _dashboardService
                    .GetTodayClassesAsync(mentorId);

            return Ok(classes);
        }

        // ============================================================
        // UPCOMING CLASSES
        // Dashboard -> View
        // ============================================================

        [HttpGet("{mentorId:int}/upcoming")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetUpcomingClasses(
            int mentorId)
        {
            var classes =
                await _dashboardService
                    .GetUpcomingClassesAsync(mentorId);

            return Ok(classes);
        }

        // ============================================================
        // ATTENDANCE SUMMARY
        // Dashboard -> View
        // ============================================================

        [HttpGet("{mentorId:int}/attendance")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetAttendanceSummary(
            int mentorId)
        {
            var summary =
                await _dashboardService
                    .GetAttendanceSummaryAsync(mentorId);

            return Ok(summary);
        }

        // ============================================================
        // MY COURSES
        // Dashboard -> View
        // ============================================================

        [HttpGet("courses")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ??
                User.FindFirst("sub")?.Value
                ??
                User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message =
                        "Invalid user identity."
                });
            }

            var courses =
                await _dashboardService
                    .GetMentorCoursesAsync(userId);

            return Ok(new
            {
                Success = true,
                Message =
                    "Mentor courses retrieved successfully.",
                Data = courses
            });
        }

        // ============================================================
        // COURSE SYLLABUS
        // Dashboard -> View
        // ============================================================

        [HttpGet(
            "courses/{courseId:int}/syllabus")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetMyCourseSyllabus(
            int courseId)
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ??
                User.FindFirst("sub")?.Value
                ??
                User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message =
                        "Invalid user identity."
                });
            }

            var syllabus =
                await _dashboardService
                    .GetMentorCourseSyllabusAsync(
                        userId,
                        courseId);

            if (syllabus == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message =
                        "Course not found or course is not assigned to this mentor."
                });
            }

            return Ok(new
            {
                Success = true,
                Message =
                    "Mentor course syllabus retrieved successfully.",
                Data = syllabus
            });
        }

        // ============================================================
        // MY BATCHES
        // Dashboard -> View
        // ============================================================

        [HttpGet("batches")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetMyBatches(
            int page = 1,
            int pageSize = 10,
            BatchStatus? status = null,
            string? search = null)
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ??
                User.FindFirst("sub")?.Value
                ??
                User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message =
                        "Invalid user identity."
                });
            }

            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            try
            {
                var batches =
                    await _dashboardService
                        .GetMentorBatchesAsync(
                            userId,
                            page,
                            pageSize,
                            status,
                            search);

                return Ok(new
                {
                    Success = true,
                    Message =
                        "Mentor batches retrieved successfully.",
                    Data = batches
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        Success = false,
                        Message =
                            "Unable to retrieve mentor batches.",
                        Error = ex.Message
                    });
            }
        }

        // ============================================================
        // MY STUDENTS
        // Dashboard -> View
        // ============================================================

        [HttpGet("students")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetMyStudents()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ??
                User.FindFirst("sub")?.Value
                ??
                User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message =
                        "Invalid user identity."
                });
            }

            var students =
                await _dashboardService
                    .GetMentorStudentsAsync(userId);

            return Ok(new
            {
                Success = true,
                Message =
                    "Mentor students retrieved successfully.",
                Data = students
            });
        }

        // ============================================================
        // MY CLASSES
        // Dashboard -> View
        // ============================================================

        [HttpGet("classes")]
        [HasPermission("Dashboard", "view")]
        public async Task<IActionResult> GetMyClasses()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ??
                User.FindFirst("sub")?.Value
                ??
                User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message =
                        "Invalid user identity."
                });
            }

            var classes =
                await _dashboardService
                    .GetMentorClassesAsync(userId);

            return Ok(new
            {
                Success = true,
                Message =
                    "Mentor classes retrieved successfully.",
                Data = classes
            });
        }
    }
}