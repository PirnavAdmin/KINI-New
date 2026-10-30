namespace TalentSphereAPI.DTOs.StudentAssessment
{
    public class StudentAssessmentDto
    {
        public int StudentAssessmentId { get; set; }

        public int AssessmentId { get; set; }

        public int StudentId { get; set; }

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

        public DateTime StartedAt { get; set; }

        public DateTime? SubmissionDeadline { get; set; }

        public int RemainingSeconds { get; set; }

        public string Status { get; set; } = string.Empty;

        public List<StudentAssessmentQuestionDto> Questions { get; set; }
            = new();
    }

    public class StudentAssessmentQuestionDto
    {
        public int QuestionId { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public string QuestionType { get; set; } = string.Empty;

        public string Difficulty { get; set; } = string.Empty;

        public int Marks { get; set; }

        public int OrderNo { get; set; }

        public List<StudentAssessmentOptionDto> Options { get; set; }
            = new();
    }

    public class StudentAssessmentOptionDto
    {
        public int OptionId { get; set; }

        public string OptionText { get; set; } = string.Empty;
    }
}