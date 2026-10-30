namespace TalentSphereAPI.DTOs.Chat
{
    public class ChatParticipantDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
    }
}