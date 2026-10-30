using TalentSphereAPI.DTOs.EmployeeAttendance;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IEmployeeAttendanceService
    {
        Task<AttendanceResponseDto> CheckInAsync(
            CheckInDto dto);

        Task<AttendanceResponseDto> CheckOutAsync(
            CheckOutDto dto);

        Task<IEnumerable<AttendanceResponseDto>> GetAllAsync(
            AttendanceFilterDto filter);

        Task<IEnumerable<AttendanceResponseDto>> GetMyAttendanceAsync(
            DateOnly? fromDate = null,
            DateOnly? toDate = null);

        Task<IEnumerable<EmployeeAttendanceReportDto>> GetReportAsync(
            DateOnly fromDate,
            DateOnly toDate,
            int? employeeId = null);

        Task<bool> RequestCorrectionAsync(
            AttendanceCorrectionRequestDto dto);
    }
}