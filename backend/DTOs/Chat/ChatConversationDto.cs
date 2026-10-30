namespace TalentSphereAPI.DTOs.Chat
{
    public class ChatConversationDto
    {
        public int ConversationId { get; set; }

        public ChatParticipantDto Mentor { get; set; } = null!;

        public ChatParticipantDto Student { get; set; } = null!;

        public string? LastMessage { get; set; }

        public DateTime? LastMessageAt { get; set; }

        public int UnreadCount { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}