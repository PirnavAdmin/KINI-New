using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IAssessmentRepository
    {
        Task<List<Assessment>> GetAllAsync();

        Task<Assessment?> GetByIdAsync(
            int assessmentId);

        Task AddAsync(
            Assessment assessment);

        Task UpdateAsync(
            Assessment assessment);

        Task DeleteAsync(
            Assessment assessment);

        Task<bool> ExistsAsync(
            int assessmentId);

        Task<int> SaveChangesAsync();

        Task AddQuestionsAsync(
            IEnumerable<AssessmentQuestion> questions);
    }
}