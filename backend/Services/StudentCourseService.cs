using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class StudentCourseService
        : IStudentCourseService
    {
        private readonly IStudentCourseRepository _repository;

        public StudentCourseService(
            IStudentCourseRepository repository)
        {
            _repository = repository;
        }

        public async Task<StudentCoursesResponseDto?>
            GetMyCoursesAsync(
                string identifier)
        {
            return await _repository
                .GetMyCoursesAsync(identifier);
        }
    }
}