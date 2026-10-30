using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models;

public class HrAnnouncement : BaseEntity
{
    [Key]
    public int AnnouncementId { get; set; }

    public int OrganizationId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Audience { get; set; } = "All";

    [MaxLength(50)]
    public string Status { get; set; } = "PUBLISHED";

    public DateTime PublishDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    public int? CreatedByEmployeeId { get; set; }

    [MaxLength(255)]
    public string CreatedBy { get; set; } = string.Empty;

    public Organization Organization { get; set; } = null!;
}