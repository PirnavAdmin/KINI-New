using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class ChatMessage
    {
        [Key]
        public int MessageId { get; set; }

        public int ConversationId { get; set; }

        public ChatConversation Conversation { get; set; } = null!;

        // =====================================================
        // SENDER
        // =====================================================

        [Required]
        [MaxLength(20)]
        public string SenderType { get; set; } = string.Empty;

        public int SenderId { get; set; }

        // =====================================================
        // MESSAGE
        // =====================================================

        [MaxLength(5000)]
        public string Message { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // =====================================================
        // READ STATUS
        // =====================================================

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        // =====================================================
        // ATTACHMENT
        // =====================================================

        public int? AttachmentId { get; set; }

        public ChatAttachment? Attachment { get; set; }
    }
}