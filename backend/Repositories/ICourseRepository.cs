using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface ICourseRepository
    {
        Task<(IEnumerable<Course> Courses, int TotalCount)> GetAllAsync(
            string? search,
            bool? status,
            int? mentorId,
            int? batchId,
            string? level,
            string? sortBy,
            string? sortOrder,
            int page,
            int pageSize);

        Task<Course?> GetByIdAsync(int id);

        Task<Course> CreateAsync(Course course);

        Task<bool> UpdateAsync(Course course);

        Task<bool> DeleteAsync(int id);

        Task<bool> SaveAsync();
    }
}