namespace TalentSphereAPI.DTOs.Permissions
{
    public class UserPermissionDto
    {
        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string Role { get; set; } = string.Empty;

        public List<PermissionDto> Permissions { get; set; }
            = new List<PermissionDto>();
    }
}