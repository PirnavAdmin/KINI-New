namespace TalentSphereAPI.DTOs.Chat
{
    public class ChatMessageDto
    {
        public int MessageId { get; set; }

        public int ConversationId { get; set; }

        public string SenderType { get; set; } = string.Empty;

        public int SenderId { get; set; }

        public string Message { get; set; } = string.Empty;

        public DateTime SentAt { get; set; }

        public bool IsRead { get; set; }

        public DateTime? ReadAt { get; set; }

        public ChatAttachmentDto? Attachment { get; set; }
    }
}