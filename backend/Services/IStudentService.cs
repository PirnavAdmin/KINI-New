using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Services
{
    public interface IStudentService
    {
        Task<IEnumerable<StudentDto>> GetAllAsync(
            StudentQueryDto query);

        Task<StudentDto?> GetByIdAsync(
            int id);

        Task<StudentDto> CreateAsync(
            CreateStudentDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateStudentDto dto);

        Task<bool> DeleteAsync(
            int id);
        Task<bool> ApproveAsync(int id);

        Task<bool> RejectAsync(int id);
        Task<LoginResponseDto> GoogleLoginAsync(
    StudentGoogleLoginDto dto);
    }
}