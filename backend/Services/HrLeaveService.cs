using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;


namespace TalentSphereAPI.Services
{
    public class HrLeaveService : IHrLeaveService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;
        private readonly DateTimeService _dateTimeService;
        public HrLeaveService(
            ApplicationDbContext context,
            ITenantContext tenantContext,
            IHttpContextAccessor httpContextAccessor,
            INotificationService notificationService,
            DateTimeService dateTimeService)
        {
            _context = context;
            _tenantContext = tenantContext;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
            _dateTimeService = dateTimeService;
        }


        private int OrganizationId =>
            _tenantContext.OrganizationId;


        // ============================================================
        // SUMMARY
        // ============================================================

        public async Task<HrLeaveSummaryDto>
            GetSummaryAsync()
        {
            var today = _dateTimeService.Today();

            var firstDayOfMonth =
                new DateOnly(
                    today.Year,
                    today.Month,
                    1);

            var nextMonth =
                firstDayOfMonth.AddMonths(1);


            var pendingRequests =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted &&
                        x.Status ==
                            LeaveRequestStatus.Pending);


            var approvedThisMonth =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted &&
                        x.Status ==
                            LeaveRequestStatus.Approved &&
                        x.AppliedOn >=
                            firstDayOfMonth.ToDateTime(
                                TimeOnly.MinValue) &&
                        x.AppliedOn <
                            nextMonth.ToDateTime(
                                TimeOnly.MinValue));


            var rejectedThisMonth =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted &&
                        x.Status ==
                            LeaveRequestStatus.Rejected &&
                        x.AppliedOn >=
                            firstDayOfMonth.ToDateTime(
                                TimeOnly.MinValue) &&
                        x.AppliedOn <
                            nextMonth.ToDateTime(
                                TimeOnly.MinValue));


            var onLeaveToday =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted &&
                        x.Status ==
                            LeaveRequestStatus.Approved &&
                        x.StartDate <= today &&
                        x.EndDate >= today)
                    .Select(x => x.EmployeeId)
                    .Distinct()
                    .CountAsync();


            return new HrLeaveSummaryDto
            {
                PendingRequests =
                    pendingRequests,

                ApprovedThisMonth =
                    approvedThisMonth,

                RejectedThisMonth =
                    rejectedThisMonth,

                OnLeaveToday =
                    onLeaveToday
            };
        }


        // ============================================================
        // LIST
        // ============================================================

        public async Task<HrLeavePagedResponse>
            GetLeavesAsync(
                HrLeaveQueryDto query)
        {
            var page =
                query.Page <= 0
                    ? 1
                    : query.Page;

            var limit =
                query.Limit <= 0
                    ? 10
                    : Math.Min(
                        query.Limit,
                        100);


            var leaves =
                from leave in
                    _context.LeaveRequests
                        .AsNoTracking()

                join employee in
                    _context.Employees
                        .AsNoTracking()
                    on leave.EmployeeId
                    equals employee.EmployeeId

                join profile in
                    _context.EmployeeProfiles
                        .AsNoTracking()
                    on employee.EmployeeId
                    equals profile.EmployeeId
                    into profileGroup

                from profile in
                    profileGroup.DefaultIfEmpty()

                join department in
                    _context.Departments
                        .AsNoTracking()
                    on profile.DepartmentId
                    equals department.DepartmentId
                    into departmentGroup

                from department in
                    departmentGroup.DefaultIfEmpty()

                where
                    leave.OrganizationId ==
                        OrganizationId &&

                    employee.OrganizationId ==
                        OrganizationId &&

                    !leave.IsDeleted &&

                    !employee.IsDeleted

                select new HrLeaveQueryRow
                {
                    Leave = leave,
                    Employee = employee,
                    Profile = profile,
                    Department = department
                };


            // ========================================================
            // SEARCH
            // ========================================================

            if (!string.IsNullOrWhiteSpace(
                    query.Search))
            {
                var search =
                    query.Search.Trim();


                leaves =
                    leaves.Where(x =>
                        x.Employee.FirstName.Contains(
                            search) ||

                        x.Employee.LastName.Contains(
                            search) ||

                        (
                            x.Employee.FirstName +
                            " " +
                            x.Employee.LastName
                        ).Contains(search) ||

                        (
                            "EMP-" +
                            x.Employee.EmployeeId
                                .ToString()
                        ).Contains(search));
            }


            // ========================================================
            // STATUS
            // ========================================================

            if (!string.IsNullOrWhiteSpace(
                    query.Status))
            {
                var status =
                    NormalizeStatus(query.Status);


                leaves =
                    leaves.Where(x =>
                        x.Leave.Status ==
                        status);
            }


            // ========================================================
            // LEAVE TYPE
            // ========================================================

            if (!string.IsNullOrWhiteSpace(
                    query.LeaveType))
            {
                var leaveType =
                    query.LeaveType.Trim()
                        .ToUpperInvariant();


                leaves =
                    leaves.Where(x =>
                        x.Leave.LeaveType ==
                        leaveType);
            }


            // ========================================================
            // DEPARTMENT
            // ========================================================

            if (query.DepartmentId.HasValue)
            {
                var departmentId =
                    query.DepartmentId.Value;


                leaves =
                    leaves.Where(x =>
                        x.Profile != null &&
                        x.Profile.DepartmentId ==
                            departmentId);
            }


            // ========================================================
            // DATE RANGE
            // ========================================================

            if (query.StartDate.HasValue)
            {
                var start =
                    query.StartDate.Value;


                leaves =
                    leaves.Where(x =>
                        x.Leave.StartDate >=
                            start);
            }


            if (query.EndDate.HasValue)
            {
                var end =
                    query.EndDate.Value;


                leaves =
                    leaves.Where(x =>
                        x.Leave.EndDate <=
                            end);
            }


            // ========================================================
            // COUNT
            // ========================================================

            var totalCount =
                await leaves.CountAsync();


            // ========================================================
            // PAGINATION
            // ========================================================

            var rows =
                await leaves
                    .OrderByDescending(
                        x => x.Leave.AppliedOn)
                    .ThenByDescending(
                        x => x.Leave.LeaveRequestId)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();


            return new HrLeavePagedResponse
            {
                Items =
                    rows.Select(ToResponse)
                        .ToList(),

                Page =
                    page,

                Limit =
                    limit,

                TotalCount =
                    totalCount,

                TotalPages =
                    totalCount == 0
                        ? 0
                        : (int)Math.Ceiling(
                            totalCount /
                            (double)limit)
            };
        }


        // ============================================================
        // DETAIL
        // ============================================================

        public async Task<HrLeaveResponseDto?>
            GetByIdAsync(
                int leaveId)
        {
            var row =
                await BuildQuery()
                    .FirstOrDefaultAsync(x =>
                        x.Leave.LeaveRequestId ==
                            leaveId);


            return row == null
                ? null
                : ToResponse(row);
        }


        // ============================================================
        // CREATE
        // ============================================================

        public async Task<HrLeaveResponseDto>
            CreateAsync(
                HrCreateLeaveDto dto)
        {
            if (string.IsNullOrWhiteSpace(
                    dto.EmployeeId))
            {
                throw new ArgumentException(
                    "EmployeeId is required.");
            }


            if (string.IsNullOrWhiteSpace(
                    dto.LeaveType))
            {
                throw new ArgumentException(
                    "LeaveType is required.");
            }


            if (dto.FromDate > dto.ToDate)
            {
                throw new ArgumentException(
                    "FromDate cannot be after ToDate.");
            }


            var employeeId =
                ParseEmployeeId(
                    dto.EmployeeId);


            if (employeeId <= 0)
            {
                throw new ArgumentException(
                    "Invalid employeeId. Expected format EMP-001.");
            }


            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId ==
                            employeeId &&
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted);


            if (employee == null)
            {
                throw new KeyNotFoundException(
                    "Employee not found.");
            }


            var leaveType =
                dto.LeaveType.Trim()
                    .ToUpperInvariant();


            ValidateLeaveType(
                leaveType);


            // ========================================================
            // OVERLAPPING PENDING / APPROVED REQUEST
            // ========================================================

            var overlaps =
                await _context.LeaveRequests
                    .AnyAsync(x =>
                        x.OrganizationId ==
                            OrganizationId &&

                        x.EmployeeId ==
                            employeeId &&

                        !x.IsDeleted &&

                        (
                            x.Status ==
                                LeaveRequestStatus.Pending ||

                            x.Status ==
                                LeaveRequestStatus.Approved
                        ) &&

                        x.StartDate <=
                            dto.ToDate &&

                        x.EndDate >=
                            dto.FromDate);


            if (overlaps)
            {
                throw new InvalidOperationException(
                    "The leave dates overlap an existing pending or approved leave request.");
            }


            var leave =
                new LeaveRequest
                {
                    OrganizationId =
                        OrganizationId,

                    EmployeeId =
                        employeeId,

                    LeaveType =
                        leaveType,

                    StartDate =
                        dto.FromDate,

                    EndDate =
                        dto.ToDate,

                    Reason =
                        string.IsNullOrWhiteSpace(
                            dto.Reason)
                            ? null
                            : dto.Reason.Trim(),

                    AppliedOn =
                        DateTime.UtcNow,

                    Status =
                        LeaveRequestStatus.Pending,

                    ApprovedBy =
                        null,

                    ApprovedOn =
                        null,

                    RejectionReason =
                        null
                };


            _context.LeaveRequests.Add(
                leave);

            await _context.SaveChangesAsync();



            await TryCreateNotificationAsync(
                leave,
                "New Leave Request",
                $"{employee.FirstName} {employee.LastName} submitted a {leave.LeaveType} leave request.",
                TalentSphereAPI.Enums.NotificationType.LeaveRequestCreated);



            return
                await GetByIdAsync(
                    leave.LeaveRequestId)
                ?? throw new InvalidOperationException(
                    "Leave request was created but could not be loaded.");
        }


        // ============================================================
        // APPROVE
        // ============================================================


        public async Task<HrLeaveResponseDto> ApproveAsync(int leaveId)
        {
            var leave = await _context.LeaveRequests
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x =>
                    x.LeaveRequestId == leaveId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            if (leave == null)
                throw new KeyNotFoundException("Leave request not found.");

            if (leave.Status != LeaveRequestStatus.Pending)
                throw new InvalidOperationException(
                    "Only pending leave requests can be approved.");

            var overlappingApproved = await _context.LeaveRequests
                .AnyAsync(x =>
                    x.LeaveRequestId != leave.LeaveRequestId &&
                    x.OrganizationId == OrganizationId &&
                    x.EmployeeId == leave.EmployeeId &&
                    !x.IsDeleted &&
                    x.Status == LeaveRequestStatus.Approved &&
                    x.StartDate <= leave.EndDate &&
                    x.EndDate >= leave.StartDate);

            if (overlappingApproved)
                throw new InvalidOperationException(
                    "This leave request overlaps an already approved leave request.");

            leave.Status = LeaveRequestStatus.Approved;
            leave.ApprovedBy = GetCurrentUserId();
            leave.ApprovedOn = DateTime.UtcNow;
            leave.RejectionReason = null;

            await _context.SaveChangesAsync();

            // Notify HR / organization.
            await TryCreateNotificationAsync(
                leave,
                "Leave Request Approved",
                $"{leave.Employee.FirstName} {leave.Employee.LastName}'s leave request has been approved.",
                NotificationType.LeaveApproved);

            // Notify the individual employee.
            await TryCreateEmployeeNotificationAsync(
                leave.EmployeeId,
                leave.LeaveRequestId,
                NotificationType.LeaveApproved,
                "Leave Request Approved",
                "Your leave request has been approved.");

            return await GetByIdAsync(leaveId)
                ?? throw new InvalidOperationException(
                    "Approved leave could not be loaded.");
        }




        // ============================================================
        // REJECT
        // ============================================================


        public async Task<HrLeaveResponseDto> RejectAsync(
            int leaveId,
            string rejectionReason)
        {
            if (string.IsNullOrWhiteSpace(rejectionReason))
                throw new ArgumentException("RejectionReason is required.");

            var leave = await _context.LeaveRequests
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x =>
                    x.LeaveRequestId == leaveId &&
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            if (leave == null)
                throw new KeyNotFoundException("Leave request not found.");

            if (leave.Status != LeaveRequestStatus.Pending)
                throw new InvalidOperationException(
                    "Only pending leave requests can be rejected.");

            leave.Status = LeaveRequestStatus.Rejected;
            leave.ApprovedBy = GetCurrentUserId();
            leave.ApprovedOn = DateTime.UtcNow;
            leave.RejectionReason = rejectionReason.Trim();

            await _context.SaveChangesAsync();

            // Notify HR / organization.
            await TryCreateNotificationAsync(
                leave,
                "Leave Request Rejected",
                $"{leave.Employee.FirstName} {leave.Employee.LastName}'s leave request has been rejected.",
                NotificationType.LeaveRejected);

            // Notify the individual employee.
            await TryCreateEmployeeNotificationAsync(
                leave.EmployeeId,
                leave.LeaveRequestId,
                NotificationType.LeaveRejected,
                "Leave Request Rejected",
                $"Your leave request has been rejected. Reason: {leave.RejectionReason}");

            return await GetByIdAsync(leaveId)
                ?? throw new InvalidOperationException(
                    "Rejected leave could not be loaded.");
        }



        // ============================================================
        // EMPLOYEE HISTORY
        // ============================================================

        public async Task<HrEmployeeLeaveHistoryResponse>
            GetEmployeeHistoryAsync(
                int employeeId)
        {
            var employeeExists =
                await _context.Employees.AnyAsync(x =>
                    x.EmployeeId ==
                        employeeId &&

                    x.OrganizationId ==
                        OrganizationId &&

                    !x.IsDeleted);


            if (!employeeExists)
            {
                throw new KeyNotFoundException(
                    "Employee not found.");
            }


            var rows =
                await BuildQuery()
                    .Where(x =>
                        x.Leave.EmployeeId ==
                            employeeId)
                    .OrderByDescending(
                        x => x.Leave.AppliedOn)
                    .ToListAsync();


            return new HrEmployeeLeaveHistoryResponse
            {
                Items =
                    rows.Select(ToResponse)
                        .ToList()
            };
        }


        // ============================================================
        // BALANCE
        // ============================================================

        public async Task<HrLeaveBalanceResponse>
            GetBalanceAsync(
                int employeeId)
        {
            var employeeExists =
                await _context.Employees.AnyAsync(x =>
                    x.EmployeeId ==
                        employeeId &&

                    x.OrganizationId ==
                        OrganizationId &&

                    !x.IsDeleted);


            if (!employeeExists)
            {
                throw new KeyNotFoundException(
                    "Employee not found.");
            }


            var year =
                DateTime.UtcNow.Year;


            var yearStart =
                new DateOnly(
                    year,
                    1,
                    1);


            var yearEnd =
                new DateOnly(
                    year,
                    12,
                    31);


            var approvedLeaves =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId ==
                            OrganizationId &&

                        x.EmployeeId ==
                            employeeId &&

                        !x.IsDeleted &&

                        x.Status ==
                            LeaveRequestStatus.Approved &&

                        x.StartDate <=
                            yearEnd &&

                        x.EndDate >=
                            yearStart)
                    .Select(x => new
                    {
                        x.LeaveType,
                        x.StartDate,
                        x.EndDate
                    })
                    .ToListAsync();


            var types =
                new[]
                {
                    "SICK",
                    "CASUAL",
                    "EARNED",
                    "UNPAID",
                    "MATERNITY",
                    "PATERNITY"
                };


            var items =
                new List<HrLeaveBalanceItemDto>();


            foreach (var type in types)
            {
                var used =
                    approvedLeaves
                        .Where(x =>
                            x.LeaveType
                                .Equals(
                                    type,
                                    StringComparison.OrdinalIgnoreCase))
                        .Sum(x =>
                            CalculateOverlapDays(
                                x.StartDate,
                                x.EndDate,
                                yearStart,
                                yearEnd));


                var allotted =
                    GetDefaultAllotment(type);


                items.Add(
                    new HrLeaveBalanceItemDto
                    {
                        LeaveType =
                            type,

                        Allotted =
                            allotted,

                        Used =
                            used,

                        Remaining =
                            Math.Max(
                                0,
                                allotted - used)
                    });
            }


            return new HrLeaveBalanceResponse
            {
                Items =
                    items
            };
        }


        // ============================================================
        // LEAVE TYPES
        // ============================================================

        public Task<HrLeaveTypesResponse>
            GetTypesAsync()
        {
            return Task.FromResult(
                new HrLeaveTypesResponse
                {
                    Items =
                        new List<string>
                        {
                            "SICK",
                            "CASUAL",
                            "EARNED",
                            "UNPAID",
                            "MATERNITY",
                            "PATERNITY"
                        }
                });
        }


        // ============================================================
        // QUERY
        // ============================================================

        private IQueryable<HrLeaveQueryRow>
            BuildQuery()
        {
            return
                from leave in
                    _context.LeaveRequests
                        .AsNoTracking()

                join employee in
                    _context.Employees
                        .AsNoTracking()
                    on leave.EmployeeId
                    equals employee.EmployeeId

                join profile in
                    _context.EmployeeProfiles
                        .AsNoTracking()
                    on employee.EmployeeId
                    equals profile.EmployeeId
                    into profileGroup

                from profile in
                    profileGroup.DefaultIfEmpty()

                join department in
                    _context.Departments
                        .AsNoTracking()
                    on profile.DepartmentId
                    equals department.DepartmentId
                    into departmentGroup

                from department in
                    departmentGroup.DefaultIfEmpty()

                where
                    leave.OrganizationId ==
                        OrganizationId &&

                    employee.OrganizationId ==
                        OrganizationId &&

                    !leave.IsDeleted &&

                    !employee.IsDeleted

                select new HrLeaveQueryRow
                {
                    Leave =
                        leave,

                    Employee =
                        employee,

                    Profile =
                        profile,

                    Department =
                        department
                };
        }


        // ============================================================
        // RESPONSE
        // ============================================================

        private static HrLeaveResponseDto
            ToResponse(
                HrLeaveQueryRow row)
        {
            return new HrLeaveResponseDto
            {
                LeaveId =
                    row.Leave.LeaveRequestId,

                EmployeeId =
                    $"EMP-{row.Employee.EmployeeId:D3}",

                EmployeeName =
                    $"{row.Employee.FirstName} {row.Employee.LastName}"
                        .Trim(),

                ProfilePhotoUrl = row.Employee.ProfilePhotoUrl,

                LeaveType =
                    row.Leave.LeaveType,

                FromDate =
                    row.Leave.StartDate,

                ToDate =
                    row.Leave.EndDate,

                Days =
                    row.Leave.EndDate.DayNumber -
                    row.Leave.StartDate.DayNumber +
                    1,

                Reason =
                    row.Leave.Reason,

                Status =
                    row.Leave.Status
                        .ToString()
                        .ToUpperInvariant(),

                AppliedOn =
                    row.Leave.AppliedOn,

                ApprovedBy =
                    row.Leave.ApprovedBy,

                ApprovedOn =
                    row.Leave.ApprovedOn,

                RejectionReason =
                    row.Leave.RejectionReason
            };
        }


        // ============================================================
        // EMPLOYEE ID
        // ============================================================

        private static int ParseEmployeeId(
            string value)
        {
            var normalized =
                value.Trim()
                    .ToUpperInvariant()
                    .Replace("EMP-", "");


            return int.TryParse(
                normalized,
                out var id)
                    ? id
                    : 0;
        }


        // ============================================================
        // STATUS
        // ============================================================

        private static LeaveRequestStatus
            NormalizeStatus(
                string value)
        {
            return value.Trim()
                .ToUpperInvariant() switch
            {
                "PENDING" =>
                    LeaveRequestStatus.Pending,

                "APPROVED" =>
                    LeaveRequestStatus.Approved,

                "REJECTED" =>
                    LeaveRequestStatus.Rejected,

                _ =>
                    throw new ArgumentException(
                        "Status must be PENDING, APPROVED or REJECTED.")
            };
        }


        // ============================================================
        // LEAVE TYPE
        // ============================================================

        private static void ValidateLeaveType(
            string leaveType)
        {
            var valid =
                new[]
                {
                    "SICK",
                    "CASUAL",
                    "EARNED",
                    "UNPAID",
                    "MATERNITY",
                    "PATERNITY"
                };


            if (!valid.Contains(
                    leaveType))
            {
                throw new ArgumentException(
                    "Invalid leave type.");
            }
        }


        // ============================================================
        // BALANCE
        // ============================================================

        private static int
            GetDefaultAllotment(
                string leaveType)
        {
            // The specification explicitly shows
            // SICK = 12 and CASUAL = 10 as an example.
            //
            // Other allotments were not defined by the
            // specification, so they currently default to 0.
            //
            // These should later be moved into HR settings/
            // organization policy.

            return leaveType switch
            {
                "SICK" =>
                    12,

                "CASUAL" =>
                    10,

                _ =>
                    0
            };
        }


        private static int
            CalculateOverlapDays(
                DateOnly start,
                DateOnly end,
                DateOnly rangeStart,
                DateOnly rangeEnd)
        {
            var effectiveStart =
                start > rangeStart
                    ? start
                    : rangeStart;

            var effectiveEnd =
                end < rangeEnd
                    ? end
                    : rangeEnd;


            if (effectiveStart >
                effectiveEnd)
            {
                return 0;
            }


            return
                effectiveEnd.DayNumber -
                effectiveStart.DayNumber +
                1;
        }


        // ============================================================
        // CURRENT USER
        // ============================================================

        private int GetCurrentUserId()
        {
            var value =
                _httpContextAccessor
                    .HttpContext?
                    .User
                    .FindFirst(
                        ClaimTypes.NameIdentifier)
                    ?.Value;


            if (!int.TryParse(
                    value,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "UserId was not found in the authenticated token.");
            }


            return userId;
        }


        // ============================================================
        // NOTIFICATION
        // ============================================================


        private async Task TryCreateNotificationAsync(
            LeaveRequest leave,
            string title,
            string message,
            TalentSphereAPI.Enums.NotificationType notificationType)
        {
            try
            {
                await _notificationService.CreateOrganizationNotificationAsync(
                    leave.OrganizationId,
                    title,
                    message,
                    notificationType,
                    leave.LeaveRequestId,
                    TalentSphereAPI.Enums.ReferenceType.LeaveRequest);
            }
            catch (Exception ex)
            {
                // Log notification failure without undoing the saved leave.
                System.Diagnostics.Debug.WriteLine(
                    $"Failed to create leave notification: {ex}");
            }
        }



        private async Task TryCreateEmployeeNotificationAsync(
            int employeeId,
            int leaveRequestId,
            NotificationType notificationType,
            string title,
            string message)
        {
            try
            {
                await _notificationService.CreateEmployeeNotificationAsync(
                    employeeId,
                    notificationType,
                    ReferenceType.LeaveRequest,
                    leaveRequestId,
                    title,
                    message);
            }
            catch (Exception ex)
            {
                // Notification failures must not undo a saved leave decision.
                System.Diagnostics.Debug.WriteLine(
                    $"Failed to create leave notification for employee {employeeId}: {ex}");
            }
        }


        // ============================================================
        // QUERY ROW
        // ============================================================

        private sealed class HrLeaveQueryRow
        {
            public LeaveRequest Leave { get; set; }
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