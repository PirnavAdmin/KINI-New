using TalentSphereAPI.DTOs.CourseSyllabus;

namespace TalentSphereAPI.Services
{
    public interface ICourseSyllabusService
    {
        Task<CourseSyllabusDto?> GetByCourseIdAsync(
     int courseId,
     int? batchId = null);

        Task<CourseSyllabusDto> CreateOrReplaceAsync(
            int courseId,
            CreateCourseSyllabusDto dto);
    }
}