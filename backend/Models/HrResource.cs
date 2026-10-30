using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models;

public class HrResource : BaseEntity
{
    [Key]
    public int ResourceId { get; set; }

    public int OrganizationId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(20)]
    public string FileType { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string StoredFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string StoredFilePath { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string UploadedBy { get; set; } = string.Empty;

    public int? UploadedByEmployeeId { get; set; }

    public long FileSize { get; set; }

    public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;
}