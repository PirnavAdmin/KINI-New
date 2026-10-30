using TalentSphereAPI.DTOs.StudentSyllabus;

namespace TalentSphereAPI.Repositories
{
    public interface IStudentSyllabusRepository
    {
        Task<StudentSyllabusDto?> GetMySyllabusAsync(
            string identifier);
    }
}