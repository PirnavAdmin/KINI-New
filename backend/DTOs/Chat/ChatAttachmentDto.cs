namespace TalentSphereAPI.DTOs.Chat
{
    public class ChatAttachmentDto
    {
        public int AttachmentId { get; set; }

        public int ConversationId { get; set; }

        public int? MessageId { get; set; }

        public string OriginalFileName { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;

        public string FileType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public string DownloadUrl { get; set; } = string.Empty;

        public string ViewUrl { get; set; } = string.Empty;

        public int UploadedBy { get; set; }

        public string UploadedByType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }
    }
}