using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IStudentRepository
    {
        Task<IEnumerable<Student>> GetAllAsync(
            StudentQueryDto query);

        Task<Student?> GetByIdAsync(
            int id);

        Task<Student> CreateAsync(
            Student student);

        Task<bool> UpdateAsync(
            Student student);

        Task<bool> DeleteAsync(
            int id);

        Task<bool> EmailExistsAsync(
            string email,
            int? excludeStudentId = null);
        Task<Student?> GetByGoogleSubjectIdAsync(
    string googleSubjectId);

        Task<Student?> GetByEmailForLoginAsync(
            string email);

        Task<bool> LinkGoogleSubjectIdAsync(
            int studentId,
            string googleSubjectId);
    }
}