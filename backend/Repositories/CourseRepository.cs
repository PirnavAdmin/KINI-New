using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public CourseRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // =====================================================
        // GET ALL COURSES
        // =====================================================

        public async Task<(
            IEnumerable<Course> Courses,
            int TotalCount)> GetAllAsync(
                string? search,
                bool? status,
                int? mentorId,
                int? batchId,
                string? level,
                string? sortBy,
                string? sortOrder,
                int page,
                int pageSize)
        {
            var organizationId = OrganizationId;

            IQueryable<Course> query =
                _context.Courses
                    .AsNoTracking()
                    .Where(c =>
                        c.OrganizationId == organizationId)
                    .Include(c => c.Batches)
                    .Include(c => c.Assessments)
                    .AsSplitQuery();

            // =================================================
            // SEARCH
            // =================================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c =>
                    c.CourseName.Contains(search));
            }

            // =================================================
            // STATUS
            // =================================================

            if (status.HasValue)
            {
                query = query.Where(c =>
                    c.Status == status.Value);
            }

            // =================================================
            // MENTOR FILTER
            // Mentor is assigned through Batch
            // =================================================

            if (mentorId.HasValue)
            {
                query = query.Where(c =>
                    c.Batches.Any(b =>
                        b.MentorId == mentorId.Value &&
                        b.OrganizationId == organizationId));
            }

            // =================================================
            // BATCH FILTER
            // =================================================

            if (batchId.HasValue)
            {
                query = query.Where(c =>
                    c.Batches.Any(b =>
                        b.BatchId == batchId.Value &&
                        b.OrganizationId == organizationId));
            }

            // =================================================
            // LEVEL
            // =================================================

            if (!string.IsNullOrWhiteSpace(level))
            {
                query = query.Where(c =>
                    c.Level == level);
            }

            // =================================================
            // SORTING
            // =================================================

            switch ((sortBy ?? "").ToLower())
            {
                case "price":

                    query =
                        sortOrder?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                c => c.Price)
                            : query.OrderBy(
                                c => c.Price);

                    break;

                case "duration":

                    query =
                        sortOrder?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                c => c.Duration)
                            : query.OrderBy(
                                c => c.Duration);

                    break;

                default:

                    query =
                        sortOrder?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                c => c.CourseName)
                            : query.OrderBy(
                                c => c.CourseName);

                    break;
            }

            // =================================================
            // COUNT
            // =================================================

            var totalRecords =
                await query.CountAsync();

            // =================================================
            // PAGINATION
            // =================================================

            var courses =
                await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return (
                courses,
                totalRecords);
        }

        // =====================================================
        // GET COURSE BY ID
        // =====================================================

        public async Task<Course?> GetByIdAsync(
            int id)
        {
            var organizationId = OrganizationId;

            return await _context.Courses
                .AsNoTracking()
                .Include(c => c.Batches)
                .Include(c => c.Assessments)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c =>
                    c.CourseId == id &&
                    c.OrganizationId == organizationId);
        }

        // =====================================================
        // CREATE COURSE
        // =====================================================

        public async Task<Course> CreateAsync(
            Course course)
        {
            var organizationId = OrganizationId;

            // NEVER trust OrganizationId
            // from frontend.

            course.OrganizationId =
                organizationId;

            await _context.Courses.AddAsync(
                course);

            await _context.SaveChangesAsync();

            return course;
        }

        // =====================================================
        // UPDATE COURSE
        // =====================================================

        public async Task<bool> UpdateAsync(
            Course course)
        {
            var organizationId = OrganizationId;

            var existing =
                await _context.Courses
                    .FirstOrDefaultAsync(c =>
                        c.CourseId == course.CourseId &&
                        c.OrganizationId == organizationId);

            if (existing == null)
                return false;

            existing.CourseName =
                course.CourseName;

            existing.Duration =
                course.Duration;

            existing.Level =
                course.Level;

            existing.Price =
                course.Price;

            existing.Status =
                course.Status;

            existing.PdfUrl =
                course.PdfUrl;

            await _context.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // DELETE COURSE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int id)
        {
            var organizationId = OrganizationId;

            var course =
                await _context.Courses
                    .FirstOrDefaultAsync(c =>
                        c.CourseId == id &&
                        c.OrganizationId == organizationId);

            if (course == null)
                return false;

            // Soft delete
            course.Status = false;

            await _context.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // SAVE
        // =====================================================

        public async Task<bool> SaveAsync()
        {
            return await _context
                .SaveChangesAsync() > 0;
        }
    }
}