using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.Branches;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public class BatchService : IBatchService
    {
        private readonly IBatchRepository _repository;

        private readonly INotificationService _notificationService;

        private readonly ITenantContext _tenantContext;

        public BatchService(
            IBatchRepository repository,
            INotificationService notificationService,
            ITenantContext tenantContext)
        {
            _repository = repository;

            _notificationService =
                notificationService;

            _tenantContext =
                tenantContext;
        }

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<PagedResponse<BatchDto>>
            GetAllAsync(
                string? search,
                bool? status,
                int pageNumber,
                int pageSize)
        {
            if (pageNumber < 1)
                pageNumber = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            return await _repository.GetAllAsync(
                search,
                status,
                pageNumber,
                pageSize);
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<BatchDto?>
            GetByIdAsync(int batchId)
        {
            return await _repository
                .GetByIdAsync(batchId);
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<BatchDto>
            CreateAsync(CreateBatchDto dto)
        {
            // -------------------------------------------------
            // Basic validation
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.BatchName))
            {
                throw new Exception(
                    "Batch name is required.");
            }

            if (dto.CourseId <= 0)
            {
                throw new Exception(
                    "Valid course is required.");
            }

            if (dto.MentorId <= 0)
            {
                throw new Exception(
                    "Valid mentor is required.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be greater than start date.");
            }

            if (dto.Capacity <= 0)
            {
                throw new Exception(
                    "Capacity must be greater than zero.");
            }

            // -------------------------------------------------
            // Batch name uniqueness
            // -------------------------------------------------

            if (await _repository
                .BatchNameExistsAsync(
                    dto.BatchName))
            {
                throw new Exception(
                    "Batch Name already exists.");
            }

            // -------------------------------------------------
            // Course tenant validation
            // -------------------------------------------------

            if (!await _repository
                .CourseExistsAsync(
                    dto.CourseId))
            {
                throw new Exception(
                    "Selected course does not belong to your organization.");
            }

            // -------------------------------------------------
            // Mentor tenant validation
            // -------------------------------------------------

            if (!await _repository
                .MentorExistsAsync(
                    dto.MentorId))
            {
                throw new Exception(
                    "Selected mentor does not belong to your organization.");
            }

            // -------------------------------------------------
            // Course + Mentor same organization
            // -------------------------------------------------

            if (!await _repository
                .CourseAndMentorBelongToOrganizationAsync(
                    dto.CourseId,
                    dto.MentorId))
            {
                throw new Exception(
                    "Course and mentor must belong to the same organization.");
            }

            // -------------------------------------------------
            // Create Batch
            // -------------------------------------------------

            var createdBatch =
                await _repository
                    .CreateAsync(dto);

            // =================================================
            // ORGANIZATION NOTIFICATION
            // =================================================

            await _notificationService
    .CreateOrganizationNotificationAsync(
        _tenantContext.OrganizationId,
        "New Batch Created",
        $"Batch '{createdBatch.BatchName}' has been created.",
        NotificationType.BatchCreated,
        createdBatch.BatchId,
        ReferenceType.Batch);
            return createdBatch;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<BatchDto?>
            UpdateAsync(
                int batchId,
                UpdateBatchDto dto)
        {
            if (batchId <= 0)
            {
                throw new Exception(
                    "Invalid batch ID.");
            }

            // -------------------------------------------------
            // Get existing batch BEFORE update
            // -------------------------------------------------

            var existingBatch =
                await _repository
                    .GetByIdAsync(batchId);

            if (existingBatch == null)
            {
                return null;
            }

            var previousMentorId =
                existingBatch.MentorId;

            // -------------------------------------------------
            // Basic validation
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                dto.BatchName))
            {
                throw new Exception(
                    "Batch name is required.");
            }

            if (dto.CourseId <= 0)
            {
                throw new Exception(
                    "Valid course is required.");
            }

            if (dto.MentorId <= 0)
            {
                throw new Exception(
                    "Valid mentor is required.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be greater than start date.");
            }

            if (dto.Capacity <= 0)
            {
                throw new Exception(
                    "Capacity must be greater than zero.");
            }

            // -------------------------------------------------
            // Batch name uniqueness
            // -------------------------------------------------

            if (await _repository
                .BatchNameExistsAsync(
                    dto.BatchName,
                    batchId))
            {
                throw new Exception(
                    "Batch Name already exists.");
            }

            // -------------------------------------------------
            // Course tenant validation
            // -------------------------------------------------

            if (!await _repository
                .CourseExistsAsync(
                    dto.CourseId))
            {
                throw new Exception(
                    "Selected course does not belong to your organization.");
            }

            // -------------------------------------------------
            // Mentor tenant validation
            // -------------------------------------------------

            if (!await _repository
                .MentorExistsAsync(
                    dto.MentorId))
            {
                throw new Exception(
                    "Selected mentor does not belong to your organization.");
            }

            // -------------------------------------------------
            // Course + Mentor same organization
            // -------------------------------------------------

            if (!await _repository
                .CourseAndMentorBelongToOrganizationAsync(
                    dto.CourseId,
                    dto.MentorId))
            {
                throw new Exception(
                    "Course and mentor must belong to the same organization.");
            }

            // -------------------------------------------------
            // Update
            // -------------------------------------------------

            var updatedBatch =
                await _repository
                    .UpdateAsync(
                        batchId,
                        dto);

            if (updatedBatch == null)
            {
                return null;
            }

            // =================================================
            // BATCH UPDATED NOTIFICATION
            // =================================================

            await _notificationService
     .CreateOrganizationNotificationAsync(
         _tenantContext.OrganizationId,
         "Batch Updated",
         $"Batch '{updatedBatch.BatchName}' has been updated.",
         NotificationType.BatchUpdated,
         updatedBatch.BatchId,
         ReferenceType.Batch);
            // =================================================
            // MENTOR ASSIGNED TO BATCH
            // =================================================

            if (previousMentorId !=
                updatedBatch.MentorId)
            {
                await _notificationService
    .CreateOrganizationNotificationAsync(
        _tenantContext.OrganizationId,
        "Mentor Assigned to Batch",
        $"A mentor has been assigned to batch '{updatedBatch.BatchName}'.",
        NotificationType.MentorAssignedToBatch,
        updatedBatch.BatchId,
        ReferenceType.Batch);
            }

                return updatedBatch;
        }

        // =====================================================
        // SUMMARY
        // =====================================================

        public async Task<BatchSummaryDto>
            GetSummaryAsync()
        {
            return await _repository
                .GetSummaryAsync();
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool>
            DeleteAsync(int batchId)
        {
            if (batchId <= 0)
                return false;

            return await _repository
                .DeleteAsync(batchId);
        }

        // =====================================================
        // EXPORT
        // =====================================================

        public async Task<List<BatchExportDto>>
            ExportAsync(
                string? search,
                BatchStatus? status,
                int? courseId,
                int? mentorId,
                string? sortBy,
                string? sortOrder)
        {
            // -------------------------------------------------
            // Validate optional Course filter
            // -------------------------------------------------

            if (courseId.HasValue &&
                courseId.Value <= 0)
            {
                throw new Exception(
                    "Invalid course ID.");
            }

            // -------------------------------------------------
            // Validate optional Mentor filter
            // -------------------------------------------------

            if (mentorId.HasValue &&
                mentorId.Value <= 0)
            {
                throw new Exception(
                    "Invalid mentor ID.");
            }

            return await _repository
                .ExportAsync(
                    search,
                    status,
                    courseId,
                    mentorId,
                    sortBy,
                    sortOrder);
        }

        // =====================================================
        // MENTOR BATCHES
        // =====================================================

        public async Task<MentorBatchesResponseDto>
            GetMentorBatchesAsync(
                int employeeId,
                int page,
                int pageSize,
                BatchStatus? status,
                string? search)
        {
            if (employeeId <= 0)
            {
                throw new KeyNotFoundException(
                    "Invalid employee ID.");
            }

            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            return await _repository
                .GetMentorBatchesAsync(
                    employeeId,
                    page,
                    pageSize,
                    status,
                    search);
        }
    }
}