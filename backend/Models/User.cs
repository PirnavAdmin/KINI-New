namespace TalentSphereAPI.Models
{
    public class User : BaseEntity
    {
        public int UserId { get; set; }

        // NULL for platform-level users such as SuperAdmin.
        // Organization users must have an OrganizationId.
        public int? OrganizationId { get; set; }

        public Organization? Organization { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public string? Phone { get; set; }

        public bool IsEmailVerified { get; set; }

        public bool IsPhoneVerified { get; set; }

        public DateTime CreatedDate { get; set; }
            = DateTime.UtcNow;
    }
}