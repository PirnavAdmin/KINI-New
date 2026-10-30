namespace TalentSphereAPI.DTOs.StudentAssessment
{
    public class AssessmentResultDto
    {
        public int StudentAssessmentId { get; set; }

        public decimal Score { get; set; }

        public decimal Percentage { get; set; }

        public string Result { get; set; } = string.Empty;

        public int TotalQuestions { get; set; }

        public int CorrectAnswers { get; set; }

        public int WrongAnswers { get; set; }

        public bool WasAutoSubmitted { get; set; }
    }
}