namespace TalentSphereAPI.DTOs.HR;

public class HrAnnouncementFilterDto
{
    public string? Search { get; set; }
    public string? Audience { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}


public class HrAnnouncementListItemDto
{
    public int AnnouncementId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
}


public class HrAnnouncementDetailDto
{
    public int AnnouncementId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
}


public class HrAnnouncementPagedResponse
{
    public List<HrAnnouncementListItemDto> Items { get; set; } = new();

    public int Page { get; set; }

    public int Limit { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}


public class HrAnnouncementCreateDto
{
    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Audience { get; set; } = "All";

    public DateTime? PublishDate { get; set; }

    public DateTime? ExpiryDate { get; set; }
}


public class HrAnnouncementUpdateDto
{
    public string? Title { get; set; }

    public string? Content { get; set; }

    public string? Audience { get; set; }

    public string? Status { get; set; }

    public DateTime? PublishDate { get; set; }

    public DateTime? ExpiryDate { get; set; }
}


public class HrAnnouncementSummaryDto
{
    public int TotalAnnouncements { get; set; }

    public int Published { get; set; }

    public int Drafts { get; set; }

    public int Expired { get; set; }

    public int RecentlyPublished { get; set; }
}


public class HrAnnouncementOptionsDto
{
    public List<string> Audiences { get; set; } = new();

    public List<string> Statuses { get; set; } = new();
}