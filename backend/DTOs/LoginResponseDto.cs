namespace TalentSphereAPI.DTOs
{
    public class LoginResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
        public string Email { get; set; } = string.Empty;



    }
}