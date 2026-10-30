using System.ComponentModel.DataAnnotations;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs
{
    public class RegisterDto
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }

        public string? Phone { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string ConfirmPassword { get; set; } = string.Empty;

        public UserRole Role { get; set; }
    }
}