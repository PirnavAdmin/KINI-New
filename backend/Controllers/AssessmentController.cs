using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Assessment;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;
        private readonly IStudentAssessmentService _studentAssessmentService;

        public AssessmentController(
            IAssessmentService assessmentService,
            IStudentAssessmentService studentAssessmentService)
        {
            _assessmentService = assessmentService;
            _studentAssessmentService = studentAssessmentService;
        }

        // =====================================================
        // GET ALL
        // Assessments -> View
        // =====================================================

        [HttpGet]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult> GetAll()
        {
            var assessments =
                await _assessmentService.GetAllAsync();

            return Ok(assessments);
        }

        // =====================================================
        // GET BY ID
        // Assessments -> View
        // =====================================================

        [HttpGet("{id:int}")]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult> GetById(int id)
        {
            var assessment =
                await _assessmentService.GetByIdAsync(id);

            if (assessment == null)
            {
                return NotFound(new
                {
                    Message = "Assessment not found."
                });
            }

            return Ok(assessment);
        }

        // =====================================================
        // CREATE
        // Assessments -> Add
        // =====================================================

        [HttpPost]
        [HasPermission("Assessments", "add")]
        public async Task<IActionResult> Create(
            CreateAssessmentDto dto)
        {
            try
            {
                var id =
                    await _assessmentService.CreateAsync(dto);

                return Ok(new
                {
                    Message =
                        "Assessment created successfully.",

                    AssessmentId = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE
        // Assessments -> Edit
        // =====================================================

        [HttpPut("{id:int}")]
        [HasPermission("Assessments", "edit")]
        public async Task<IActionResult> Update(
            int id,
            UpdateAssessmentDto dto)
        {
            try
            {
                var updated =
                    await _assessmentService.UpdateAsync(
                        id,
                        dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message =
                            "Assessment not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Assessment updated successfully."
                });
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
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // PUBLISH
        // Assessments -> Edit
        // =====================================================

        [HttpPost("{id:int}/publish")]
        [HasPermission("Assessments", "edit")]
        public async Task<IActionResult> Publish(int id)
        {
            try
            {
                var published =
                    await _assessmentService.PublishAsync(id);

                if (!published)
                {
                    return NotFound(new
                    {
                        Message =
                            "Assessment not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Assessment published successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // DELETE
        // Assessments -> Delete
        // =====================================================

        [HttpDelete("{id:int}")]
        [HasPermission("Assessments", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted =
                    await _assessmentService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        Message =
                            "Assessment not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Assessment deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // ORGANIZATION - STUDENT ASSESSMENT PERFORMANCE
        // =====================================================
        //
        // Organization can view a student's complete
        // assessment history and results.
        //
        // Permission:
        // Assessments -> View
        // =====================================================

        [HttpGet("students/{studentId:int}/performance")]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult>
            GetStudentAssessmentPerformance(
                int studentId)
        {
            if (studentId <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid student ID."
                });
            }

            var result =
                await _studentAssessmentService
                    .GetStudentAssessmentPerformanceAsync(
                        studentId);

            if (result == null)
            {
                return NotFound(new
                {
                    Message =
                        "Student was not found in your organization."
                });
            }

            return Ok(result);
        }
        // =====================================================
        // ORGANIZATION - ALL STUDENTS RESULTS FOR ASSESSMENT
        // =====================================================
        //
        // Returns every student assigned to the selected
        // assessment.
        //
        // Students who did not attempt the assessment are
        // returned as "Unavailable".
        //
        // Example:
        // GET /api/Assessment/5/students/results
        //
        // Search:
        // GET /api/Assessment/5/students/results?search=hari
        //
        // Pagination:
        // GET /api/Assessment/5/students/results?pageNumber=1&pageSize=10
        //
        // =====================================================

        [HttpGet("{assessmentId:int}/students/results")]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult>
            GetAssessmentStudentResults(
                int assessmentId,
                [FromQuery] string? search = null,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10)
        {
            if (assessmentId <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid assessment ID."
                });
            }

            if (pageNumber <= 0)
            {
                return BadRequest(new
                {
                    Message = "Page number must be greater than zero."
                });
            }

            if (pageSize <= 0 || pageSize > 100)
            {
                return BadRequest(new
                {
                    Message =
                        "Page size must be between 1 and 100."
                });
            }

            var result =
                await _studentAssessmentService
                    .GetAssessmentStudentResultsAsync(
                        assessmentId,
                        search,
                        pageNumber,
                        pageSize);

            if (result == null)
            {
                return NotFound(new
                {
                    Message =
                        "Assessment was not found in your organization."
                });
            }

            return Ok(result);
        }
    }
}