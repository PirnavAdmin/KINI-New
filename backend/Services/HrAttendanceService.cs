using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public class HrAttendanceService : IHrAttendanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly DateTimeService _dateTimeService;
        public HrAttendanceService(
    ApplicationDbContext context,
    ITenantContext tenantContext,
    DateTimeService dateTimeService)
        {
            _context = context;
            _tenantContext = tenantContext;
            _dateTimeService = dateTimeService;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;


        // ============================================================
        // SUMMARY
        // ============================================================

        public async Task<HrAttendanceSummaryDto>
            GetSummaryAsync()
        {
            var today = _dateTimeService.Today();

            var totalEmployees =
                await _context.Employees
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.Status != "RESIGNED" &&
                        x.Status != "Resigned");


            var records =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.AttendanceDate == today)
                    .Select(x => x.Status)
                    .ToListAsync();


            var present =
                records.Count(IsPresentStatus);

            var late =
                records.Count(IsLateStatus);


            var onLeave =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.StartDate <= today &&
                        x.EndDate >= today &&
                        x.Status == LeaveRequestStatus.Approved);


            var absent =
                Math.Max(
                    0,
                    totalEmployees -
                    present -
                    late -
                    onLeave);


            var attendanceRate =
                totalEmployees == 0
                    ? 0
                    : Math.Round(
                        (present + late) *
                        100m /
                        totalEmployees,
                        2);


            return new HrAttendanceSummaryDto
            {
                TotalEmployees =
                    totalEmployees,

                PresentToday =
                    present,

                AbsentToday =
                    absent,

                OnLeaveToday =
                    onLeave,

                LateToday =
                    late,

                AttendanceRate =
                    attendanceRate
            };
        }


        // ============================================================
        // OVERVIEW
        // ============================================================

        public async Task<HrAttendanceOverviewDto>
            GetOverviewAsync(
                HrAttendanceOverviewQueryDto query)
        {
            DateOnly startDate;
            DateOnly endDate;


            if (string.Equals(
                    query.Range,
                    "CUSTOM",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (!query.StartDate.HasValue ||
                    !query.EndDate.HasValue)
                {
                    throw new ArgumentException(
                        "StartDate and EndDate are required for CUSTOM range.");
                }

                startDate =
                    query.StartDate.Value;

                endDate =
                    query.EndDate.Value;

                if (startDate > endDate)
                {
                    throw new ArgumentException(
                        "StartDate cannot be greater than EndDate.");
                }
            }
            else
            {
                endDate =
                    DateOnly.FromDateTime(
                        DateTime.UtcNow);

                startDate =
                    endDate.AddDays(-6);
            }


            var employees =
                await _context.Employees
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.Status != "RESIGNED" &&
                        x.Status != "Resigned")
                    .Select(x => x.EmployeeId)
                    .ToListAsync();


            var totalEmployees =
                employees.Count;


            var attendance =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.AttendanceDate >= startDate &&
                        x.AttendanceDate <= endDate)
                    .Select(x => new
                    {
                        x.AttendanceDate,
                        x.EmployeeId,
                        x.Status
                    })
                    .ToListAsync();


            var approvedLeaves =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.Status == LeaveRequestStatus.Approved &&
                        x.StartDate <= endDate &&
                        x.EndDate >= startDate)
                    .Select(x => new
                    {
                        x.EmployeeId,
                        x.StartDate,
                        x.EndDate
                    })
                    .ToListAsync();


            var series =
                new List<HrAttendanceOverviewSeriesDto>();


            for (
                var date = startDate;
                date <= endDate;
                date = date.AddDays(1))
            {
                var dayAttendance =
                    attendance
                        .Where(x =>
                            x.AttendanceDate == date)
                        .ToList();


                var present =
                    dayAttendance.Count(
                        x => IsPresentStatus(x.Status));


                var late =
                    dayAttendance.Count(
                        x => IsLateStatus(x.Status));


                var onLeave =
                    approvedLeaves.Count(x =>
                        x.StartDate <= date &&
                        x.EndDate >= date);


                var absent =
                    Math.Max(
                        0,
                        totalEmployees -
                        present -
                        late -
                        onLeave);


                series.Add(
                    new HrAttendanceOverviewSeriesDto
                    {
                        Date = date,
                        Present = present,
                        Absent = absent,
                        Late = late,
                        OnLeave = onLeave
                    });
            }


            return new HrAttendanceOverviewDto
            {
                Series = series
            };
        }


        // ============================================================
        // DISTRIBUTION
        // ============================================================

        public async Task<HrAttendanceDistributionDto>
            GetDistributionAsync(
                DateOnly? date)
        {
            var selectedDate =
                date ??
                DateOnly.FromDateTime(
                    DateTime.UtcNow);


            var totalEmployees =
                await _context.Employees
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.Status != "RESIGNED" &&
                        x.Status != "Resigned");


            var records =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.AttendanceDate ==
                        selectedDate)
                    .Select(x => x.Status)
                    .ToListAsync();


            var present =
                records.Count(IsPresentStatus);

            var late =
                records.Count(IsLateStatus);


            var onLeave =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.Status == LeaveRequestStatus.Approved &&
                        x.StartDate <= selectedDate &&
                        x.EndDate >= selectedDate);


            var absent =
                Math.Max(
                    0,
                    totalEmployees -
                    present -
                    late -
                    onLeave);


            return new HrAttendanceDistributionDto
            {
                Total = totalEmployees,
                Present = present,
                Absent = absent,
                OnLeave = onLeave,
                Late = late
            };
        }


        // ============================================================
        // PAGINATED ATTENDANCE LIST
        // ============================================================

        public async Task<HrAttendancePagedResponse>
            GetAttendanceAsync(
                HrAttendanceFilterDto filter)
        {
            var page =
                filter.Page <= 0
                    ? 1
                    : filter.Page;

            var limit =
                filter.Limit <= 0
                    ? 10
                    : Math.Min(
                        filter.Limit,
                        100);


            var query =
                BuildQuery(filter);


            var totalCount =
                await query.CountAsync();


            var rows =
                await query
                    .OrderByDescending(
                        x => x.Attendance.AttendanceDate)
                    .ThenBy(
                        x => x.Employee.FirstName)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();


            var items =
                rows.Select(ToResponse)
                    .ToList();


            return new HrAttendancePagedResponse
            {
                Items = items,

                Page = page,

                Limit = limit,

                TotalCount = totalCount,

                TotalPages =
                    totalCount == 0
                        ? 0
                        : (int)Math.Ceiling(
                            totalCount /
                            (double)limit)
            };
        }


        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<HrAttendanceRecordDto?>
            GetByIdAsync(
                int attendanceId)
        {
            var row =
                await BuildQuery(
                    new HrAttendanceFilterDto())
                .FirstOrDefaultAsync(x =>
                    x.Attendance.EmployeeAttendanceId ==
                    attendanceId);


            if (row == null)
                return null;


            return ToResponse(row);
        }


        // ============================================================
        // MARK ATTENDANCE
        // ============================================================

        public async Task<HrAttendanceRecordDto>
            MarkAttendanceAsync(
                HrMarkAttendanceDto dto)
        {
            var employeeId =
                ParseEmployeeId(dto.EmployeeId);


            if (employeeId <= 0)
            {
                throw new ArgumentException(
                    "Invalid employeeId. Expected format EMP-001.");
            }


            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId == employeeId &&
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted);


            if (employee == null)
            {
                throw new KeyNotFoundException(
                    "Employee not found.");
            }


            if (employee.Status == "RESIGNED" ||
                employee.Status == "Resigned")
            {
                throw new InvalidOperationException(
                    "Attendance cannot be marked for a resigned employee.");
            }


            var duplicate =
                await _context.EmployeeAttendances
                    .AnyAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.EmployeeId == employeeId &&
                        x.AttendanceDate == dto.Date &&
                        !x.IsDeleted);


            if (duplicate)
            {
                throw new InvalidOperationException(
                    "Attendance already exists for this employee on this date.");
            }


            var status =
                NormalizeAttendanceStatus(
                    dto.Status);


            ValidateStatus(status);


            var checkIn =
                ParseTime(
                    dto.CheckIn,
                    dto.Date);


            var checkOut =
                ParseTime(
                    dto.CheckOut,
                    dto.Date);


            ValidateTimes(
                checkIn,
                checkOut);


            var workingHours =
                CalculateWorkingHours(
                    checkIn,
                    checkOut);


            var attendance =
                new EmployeeAttendance
                {
                    OrganizationId =
                        OrganizationId,

                    EmployeeId =
                        employeeId,

                    AttendanceDate =
                        dto.Date,

                    CheckIn =
                        checkIn,

                    CheckOut =
                        checkOut,

                    WorkingHours =
                        workingHours,

                    Status =
                        status
                };


            _context.EmployeeAttendances.Add(
                attendance);

            await _context.SaveChangesAsync();


            return
                await GetByIdAsync(
                    attendance.EmployeeAttendanceId)
                ?? throw new InvalidOperationException(
                    "Attendance was created but could not be loaded.");
        }


        // ============================================================
        // UPDATE / CORRECT
        // ============================================================

        public async Task<HrAttendanceRecordDto?>
            UpdateAttendanceAsync(
                int attendanceId,
                HrUpdateAttendanceDto dto)
        {
            var attendance =
                await _context.EmployeeAttendances
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeAttendanceId ==
                        attendanceId &&
                        x.OrganizationId ==
                        OrganizationId &&
                        !x.IsDeleted);


            if (attendance == null)
                return null;


            var status =
                NormalizeAttendanceStatus(
                    dto.Status);


            ValidateStatus(status);


            var checkIn =
                ParseTime(
                    dto.CheckIn,
                    attendance.AttendanceDate);


            var checkOut =
                ParseTime(
                    dto.CheckOut,
                    attendance.AttendanceDate);


            ValidateTimes(
                checkIn,
                checkOut);


            attendance.Status =
                status;

            attendance.CheckIn =
                checkIn;

            attendance.CheckOut =
                checkOut;

            attendance.WorkingHours =
                CalculateWorkingHours(
                    checkIn,
                    checkOut);


            await _context.SaveChangesAsync();


            return
                await GetByIdAsync(
                    attendanceId);
        }


        // ============================================================
        // EMPLOYEE HISTORY
        // ============================================================

        public async Task<HrEmployeeAttendanceHistoryResponse>
            GetEmployeeHistoryAsync(
                int employeeId,
                DateOnly? startDate,
                DateOnly? endDate)
        {
            var employeeExists =
                await _context.Employees.AnyAsync(x =>
                    x.EmployeeId == employeeId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);


            if (!employeeExists)
            {
                throw new KeyNotFoundException(
                    "Employee not found.");
            }


            var query =
                new HrAttendanceFilterDto
                {
                    Page = 1,
                    Limit = 100
                };


            var attendance =
                _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        x.EmployeeId == employeeId &&
                        !x.IsDeleted);


            if (startDate.HasValue)
            {
                attendance =
                    attendance.Where(x =>
                        x.AttendanceDate >=
                        startDate.Value);
            }


            if (endDate.HasValue)
            {
                attendance =
                    attendance.Where(x =>
                        x.AttendanceDate <=
                        endDate.Value);
            }


            var rows =
                await (
                    from a in attendance

                    join employee in
                        _context.Employees.AsNoTracking()
                        on a.EmployeeId
                        equals employee.EmployeeId

                    join profile in
                        _context.EmployeeProfiles.AsNoTracking()
                        on employee.EmployeeId
                        equals profile.EmployeeId
                        into profileGroup

                    from profile in
                        profileGroup.DefaultIfEmpty()

                    join department in
                        _context.Departments.AsNoTracking()
                        on profile.DepartmentId
                        equals department.DepartmentId
                        into departmentGroup

                    from department in
                        departmentGroup.DefaultIfEmpty()

                    select new HrAttendanceQueryRow
                    {
                        Attendance = a,
                        Employee = employee,
                        Profile = profile,
                        Department = department
                    }
                )
                .OrderByDescending(
                    x => x.Attendance.AttendanceDate)
                .ToListAsync();


            return new HrEmployeeAttendanceHistoryResponse
            {
                Items =
                    rows.Select(ToResponse)
                        .ToList()
            };
        }


        // ============================================================
        // EXPORT CSV
        // ============================================================

        public async Task<byte[]>
            ExportAsync(
                HrAttendanceFilterDto filter)
        {
            var query =
                BuildQuery(filter);


            var rows =
                await query
                    .OrderByDescending(
                        x => x.Attendance.AttendanceDate)
                    .ThenBy(
                        x => x.Employee.FirstName)
                    .ToListAsync();


            var csv =
                new StringBuilder();


            csv.AppendLine(
                "AttendanceId,EmployeeId,EmployeeName,Role,Department,Date,CheckIn,CheckOut,WorkingHours,Status");


            foreach (var row in rows)
            {
                var item =
                    ToResponse(row);


                csv.AppendLine(
                    string.Join(
                        ",",
                        Csv(item.AttendanceId),
                        Csv(item.EmployeeId),
                        Csv(item.EmployeeName),
                        Csv(item.Role),
                        Csv(item.Department),
                        Csv(item.Date.ToString(
                            "yyyy-MM-dd")),
                        Csv(item.CheckIn),
                        Csv(item.CheckOut),
                        Csv(item.WorkingHours),
                        Csv(item.Status)));
            }


            return Encoding.UTF8.GetBytes(
                csv.ToString());
        }


        // ============================================================
        // FILTERS
        // ============================================================

        public async Task<HrAttendanceFiltersDto>
            GetFiltersAsync()
        {
            var departments =
                await _context.Departments
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId ==
                        OrganizationId)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Name)
                    .Distinct()
                    .ToListAsync();


            var storedRoles =
     await _context.Employees
         .AsNoTracking()
         .Where(x =>
             x.OrganizationId ==
             OrganizationId &&
             !x.IsDeleted &&
             !string.IsNullOrWhiteSpace(x.Role))
         .Select(x => x.Role)
         .Distinct()
         .OrderBy(x => x)
         .ToListAsync();

            var roles =
                storedRoles
                    .Select(MapRole)
                    .Distinct()
                    .OrderBy(x => x)
                    .ToList();

            return new HrAttendanceFiltersDto
            {
                Departments =
                    departments,

                Roles =
                    roles,

                Statuses =
                    new List<string>
                    {
                        "PRESENT",
                        "ABSENT",
                        "ON_LEAVE",
                        "LATE"
                    }
            };
        }


        // ============================================================
        // BUILD QUERY
        // ============================================================

        private IQueryable<HrAttendanceQueryRow>
            BuildQuery(
                HrAttendanceFilterDto filter)
        {
            var query =
                from attendance in
                    _context.EmployeeAttendances
                        .AsNoTracking()

                join employee in
                    _context.Employees.AsNoTracking()
                    on attendance.EmployeeId
                    equals employee.EmployeeId

                join profile in
                    _context.EmployeeProfiles.AsNoTracking()
                    on employee.EmployeeId
                    equals profile.EmployeeId
                    into profileGroup

                from profile in
                    profileGroup.DefaultIfEmpty()

                join department in
                    _context.Departments.AsNoTracking()
                    on profile.DepartmentId
                    equals department.DepartmentId
                    into departmentGroup

                from department in
                    departmentGroup.DefaultIfEmpty()

                where
                    attendance.OrganizationId ==
                        OrganizationId &&

                    !attendance.IsDeleted &&

                    employee.OrganizationId ==
                        OrganizationId &&

                    !employee.IsDeleted

                select new HrAttendanceQueryRow
                {
                    Attendance = attendance,
                    Employee = employee,
                    Profile = profile,
                    Department = department
                };


            if (!string.IsNullOrWhiteSpace(
                    filter.Search))
            {
                var search =
                    filter.Search.Trim();
                var numericEmployeeId =
    ParseEmployeeId(search);


                query =
     query.Where(x =>
         x.Employee.FirstName.Contains(search) ||

         x.Employee.LastName.Contains(search) ||

         (
             x.Employee.FirstName +
             " " +
             x.Employee.LastName
         ).Contains(search) ||

         x.Employee.Email.Contains(search) ||

         (
             numericEmployeeId > 0 &&
             x.Employee.EmployeeId ==
                 numericEmployeeId
         ));
            }


                if (filter.Date.HasValue)
            {
                var date =
                    filter.Date.Value;


                query =
                    query.Where(x =>
                        x.Attendance.AttendanceDate ==
                        date);
            }


            if (filter.DepartmentId.HasValue)
            {
                var departmentId =
                    filter.DepartmentId.Value;


                query =
                    query.Where(x =>
                        x.Profile != null &&
                        x.Profile.DepartmentId ==
                        departmentId);
            }


            if (!string.IsNullOrWhiteSpace(
                    filter.Role))
            {
                var role =
                    NormalizeRoleForStorage(
                        filter.Role);


                query =
                    query.Where(x =>
                        x.Employee.Role ==
                        role);
            }


            if (!string.IsNullOrWhiteSpace(
                    filter.Status))
            {
                var status =
                    NormalizeAttendanceStatus(
                        filter.Status);


                if (status == "PRESENT")
                {
                    query =
                        query.Where(x =>
                            x.Attendance.Status ==
                            "Present" ||
                            x.Attendance.Status ==
                            "PRESENT");
                }

                else if (status == "LATE")
                {
                    query =
                        query.Where(x =>
                            x.Attendance.Status == "Late" ||
                            x.Attendance.Status == "LATE" ||
                            x.Attendance.Status == "LateCheckIn" ||
                            x.Attendance.Status == "LateCheckout" ||
                            x.Attendance.Status == "LATE_CHECK_IN" ||
                            x.Attendance.Status == "LATE_CHECKOUT");
                }

                else if (status == "ABSENT")
                {
                    query =
                        query.Where(x =>
                            x.Attendance.Status ==
                            "Absent" ||
                            x.Attendance.Status ==
                            "ABSENT");
                }
                else if (status == "ON_LEAVE")
                {
                    query =
                        query.Where(x =>
                            x.Attendance.Status ==
                            "OnLeave" ||
                            x.Attendance.Status ==
                            "ON_LEAVE");
                }
            }


            return query;
        }


        // ============================================================
        // RESPONSE MAPPING
        // ============================================================

        private static HrAttendanceRecordDto
    ToResponse(
        HrAttendanceQueryRow row)
        {
            return new HrAttendanceRecordDto
            {
                AttendanceId =
                    row.Attendance.EmployeeAttendanceId,

                EmployeeId =
                    $"EMP-{row.Employee.EmployeeId:D3}",

                EmployeeName =
                    $"{row.Employee.FirstName} {row.Employee.LastName}"
                        .Trim(),

                ProfilePhotoUrl =
                    row.Employee.ProfilePhotoUrl,

                Role =
                    MapRole(
                        row.Employee.Role),

                DepartmentId =
                    row.Profile?.DepartmentId,

                Department =
                    row.Department?.Name,

                Date =
                    row.Attendance.AttendanceDate,

                CheckIn =
                    row.Attendance.CheckIn?
                        .ToString(
                            "hh:mm tt",
                            CultureInfo.InvariantCulture),

                CheckOut =
                    row.Attendance.CheckOut?
                        .ToString(
                            "hh:mm tt",
                            CultureInfo.InvariantCulture),

                WorkingHours =
                    FormatWorkingHours(
                        row.Attendance.WorkingHours),

                Status =
                    NormalizeAttendanceStatus(
                        row.Attendance.Status)
            };
        }

        // ============================================================
        // EMPLOYEE ID
        // ============================================================

        private static int ParseEmployeeId(
            string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;


            var normalized =
                value.Trim()
                    .ToUpperInvariant()
                    .Replace("EMP-", "");


            return int.TryParse(
                normalized,
                out var result)
                    ? result
                    : 0;
        }


        // ============================================================
        // TIME PARSER
        // ============================================================

        private static DateTime? ParseTime(
            string? value,
            DateOnly date)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;


            var formats =
                new[]
                {
                    "HH:mm",
                    "H:mm",
                    "hh:mm tt",
                    "h:mm tt",
                    "HH:mm:ss",
                    "hh:mm:ss tt"
                };


            if (!DateTime.TryParseExact(
                    value.Trim(),
                    formats,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var parsed))
            {
                throw new ArgumentException(
                    $"Invalid time '{value}'. Use HH:mm, for example 09:00.");
            }


            return new DateTime(
                date.Year,
                date.Month,
                date.Day,
                parsed.Hour,
                parsed.Minute,
                parsed.Second);
        }


        // ============================================================
        // TIME VALIDATION
        // ============================================================

        private static void ValidateTimes(
            DateTime? checkIn,
            DateTime? checkOut)
        {
            if (checkIn.HasValue &&
                checkOut.HasValue &&
                checkOut.Value < checkIn.Value)
            {
                throw new ArgumentException(
                    "Check-out time cannot be before check-in time.");
            }
        }


        // ============================================================
        // WORKING HOURS
        // ============================================================

        private static decimal
            CalculateWorkingHours(
                DateTime? checkIn,
                DateTime? checkOut)
        {
            if (!checkIn.HasValue ||
                !checkOut.HasValue)
            {
                return 0;
            }


            return Math.Round(
                (decimal)(
                    checkOut.Value -
                    checkIn.Value)
                    .TotalHours,
                2);
        }


        private static string
            FormatWorkingHours(
                decimal hours)
        {
            var totalMinutes =
                (int)Math.Round(
                    hours * 60);


            var h =
                totalMinutes / 60;

            var m =
                totalMinutes % 60;


            return $"{h}h {m}m";
        }


        // ============================================================
        // STATUS
        // ============================================================

        private static string
            NormalizeAttendanceStatus(
                string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return "PENDING";


            return status.Trim()
                .Replace(" ", "_")
                .Replace("-", "_")
                .ToUpperInvariant();
        }


        private static void ValidateStatus(
            string status)
        {
            if (status != "PRESENT" &&
                status != "ABSENT" &&
                status != "ON_LEAVE" &&
                status != "LATE")
            {
                throw new ArgumentException(
                    "Status must be PRESENT, ABSENT, ON_LEAVE or LATE.");
            }
        }


        private static bool IsPresentStatus(
            string? status)
        {
            return
                status == "Present" ||
                status == "PRESENT";
        }


        private static bool IsLateStatus(
    string? status)
        {
            return
                status == "Late" ||
                status == "LATE" ||
                status == "LateCheckIn" ||
                status == "LateCheckout" ||
                status == "LATE_CHECK_IN" ||
                status == "LATE_CHECKOUT";
        }


        // ============================================================
        // ROLE
        // ============================================================

        private static string
            NormalizeRoleForStorage(
                string role)
        {
            var value =
                role.Trim()
                    .Replace("_", " ")
                    .ToLowerInvariant();


            return value switch
            {
                "trainer" =>
                    "Mentor",

                "mentor" =>
                    "Mentor",

                "hr executive" =>
                    "HRExecutive",

                "hr recruiter" =>
                    "HRRecruiter",

                "operation associate" =>
                    "OperationAssociate",

                "instructor" =>
                    "Employee",

                "content staff" =>
                    "Employee",

                "academic coordinator" =>
                    "Employee",

                _ =>
                    role.Trim()
            };
        }


        private static string
            MapRole(string role)
        {
            return role switch
            {
                "HRExecutive" =>
                    "HR Executive",

                "HRRecruiter" =>
                    "HR Recruiter",

                "OperationAssociate" =>
                    "Operation Associate",

                _ =>
                    role
            };
        }


        // ============================================================
        // CSV ESCAPE
        // ============================================================

        private static string Csv(
            object? value)
        {
            var text =
                value?.ToString() ?? string.Empty;


            if (text.Contains(',') ||
                text.Contains('"') ||
                text.Contains('\n'))
            {
                return "\"" +
                    text.Replace(
                        "\"",
                        "\"\"") +
                    "\"";
            }


            return text;
        }


        // ============================================================
        // QUERY ROW
        // ============================================================

        private sealed class HrAttendanceQueryRow
        {
            public EmployeeAttendance Attendance { get; set; }
                = null!;

            public Employee Employee { get; set; }
                = null!;

            public Models.EmployeeProfile.EmployeeProfile? Profile
            {
                get;
                set;
            }

            public Department? Department { get; set; }
        }
    }
}