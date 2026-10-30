using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class CourseLesson
    {
        [Key]
        public int LessonId { get; set; }

        [Required]
        public int TopicId { get; set; }

        [Required]
        public int LessonNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string LessonName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public CourseTopic Topic { get; set; } = null!;
    }
}