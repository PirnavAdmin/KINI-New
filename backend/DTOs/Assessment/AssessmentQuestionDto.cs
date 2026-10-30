namespace TalentSphereAPI.DTOs.Assessment
{
    public class AssessmentQuestionDto
    {
        public int QuestionId { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public string QuestionType { get; set; } = string.Empty;

        public string Difficulty { get; set; } = string.Empty;

        public int Marks { get; set; }

        public List<AssessmentOptionDto> Options { get; set; } = new();
    }
}