using TalentSphereAPI.DTOs.AssessmentQuestion;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IAssessmentQuestionService
    {
        Task<List<QuestionDto>> GetByAssessmentAsync(int assessmentId);

        Task<QuestionDto?> GetByIdAsync(int questionId);

        Task<int> CreateAsync(CreateQuestionDto dto);

        Task<bool> UpdateAsync(int questionId, UpdateQuestionDto dto);

        Task<bool> DeleteAsync(int questionId);
    }
}