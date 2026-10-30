using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public StudentRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // ==================================================
        // GET ALL
        // ==================================================

        public async Task<IEnumerable<Student>> GetAllAsync(
            StudentQueryDto query)
        {
            var students = _context.Students
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted)
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                students = students.Where(s =>
                    s.FirstName.Contains(query.Search) ||
                    s.LastName.Contains(query.Search) ||
                    s.Email.Contains(query.Search) ||
                    s.Phone.Contains(query.Search));
            }

            // Status
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                students = students.Where(s =>
                    s.Status == query.Status);
            }

            // Sorting
            switch (query.SortBy?.ToLower())
            {
                case "name":

                    students = query.Descending
                        ? students.OrderByDescending(
                            s => s.FirstName)
                        : students.OrderBy(
                            s => s.FirstName);

                    break;

                case "course":

                    students = query.Descending
                        ? students.OrderByDescending(
                            s => s.Course.CourseName)
                        : students.OrderBy(
                            s => s.Course.CourseName);

                    break;

                case "batch":

                    students = query.Descending
                        ? students.OrderByDescending(
                            s => s.Batch.BatchName)
                        : students.OrderBy(
                            s => s.Batch.BatchName);

                    break;

                case "email":

                    students = query.Descending
                        ? students.OrderByDescending(
                            s => s.Email)
                        : students.OrderBy(
                            s => s.Email);

                    break;

                default:

                    students = query.Descending
                        ? students.OrderByDescending(
                            s => s.StudentId)
                        : students.OrderBy(
                            s => s.StudentId);

                    break;
            }

            students = students
                .Skip(
                    (query.PageNumber - 1) *
                    query.PageSize)
                .Take(query.PageSize);

            return await students.ToListAsync();
        }

        // ==================================================
        // GET BY ID
        // ==================================================

        public async Task<Student?> GetByIdAsync(
            int id)
        {
            return await _context.Students
                .AsNoTracking()
                .Include(x => x.Course)
                .Include(x => x.Batch)
                .Include(x => x.Mentor)
                .FirstOrDefaultAsync(x =>
                    x.StudentId == id &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);
        }

        // ==================================================
        // EMAIL EXISTS
        // ==================================================

        public async Task<bool> EmailExistsAsync(
            string email,
            int? excludeStudentId = null)
        {
            return await _context.Students.AnyAsync(x =>
                x.OrganizationId == OrganizationId &&
                x.Email == email &&
                !x.IsDeleted &&
                (!excludeStudentId.HasValue ||
                 x.StudentId != excludeStudentId.Value));
        }

        // ==================================================
        // CREATE
        // ==================================================

        public async Task<Student> CreateAsync(
            Student student)
        {
            // NEVER trust OrganizationId from frontend.
            student.OrganizationId =
                OrganizationId;

            await _context.Students.AddAsync(student);

            await _context.SaveChangesAsync();

            return student;
        }

        // ==================================================
        // UPDATE
        // ==================================================


        public async Task<bool> UpdateAsync(Student student)
        {
            var existing = await _context.Students
                .FirstOrDefaultAsync(x =>
                    x.StudentId == student.StudentId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            if (existing == null)
                return false;

            // Validate the organization and course/batch relationship.
            if (student.CourseId > 0 && student.BatchId > 0)
            {
                var validCourse = await _context.Courses
                    .AnyAsync(c =>
                        c.CourseId == student.CourseId &&
                        c.OrganizationId == OrganizationId);

                var validBatch = await _context.Batches
                    .AnyAsync(b =>
                        b.BatchId == student.BatchId &&
                        b.CourseId == student.CourseId &&
                        b.OrganizationId == OrganizationId);

                if (!validCourse || !validBatch)
                {
                    throw new InvalidOperationException(
                        "The selected course and batch must belong to " +
                        "your organization, and the batch must belong " +
                        "to the selected course.");
                }
            }

            existing.FirstName = student.FirstName;
            existing.LastName = student.LastName;
            existing.Email = student.Email;
            existing.Phone = student.Phone;

            // Preserve legacy fields used by the Organization Portal.
            existing.CourseId = student.CourseId;
            existing.BatchId = student.BatchId;
            existing.MentorId = student.MentorId;
            existing.CourseDates = student.CourseDates;
            existing.Status = student.Status;

            if (student.CourseId > 0 && student.BatchId > 0 &&
                string.Equals(
                    existing.Status,
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                var enrollment = await _context.StudentEnrollments
                    .FirstOrDefaultAsync(e =>
                        e.OrganizationId == OrganizationId &&
                        e.StudentId == existing.StudentId &&
                        e.CourseId == student.CourseId &&
                        e.IsActive);

                if (enrollment == null)
                {
                    // Create an enrollment without overwriting
                    // enrollments in other courses.
                    _context.StudentEnrollments.Add(
                        new StudentEnrollment
                        {
                            OrganizationId = OrganizationId,
                            StudentId = existing.StudentId,
                            CourseId = student.CourseId,
                            BatchId = student.BatchId,
                            IsActive = true,
                            EnrolledAt = DateTime.UtcNow
                        });
                }
                else
                {
                    // Update the batch for this course only.
                    enrollment.BatchId = student.BatchId;
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }


        // ==================================================
        // SOFT DELETE
        // ==================================================

        public async Task<bool> DeleteAsync(
            int id)
        {
            var student =
                await _context.Students
                    .FirstOrDefaultAsync(x =>
                        x.StudentId == id &&
                        x.OrganizationId ==
                        OrganizationId &&
                        !x.IsDeleted);

            if (student == null)
                return false;

            student.IsDeleted = true;

            student.DeletedOn =
                DateTime.UtcNow;

            student.DeletedBy =
                "OrganizationAdmin";

            return await _context.SaveChangesAsync() > 0;


        }
        // ==================================================
        // GOOGLE LOGIN - FIND BY GOOGLE SUBJECT ID
        // ==================================================

        public async Task<Student?> GetByGoogleSubjectIdAsync(
            string googleSubjectId)
        {
            return await _context.Students
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.GoogleSubjectId == googleSubjectId &&
                    !x.IsDeleted);
        }

        // ==================================================
        // GOOGLE LOGIN - FIND BY VERIFIED EMAIL
        // ==================================================

        public async Task<Student?> GetByEmailForLoginAsync(
     string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            email = email.Trim().ToLower();

            return await _context.Students
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Email != null &&
                    x.Email.ToLower() == email &&
                    !x.IsDeleted);
        }

        // ==================================================
        // GOOGLE LOGIN - LINK GOOGLE ACCOUNT
        // ==================================================

        public async Task<bool> LinkGoogleSubjectIdAsync(
    int studentId,
    string googleSubjectId)
        {
            if (string.IsNullOrWhiteSpace(googleSubjectId))
                return false;

            var updatedRows = await _context.Students
                .Where(x =>
                    x.StudentId == studentId &&
                    !x.IsDeleted)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(
                        x => x.GoogleSubjectId,
                        googleSubjectId));

            return updatedRows > 0;
        }
    }
}