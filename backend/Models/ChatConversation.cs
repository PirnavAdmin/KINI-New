using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class ChatConversation
    {
        [Key]
        public int ConversationId { get; set; }

        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // =====================================================
        // MENTOR
        // =====================================================

        public int MentorId { get; set; }

        public Mentor Mentor { get; set; } = null!;

        // =====================================================
        // STUDENT
        // =====================================================

        public int StudentId { get; set; }

        public Student Student { get; set; } = null!;

        // =====================================================
        // CHAT INFORMATION
        // =====================================================

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastMessageAt { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<ChatMessage> Messages { get; set; }
            = new List<ChatMessage>();

        public ICollection<ChatAttachment> Attachments { get; set; }
    = new List<ChatAttachment>();
    }
}