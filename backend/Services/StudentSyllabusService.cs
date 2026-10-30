using TalentSphereAPI.DTOs.StudentSyllabus;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class StudentSyllabusService
        : IStudentSyllabusService
    {
        private readonly IStudentSyllabusRepository _repository;

        public StudentSyllabusService(
            IStudentSyllabusRepository repository)
        {
            _repository = repository;
        }

        public async Task<StudentSyllabusDto?>
            GetMySyllabusAsync(string identifier)
        {
            return await _repository
                .GetMySyllabusAsync(identifier);
        }
    }
}