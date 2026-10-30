using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services;

public class HrPerformanceService : IHrPerformanceService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantContext _tenantContext;

    public HrPerformanceService(
        ApplicationDbContext context,
        ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    private int OrganizationId =>
        _tenantContext.OrganizationId;


    // ============================================================
    // SUMMARY
    // ============================================================

    public async Task<HrPerformanceSummaryDto> GetSummaryAsync(
        string? period)
    {
        var months = GetPeriodMonths(period);

        var fromPeriod = DateTime.UtcNow
            .AddMonths(-(months - 1));

        var startPeriod = fromPeriod.ToString(
            "yyyy-MM",
            CultureInfo.InvariantCulture);

        var records = await _context.EmployeePerformances
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == OrganizationId &&
                x.Period.CompareTo(startPeriod) >= 0)
            .ToListAsync();

        if (!records.Any())
        {
            return new HrPerformanceSummaryDto
            {
                TotalEmployees = await GetActiveEmployeeQuery()
                    .CountAsync(),

                AveragePerformance = 0,
                TargetCompletion = 0,
                TopPerformers = 0,
                NeedsImprovement = 0
            };
        }

        return new HrPerformanceSummaryDto
        {
            TotalEmployees = records
                .Select(x => x.EmployeeId)
                .Distinct()
                .Count(),

            AveragePerformance = Round(
                records.Average(x => x.PerformanceScore)),

            TargetCompletion = Round(
                records.Average(x => x.TargetCompletion)),

            TopPerformers = records.Count(
                x => GetPerformanceStatus(
                    x.PerformanceScore) == "EXCELLENT"),

            NeedsImprovement = records.Count(
                x => GetPerformanceStatus(
                    x.PerformanceScore) == "NEEDS_IMPROVEMENT")
        };
    }


    // ============================================================
    // TREND
    // ============================================================

    public async Task<HrPerformanceTrendDto> GetTrendAsync()
    {
        var records = await _context.EmployeePerformances
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == OrganizationId)
            .ToListAsync();

        var series = records
            .GroupBy(x => x.Period)
            .OrderBy(x => x.Key)
            .Select(x => new HrPerformanceTrendItemDto
            {
                Month = x.Key,

                AvgScore = Round(
                    x.Average(y =>
                        y.PerformanceScore))
            })
            .ToList();

        return new HrPerformanceTrendDto
        {
            Series = series
        };
    }


    // ============================================================
    // BY ROLE
    // ============================================================

    public async Task<HrPerformanceByRoleDto> GetByRoleAsync()
    {
        var records = await _context.EmployeePerformances
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == OrganizationId)
            .Join(
                _context.Employees
                    .AsNoTracking()
                    .Where(e =>
                        e.OrganizationId == OrganizationId &&
                        !e.IsDeleted &&
                        e.Status != "Resigned" &&
                        e.Status != "RESIGNED"),
                performance => performance.EmployeeId,
                employee => employee.EmployeeId,
                (performance, employee) => new
                {
                    performance,
                    employee.Role
                })
            .ToListAsync();

        var items = records
            .GroupBy(x => x.Role)
            .OrderBy(x => x.Key)
            .Select(x => new HrPerformanceRoleItemDto
            {
                Role = MapRole(x.Key),

                AvgScore = Round(
                    x.Average(y =>
                        y.performance.PerformanceScore))
            })
            .ToList();

        return new HrPerformanceByRoleDto
        {
            Items = items
        };
    }


    // ============================================================
    // PAGINATED LIST
    // ============================================================

    public async Task<HrPerformancePagedResponse>
        GetPerformanceAsync(
            HrPerformanceFilterDto filter)
    {
        filter ??= new HrPerformanceFilterDto();

        var page = filter.Page < 1
            ? 1
            : filter.Page;

        var limit = filter.Limit < 1
            ? 10
            : Math.Min(filter.Limit, 100);

        var query = BuildQuery(filter);

        var totalCount =
            await query.CountAsync();

        var items =
            await query
                .OrderByDescending(x =>
                    x.PerformanceId)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

        var mapped =
            await MapRecordsAsync(items);

        return new HrPerformancePagedResponse
        {
            Items = mapped,

            Page = page,

            Limit = limit,

            TotalCount = totalCount,

            TotalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling(
                    totalCount / (double)limit)
        };
    }


    // ============================================================
    // DETAIL
    // ============================================================

    public async Task<HrPerformanceRecordDto?>
        GetByIdAsync(int performanceId)
    {
        if (performanceId <= 0)
            return null;

        var record =
            await _context.EmployeePerformances
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.PerformanceId ==
                        performanceId &&
                    x.OrganizationId ==
                        OrganizationId);

        if (record == null)
            return null;

        var mapped =
            await MapRecordsAsync(
                new List<EmployeePerformance>
                {
                    record
                });

        return mapped.FirstOrDefault();
    }


    // ============================================================
    // EMPLOYEE HISTORY
    // ============================================================

    public async Task<HrEmployeePerformanceHistoryResponse>
        GetEmployeeHistoryAsync(
            int employeeId)
    {
        if (employeeId <= 0)
        {
            return new HrEmployeePerformanceHistoryResponse();
        }

        var employeeExists =
            await GetActiveEmployeeQuery()
                .AnyAsync(x =>
                    x.EmployeeId ==
                    employeeId);

        if (!employeeExists)
        {
            return new HrEmployeePerformanceHistoryResponse();
        }

        var records =
            await _context.EmployeePerformances
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&
                    x.EmployeeId ==
                        employeeId)
                .OrderByDescending(x =>
                    x.Period)
                .ToListAsync();

        return new HrEmployeePerformanceHistoryResponse
        {
            Items =
                await MapRecordsAsync(records)
        };
    }


    // ============================================================
    // CREATE
    // ============================================================

    public async Task<HrPerformanceRecordDto>
        CreateAsync(
            HrCreatePerformanceDto dto)
    {
        if (dto == null)
            throw new ArgumentNullException(
                nameof(dto));

        var employeeId =
            ParseEmployeeId(dto.EmployeeId);

        if (employeeId <= 0)
        {
            throw new ArgumentException(
                "Invalid employee ID.");
        }

        ValidateScore(
            dto.PerformanceScore,
            nameof(dto.PerformanceScore));

        ValidateScore(
            dto.TargetCompletion,
            nameof(dto.TargetCompletion));

        var period =
            NormalizePeriod(dto.Period);

        var employee =
            await GetActiveEmployeeQuery()
                .FirstOrDefaultAsync(x =>
                    x.EmployeeId ==
                    employeeId);

        if (employee == null)
        {
            throw new KeyNotFoundException(
                "Employee not found.");
        }

        var duplicate =
            await _context.EmployeePerformances
                .AnyAsync(x =>
                    x.OrganizationId ==
                        OrganizationId &&
                    x.EmployeeId ==
                        employeeId &&
                    x.Period ==
                        period);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "Performance evaluation already exists for this employee and period.");
        }

        var attendance =
            await CalculateAttendanceAsync(
                employeeId,
                period);

        var entity =
            new EmployeePerformance
            {
                OrganizationId =
                    OrganizationId,

                EmployeeId =
                    employeeId,

                Period =
                    period,

                PerformanceScore =
                    dto.PerformanceScore,

                TargetCompletion =
                    dto.TargetCompletion,

                Attendance =
                    attendance,

                Notes =
                    string.IsNullOrWhiteSpace(
                        dto.Notes)
                        ? null
                        : dto.Notes.Trim()
            };

        await _context.EmployeePerformances
            .AddAsync(entity);

        await _context.SaveChangesAsync();

        var result =
            await GetByIdAsync(
                entity.PerformanceId);

        return result!;
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public async Task<HrPerformanceRecordDto?>
        UpdateAsync(
            int performanceId,
            HrUpdatePerformanceDto dto)
    {
        if (performanceId <= 0)
            return null;

        if (dto == null)
            throw new ArgumentNullException(
                nameof(dto));

        var entity =
            await _context.EmployeePerformances
                .FirstOrDefaultAsync(x =>
                    x.PerformanceId ==
                        performanceId &&
                    x.OrganizationId ==
                        OrganizationId);

        if (entity == null)
            return null;

        if (!string.IsNullOrWhiteSpace(
            dto.Period))
        {
            entity.Period =
                NormalizePeriod(
                    dto.Period);
        }

        if (dto.PerformanceScore.HasValue)
        {
            ValidateScore(
                dto.PerformanceScore.Value,
                nameof(dto.PerformanceScore));

            entity.PerformanceScore =
                dto.PerformanceScore.Value;
        }

        if (dto.TargetCompletion.HasValue)
        {
            ValidateScore(
                dto.TargetCompletion.Value,
                nameof(dto.TargetCompletion));

            entity.TargetCompletion =
                dto.TargetCompletion.Value;
        }

        if (dto.Notes != null)
        {
            entity.Notes =
                string.IsNullOrWhiteSpace(
                    dto.Notes)
                    ? null
                    : dto.Notes.Trim();
        }

        var duplicate =
            await _context.EmployeePerformances
                .AnyAsync(x =>
                    x.OrganizationId ==
                        OrganizationId &&
                    x.EmployeeId ==
                        entity.EmployeeId &&
                    x.Period ==
                        entity.Period &&
                    x.PerformanceId !=
                        performanceId);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "Performance evaluation already exists for this employee and period.");
        }

        entity.Attendance =
            await CalculateAttendanceAsync(
                entity.EmployeeId,
                entity.Period);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(
            performanceId);
    }


    // ============================================================
    // FILTERS
    // ============================================================

    // ============================================================
    // FILTERS
    // ============================================================

    public async Task<HrPerformanceFiltersDto>
        GetFiltersAsync()
    {
        var employees =
            await GetActiveEmployeeQuery()
                .Select(x => new
                {
                    x.Role
                })
                .ToListAsync();

        var departmentNames =
            await _context.EmployeeProfiles
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&
                    x.DepartmentId > 0)
                .Join(
                    _context.Departments,
                    profile =>
                        profile.DepartmentId,
                    department =>
                        department.DepartmentId,
                    (profile, department) =>
                        EF.Property<string>(
                            department,
                            "DepartmentName"))
                .Where(x =>
                    x != null &&
                    x != string.Empty)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

        var roles =
            employees
                .Select(x =>
                    MapRole(x.Role))
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .OrderBy(x => x)
                .ToList();

        return new HrPerformanceFiltersDto
        {
            Departments =
                departmentNames,

            Roles =
                roles,

            PerformanceStatuses =
                new List<string>
                {
                "EXCELLENT",
                "GOOD",
                "NEEDS_IMPROVEMENT"
                }
        };
    }

    // ============================================================
    // EXPORT
    // ============================================================

    public async Task<byte[]> ExportAsync(
        HrPerformanceFilterDto filter)
    {
        filter ??= new HrPerformanceFilterDto();

        var records =
            await BuildQuery(filter)
                .OrderByDescending(x =>
                    x.PerformanceId)
                .ToListAsync();

        var mapped =
            await MapRecordsAsync(records);

        var csv =
            new StringBuilder();

        csv.AppendLine(
            "PerformanceId,EmployeeId,EmployeeName,Role,Department,Period,PerformanceScore,TargetCompletion,Attendance,Status,AssignedBatches,Notes");

        foreach (var item in mapped)
        {
            csv.AppendLine(
                string.Join(",",
                    Csv(item.PerformanceId),
                    Csv(item.EmployeeId),
                    Csv(item.EmployeeName),
                    Csv(item.Role),
                    Csv(item.Department),
                    Csv(item.Period),
                    Csv(item.PerformanceScore),
                    Csv(item.TargetCompletion),
                    Csv(item.Attendance),
                    Csv(item.Status),
                    Csv(string.Join(
                        " | ",
                        item.AssignedBatches)),
                    Csv(item.Notes)));
        }

        return Encoding.UTF8.GetBytes(
            csv.ToString());
    }


    // ============================================================
    // QUERY BUILDER
    // ============================================================

    private IQueryable<EmployeePerformance>
        BuildQuery(
            HrPerformanceFilterDto filter)
    {
        var query =
            _context.EmployeePerformances
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId);

        // --------------------------------------------------------
        // SEARCH
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(
            filter.Search))
        {
            var search =
                filter.Search.Trim();

            var numericEmployeeId =
                ParseEmployeeId(search);

            query =
                query.Where(x =>
                    x.Employee.FirstName
                        .Contains(search) ||

                    x.Employee.LastName
                        .Contains(search) ||

                    x.Employee.Email
                        .Contains(search) ||

                    (
                        numericEmployeeId > 0 &&
                        x.EmployeeId ==
                            numericEmployeeId
                    ));
        }

        // --------------------------------------------------------
        // DEPARTMENT
        // --------------------------------------------------------

        if (filter.DepartmentId.HasValue)
        {
            var departmentId =
                filter.DepartmentId.Value;

            query =
                query.Where(x =>
                    _context.EmployeeProfiles
                        .Any(p =>
                            p.OrganizationId ==
                                OrganizationId &&

                            p.EmployeeId ==
                                x.EmployeeId &&

                            p.DepartmentId ==
                                departmentId));
        }

        // --------------------------------------------------------
        // ROLE
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(
            filter.Role))
        {
            var role =
                filter.Role.Trim();

            query =
                query.Where(x =>
                    x.Employee.Role == role ||

                    (
                        role == "Trainer" &&
                        x.Employee.Role == "Trainer"
                    ) ||

                    (
                        role == "Mentor" &&
                        x.Employee.Role == "Mentor"
                    ) ||

                    (
                        role == "Instructor" &&
                        x.Employee.Role == "Instructor"
                    ) ||

                    (
                        role == "Content Staff" &&
                        x.Employee.Role == "Content Staff"
                    ) ||

                    (
                        role == "Content Writer" &&
                        x.Employee.Role == "Content Writer"
                    ) ||

                    (
                        role == "HR Staff" &&
                        (
                            x.Employee.Role ==
                                "HRExecutive" ||

                            x.Employee.Role ==
                                "HRRecruiter"
                        )
                    ) ||

                    (
                        role == "Operations" &&
                        (
                            x.Employee.Role ==
                                "OperationAssociate" ||

                            x.Employee.Role ==
                                "Operations"
                        )
                    ) ||

                    (
                        role == "Employee" &&
                        x.Employee.Role ==
                            "Employee"
                    ));
        }

        // --------------------------------------------------------
        // PERFORMANCE STATUS
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(
            filter.PerformanceFilter))
        {
            var performanceFilter =
                filter.PerformanceFilter
                    .Trim()
                    .ToUpperInvariant();

            query =
                performanceFilter switch
                {
                    "EXCELLENT" =>
                        query.Where(x =>
                            x.PerformanceScore >= 90),

                    "GOOD" =>
                        query.Where(x =>
                            x.PerformanceScore >= 75 &&
                            x.PerformanceScore < 90),

                    "NEEDS_IMPROVEMENT" =>
                        query.Where(x =>
                            x.PerformanceScore < 75),

                    _ =>
                        query
                };
        }

        // --------------------------------------------------------
        // START DATE
        // --------------------------------------------------------

        if (filter.StartDate.HasValue)
        {
            var startPeriod =
                filter.StartDate.Value.ToString(
                    "yyyy-MM",
                    CultureInfo.InvariantCulture);

            query =
                query.Where(x =>
                    x.Period.CompareTo(
                        startPeriod) >= 0);
        }

        // --------------------------------------------------------
        // END DATE
        // --------------------------------------------------------

        if (filter.EndDate.HasValue)
        {
            var endPeriod =
                filter.EndDate.Value.ToString(
                    "yyyy-MM",
                    CultureInfo.InvariantCulture);

            query =
                query.Where(x =>
                    x.Period.CompareTo(
                        endPeriod) <= 0);
        }

        return query;
    }


    // ============================================================
    // MAP RECORDS
    // ============================================================

    private async Task<List<HrPerformanceRecordDto>>
        MapRecordsAsync(
            List<EmployeePerformance> records)
    {
        if (!records.Any())
            return new List<HrPerformanceRecordDto>();

        var employeeIds =
            records
                .Select(x =>
                    x.EmployeeId)
                .Distinct()
                .ToList();

        // --------------------------------------------------------
        // EMPLOYEES
        // --------------------------------------------------------

        var employees =
            await GetActiveEmployeeQuery()
                .Where(x =>
                    employeeIds.Contains(
                        x.EmployeeId))
                .ToListAsync();

        // --------------------------------------------------------
        // PROFILES
        // --------------------------------------------------------

        var profiles =
            await _context.EmployeeProfiles
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&

                    employeeIds.Contains(
                        x.EmployeeId))
                .Include(x =>
                    x.Department)
                .ToListAsync();

        // --------------------------------------------------------
        // MENTORS
        //
        // Mentor.EmployeeId is int in this project.
        // Do NOT use HasValue / Value here.
        // --------------------------------------------------------

        var mentorEmployeeIds =
            await _context.Mentors
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&

                    !x.IsDeleted &&

                    employeeIds.Contains(
                        x.EmployeeId))
                .Select(x =>
                    x.EmployeeId)
                .Distinct()
                .ToListAsync();

        // --------------------------------------------------------
        // BATCHES
        //
        // In the current project:
        // Batch.MentorId is int
        // Mentor.MentorId is int
        // Mentor.EmployeeId is int
        //
        // Therefore DO NOT use HasValue or Value.
        // --------------------------------------------------------

        var batches =
            await _context.Batches
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId)
                .Join(
                    _context.Mentors
                        .AsNoTracking()
                        .Where(m =>
                            m.OrganizationId ==
                                OrganizationId &&
                            !m.IsDeleted),
                    batch =>
                        batch.MentorId,
                    mentor =>
                        mentor.MentorId,
                    (batch, mentor) => new
                    {
                        batch.BatchName,

                        MentorEmployeeId =
                            mentor.EmployeeId
                    })
                .ToListAsync();
        // --------------------------------------------------------
        // RESULT
        // --------------------------------------------------------

        var result =
            new List<HrPerformanceRecordDto>();

        foreach (var record in records)
        {
            var employee =
                employees.FirstOrDefault(
                    x =>
                        x.EmployeeId ==
                            record.EmployeeId);

            if (employee == null)
                continue;

            var profile =
                profiles.FirstOrDefault(
                    x =>
                        x.EmployeeId ==
                            record.EmployeeId);

            var assignedBatches =
                mentorEmployeeIds.Contains(
                    record.EmployeeId)
                    ? batches
                        .Where(x =>
                            x.MentorEmployeeId ==
                                record.EmployeeId)
                        .Select(x =>
                            x.BatchName)
                        .Where(x =>
                            !string.IsNullOrWhiteSpace(
                                x))
                        .Distinct()
                        .OrderBy(x => x)
                        .ToList()
                    : new List<string>();

            // ----------------------------------------------------
            // DepartmentName is currently a shadow EF property
            // in your project, so use EF.Property instead of
            // profile.Department.DepartmentName.
            // ----------------------------------------------------

            string? departmentName = null;

            if (profile?.Department != null)
            {
                departmentName =
                    _context.Entry(
                        profile.Department)
                        .Property<string>(
                            "DepartmentName")
                        .CurrentValue;
            }

            result.Add(
                new HrPerformanceRecordDto
                {
                    PerformanceId =
                        record.PerformanceId,

                    EmployeeId =
                        FormatEmployeeId(
                            employee.EmployeeId),

                    EmployeeName =
                        $"{employee.FirstName} {employee.LastName}"
                            .Trim(),

                    Role =
                        MapRole(
                            employee.Role),

                    DepartmentId =
                        profile?.DepartmentId,

                    Department =
                        departmentName,

                    AssignedBatches =
                        assignedBatches,

                    Period =
                        record.Period,

                    PerformanceScore =
                        Round(
                            record.PerformanceScore),

                    TargetCompletion =
                        Round(
                            record.TargetCompletion),

                    Attendance =
                        Round(
                            record.Attendance),

                    Status =
                        GetPerformanceStatus(
                            record.PerformanceScore),

                    Notes =
                        record.Notes
                });
        }

        return result;
    }


    // ============================================================
    // ATTENDANCE CALCULATION
    // ============================================================

    private async Task<decimal>
        CalculateAttendanceAsync(
            int employeeId,
            string period)
    {
        if (!DateTime.TryParseExact(
                period + "-01",
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var firstDay))
        {
            return 0;
        }

        var startDate =
            DateOnly.FromDateTime(
                firstDay);

        var endDate =
            DateOnly.FromDateTime(
                firstDay
                    .AddMonths(1)
                    .AddDays(-1));

        var records =
            await _context.EmployeeAttendances
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId ==
                        OrganizationId &&

                    x.EmployeeId ==
                        employeeId &&

                    x.AttendanceDate >=
                        startDate &&

                    x.AttendanceDate <=
                        endDate)
                .ToListAsync();

        if (!records.Any())
            return 0;

        var considered =
            records
                .Where(x =>
                    !IsHolidayOrWeekOff(
                        x.Status))
                .ToList();

        if (!considered.Any())
            return 0;

        var present =
            considered.Count(x =>
                IsPresentStatus(
                    x.Status));

        return Round(
            present * 100m /
            considered.Count);
    }


    // ============================================================
    // ACTIVE EMPLOYEE QUERY
    // ============================================================

    private IQueryable<Employee>
        GetActiveEmployeeQuery()
    {
        return _context.Employees
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId ==
                    OrganizationId &&

                !x.IsDeleted &&

                x.Status != "Resigned" &&

                x.Status != "RESIGNED");
    }


    // ============================================================
    // PERIOD
    // ============================================================

    private static int GetPeriodMonths(
        string? period)
    {
        return period?
            .Trim()
            .ToUpperInvariant()
            switch
        {
            "1M" => 1,
            "3M" => 3,
            "6M" => 6,
            "1Y" => 12,

            _ => 6
        };
    }


    // ============================================================
    // NORMALIZE PERIOD
    // ============================================================

    private static string NormalizePeriod(
        string? period)
    {
        if (string.IsNullOrWhiteSpace(
            period))
        {
            throw new ArgumentException(
                "Period is required.");
        }

        if (!DateTime.TryParseExact(
                period.Trim(),
                "yyyy-MM",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var date))
        {
            throw new ArgumentException(
                "Period must be in YYYY-MM format.");
        }

        return date.ToString(
            "yyyy-MM",
            CultureInfo.InvariantCulture);
    }


    // ============================================================
    // PARSE EMPLOYEE ID
    // ============================================================

    private static int ParseEmployeeId(
        string? value)
    {
        if (string.IsNullOrWhiteSpace(
            value))
        {
            return 0;
        }

        var text =
            value.Trim();

        if (text.StartsWith(
            "EMP-",
            StringComparison.OrdinalIgnoreCase))
        {
            text =
                text.Substring(4);
        }

        return int.TryParse(
            text,
            out var id)
                ? id
                : 0;
    }


    // ============================================================
    // FORMAT EMPLOYEE ID
    // ============================================================

    private static string FormatEmployeeId(
        int employeeId)
    {
        return $"EMP-{employeeId:000}";
    }


    // ============================================================
    // ROLE MAPPING
    // ============================================================

    private static string MapRole(
        string? role)
    {
        if (string.IsNullOrWhiteSpace(
            role))
        {
            return string.Empty;
        }

        return role.Trim()
            switch
        {
            "Trainer" =>
                "Trainer",

            "Mentor" =>
                "Mentor",

            "Instructor" =>
                "Instructor",

            "Content Staff" =>
                "Content Staff",

            "Content Writer" =>
                "Content Writer",

            "HRExecutive" =>
                "HR Staff",

            "HRRecruiter" =>
                "HR Staff",

            "OperationAssociate" =>
                "Operations",

            "Operations" =>
                "Operations",

            "Employee" =>
                "Employee",

            _ =>
                role.Trim()
        };
    }


    // ============================================================
    // PERFORMANCE STATUS
    // ============================================================

    private static string
        GetPerformanceStatus(
            decimal score)
    {
        if (score >= 90)
            return "EXCELLENT";

        if (score >= 75)
            return "GOOD";

        return "NEEDS_IMPROVEMENT";
    }


    // ============================================================
    // ATTENDANCE STATUS
    // ============================================================

    private static bool IsPresentStatus(
        string? status)
    {
        if (string.IsNullOrWhiteSpace(
            status))
        {
            return false;
        }

        var value =
            status.Trim()
                .ToUpperInvariant();

        return value == "PRESENT" ||
               value == "LATE" ||
               value == "LATE_CHECK_IN" ||
               value == "LATE_CHECKOUT" ||
               value == "LATE_CHECK_OUT" ||
               value == "LATECHECKIN" ||
               value == "LATECHECKOUT";
    }


    // ============================================================
    // HOLIDAY / WEEK OFF
    // ============================================================

    private static bool IsHolidayOrWeekOff(
        string? status)
    {
        if (string.IsNullOrWhiteSpace(
            status))
        {
            return false;
        }

        var value =
            status.Trim()
                .ToUpperInvariant()
                .Replace("-", "_")
                .Replace(" ", "_");

        return value == "HOLIDAY" ||
               value == "WEEK_OFF" ||
               value == "WEEKOFF";
    }


    // ============================================================
    // VALIDATE SCORE
    // ============================================================

    private static void ValidateScore(
        decimal value,
        string field)
    {
        if (value < 0 || value > 100)
        {
            throw new ArgumentException(
                $"{field} must be between 0 and 100.");
        }
    }


    // ============================================================
    // ROUND
    // ============================================================

    private static decimal Round(
        decimal value)
    {
        return Math.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }


    // ============================================================
    // CSV
    // ============================================================

    private static string Csv(
        object? value)
    {
        if (value == null)
            return string.Empty;

        var text =
            Convert.ToString(
                value,
                CultureInfo.InvariantCulture)
            ?? string.Empty;

        if (text.Contains(',') ||
            text.Contains('"') ||
            text.Contains('\n') ||
            text.Contains('\r'))
        {
            return "\"" +
                text.Replace(
                    "\"",
                    "\"\"") +
                "\"";
        }

        return text;
    }
}