using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services;

public class HrCalendarService : IHrCalendarService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantContext _tenantContext;

    public HrCalendarService(
        ApplicationDbContext context,
        ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    private int OrganizationId => _tenantContext.OrganizationId;

    // ============================================================
    // EVENTS
    // ============================================================

    public async Task<(IEnumerable<HrCalendarEventDto> Items, int TotalCount)>
        GetEventsAsync(HrCalendarQueryDto query)
    {
        var events = _context.HrCalendarEvents
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Employee)
            .Include(x => x.Student)
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted)
            .AsQueryable();

        if (query.FromDate.HasValue)
        {
            events = events.Where(x =>
                x.EndDateTime >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            events = events.Where(x =>
                x.StartDateTime <= query.ToDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.EventType))
        {
            var eventType = query.EventType.Trim().ToUpperInvariant();

            events = events.Where(x =>
                x.EventType == eventType);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            events = events.Where(x =>
                x.Title.Contains(search) ||
                (x.Description != null &&
                 x.Description.Contains(search)));
        }

        if (query.CourseId.HasValue)
        {
            events = events.Where(x =>
                x.CourseId == query.CourseId.Value);
        }

        if (query.BatchId.HasValue)
        {
            events = events.Where(x =>
                x.BatchId == query.BatchId.Value);
        }

        if (query.EmployeeId.HasValue)
        {
            events = events.Where(x =>
                x.EmployeeId == query.EmployeeId.Value);
        }

        if (query.StudentId.HasValue)
        {
            events = events.Where(x =>
                x.StudentId == query.StudentId.Value);
        }

        var totalCount = await events.CountAsync();

        var pageNumber =
            query.PageNumber < 1 ? 1 : query.PageNumber;

        var pageSize =
            query.PageSize < 1 ? 50 :
            query.PageSize > 200 ? 200 :
            query.PageSize;

        var items = await events
            .OrderBy(x => x.StartDateTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new HrCalendarEventDto
            {
                EventId = x.EventId,
                EventType = x.EventType,
                Title = x.Title,
                Description = x.Description,
                StartDateTime = x.StartDateTime,
                EndDateTime = x.EndDateTime,
                Location = x.Location,
                MeetingLink = x.MeetingLink,
                AllDay = x.AllDay,
                Color = x.Color,

                CourseId = x.CourseId,
                CourseName =
                    x.Course != null
                        ? x.Course.CourseName
                        : string.Empty,

                BatchId = x.BatchId,
                BatchName =
                    x.Batch != null
                        ? x.Batch.BatchName
                        : string.Empty,

                EmployeeId = x.EmployeeId,
                EmployeeName =
                    x.Employee != null
                        ? (x.Employee.FirstName + " " +
                           x.Employee.LastName).Trim()
                        : string.Empty,

                StudentId = x.StudentId,
                StudentName =
                    x.Student != null
                        ? (x.Student.FirstName + " " +
                           x.Student.LastName).Trim()
                        : string.Empty,

                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate
            })
            .ToListAsync();

        return (items, totalCount);
    }


    public async Task<HrCalendarEventDto?> GetEventByIdAsync(
        int eventId)
    {
        return await _context.HrCalendarEvents
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Employee)
            .Include(x => x.Student)
            .Where(x =>
                x.EventId == eventId &&
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted)
            .Select(x => new HrCalendarEventDto
            {
                EventId = x.EventId,
                EventType = x.EventType,
                Title = x.Title,
                Description = x.Description,
                StartDateTime = x.StartDateTime,
                EndDateTime = x.EndDateTime,
                Location = x.Location,
                MeetingLink = x.MeetingLink,
                AllDay = x.AllDay,
                Color = x.Color,

                CourseId = x.CourseId,
                CourseName =
                    x.Course != null
                        ? x.Course.CourseName
                        : string.Empty,

                BatchId = x.BatchId,
                BatchName =
                    x.Batch != null
                        ? x.Batch.BatchName
                        : string.Empty,

                EmployeeId = x.EmployeeId,
                EmployeeName =
                    x.Employee != null
                        ? (x.Employee.FirstName + " " +
                           x.Employee.LastName).Trim()
                        : string.Empty,

                StudentId = x.StudentId,
                StudentName =
                    x.Student != null
                        ? (x.Student.FirstName + " " +
                           x.Student.LastName).Trim()
                        : string.Empty,

                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate
            })
            .FirstOrDefaultAsync();
    }


    public async Task<int> CreateEventAsync(
        HrCalendarEventCreateDto dto)
    {
        ValidateEvent(dto.EventType);

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException(
                "Event title is required.");

        if (dto.EndDateTime < dto.StartDateTime)
            throw new ArgumentException(
                "End date/time cannot be earlier than start date/time.");

        await ValidateReferencesAsync(
            dto.CourseId,
            dto.BatchId,
            dto.EmployeeId,
            dto.StudentId);

        var entity = new HrCalendarEvent
        {
            OrganizationId = OrganizationId,

            EventType =
                dto.EventType.Trim().ToUpperInvariant(),

            Title = dto.Title.Trim(),

            Description = dto.Description,

            StartDateTime = dto.StartDateTime,

            EndDateTime = dto.EndDateTime,

            Location = dto.Location,

            MeetingLink = dto.MeetingLink,

            AllDay = dto.AllDay,

            Color = dto.Color,

            CourseId = dto.CourseId,

            BatchId = dto.BatchId,

            EmployeeId = dto.EmployeeId,

            StudentId = dto.StudentId,

            CreatedDate = DateTime.UtcNow
        };

        _context.HrCalendarEvents.Add(entity);

        await _context.SaveChangesAsync();

        return entity.EventId;
    }


    public async Task<bool> UpdateEventAsync(
        int eventId,
        HrCalendarEventUpdateDto dto)
    {
        ValidateEvent(dto.EventType);

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException(
                "Event title is required.");

        if (dto.EndDateTime < dto.StartDateTime)
            throw new ArgumentException(
                "End date/time cannot be earlier than start date/time.");

        var entity = await _context.HrCalendarEvents
            .FirstOrDefaultAsync(x =>
                x.EventId == eventId &&
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted);

        if (entity == null)
            return false;

        await ValidateReferencesAsync(
            dto.CourseId,
            dto.BatchId,
            dto.EmployeeId,
            dto.StudentId);

        entity.EventType =
            dto.EventType.Trim().ToUpperInvariant();

        entity.Title = dto.Title.Trim();

        entity.Description = dto.Description;

        entity.StartDateTime = dto.StartDateTime;

        entity.EndDateTime = dto.EndDateTime;

        entity.Location = dto.Location;

        entity.MeetingLink = dto.MeetingLink;

        entity.AllDay = dto.AllDay;

        entity.Color = dto.Color;

        entity.CourseId = dto.CourseId;

        entity.BatchId = dto.BatchId;

        entity.EmployeeId = dto.EmployeeId;

        entity.StudentId = dto.StudentId;

        entity.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<bool> DeleteEventAsync(
        int eventId)
    {
        var entity = await _context.HrCalendarEvents
            .FirstOrDefaultAsync(x =>
                x.EventId == eventId &&
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted);

        if (entity == null)
            return false;

        entity.IsDeleted = true;
        entity.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }


    // ============================================================
    // UPCOMING
    // ============================================================

    public async Task<IEnumerable<HrCalendarEventDto>>
        GetUpcomingEventsAsync(int days = 7)
    {
        if (days < 1)
            days = 7;

        if (days > 90)
            days = 90;

        var now = DateTime.UtcNow;
        var end = now.AddDays(days);

        return await _context.HrCalendarEvents
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Include(x => x.Employee)
            .Include(x => x.Student)
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted &&
                x.StartDateTime >= now &&
                x.StartDateTime <= end)
            .OrderBy(x => x.StartDateTime)
            .Take(100)
            .Select(x => new HrCalendarEventDto
            {
                EventId = x.EventId,
                EventType = x.EventType,
                Title = x.Title,
                Description = x.Description,
                StartDateTime = x.StartDateTime,
                EndDateTime = x.EndDateTime,
                Location = x.Location,
                MeetingLink = x.MeetingLink,
                AllDay = x.AllDay,
                Color = x.Color,

                CourseId = x.CourseId,
                CourseName =
                    x.Course != null
                        ? x.Course.CourseName
                        : string.Empty,

                BatchId = x.BatchId,
                BatchName =
                    x.Batch != null
                        ? x.Batch.BatchName
                        : string.Empty,

                EmployeeId = x.EmployeeId,
                EmployeeName =
                    x.Employee != null
                        ? (x.Employee.FirstName + " " +
                           x.Employee.LastName).Trim()
                        : string.Empty,

                StudentId = x.StudentId,
                StudentName =
                    x.Student != null
                        ? (x.Student.FirstName + " " +
                           x.Student.LastName).Trim()
                        : string.Empty,

                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate
            })
            .ToListAsync();
    }


    // ============================================================
    // STATS
    // ============================================================

    public async Task<HrCalendarStatsDto>
        GetStatsAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);
        var now = DateTime.UtcNow;

        var events = _context.HrCalendarEvents
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted);

        return new HrCalendarStatsDto
        {
            TotalEvents =
                await events.CountAsync(),

            TodayEvents =
                await events.CountAsync(x =>
                    x.StartDateTime < tomorrow &&
                    x.EndDateTime >= today),

            UpcomingEvents =
                await events.CountAsync(x =>
                    x.StartDateTime >= now),

            ClassEvents =
                await events.CountAsync(x =>
                    x.EventType == "CLASS"),

            MeetingEvents =
                await events.CountAsync(x =>
                    x.EventType == "MEETING"),

            HolidayEvents =
                await events.CountAsync(x =>
                    x.EventType == "HOLIDAY"),

            LeaveEvents =
                await events.CountAsync(x =>
                    x.EventType == "LEAVE"),

            TrainingEvents =
                await events.CountAsync(x =>
                    x.EventType == "TRAINING"),

            InterviewEvents =
                await events.CountAsync(x =>
                    x.EventType == "INTERVIEW"),

            OtherEvents =
                await events.CountAsync(x =>
                    x.EventType == "OTHER")
        };
    }


    // ============================================================
    // HOLIDAYS
    // ============================================================

    public async Task<IEnumerable<HrCalendarHolidayDto>>
        GetHolidaysAsync(
            DateTime? fromDate,
            DateTime? toDate)
    {
        var from =
            fromDate?.Date ??
            DateTime.Today;

        var to =
            toDate?.Date.AddDays(1) ??
            DateTime.Today.AddYears(1);

        return await _context.HrCalendarEvents
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                !x.IsDeleted &&
                x.EventType == "HOLIDAY" &&
                x.StartDateTime < to &&
                x.EndDateTime >= from)
            .OrderBy(x => x.StartDateTime)
            .Select(x => new HrCalendarHolidayDto
            {
                EventId = x.EventId,
                Title = x.Title,
                Description = x.Description,
                StartDateTime = x.StartDateTime,
                EndDateTime = x.EndDateTime,
                AllDay = x.AllDay
            })
            .ToListAsync();
    }


    // ============================================================
    // LEAVES
    // ============================================================

    public async Task<IEnumerable<HrCalendarLeaveDto>>
        GetLeavesAsync(
            DateTime? fromDate,
            DateTime? toDate)
    {
        var from =
            fromDate?.Date ??
            DateTime.Today;

        var to =
            toDate?.Date ??
            DateTime.Today.AddMonths(3);

        return await _context.LeaveRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                x.StartDate <= DateOnly.FromDateTime(to) &&
                x.EndDate >= DateOnly.FromDateTime(from))
            .OrderBy(x => x.StartDate)
            .Select(x => new HrCalendarLeaveDto
            {
                LeaveRequestId = x.LeaveRequestId,

                EmployeeId = x.EmployeeId,

                EmployeeName =
                    (x.Employee.FirstName + " " +
                     x.Employee.LastName).Trim(),

                LeaveType = x.LeaveType,

                StartDate =
                    x.StartDate.ToDateTime(TimeOnly.MinValue),

                EndDate =
                    x.EndDate.ToDateTime(TimeOnly.MinValue),

                Status =
                    x.Status.ToString().ToUpperInvariant(),

                Reason = x.Reason
            })
            .ToListAsync();
    }


    // ============================================================
    // CLASSES
    // ============================================================

    public async Task<IEnumerable<HrCalendarClassDto>>
        GetClassesAsync(
            DateTime? fromDate,
            DateTime? toDate)
    {
        var from =
            fromDate?.Date ??
            DateTime.Today;

        var to =
            toDate?.Date ??
            DateTime.Today.AddMonths(3);

        return await _context.LiveClasses
            .AsNoTracking()
            .Include(x => x.Course)
            .Include(x => x.Batch)
            .Where(x =>
                x.Batch.OrganizationId == OrganizationId &&
                x.ScheduledDate >= from &&
                x.ScheduledDate <= to &&
                x.Status != "Cancelled")
            .OrderBy(x => x.ScheduledDate)
            .ThenBy(x => x.StartTime)
            .Select(x => new HrCalendarClassDto
            {
                ClassId = x.LiveClassId,

                ClassTitle = x.ClassTitle,

                Description = x.Description,

                CourseId = x.CourseId,

                CourseName =
                    x.Course != null
                        ? x.Course.CourseName
                        : string.Empty,

                BatchId = x.BatchId,

                BatchName =
                    x.Batch != null
                        ? x.Batch.BatchName
                        : string.Empty,

                ScheduledDate = x.ScheduledDate,

                StartTime = DateTime.Today
    .Add(x.StartTime)
    .ToString("hh:mm tt"),

                EndTime = DateTime.Today
    .Add(x.EndTime)
    .ToString("hh:mm tt"),

                MeetingPlatform = x.MeetingPlatform,

                MeetingLink = x.MeetingLink
            })
            .ToListAsync();
    }


    // ============================================================
    // VALIDATION
    // ============================================================

    private static void ValidateEvent(string? eventType)
    {
        var allowedTypes = new[]
        {
            "CLASS",
            "MEETING",
            "HOLIDAY",
            "LEAVE",
            "TRAINING",
            "INTERVIEW",
            "OTHER"
        };

        if (string.IsNullOrWhiteSpace(eventType) ||
            !allowedTypes.Contains(
                eventType.Trim().ToUpperInvariant()))
        {
            throw new ArgumentException(
                "Invalid event type. Allowed values: " +
                "CLASS, MEETING, HOLIDAY, LEAVE, TRAINING, INTERVIEW, OTHER.");
        }
    }


    private async Task ValidateReferencesAsync(
        int? courseId,
        int? batchId,
        int? employeeId,
        int? studentId)
    {
        if (courseId.HasValue)
        {
            var validCourse =
                await _context.Courses.AnyAsync(x =>
                    x.CourseId == courseId.Value &&
                    x.OrganizationId == OrganizationId);

            if (!validCourse)
            {
                throw new ArgumentException(
                    "Selected course does not belong to your organization.");
            }
        }

        if (batchId.HasValue)
        {
            var validBatch =
                await _context.Batches.AnyAsync(x =>
                    x.BatchId == batchId.Value &&
                    x.OrganizationId == OrganizationId);

            if (!validBatch)
            {
                throw new ArgumentException(
                    "Selected batch does not belong to your organization.");
            }

            if (courseId.HasValue)
            {
                var correctBatch =
                    await _context.Batches.AnyAsync(x =>
                        x.BatchId == batchId.Value &&
                        x.CourseId == courseId.Value &&
                        x.OrganizationId == OrganizationId);

                if (!correctBatch)
                {
                    throw new ArgumentException(
                        "Selected batch does not belong to the selected course.");
                }
            }
        }

        if (employeeId.HasValue)
        {
            var validEmployee =
                await _context.Employees.AnyAsync(x =>
                    x.EmployeeId == employeeId.Value &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            if (!validEmployee)
            {
                throw new ArgumentException(
                    "Selected employee does not belong to your organization.");
            }
        }

        if (studentId.HasValue)
        {
            var validStudent =
                await _context.Students.AnyAsync(x =>
                    x.StudentId == studentId.Value &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            if (!validStudent)
            {
                throw new ArgumentException(
                    "Selected student does not belong to your organization.");
            }
        }
    }
}