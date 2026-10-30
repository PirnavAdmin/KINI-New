using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class MentorRepository : IMentorRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public MentorRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // =====================================================
        // GET ALL MENTORS
        // =====================================================

        public async Task<(
            IEnumerable<MentorListDto> Mentors,
            int TotalCount)> GetAllAsync(
                MentorQueryParameters query)
        {
            var organizationId =
                OrganizationId;

            var mentors = _context.Mentors
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted)
                .Include(x => x.Courses)
                .Include(x => x.Batches)
                .AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                mentors = mentors.Where(x =>
                    x.FirstName.Contains(query.Search) ||
                    x.LastName.Contains(query.Search) ||
                    x.Email.Contains(query.Search));
            }

            // Status
            if (query.Status.HasValue)
            {
                mentors = mentors.Where(x =>
                    x.Status == query.Status.Value);
            }

            var total =
                await mentors.CountAsync();

            var data =
                await mentors
                    .OrderBy(x => x.MentorId)
                    .Skip(
                        (query.PageNumber - 1) *
                        query.PageSize)
                    .Take(query.PageSize)
                    .Select(x => new MentorListDto
                    {
                        MentorId =
                            x.MentorId,

                        MentorName =
                            x.FirstName + " " +
                            x.LastName,

                        Courses =
                            string.Join(
                                ", ",
                                x.Courses
                                    .Where(c =>
                                        c.OrganizationId ==
                                        organizationId)
                                    .Select(c =>
                                        c.CourseName)),

                        Batches =
                            string.Join(
                                ", ",
                                x.Batches
                                    .Where(b =>
                                        b.OrganizationId ==
                                        organizationId)
                                    .Select(b =>
                                        b.BatchName)),

                        LiveClasses = 0,

                        RecordedClasses = 0,

                        Attendance = 0,

                        Status =
                            x.Status
                    })
                    .ToListAsync();

            return (data, total);
        }

        // =====================================================
        // GET MENTOR BY ID
        // =====================================================

        public async Task<MentorDto?> GetByIdAsync(
            int mentorId)
        {
            var organizationId =
                OrganizationId;

            var mentor =
                await _context.Mentors
                    .AsNoTracking()
                    .Include(x => x.Courses)
                    .Include(x => x.Batches)
                    .FirstOrDefaultAsync(x =>
                        x.MentorId == mentorId &&
                        x.OrganizationId ==
                            organizationId &&
                        !x.IsDeleted);

            if (mentor == null)
                return null;

            return new MentorDto
            {
                MentorId =
                    mentor.MentorId,

                FirstName =
                    mentor.FirstName,

                LastName =
                    mentor.LastName,

                Email =
                    mentor.Email,

                Phone =
                    mentor.Phone,

                Status =
                    mentor.Status,

                CourseIds =
                    mentor.Courses
                        .Where(x =>
                            x.OrganizationId ==
                            organizationId)
                        .Select(x =>
                            x.CourseId)
                        .ToList(),

                BatchIds =
                    mentor.Batches
                        .Where(x =>
                            x.OrganizationId ==
                            organizationId)
                        .Select(x =>
                            x.BatchId)
                        .ToList()
            };
        }

        // =====================================================
        // CREATE MENTOR
        // =====================================================

        public async Task<bool> CreateAsync(
            CreateMentorDto dto)
        {
            var organizationId =
                OrganizationId;

            // Check duplicate mentor email
            // inside current organization.
            var emailExists =
                await _context.Mentors
                    .AnyAsync(m =>
                        m.OrganizationId ==
                            organizationId &&
                        m.Email == dto.Email &&
                        !m.IsDeleted);

            if (emailExists)
            {
                throw new Exception(
                    "Mentor email already exists in your organization.");
            }

            var mentor = new Mentor
            {
                OrganizationId =
                    organizationId,

                FirstName =
                    dto.FirstName,

                LastName =
                    dto.LastName,

                Email =
                    dto.Email,

                Phone =
                    dto.Phone,

                Status =
                    dto.Status,

                CreatedDate =
                    DateTime.UtcNow
            };

            _context.Mentors.Add(mentor);

            await _context.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // UPDATE MENTOR
        // =====================================================

        public async Task<bool> UpdateAsync(
    int mentorId,
    UpdateMentorDto dto)
        {
            var organizationId = OrganizationId;

            // =====================================================
            // FIND MENTOR
            // =====================================================

            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(x =>
                    x.MentorId == mentorId &&
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);

            if (mentor == null)
                return false;

            // =====================================================
            // CHECK DUPLICATE EMAIL
            // =====================================================

            var emailExists = await _context.Mentors
                .AnyAsync(x =>
                    x.MentorId != mentorId &&
                    x.OrganizationId == organizationId &&
                    x.Email == dto.Email &&
                    !x.IsDeleted);

            if (emailExists)
            {
                throw new Exception(
                    "Another mentor with this email already exists in your organization.");
            }

            // =====================================================
            // UPDATE MENTOR DETAILS
            // =====================================================

            mentor.FirstName = dto.FirstName;
            mentor.LastName = dto.LastName;
            mentor.Email = dto.Email;
            mentor.Phone = dto.Phone;
            mentor.Status = dto.Status;

            // =====================================================
            // REMOVE CURRENT COURSE ALLOCATIONS
            // =====================================================

            var currentlyAssignedCourses =
                await _context.Courses
                    .Where(c =>
                        c.OrganizationId == organizationId &&
                        EF.Property<int?>(
                            c,
                            "MentorId") == mentorId)
                    .ToListAsync();

            foreach (var course in currentlyAssignedCourses)
            {
                _context.Entry(course)
                    .Property<int?>("MentorId")
                    .CurrentValue = null;
            }

            // =====================================================
            // ASSIGN NEW COURSES
            // =====================================================

            var selectedCourseIds =
                dto.CourseIds
                    .Distinct()
                    .ToList();

            if (selectedCourseIds.Any())
            {
                var selectedCourses =
                    await _context.Courses
                        .Where(c =>
                            selectedCourseIds.Contains(c.CourseId) &&
                            c.OrganizationId == organizationId &&
                            c.Status)
                        .ToListAsync();

                // Make sure every requested course exists
                // in the mentor's organization.
                if (selectedCourses.Count !=
                    selectedCourseIds.Count)
                {
                    var foundIds =
                        selectedCourses
                            .Select(c => c.CourseId)
                            .ToHashSet();

                    var invalidIds =
                        selectedCourseIds
                            .Where(id => !foundIds.Contains(id))
                            .ToList();

                    throw new Exception(
                        $"The following course(s) do not belong to your organization or are inactive: {string.Join(", ", invalidIds)}");
                }

                foreach (var course in selectedCourses)
                {
                    _context.Entry(course)
                        .Property<int?>("MentorId")
                        .CurrentValue = mentorId;
                }
            }

            // =====================================================
            // SAVE
            // =====================================================

            await _context.SaveChangesAsync();

            return true;
        }
        // =====================================================
        // DELETE MENTOR
        // =====================================================

        public async Task<bool> DeleteAsync(
            int mentorId)
        {
            var organizationId =
                OrganizationId;

            var mentor =
                await _context.Mentors
                    .FirstOrDefaultAsync(x =>
                        x.MentorId == mentorId &&
                        x.OrganizationId ==
                            organizationId &&
                        !x.IsDeleted);

            if (mentor == null)
                return false;

            mentor.IsDeleted =
                true;

            mentor.DeletedOn =
                DateTime.UtcNow;

            mentor.DeletedBy =
                "OrganizationAdmin";

            await _context.SaveChangesAsync();

            return true;
        }
        // =====================================================
        // GET MENTOR ID BY EMAIL
        // =====================================================

        public async Task<int?> GetIdByEmailAsync(
            string email)
        {
            var organizationId =
                OrganizationId;

            return await _context.Mentors
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    x.Email == email &&
                    !x.IsDeleted)
                .Select(x =>
                    (int?)x.MentorId)
                .FirstOrDefaultAsync();
        }
    }
}