using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrStudentService
{
    Task<HrStudentSummaryDto> GetSummaryAsync();

    Task<(IEnumerable<HrStudentDto> Items, int TotalCount)> GetAllAsync(
        HrStudentQueryDto query);

    Task<HrStudentDto?> GetByIdAsync(int studentId);

    Task<bool> UpdateAsync(
        int studentId,
        HrStudentUpdateDto dto);

    Task<bool> DeleteAsync(int studentId);

    Task<bool> UpdateStatusAsync(
        int studentId,
        HrStudentStatusUpdateDto dto);

    Task<HrStudentEnrollmentDto?> GetEnrollmentAsync(
        int studentId);
}