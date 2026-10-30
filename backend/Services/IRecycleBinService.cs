using TalentSphereAPI.DTOs.RecycleBin;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IRecycleBinService
    {
        Task<List<DeletedRecordDto>> GetDeletedUsersAsync();

        Task<bool> RestoreUserAsync(int userId);

        Task<bool> PermanentlyDeleteUserAsync(int userId);

        // Student
        Task<List<DeletedRecordDto>> GetDeletedStudentsAsync();
        Task<bool> RestoreStudentAsync(int studentId);
        Task<bool> PermanentlyDeleteStudentAsync(int studentId);

        // Mentor
        Task<List<DeletedRecordDto>> GetDeletedMentorsAsync();
        Task<bool> RestoreMentorAsync(int mentorId);
        Task<bool> PermanentlyDeleteMentorAsync(int mentorId);

        // Employee
        Task<List<DeletedRecordDto>> GetDeletedEmployeesAsync();
        Task<bool> RestoreEmployeeAsync(int employeeId);
        Task<bool> PermanentlyDeleteEmployeeAsync(int employeeId);
    }
}