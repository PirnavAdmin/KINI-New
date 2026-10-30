using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class BatchRepository : IBatchRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public BatchRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // =====================================================
        // BATCH NAME EXISTS
        // =====================================================

        public async Task<bool> BatchNameExistsAsync(
            string batchName,
            int? batchId = null)
        {
            return await _context.Batches.AnyAsync(x =>
                x.OrganizationId == OrganizationId &&
                x.BatchName.ToLower() ==
                batchName.ToLower() &&
                (!batchId.HasValue ||
                 x.BatchId != batchId.Value));
        }

        // =====================================================
        // COURSE EXISTS IN CURRENT ORGANIZATION
        // =====================================================

        public async Task<bool> CourseExistsAsync(
            int courseId)
        {
            return await _context.Courses.AnyAsync(x =>
                x.CourseId == courseId &&
                x.OrganizationId == OrganizationId &&
                x.Status);
        }

        // =====================================================
        // MENTOR EXISTS IN CURRENT ORGANIZATION
        // =====================================================

        public async Task<bool> MentorExistsAsync(
            int mentorId)
        {
            return await _context.Mentors.AnyAsync(x =>
                x.MentorId == mentorId &&
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted);
        }

        // =====================================================
        // COURSE + MENTOR SAME ORGANIZATION
        // =====================================================

        public async Task<bool>
            CourseAndMentorBelongToOrganizationAsync(
                int courseId,
                int mentorId)
        {
            var courseExists =
                await CourseExistsAsync(courseId);

            if (!courseExists)
                return false;

            var mentorExists =
                await MentorExistsAsync(mentorId);

            if (!mentorExists)
                return false;

            return true;
        }

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<PagedResponse<BatchDto>> GetAllAsync(
            string? search,
            bool? status,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Batches
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                    OrganizationId)
                .Include(x => x.Course)
                .Include(x => x.Mentor)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                    x.BatchName.Contains(search) ||
                    x.Course.CourseName.Contains(search) ||
                    x.Mentor.FirstName.Contains(search));
            }

            if (status.HasValue)
            {
                query = query.Where(x =>
                    status.Value
                        ? x.Status == BatchStatus.Active
                        : x.Status == BatchStatus.Completed);
            }

            var totalRecords =
                await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.BatchId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new BatchDto
                {
                    BatchId = x.BatchId,

                    BatchName = x.BatchName,

                    CourseId = x.CourseId,

                    CourseName =
                        x.Course.CourseName,

                    MentorId = x.MentorId,

                    MentorName =
                        x.Mentor.FirstName +
                        " " +
                        x.Mentor.LastName,

                    BatchType =
                        x.BatchType,

                    StartDate =
                        x.StartDate,

                    EndDate =
                        x.EndDate,

                    Capacity =
                        x.Capacity,

                    EnrolledStudents =
                        x.EnrolledStudents,

                    LiveClasses =
                        x.LiveClasses,

                    RecordedClasses =
                        x.RecordedClasses,

                    Description =
                        x.Description,

                    Status =
                        x.Status
                })
                .ToListAsync();

            return new PagedResponse<BatchDto>(
                data,
                totalRecords,
                pageNumber,
                pageSize);
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<BatchDto?> GetByIdAsync(
            int batchId)
        {
            return await _context.Batches
                .AsNoTracking()
                .Include(x => x.Course)
                .Include(x => x.Mentor)
                .Where(x =>
                    x.BatchId == batchId &&
                    x.OrganizationId ==
                    OrganizationId)
                .Select(x => new BatchDto
                {
                    BatchId = x.BatchId,

                    BatchName = x.BatchName,

                    CourseId = x.CourseId,

                    CourseName =
                        x.Course.CourseName,

                    MentorId = x.MentorId,

                    MentorName =
                        x.Mentor.FirstName +
                        " " +
                        x.Mentor.LastName,

                    BatchType =
                        x.BatchType,

                    StartDate =
                        x.StartDate,

                    EndDate =
                        x.EndDate,

                    Capacity =
                        x.Capacity,

                    EnrolledStudents =
                        x.EnrolledStudents,

                    LiveClasses =
                        x.LiveClasses,

                    RecordedClasses =
                        x.RecordedClasses,

                    Description =
                        x.Description,

                    Status =
                        x.Status
                })
                .FirstOrDefaultAsync();
        }

        // =====================================================
        // GET ENTITY + CAPACITY
        // =====================================================

        public async Task<Batch?> GetByIdWithCapacityAsync(
            int batchId)
        {
            return await _context.Batches
                .FirstOrDefaultAsync(x =>
                    x.BatchId == batchId &&
                    x.OrganizationId ==
                    OrganizationId);
        }

        // =====================================================
        // ACTIVE STUDENT COUNT
        // =====================================================

        public async Task<int> GetActiveStudentCountAsync(
            int batchId)
        {
            return await _context.Students
                .CountAsync(s =>
                    s.BatchId == batchId &&
                    s.OrganizationId ==
                    OrganizationId &&
                    !s.IsDeleted &&
                    (s.Status == "Active" ||
                     s.Status == "Pending"));
        }

        // =====================================================
        // AVAILABLE BATCH FOR COURSE
        // =====================================================

        public async Task<Batch?> GetAvailableBatchAsync(
            int courseId)
        {
            return await _context.Batches
                .Where(b =>
                    b.OrganizationId ==
                    OrganizationId &&

                    b.CourseId ==
                    courseId &&

                    (b.Status ==
                        BatchStatus.Upcoming ||
                     b.Status ==
                        BatchStatus.Active))
                .Where(b =>
                    _context.Students.Count(s =>
                        s.BatchId ==
                            b.BatchId &&

                        s.OrganizationId ==
                            OrganizationId &&

                        !s.IsDeleted &&

                        (s.Status == "Active" ||
                         s.Status == "Pending"))
                    < b.Capacity)
                .OrderBy(b => b.StartDate)
                .ThenBy(b => b.BatchId)
                .FirstOrDefaultAsync();
        }

        // =====================================================
        // INCREMENT ENROLLMENT
        // =====================================================

        public async Task<bool>
            IncrementEnrollmentAsync(
                int batchId)
        {
            var batch =
                await GetByIdWithCapacityAsync(
                    batchId);

            if (batch == null)
                return false;

            batch.EnrolledStudents++;

            return true;
        }

        // =====================================================
        // DECREMENT ENROLLMENT
        // =====================================================

        public async Task<bool>
            DecrementEnrollmentAsync(
                int batchId)
        {
            var batch =
                await GetByIdWithCapacityAsync(
                    batchId);

            if (batch == null)
                return false;

            if (batch.EnrolledStudents > 0)
                batch.EnrolledStudents--;

            return true;
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<BatchDto> CreateAsync(
            CreateBatchDto dto)
        {
            // Organization is ALWAYS obtained from JWT.
            var batch = new Batch
            {
                OrganizationId =
                    OrganizationId,

                BatchName =
                    dto.BatchName,

                CourseId =
                    dto.CourseId,

                MentorId =
                    dto.MentorId,

                BatchType =
                    dto.BatchType,

                StartDate =
                    dto.StartDate,

                EndDate =
                    dto.EndDate,

                Capacity =
                    dto.Capacity,

                Description =
                    dto.Description,

                Status =
                    dto.Status,

                EnrolledStudents = 0,

                CreatedDate =
                    DateTime.UtcNow
            };

            _context.Batches.Add(batch);

            await _context.SaveChangesAsync();

            return (await GetByIdAsync(
                batch.BatchId))!;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<BatchDto?> UpdateAsync(
            int batchId,
            UpdateBatchDto dto)
        {
            var batch =
                await _context.Batches
                    .FirstOrDefaultAsync(x =>
                        x.BatchId ==
                            batchId &&

                        x.OrganizationId ==
                            OrganizationId);

            if (batch == null)
                return null;

            batch.BatchName =
                dto.BatchName;

            batch.CourseId =
                dto.CourseId;

            batch.MentorId =
                dto.MentorId;

            batch.BatchType =
                dto.BatchType;

            batch.StartDate =
                dto.StartDate;

            batch.EndDate =
                dto.EndDate;

            batch.Capacity =
                dto.Capacity;

            batch.Description =
                dto.Description;

            batch.Status =
                dto.Status;

            batch.ModifiedDate =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                batchId);
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int batchId)
        {
            var batch =
                await _context.Batches
                    .FirstOrDefaultAsync(x =>
                        x.BatchId ==
                            batchId &&

                        x.OrganizationId ==
                            OrganizationId);

            if (batch == null)
                return false;

            _context.Batches.Remove(batch);

            await _context.SaveChangesAsync();

            return true;
        }

        // =====================================================
        // SUMMARY
        // =====================================================

        public async Task<BatchSummaryDto>
            GetSummaryAsync()
        {
            return new BatchSummaryDto
            {
                TotalBatches =
                    await _context.Batches.CountAsync(
                        x =>
                            x.OrganizationId ==
                            OrganizationId),

                ActiveBatches =
                    await _context.Batches.CountAsync(
                        x =>
                            x.OrganizationId ==
                            OrganizationId &&
                            x.Status ==
                            BatchStatus.Active),

                UpcomingBatches =
                    await _context.Batches.CountAsync(
                        x =>
                            x.OrganizationId ==
                            OrganizationId &&
                            x.Status ==
                            BatchStatus.Upcoming),

                CompletedBatches =
                    await _context.Batches.CountAsync(
                        x =>
                            x.OrganizationId ==
                            OrganizationId &&
                            x.Status ==
                            BatchStatus.Completed)
            };
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
            var query =
                _context.Batches
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId ==
                        OrganizationId)
                    .Include(x => x.Course)
                    .Include(x => x.Mentor)
                    .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                    x.BatchName.Contains(search) ||
                    x.Course.CourseName.Contains(search) ||
                    x.Mentor.FirstName.Contains(search));
            }

            if (status.HasValue)
            {
                query = query.Where(x =>
                    x.Status == status.Value);
            }

            if (courseId.HasValue)
            {
                query = query.Where(x =>
                    x.CourseId ==
                    courseId.Value);
            }

            if (mentorId.HasValue)
            {
                query = query.Where(x =>
                    x.MentorId ==
                    mentorId.Value);
            }

            query = sortBy?.ToLower() switch
            {
                "name" =>
                    sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(
                            x => x.BatchName)
                        : query.OrderBy(
                            x => x.BatchName),

                "startdate" =>
                    sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(
                            x => x.StartDate)
                        : query.OrderBy(
                            x => x.StartDate),

                _ =>
                    query.OrderByDescending(
                        x => x.BatchId)
            };

            return await query
                .Select(x => new BatchExportDto
                {
                    BatchCode =
                        x.BatchId.ToString(),

                    BatchName =
                        x.BatchName,

                    Course =
                        x.Course.CourseName,

                    Mentor =
                        x.Mentor.FirstName +
                        " " +
                        x.Mentor.LastName,

                    StartDate =
                        x.StartDate,

                    EndDate =
                        x.EndDate,

                    Status =
                        x.Status.ToString(),

                    Capacity =
                        x.Capacity,

                    EnrolledStudents =
                        x.EnrolledStudents,

                    AvailableSeats =
                        Math.Max(
                            x.Capacity -
                            x.EnrolledStudents,
                            0),

                    CreatedDate =
                        x.CreatedDate
                })
                .ToListAsync();
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
            // -------------------------------------------------
            // 1. Find Mentor using EmployeeId
            // -------------------------------------------------

            var mentor =
                await _context.Mentors
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeId == employeeId &&
                        !m.IsDeleted);

            if (mentor == null)
            {
                throw new KeyNotFoundException(
                    "Mentor not found for this employee.");
            }

            // -------------------------------------------------
            // 2. Get organization from Mentor
            //
            // Do NOT use TenantContext here because the current
            // TenantContext only allows OrganizationAdmin.
            // This endpoint is also used by Mentor.
            // -------------------------------------------------

            var organizationId =
                mentor.OrganizationId;

            var mentorId =
                mentor.MentorId;

            // -------------------------------------------------
            // 3. Get ONLY batches assigned to this mentor
            // -------------------------------------------------

            var query =
                _context.Batches
                    .AsNoTracking()
                    .Where(b =>
                        b.OrganizationId ==
                            organizationId &&

                        b.MentorId ==
                            mentorId)
                    .Include(b => b.Course)
                    .AsQueryable();

            // -------------------------------------------------
            // 4. Status filter
            // -------------------------------------------------

            if (status.HasValue)
            {
                query = query.Where(b =>
                    b.Status == status.Value);
            }

            // -------------------------------------------------
            // 5. Search filter
            // -------------------------------------------------

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(b =>
                    b.BatchName.Contains(search) ||
                    b.Course.CourseName.Contains(search));
            }

            // -------------------------------------------------
            // 6. Total records
            // -------------------------------------------------

            var totalRecords =
                await query.CountAsync();

            // -------------------------------------------------
            // 7. Get batches
            // -------------------------------------------------

            var batches =
                await query
                    .OrderByDescending(
                        b => b.BatchId)

                    .Skip(
                        (page - 1) *
                        pageSize)

                    .Take(pageSize)

                    .Select(b =>
                        new MentorBatchDto
                        {
                            BatchId =
                                b.BatchId,

                            BatchName =
                                b.BatchName,

                            CourseId =
                                b.CourseId,

                            CourseName =
                                b.Course.CourseName,

                            Status =
                                b.Status.ToString(),

                            StartDate =
                                b.StartDate,

                            EndDate =
                                b.EndDate,

                            StudentCount =
                                _context.Students.Count(s =>
                                    s.BatchId ==
                                        b.BatchId &&

                                    s.OrganizationId ==
                                        organizationId &&

                                    !s.IsDeleted),

                            Capacity =
                                b.Capacity
                        })
                    .ToListAsync();

            // -------------------------------------------------
            // 8. Return response
            // -------------------------------------------------

            return new MentorBatchesResponseDto
            {
                EmployeeId =
                    mentor.EmployeeId,

                EmployeeName =
                    (
                        mentor.FirstName +
                        " " +
                        mentor.LastName
                    ).Trim(),

                TotalRecords =
                    totalRecords,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalPages =
                    (int)Math.Ceiling(
                        totalRecords /
                        (double)pageSize),

                Batches =
                    batches
            };
        }
    }
}
