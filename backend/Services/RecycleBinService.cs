using TalentSphereAPI.DTOs.RecycleBin;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class RecycleBinService : IRecycleBinService
    {
        private readonly IRecycleBinRepository _repository;

        public RecycleBinService(IRecycleBinRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<DeletedRecordDto>> GetDeletedUsersAsync()
            => await _repository.GetDeletedUsersAsync();

        public async Task<bool> RestoreUserAsync(int userId)
            => await _repository.RestoreUserAsync(userId);

        public async Task<bool> PermanentlyDeleteUserAsync(int userId)
            => await _repository.PermanentlyDeleteUserAsync(userId);

        public async Task<List<DeletedRecordDto>> GetDeletedStudentsAsync()
            => await _repository.GetDeletedStudentsAsync();

        public async Task<bool> RestoreStudentAsync(int studentId)
            => await _repository.RestoreStudentAsync(studentId);

        public async Task<bool> PermanentlyDeleteStudentAsync(int studentId)
            => await _repository.PermanentlyDeleteStudentAsync(studentId);

        public async Task<List<DeletedRecordDto>> GetDeletedMentorsAsync()
            => await _repository.GetDeletedMentorsAsync();

        public async Task<bool> RestoreMentorAsync(int mentorId)
            => await _repository.RestoreMentorAsync(mentorId);

        public async Task<bool> PermanentlyDeleteMentorAsync(int mentorId)
            => await _repository.PermanentlyDeleteMentorAsync(mentorId);

        public async Task<List<DeletedRecordDto>> GetDeletedEmployeesAsync()
            => await _repository.GetDeletedEmployeesAsync();

        public async Task<bool> RestoreEmployeeAsync(int employeeId)
            => await _repository.RestoreEmployeeAsync(employeeId);

        public async Task<bool> PermanentlyDeleteEmployeeAsync(int employeeId)
            => await _repository.PermanentlyDeleteEmployeeAsync(employeeId);
    }
}