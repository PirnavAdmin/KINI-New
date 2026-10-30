using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrPerformanceService
{
    Task<HrPerformanceSummaryDto> GetSummaryAsync(string? period);

    Task<HrPerformanceTrendDto> GetTrendAsync();

    Task<HrPerformanceByRoleDto> GetByRoleAsync();

    Task<HrPerformancePagedResponse> GetPerformanceAsync(
        HrPerformanceFilterDto filter);

    Task<HrPerformanceRecordDto?> GetByIdAsync(
        int performanceId);

    Task<HrEmployeePerformanceHistoryResponse>
        GetEmployeeHistoryAsync(int employeeId);

    Task<HrPerformanceRecordDto> CreateAsync(
        HrCreatePerformanceDto dto);

    Task<HrPerformanceRecordDto?> UpdateAsync(
        int performanceId,
        HrUpdatePerformanceDto dto);

    Task<HrPerformanceFiltersDto> GetFiltersAsync();

    Task<byte[]> ExportAsync(
        HrPerformanceFilterDto filter);
}