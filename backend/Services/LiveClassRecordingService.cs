using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.LiveClass;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public class LiveClassRecordingService
        : ILiveClassRecordingService
    {
        private const long MaxRecordingSize =
            1_073_741_824; // 1 GB

        private static readonly HashSet<string>
            AllowedExtensions =
                new(StringComparer.OrdinalIgnoreCase)
                {
                    ".mp4",
                    ".webm"
                };

        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LiveClassRecordingService(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        // ============================================================
        // UPLOAD RECORDING
        // ============================================================

        public async Task UploadRecordingAsync(
            UploadRecordingDto dto)
        {
            if (dto.Recording == null ||
                dto.Recording.Length == 0)
            {
                throw new ArgumentException(
                    "Recording file is required.");
            }

            if (dto.Recording.Length > MaxRecordingSize)
            {
                throw new ArgumentException(
                    "Recording file cannot exceed 1 GB.");
            }

            var liveClass =
                await GetLiveClassAsync(dto.LiveClassId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            // --------------------------------------------------------
            // Recording must belong to a completed class
            // --------------------------------------------------------

            if (!string.Equals(
                    liveClass.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Recording can only be uploaded after class completion.");
            }

            // --------------------------------------------------------
            // Recording must be enabled
            // --------------------------------------------------------

            if (!liveClass.RecordingEnabled)
            {
                throw new InvalidOperationException(
                    "Recording is not enabled for this live class.");
            }

            // --------------------------------------------------------
            // Permission + ownership
            // --------------------------------------------------------

            await EnsureCanManageRecordingAsync(
                liveClass);

            // --------------------------------------------------------
            // Validate extension
            // --------------------------------------------------------

            var extension =
                Path.GetExtension(
                    dto.Recording.FileName);

            if (string.IsNullOrWhiteSpace(extension) ||
                !AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Only MP4 and WebM recording files are supported.");
            }

            // --------------------------------------------------------
            // Secure storage outside wwwroot
            // --------------------------------------------------------

            var recordingFolder =
                Path.Combine(
                    _environment.ContentRootPath,
                    "Storage",
                    "Recordings");

            Directory.CreateDirectory(
                recordingFolder);

            // --------------------------------------------------------
            // Delete old recording
            // --------------------------------------------------------

            DeleteExistingRecordingFile(
                liveClass);

            // --------------------------------------------------------
            // Generate safe filename
            // --------------------------------------------------------

            var generatedFileName =
                $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

            var fullPath =
                Path.Combine(
                    recordingFolder,
                    generatedFileName);

            // --------------------------------------------------------
            // Save file
            // --------------------------------------------------------

            await using (
                var fileStream =
                    new FileStream(
                        fullPath,
                        FileMode.CreateNew,
                        FileAccess.Write,
                        FileShare.None,
                        1024 * 1024,
                        useAsync: true))
            {
                await dto.Recording
                    .CopyToAsync(fileStream);
            }

            // --------------------------------------------------------
            // Store only internal storage path
            // --------------------------------------------------------

            liveClass.RecordingName =
                Path.GetFileName(
                    dto.Recording.FileName);

            liveClass.RecordingPath =
                Path.Combine(
                    "Storage",
                    "Recordings",
                    generatedFileName)
                .Replace("\\", "/");

            liveClass.RecordingUrl =
                $"/api/v1/live-classes/{liveClass.LiveClassId}/recording/stream";

            liveClass.RecordingUploadedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // ============================================================
        // GET RECORDING METADATA
        // ============================================================

        public async Task<RecordingResponseDto>
            GetRecordingAsync(int liveClassId)
        {
            var liveClass =
                await GetLiveClassAsync(liveClassId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            await EnsureCanViewRecordingAsync(
                liveClass);

            if (string.IsNullOrWhiteSpace(
                    liveClass.RecordingPath))
            {
                throw new KeyNotFoundException(
                    "Recording not available.");
            }

            var filePath =
                GetRecordingFilePath(
                    liveClass.RecordingPath);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException(
                    "Recording file was not found.");
            }

            return new RecordingResponseDto
            {
                LiveClassId =
                    liveClass.LiveClassId,

                RecordingName =
                    liveClass.RecordingName
                    ?? "Live Class Recording",

                RecordingUrl =
                    $"/api/v1/live-classes/{liveClass.LiveClassId}/recording/stream",

                UploadedAt =
                    liveClass.RecordingUploadedAt
                    ?? DateTime.UtcNow
            };
        }

        // ============================================================
        // STREAM RECORDING
        // ============================================================

        public async Task<(
            Stream Stream,
            string ContentType,
            string FileName)>
            OpenRecordingStreamAsync(
                int liveClassId)
        {
            var liveClass =
                await GetLiveClassAsync(liveClassId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            await EnsureCanViewRecordingAsync(
                liveClass);

            if (string.IsNullOrWhiteSpace(
                    liveClass.RecordingPath))
            {
                throw new KeyNotFoundException(
                    "Recording not available.");
            }

            var filePath =
                GetRecordingFilePath(
                    liveClass.RecordingPath);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException(
                    "Recording file was not found.");
            }

            var extension =
                Path.GetExtension(filePath);

            var contentType =
                extension.ToLowerInvariant() switch
                {
                    ".mp4" =>
                        "video/mp4",

                    ".webm" =>
                        "video/webm",

                    _ =>
                        "application/octet-stream"
                };

            var fileName =
                liveClass.RecordingName
                ?? Path.GetFileName(filePath);

            var stream =
                new FileStream(
                    filePath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.Read,
                    1024 * 1024,
                    useAsync: true);

            return (
                stream,
                contentType,
                fileName);
        }

        // ============================================================
        // DELETE RECORDING
        // ============================================================

        public async Task DeleteRecordingAsync(
            int liveClassId)
        {
            var liveClass =
                await GetLiveClassAsync(liveClassId);

            if (liveClass == null)
            {
                throw new KeyNotFoundException(
                    "Live class not found.");
            }

            await EnsureCanManageRecordingAsync(
                liveClass);

            DeleteExistingRecordingFile(
                liveClass);

            liveClass.RecordingName = null;
            liveClass.RecordingPath = null;
            liveClass.RecordingUrl = null;
            liveClass.RecordingUploadedAt = null;

            await _context.SaveChangesAsync();
        }

        // ============================================================
        // GET LIVE CLASS
        // ============================================================

        private async Task<LiveClass?> GetLiveClassAsync(
            int liveClassId)
        {
            return await _context.LiveClasses
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .FirstOrDefaultAsync(
                    x => x.LiveClassId == liveClassId);
        }

        // ============================================================
        // VIEW PERMISSION
        // ============================================================

        private async Task EnsureCanViewRecordingAsync(
            LiveClass liveClass)
        {
            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "User context is unavailable.");
            }

            if (httpContext.User.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException(
                    "Authentication is required.");
            }

            var role =
                httpContext.User
                    .FindFirst(ClaimTypes.Role)
                    ?.Value;

            // --------------------------------------------------------
            // Super Admin
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "SuperAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            // --------------------------------------------------------
            // Student
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "Student",
                    StringComparison.OrdinalIgnoreCase))
            {
                await EnsureStudentCanAccessRecordingAsync(
                    liveClass);

                return;
            }

            // --------------------------------------------------------
            // Organization Admin
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "OrganizationAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                EnsureOrganizationAccess(
                    liveClass);

                return;
            }

            // --------------------------------------------------------
            // Employee / Mentor / HR etc.
            // [HasPermission("LiveClass", "View")]
            // is applied by controller.
            // Here we additionally enforce tenant isolation.
            // --------------------------------------------------------

            await EnsureEmployeeOrganizationAccessAsync(
                liveClass);
        }

        // ============================================================
        // MANAGE PERMISSION
        // ============================================================

        private async Task EnsureCanManageRecordingAsync(
            LiveClass liveClass)
        {
            var httpContext =
                _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException(
                    "User context is unavailable.");
            }

            var role =
                httpContext.User
                    .FindFirst(ClaimTypes.Role)
                    ?.Value;

            // --------------------------------------------------------
            // Super Admin
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "SuperAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            // --------------------------------------------------------
            // Organization Admin
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "OrganizationAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                EnsureOrganizationAccess(
                    liveClass);

                return;
            }

            // --------------------------------------------------------
            // Mentor
            // --------------------------------------------------------

            if (string.Equals(
                    role,
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                await EnsureMentorOwnsClassAsync(
                    liveClass);

                return;
            }

            // --------------------------------------------------------
            // Other employees
            //
            // Controller already requires:
            // LiveClass -> Edit
            // --------------------------------------------------------

            await EnsureEmployeeOrganizationAccessAsync(
                liveClass);
        }

        // ============================================================
        // STUDENT ACCESS
        // ============================================================

        private async Task EnsureStudentCanAccessRecordingAsync(
            LiveClass liveClass)
        {
            var studentIdValue =
                _httpContextAccessor.HttpContext?
                    .User
                    .FindFirst("StudentId")
                    ?.Value;

            if (!int.TryParse(
                    studentIdValue,
                    out var studentId))
            {
                throw new UnauthorizedAccessException(
                    "Student identity was not found.");
            }

            var student =
                await _context.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        s =>
                            s.StudentId == studentId &&
                            !s.IsDeleted);

            if (student == null)
            {
                throw new UnauthorizedAccessException(
                    "Student account was not found.");
            }

            // --------------------------------------------------------
            // Organization isolation
            // --------------------------------------------------------

            if (student.OrganizationId !=
                liveClass.Batch.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "You are not allowed to access this recording.");
            }

            // --------------------------------------------------------
            // Batch isolation
            // --------------------------------------------------------

            if (student.BatchId !=
                liveClass.BatchId)
            {
                throw new UnauthorizedAccessException(
                    "You are not enrolled in this class batch.");
            }
        }

        // ============================================================
        // MENTOR OWNERSHIP
        // ============================================================

        private async Task EnsureMentorOwnsClassAsync(
            LiveClass liveClass)
        {
            var userIdValue =
                _httpContextAccessor.HttpContext?
                    .User
                    .FindFirst(ClaimTypes.NameIdentifier)
                    ?.Value;

            if (!int.TryParse(
                    userIdValue,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "User identity was not found.");
            }

            var mentor =
                await _context.Mentors
                    .AsNoTracking()
                    .Join(
                        _context.Employees,
                        mentor => mentor.EmployeeId,
                        employee => employee.EmployeeId,
                        (mentor, employee) =>
                            new
                            {
                                Mentor = mentor,
                                Employee = employee
                            })
                    .FirstOrDefaultAsync(
                        x =>
                            x.Employee.UserId == userId &&
                            !x.Employee.IsDeleted &&
                            !x.Mentor.IsDeleted);

            if (mentor == null)
            {
                throw new UnauthorizedAccessException(
                    "Mentor profile was not found.");
            }

            if (mentor.Mentor.MentorId !=
                liveClass.MentorId)
            {
                throw new UnauthorizedAccessException(
                    "You can only manage recordings for your own live classes.");
            }

            if (mentor.Mentor.OrganizationId !=
                liveClass.Batch.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "You cannot access another organization's class.");
            }
        }

        // ============================================================
        // EMPLOYEE TENANT ACCESS
        // ============================================================

        private async Task EnsureEmployeeOrganizationAccessAsync(
            LiveClass liveClass)
        {
            var userIdValue =
                _httpContextAccessor.HttpContext?
                    .User
                    .FindFirst(ClaimTypes.NameIdentifier)
                    ?.Value;

            if (!int.TryParse(
                    userIdValue,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "User identity was not found.");
            }

            var user =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId == userId &&
                            !x.IsDeleted);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User account was not found.");
            }

            if (!user.OrganizationId.HasValue)
            {
                throw new UnauthorizedAccessException(
                    "User is not assigned to an organization.");
            }

            if (user.OrganizationId.Value !=
                liveClass.Batch.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "You cannot access another organization's recording.");
            }
        }

        // ============================================================
        // ORGANIZATION ACCESS
        // ============================================================

        private void EnsureOrganizationAccess(
            LiveClass liveClass)
        {
            var organizationIdValue =
                _httpContextAccessor.HttpContext?
                    .User
                    .FindFirst("OrganizationId")
                    ?.Value;

            if (!int.TryParse(
                    organizationIdValue,
                    out var organizationId))
            {
                throw new UnauthorizedAccessException(
                    "Organization identity was not found.");
            }

            if (organizationId !=
                liveClass.Batch.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "You cannot access another organization's recording.");
            }
        }

        // ============================================================
        // FILE PATH
        // ============================================================

        private string GetRecordingFilePath(
            string recordingPath)
        {
            var fileName =
                Path.GetFileName(recordingPath);

            if (string.IsNullOrWhiteSpace(fileName))
            {
                throw new InvalidOperationException(
                    "Invalid recording path.");
            }

            var secureFolder =
                Path.Combine(
                    _environment.ContentRootPath,
                    "Storage",
                    "Recordings");

            var securePath =
                Path.Combine(
                    secureFolder,
                    fileName);

            if (File.Exists(securePath))
            {
                return securePath;
            }

            // --------------------------------------------------------
            // Backward compatibility for old recordings that were
            // stored under wwwroot/Recordings.
            // --------------------------------------------------------

            var legacyFolder =
                Path.Combine(
                    _environment.WebRootPath,
                    "Recordings");

            var legacyPath =
                Path.Combine(
                    legacyFolder,
                    fileName);

            return legacyPath;
        }

        // ============================================================
        // DELETE OLD RECORDING
        // ============================================================

        private void DeleteExistingRecordingFile(
            LiveClass liveClass)
        {
            if (string.IsNullOrWhiteSpace(
                    liveClass.RecordingPath))
            {
                return;
            }

            try
            {
                var filePath =
                    GetRecordingFilePath(
                        liveClass.RecordingPath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch
            {
                // Do not fail the database operation merely because
                // an old physical file is already missing.
            }
        }
    }
}