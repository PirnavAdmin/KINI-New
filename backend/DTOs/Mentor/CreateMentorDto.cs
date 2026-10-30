using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Mentor
{
    public class CreateMentorDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public bool Status { get; set; } = true;
    }
}