using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.Branches;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IBatchRepository
    {
        // =====================================================
        // BATCH NAME
        // =====================================================

        Task<bool> BatchNameExistsAsync(
            string batchName,
            int? batchId = null);

        // =====================================================
        // COURSE / MENTOR VALIDATION
        // =====================================================

        Task<bool> CourseExistsAsync(
            int courseId);

        Task<bool> MentorExistsAsync(
            int mentorId);

        Task<bool>
            CourseAndMentorBelongToOrganizationAsync(
                int courseId,
                int mentorId);

        // =====================================================
        // GET ALL
        // =====================================================

        Task<PagedResponse<BatchDto>>
            GetAllAsync(
                string? search,
                bool? status,
                int pageNumber,
                int pageSize);

        // =====================================================
        // GET BY ID
        // =====================================================

        Task<BatchDto?>
            GetByIdAsync(
                int batchId);

        // =====================================================
        // GET ENTITY WITH CAPACITY
        // =====================================================

        Task<Batch?>
            GetByIdWithCapacityAsync(
                int batchId);

        // =====================================================
        // STUDENT COUNT
        // =====================================================

        Task<int>
            GetActiveStudentCountAsync(
                int batchId);

        // =====================================================
        // AVAILABLE BATCH
        // =====================================================

        Task<Batch?>
            GetAvailableBatchAsync(
                int courseId);

        // =====================================================
        // ENROLLMENT
        // =====================================================

        Task<bool>
            IncrementEnrollmentAsync(
                int batchId);

        Task<bool>
            DecrementEnrollmentAsync(
                int batchId);

        // =====================================================
        // CREATE
        // =====================================================

        Task<BatchDto>
            CreateAsync(
                CreateBatchDto dto);

        // =====================================================
        // UPDATE
        // =====================================================

        Task<BatchDto?>
            UpdateAsync(
                int batchId,
                UpdateBatchDto dto);

        // =====================================================
        // DELETE
        // =====================================================

        Task<bool>
            DeleteAsync(
                int batchId);

        // =====================================================
        // SUMMARY
        // =====================================================

        Task<BatchSummaryDto>
            GetSummaryAsync();

        // =====================================================
        // EXPORT
        // =====================================================

        Task<List<BatchExportDto>>
            ExportAsync(
                string? search,
                BatchStatus? status,
                int? courseId,
                int? mentorId,
                string? sortBy,
                string? sortOrder);

        // =====================================================
        // MENTOR BATCHES
        // =====================================================

        Task<MentorBatchesResponseDto>
       GetMentorBatchesAsync(
           int employeeId,
           int page,
           int pageSize,
           BatchStatus? status,
           string? search);
    }
    }