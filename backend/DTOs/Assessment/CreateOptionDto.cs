namespace TalentSphereAPI.DTOs.AssessmentQuestion
{
    public class CreateOptionDto
    {
        public string OptionText { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }
    }
}