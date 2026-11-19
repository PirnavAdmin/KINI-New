using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public sealed class CoursePosterException : Exception
    {
        public CoursePosterException(int statusCode, string message) : base(message) => StatusCode = statusCode;
        public int StatusCode { get; }
    }

    public interface ICoursePosterService
    {
        /// <summary>Saves (or replaces) the poster of a course in the caller's organization. Returns its public URL.</summary>
        Task<string> UploadAsync(int courseId, IFormFile? file, CancellationToken ct = default);

        /// <summary>Removes the poster. Returns false when the course had none.</summary>
        Task<bool> RemoveAsync(int courseId, CancellationToken ct = default);
    }

    /// <summary>
    /// Course posters are public marketing images: stored under
    /// wwwroot/uploads/course-posters (same convention as profile photos) and
    /// referenced on Courses.PosterUrl as a URL path, never a server path.
    /// </summary>
    public class CoursePosterService : ICoursePosterService
    {
        public const long MaxBytes = 5 * 1024 * 1024;
        private const string UrlPrefix = "/uploads/course-posters/";

        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenant;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<CoursePosterService> _logger;

        public CoursePosterService(
            ApplicationDbContext context,
            ITenantContext tenant,
            IWebHostEnvironment environment,
            ILogger<CoursePosterService> logger)
        {
            _context = context;
            _tenant = tenant;
            _environment = environment;
            _logger = logger;
        }

        private string Folder => Path.Combine(
            _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"),
            "uploads", "course-posters");

        public async Task<string> UploadAsync(int courseId, IFormFile? file, CancellationToken ct = default)
        {
            var course = await FindCourseAsync(courseId, ct);

            if (file == null || file.Length == 0)
                throw new CoursePosterException(400, "Please choose a poster image.");
            if (file.Length > MaxBytes)
                throw new CoursePosterException(400, "Course poster must be 5 MB or smaller.");

            byte[] bytes;
            await using (var input = file.OpenReadStream())
            using (var buffer = new MemoryStream((int)file.Length))
            {
                await input.CopyToAsync(buffer, ct);
                bytes = buffer.ToArray();
            }

            // The file's real content decides the type, not its name.
            var type = PrivateFileStorage.DetectImageType(bytes)
                ?? throw new CoursePosterException(400, "Only JPG, JPEG, PNG or WebP images are allowed.");

            Directory.CreateDirectory(Folder);
            var fileName = $"{course.CourseId}_{Guid.NewGuid():N}{type.Extension}";
            var fullPath = Path.Combine(Folder, fileName);
            await File.WriteAllBytesAsync(fullPath, bytes, ct);

            var oldUrl = course.PosterUrl;
            course.PosterUrl = UrlPrefix + fileName;
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch
            {
                TryDelete(UrlPrefix + fileName);   // no orphan file when the record was not updated
                throw;
            }

            // Only after the new reference is saved.
            if (!string.IsNullOrWhiteSpace(oldUrl) && oldUrl != course.PosterUrl)
                TryDelete(oldUrl);

            return course.PosterUrl;
        }

        public async Task<bool> RemoveAsync(int courseId, CancellationToken ct = default)
        {
            var course = await FindCourseAsync(courseId, ct);
            if (string.IsNullOrWhiteSpace(course.PosterUrl))
                return false;

            var oldUrl = course.PosterUrl;
            course.PosterUrl = null;
            await _context.SaveChangesAsync(ct);
            TryDelete(oldUrl);
            return true;
        }

        // Organization ownership: only courses of the caller's organization.
        private async Task<Models.Course> FindCourseAsync(int courseId, CancellationToken ct)
        {
            var organizationId = _tenant.OrganizationId;
            return await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.OrganizationId == organizationId, ct)
                ?? throw new CoursePosterException(404, "Course not found.");
        }

        // Deletes a poster file only if the URL points inside the posters folder.
        private void TryDelete(string? url)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(url) || !url.StartsWith(UrlPrefix, StringComparison.Ordinal))
                    return;
                var name = Path.GetFileName(url);
                if (string.IsNullOrEmpty(name) || name != url[UrlPrefix.Length..])
                    return;
                var path = Path.Combine(Folder, name);
                if (File.Exists(path))
                    File.Delete(path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete old course poster {Url}", url);
            }
        }
    }
}
