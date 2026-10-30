using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services;

public class HrStudentService : IHrStudentService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IStudentService _studentService;

    public HrStudentService(
        ApplicationDbContext context,
        ITenantContext tenantContext,
        IStudentService studentService)
    {
        _context = context;
        _tenantContext = tenantContext;
        _studentService = studentService;
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    public async Task<HrStudentSummaryDto> GetSummaryAsync()
    {
        var organizationId = _tenantContext.OrganizationId;

        var query = _context.Students
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        return new HrStudentSummaryDto
        {
            TotalStudents = await query.CountAsync(),

            ActiveStudents = await query.CountAsync(x =>
                x.Status == "Active"),

            InactiveStudents = await query.CountAsync(x =>
                x.Status == "Inactive"),

            PendingStudents = await query.CountAsync(x =>
                x.Status == "Pending")
        };
    }

    // =========================================================
    // GET ALL STUDENTS
    // =========================================================

    public async Task<(IEnumerable<HrStudentDto> Items, int TotalCount)> GetAllAsync(
        HrStudentQueryDto query)
    {
        var organizationId = _tenantContext.OrganizationId;

        var students = _context.Students
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Mentor)
            .Where(x =>
                x.OrganizationId == organizationId &&
                !x.IsDeleted)
            .AsQueryable();

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            students = students.Where(x =>
                x.FirstName.Contains(search) ||
                x.LastName.Contains(search) ||
                x.Email.Contains(search) ||
                x.Phone.Contains(search));
        }

        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim();

            students = students.Where(x =>
                x.Status == status);
        }

        // -----------------------------------------------------
        // COURSE
        // -----------------------------------------------------

        if (query.CourseId.HasValue)
        {
            students = students.Where(x =>
                x.CourseId == query.CourseId.Value);
        }

        // -----------------------------------------------------
        // BATCH
        // -----------------------------------------------------

        if (query.BatchId.HasValue)
        {
            students = students.Where(x =>
                x.BatchId == query.BatchId.Value);
        }

        // -----------------------------------------------------
        // MENTOR
        // -----------------------------------------------------

        if (query.MentorId.HasValue)
        {
            students = students.Where(x =>
                x.MentorId == query.MentorId.Value);
        }

        // -----------------------------------------------------
        // TOTAL COUNT BEFORE PAGINATION
        // -----------------------------------------------------

        var totalCount = await students.CountAsync();

        // -----------------------------------------------------
        // SORTING
        // -----------------------------------------------------

        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        students = sortBy switch
        {
            "firstname" =>
                query.Descending
                    ? students.OrderByDescending(x => x.FirstName)
                    : students.OrderBy(x => x.FirstName),

            "lastname" =>
                query.Descending
                    ? students.OrderByDescending(x => x.LastName)
                    : students.OrderBy(x => x.LastName),

            "email" =>
                query.Descending
                    ? students.OrderByDescending(x => x.Email)
                    : students.OrderBy(x => x.Email),

            "course" =>
                query.Descending
                    ? students.OrderByDescending(x => x.Course.CourseName)
                    : students.OrderBy(x => x.Course.CourseName),

            "batch" =>
                query.Descending
                    ? students.OrderByDescending(x => x.Batch.BatchName)
                    : students.OrderBy(x => x.Batch.BatchName),

            "status" =>
                query.Descending
                    ? students.OrderByDescending(x => x.Status)
                    : students.OrderBy(x => x.Status),

            _ =>
                query.Descending
                    ? students.OrderByDescending(x => x.FirstName)
                    : students.OrderBy(x => x.FirstName)
        };

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var pageNumber = query.PageNumber < 1
            ? 1
            : query.PageNumber;

        var pageSize = query.PageSize < 1
            ? 10
            : Math.Min(query.PageSize, 100);

        var skip = (pageNumber - 1) * pageSize;

        var result = await students
            .Skip(skip)
            .Take(pageSize)
            .Select(x => new HrStudentDto
            {
                StudentId = x.StudentId,

                FirstName = x.FirstName,

                LastName = x.LastName,

                Email = x.Email,

                Phone = x.Phone,

                CourseId = x.CourseId,

                CourseName = x.Course != null
                    ? x.Course.CourseName
                    : string.Empty,

                BatchId = x.BatchId,

                BatchName = x.Batch != null
                    ? x.Batch.BatchName
                    : string.Empty,

                MentorId = x.MentorId,

                MentorName = x.Mentor != null
                    ? x.Mentor.FirstName + " " + x.Mentor.LastName
                    : string.Empty,

                MentorProfilePhotoUrl =
    x.Mentor != null
        ? _context.Employees
            .Where(e =>
                e.EmployeeId == x.Mentor.EmployeeId &&
                e.OrganizationId == organizationId &&
                !e.IsDeleted)
            .Select(e => e.ProfilePhotoUrl)
            .FirstOrDefault()
        : null,

                Status = x.Status,

                Attendance = x.Attendance,

                AssessmentsCleared = x.AssessmentsCleared,

                CourseDates = x.CourseDates ?? string.Empty
            })
            .ToListAsync();

        return (result, totalCount);
    }

    // =========================================================
    // GET STUDENT BY ID
    // =========================================================

    public async Task<HrStudentDto?> GetByIdAsync(int studentId)
    {
        var organizationId = _tenantContext.OrganizationId;

        var student = await _context.Students
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Mentor)
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        if (student == null)
            return null;

        return MapToDto(student);
    }

    // =========================================================
    // UPDATE STUDENT
    // =========================================================

    public async Task<bool> UpdateAsync(
        int studentId,
        HrStudentUpdateDto dto)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.OrganizationId == _tenantContext.OrganizationId &&
                !x.IsDeleted);

        if (student == null)
            return false;

        /*
         * IMPORTANT:
         *
         * Do not directly update CourseId/BatchId here.
         *
         * Existing StudentService already contains:
         * - tenant validation
         * - course/batch validation
         * - batch capacity checking
         * - automatic available-batch handling
         * - enrollment count handling
         *
         * Therefore we reuse that existing business logic.
         */

        var updateDto = new DTOs.Student.UpdateStudentDto
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            CourseId = dto.CourseId,
            BatchId = dto.BatchId
        };

        return await _studentService.UpdateAsync(
            studentId,
            updateDto);
    }

    // =========================================================
    // DELETE STUDENT
    // =========================================================

    public async Task<bool> DeleteAsync(int studentId)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.OrganizationId == _tenantContext.OrganizationId &&
                !x.IsDeleted);

        if (student == null)
            return false;

        /*
         * Reuse existing StudentService.
         *
         * Existing implementation performs the student
         * soft-delete/business processing.
         */

        return await _studentService.DeleteAsync(studentId);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public async Task<bool> UpdateStatusAsync(
        int studentId,
        HrStudentStatusUpdateDto dto)
    {
        if (dto == null ||
            string.IsNullOrWhiteSpace(dto.Status))
        {
            throw new ArgumentException(
                "Status is required.");
        }

        var allowedStatuses = new[]
        {
            "Active",
            "Inactive",
            "Pending",
            "Rejected"
        };

        var requestedStatus = dto.Status.Trim();

        var validStatus = allowedStatuses.Any(x =>
            string.Equals(
                x,
                requestedStatus,
                StringComparison.OrdinalIgnoreCase));

        if (!validStatus)
        {
            throw new ArgumentException(
                "Invalid student status. " +
                "Allowed values are Active, Inactive, Pending and Rejected.");
        }

        var student = await _context.Students
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.OrganizationId == _tenantContext.OrganizationId &&
                !x.IsDeleted);

        if (student == null)
            return false;

        student.Status = allowedStatuses.First(x =>
            string.Equals(
                x,
                requestedStatus,
                StringComparison.OrdinalIgnoreCase));

        await _context.SaveChangesAsync();

        return true;
    }

    // =========================================================
    // ENROLLMENT DETAILS
    // =========================================================

    public async Task<HrStudentEnrollmentDto?> GetEnrollmentAsync(
        int studentId)
    {
        var organizationId = _tenantContext.OrganizationId;

        var student = await _context.Students
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Mentor)
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        if (student == null)
            return null;

        return new HrStudentEnrollmentDto
        {
            StudentId = student.StudentId,

            CourseId = student.CourseId,

            CourseName = student.Course != null
                ? student.Course.CourseName
                : string.Empty,

            BatchId = student.BatchId,

            BatchName = student.Batch != null
                ? student.Batch.BatchName
                : string.Empty,

            MentorId = student.MentorId,

            MentorName = student.Mentor != null
                ? $"{student.Mentor.FirstName} {student.Mentor.LastName}"
                : string.Empty,

            Status = student.Status,

            CourseDates = student.CourseDates ?? string.Empty
        };
    }

    // =========================================================
    // MAP
    // =========================================================

    private static HrStudentDto MapToDto(
    Student student)
    {
        return new HrStudentDto
        {
            StudentId =
                student.StudentId,

            FirstName =
                student.FirstName,

            LastName =
                student.LastName,

            Email =
                student.Email,

            Phone =
                student.Phone,

            ProfilePhotoUrl =
                student.ProfilePhotoUrl,

            CourseId =
                student.CourseId,

            CourseName =
                student.Course?.CourseName
                    ?? string.Empty,

            BatchId =
                student.BatchId,

            BatchName =
                student.Batch?.BatchName
                    ?? string.Empty,

            MentorId =
                student.MentorId,

            MentorName =
                student.Mentor == null
                    ? string.Empty
                    : $"{student.Mentor.FirstName} {student.Mentor.LastName}",

            MentorProfilePhotoUrl =
                null,

            Status =
                student.Status,

            Attendance =
                student.Attendance,

            AssessmentsCleared =
                student.AssessmentsCleared,

            CourseDates =
                student.CourseDates
                    ?? string.Empty
        };
    }
}