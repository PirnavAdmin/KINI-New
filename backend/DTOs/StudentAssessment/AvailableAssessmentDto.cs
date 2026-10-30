namespace TalentSphereAPI.DTOs.StudentAssessment
{
    public class AvailableAssessmentDto
    {
        public int AssessmentId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public decimal TotalMarks { get; set; }

        public decimal PassingMarks { get; set; }

        public int DurationMinutes { get; set; }

        public string AssessmentType { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; } = string.Empty;

        // Latest attempt information
        public bool AlreadyStarted { get; set; }

        public bool AlreadySubmitted { get; set; }

        public string? LatestResult { get; set; }

        public bool CanRetake { get; set; }

        public int AttemptNumber { get; set; }

        public int? StudentAssessmentId { get; set; }
    }
}