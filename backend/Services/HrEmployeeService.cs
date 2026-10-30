using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Models.EmployeeProfile;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class HrEmployeeService : IHrEmployeeService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IEmployeeService _employeeService;
        private readonly INotificationService _notificationService;


        public HrEmployeeService(
            ApplicationDbContext context,
            ITenantContext tenantContext,
            IEmployeeService employeeService,
            INotificationService notificationService)
        {
            _context = context;
            _tenantContext = tenantContext;
            _employeeService = employeeService;
            _notificationService = notificationService;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;


        // ============================================================
        // SUMMARY
        // ============================================================

        public async Task<HrEmployeeSummaryDto> GetSummaryAsync()
        {
            var employees = _context.Employees
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == OrganizationId &&
                    !x.IsDeleted);

            var totalEmployees =
                await employees.CountAsync();

            var trainersMentors =
                await employees.CountAsync(x =>
                    x.Role == "Mentor" ||
                    x.Role == "Trainer");

            var administrativeStaff =
                await employees.CountAsync(x =>
                    x.Role == "HR" ||
                    x.Role == "HR Executive" ||
                    x.Role == "HR Recruiter" ||
                    x.Role == "Operation Associate");

            var academicStaff =
                await employees.CountAsync(x =>
                    x.Role == "Employee" ||
                    x.Role == "Instructor" ||
                    x.Role == "Academic Coordinator");

            var today =
                DateOnly.FromDateTime(DateTime.UtcNow);

            var onLeaveToday =
                await _context.LeaveRequests
                    .AsNoTracking()
                    .CountAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.StartDate <= today &&
                        x.EndDate >= today &&
                        x.Status == LeaveRequestStatus.Approved);

            return new HrEmployeeSummaryDto
            {
                TotalEmployees = totalEmployees,
                TotalEmployeesTrend = "0%",

                TrainersMentors = trainersMentors,
                TrainersMentorsTrend = "0%",

                AdministrativeStaff = administrativeStaff,
                AdministrativeStaffTrend = "0%",

                AcademicStaff = academicStaff,
                AcademicStaffTrend = "0%",

                OnLeaveToday = onLeaveToday,
                OnLeaveTodayTrend = "0%"
            };
        }


        // ============================================================
        // EMPLOYEE LIST
        // ============================================================

        public async Task<HrEmployeePagedResponse>
            GetEmployeesAsync(HrEmployeeQueryDto query)
        {
            var page =
                query.Page <= 0
                    ? 1
                    : query.Page;

            var limit =
                query.Limit <= 0
                    ? 10
                    : Math.Min(query.Limit, 100);

            var employees =
                from employee in _context.Employees.AsNoTracking()

                join profile in _context.EmployeeProfiles
                    .AsNoTracking()
                    on employee.EmployeeId
                    equals profile.EmployeeId
                    into profileGroup

                from profile in profileGroup.DefaultIfEmpty()

                join department in _context.Departments
                    .AsNoTracking()
                    on profile.DepartmentId
                    equals department.DepartmentId
                    into departmentGroup

                from department in departmentGroup.DefaultIfEmpty()

                where employee.OrganizationId == OrganizationId
                      && !employee.IsDeleted

                select new HrEmployeeQueryRow
                {
                    Employee = employee,
                    Profile = profile,
                    Department = department
                };


            // ========================================================
            // SEARCH
            // ========================================================

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search =
                    query.Search.Trim();

                employees = employees.Where(x =>
                    x.Employee.FirstName.Contains(search) ||
                    x.Employee.LastName.Contains(search) ||
                    x.Employee.Email.Contains(search) ||
                    x.Employee.Phone.Contains(search) ||
                    (
                        "EMP-" +
                        x.Employee.EmployeeId.ToString()
                    ).Contains(search));
            }


            // ========================================================
            // DEPARTMENT
            // ========================================================

            if (query.DepartmentId.HasValue)
            {
                var departmentId =
                    query.DepartmentId.Value;

                employees = employees.Where(x =>
                    x.Profile != null &&
                    x.Profile.DepartmentId == departmentId);
            }


            // ========================================================
            // ROLE
            // ========================================================

            if (!string.IsNullOrWhiteSpace(query.Role))
            {
                var role =
                    NormalizeRoleForStorage(query.Role);

                employees = employees.Where(x =>
                    x.Employee.Role == role);
            }


            // ========================================================
            // STATUS
            // ========================================================

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                var status =
                    NormalizeStatus(query.Status);

                employees = employees.Where(x =>
                    x.Employee.Status == status);
            }


            // ========================================================
            // JOINING DATE
            // EmployeeProfile.JoiningDate is DateTime?
            // ========================================================

            if (query.StartDate.HasValue)
            {
                var startDate =
                    query.StartDate.Value.Date;

                employees = employees.Where(x =>
                    x.Profile != null &&
                    x.Profile.JoiningDate.HasValue &&
                    x.Profile.JoiningDate.Value >= startDate);
            }


            if (query.EndDate.HasValue)
            {
                var endDate =
                    query.EndDate.Value.Date.AddDays(1);

                employees = employees.Where(x =>
                    x.Profile != null &&
                    x.Profile.JoiningDate.HasValue &&
                    x.Profile.JoiningDate.Value < endDate);
            }


            // ========================================================
            // TOTAL COUNT
            // ========================================================

            var totalCount =
                await employees.CountAsync();


            // ========================================================
            // SORTING
            // IMPORTANT:
            // Strongly typed IQueryable only.
            // NO dynamic.
            // ========================================================

            var descending =
                string.Equals(
                    query.SortOrder,
                    "desc",
                    StringComparison.OrdinalIgnoreCase);


            switch (query.SortBy?.Trim().ToLowerInvariant())
            {
                case "name":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.FirstName)
                            : employees.OrderBy(
                                x => x.Employee.FirstName);

                    break;


                case "firstname":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.FirstName)
                            : employees.OrderBy(
                                x => x.Employee.FirstName);

                    break;


                case "lastname":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.LastName)
                            : employees.OrderBy(
                                x => x.Employee.LastName);

                    break;


                case "joiningdate":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Profile!.JoiningDate)
                            : employees.OrderBy(
                                x => x.Profile!.JoiningDate);

                    break;


                case "role":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.Role)
                            : employees.OrderBy(
                                x => x.Employee.Role);

                    break;


                case "email":

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.Email)
                            : employees.OrderBy(
                                x => x.Employee.Email);

                    break;


                default:

                    employees =
                        descending
                            ? employees.OrderByDescending(
                                x => x.Employee.EmployeeId)
                            : employees.OrderBy(
                                x => x.Employee.EmployeeId);

                    break;
            }


            // ========================================================
            // PAGINATION
            // ========================================================

            var rows =
                await employees
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();


            var items =
                rows.Select(ToResponse)
                    .ToList();


            return new HrEmployeePagedResponse
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
        // DEPARTMENT DISTRIBUTION
        // ============================================================

        public async Task<HrDepartmentDistributionResponse>
            GetDepartmentDistributionAsync()
        {
            var result =
                await (
                    from employee in _context.Employees.AsNoTracking()

                    join profile in _context.EmployeeProfiles
                        .AsNoTracking()
                        on employee.EmployeeId
                        equals profile.EmployeeId

                    join department in _context.Departments
                        .AsNoTracking()
                        on profile.DepartmentId
                        equals department.DepartmentId

                    where employee.OrganizationId == OrganizationId &&
                          !employee.IsDeleted

                    group employee by department.Name
                    into grouped

                    select new HrDepartmentDistributionItem
                    {
                        Department = grouped.Key,
                        Count = grouped.Count()
                    }
                )
                .OrderByDescending(x => x.Count)
                .ToListAsync();


            return new HrDepartmentDistributionResponse
            {
                Items = result
            };
        }


        // ============================================================
        // TYPE DISTRIBUTION
        // ============================================================

        public async Task<HrTypeDistributionResponse>
            GetTypeDistributionAsync()
        {
            var roles =
                await _context.Employees
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted)
                    .Select(x => x.Role)
                    .ToListAsync();


            var total =
                roles.Count;


            if (total == 0)
            {
                return new HrTypeDistributionResponse
                {
                    Total = 0,
                    Items = new List<HrTypeDistributionItem>()
                };
            }


            var trainersMentors =
                roles.Count(x =>
                    x == "Mentor" ||
                    x == "Trainer");


            var administrative =
                roles.Count(x =>
                    x == "HR" ||
                    x == "HR Executive" ||
                    x == "HR Recruiter" ||
                    x == "Operation Associate");


            var academic =
                roles.Count(x =>
                    x == "Employee" ||
                    x == "Instructor" ||
                    x == "Academic Coordinator");


            var others =
                total -
                trainersMentors -
                administrative -
                academic;


            var items =
                new List<HrTypeDistributionItem>();


            if (trainersMentors > 0)
            {
                items.Add(new HrTypeDistributionItem
                {
                    Type = "Trainers & Mentors",
                    Count = trainersMentors,
                    Percent =
                        CalculatePercentage(
                            trainersMentors,
                            total)
                });
            }


            if (academic > 0)
            {
                items.Add(new HrTypeDistributionItem
                {
                    Type = "Academic Staff",
                    Count = academic,
                    Percent =
                        CalculatePercentage(
                            academic,
                            total)
                });
            }


            if (administrative > 0)
            {
                items.Add(new HrTypeDistributionItem
                {
                    Type = "Administrative Staff",
                    Count = administrative,
                    Percent =
                        CalculatePercentage(
                            administrative,
                            total)
                });
            }


            if (others > 0)
            {
                items.Add(new HrTypeDistributionItem
                {
                    Type = "Other Staff",
                    Count = others,
                    Percent =
                        CalculatePercentage(
                            others,
                            total)
                });
            }


            return new HrTypeDistributionResponse
            {
                Total = total,
                Items = items
            };
        }


        // ============================================================
        // ATTENDANCE OVERVIEW
        // ============================================================

        public async Task<HrAttendanceOverviewDto>
            GetAttendanceOverviewAsync()
        {
            var now =
                DateTime.UtcNow;

            var monthStart =
                new DateOnly(
                    now.Year,
                    now.Month,
                    1);

            var nextMonth =
                monthStart.AddMonths(1);


            var statuses =
                await _context.EmployeeAttendances
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted &&
                        x.AttendanceDate >= monthStart &&
                        x.AttendanceDate < nextMonth)
                    .Select(x => x.Status)
                    .ToListAsync();


            var present =
                statuses.Count(IsPresentStatus);


            var onLeave =
                statuses.Count(IsLeaveStatus);


            var absent =
                statuses.Count(IsAbsentStatus);


            var total =
                present +
                onLeave +
                absent;


            var average =
                total == 0
                    ? 0
                    : Math.Round(
                        present * 100m / total,
                        2);


            return new HrAttendanceOverviewDto
            {
                AvgAttendance = average,
                Present = present,
                OnLeave = onLeave,
                Absent = absent
            };
        }


        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<HrEmployeeResponseDto?>
            GetByIdAsync(int employeeId)
        {
            var row =
                await (
                    from employee in _context.Employees.AsNoTracking()

                    join profile in _context.EmployeeProfiles
                        .AsNoTracking()
                        on employee.EmployeeId
                        equals profile.EmployeeId
                        into profileGroup

                    from profile in profileGroup.DefaultIfEmpty()

                    join department in _context.Departments
                        .AsNoTracking()
                        on profile.DepartmentId
                        equals department.DepartmentId
                        into departmentGroup

                    from department in departmentGroup.DefaultIfEmpty()

                    where employee.EmployeeId == employeeId &&
                          employee.OrganizationId == OrganizationId &&
                          !employee.IsDeleted

                    select new HrEmployeeQueryRow
                    {
                        Employee = employee,
                        Profile = profile,
                        Department = department
                    }
                )
                .FirstOrDefaultAsync();


            if (row == null)
                return null;


            return ToResponse(row);
        }


        // ============================================================
        // CREATE
        // ============================================================

        // ============================================================
        // CREATE
        // ============================================================


        public async Task<HrEmployeeResponseDto>
            CreateAsync(HrCreateEmployeeDto dto)
        {
            ValidateCreate(dto);

            var role = NormalizeRoleForStorage(dto.Role);

            var employeeType =
                string.IsNullOrWhiteSpace(dto.EmploymentType)
                    ? "Full-time"
                    : dto.EmploymentType.Trim();

            var createDto = new CreateEmployeeDto
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.Trim(),
                Phone = dto.Phone?.Trim() ?? string.Empty,
                Role = role,
                Status = "Active",
                EmployeeType = employeeType
            };

            try
            {
                var created = await _employeeService.CreateAsync(createDto);

                // Notify HR after successful employee creation.
                await TryNotifyHrAsync(
                    "Employee Created",
                    $"Employee {dto.FirstName.Trim()} {dto.LastName.Trim()} was created successfully.",
                    NotificationType.EmployeeCreated,
                    created.EmployeeId);

                // Keep the existing employee response flow.
                var response = await GetByIdAsync(created.EmployeeId);

                if (response == null)
                {
                    throw new InvalidOperationException(
                        "Employee was created but could not be loaded.");
                }

                return response;
            }
            catch (Exception ex) when (
                ex.Message.Contains(
                    "already exists",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(ex.Message);
            }
        }

        // ============================================================
        // UPDATE
        // ============================================================

        public async Task<HrEmployeeResponseDto?>
            UpdateAsync(
                int employeeId,
                HrUpdateEmployeeDto dto)
        {
            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId == employeeId &&
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted);


            if (employee == null)
                return null;


            if (dto.DepartmentId.HasValue)
            {
                var departmentExists =
                    await _context.Departments.AnyAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.DepartmentId ==
                        dto.DepartmentId.Value);

                if (!departmentExists)
                {
                    throw new ArgumentException(
                        "Selected department does not belong to this organization.");
                }
            }


            var updateDto =
                new UpdateEmployeeDto
                {
                    FirstName =
                        string.IsNullOrWhiteSpace(
                            dto.FirstName)
                            ? employee.FirstName
                            : dto.FirstName.Trim(),

                    LastName =
                        string.IsNullOrWhiteSpace(
                            dto.LastName)
                            ? employee.LastName
                            : dto.LastName.Trim(),

                    Email =
                        string.IsNullOrWhiteSpace(
                            dto.Email)
                            ? employee.Email
                            : dto.Email.Trim(),

                    Phone =
                        dto.Phone ??
                        employee.Phone,

                    Role =
                        string.IsNullOrWhiteSpace(
                            dto.Role)
                            ? employee.Role
                            : NormalizeRoleForStorage(
                                dto.Role),

                    Status =
                        employee.Status,

                    EmployeeType =
                        string.IsNullOrWhiteSpace(
                            dto.EmploymentType)
                            ? employee.EmployeeType
                            : dto.EmploymentType.Trim()
                };


            await _employeeService.UpdateAsync(
                employeeId,
                updateDto);



            await UpsertProfileAsync(
                employeeId,
                dto.DepartmentId,
                dto.Designation,
                dto.JoiningDate);

            await TryNotifyHrAsync(
                "Employee Profile Updated",
                $"Employee {updateDto.FirstName} {updateDto.LastName}'s profile was updated.",
                NotificationType.EmployeeProfileUpdated,
                employeeId);

            return await GetByIdAsync(employeeId);

        }


        // ============================================================
        // DELETE
        // ============================================================

        public async Task<bool>
            DeleteAsync(int employeeId)
        {
            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId == employeeId &&
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted);


            if (employee == null)
                return false;


            // Attendance history prevents hard delete.
            var hasAttendance =
                await _context.EmployeeAttendances.AnyAsync(x =>
                    x.OrganizationId == OrganizationId &&
                    x.EmployeeId == employeeId);


            if (hasAttendance)
            {
                throw new InvalidOperationException(
                    "Employee cannot be deleted because attendance history exists. Use RESIGNED status instead.");
            }


            // Leave history prevents hard delete.
            var hasLeave =
                await _context.LeaveRequests.AnyAsync(x =>
                    x.OrganizationId == OrganizationId &&
                    x.EmployeeId == employeeId);


            if (hasLeave)
            {
                throw new InvalidOperationException(
                    "Employee cannot be deleted because leave history exists. Use RESIGNED status instead.");
            }


            // Employee skill records.
            var hasSkills =
                await _context.EmployeeSkills.AnyAsync(x =>
                    x.EmployeeId == employeeId);


            if (hasSkills)
            {
                throw new InvalidOperationException(
                    "Employee cannot be deleted because employee skill records exist. Use RESIGNED status instead.");
            }


            // Mentor relationship.
            var mentor =
                await _context.Mentors
                    .FirstOrDefaultAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.EmployeeId == employeeId &&
                        !x.IsDeleted);


            if (mentor != null)
            {
                var usedByBatch =
                    await _context.Batches.AnyAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.MentorId == mentor.MentorId);

                var usedByClass =
                    await _context.LiveClasses.AnyAsync(x =>
                        x.MentorId == mentor.MentorId);


                if (usedByBatch || usedByClass)
                {
                    throw new InvalidOperationException(
                        "Employee cannot be deleted because the employee is referenced by batches or classes.");
                }


                _context.Mentors.Remove(mentor);
            }


            // EmployeeProfile cascades to education,
            // work experience and documents according to
            // your current ApplicationDbContext configuration.

            var profile =
                await _context.EmployeeProfiles
                    .FirstOrDefaultAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.EmployeeId == employeeId);


            if (profile != null)
            {
                _context.EmployeeProfiles.Remove(profile);
            }


            // EmployeePermission is configured with cascade.
            _context.Employees.Remove(employee);


            await _context.SaveChangesAsync();


            return true;
        }


        // ============================================================
        // STATUS
        // ============================================================

        public async Task<HrEmployeeResponseDto?>
            ChangeStatusAsync(
                int employeeId,
                string status)
        {
            var normalized =
                NormalizeStatus(status);


            if (normalized != "ACTIVE" &&
                normalized != "ON_LEAVE" &&
                normalized != "RESIGNED")
            {
                throw new ArgumentException(
                    "Status must be ACTIVE, ON_LEAVE or RESIGNED.");
            }


            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId == employeeId &&
                        x.OrganizationId == OrganizationId &&
                        !x.IsDeleted);


            if (employee == null)
                return null;



            var previousStatus = employee.Status;

            employee.Status = normalized;

            await _context.SaveChangesAsync();

            if (!string.Equals(
                    previousStatus,
                    normalized,
                    StringComparison.OrdinalIgnoreCase))
            {
                var notificationType =
                    normalized == "RESIGNED"
                        ? NotificationType.EmployeeDeactivated
                        : NotificationType.EmployeeProfileUpdated;

                await TryNotifyHrAsync(
                    "Employee Status Changed",
                    $"Employee {employee.FirstName} {employee.LastName}'s status changed from {previousStatus} to {normalized}.",
                    notificationType,
                    employeeId);
            }

            return await GetByIdAsync(employeeId);

        }


        // ============================================================
        // DEPARTMENTS
        // ============================================================

        public async Task<HrDepartmentDropdownResponse>
            GetDepartmentsAsync()
        {
            var departments =
                await _context.Departments
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId)
                    .OrderBy(x => x.Name)
                    .Select(x =>
                        new HrDepartmentDropdownItem
                        {
                            Id = x.DepartmentId,
                            Name = x.Name
                        })
                    .ToListAsync();


            return new HrDepartmentDropdownResponse
            {
                Items = departments
            };
        }


        // ============================================================
        // ROLES
        // ============================================================

        public Task<HrRolesDropdownResponse>
            GetRolesAsync()
        {
            return Task.FromResult(
                new HrRolesDropdownResponse
                {
                    Items = new List<string>
                    {
                        "Trainer",
                        "Mentor",
                        "Instructor",
                        "HR Executive",
                        "Content Staff",
                        "Academic Coordinator"
                    }
                });
        }


        // ============================================================
        // PROFILE
        // ============================================================

        private async Task UpsertProfileAsync(
            int employeeId,
            int? departmentId,
            string? designation,
            DateTime? joiningDate)
        {
            var profile =
                await _context.EmployeeProfiles
                    .FirstOrDefaultAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.EmployeeId == employeeId);


            if (profile == null)
            {
                profile =
                    new EmployeeProfile
                    {
                        OrganizationId =
                            OrganizationId,

                        EmployeeId =
                            employeeId,

                        EmployeeCode =
                            $"EMP-{employeeId:D3}",

                        DepartmentId =
                            departmentId,

                        Designation =
                            designation,

                        JoiningDate =
                            joiningDate,

                        CreatedDate =
                            DateTime.UtcNow,

                        UpdatedDate =
                            DateTime.UtcNow
                    };

                _context.EmployeeProfiles.Add(profile);
            }
            else
            {
                if (departmentId.HasValue)
                    profile.DepartmentId =
                        departmentId.Value;

                if (designation != null)
                    profile.Designation =
                        designation;

                if (joiningDate.HasValue)
                    profile.JoiningDate =
                        joiningDate.Value;

                profile.UpdatedDate =
                    DateTime.UtcNow;
            }


            await _context.SaveChangesAsync();
        }


        // ============================================================
        // RESPONSE
        // ============================================================

        private static HrEmployeeResponseDto
            ToResponse(
                HrEmployeeQueryRow row)
        {
            return new HrEmployeeResponseDto
            {
                Id =
                    $"EMP-{row.Employee.EmployeeId:D3}",

                EmployeeProfileId = row.Employee.EmployeeId,

                Name =
                    $"{row.Employee.FirstName} {row.Employee.LastName}"
                        .Trim(),

                Role =
                    MapRoleForResponse(
                        row.Employee.Role),

                DepartmentId =
                    row.Profile?.DepartmentId,

                Department =
                    row.Department?.Name,

                Email =
                    row.Employee.Email,

                Phone =
                    row.Employee.Phone,

                Status =
                    NormalizeStatus(
                        row.Employee.Status),

                JoiningDate =
                    row.Profile?.JoiningDate
            };
        }


        // ============================================================
        // ROLE MAPPING
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

                "instructor" =>
                    "Employee",

                "hr executive" =>
                    "HRExecutive",

                "hr recruiter" =>
                    "HRRecruiter",

                "hr" =>
                    "HR",

                "content staff" =>
                    "Employee",

                "academic coordinator" =>
                    "Employee",

                "operation associate" =>
                    "OperationAssociate",

                "employee" =>
                    "Employee",

                _ =>
                    role.Trim()
            };
        }


        private static string
            MapRoleForResponse(
                string role)
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
        // STATUS
        // ============================================================

        private static string
            NormalizeStatus(
                string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return "ACTIVE";


            return status.Trim()
                .Replace(" ", "_")
                .ToUpperInvariant();
        }


        // ============================================================
        // VALIDATION
        // ============================================================

        private static void ValidateCreate(
            HrCreateEmployeeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName))
                throw new ArgumentException(
                    "First name is required.");

            if (string.IsNullOrWhiteSpace(dto.LastName))
                throw new ArgumentException(
                    "Last name is required.");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException(
                    "Email is required.");

            if (string.IsNullOrWhiteSpace(dto.Role))
                throw new ArgumentException(
                    "Role is required.");
        }


        // ============================================================
        // ATTENDANCE STATUS HELPERS
        // ============================================================

        private static bool IsPresentStatus(
            string status)
        {
            return
                status.Equals(
                    "Present",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "PRESENT",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "Late",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "LATE",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "LateCheckIn",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "LateCheckout",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "LATE_CHECK_IN",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "LATE_CHECKOUT",
                    StringComparison.OrdinalIgnoreCase);
        }


        private static bool IsLeaveStatus(
            string status)
        {
            return
                status.Equals(
                    "OnLeave",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "ON_LEAVE",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "On Leave",
                    StringComparison.OrdinalIgnoreCase);
        }


        private static bool IsAbsentStatus(
            string status)
        {
            return
                status.Equals(
                    "Absent",
                    StringComparison.OrdinalIgnoreCase) ||

                status.Equals(
                    "ABSENT",
                    StringComparison.OrdinalIgnoreCase);
        }


        private static decimal CalculatePercentage(
            int value,
            int total)
        {
            if (total <= 0)
                return 0;

            return Math.Round(
                value * 100m / total,
                1);
        }


        // ============================================================
        // STRONGLY TYPED QUERY ROW
        // ============================================================

        private sealed class HrEmployeeQueryRow
        {
            public Employee Employee { get; set; } = null!;

            public EmployeeProfile? Profile { get; set; }

            public Department? Department { get; set; }
        }


        private async Task TryNotifyHrAsync(
            string title,
            string message,
            NotificationType notificationType,
            int employeeId)
        {
            try
            {
                await _notificationService.CreateOrganizationNotificationAsync(
                    OrganizationId,
                    title,
                    message,
                    notificationType,
                    employeeId,
                    ReferenceType.Employee);
            }
            catch (Exception ex)
            {
                // Employee operation has already succeeded.
                // Log this failure using ILogger in production.
                System.Diagnostics.Debug.WriteLine(
                    $"HR notification failed for employee {employeeId}: {ex}");
            }
        }

    }
}