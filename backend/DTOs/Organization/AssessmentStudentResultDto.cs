namespace TalentSphereAPI.DTOs.Organization
{
    public class AssessmentStudentResultsResponseDto
    {
        public int AssessmentId { get; set; }

        public string AssessmentTitle { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public int TotalMarks { get; set; }

        public int PassingMarks { get; set; }

        public int TotalStudents { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }

        public List<AssessmentStudentResultDto> Students { get; set; }
            = new();
    }

    public class AssessmentStudentResultDto
    {
        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public DateTime? AttemptedAt { get; set; }

        public decimal? Score { get; set; }

        public decimal? Percentage { get; set; }

        public string Status { get; set; } = "Unavailable";

        public string? Result { get; set; }

        public int Attempts { get; set; }

        public int? StudentAssessmentId { get; set; }
    }
}