using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.DTOs.AI
{
    public class AiAssessmentResponseDto
    {
        public List<AiGeneratedQuestionDto> Questions { get; set; } = new();
    }
}