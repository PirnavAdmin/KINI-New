using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IAssessmentQuestionRepository
    {
        Task<List<AssessmentQuestion>> GetByAssessmentAsync(int assessmentId);

        Task<AssessmentQuestion?> GetByIdAsync(int questionId);

        Task AddAsync(AssessmentQuestion question);

        Task UpdateAsync(AssessmentQuestion question);

        Task DeleteAsync(AssessmentQuestion question);

        Task<int> SaveChangesAsync();
    }
}