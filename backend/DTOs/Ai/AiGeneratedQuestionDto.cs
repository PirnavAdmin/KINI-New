namespace TalentSphereAPI.DTOs.AI
{
    public class AiGeneratedQuestionDto
    {
        public string QuestionText { get; set; } = string.Empty;

        public string Difficulty { get; set; } = "Medium";

        public int Marks { get; set; }

        public string Explanation { get; set; } = string.Empty;

        public List<AiGeneratedOptionDto> Options { get; set; } = new();
    }
}