
using TalentSphereAPI.DTOs.Assessment;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IAssessmentRepository _repository;
        private readonly INotificationService _notificationService;

        public AssessmentService(
            IAssessmentRepository repository,
            INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        // =====================================================
        // DATE / TIME HELPER
        // =====================================================

        private static DateTime ToUtc(DateTime value)
        {
            // Already UTC
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }

            // Explicit Local DateTime
            if (value.Kind == DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }

            // Swagger commonly sends:
            // "2026-10-07T12:00:00"
            //
            // This comes into .NET as DateTimeKind.Unspecified.
            //
            // Our application uses IST for user-entered assessment
            // schedules, so interpret unspecified values as IST.

            var indiaTimeZone =
                TimeZoneInfo.FindSystemTimeZoneById(
                    OperatingSystem.IsWindows()
                        ? "India Standard Time"
                        : "Asia/Kolkata");

            var indiaDateTime =
                DateTime.SpecifyKind(
                    value,
                    DateTimeKind.Unspecified);

            return TimeZoneInfo.ConvertTimeToUtc(
                indiaDateTime,
                indiaTimeZone);
        }

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<List<AssessmentDto>> GetAllAsync()
        {
            var assessments =
                await _repository.GetAllAsync();

            return assessments
                .Select(a => new AssessmentDto
                {
                    AssessmentId =
                        a.AssessmentId,

                    Title =
                        a.Title,

                    Description =
                        a.Description,

                    CourseName =
                        a.Course?.CourseName
                        ?? string.Empty,

                    BatchName =
                        a.Batch?.BatchName
                        ?? string.Empty,

                    TotalMarks =
                        a.TotalMarks,

                    PassingMarks =
                        a.PassingMarks,

                    DurationMinutes =
                        a.DurationMinutes,

                    AssessmentType =
                        a.AssessmentType,

                    StartDate =
                        a.StartDate,

                    EndDate =
                        a.EndDate,

                    Status =
                        a.Status
                })
                .ToList();
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<AssessmentDto?>
            GetByIdAsync(
                int assessmentId)
        {
            var assessment =
                await _repository
                    .GetByIdAsync(
                        assessmentId);

            if (assessment == null)
                return null;

            return new AssessmentDto
            {
                AssessmentId =
                    assessment.AssessmentId,

                Title =
                    assessment.Title,

                Description =
                    assessment.Description,

                CourseName =
                    assessment.Course?.CourseName
                    ?? string.Empty,

                BatchName =
                    assessment.Batch?.BatchName
                    ?? string.Empty,

                TotalMarks =
                    assessment.TotalMarks,

                PassingMarks =
                    assessment.PassingMarks,

                DurationMinutes =
                    assessment.DurationMinutes,

                AssessmentType =
                    assessment.AssessmentType,

                StartDate =
                    assessment.StartDate,

                EndDate =
                    assessment.EndDate,

                Status =
                    assessment.Status
            };
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<int> CreateAsync(
    CreateAssessmentDto dto)
        {
            // -------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------

            if (dto == null)
            {
                throw new ArgumentException(
                    "Assessment data is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new ArgumentException(
                    "Assessment title is required.");
            }

            if (dto.TotalMarks <= 0)
            {
                throw new ArgumentException(
                    "Total marks must be greater than zero.");
            }

            if (dto.PassingMarks < 0)
            {
                throw new ArgumentException(
                    "Passing marks cannot be negative.");
            }

            if (dto.PassingMarks > dto.TotalMarks)
            {
                throw new ArgumentException(
                    "Passing marks cannot be greater than total marks.");
            }

            if (dto.DurationMinutes <= 0)
            {
                throw new ArgumentException(
                    "Duration must be greater than zero.");
            }

            // -------------------------------------------------
            // CONVERT IST → UTC
            // -------------------------------------------------

            var startDateUtc =
                ToUtc(dto.StartDate);

            var endDateUtc =
                ToUtc(dto.EndDate);

            // -------------------------------------------------
            // VALIDATE AVAILABILITY WINDOW
            // -------------------------------------------------

            if (startDateUtc >= endDateUtc)
            {
                throw new ArgumentException(
                    "End date must be after start date.");
            }

            // -------------------------------------------------
            // CREATE ASSESSMENT
            // -------------------------------------------------

            var assessment =
                new Assessment
                {
                    Title =
                        dto.Title.Trim(),

                    Description =
                        dto.Description,

                    CourseId =
                        dto.CourseId,

                    BatchId =
                        dto.BatchId,

                    TotalMarks =
                        dto.TotalMarks,

                    PassingMarks =
                        dto.PassingMarks,

                    DurationMinutes =
                        dto.DurationMinutes,

                    AssessmentType =
                        string.IsNullOrWhiteSpace(dto.AssessmentType)
                            ? "MCQ"
                            : dto.AssessmentType.Trim(),

                    // IMPORTANT:
                    // Store dates in UTC.
                    StartDate =
                        startDateUtc,

                    EndDate =
                        endDateUtc,

                    // New assessment starts as Draft.
                    Status =
                        "Draft",

                    CreatedAt =
                        DateTime.UtcNow,

                    UpdatedAt =
                        null
                };

            await _repository.AddAsync(
                assessment);

            await _repository.SaveChangesAsync();

            // -------------------------------------------------
            // RELOAD
            // -------------------------------------------------

            var createdAssessment =
                await _repository.GetByIdAsync(
                    assessment.AssessmentId);

            if (createdAssessment == null)
            {
                throw new InvalidOperationException(
                    "Assessment was created but could not be loaded.");
            }

            // -------------------------------------------------
            // NOTIFICATION
            // -------------------------------------------------

            try
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        createdAssessment
                            .Batch
                            .OrganizationId,

                        "New Assessment Created",

                        $"Assessment '{createdAssessment.Title}' " +
                        $"has been created for batch " +
                        $"'{createdAssessment.Batch.BatchName}'.",

                        NotificationType.AssessmentCreated,

                        createdAssessment.AssessmentId,

                        ReferenceType.Assessment);
            }
            catch
            {
                // Notification failure must not
                // rollback assessment creation.
            }

            return createdAssessment.AssessmentId;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool> UpdateAsync(
    int assessmentId,
    UpdateAssessmentDto dto)
        {
            var assessment =
                await _repository.GetByIdAsync(
                    assessmentId);

            if (assessment == null)
            {
                return false;
            }

            // -------------------------------------------------
            // COMPLETED ASSESSMENT
            // -------------------------------------------------

            if (string.Equals(
                    assessment.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "A completed assessment cannot be modified.");
            }

            // -------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------

            if (dto == null)
            {
                throw new ArgumentException(
                    "Assessment data is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new ArgumentException(
                    "Assessment title is required.");
            }

            if (dto.TotalMarks <= 0)
            {
                throw new ArgumentException(
                    "Total marks must be greater than zero.");
            }

            if (dto.PassingMarks < 0 ||
                dto.PassingMarks > dto.TotalMarks)
            {
                throw new ArgumentException(
                    "Invalid passing marks.");
            }

            if (dto.DurationMinutes <= 0)
            {
                throw new ArgumentException(
                    "Duration must be greater than zero.");
            }

            // -------------------------------------------------
            // IST → UTC
            // -------------------------------------------------

            var startDateUtc =
                ToUtc(dto.StartDate);

            var endDateUtc =
                ToUtc(dto.EndDate);

            if (startDateUtc >= endDateUtc)
            {
                throw new ArgumentException(
                    "End date must be after start date.");
            }

            // -------------------------------------------------
            // UPDATE
            // -------------------------------------------------

            assessment.Title =
                dto.Title.Trim();

            assessment.Description =
                dto.Description;

            assessment.CourseId =
                dto.CourseId;

            assessment.BatchId =
                dto.BatchId;

            assessment.TotalMarks =
                dto.TotalMarks;

            assessment.PassingMarks =
                dto.PassingMarks;

            assessment.DurationMinutes =
                dto.DurationMinutes;

            assessment.AssessmentType =
                string.IsNullOrWhiteSpace(dto.AssessmentType)
                    ? "MCQ"
                    : dto.AssessmentType.Trim();

            assessment.StartDate =
                startDateUtc;

            assessment.EndDate =
                endDateUtc;

            assessment.UpdatedAt =
                DateTime.UtcNow;

            await _repository.UpdateAsync(
                assessment);

            await _repository.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // PUBLISH
        // =====================================================

        public async Task<bool> PublishAsync(
    int assessmentId)
        {
            var assessment =
                await _repository.GetByIdAsync(
                    assessmentId);

            if (assessment == null)
            {
                return false;
            }

            // Already published
            if (string.Equals(
                    assessment.Status,
                    "Published",
                    StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Completed cannot be published
            if (string.Equals(
                    assessment.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "A completed assessment cannot be published.");
            }

            // -------------------------------------------------
            // DATE VALIDATION
            // -------------------------------------------------

            if (assessment.StartDate >=
                assessment.EndDate)
            {
                throw new InvalidOperationException(
                    "Assessment end date must be after start date.");
            }

            // -------------------------------------------------
            // DURATION VALIDATION
            // -------------------------------------------------

            if (assessment.DurationMinutes <= 0)
            {
                throw new InvalidOperationException(
                    "Assessment duration must be greater than zero.");
            }

            // -------------------------------------------------
            // QUESTIONS
            // -------------------------------------------------

            if (assessment.Questions == null ||
                assessment.Questions.Count == 0)
            {
                throw new InvalidOperationException(
                    "Assessment must contain at least one question before publishing.");
            }

            // -------------------------------------------------
            // QUESTION MARKS
            // -------------------------------------------------

            var questionMarks =
                assessment.Questions.Sum(
                    q => q.Marks);

            if (questionMarks !=
                assessment.TotalMarks)
            {
                throw new InvalidOperationException(
                    $"Question marks ({questionMarks}) " +
                    $"must equal assessment total marks " +
                    $"({assessment.TotalMarks}).");
            }

            // -------------------------------------------------
            // QUESTION VALIDATION
            // -------------------------------------------------

            foreach (var question in
                     assessment.Questions)
            {
                if (string.IsNullOrWhiteSpace(
                        question.QuestionText))
                {
                    throw new InvalidOperationException(
                        $"Question {question.QuestionId} " +
                        $"must contain question text.");
                }

                if (question.Marks <= 0)
                {
                    throw new InvalidOperationException(
                        $"Question {question.QuestionId} " +
                        $"must have marks greater than zero.");
                }

                if (question.QuestionType.Equals(
                        "MCQ",
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (question.Options == null ||
                        question.Options.Count < 2)
                    {
                        throw new InvalidOperationException(
                            $"MCQ question {question.QuestionId} " +
                            $"must have at least two options.");
                    }

                    var correctCount =
                        question.Options.Count(
                            o => o.IsCorrect);

                    if (correctCount != 1)
                    {
                        throw new InvalidOperationException(
                            $"MCQ question {question.QuestionId} " +
                            $"must have exactly one correct option.");
                    }
                }
            }

            // -------------------------------------------------
            // PUBLISH
            // -------------------------------------------------

            assessment.Status =
                "Published";

            assessment.UpdatedAt =
                DateTime.UtcNow;

            await _repository.UpdateAsync(
                assessment);

            await _repository.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int assessmentId)
        {
            var assessment =
                await _repository
                    .GetByIdAsync(
                        assessmentId);

            if (assessment == null)
                return false;

            // -------------------------------------------------
            // Never delete published assessment
            // -------------------------------------------------

            if (string.Equals(
                    assessment.Status,
                    "Published",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "A published assessment cannot be deleted.");
            }

            // -------------------------------------------------
            // Never delete completed assessment
            // -------------------------------------------------

            if (string.Equals(
                    assessment.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "A completed assessment cannot be deleted.");
            }

            await _repository
                .DeleteAsync(
                    assessment);

            await _repository
                .SaveChangesAsync();

            return true;
        }
    }
}

