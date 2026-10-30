using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class CourseTopic
    {
        [Key]
        public int TopicId { get; set; }

        [Required]
        public int ModuleId { get; set; }

        [Required]
        public int TopicNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string TopicName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public CourseModule Module { get; set; } = null!;

        public ICollection<CourseLesson> Lessons { get; set; }
            = new List<CourseLesson>();
    }
}