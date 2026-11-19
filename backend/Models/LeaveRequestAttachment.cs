namespace TalentSphereAPI.Models
{
    /// <summary>
    /// Supporting document (e.g. medical certificate) for a leave request.
    /// The file lives in private storage (App_Data); only its metadata is here.
    /// </summary>
    public class LeaveRequestAttachment
    {
        public int LeaveRequestAttachmentId { get; set; }

        public int LeaveRequestId { get; set; }
        public LeaveRequest LeaveRequest { get; set; } = null!;

        // Copied from the leave request so every lookup can be tenant-scoped.
        public int OrganizationId { get; set; }

        public int UploadedByUserId { get; set; }

        public string OriginalFileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long SizeBytes { get; set; }

        public string Sha256 { get; set; } = string.Empty;

        // Relative key inside private storage; never returned to clients.
        public string StoragePath { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
