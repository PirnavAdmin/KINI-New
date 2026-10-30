using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class StudentBatchRepository : IStudentBatchRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public StudentBatchRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId => _tenantContext.OrganizationId;

        public async Task<BatchStudentsDto?> GetStudentsByBatchIdAsync(
            int batchId)
        {
            var batch = await _context.Batches
                .AsNoTracking()
                .Include(b => b.Course)
                .FirstOrDefaultAsync(b =>
                    b.BatchId == batchId &&
                    b.OrganizationId == OrganizationId);

            if (batch == null)
                return null;

            var students = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(e =>
                    e.BatchId == batchId &&
                    e.OrganizationId == OrganizationId &&
                    e.IsActive &&
                    !e.Student.IsDeleted)
                .Select(e => new BatchStudentDto
                {
                    StudentId = e.Student.StudentId,
                    FirstName = e.Student.FirstName,
                    LastName = e.Student.LastName,
                    Email = e.Student.Email,
                    Phone = e.Student.Phone,
                    CourseId = e.CourseId,
                    BatchId = e.BatchId,
                    MentorId = e.Batch.MentorId,
                    CourseDates = e.Student.CourseDates,
                    Attendance = e.Student.Attendance,
                    AssessmentsCleared = e.Student.AssessmentsCleared,
                    Status = e.Student.Status
                })
                .ToListAsync();

            return new BatchStudentsDto
            {
                BatchId = batch.BatchId,
                BatchName = batch.BatchName,
                CourseName = batch.Course?.CourseName ?? string.Empty,
                Capacity = batch.Capacity,
                EnrolledStudents = students.Count,
                AvailableSeats = Math.Max(
                    batch.Capacity - students.Count, 0),
                Students = students
            };
        }

        public async Task<List<AvailableStudentDto>> GetAvailableStudentsAsync(
            int batchId)
        {
            var batch = await _context.Batches
                .AsNoTracking()
                .Include(b => b.Course)
                .FirstOrDefaultAsync(b =>
                    b.BatchId == batchId &&
                    b.OrganizationId == OrganizationId);

            if (batch == null)
            {
                throw new KeyNotFoundException(
                    $"Batch with ID {batchId} was not found.");
            }

            // A student enrolled in Python can still be available
            // for React. Only an active enrollment in this course
            // makes the student unavailable.
            return await _context.Students
                .AsNoTracking()
                .Where(s =>
                    s.OrganizationId == OrganizationId &&
                    !s.IsDeleted &&
                    s.Status == "Active" &&
                    !_context.StudentEnrollments.Any(e =>
                        e.OrganizationId == OrganizationId &&
                        e.StudentId == s.StudentId &&
                        e.CourseId == batch.CourseId &&
                        e.IsActive))
                .Select(s => new AvailableStudentDto
                {
                    StudentId = s.StudentId,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.Email,
                    Phone = s.Phone,
                    CourseId = batch.CourseId,
                    CourseName = batch.Course != null
                        ? batch.Course.CourseName
                        : string.Empty,
                    Status = s.Status
                })
                .ToListAsync();
        }

        public async Task<EnrollStudentsResponseDto>
            EnrollStudentsToBatchAsync(EnrollStudentsToBatchDto dto)
        {
            if (dto.StudentIds == null || dto.StudentIds.Count == 0)
            {
                throw new ArgumentException(
                    "At least one student must be selected.");
            }

            var batch = await _context.Batches
                .FirstOrDefaultAsync(b =>
                    b.BatchId == dto.BatchId &&
                    b.OrganizationId == OrganizationId);

            if (batch == null)
            {
                throw new KeyNotFoundException(
                    $"Batch with ID {dto.BatchId} was not found " +
                    "in your organization.");
            }

            var courseExists = await _context.Courses.AnyAsync(c =>
                c.CourseId == batch.CourseId &&
                c.OrganizationId == OrganizationId);

            if (!courseExists)
            {
                throw new KeyNotFoundException(
                    "The course assigned to this batch was not found " +
                    "in your organization.");
            }

            var studentIds = dto.StudentIds.Distinct().ToList();

            var students = await _context.Students
                .Where(s =>
                    studentIds.Contains(s.StudentId) &&
                    s.OrganizationId == OrganizationId &&
                    !s.IsDeleted)
                .ToListAsync();

            var foundIds = students
                .Select(s => s.StudentId)
                .ToHashSet();

            var missingIds = studentIds
                .Where(id => !foundIds.Contains(id))
                .ToList();

            if (missingIds.Count > 0)
            {
                throw new KeyNotFoundException(
                    "Student(s) were not found in your organization: " +
                    string.Join(", ", missingIds));
            }

            // Reject an active enrollment in the same course.
            // Do NOT reject a student just because they have
            // an active enrollment in another course.
            var duplicateIds = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(e =>
                    e.OrganizationId == OrganizationId &&
                    studentIds.Contains(e.StudentId) &&
                    e.CourseId == batch.CourseId &&
                    e.IsActive)
                .Select(e => e.StudentId)
                .Distinct()
                .ToListAsync();

            if (duplicateIds.Count > 0)
            {
                throw new InvalidOperationException(
                    "Student(s) already have an active enrollment " +
                    "in this course: " +
                    string.Join(", ", duplicateIds));
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Recheck duplicates inside the transaction.
                // The unique index is the final duplicate safeguard.
                var concurrentDuplicates =
                    await _context.StudentEnrollments
                        .Where(e =>
                            e.OrganizationId == OrganizationId &&
                            studentIds.Contains(e.StudentId) &&
                            e.CourseId == batch.CourseId &&
                            e.IsActive)
                        .Select(e => e.StudentId)
                        .Distinct()
                        .ToListAsync();

                if (concurrentDuplicates.Count > 0)
                {
                    throw new InvalidOperationException(
                        "Student(s) already have an active enrollment " +
                        "in this course: " +
                        string.Join(", ", concurrentDuplicates));
                }

                var currentCount =
                    await _context.StudentEnrollments.CountAsync(e =>
                        e.OrganizationId == OrganizationId &&
                        e.BatchId == batch.BatchId &&
                        e.IsActive);

                var availableSeats = batch.Capacity - currentCount;

                if (studentIds.Count > availableSeats)
                {
                    throw new InvalidOperationException(
                        $"Cannot enroll {studentIds.Count} student(s). " +
                        $"Only {Math.Max(availableSeats, 0)} seat(s) " +
                        "are available.");
                }

                var now = DateTime.UtcNow;

                foreach (var student in students)
                {
                    _context.StudentEnrollments.Add(
                        new StudentEnrollment
                        {
                            OrganizationId = OrganizationId,
                            StudentId = student.StudentId,
                            CourseId = batch.CourseId,
                            BatchId = batch.BatchId,
                            IsActive = true,
                            EnrolledAt = now
                        });

                    // Legacy compatibility:
                    // Populate old single-assignment fields only
                    // when the student does not have a batch.
                    // Never overwrite the previous course or batch.
                    if (student.BatchId == 0)
                    {
                        student.BatchId = batch.BatchId;
                        student.CourseId = batch.CourseId;
                        student.MentorId = batch.MentorId;
                    }
                }

                batch.EnrolledStudents = currentCount + students.Count;
                batch.ModifiedDate = now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new EnrollStudentsResponseDto
                {
                    Message = "Students enrolled successfully.",
                    BatchId = batch.BatchId,
                    EnrolledStudents = batch.EnrolledStudents,
                    Capacity = batch.Capacity,
                    AvailableSeats = Math.Max(
                        batch.Capacity - batch.EnrolledStudents, 0),
                    EnrolledStudentIds = students
                        .Select(s => s.StudentId)
                        .ToList()
                };
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();

                // MySQL duplicate-key errors normally use error code 1062.
                var message = ex.InnerException?.Message ?? ex.Message;

                if (message.Contains(
                        "UX_StudentEnrollments_ActiveCourse",
                        StringComparison.OrdinalIgnoreCase) ||
                    message.Contains(
                        "Duplicate entry",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        "One or more students already have an active " +
                        "enrollment in this course.", ex);
                }

                throw;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}