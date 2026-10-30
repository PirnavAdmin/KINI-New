using TalentSphereAPI.DTOs.RecycleBin;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IRecycleBinRepository
    {
        Task<List<DeletedRecordDto>> GetDeletedUsersAsync();

        Task<List<DeletedRecordDto>> GetDeletedStudentsAsync();

        Task<List<DeletedRecordDto>> GetDeletedMentorsAsync();

        Task<List<DeletedRecordDto>> GetDeletedEmployeesAsync();

        Task<bool> RestoreUserAsync(int userId);

        Task<bool> RestoreStudentAsync(int studentId);

        Task<bool> RestoreMentorAsync(int mentorId);

        Task<bool> RestoreEmployeeAsync(int employeeId);

        Task<bool> PermanentlyDeleteUserAsync(int userId);

        Task<bool> PermanentlyDeleteStudentAsync(int studentId);

        Task<bool> PermanentlyDeleteMentorAsync(int mentorId);

        Task<bool> PermanentlyDeleteEmployeeAsync(int employeeId);
    }
}