using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Services
{
    public interface IStudentCourseService
    {
        Task<StudentCoursesResponseDto?>
            GetMyCoursesAsync(
                string identifier);
    }
}