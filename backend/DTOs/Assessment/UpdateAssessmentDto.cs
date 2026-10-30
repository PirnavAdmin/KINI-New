using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Assessment
{
    public class UpdateAssessmentDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CourseId { get; set; }

        public int BatchId { get; set; }

        public int TotalMarks { get; set; }

        public int PassingMarks { get; set; }

        public int DurationMinutes { get; set; }

        public string AssessmentType { get; set; } = "MCQ";

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }
}