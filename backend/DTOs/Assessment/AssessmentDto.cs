namespace TalentSphereAPI.DTOs.Assessment
{
    public class AssessmentDto
    {
        public int AssessmentId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public int TotalMarks { get; set; }

        public int PassingMarks { get; set; }

        public int DurationMinutes { get; set; }

        public string AssessmentType { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}