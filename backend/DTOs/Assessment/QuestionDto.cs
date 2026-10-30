namespace TalentSphereAPI.DTOs.AssessmentQuestion
{
    public class QuestionDto
    {
        public int QuestionId { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public string QuestionType { get; set; } = string.Empty;

        public string Difficulty { get; set; } = string.Empty;

        public int Marks { get; set; }

        public int OrderNo { get; set; }

        public List<OptionDto> Options { get; set; } = new();
    }
}