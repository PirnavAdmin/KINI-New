using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class ChatAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        public int ConversationId { get; set; }

        public ChatConversation Conversation { get; set; } = null!;

        // Nullable because attachment is uploaded
        // before the message is created.
        public int? MessageId { get; set; }

        public ChatMessage? Message { get; set; }

        [Required]
        [MaxLength(255)]
        public string OriginalFileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string StoredFileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string FileType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [Required]
        [MaxLength(1000)]
        public string StoragePath { get; set; } = string.Empty;

        public int UploadedBy { get; set; }

        [Required]
        [MaxLength(20)]
        public string UploadedByType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}