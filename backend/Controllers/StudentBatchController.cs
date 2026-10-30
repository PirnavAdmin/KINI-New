using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Services.Tenancy;
namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
  
    public class StudentBatchController : ControllerBase
    {
        private readonly IStudentBatchService _service;
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public StudentBatchController(
            ApplicationDbContext context,
    ITenantContext tenantContext,
            IStudentBatchService service)
        {
            _service = service;
            _context = context;
            _tenantContext = tenantContext;
        }

        // =====================================================
        // GET ENROLLED STUDENTS
        // GET: /api/StudentBatch/{batchId}/students
        // =====================================================

        [HttpGet("{batchId}/students")]
        public async Task<IActionResult> GetStudentsByBatchId(
            int batchId)
        {
            if (batchId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid batch ID."
                });
            }

            var result =
                await _service.GetStudentsByBatchIdAsync(
                    batchId);

            if (result == null)
            {
                return NotFound(new
                {
                    message =
                        $"Batch with ID {batchId} was not found."
                });
            }

            return Ok(result);
        }

        // =====================================================
        // GET AVAILABLE STUDENTS
        // GET:
        // /api/StudentBatch/{batchId}/available-students
        // =====================================================

        [HttpGet("{batchId}/available-students")]
        public async Task<IActionResult> GetAvailableStudents(
            int batchId)
        {
            if (batchId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid batch ID."
                });
            }

            try
            {
                var result =
                    await _service.GetAvailableStudentsAsync(
                        batchId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // ENROLL STUDENTS
        // POST: /api/StudentBatch
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> EnrollStudentsToBatch(
            [FromBody] EnrollStudentsToBatchDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    message =
                        "Request body is required."
                });
            }

            if (dto.BatchId <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid batch ID."
                });
            }

            if (dto.StudentIds == null ||
                !dto.StudentIds.Any())
            {
                return BadRequest(new
                {
                    message =
                        "At least one student must be selected."
                });
            }

            try
            {
                var result =
                    await _service
                        .EnrollStudentsToBatchAsync(dto);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while enrolling students."
                    });
            }
        }


        [HttpGet("student/{studentId}/enrollments")]
        public async Task<IActionResult> GetStudentEnrollments(int studentId)
        {
            if (studentId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid student ID."
                });
            }

            var organizationId = _tenantContext.OrganizationId;

            var studentExists = await _context.Students
                .AnyAsync(s =>
                    s.StudentId == studentId &&
                    s.OrganizationId == organizationId &&
                    !s.IsDeleted);

            if (!studentExists)
            {
                return NotFound(new
                {
                    message = "Student not found in your organization."
                });
            }

            var enrollments = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(e =>
                    e.StudentId == studentId &&
                    e.OrganizationId == organizationId &&
                    e.Student.OrganizationId == organizationId &&
                    e.Course.OrganizationId == organizationId &&
                    e.Batch.OrganizationId == organizationId &&
                    e.Batch.CourseId == e.CourseId &&
                    e.IsActive &&
                    e.EndedAt == null)
                .OrderBy(e => e.EnrolledAt)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.StudentId,
                    e.CourseId,
                    CourseName = e.Course.CourseName,
                    e.BatchId,
                    BatchName = e.Batch.BatchName,
                    EnrollmentStatus = "Active",
                    e.EnrolledAt
                })
                .ToListAsync();

            return Ok(new
            {
                Success = true,
                StudentId = studentId,
                Courses = enrollments,
                Message = enrollments.Count > 0
                    ? "Student enrollments retrieved successfully."
                    : "No active enrollments found for this student."
            });
        }

    }
}