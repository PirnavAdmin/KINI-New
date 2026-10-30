using TalentSphereAPI.DTOs.CourseSyllabus;

namespace TalentSphereAPI.Repositories
{
    public interface ICourseSyllabusRepository
    {
        Task<CourseSyllabusDto?> GetByCourseIdAsync(
      int courseId,
      int? batchId = null);

        Task<CourseSyllabusDto> CreateOrReplaceAsync(
            int courseId,
            CreateCourseSyllabusDto dto);
    }
}