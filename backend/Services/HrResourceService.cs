using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Models.EmployeeProfile;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services;

public class HrResourceService : IHrResourceService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;

    private const long MaxFileSize = 100L * 1024L * 1024L;

    private static readonly Dictionary<string, string> AllowedFileTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "PDF",
            [".docx"] = "DOCX",
            [".xlsx"] = "XLSX",
            [".pptx"] = "PPTX",
            [".mp4"] = "MP4"
        };

    private static readonly string[] AllowedCategories =
    {
        "HR Policy",
        "Trainer Resource",
        "Template",
        "Guideline"
    };

    public HrResourceService(
        ApplicationDbContext context,
        ITenantContext tenantContext,
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _tenantContext = tenantContext;
        _environment = environment;
        _httpContextAccessor = httpContextAccessor;
    }

    private int OrganizationId =>
        _tenantContext.OrganizationId;


    // ============================================================
    // SUMMARY
    // ============================================================

    public async Task<HrResourceSummaryDto> GetSummaryAsync()
    {
        var organizationId = OrganizationId;

        var thirtyDaysAgo =
            DateTime.UtcNow.AddDays(-30);

        var query =
            _context.HrResources
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

        var totalResources =
            await query.CountAsync();

        var hrPolicies =
            await query.CountAsync(x =>
                x.Category == "HR Policy");

        var trainerResources =
            await query.CountAsync(x =>
                x.Category == "Trainer Resource");

        var recentlyAdded =
            await query.CountAsync(x =>
                x.UploadedDate >= thirtyDaysAgo);

        return new HrResourceSummaryDto
        {
            TotalResources = totalResources,
            HrPolicies = hrPolicies,
            TrainerResources = trainerResources,
            RecentlyAdded = recentlyAdded
        };
    }


    // ============================================================
    // LIST
    // ============================================================

    public async Task<HrResourcePagedResponse> GetResourcesAsync(
        HrResourceFilterDto filter)
    {
        var query =
            BuildFilteredQuery(filter);

        var totalCount =
            await query.CountAsync();

        var page =
            filter.Page < 1
                ? 1
                : filter.Page;

        var limit =
            filter.Limit < 1
                ? 10
                : Math.Min(filter.Limit, 100);

        var totalPages =
            totalCount == 0
                ? 0
                : (int)Math.Ceiling(
                    totalCount / (double)limit);

        if (totalPages > 0 && page > totalPages)
        {
            page = totalPages;
        }

        var resources =
            await query
                .OrderByDescending(x => x.UploadedDate)
                .ThenByDescending(x => x.ResourceId)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

        var items =
            resources
                .Select(MapListItem)
                .ToList();

        return new HrResourcePagedResponse
        {
            Items = items,
            Page = page,
            Limit = limit,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }


    // ============================================================
    // DETAIL
    // ============================================================

    public async Task<HrResourceDetailDto?> GetByIdAsync(
        int resourceId)
    {
        var resource =
            await _context.HrResources
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.ResourceId == resourceId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

        if (resource == null)
        {
            return null;
        }

        return MapDetail(resource);
    }


    // ============================================================
    // UPLOAD
    // ============================================================

    public async Task<HrResourceDetailDto> UploadAsync(
        IFormFile file,
        string name,
        string category,
        string? description)
    {
        if (file == null)
        {
            throw new ArgumentException(
                "File is required.");
        }

        if (file.Length <= 0)
        {
            throw new ArgumentException(
                "The uploaded file is empty.");
        }

        if (file.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "The uploaded file exceeds the maximum allowed size of 100 MB.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Resource name is required.");
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException(
                "Category is required.");
        }

        var normalizedCategory =
            NormalizeCategory(category);

        if (normalizedCategory == null)
        {
            throw new ArgumentException(
                "Invalid resource category. Allowed categories are HR Policy, Trainer Resource, Template and Guideline.");
        }

        var originalFileName =
            Path.GetFileName(file.FileName);

        var extension =
            Path.GetExtension(originalFileName);

        if (string.IsNullOrWhiteSpace(extension) ||
            !AllowedFileTypes.TryGetValue(
                extension,
                out var fileType))
        {
            throw new NotSupportedException(
                "Unsupported file type. Allowed file types are PDF, DOCX, XLSX, PPTX and MP4.");
        }

        var organizationId =
            OrganizationId;

        var uploader =
            await GetCurrentEmployeeAsync();

        if (uploader == null)
        {
            throw new UnauthorizedAccessException(
                "The authenticated employee could not be resolved.");
        }

        var root =
            GetStorageRoot(organizationId);

        Directory.CreateDirectory(root);

        var storedFileName =
            $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

        var physicalPath =
            Path.Combine(
                root,
                storedFileName);

        try
        {
            await using var stream =
                new FileStream(
                    physicalPath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None,
                    81920,
                    useAsync: true);

            await file.CopyToAsync(stream);

            var resource =
                new HrResource
                {
                    OrganizationId = organizationId,

                    Name = SanitizeName(name),

                    Category = normalizedCategory,

                    Description =
                        string.IsNullOrWhiteSpace(description)
                            ? null
                            : description.Trim(),

                    FileType = fileType,

                    OriginalFileName =
                        originalFileName,

                    StoredFileName =
                        storedFileName,

                    StoredFilePath =
                        GetRelativeStoragePath(
                            organizationId,
                            storedFileName),

                    UploadedBy =
                        $"{uploader.FirstName} {uploader.LastName}".Trim(),

                    UploadedByEmployeeId =
                        uploader.EmployeeId,

                    FileSize =
                        file.Length,

                    UploadedDate =
                        DateTime.UtcNow
                };

            _context.HrResources.Add(resource);

            await _context.SaveChangesAsync();

            return MapDetail(resource);
        }
        catch
        {
            if (File.Exists(physicalPath))
            {
                try
                {
                    File.Delete(physicalPath);
                }
                catch
                {
                    // Do not hide the original exception.
                }
            }

            throw;
        }
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public async Task<HrResourceDetailDto?> UpdateAsync(
        int resourceId,
        HrResourceUpdateDto dto)
    {
        var resource =
            await _context.HrResources
                .FirstOrDefaultAsync(x =>
                    x.ResourceId == resourceId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

        if (resource == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            resource.Name =
                SanitizeName(dto.Name);
        }

        if (!string.IsNullOrWhiteSpace(dto.Category))
        {
            var normalizedCategory =
                NormalizeCategory(dto.Category);

            if (normalizedCategory == null)
            {
                throw new ArgumentException(
                    "Invalid resource category. Allowed categories are HR Policy, Trainer Resource, Template and Guideline.");
            }

            resource.Category =
                normalizedCategory;
        }

        if (dto.Description != null)
        {
            resource.Description =
                string.IsNullOrWhiteSpace(dto.Description)
                    ? null
                    : dto.Description.Trim();
        }

        await _context.SaveChangesAsync();

        return MapDetail(resource);
    }


    // ============================================================
    // DELETE
    // ============================================================

    public async Task<bool> DeleteAsync(
        int resourceId)
    {
        var resource =
            await _context.HrResources
                .FirstOrDefaultAsync(x =>
                    x.ResourceId == resourceId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

        if (resource == null)
        {
            return false;
        }

        resource.IsDeleted = true;
        resource.DeletedOn = DateTime.UtcNow;
        resource.DeletedBy = GetCurrentUserName();

        await _context.SaveChangesAsync();

        var physicalPath =
            GetPhysicalPath(resource);

        if (File.Exists(physicalPath))
        {
            try
            {
                File.Delete(physicalPath);
            }
            catch
            {
                // Database soft-delete remains valid
                // even if physical cleanup fails.
            }
        }

        return true;
    }


    // ============================================================
    // DOWNLOAD
    // ============================================================

    public async Task<(byte[] Content, string ContentType, string FileName)?>
        DownloadAsync(int resourceId)
    {
        var resource =
            await GetResourceForFileAsync(resourceId);

        if (resource == null)
        {
            return null;
        }

        var physicalPath =
            GetPhysicalPath(resource);

        if (!File.Exists(physicalPath))
        {
            return null;
        }

        var content =
            await File.ReadAllBytesAsync(
                physicalPath);

        return (
            content,
            GetContentType(resource.FileType),
            resource.OriginalFileName
        );
    }


    // ============================================================
    // PREVIEW
    // ============================================================

    public async Task<(byte[] Content, string ContentType, string FileName)?>
        PreviewAsync(int resourceId)
    {
        var resource =
            await GetResourceForFileAsync(resourceId);

        if (resource == null)
        {
            return null;
        }

        if (!string.Equals(
                resource.FileType,
                "PDF",
                StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(
                resource.FileType,
                "DOCX",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new NotSupportedException(
                "Preview is supported only for PDF and DOCX resources.");
        }

        var physicalPath =
            GetPhysicalPath(resource);

        if (!File.Exists(physicalPath))
        {
            return null;
        }

        var content =
            await File.ReadAllBytesAsync(
                physicalPath);

        return (
            content,
            GetContentType(resource.FileType),
            resource.OriginalFileName
        );
    }


    // ============================================================
    // CATEGORIES
    // ============================================================

    public Task<HrResourceStringListDto>
        GetCategoriesAsync()
    {
        return Task.FromResult(
            new HrResourceStringListDto
            {
                Items =
                    AllowedCategories
                        .ToList()
            });
    }


    // ============================================================
    // FILE TYPES
    // ============================================================

    public Task<HrResourceStringListDto>
        GetFileTypesAsync()
    {
        return Task.FromResult(
            new HrResourceStringListDto
            {
                Items = new List<string>
                {
                    "PDF",
                    "DOCX",
                    "XLSX",
                    "PPTX",
                    "MP4"
                }
            });
    }


    // ============================================================
    // UPLOADERS
    // ============================================================

    public async Task<HrResourceUploaderListDto>
        GetUploadersAsync()
    {
        var organizationId =
            OrganizationId;

        var uploaderIds =
            await _context.HrResources
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted &&
                    x.UploadedByEmployeeId.HasValue)
                .Select(x =>
                    x.UploadedByEmployeeId!.Value)
                .Distinct()
                .ToListAsync();

        if (uploaderIds.Count == 0)
        {
            return new HrResourceUploaderListDto();
        }

        var employees =
            await _context.Employees
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted &&
                    uploaderIds.Contains(x.EmployeeId))
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ToListAsync();

        var result =
            employees
                .Select(x => new HrResourceUploaderDto
                {
                    Id = FormatEmployeeId(x.EmployeeId),
                    Name =
                        $"{x.FirstName} {x.LastName}".Trim()
                })
                .ToList();

        return new HrResourceUploaderListDto
        {
            Items = result
        };
    }


    // ============================================================
    // EXPORT
    // ============================================================

    public async Task<byte[]> ExportAsync(
        HrResourceFilterDto filter)
    {
        var resources =
            await BuildFilteredQuery(filter)
                .OrderByDescending(x => x.UploadedDate)
                .ThenByDescending(x => x.ResourceId)
                .ToListAsync();

        var csv =
            new StringBuilder();

        csv.AppendLine(
            "ResourceId,Name,Category,FileType,SizeKb,UploadedBy,UploadedDate");

        foreach (var resource in resources)
        {
            csv.AppendLine(
                string.Join(",",
                    Csv(resource.ResourceId.ToString(
                        CultureInfo.InvariantCulture)),

                    Csv(resource.Name),

                    Csv(resource.Category),

                    Csv(resource.FileType),

                    Csv(
                        (resource.FileSize / 1024L)
                            .ToString(
                                CultureInfo.InvariantCulture)),

                    Csv(resource.UploadedBy),

                    Csv(
                        resource.UploadedDate
                            .ToString(
                                "yyyy-MM-dd HH:mm:ss",
                                CultureInfo.InvariantCulture))
                ));
        }

        return Encoding.UTF8.GetBytes(
            csv.ToString());
    }


    // ============================================================
    // FILTER QUERY
    // ============================================================

    private IQueryable<HrResource>
        BuildFilteredQuery(
            HrResourceFilterDto filter)
    {
        var organizationId =
            OrganizationId;

        var query =
            _context.HrResources
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim()
                    .ToLower();

            query =
                query.Where(x =>
                    x.Name.ToLower()
                        .Contains(search) ||
                    x.OriginalFileName
                        .ToLower()
                        .Contains(search) ||
                    x.UploadedBy
                        .ToLower()
                        .Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            var category =
                filter.Category.Trim();

            query =
                query.Where(x =>
                    x.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(filter.FileType))
        {
            var fileType =
                filter.FileType.Trim()
                    .ToUpperInvariant();

            query =
                query.Where(x =>
                    x.FileType == fileType);
        }

        if (!string.IsNullOrWhiteSpace(filter.UploadedBy))
        {
            var uploadedBy =
                filter.UploadedBy.Trim();

            if (TryParseEmployeeId(
                    uploadedBy,
                    out var employeeId))
            {
                query =
                    query.Where(x =>
                        x.UploadedByEmployeeId ==
                        employeeId);
            }
            else
            {
                var uploaderSearch =
                    uploadedBy.ToLower();

                query =
                    query.Where(x =>
                        x.UploadedBy
                            .ToLower()
                            .Contains(uploaderSearch));
            }
        }

        if (filter.StartDate.HasValue)
        {
            var start =
                filter.StartDate.Value.Date;

            query =
                query.Where(x =>
                    x.UploadedDate >= start);
        }

        if (filter.EndDate.HasValue)
        {
            var endExclusive =
                filter.EndDate.Value.Date
                    .AddDays(1);

            query =
                query.Where(x =>
                    x.UploadedDate < endExclusive);
        }

        return query;
    }


    // ============================================================
    // RESOURCE LOOKUP FOR FILE OPERATIONS
    // ============================================================

    private async Task<HrResource?>
        GetResourceForFileAsync(
            int resourceId)
    {
        return await _context.HrResources
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.ResourceId == resourceId &&
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted);
    }


    // ============================================================
    // CURRENT EMPLOYEE
    // ============================================================

    private async Task<Employee?>
        GetCurrentEmployeeAsync()
    {
        var principal =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (principal?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userIdText =
            principal
                .FindFirst(ClaimTypes.NameIdentifier)
                ?.Value;

        if (!int.TryParse(
                userIdText,
                out var userId))
        {
            return null;
        }

        return await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == OrganizationId &&
                x.UserId == userId &&
                !x.IsDeleted);
    }


    // ============================================================
    // STORAGE
    // ============================================================

    private string GetStorageRoot(
        int organizationId)
    {
        var webRoot =
            _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot =
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot");
        }

        return Path.Combine(
            webRoot,
            "hr-resources",
            organizationId.ToString(
                CultureInfo.InvariantCulture));
    }


    private string GetPhysicalPath(
        HrResource resource)
    {
        return Path.Combine(
            GetStorageRoot(
                resource.OrganizationId),
            resource.StoredFileName);
    }


    private static string GetRelativeStoragePath(
        int organizationId,
        string storedFileName)
    {
        return Path.Combine(
                "hr-resources",
                organizationId.ToString(
                    CultureInfo.InvariantCulture),
                storedFileName)
            .Replace(
                Path.DirectorySeparatorChar,
                '/');
    }


    // ============================================================
    // MAPPING
    // ============================================================

    private HrResourceListItemDto
        MapListItem(
            HrResource resource)
    {
        return new HrResourceListItemDto
        {
            ResourceId =
                resource.ResourceId,

            Name =
                resource.Name,

            Category =
                resource.Category,

            FileType =
                resource.FileType,

            SizeKb =
                resource.FileSize / 1024L,

            UploadedBy =
                resource.UploadedBy,

            UploadedDate =
                resource.UploadedDate
        };
    }


    private HrResourceDetailDto
        MapDetail(
            HrResource resource)
    {
        return new HrResourceDetailDto
        {
            ResourceId =
                resource.ResourceId,

            Name =
                resource.Name,

            Category =
                resource.Category,

            Description =
                resource.Description,

            FileType =
                resource.FileType,

            SizeKb =
                resource.FileSize / 1024L,

            UploadedBy =
                resource.UploadedBy,

            UploadedDate =
                resource.UploadedDate,

            FileUrl =
                BuildDownloadUrl(
                    resource.ResourceId)
        };
    }


    // ============================================================
    // URL
    // ============================================================

    private string BuildDownloadUrl(
        int resourceId)
    {
        var request =
            _httpContextAccessor
                .HttpContext?
                .Request;

        if (request == null)
        {
            return
                $"/api/hr/resources/{resourceId}/download";
        }

        return
            $"{request.Scheme}://{request.Host}" +
            $"/api/hr/resources/{resourceId}/download";
    }


    // ============================================================
    // CATEGORY NORMALIZATION
    // ============================================================

    private static string?
        NormalizeCategory(
            string category)
    {
        var trimmed =
            category.Trim();

        return AllowedCategories
            .FirstOrDefault(x =>
                string.Equals(
                    x,
                    trimmed,
                    StringComparison.OrdinalIgnoreCase));
    }


    // ============================================================
    // FILE CONTENT TYPE
    // ============================================================

    private static string
        GetContentType(
            string fileType)
    {
        return fileType.ToUpperInvariant() switch
        {
            "PDF" =>
                "application/pdf",

            "DOCX" =>
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "XLSX" =>
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "PPTX" =>
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "MP4" =>
                "video/mp4",

            _ =>
                "application/octet-stream"
        };
    }


    // ============================================================
    // EMPLOYEE ID
    // ============================================================

    private static bool TryParseEmployeeId(
        string value,
        out int employeeId)
    {
        employeeId = 0;

        var normalized =
            value.Trim();

        if (normalized.StartsWith(
                "EMP-",
                StringComparison.OrdinalIgnoreCase))
        {
            normalized =
                normalized[4..];
        }

        return int.TryParse(
            normalized,
            NumberStyles.Integer,
            CultureInfo.InvariantCulture,
            out employeeId)
            && employeeId > 0;
    }


    private static string FormatEmployeeId(
        int employeeId)
    {
        return
            $"EMP-{employeeId:000}";
    }


    // ============================================================
    // USER NAME
    // ============================================================

    private string GetCurrentUserName()
    {
        var principal =
            _httpContextAccessor
                .HttpContext?
                .User;

        if (principal == null)
        {
            return "System";
        }

        return
            principal.FindFirst(
                ClaimTypes.Name)
                ?.Value

            ?? principal.FindFirst(
                "name")
                ?.Value

            ?? principal.Identity?.Name

            ?? "System";
    }


    // ============================================================
    // NAME SANITIZATION
    // ============================================================

    private static string
        SanitizeName(
            string value)
    {
        var result =
            value.Trim();

        if (result.Length > 255)
        {
            result =
                result[..255];
        }

        return result;
    }


    // ============================================================
    // CSV ESCAPING
    // ============================================================

    private static string Csv(
        string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "\"\"";
        }

        return
            "\"" +
            value.Replace(
                "\"",
                "\"\"") +
            "\"";
    }
}