using Microsoft.AspNetCore.Http;

namespace TalentSphereAPI.DTOs.HR;

// ============================================================
// RESOURCE FILTER
// ============================================================

public class HrResourceFilterDto
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? FileType { get; set; }
    public string? UploadedBy { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}


// ============================================================
// RESOURCE LIST ITEM
// ============================================================

public class HrResourceListItemDto
{
    public int ResourceId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public long SizeKb { get; set; }

    public string UploadedBy { get; set; } = string.Empty;

    public DateTime UploadedDate { get; set; }
}


// ============================================================
// PAGED RESOURCE RESPONSE
// ============================================================

public class HrResourcePagedResponse
{
    public List<HrResourceListItemDto> Items { get; set; } = new();

    public int Page { get; set; }

    public int Limit { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}


// ============================================================
// RESOURCE DETAIL
// ============================================================

public class HrResourceDetailDto
{
    public int ResourceId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string FileType { get; set; } = string.Empty;

    public long SizeKb { get; set; }

    public string UploadedBy { get; set; } = string.Empty;

    public DateTime UploadedDate { get; set; }

    public string FileUrl { get; set; } = string.Empty;
}


// ============================================================
// RESOURCE UPLOAD REQUEST
// ============================================================

public class HrResourceUploadDto
{
    public IFormFile? File { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Description { get; set; }
}


// ============================================================
// RESOURCE UPDATE
// ============================================================

public class HrResourceUpdateDto
{
    public string? Name { get; set; }

    public string? Category { get; set; }

    public string? Description { get; set; }
}


// ============================================================
// SUMMARY
// ============================================================

public class HrResourceSummaryDto
{
    public int TotalResources { get; set; }

    public int HrPolicies { get; set; }

    public int TrainerResources { get; set; }

    public int RecentlyAdded { get; set; }
}


// ============================================================
// SIMPLE DROPDOWN RESPONSE
// ============================================================

public class HrResourceStringListDto
{
    public List<string> Items { get; set; } = new();
}


// ============================================================
// UPLOADER DROPDOWN
// ============================================================

public class HrResourceUploaderDto
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
}


public class HrResourceUploaderListDto
{
    public List<HrResourceUploaderDto> Items { get; set; } = new();
}