using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class Registration
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(10)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Qualification { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string Program { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}

