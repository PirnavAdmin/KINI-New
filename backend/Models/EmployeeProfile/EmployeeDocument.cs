using TalentSphereAPI.Models;

namespace TalentSphereAPI.Models.EmployeeProfile;

public class EmployeeDocument : BaseEntity
{
    public int EmployeeDocumentId { get; set; }
    public int OrganizationId { get; set; }
    public int EmployeeProfileId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string StoredFilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public EmployeeProfile EmployeeProfile { get; set; } = null!;
}
