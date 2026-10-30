using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs
{
    public class RegistrationDto
    {
        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, RegularExpression(@"^[6-9]\\d{9}$",
            ErrorMessage = "Enter a valid 10-digit Indian mobile number.")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Qualification { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string Program { get; set; } = string.Empty;
    }
}

