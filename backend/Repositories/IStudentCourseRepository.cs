using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Repositories
{
    public interface IStudentCourseRepository
    {
        Task<StudentCoursesResponseDto?> GetMyCoursesAsync(
            string identifier);
    }
}