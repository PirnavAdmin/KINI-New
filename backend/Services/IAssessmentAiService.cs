using TalentSphereAPI.DTOs.AI;
using TalentSphereAPI.Models;

public interface IAssessmentAiService
{
    Task<Assessment> GenerateQuestionsAsync(GenerateAssessmentDto dto);
}