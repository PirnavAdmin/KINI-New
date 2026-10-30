namespace TalentSphereAPI.DTOs.AssessmentQuestion
{
    public class OptionDto
    {
        public int OptionId { get; set; }

        public string OptionText { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }
    }
}