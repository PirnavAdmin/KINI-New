using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services;

public class HrAnnouncementService : IHrAnnouncementService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    private static readonly string[] AllowedAudiences =
    {
        "All",
        "HR",
        "Trainer",
        "Mentor",
        "Employee"
    };

    private static readonly string[] AllowedStatuses =
    {
        "DRAFT",
        "PUBLISHED"
    };

    public HrAnnouncementService(
        ApplicationDbContext context,
        ITenantContext tenantContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _tenantContext = tenantContext;
        _httpContextAccessor = httpContextAccessor;
    }

    private int OrganizationId =>
        _tenantContext.OrganizationId;


    // ============================================================
    // SUMMARY
    // ============================================================

    public async Task<HrAnnouncementSummaryDto>
        GetSummaryAsync()
    {
        var organizationId = OrganizationId;

        var query =
            _context.HrAnnouncements
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        var total =
            await query.CountAsync();

        var published =
            await query.CountAsync(x =>
                x.Status == "PUBLISHED" &&
                (x.ExpiryDate == null ||
                 x.ExpiryDate > now));

        var drafts =
            await query.CountAsync(x =>
                x.Status == "DRAFT");

        var expired =
            await query.CountAsync(x =>
                x.ExpiryDate.HasValue &&
                x.ExpiryDate <= now);

        var recentlyPublished =
            await query.CountAsync(x =>
                x.Status == "PUBLISHED" &&
                x.PublishDate >= thirtyDaysAgo);

        return new HrAnnouncementSummaryDto
        {
            TotalAnnouncements = total,
            Published = published,
            Drafts = drafts,
            Expired = expired,
            RecentlyPublished = recentlyPublished
        };
    }


    // ============================================================
    // LIST
    // ============================================================

    public async Task<HrAnnouncementPagedResponse>
        GetAnnouncementsAsync(
            HrAnnouncementFilterDto filter)
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

        if (totalPages > 0 &&
            page > totalPages)
        {
            page = totalPages;
        }

        var announcements =
            await query
                .OrderByDescending(x => x.PublishDate)
                .ThenByDescending(x => x.AnnouncementId)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

        var now = DateTime.UtcNow;

        var items =
            announcements
                .Select(x =>
                {
                    var status =
                        GetEffectiveStatus(
                            x,
                            now);

                    return new HrAnnouncementListItemDto
                    {
                        AnnouncementId =
                            x.AnnouncementId,

                        Title =
                            x.Title,

                        Audience =
                            x.Audience,

                        Status =
                            status,

                        PublishDate =
                            x.PublishDate,

                        ExpiryDate =
                            x.ExpiryDate,

                        CreatedBy =
                            x.CreatedBy
                    };
                })
                .ToList();

        return new HrAnnouncementPagedResponse
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

    public async Task<HrAnnouncementDetailDto?>
        GetByIdAsync(
            int announcementId)
    {
        var announcement =
            await _context.HrAnnouncements
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.AnnouncementId ==
                        announcementId &&
                    x.OrganizationId ==
                        OrganizationId &&
                    !x.IsDeleted);

        if (announcement == null)
        {
            return null;
        }

        return MapDetail(announcement);
    }


    // ============================================================
    // CREATE
    // ============================================================

    public async Task<HrAnnouncementDetailDto>
        CreateAsync(
            HrAnnouncementCreateDto dto)
    {
        ValidateCreate(dto);

        var employee =
            await GetCurrentEmployeeAsync();

        if (employee == null)
        {
            throw new UnauthorizedAccessException(
                "The authenticated employee could not be resolved.");
        }

        var publishDate =
            dto.PublishDate?.ToUniversalTime()
            ?? DateTime.UtcNow;

        var expiryDate =
            dto.ExpiryDate?.ToUniversalTime();

        if (expiryDate.HasValue &&
            expiryDate.Value <= publishDate)
        {
            throw new ArgumentException(
                "Expiry date must be later than the publish date.");
        }

        var audience =
            NormalizeAudience(dto.Audience);

        if (audience == null)
        {
            throw new ArgumentException(
                "Invalid audience.");
        }

        var announcement =
            new HrAnnouncement
            {
                OrganizationId =
                    OrganizationId,

                Title =
                    dto.Title.Trim(),

                Content =
                    dto.Content.Trim(),

                Audience =
                    audience,

                Status =
                    "PUBLISHED",

                PublishDate =
                    publishDate,

                ExpiryDate =
                    expiryDate,

                CreatedByEmployeeId =
                    employee.EmployeeId,

                CreatedBy =
                    $"{employee.FirstName} {employee.LastName}"
                        .Trim()
            };

        _context.HrAnnouncements.Add(
            announcement);

        await _context.SaveChangesAsync();
       

        return MapDetail(announcement);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public async Task<HrAnnouncementDetailDto?>
        UpdateAsync(
            int announcementId,
            HrAnnouncementUpdateDto dto)
    {
        var announcement =
            await _context.HrAnnouncements
                .FirstOrDefaultAsync(x =>
                    x.AnnouncementId ==
                        announcementId &&
                    x.OrganizationId ==
                        OrganizationId &&
                    !x.IsDeleted);

        if (announcement == null)
        {
            return null;
        }

        if (dto.Title != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new ArgumentException(
                    "Title cannot be empty.");
            }

            announcement.Title =
                dto.Title.Trim();
        }

        if (dto.Content != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                throw new ArgumentException(
                    "Content cannot be empty.");
            }

            announcement.Content =
                dto.Content.Trim();
        }

        if (dto.Audience != null)
        {
            var audience =
                NormalizeAudience(dto.Audience);

            if (audience == null)
            {
                throw new ArgumentException(
                    "Invalid audience.");
            }

            announcement.Audience =
                audience;
        }

        if (dto.Status != null)
        {
            var status =
                NormalizeStatus(dto.Status);

            if (status == null)
            {
                throw new ArgumentException(
                    "Invalid status. Allowed values are DRAFT and PUBLISHED.");
            }

            announcement.Status =
                status;
        }

        if (dto.PublishDate.HasValue)
        {
            announcement.PublishDate =
                dto.PublishDate.Value.ToUniversalTime();
        }

        if (dto.ExpiryDate.HasValue)
        {
            announcement.ExpiryDate =
                dto.ExpiryDate.Value.ToUniversalTime();
        }

        if (announcement.ExpiryDate.HasValue &&
            announcement.ExpiryDate.Value <=
                announcement.PublishDate)
        {
            throw new ArgumentException(
                "Expiry date must be later than the publish date.");
        }

        await _context.SaveChangesAsync();

        return MapDetail(announcement);
    }


    // ============================================================
    // DELETE
    // ============================================================

    public async Task<bool>
        DeleteAsync(
            int announcementId)
    {
        var announcement =
            await _context.HrAnnouncements
                .FirstOrDefaultAsync(x =>
                    x.AnnouncementId ==
                        announcementId &&
                    x.OrganizationId ==
                        OrganizationId &&
                    !x.IsDeleted);

        if (announcement == null)
        {
            return false;
        }

        announcement.IsDeleted = true;
        announcement.DeletedOn =
            DateTime.UtcNow;
        announcement.DeletedBy =
            GetCurrentUserName();

        await _context.SaveChangesAsync();

        return true;
    }


    // ============================================================
    // OPTIONS
    // ============================================================

    public Task<HrAnnouncementOptionsDto>
        GetOptionsAsync()
    {
        return Task.FromResult(
            new HrAnnouncementOptionsDto
            {
                Audiences =
                    AllowedAudiences.ToList(),

                Statuses =
                    AllowedStatuses.ToList()
            });
    }


    // ============================================================
    // EXPORT
    // ============================================================

    public async Task<byte[]>
        ExportAsync(
            HrAnnouncementFilterDto filter)
    {
        var announcements =
            await BuildFilteredQuery(filter)
                .OrderByDescending(x =>
                    x.PublishDate)
                .ThenByDescending(x =>
                    x.AnnouncementId)
                .ToListAsync();

        var now = DateTime.UtcNow;

        var csv =
            new StringBuilder();

        csv.AppendLine(
            "AnnouncementId,Title,Audience,Status,PublishDate,ExpiryDate,CreatedBy");

        foreach (var announcement in announcements)
        {
            var status =
                GetEffectiveStatus(
                    announcement,
                    now);

            csv.AppendLine(
                string.Join(",",
                    Csv(
                        announcement.AnnouncementId
                            .ToString(
                                CultureInfo.InvariantCulture)),

                    Csv(
                        announcement.Title),

                    Csv(
                        announcement.Audience),

                    Csv(
                        status),

                    Csv(
                        announcement.PublishDate
                            .ToString(
                                "yyyy-MM-dd HH:mm:ss",
                                CultureInfo.InvariantCulture)),

                    Csv(
                        announcement.ExpiryDate.HasValue
                            ? announcement.ExpiryDate.Value
                                .ToString(
                                    "yyyy-MM-dd HH:mm:ss",
                                    CultureInfo.InvariantCulture)
                            : string.Empty),

                    Csv(
                        announcement.CreatedBy)
                ));
        }

        return Encoding.UTF8.GetBytes(
            csv.ToString());
    }


    // ============================================================
    // FILTER QUERY
    // ============================================================

    private IQueryable<HrAnnouncement>
        BuildFilteredQuery(
            HrAnnouncementFilterDto filter)
    {
        var query =
            _context.HrAnnouncements
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&
                    !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(
                filter.Search))
        {
            var search =
                filter.Search
                    .Trim()
                    .ToLower();

            query =
                query.Where(x =>
                    x.Title
                        .ToLower()
                        .Contains(search) ||

                    x.Content
                        .ToLower()
                        .Contains(search) ||

                    x.CreatedBy
                        .ToLower()
                        .Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(
                filter.Audience))
        {
            var audience =
                filter.Audience.Trim();

            query =
                query.Where(x =>
                    x.Audience == audience);
        }

        if (!string.IsNullOrWhiteSpace(
                filter.Status))
        {
            var status =
                NormalizeStatus(
                    filter.Status);

            if (status == null)
            {
                return query.Where(x =>
                    false);
            }

            if (status == "DRAFT")
            {
                query =
                    query.Where(x =>
                        x.Status == "DRAFT");
            }
            else
            {
                var now =
                    DateTime.UtcNow;

                query =
                    query.Where(x =>
                        x.Status == "PUBLISHED" &&
                        (x.ExpiryDate == null ||
                         x.ExpiryDate > now));
            }
        }

        if (filter.StartDate.HasValue)
        {
            var start =
                filter.StartDate.Value.Date;

            query =
                query.Where(x =>
                    x.PublishDate >= start);
        }

        if (filter.EndDate.HasValue)
        {
            var endExclusive =
                filter.EndDate.Value.Date
                    .AddDays(1);

            query =
                query.Where(x =>
                    x.PublishDate < endExclusive);
        }

        return query;
    }


    // ============================================================
    // VALIDATION
    // ============================================================

    private static void ValidateCreate(
        HrAnnouncementCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ArgumentException(
                "Title is required.");
        }

        if (dto.Title.Trim().Length > 255)
        {
            throw new ArgumentException(
                "Title cannot exceed 255 characters.");
        }

        if (string.IsNullOrWhiteSpace(dto.Content))
        {
            throw new ArgumentException(
                "Content is required.");
        }

        if (dto.Content.Trim().Length > 100000)
        {
            throw new ArgumentException(
                "Content is too long.");
        }
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
                .FindFirst(
                    ClaimTypes.NameIdentifier)
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
                x.OrganizationId ==
                    OrganizationId &&
                x.UserId == userId &&
                !x.IsDeleted);
    }


    // ============================================================
    // STATUS
    // ============================================================

    private static string
        GetEffectiveStatus(
            HrAnnouncement announcement,
            DateTime now)
    {
        if (announcement.ExpiryDate.HasValue &&
            announcement.ExpiryDate.Value <= now)
        {
            return "EXPIRED";
        }

        return announcement.Status;
    }


    private static string?
        NormalizeStatus(
            string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        var value =
            status.Trim()
                .ToUpperInvariant();

        return AllowedStatuses
            .Contains(value)
                ? value
                : null;
    }


    // ============================================================
    // AUDIENCE
    // ============================================================

    private static string?
        NormalizeAudience(
            string? audience)
    {
        if (string.IsNullOrWhiteSpace(audience))
        {
            return null;
        }

        var value =
            audience.Trim();

        return AllowedAudiences
            .FirstOrDefault(x =>
                string.Equals(
                    x,
                    value,
                    StringComparison.OrdinalIgnoreCase));
    }


    // ============================================================
    // MAPPING
    // ============================================================

    private static HrAnnouncementDetailDto
        MapDetail(
            HrAnnouncement announcement)
    {
        return new HrAnnouncementDetailDto
        {
            AnnouncementId =
                announcement.AnnouncementId,

            Title =
                announcement.Title,

            Content =
                announcement.Content,

            Audience =
                announcement.Audience,

            Status =
                GetEffectiveStatus(
                    announcement,
                    DateTime.UtcNow),

            PublishDate =
                announcement.PublishDate,

            ExpiryDate =
                announcement.ExpiryDate,

            CreatedBy =
                announcement.CreatedBy
        };
    }


    // ============================================================
    // CURRENT USER
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
    // CSV
    // ============================================================

    private static string Csv(
        string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "\"\"";
        }

        return "\"" +
               value.Replace(
                   "\"",
                   "\"\"") +
               "\"";
    }
}