using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services
{
    public interface IHrAttendanceService
    {
        Task<HrAttendanceSummaryDto>
            GetSummaryAsync();

        Task<HrAttendanceOverviewDto>
            GetOverviewAsync(
                HrAttendanceOverviewQueryDto query);

        Task<HrAttendanceDistributionDto>
            GetDistributionAsync(
                DateOnly? date);

        Task<HrAttendancePagedResponse>
            GetAttendanceAsync(
                HrAttendanceFilterDto filter);

        Task<HrAttendanceRecordDto?>
            GetByIdAsync(
                int attendanceId);

        Task<HrAttendanceRecordDto>
            MarkAttendanceAsync(
                HrMarkAttendanceDto dto);

        Task<HrAttendanceRecordDto?>
            UpdateAttendanceAsync(
                int attendanceId,
                HrUpdateAttendanceDto dto);

        Task<HrEmployeeAttendanceHistoryResponse>
            GetEmployeeHistoryAsync(
                int employeeId,
                DateOnly? startDate,
                DateOnly? endDate);

        Task<byte[]>
            ExportAsync(
                HrAttendanceFilterDto filter);

        Task<HrAttendanceFiltersDto>
            GetFiltersAsync();
    }
}