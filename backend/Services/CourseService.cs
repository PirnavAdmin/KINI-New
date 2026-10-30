using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.Course;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _repository;

        private readonly INotificationService _notificationService;

        private readonly ITenantContext _tenantContext;

        public CourseService(
    ICourseRepository repository,
    INotificationService notificationService,
    ITenantContext tenantContext)
        {
            _repository = repository;

            _notificationService =
                notificationService;

            _tenantContext =
                tenantContext;
        }

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<PagedResponse<CourseDto>>
            GetAllAsync(
                string? search,
                bool? status,
                int? mentorId,
                int? batchId,
                string? level,
                string? sortBy,
                string? sortOrder,
                int page,
                int pageSize)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var result =
                await _repository.GetAllAsync(
                    search,
                    status,
                    mentorId,
                    batchId,
                    level,
                    sortBy,
                    sortOrder,
                    page,
                    pageSize);

            var courses =
                result.Courses.Select(c =>
                    MapToDto(c))
                .ToList();

            return new PagedResponse<CourseDto>
            {
                Data = courses,

                TotalRecords =
                    result.TotalCount,

                PageNumber =
                    page,

                PageSize =
                    pageSize
            };
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<CourseDto?> GetByIdAsync(
            int id)
        {
            var course =
                await _repository.GetByIdAsync(id);

            if (course == null)
                return null;

            return MapToDto(course);
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<CourseDto> CreateAsync(
    CreateCourseDto dto)
        {
            // -------------------------------------------------
            // Validate Course Name
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.CourseName))
            {
                throw new Exception(
                    "Course name is required.");
            }

            // -------------------------------------------------
            // Validate Duration
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.Duration))
            {
                throw new Exception(
                    "Course duration is required.");
            }

            // -------------------------------------------------
            // Validate Level
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.Level))
            {
                throw new Exception(
                    "Course level is required.");
            }

            // -------------------------------------------------
            // Validate Price
            // -------------------------------------------------

            if (dto.Price < 0)
            {
                throw new Exception(
                    "Course price cannot be negative.");
            }

            // -------------------------------------------------
            // Create Course
            // OrganizationId is automatically assigned
            // by CourseRepository using TenantContext.
            // -------------------------------------------------

            var course =
                new Course
                {
                    CourseName =
                        dto.CourseName.Trim(),

                    Duration =
                        dto.Duration.Trim(),

                    Level =
                        dto.Level.Trim(),

                    Price =
                        dto.Price,

                    Status = true
                };

            await _repository
                .CreateAsync(course);

            // -------------------------------------------------
            // Reload Course
            // -------------------------------------------------

            var createdCourse =
                await _repository
                    .GetByIdAsync(course.CourseId);

            if (createdCourse == null)
            {
                throw new Exception(
                    "Course was created but could not be retrieved.");
            }

            // =====================================================
            // ORGANIZATION NOTIFICATION - COURSE CREATED
            // =====================================================

            await _notificationService
                .CreateOrganizationNotificationAsync(
                    _tenantContext.OrganizationId,
                    "New Course Created",
                    $"Course '{createdCourse.CourseName}' has been created.",
                    NotificationType.CourseCreated,
                    createdCourse.CourseId,
                    ReferenceType.Course);

            // =====================================================
            // RETURN CREATED COURSE
            // =====================================================

            return MapToDto(createdCourse);
        }
        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool> UpdateAsync(
            int id,
            UpdateCourseDto dto)
        {
            var course =
                await _repository
                    .GetByIdAsync(id);

            if (course == null)
                return false;

            // -------------------------------------------------
            // Validate Course Name
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.CourseName))
            {
                throw new Exception(
                    "Course name is required.");
            }

            // -------------------------------------------------
            // Validate Duration
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.Duration))
            {
                throw new Exception(
                    "Course duration is required.");
            }

            // -------------------------------------------------
            // Validate Level
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.Level))
            {
                throw new Exception(
                    "Course level is required.");
            }

            // -------------------------------------------------
            // Validate Price
            // -------------------------------------------------

            if (dto.Price < 0)
            {
                throw new Exception(
                    "Course price cannot be negative.");
            }

            // -------------------------------------------------
            // Update Course
            // -------------------------------------------------

            course.CourseName =
                dto.CourseName.Trim();

            course.Duration =
                dto.Duration.Trim();

            course.Level =
                dto.Level.Trim();

            course.Price =
                dto.Price;

            course.Status =
                dto.Status;

            var result =
     await _repository
         .UpdateAsync(course);

            if (result)
            {
                // =====================================================
                // ORGANIZATION NOTIFICATION - COURSE UPDATED
                // =====================================================

                await _notificationService
    .CreateOrganizationNotificationAsync(
        _tenantContext.OrganizationId,
        "Course Updated",
        $"Course '{course.CourseName}' has been updated.",
        NotificationType.CourseUpdated,
        course.CourseId,
        ReferenceType.Course);
            }

                return result;
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int id)
        {
            return await _repository
                .DeleteAsync(id);
        }

        // =====================================================
        // UPLOAD PDF
        // =====================================================

        public async Task<string?> UploadPdfAsync(
            int courseId,
            IFormFile file)
        {
            var course =
                await _repository
                    .GetByIdAsync(courseId);

            if (course == null)
                return null;

            var folder =
                Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "coursepdfs");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName =
                Guid.NewGuid() +
                Path.GetExtension(file.FileName);

            var path =
                Path.Combine(
                    folder,
                    fileName);

            await using (
                var stream =
                    new FileStream(
                        path,
                        FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            course.PdfUrl =
                "/coursepdfs/" + fileName;

            await _repository
                .UpdateAsync(course);

            return course.PdfUrl;
        }

        // =====================================================
        // GET / OPEN COURSE PDF
        // =====================================================

        public async Task<(string FilePath, string FileName)?> GetPdfAsync(
            int courseId)
        {
            // This also verifies that the course belongs
            // to the current organization because
            // CourseRepository.GetByIdAsync() uses TenantContext.
            var course =
                await _repository.GetByIdAsync(courseId);

            if (course == null)
                return null;

            if (string.IsNullOrWhiteSpace(course.PdfUrl))
                return null;

            // Prevent invalid path manipulation.
            var fileName =
                Path.GetFileName(course.PdfUrl);

            if (string.IsNullOrWhiteSpace(fileName))
                return null;

            var folder =
                Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "coursepdfs");

            var filePath =
                Path.Combine(
                    folder,
                    fileName);

            if (!System.IO.File.Exists(filePath))
                return null;

            return (
                filePath,
                fileName
            );
        }

        // =====================================================
        // MAPPING
        // =====================================================

        private static CourseDto MapToDto(
    Course c)
        {
            return new CourseDto
            {
                CourseId =
                    c.CourseId,

                CourseName =
                    c.CourseName,

                Duration =
                    c.Duration,

                BatchIds =
                    c.Batches
                        .Select(b => b.BatchId)
                        .ToList(),

                BatchNames =
                    c.Batches
                        .Select(b => b.BatchName)
                        .ToList(),

                Level =
                    c.Level,

                Price =
                    c.Price,

                PdfUrl =
                    c.PdfUrl,

                TotalPurchases = 0,

                TotalAssessments =
                    c.Assessments?.Count ?? 0,

                Status =
                    c.Status
            };
        }
    }
}