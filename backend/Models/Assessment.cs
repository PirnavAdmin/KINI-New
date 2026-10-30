using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class Assessment
    {
        [Key]
        public int AssessmentId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int BatchId { get; set; }

        [Required]
        public int TotalMarks { get; set; }

        [Required]
        public int PassingMarks { get; set; }

        [Required]
        public int DurationMinutes { get; set; }

        [Required]
        [MaxLength(20)]
        public string AssessmentType { get; set; } = "MCQ";
        // MCQ | Coding | Mixed

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Draft";
        // Draft | Published | Completed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties

        public Course Course { get; set; } = null!;

        public Batch Batch { get; set; } = null!;

        public ICollection<AssessmentQuestion> Questions { get; set; }
            = new List<AssessmentQuestion>();

        public ICollection<StudentAssessment> StudentAssessments { get; set; }
            = new List<StudentAssessment>();
    }
}