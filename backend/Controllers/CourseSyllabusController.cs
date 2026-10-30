using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/organization/courses/{courseId}/syllabus")]
    public class CourseSyllabusController
        : ControllerBase
    {
        private readonly ICourseSyllabusService _service;
        private readonly ISyllabusPdfParserService _pdfParserService;

        public CourseSyllabusController(
     ICourseSyllabusService service,
     ISyllabusPdfParserService pdfParserService)
        {
            _service = service;
            _pdfParserService = pdfParserService;
        }

        // =====================================================
        // POST
        // api/v1/organization/courses/{courseId}/syllabus
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> CreateSyllabus(
            int courseId,
            [FromBody] CreateCourseSyllabusDto dto)
        {
            try
            {
                var result =
                    await _service
                        .CreateOrReplaceAsync(
                            courseId,
                            dto);

                return Ok(new
                {
                    success = true,

                    message =
                        "Course syllabus created successfully",

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
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // GET
        // api/v1/organization/courses/{courseId}/syllabus
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetSyllabus(
    int courseId,
    [FromQuery] int? batchId)
        {
            var result = await _service.GetByCourseIdAsync(
                courseId,
                batchId);

            if (result == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Course syllabus not found"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Course syllabus retrieved successfully",
                data = result
            });
        }

        [HttpPost("import-pdf")]
        public async Task<IActionResult> ImportSyllabusPdf(
    int courseId,
    IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "PDF file is required"
                });
            }

            var extension = Path.GetExtension(file.FileName);

            if (!string.Equals(
                    extension,
                    ".pdf",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Only PDF files are supported"
                });
            }

            const long maxFileSize = 20 * 1024 * 1024;

            if (file.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "PDF file size cannot exceed 20 MB"
                });
            }

            try
            {
                await using var stream = file.OpenReadStream();

                var result =
                    await _pdfParserService.ParseAsync(
                        stream,
                        file.FileName,
                        file.Length,
                        courseId);

                if (result.Modules.Count == 0)
                {
                    return UnprocessableEntity(new
                    {
                        success = false,
                        message =
                            "Unable to identify syllabus modules from this PDF"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Syllabus PDF processed successfully",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message =
                        "An error occurred while processing the PDF"
                });
            }
        }
    }
}