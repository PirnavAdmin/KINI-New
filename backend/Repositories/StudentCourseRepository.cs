
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Repositories
{
    public class StudentCourseRepository : IStudentCourseRepository
    {
        private readonly ApplicationDbContext _context;

        public StudentCourseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentCoursesResponseDto?> GetMyCoursesAsync(
            string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier))
                return null;

            identifier = identifier.Trim();

            var student = await _context.Students
                .AsNoTracking()
                .FirstOrDefaultAsync(s =>
                    !s.IsDeleted &&
                    (s.Email == identifier || s.Phone == identifier));

            if (student == null)
                return null;

            var enrollments = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(e =>
                    e.StudentId == student.StudentId &&
                    e.OrganizationId == student.OrganizationId &&
                    e.Course.OrganizationId == student.OrganizationId &&
                    e.Batch.OrganizationId == student.OrganizationId &&
                    e.Batch.CourseId == e.CourseId &&
                    e.IsActive)
                .Include(e => e.Course)
                .Include(e => e.Batch)
                    .ThenInclude(b => b.Mentor)
                .OrderBy(e => e.EnrolledAt)
                .ToListAsync();

            var courses = enrollments
                .Where(e => e.Course != null && e.Batch != null)
                .Select(e => new StudentCourseDto
                {
                    CourseId = e.CourseId,
                    CourseName = e.Course.CourseName,
                    Duration = e.Course.Duration,
                    Level = e.Course.Level,
                    Price = e.Course.Price,
                    PdfUrl = e.Course.PdfUrl,
                    CourseStatus = e.Course.Status,

                    BatchId = e.BatchId,
                    BatchName = e.Batch.BatchName,
                    BatchType = e.Batch.BatchType.ToString(),
                    StartDate = e.Batch.StartDate,
                    EndDate = e.Batch.EndDate,
                    BatchStatus = e.Batch.Status.ToString(),

                    MentorId = e.Batch.MentorId,
                    MentorName = e.Batch.Mentor == null
                        ? string.Empty
                        : $"{e.Batch.Mentor.FirstName} " +
                          $"{e.Batch.Mentor.LastName}",

                    StudentStatus = student.Status,
                    IsActive =
                        string.Equals(
                            student.Status,
                            "Active",
                            StringComparison.OrdinalIgnoreCase)
                        && e.IsActive
                        && e.Course.Status
                })
                .ToList();

            return new StudentCoursesResponseDto
            {
                Success = true,
                Message = courses.Count > 0
                    ? "Student courses retrieved successfully."
                    : "No active enrollments found for this student.",
                StudentId = student.StudentId,
                StudentName =
                    $"{student.FirstName} {student.LastName}",
                Email = student.Email,
                ProfilePhotoUrl = student.ProfilePhotoUrl,
                Courses = courses
            };
        }
    }
}
