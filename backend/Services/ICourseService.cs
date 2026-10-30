using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.Course;

namespace TalentSphereAPI.Services
{
    public interface ICourseService
    {
        Task<PagedResponse<CourseDto>> GetAllAsync(
            string? search,
            bool? status,
            int? mentorId,
            int? batchId,
            string? level,
            string? sortBy,
            string? sortOrder,
            int page,
            int pageSize);

        Task<CourseDto?> GetByIdAsync(
            int id);

        Task<CourseDto> CreateAsync(
            CreateCourseDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateCourseDto dto);

        Task<string?> UploadPdfAsync(
            int courseId,
            IFormFile file);

        Task<(string FilePath, string FileName)?> GetPdfAsync(
            int courseId);

        Task<bool> DeleteAsync(
            int id);
    }
}