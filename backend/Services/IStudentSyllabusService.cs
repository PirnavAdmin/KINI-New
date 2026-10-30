using TalentSphereAPI.DTOs.StudentSyllabus;

namespace TalentSphereAPI.Services
{
    public interface IStudentSyllabusService
    {
        Task<StudentSyllabusDto?> GetMySyllabusAsync(
            string identifier);
    }
}