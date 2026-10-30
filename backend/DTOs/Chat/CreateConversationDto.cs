namespace TalentSphereAPI.DTOs.Chat
{
    public class CreateConversationDto
    {
        // Required when Mentor creates chat
        public int? StudentId { get; set; }

        // Required when Student creates chat
        public int? MentorId { get; set; }
    }
}