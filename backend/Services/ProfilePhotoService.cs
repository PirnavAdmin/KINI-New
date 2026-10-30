
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Profile;

public interface IProfilePhotoService
{
    Task<object> UploadPhotoAsync(
        UploadProfilePhotoDto dto);

    Task<object?> GetPhotoAsync();

    Task DeletePhotoAsync();

    Task<ProfilePhotoLookupDto?>
        GetPhotoByProfileAsync(
            string profileType,
            int profileId);

    Task<List<ProfilePhotoLookupDto>>
        GetPhotosAsync(
            IEnumerable<int> studentIds,
            IEnumerable<int> employeeIds,
            IEnumerable<int> mentorIds);
}

public class ProfilePhotoService : IProfilePhotoService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    private readonly string[] _allowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;

    private const int ImageHeaderReadLength = 12;

    private static readonly byte[] JpegSignature =
    {
        0xFF,
        0xD8,
        0xFF
    };

    private static readonly byte[] PngSignature =
    {
        0x89,
        0x50,
        0x4E,
        0x47,
        0x0D,
        0x0A,
        0x1A,
        0x0A
    };

    private static readonly byte[] WebpRiffSignature =
    {
        0x52,
        0x49,
        0x46,
        0x46
    };

    private static readonly byte[] WebpSignature =
    {
        0x57,
        0x45,
        0x42,
        0x50
    };

    public ProfilePhotoService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _environment = environment;
        _configuration = configuration;
    }

    // ============================================================
    // UPLOAD PHOTO
    // ============================================================

    public async Task<object> UploadPhotoAsync(
        UploadProfilePhotoDto dto)
    {
        if (dto == null)
        {
            throw new ArgumentException(
                "Photo data is required.");
        }

        if (dto.Photo == null ||
            dto.Photo.Length == 0)
        {
            throw new ArgumentException(
                "Photo is required.");
        }

        if (dto.Photo.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "Photo size cannot exceed 5 MB.");
        }

        var extension =
            Path.GetExtension(
                dto.Photo.FileName)
                .ToLowerInvariant();

        if (!_allowedExtensions.Contains(extension))
        {
            throw new ArgumentException(
                "Only JPG, JPEG, PNG and WEBP images are allowed.");
        }

        var isValidImage =
            await IsValidImageFileAsync(
                dto.Photo,
                extension);

        if (!isValidImage)
        {
            throw new ArgumentException(
                "The uploaded file is not a valid JPG, JPEG, PNG or WEBP image.");
        }

        var user =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        var role =
            user.FindFirst(
                ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new UnauthorizedAccessException(
                "User role was not found.");
        }

        // --------------------------------------------------------
        // STUDENT
        // --------------------------------------------------------

        if (string.Equals(
                role,
                "Student",
                StringComparison.OrdinalIgnoreCase))
        {
            return await UploadStudentPhotoAsync(
                user,
                dto.Photo,
                extension);
        }

        // --------------------------------------------------------
        // EMPLOYEE / HR / MENTOR / ADMIN
        // --------------------------------------------------------

        if (string.Equals(
                role,
                "Employee",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "HR",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "HRRecruiter",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "HRExecutive",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "OperationAssociate",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "Mentor",
                StringComparison.OrdinalIgnoreCase) ||

            string.Equals(
                role,
                "SuperAdmin",
                StringComparison.OrdinalIgnoreCase))
        {
            return await UploadEmployeePhotoAsync(
                user,
                dto.Photo,
                extension);
        }

        throw new UnauthorizedAccessException(
            $"Profile photo upload is not supported for role '{role}'.");
    }

    // ============================================================
    // UPLOAD EMPLOYEE PHOTO
    // ============================================================

    private async Task<object> UploadEmployeePhotoAsync(
        ClaimsPrincipal user,
        IFormFile photo,
        string extension)
    {
        var userIdText =
            user.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(
                userIdText,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "User ID was not found.");
        }

        var organizationId =
            GetOrganizationId(user);

        var employee =
            await _context.Employees
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

        if (employee == null)
        {
            throw new UnauthorizedAccessException(
                "Employee profile was not found.");
        }

        // --------------------------------------------------------
        // KEEP OLD PHOTO URL.
        // DO NOT DELETE OLD PHOTO YET.
        // --------------------------------------------------------

        var oldPhotoUrl =
            employee.ProfilePhotoUrl;

        // --------------------------------------------------------
        // CREATE EMPLOYEE PHOTO FOLDER
        // --------------------------------------------------------

        var relativeFolder =
            Path.Combine(
                "uploads",
                "profile-photos",
                "employee");

        var folder =
            Path.Combine(
                _environment.WebRootPath,
                relativeFolder);

        Directory.CreateDirectory(folder);

        // --------------------------------------------------------
        // CREATE UNIQUE FILE NAME
        // --------------------------------------------------------

        var fileName =
            $"{employee.EmployeeId}_{Guid.NewGuid():N}{extension}";

        var filePath =
            Path.Combine(
                folder,
                fileName);

        var photoUrl =
            $"/uploads/profile-photos/employee/{fileName}";

        // --------------------------------------------------------
        // STEP 1:
        // SAVE NEW PHYSICAL FILE
        // --------------------------------------------------------

        await SavePhotoAsync(
            photo,
            filePath);

        try
        {
            // ----------------------------------------------------
            // STEP 2:
            // UPDATE DATABASE
            // ----------------------------------------------------

            employee.ProfilePhotoUrl =
                photoUrl;

            await _context.SaveChangesAsync();
        }
        catch
        {
            // ----------------------------------------------------
            // DATABASE UPDATE FAILED.
            // REMOVE NEWLY CREATED FILE.
            // OLD PHOTO IS STILL SAFE.
            // ----------------------------------------------------

            TryDeleteFile(filePath);

            throw;
        }

        // --------------------------------------------------------
        // STEP 3:
        // DATABASE UPDATE SUCCEEDED.
        // NOW DELETE OLD PHOTO.
        // --------------------------------------------------------

        DeletePhysicalPhoto(oldPhotoUrl);

        return new
        {
            UserType = "Employee",

            EmployeeId =
                employee.EmployeeId,

            PhotoUrl =
                photoUrl,

            ProfilePhotoUrl =
                BuildPhotoUrl(photoUrl)
        };
    }

    // ============================================================
    // UPLOAD STUDENT PHOTO
    // ============================================================

    private async Task<object> UploadStudentPhotoAsync(
        ClaimsPrincipal user,
        IFormFile photo,
        string extension)
    {
        /*
         * StudentId is the preferred claim.
         *
         * Fallback to NameIdentifier is retained because
         * the current Student Google-login JWT can use
         * StudentId as NameIdentifier.
         */

        var studentIdText =
            user.FindFirst("StudentId")?.Value;

        if (!int.TryParse(
                studentIdText,
                out var studentId))
        {
            var nameIdentifier =
                user.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                    nameIdentifier,
                    out studentId))
            {
                throw new UnauthorizedAccessException(
                    "Student ID was not found.");
            }
        }

        var organizationId =
            GetOrganizationId(user);

        var student =
            await _context.Students
                .FirstOrDefaultAsync(x =>
                    x.StudentId == studentId &&
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

        if (student == null)
        {
            throw new UnauthorizedAccessException(
                "Student profile was not found.");
        }

        // --------------------------------------------------------
        // KEEP OLD PHOTO URL.
        // --------------------------------------------------------

        var oldPhotoUrl =
            student.ProfilePhotoUrl;

        // --------------------------------------------------------
        // CREATE STUDENT PHOTO FOLDER
        // --------------------------------------------------------

        var relativeFolder =
            Path.Combine(
                "uploads",
                "profile-photos",
                "student");

        var folder =
            Path.Combine(
                _environment.WebRootPath,
                relativeFolder);

        Directory.CreateDirectory(folder);

        // --------------------------------------------------------
        // CREATE UNIQUE FILE NAME
        // --------------------------------------------------------

        var fileName =
            $"{student.StudentId}_{Guid.NewGuid():N}{extension}";

        var filePath =
            Path.Combine(
                folder,
                fileName);

        var photoUrl =
            $"/uploads/profile-photos/student/{fileName}";

        // --------------------------------------------------------
        // STEP 1:
        // SAVE NEW PHYSICAL FILE
        // --------------------------------------------------------

        await SavePhotoAsync(
            photo,
            filePath);

        try
        {
            // ----------------------------------------------------
            // STEP 2:
            // UPDATE DATABASE
            // ----------------------------------------------------

            student.ProfilePhotoUrl =
                photoUrl;

            await _context.SaveChangesAsync();
        }
        catch
        {
            // ----------------------------------------------------
            // DATABASE UPDATE FAILED.
            // REMOVE NEW FILE.
            // OLD PHOTO IS STILL SAFE.
            // ----------------------------------------------------

            TryDeleteFile(filePath);

            throw;
        }

        // --------------------------------------------------------
        // STEP 3:
        // DATABASE UPDATE SUCCEEDED.
        // DELETE OLD PHOTO.
        // --------------------------------------------------------

        DeletePhysicalPhoto(oldPhotoUrl);

        return new
        {
            UserType = "Student",

            StudentId =
                student.StudentId,

            PhotoUrl =
                photoUrl,

            ProfilePhotoUrl =
                BuildPhotoUrl(photoUrl)
        };
    }

    // ============================================================
    // GET CURRENT USER PHOTO
    // ============================================================

    public async Task<object?> GetPhotoAsync()
    {
        var user =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        var role =
            user.FindFirst(
                ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new UnauthorizedAccessException(
                "User role was not found.");
        }

        // --------------------------------------------------------
        // STUDENT
        // --------------------------------------------------------

        if (string.Equals(
                role,
                "Student",
                StringComparison.OrdinalIgnoreCase))
        {
            var studentIdText =
                user.FindFirst(
                    "StudentId")?.Value;

            if (!int.TryParse(
                    studentIdText,
                    out var studentId))
            {
                var nameIdentifier =
                    user.FindFirst(
                        ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(
                        nameIdentifier,
                        out studentId))
                {
                    return null;
                }
            }

            var organizationIdText =
                user.FindFirst(
                    "OrganizationId")?.Value;

            if (!int.TryParse(
                    organizationIdText,
                    out var organizationId))
            {
                return null;
            }

            var student =
                await _context.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.StudentId == studentId &&
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            if (student == null)
            {
                return null;
            }

            var photoUrl =
                BuildPhotoUrl(
                    student.ProfilePhotoUrl);

            return new
            {
                UserType = "Student",

                StudentId =
                    student.StudentId,

                PhotoUrl =
                    photoUrl,

                ProfilePhotoUrl =
                    photoUrl
            };
        }

        // --------------------------------------------------------
        // EMPLOYEE
        // --------------------------------------------------------

        var userIdText =
            user.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(
                userIdText,
                out var userId))
        {
            return null;
        }

        var employeeOrganizationIdText =
            user.FindFirst(
                "OrganizationId")?.Value;

        if (!int.TryParse(
                employeeOrganizationIdText,
                out var employeeOrganizationId))
        {
            return null;
        }

        var employee =
            await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.OrganizationId ==
                        employeeOrganizationId &&
                    !x.IsDeleted);

        if (employee == null)
        {
            return null;
        }

        var employeePhotoUrl =
            BuildPhotoUrl(
                employee.ProfilePhotoUrl);

        return new
        {
            UserType = "Employee",

            EmployeeId =
                employee.EmployeeId,

            PhotoUrl =
                employeePhotoUrl,

            ProfilePhotoUrl =
                employeePhotoUrl
        };
    }

    // ============================================================
    // DELETE PHOTO
    // ============================================================

    public async Task DeletePhotoAsync()
    {
        var user =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        var role =
            user.FindFirst(
                ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new UnauthorizedAccessException(
                "User role was not found.");
        }

        // --------------------------------------------------------
        // STUDENT
        // --------------------------------------------------------

        if (string.Equals(
                role,
                "Student",
                StringComparison.OrdinalIgnoreCase))
        {
            var studentIdText =
                user.FindFirst(
                    "StudentId")?.Value;

            if (!int.TryParse(
                    studentIdText,
                    out var studentId))
            {
                var nameIdentifier =
                    user.FindFirst(
                        ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(
                        nameIdentifier,
                        out studentId))
                {
                    throw new UnauthorizedAccessException(
                        "Student ID was not found.");
                }
            }

            var organizationId =
                GetOrganizationId(user);

            var student =
                await _context.Students
                    .FirstOrDefaultAsync(x =>
                        x.StudentId == studentId &&
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            if (student == null)
            {
                throw new KeyNotFoundException(
                    "Student not found.");
            }

            var oldPhotoUrl =
                student.ProfilePhotoUrl;

            // Remove database reference FIRST.
            student.ProfilePhotoUrl = null;

            await _context.SaveChangesAsync();

            // Delete physical file AFTER DB succeeds.
            DeletePhysicalPhoto(oldPhotoUrl);

            return;
        }

        // --------------------------------------------------------
        // EMPLOYEE
        // --------------------------------------------------------

        var userIdText =
            user.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(
                userIdText,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "User ID was not found.");
        }

        var organizationIdForEmployee =
            GetOrganizationId(user);

        var employee =
            await _context.Employees
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.OrganizationId ==
                        organizationIdForEmployee &&
                    !x.IsDeleted);

        if (employee == null)
        {
            throw new KeyNotFoundException(
                "Employee not found.");
        }

        var oldEmployeePhotoUrl =
            employee.ProfilePhotoUrl;

        // Remove DB reference FIRST.
        employee.ProfilePhotoUrl = null;

        await _context.SaveChangesAsync();

        // Delete physical file AFTER DB succeeds.
        DeletePhysicalPhoto(
            oldEmployeePhotoUrl);
    }

    // ============================================================
    // SAVE PHOTO
    // ============================================================

    private static async Task SavePhotoAsync(
        IFormFile photo,
        string filePath)
    {
        try
        {
            await using var stream =
                new FileStream(
                    filePath,
                    FileMode.Create,
                    FileAccess.Write,
                    FileShare.None,
                    81920,
                    useAsync: true);

            await photo.CopyToAsync(stream);
        }
        catch
        {
            try
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch
            {
                // Do not hide the original upload exception.
            }

            throw;
        }
    }

    // ============================================================
    // VALIDATE ACTUAL IMAGE CONTENT
    // ============================================================

    private static async Task<bool> IsValidImageFileAsync(
        IFormFile photo,
        string extension)
    {
        if (photo == null || photo.Length == 0)
        {
            return false;
        }

        await using var stream = photo.OpenReadStream();

        var header = new byte[ImageHeaderReadLength];

        var bytesRead =
            await stream.ReadAsync(
                header.AsMemory(0, header.Length));

        if (extension == ".jpg" ||
            extension == ".jpeg")
        {
            return bytesRead >= 3 &&
                   header[0] == JpegSignature[0] &&
                   header[1] == JpegSignature[1] &&
                   header[2] == JpegSignature[2];
        }

        if (extension == ".png")
        {
            return bytesRead >= PngSignature.Length &&
                   header.Take(PngSignature.Length)
                         .SequenceEqual(PngSignature);
        }

        if (extension == ".webp")
        {
            return bytesRead >= 12 &&
                   header.Take(4)
                         .SequenceEqual(WebpRiffSignature) &&
                   header.Skip(8)
                         .Take(4)
                         .SequenceEqual(WebpSignature);
        }

        return false;
    }

    // ============================================================
    // GET ORGANIZATION ID
    // ============================================================

    private static int GetOrganizationId(
        ClaimsPrincipal user)
    {
        var organizationIdText =
            user.FindFirst(
                "OrganizationId")?.Value;

        if (!int.TryParse(
                organizationIdText,
                out var organizationId))
        {
            throw new UnauthorizedAccessException(
                "Organization ID was not found.");
        }

        return organizationId;
    }

    // ============================================================
    // SAFE FILE DELETE
    // ============================================================

    private void TryDeleteFile(
        string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch
        {
            // Ignore cleanup failure.
        }
    }

    // ============================================================
    // DELETE PHYSICAL PROFILE PHOTO
    // ============================================================

    private void DeletePhysicalPhoto(
        string? photoUrl)
    {
        if (string.IsNullOrWhiteSpace(photoUrl))
        {
            return;
        }

        try
        {
            // ----------------------------------------------------
            // Support both relative and absolute URLs.
            // ----------------------------------------------------

            if (Uri.TryCreate(
                    photoUrl,
                    UriKind.Absolute,
                    out var absoluteUri))
            {
                photoUrl =
                    absoluteUri.AbsolutePath;
            }

            var relativePath =
                photoUrl
                    .TrimStart('/')
                    .Replace(
                        '/',
                        Path.DirectorySeparatorChar);

            // ----------------------------------------------------
            // Only profile-photo directory is allowed.
            // ----------------------------------------------------

            var profilePhotoRoot =
                Path.GetFullPath(
                    Path.Combine(
                        _environment.WebRootPath,
                        "uploads",
                        "profile-photos"));

            var fullPath =
                Path.GetFullPath(
                    Path.Combine(
                        _environment.WebRootPath,
                        relativePath));

            // Security protection against path traversal.
            if (!fullPath.StartsWith(
                    profilePhotoRoot +
                    Path.DirectorySeparatorChar,
                    StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch
        {
            /*
             * Do not fail the profile operation because
             * an old physical file is already missing.
             */
        }
    }

    // ============================================================
    // GET PHOTO BY PROFILE TYPE + ID
    // ============================================================

    public async Task<ProfilePhotoLookupDto?>
        GetPhotoByProfileAsync(
            string profileType,
            int profileId)
    {
        if (string.IsNullOrWhiteSpace(profileType))
        {
            throw new ArgumentException(
                "Profile type is required.");
        }

        if (profileId <= 0)
        {
            throw new ArgumentException(
                "Profile ID must be greater than zero.");
        }

        var user =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        var organizationId =
            GetOrganizationId(user);

        profileType =
            profileType.Trim()
                .ToLowerInvariant();

        // ========================================================
        // STUDENT
        // ========================================================

        if (profileType == "student")
        {
            var student =
                await _context.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.StudentId == profileId &&
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            if (student == null)
            {
                return null;
            }

            return new ProfilePhotoLookupDto
            {
                ProfileType = "student",

                ProfileId =
                    student.StudentId,

                DisplayName =
                    $"{student.FirstName} {student.LastName}"
                        .Trim(),

                PhotoUrl =
                    BuildPhotoUrl(
                        student.ProfilePhotoUrl)
            };
        }

        // ========================================================
        // EMPLOYEE
        // ========================================================

        if (profileType == "employee")
        {
            var employee =
                await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId == profileId &&
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            if (employee == null)
            {
                return null;
            }

            return new ProfilePhotoLookupDto
            {
                ProfileType = "employee",

                ProfileId =
                    employee.EmployeeId,

                DisplayName =
                    $"{employee.FirstName} {employee.LastName}"
                        .Trim(),

                PhotoUrl =
                    BuildPhotoUrl(
                        employee.ProfilePhotoUrl)
            };
        }

        // ========================================================
        // MENTOR
        // ========================================================

        /*
         * Mentor does not have its own ProfilePhotoUrl.
         *
         * Mentor
         *    ↓
         * Employee
         *    ↓
         * ProfilePhotoUrl
         */

        if (profileType == "mentor")
        {
            var mentorData =
                await (
                    from mentor in _context.Mentors

                    join employee in _context.Employees
                        on mentor.EmployeeId
                        equals employee.EmployeeId

                    where
                        mentor.MentorId == profileId &&
                        mentor.OrganizationId ==
                            organizationId &&
                        !mentor.IsDeleted &&
                        !employee.IsDeleted

                    select new
                    {
                        MentorId =
                            mentor.MentorId,

                        MentorName =
                            mentor.FirstName +
                            " " +
                            mentor.LastName,

                        PhotoUrl =
                            employee.ProfilePhotoUrl
                    })
                .FirstOrDefaultAsync();

            if (mentorData == null)
            {
                return null;
            }

            return new ProfilePhotoLookupDto
            {
                ProfileType = "mentor",

                ProfileId =
                    mentorData.MentorId,

                DisplayName =
                    mentorData.MentorName.Trim(),

                PhotoUrl =
                    BuildPhotoUrl(
                        mentorData.PhotoUrl)
            };
        }

        throw new ArgumentException(
            "Invalid profile type. Supported values are student, employee and mentor.");
    }

    // ============================================================
    // GET MULTIPLE PROFILE PHOTOS
    // ============================================================

    public async Task<List<ProfilePhotoLookupDto>>
        GetPhotosAsync(
            IEnumerable<int> studentIds,
            IEnumerable<int> employeeIds,
            IEnumerable<int> mentorIds)
    {
        var user =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        var organizationId =
            GetOrganizationId(user);

        var studentIdList =
            studentIds?
                .Where(x => x > 0)
                .Distinct()
                .Take(100)
                .ToList()
            ?? new List<int>();

        var employeeIdList =
            employeeIds?
                .Where(x => x > 0)
                .Distinct()
                .Take(100)
                .ToList()
            ?? new List<int>();

        var mentorIdList =
            mentorIds?
                .Where(x => x > 0)
                .Distinct()
                .Take(100)
                .ToList()
            ?? new List<int>();

        var result =
            new List<ProfilePhotoLookupDto>();

        // ========================================================
        // STUDENTS
        // ========================================================

        if (studentIdList.Count > 0)
        {
            var students =
                await _context.Students
                    .AsNoTracking()
                    .Where(x =>
                        studentIdList.Contains(
                            x.StudentId) &&
                        x.OrganizationId ==
                            organizationId &&
                        !x.IsDeleted)
                    .Select(x => new
                    {
                        ProfileId =
                            x.StudentId,

                        DisplayName =
                            (x.FirstName +
                             " " +
                             x.LastName).Trim(),

                        PhotoUrl =
                            x.ProfilePhotoUrl
                    })
                    .ToListAsync();

            result.AddRange(
                students.Select(x =>
                    new ProfilePhotoLookupDto
                    {
                        ProfileType =
                            "student",

                        ProfileId =
                            x.ProfileId,

                        DisplayName =
                            x.DisplayName,

                        PhotoUrl =
                            BuildPhotoUrl(
                                x.PhotoUrl)
                    }));
        }

        // ========================================================
        // EMPLOYEES
        // ========================================================

        if (employeeIdList.Count > 0)
        {
            var employees =
                await _context.Employees
                    .AsNoTracking()
                    .Where(x =>
                        employeeIdList.Contains(
                            x.EmployeeId) &&
                        x.OrganizationId ==
                            organizationId &&
                        !x.IsDeleted)
                    .Select(x => new
                    {
                        ProfileId =
                            x.EmployeeId,

                        DisplayName =
                            (x.FirstName +
                             " " +
                             x.LastName).Trim(),

                        PhotoUrl =
                            x.ProfilePhotoUrl
                    })
                    .ToListAsync();

            result.AddRange(
                employees.Select(x =>
                    new ProfilePhotoLookupDto
                    {
                        ProfileType =
                            "employee",

                        ProfileId =
                            x.ProfileId,

                        DisplayName =
                            x.DisplayName,

                        PhotoUrl =
                            BuildPhotoUrl(
                                x.PhotoUrl)
                    }));
        }

        // ========================================================
        // MENTORS
        // ========================================================

        if (mentorIdList.Count > 0)
        {
            var mentors =
                await (
                    from mentor in _context.Mentors

                    join employee in _context.Employees
                        on mentor.EmployeeId
                        equals employee.EmployeeId

                    where
                        mentorIdList.Contains(
                            mentor.MentorId) &&

                        mentor.OrganizationId ==
                            organizationId &&

                        !mentor.IsDeleted &&

                        !employee.IsDeleted

                    select new
                    {
                        ProfileId =
                            mentor.MentorId,

                        DisplayName =
                            (
                                mentor.FirstName +
                                " " +
                                mentor.LastName
                            ).Trim(),

                        PhotoUrl =
                            employee.ProfilePhotoUrl
                    })
                .ToListAsync();

            result.AddRange(
                mentors.Select(x =>
                    new ProfilePhotoLookupDto
                    {
                        ProfileType =
                            "mentor",

                        ProfileId =
                            x.ProfileId,

                        DisplayName =
                            x.DisplayName,

                        PhotoUrl =
                            BuildPhotoUrl(
                                x.PhotoUrl)
                    }));
        }

        return result;
    }

    // ============================================================
    // BUILD FRONTEND PHOTO URL
    // ============================================================

    private string BuildPhotoUrl(
        string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return string.Empty;
        }

        // Already an absolute URL.
        if (Uri.TryCreate(
                relativePath,
                UriKind.Absolute,
                out _))
        {
            return relativePath;
        }

        var request =
            _httpContextAccessor
                .HttpContext?
                .Request;

        if (request == null)
        {
            return relativePath;
        }

        return
            $"{request.Scheme}://{request.Host}{relativePath}";
    }
}
