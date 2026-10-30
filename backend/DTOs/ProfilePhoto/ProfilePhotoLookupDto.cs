namespace TalentSphereAPI.DTOs.Profile
{
    public class ProfilePhotoLookupDto
    {
        public string ProfileType { get; set; } = string.Empty;

        public int ProfileId { get; set; }

        public string DisplayName { get; set; } = string.Empty;

        public string? PhotoUrl { get; set; }
    }
}