using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class CourseModule
    {
        [Key]
        public int ModuleId { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int ModuleNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string ModuleName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public Course Course { get; set; } = null!;

        public ICollection<CourseTopic> Topics { get; set; }
            = new List<CourseTopic>();
    }
}