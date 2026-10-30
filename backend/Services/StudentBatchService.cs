using Microsoft.Extensions.Logging;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public class StudentBatchService : IStudentBatchService
    {
        private readonly IStudentBatchRepository _repository;
        private readonly INotificationService _notificationService;
        private readonly ITenantContext _tenantContext;
        private readonly ILogger<StudentBatchService> _logger;

        public StudentBatchService(
            IStudentBatchRepository repository,
            INotificationService notificationService,
            ITenantContext tenantContext,
            ILogger<StudentBatchService> logger)
        {
            _repository = repository;
            _notificationService = notificationService;
            _tenantContext = tenantContext;
            _logger = logger;
        }

        // =====================================================
        // GET ENROLLED STUDENTS
        // =====================================================

        public async Task<BatchStudentsDto?>
            GetStudentsByBatchIdAsync(int batchId)
        {
            return await _repository
                .GetStudentsByBatchIdAsync(batchId);
        }

        // =====================================================
        // GET AVAILABLE STUDENTS
        // =====================================================

        public async Task<List<AvailableStudentDto>>
            GetAvailableStudentsAsync(int batchId)
        {
            return await _repository
                .GetAvailableStudentsAsync(batchId);
        }

        // =====================================================
        // ENROLL STUDENTS TO BATCH
        // POST:
        // /api/StudentBatch
        // =====================================================

        public async Task<EnrollStudentsResponseDto>
            EnrollStudentsToBatchAsync(
                EnrollStudentsToBatchDto dto)
        {
            // =================================================
            // 1. Perform the actual enrollment
            // =================================================

            var result =
                await _repository
                    .EnrollStudentsToBatchAsync(dto);

            // =================================================
            // 2. Create Organization Notifications
            // =================================================

            try
            {
                var batch =
                    await _repository
                        .GetStudentsByBatchIdAsync(dto.BatchId);

                if (batch != null)
                {
                    var enrolledStudentIds =
                        result.EnrolledStudentIds
                            .Distinct()
                            .ToHashSet();

                    var enrolledStudents =
                        batch.Students
                            .Where(student =>
                                enrolledStudentIds.Contains(
                                    student.StudentId))
                            .ToList();

                    foreach (var student in enrolledStudents)
                    {
                        var studentName =
                            $"{student.FirstName} {student.LastName}"
                                .Trim();

                        if (string.IsNullOrWhiteSpace(studentName))
                        {
                            studentName =
                                $"Student #{student.StudentId}";
                        }

                        // =================================================
                        // Organization Notification
                        // =================================================

                        await _notificationService
                            .CreateOrganizationNotificationAsync(
                                _tenantContext.OrganizationId,

                                "Student Assigned to Batch",

                                $"{studentName} has been assigned to batch '{batch.BatchName}'.",

                                NotificationType.StudentAssignedToBatch,

                                student.StudentId,

                                ReferenceType.Student);
                    }
                }
            }
            catch (Exception ex)
            {
                // =================================================
                // Notification failure must NOT undo a successful
                // student enrollment.
                // =================================================

                _logger.LogWarning(
                    ex,
                    "Student enrollment succeeded, but organization notification could not be created for BatchId {BatchId}.",
                    dto.BatchId);
            }

            // =================================================
            // 3. Return original enrollment result
            // =================================================

            return result;
        }
    }
}