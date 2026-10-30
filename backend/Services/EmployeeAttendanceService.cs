using TalentSphereAPI.DTOs.EmployeeAttendance;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public class EmployeeAttendanceService : IEmployeeAttendanceService
    {
        private readonly IEmployeeAttendanceRepository _repository;
        private readonly EmployeeIdentityService _employeeIdentityService;
        private readonly ITenantContext _tenantContext;
        private readonly DateTimeService _dateTimeService;
        private readonly INotificationService _notificationService;
        public EmployeeAttendanceService(
            IEmployeeAttendanceRepository repository,
            EmployeeIdentityService employeeIdentityService,
            ITenantContext tenantContext,
            DateTimeService dateTimeService,
            INotificationService notificationService)
        {
            _repository = repository;
            _employeeIdentityService = employeeIdentityService;
            _tenantContext = tenantContext;
            _dateTimeService = dateTimeService;
            _notificationService = notificationService;
        }

        // ============================================================
        // CHECK-IN
        // ============================================================

        public async Task<AttendanceResponseDto> CheckInAsync(
            CheckInDto dto)
        {
            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            var now = _dateTimeService.Now();
            var today = DateOnly.FromDateTime(now);

            var existing =
                await _repository.GetByEmployeeAndDateAsync(
                    employee.EmployeeId,
                    today,
                    employee.OrganizationId);

            if (existing != null && existing.CheckIn.HasValue)
            {
                throw new InvalidOperationException(
                    "Employee has already checked in today.");
            }

            EmployeeAttendance attendance;

            if (existing == null)
            {
                attendance = new EmployeeAttendance
                {
                    OrganizationId = employee.OrganizationId,
                    EmployeeId = employee.EmployeeId,
                    AttendanceDate = today,
                    CheckIn = now,
                    CheckOut = null,
                    WorkingHours = 0
                };

                await _repository.AddAsync(attendance);
            }
            else
            {
                existing.CheckIn = now;
                existing.CheckOut = null;
                existing.WorkingHours = 0;

                attendance =
                    await _repository.UpdateAsync(existing);
            }

            return MapToDto(attendance);
        }

        // ============================================================
        // CHECK-OUT
        // ============================================================

        public async Task<AttendanceResponseDto> CheckOutAsync(
            CheckOutDto dto)
        {
            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            var today = _dateTimeService.Today();

            var attendance =
                await _repository.GetByEmployeeAndDateAsync(
                    employee.EmployeeId,
                    today,
                    employee.OrganizationId);

            if (attendance == null)
            {
                throw new InvalidOperationException(
                    "Employee has not checked in today.");
            }

            if (!attendance.CheckIn.HasValue)
            {
                throw new InvalidOperationException(
                    "Employee has not checked in today.");
            }

            if (attendance.CheckOut.HasValue)
            {
                throw new InvalidOperationException(
                    "Employee has already checked out today.");
            }

            var checkOut = _dateTimeService.Now();

            if (checkOut < attendance.CheckIn.Value)
            {
                throw new InvalidOperationException(
                    "Check-out time cannot be before check-in time.");
            }

            attendance.CheckOut = checkOut;

            var duration =
                checkOut - attendance.CheckIn.Value;

            attendance.WorkingHours =
                Math.Round(
                    (decimal)duration.TotalHours,
                    2);

            await _repository.UpdateAsync(attendance);

            return MapToDto(attendance);
        }

        // ============================================================
        // MY ATTENDANCE HISTORY
        // ============================================================

        public async Task<IEnumerable<AttendanceResponseDto>>
            GetMyAttendanceAsync(
                DateOnly? fromDate = null,
                DateOnly? toDate = null)
        {
            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            var filter = new AttendanceFilterDto
            {
                EmployeeId = employee.EmployeeId,
                FromDate = fromDate,
                ToDate = toDate
            };

            var attendance =
                await _repository.GetAllAsync(
                    employee.OrganizationId,
                    filter);

            return attendance.Select(MapToDto);
        }

        // ============================================================
        // ORGANIZATION ATTENDANCE
        // ============================================================

        public async Task<IEnumerable<AttendanceResponseDto>> GetAllAsync(
            AttendanceFilterDto filter)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            var attendance =
                await _repository.GetAllAsync(
                    organizationId,
                    filter);

            return attendance.Select(MapToDto);
        }

        // ============================================================
        // REPORT
        // ============================================================

        public async Task<IEnumerable<EmployeeAttendanceReportDto>> GetReportAsync(
     DateOnly fromDate,
     DateOnly toDate,
     int? employeeId = null)
        {
            if (fromDate > toDate)
            {
                throw new ArgumentException(
                    "FromDate cannot be greater than ToDate.");
            }

            var organizationId =
                _tenantContext.OrganizationId;

            var data =
                await _repository.GetReportDataAsync(
                    organizationId,
                    fromDate,
                    toDate,
                    employeeId);

            return data
                .GroupBy(x => new
                {
                    x.EmployeeId,
                    EmployeeName =
                        $"{x.Employee.FirstName} {x.Employee.LastName}"
                })
                .Select(group => new EmployeeAttendanceReportDto
                {
                    EmployeeId = group.Key.EmployeeId,

                    EmployeeName = group.Key.EmployeeName,

                    TotalWorkingDays = group.Count(),

                    TotalWorkingHours =
                        Math.Round(
                            group.Sum(x => x.WorkingHours),
                            2),

                    AverageWorkingHours =
                        group.Any()
                            ? Math.Round(
                                group.Average(x => x.WorkingHours),
                                2)
                            : 0
                })
                .ToList();
        }
        // ============================================================
        // ATTENDANCE CORRECTION REQUEST
        // ============================================================

        public async Task<bool> RequestCorrectionAsync(
            AttendanceCorrectionRequestDto dto)
        {
            if (dto.EmployeeAttendanceId <= 0)
            {
                throw new ArgumentException(
                    "Invalid attendance ID.");
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new ArgumentException(
                    "Correction reason is required.");
            }

            if (dto.RequestedCheckIn.HasValue &&
                dto.RequestedCheckOut.HasValue &&
                dto.RequestedCheckOut.Value <
                dto.RequestedCheckIn.Value)
            {
                throw new ArgumentException(
                    "Requested check-out cannot be before requested check-in.");
            }

            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            var attendance =
                await _repository.GetByIdAsync(
                    dto.EmployeeAttendanceId,
                    employee.OrganizationId);

            if (attendance == null)
            {
                throw new KeyNotFoundException(
                    "Attendance record not found.");
            }

            if (attendance.EmployeeId != employee.EmployeeId)
            {
                throw new UnauthorizedAccessException(
                    "You can only request correction for your own attendance.");
            }

            var employeeName =
                $"{employee.FirstName} {employee.LastName}".Trim();

            var requestedCheckIn =
                dto.RequestedCheckIn.HasValue
                    ? dto.RequestedCheckIn.Value
                        .ToString("dd-MM-yyyy hh:mm tt")
                    : "No change";

            var requestedCheckOut =
                dto.RequestedCheckOut.HasValue
                    ? dto.RequestedCheckOut.Value
                        .ToString("dd-MM-yyyy hh:mm tt")
                    : "No change";

            var message =
                $"{employeeName} has requested an attendance correction " +
                $"for {attendance.AttendanceDate:dd-MM-yyyy}. " +
                $"Requested Check-In: {requestedCheckIn}. " +
                $"Requested Check-Out: {requestedCheckOut}. " +
                $"Reason: {dto.Reason.Trim()}";

            await _notificationService.CreateOrganizationNotificationAsync(
                employee.OrganizationId,
                "Attendance Correction Requested",
                message,
                NotificationType.AttendanceCorrectionRequested,
                attendance.EmployeeAttendanceId,
                ReferenceType.Attendance);

            return true;
        }
        // ============================================================
        // MAPPER
        // ============================================================

        private static AttendanceResponseDto MapToDto(
            EmployeeAttendance attendance)
        {
            return new AttendanceResponseDto
            {
                EmployeeAttendanceId =
                    attendance.EmployeeAttendanceId,

                EmployeeId =
                    attendance.EmployeeId,

                EmployeeName =
                    $"{attendance.Employee.FirstName} " +
                    $"{attendance.Employee.LastName}",

                AttendanceDate =
                    attendance.AttendanceDate,

                CheckIn =
                    attendance.CheckIn,

                CheckOut =
                    attendance.CheckOut,

                WorkingHours =
                    attendance.WorkingHours
            };
        }
    }
}