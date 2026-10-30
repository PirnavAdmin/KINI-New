using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IBatchService
    {
        Task<PagedResponse<BatchDto>> GetAllAsync(
            string? search,
            bool? status,
            int pageNumber,
            int pageSize);

        Task<BatchDto?> GetByIdAsync(int batchId);

        Task<BatchDto> CreateAsync(CreateBatchDto dto);

        Task<BatchDto?> UpdateAsync(int batchId, UpdateBatchDto dto);

        Task<BatchSummaryDto> GetSummaryAsync();
        Task<bool> DeleteAsync(int batchId);

        Task<List<BatchExportDto>> ExportAsync(
    string? search,
    BatchStatus? status,
    int? courseId,
    int? mentorId,
    string? sortBy,
    string? sortOrder);

        Task<MentorBatchesResponseDto> GetMentorBatchesAsync(
    int employeeId,
    int page,
    int pageSize,
    BatchStatus? status,
    string? search);
    }
    }
