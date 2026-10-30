using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Assessment
{
    public class CreateAssessmentDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

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

        public string AssessmentType { get; set; } = "MCQ";

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }
}