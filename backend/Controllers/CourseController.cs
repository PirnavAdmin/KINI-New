using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Course;
using TalentSphereAPI.Services;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Common;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/courses")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _service;
        private readonly ApplicationDbContext _context;

        public CoursesController(
            ICourseService service,
            ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }

        // =====================================================
        // GET ALL COURSES
        // Courses -> View
        // =====================================================

        [HttpGet]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetAll(
            string? search,
            bool? status,
            int? mentorId,
            int? batchId,
            string? level,
            string? sortBy = "CourseName",
            string? sortOrder = "asc",
            int page = 1,
            int pageSize = 10)
        {
            var result =
                await _service.GetAllAsync(
                    search,
                    status,
                    mentorId,
                    batchId,
                    level,
                    sortBy,
                    sortOrder,
                    page,
                    pageSize);

            return Ok(result);
        }

        // =====================================================
        // GET COURSE BY ID
        // Courses -> View
        // =====================================================

        [HttpGet("{id:int}")]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetById(int id)
        {
            var course =
                await _service.GetByIdAsync(id);

            if (course == null)
            {
                return NotFound(new
                {
                    Message = "Course not found."
                });
            }

            return Ok(course);
        }

        // =====================================================
        // CREATE COURSE
        // Courses -> Add
        // =====================================================

        [HttpPost]
        [HasPermission("Courses", "add")]
        public async Task<IActionResult> Create(
            [FromBody] CreateCourseDto dto)
        {
            try
            {
                var course =
                    await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = course.CourseId
                    },
                    course);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE COURSE
        // Courses -> Edit
        // =====================================================

        [HttpPut("{id:int}")]
        [HasPermission("Courses", "edit")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateCourseDto dto)
        {
            try
            {
                var updated =
                    await _service.UpdateAsync(
                        id,
                        dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Course not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Course updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // DELETE COURSE
        // Courses -> Delete
        // =====================================================

        [HttpDelete("{id:int}")]
        [HasPermission("Courses", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Course not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Course deleted successfully."
            });
        }

        // =====================================================
        // UPLOAD COURSE PDF
        // Courses -> Edit
        // =====================================================

        [HttpPost("{id:int}/upload-pdf")]
        [HasPermission("Courses", "edit")]
        public async Task<IActionResult> UploadPdf(
            int id,
            IFormFile file)
        {
            if (file == null ||
                file.Length == 0)
            {
                return BadRequest(new
                {
                    Message =
                        "Please upload a PDF."
                });
            }

            if (!string.Equals(
                    Path.GetExtension(file.FileName),
                    ".pdf",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    Message =
                        "Only PDF files are allowed."
                });
            }

            var pdf =
                await _service.UploadPdfAsync(
                    id,
                    file);

            if (pdf == null)
            {
                return NotFound(new
                {
                    Message =
                        "Course not found."
                });
            }

            return Ok(new
            {
                Message =
                    "PDF uploaded successfully.",

                PdfUrl = pdf
            });
        }
        // =====================================================
        // OPEN / DOWNLOAD COURSE PDF
        // Courses -> View
        // =====================================================

        [HttpGet("{id:int}/pdf")]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetPdf(int id)
        {
            var pdf =
                await _service.GetPdfAsync(id);

            if (pdf == null)
            {
                return NotFound(new
                {
                    Message =
                        "Course PDF not found."
                });
            }

            return PhysicalFile(
                pdf.Value.FilePath,
                "application/pdf",
                enableRangeProcessing: true);
        }
        // =====================================================
        // PUBLIC COURSE CATALOGUE
        // GET: /api/v1/courses/public
        // Anonymous access - all organizations
        // =====================================================

        [HttpGet("public")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(PagedResponse<PublicCourseDto>), 200)]
        public async Task<IActionResult> GetPublicCourses(
            [FromQuery] string? search = null,
            [FromQuery] string? level = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "courseName",
            [FromQuery] string? sortOrder = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Validate pagination.
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            if (minPrice.HasValue && minPrice.Value < 0)
            {
                return BadRequest(new
                {
                    message = "minPrice cannot be negative."
                });
            }

            if (maxPrice.HasValue && maxPrice.Value < 0)
            {
                return BadRequest(new
                {
                    message = "maxPrice cannot be negative."
                });
            }

            if (minPrice.HasValue &&
                maxPrice.HasValue &&
                minPrice.Value > maxPrice.Value)
            {
                return BadRequest(new
                {
                    message = "minPrice cannot exceed maxPrice."
                });
            }

            // IMPORTANT:
            // Do not apply the current tenant's OrganizationId.
            // Only explicitly published, active, non-archived
            // courses are available publicly.
            IQueryable<TalentSphereAPI.Models.Course> query =
                _context.Courses
                    .AsNoTracking()
                    .Where(c =>
                        c.Status &&
                        c.IsPublic &&
                        !c.IsArchived);

            // Search.
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();

                query = query.Where(c =>
                    c.CourseName.Contains(term) ||
                    c.CourseCode.Contains(term) ||
                    (c.Description != null &&
                     c.Description.Contains(term)));
            }

            // Level filter.
            if (!string.IsNullOrWhiteSpace(level))
            {
                query = query.Where(c =>
                    c.Level == level.Trim());
            }

            // Price filters.
            if (minPrice.HasValue)
            {
                query = query.Where(c =>
                    c.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(c =>
                    c.Price <= maxPrice.Value);
            }

            // Sorting: use an allowlist of fields.
            var descending =
                string.Equals(
                    sortOrder,
                    "desc",
                    StringComparison.OrdinalIgnoreCase);

            query = (sortBy ?? "courseName").Trim().ToLowerInvariant()
                switch
            {
                "price" => descending
                    ? query.OrderByDescending(c => c.Price)
                    : query.OrderBy(c => c.Price),

                "duration" => descending
                    ? query.OrderByDescending(c => c.Duration)
                    : query.OrderBy(c => c.Duration),

                "level" => descending
                    ? query.OrderByDescending(c => c.Level)
                    : query.OrderBy(c => c.Level),

                "organizationname" => descending
                    ? query.OrderByDescending(
                        c => c.Organization.OrganizationName)
                    : query.OrderBy(
                        c => c.Organization.OrganizationName),

                "coursename" => descending
                    ? query.OrderByDescending(c => c.CourseName)
                    : query.OrderBy(c => c.CourseName),

                _ => query.OrderBy(c => c.CourseName)
            };

            // Count before pagination.
            var totalRecords = await query.CountAsync();

            // Fetch only the requested page.
            var courses = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new PublicCourseDto
                {
                    CourseId = c.CourseId,
                    CourseName = c.CourseName,
                    Description = c.Description,
                    Duration = c.Duration,
                    Level = c.Level,
                    Price = c.Price,
                    PdfUrl = c.PdfUrl,
                    Status = c.Status,
                    OrganizationId = c.OrganizationId,

                    // Return only the organization's public display name.
                    OrganizationName = c.Organization.OrganizationName,

                    // Only include batches belonging to this course's
                    // organization that are not archived.
                    // If your Batch model has no IsArchived property,
                    // remove the !b.IsArchived condition.
                    BatchIds = c.Batches
                        .Where(b =>
                            b.OrganizationId == c.OrganizationId)
                        .Select(b => b.BatchId)
                        .ToList(),

                    BatchNames = c.Batches
                        .Where(b =>
                            b.OrganizationId == c.OrganizationId)
                        .Select(b => b.BatchName)
                        .ToList(),

                    // Keep consistent with the existing CourseService.
                    TotalPurchases = 0,

                    TotalAssessments = c.Assessments.Count()
                })
                .ToListAsync();

            var response = new PagedResponse<PublicCourseDto>
            {
                Data = courses,
                TotalRecords = totalRecords,
                PageNumber = page,
                PageSize = pageSize
            };

            return Ok(response);
        }
    }
}