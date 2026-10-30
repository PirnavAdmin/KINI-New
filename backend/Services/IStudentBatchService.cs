using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IStudentBatchService
    {
        Task<BatchStudentsDto?>
            GetStudentsByBatchIdAsync(int batchId);

        Task<List<AvailableStudentDto>>
            GetAvailableStudentsAsync(int batchId);

        Task<EnrollStudentsResponseDto>
            EnrollStudentsToBatchAsync(
                EnrollStudentsToBatchDto dto);
    }
}