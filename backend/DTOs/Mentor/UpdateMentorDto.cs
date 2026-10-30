using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Mentor
{
    public class UpdateMentorDto
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

        [Required]
        public List<int> CourseIds { get; set; } = new();

        public bool Status { get; set; }
    }
}