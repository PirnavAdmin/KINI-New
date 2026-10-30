using TalentSphereAPI.DTOs.Assessment;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IAssessmentService
    {
        Task<List<AssessmentDto>> GetAllAsync();

        Task<AssessmentDto?> GetByIdAsync(
            int assessmentId);

        Task<int> CreateAsync(
            CreateAssessmentDto dto);

        Task<bool> UpdateAsync(
            int assessmentId,
            UpdateAssessmentDto dto);

        Task<bool> DeleteAsync(
            int assessmentId);

        Task<bool> PublishAsync(
            int assessmentId);
    }
}