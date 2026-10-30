using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IStudentBatchRepository
    {
        Task<BatchStudentsDto?> GetStudentsByBatchIdAsync(
            int batchId);

        Task<List<AvailableStudentDto>>
            GetAvailableStudentsAsync(int batchId);

        Task<EnrollStudentsResponseDto>
            EnrollStudentsToBatchAsync(
                EnrollStudentsToBatchDto dto);
    }
}