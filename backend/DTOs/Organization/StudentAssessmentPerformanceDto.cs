namespace TalentSphereAPI.DTOs.Organization
{
    public class StudentAssessmentPerformanceDto
    {
        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }

        public string Email { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public int TotalAssessmentsAssigned { get; set; }

        public int AssessmentsTaken { get; set; }

        public int TotalAttempts { get; set; }

        public int CompletedAttempts { get; set; }

        public int InProgressAttempts { get; set; }

        public int PassedAssessments { get; set; }

        public int FailedAssessments { get; set; }

        public decimal AveragePercentage { get; set; }

        public List<StudentAssessmentPerformanceItemDto> Results { get; set; }
            = new();
    }

    public class StudentAssessmentPerformanceItemDto
    {
        public int StudentAssessmentId { get; set; }

        public int AssessmentId { get; set; }

        public string AssessmentTitle { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public int AttemptNumber { get; set; }

        public DateTime StartedAt { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public string Status { get; set; } = string.Empty;

        public decimal Score { get; set; }

        public int TotalMarks { get; set; }

        public decimal Percentage { get; set; }

        public string Result { get; set; } = string.Empty;

        public int TotalQuestions { get; set; }

        public int CorrectAnswers { get; set; }

        public int WrongAnswers { get; set; }
    }
}