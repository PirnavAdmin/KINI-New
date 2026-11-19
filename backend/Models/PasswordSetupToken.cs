using System.ComponentModel.DataAnnotations;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Models
{
    /// <summary>
    /// Single-use, expiring password-setup token. Only the SHA-256 hash of the
    /// token is stored; the raw value exists only in the emailed link.
    /// </summary>
    public class PasswordSetupToken
    {
        [Key]
        public int PasswordSetupTokenId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int? CourseEnrollmentId { get; set; }
        public CourseEnrollment? CourseEnrollment { get; set; }

        public string TokenHash { get; set; } = string.Empty;

        public PasswordSetupTokenPurpose Purpose { get; set; }
            = PasswordSetupTokenPurpose.InitialSetup;

        public DateTime ExpiresAt { get; set; }

        public DateTime? UsedAt { get; set; }

        public DateTime? RevokedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
