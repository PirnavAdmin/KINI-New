using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services
{
    public interface IHrEmployeeService
    {
        Task<HrEmployeeSummaryDto> GetSummaryAsync();

        Task<HrEmployeePagedResponse> GetEmployeesAsync(
            HrEmployeeQueryDto query);

        Task<HrDepartmentDistributionResponse>
            GetDepartmentDistributionAsync();

        Task<HrTypeDistributionResponse>
            GetTypeDistributionAsync();

        Task<HrAttendanceOverviewDto>
            GetAttendanceOverviewAsync();

        Task<HrEmployeeResponseDto?>
            GetByIdAsync(int employeeId);

        Task<HrEmployeeResponseDto>
            CreateAsync(HrCreateEmployeeDto dto);

        Task<HrEmployeeResponseDto?>
            UpdateAsync(
                int employeeId,
                HrUpdateEmployeeDto dto);

        Task<bool>
            DeleteAsync(int employeeId);

        Task<HrEmployeeResponseDto?>
            ChangeStatusAsync(
                int employeeId,
                string status);

        Task<HrDepartmentDropdownResponse>
            GetDepartmentsAsync();

        Task<HrRolesDropdownResponse>
            GetRolesAsync();
    }
}